import type { AIRequestBody, AIResponse } from '../types/ai';
import { logWarn, logError } from '../utils/logger';

const CLIENT_RATE_LIMIT = {
  maxCalls: 20,
  windowMs: 60 * 1000,
};

const clientRateLimitStore: { calls: number[] } = { calls: [] };

function checkClientRateLimit(): { allowed: boolean; remaining: number } {
  const now = Date.now();
  clientRateLimitStore.calls = clientRateLimitStore.calls.filter((t) => now - t < CLIENT_RATE_LIMIT.windowMs);

  if (clientRateLimitStore.calls.length >= CLIENT_RATE_LIMIT.maxCalls) {
    return { allowed: false, remaining: 0 };
  }

  clientRateLimitStore.calls.push(now);
  return { allowed: true, remaining: CLIENT_RATE_LIMIT.maxCalls - clientRateLimitStore.calls.length };
}

function parseAIResponse(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logWarn('AI response parse error:', (error as Error).message);
    return null;
  }
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const allowed = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowed.includes(parsed.protocol) ? url : '#';
  } catch {
    return '#';
  }
}

interface AIResponseData {
  text?: string;
  error?: string;
  hint?: string;
  provider?: string;
  model?: string;
  [key: string]: unknown;
}

export async function callAnthropicAI(body: AIRequestBody): Promise<AIResponse> {
  const rateCheck = checkClientRateLimit();
  if (!rateCheck.allowed) {
    throw new Error('Demasiadas peticiones. Espera un momento.');
  }

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: body.provider || 'openrouter',
        model: body.model || 'anthropic/claude-3.5-haiku',
        messages: body.messages || [],
        system: body.system || '',
        max_tokens: body.max_tokens || 1000,
        temperature: body.temperature || 0.7
      }),
    });

    const contentType = response.headers.get('content-type');
    let data: AIResponseData;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      logError('[AI Service] Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response (${response.status})`);
    }

    if (!response.ok) {
      const errorMsg = data.error || data.hint || `Error ${response.status}`;
      throw new Error(errorMsg as string);
    }

    const text = data.text || '';

    if (!text && !data.error) {
      logWarn('AI response without text content:', data);
    }

    return { text, raw: data, provider: data.provider, model: data.model };
  } catch (error) {
    logError('[AI Service] AI Call failed:', error);
    throw error;
  }
}

export function parseAIJsonResponse(
  text: string,
  validator?: (data: Record<string, unknown>) => { valid: boolean; message?: string }
): { error: boolean; message?: string; data?: Record<string, unknown> } {
  const parsed = parseAIResponse(text);

  if (!parsed) {
    return { error: true, message: 'La IA devolvio una respuesta invalida. Intenta de nuevo.' };
  }

  if (validator) {
    const validation = validator(parsed);
    if (!validation.valid) {
      return { error: true, message: validation.message || 'Respuesta invalida. Intenta de nuevo.' };
    }
  }

  return { error: false, data: parsed };
}

export async function callAnthropicAIStream(
  body: AIRequestBody,
  onChunk: (text: string) => void,
  onDone?: () => void
): Promise<void> {
  const rateCheck = checkClientRateLimit();
  if (!rateCheck.allowed) {
    throw new Error('Demasiadas peticiones. Espera un momento.');
  }

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: body.provider || 'openrouter',
        model: body.model || 'anthropic/claude-3.5-haiku',
        messages: body.messages || [],
        system: body.system || '',
        max_tokens: body.max_tokens || 1000,
        temperature: body.temperature || 0.7,
        stream: true
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: `Error ${response.status}` }));
      throw new Error(errData.error || `Error ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.done) {
              onDone?.();
              return;
            }
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    }
    onDone?.();
  } catch (error) {
    logError('[AI Service] Stream failed:', error);
    throw error;
  }
}

export default {
  callAnthropicAI,
  callAnthropicAIStream,
  parseAIJsonResponse,
  parseAIResponse,
  sanitizeUrl
};
