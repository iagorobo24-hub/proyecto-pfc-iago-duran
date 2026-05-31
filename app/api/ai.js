/**
 * Unified AI API Gateway
 * Supports multiple providers: OpenRouter (default), Groq
 * Free models: anthropic/claude-3.5-haiku, deepseek/deepseek-r1:free
 */

const PROVIDERS = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-3.5-haiku',
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'google/gemini-flash-1.5-8b',
    ]
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768',
    ]
  }
};

const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'anthropic/claude-3.5-haiku';
const MAX_TOKENS_CAP = 4096;
const ALLOWED_ORIGINS = [
  'https://proyecto-pfc-iago-duran.vercel.app',
  'http://localhost:5173',
  'http://localhost:3001',
];

// Simple in-memory rate limiter (per-IP, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export default async function handler(req, res) {
  // CORS headers — validate origin
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { provider = DEFAULT_PROVIDER, model = DEFAULT_MODEL, messages, system, max_tokens = 1000, temperature = 0.7, stream = false } = req.body;

    // Validate inputs
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    const safeMaxTokens = Math.min(Math.max(1, Number(max_tokens) || 1000), MAX_TOKENS_CAP);
    const safeTemperature = Math.min(Math.max(0, Number(temperature) || 0.7), 2);

    // Validate model against allowed list
    const providerConfig = PROVIDERS[provider] || PROVIDERS.openrouter;
    const allowedModels = providerConfig.models;
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: 'Model not allowed', allowed: allowedModels });
    }

    // Limit messages array size
    if (messages.length > 50) {
      return res.status(400).json({ error: 'Too many messages (max 50)' });
    }
    const totalChars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    if (totalChars > 50000) {
      return res.status(400).json({ error: 'Messages too long (max 50k chars)' });
    }

    // Get API key based on provider
    let apiKey;
    switch (provider) {
      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY;
        break;
      case 'groq':
        apiKey = process.env.GROQ_API_KEY;
        break;
      default:
        apiKey = process.env.OPENROUTER_API_KEY;
    }

    if (!apiKey) {
      console.error(`[AI API] No API key for provider: ${provider}`);
      return res.status(500).json({
        error: 'Service temporarily unavailable'
      });
    }

    const baseUrl = providerConfig.baseUrl;

    let endpoint, headers, body;

    if (provider === 'openrouter') {
      endpoint = `${baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://proyecto-pfc-iago-duran.vercel.app',
        'X-Title': 'Proyectos PFC'
      };
    } else if (provider === 'groq') {
      endpoint = `${baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    body = {
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...(messages || [])
      ],
      max_tokens: safeMaxTokens,
      temperature: safeTemperature
    };

    if (stream) {
      body.stream = true;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[AI API] Stream error:', errData);
        res.setHeader('Content-Type', 'application/json');
        return res.status(502).json({ error: 'AI provider error. Please try again.' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const reader = response.body.getReader();
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
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
              if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI API] Provider error:', await response.json().catch(() => ({})));
      return res.status(502).json({ error: 'AI provider error. Please try again.' });
    }

    // Normalize response format
    let text = '';
    if (data.choices && data.choices[0]?.message?.content) {
      text = data.choices[0].message.content;
    } else if (data.content) {
      text = data.content;
    }

    console.log('[AI API] Response received, length:', text.length);

    return res.status(200).json({
      text,
      provider,
      model
    });

  } catch (error) {
    console.error('[AI API] Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
