/**
 * @file anthropicService.ts
 * @description Servicio cliente para interactuar con la API de inteligencia artificial de Anthropic (Claude).
 * Proporciona llamadas estándar de chat, streaming de respuestas de IA en tiempo real,
 * parseo seguro de respuestas formateadas en JSON y limitación de tasa de peticiones (rate limiting) en el cliente.
 */

import type { AIRequestBody, AIResponse } from '../types/ai';
import { logWarn, logError } from '../utils/logger';

// Configuración del limitador de tasa de peticiones (Rate Limit) en el lado del cliente
const CLIENT_RATE_LIMIT = {
  maxCalls: 20,       // Máximo de llamadas permitidas
  windowMs: 60 * 1000, // Ventana de tiempo (1 minuto)
};

// Almacén en memoria de los timestamps de las llamadas realizadas en el minuto activo
const clientRateLimitStore: { calls: number[] } = { calls: [] };

/**
 * Verifica si el cliente excede la tasa límite de peticiones antes de disparar llamadas a la API de IA.
 * 
 * @returns {object} { allowed: boolean, remaining: number }
 */
function checkClientRateLimit(): { allowed: boolean; remaining: number } {
  const now = Date.now();
  // Limpiar llamadas obsoletas fuera del rango de 1 minuto
  clientRateLimitStore.calls = clientRateLimitStore.calls.filter((t) => now - t < CLIENT_RATE_LIMIT.windowMs);

  if (clientRateLimitStore.calls.length >= CLIENT_RATE_LIMIT.maxCalls) {
    return { allowed: false, remaining: 0 };
  }

  clientRateLimitStore.calls.push(now);
  return { allowed: true, remaining: CLIENT_RATE_LIMIT.maxCalls - clientRateLimitStore.calls.length };
}

/**
 * Limpia bloques de código formateados (```json ... ```) de la respuesta de la IA
 * e intenta parsear el string limpio como un objeto JSON válido.
 * 
 * @param {string} text - Texto bruto devuelto por la IA
 * @returns {(Record<string, unknown> | null)} Objeto JSON parsed o null si falla
 */
function parseAIResponse(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logWarn('AI response parse error:', (error as Error).message);
    return null;
  }
}

/**
 * Desinfecta (sanitize) URLs devueltas por la IA para prevenir ataques XSS,
 * validando protocolos seguros o devolviendo un enlace vacío '#'.
 * 
 * @export
 * @param {string} url - URL cruda
 * @returns {string} URL desinfectada
 */
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

// Estructura interna de respuesta del endpoint local /api/ai
interface AIResponseData {
  text?: string;
  error?: string;
  hint?: string;
  provider?: string;
  model?: string;
  [key: string]: unknown;
}

/**
 * Envía una petición estándar al servicio de Inteligencia Artificial para recibir una respuesta textual.
 * 
 * @export
 * @param {AIRequestBody} body - Cuerpo de la petición (proveedor, modelo, mensajes, etc.)
 * @returns {Promise<AIResponse>} Respuesta estructurada de la IA
 */
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

/**
 * Ejecuta una petición de IA esperando recibir una respuesta en formato JSON estructurado
 * y ejecuta una validación adicional si se especifica.
 * 
 * @export
 * @param {string} text - Respuesta en texto bruto a parsear y validar
 * @param {function} [validator] - Validador opcional que evalúa la estructura del JSON
 * @returns {object} Estado indicando error, mensaje explicativo y los datos parseados
 */
export function parseAIJsonResponse(
  text: string,
  validator?: (data: Record<string, unknown>) => { valid: boolean; message?: string }
): { error: boolean; message?: string; data?: Record<string, unknown> } {
  const parsed = parseAIResponse(text);

  if (!parsed) {
    return { error: true, message: 'La IA devolvió una respuesta inválida. Intenta de nuevo.' };
  }

  if (validator) {
    const validation = validator(parsed);
    if (!validation.valid) {
      return { error: true, message: validation.message || 'Respuesta inválida. Intenta de nuevo.' };
    }
  }

  return { error: false, data: parsed };
}

/**
 * Envía una petición de IA habilitando el flujo de streaming en tiempo real (Server-Sent Events).
 * Invoca el callback de chunk conforme se leen los datos secuencialmente del stream.
 * 
 * @export
 * @param {AIRequestBody} body - Parámetros de configuración de la petición
 * @param {function} onChunk - Callback ejecutado ante la llegada de cada fragmento de texto
 * @param {function} [onDone] - Callback opcional ejecutado al finalizar por completo el stream
 */
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
            // Ignorar líneas malformadas
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

