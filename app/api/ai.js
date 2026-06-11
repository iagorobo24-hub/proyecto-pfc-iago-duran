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
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
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
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
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

function isCreditError(status, errorData) {
  if (status === 402) return true;
  const msg = JSON.stringify(errorData).toLowerCase();
  return msg.includes('credits') || msg.includes('balance') || msg.includes('afford') || msg.includes('insufficient');
}

function isRateLimitError(status, errorData) {
  if (status === 429 || status === 503 || status === 502) return true;
  const msg = JSON.stringify(errorData).toLowerCase();
  return msg.includes('rate-limited') || msg.includes('rate limit') || msg.includes('overloaded') || msg.includes('too many requests');
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

    let response;
    let data;
    let isFallback = false;
    let currentModel = model;

    const FREE_FALLBACKS = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free'
    ];

    const makeStreamRequest = async (modelName) => {
      body.model = modelName;
      return await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    };

    if (stream) {
      body.stream = true;
      response = await makeStreamRequest(currentModel);

      if (!response.ok) {
        const errData = await response.clone().json().catch(() => ({}));
        console.error('[AI API] Stream error:', errData);
        if (isCreditError(response.status, errData) && !currentModel.endsWith(':free')) {
          console.warn('[AI API] Credit limit hit in stream. Switching to free fallback model.');
          isFallback = true;
          currentModel = FREE_FALLBACKS[0];
          response = await makeStreamRequest(currentModel);
        }
      }

      if (!response.ok) {
        const errData = await response.clone().json().catch(() => ({}));
        if (isRateLimitError(response.status, errData)) {
          console.warn(`[AI API] Stream model ${currentModel} rate limited. Trying fallbacks...`);
          for (const fallbackModel of FREE_FALLBACKS) {
            if (fallbackModel === currentModel) continue;
            console.warn(`[AI API] Retrying stream with: ${fallbackModel}`);
            isFallback = true;
            currentModel = fallbackModel;
            response = await makeStreamRequest(currentModel);
            if (response.ok) break;
          }
        }
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[AI API] Final stream error:', errData);
        res.setHeader('Content-Type', 'application/json');
        return res.status(502).json({ error: 'AI provider error. Please try again.', details: errData });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      if (isFallback) {
        res.write(`data: ${JSON.stringify({ content: `⚠️ *[Nota: Usando modelo alternativo gratuito (${currentModel.split('/')[1].split(':')[0].toUpperCase()}) por límite de cuota o créditos en OpenRouter]*\n\n` })}\n\n`);
      }

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

    const makeRequest = async (modelName) => {
      body.model = modelName;
      const resObj = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const dataJson = await resObj.json().catch(() => ({}));
      return { resObj, dataJson };
    };

    let result = await makeRequest(currentModel);
    response = result.resObj;
    data = result.dataJson;

    if (!response.ok) {
      console.error('[AI API] Provider error:', data);
      if (isCreditError(response.status, data) && !currentModel.endsWith(':free')) {
        console.warn('[AI API] Credit limit hit. Switching to free models.');
        isFallback = true;
        currentModel = FREE_FALLBACKS[0];
        result = await makeRequest(currentModel);
        response = result.resObj;
        data = result.dataJson;
      }
    }

    if (!response.ok && isRateLimitError(response.status, data)) {
      console.warn(`[AI API] Model ${currentModel} rate limited. Trying fallbacks...`);
      for (const fallbackModel of FREE_FALLBACKS) {
        if (fallbackModel === currentModel) continue;
        console.warn(`[AI API] Retrying with: ${fallbackModel}`);
        isFallback = true;
        currentModel = fallbackModel;
        result = await makeRequest(currentModel);
        response = result.resObj;
        data = result.dataJson;
        if (response.ok) break;
      }
    }

    if (!response.ok) {
      console.error('[AI API] Final provider error:', data);
      return res.status(502).json({ error: 'AI provider error. Please try again.', details: data });
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
      model: currentModel,
      fallback: isFallback
    });

  } catch (error) {
    console.error('[AI API] Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
