/**
 * Unified AI API Gateway
 * Supports multiple providers: OpenRouter (default), Groq, Gemini
 * Free models: google/gemini-2.0-flash-thinking-exp-01-21, anthropic/claude-3.5-haiku
 */

const PROVIDERS = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      'anthropic/claude-3.5-haiku', // FREE - fast and capable
      'deepseek/deepseek-r1:free', // FREE - deep reasoning
      'qwen/qwen-2.5-72b-instruct:free', // FREE - large model
      'google/gemini-flash-1.5-8b', // FREE
    ]
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile', // Free tier
      'mixtral-8x7b-32768', // Free tier
    ]
  }
};

// Default to OpenRouter
const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'anthropic/claude-3.5-haiku';

export default async function handler(req, res) {
  console.log('[AI API] Request received:', req.method, req.url);

  // CORS headers
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider = DEFAULT_PROVIDER, model = DEFAULT_MODEL, messages, system, max_tokens = 1000, temperature = 0.7, stream = false } = req.body;

    console.log('[AI API] Provider:', provider, 'Model:', model, 'Stream:', stream);

    // Get API key based on provider
    let apiKey;
    switch (provider) {
      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY;
        break;
      case 'groq':
        apiKey = process.env.GROQ_API_KEY;
        break;
      case 'gemini':
        apiKey = process.env.GEMINI_API_KEY;
        break;
      default:
        apiKey = process.env.OPENROUTER_API_KEY;
    }

    if (!apiKey) {
      console.log('[AI API] No API key found for provider:', provider);
      console.log('[AI API] Available env vars:', Object.keys(process.env).filter(k => k.includes('API')));
      
      // Return helpful error with setup instructions
      return res.status(500).json({
        error: 'API key not configured',
        hint: `Set ${provider.toUpperCase()}_API_KEY environment variable`,
        availableProviders: Object.keys(PROVIDERS),
        freeModels: PROVIDERS.openrouter.models
      });
    }

    const providerConfig = PROVIDERS[provider] || PROVIDERS.openrouter;
    const baseUrl = providerConfig.baseUrl;

    // Build request based on provider
    let endpoint, headers, body;

    if (provider === 'openrouter') {
      endpoint = `${baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://proyecto-pfc-iago-duran.vercel.app',
        'X-Title': 'Proyectos PFC'
      };
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...(messages || [])
        ],
        max_tokens,
        temperature
      };
    } else if (provider === 'groq') {
      endpoint = `${baseUrl}/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      body = {
        model: model,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...(messages || [])
        ],
        max_tokens,
        temperature
      };
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    console.log('[AI API] Calling:', endpoint);

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
        return res.status(response.status).json(errData);
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
      console.error('[AI API] Provider error:', data);
      return res.status(response.status).json(data);
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
      raw: data,
      provider,
      model
    });

  } catch (error) {
    console.error('[AI API] Proxy error:', error);
    return res.status(500).json({
      error: 'Failed to connect to AI provider',
      details: error.message
    });
  }
}
