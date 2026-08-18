import { createHash } from 'node:crypto'
import { authenticateRequest } from './_auth.js'

/**
 * Unified AI API Gateway
 * Supports multiple providers: OpenRouter (default), Groq.
 * Provider credentials stay server-side and every request must carry a valid Supabase session token.
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
      'google/gemini-2.5-flash:free',
      'google/gemini-2.5-flash',
    ],
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768',
    ],
  },
}

const DEFAULT_PROVIDER = 'openrouter'
const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free'
const MAX_TOKENS_CAP = 4096
const ALLOWED_ORIGINS = [
  'https://proyecto-pfc-iago-duran.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
]

// Defense-in-depth limiter. Authentication prevents anonymous quota abuse;
// this in-memory limiter additionally limits one user+IP per warm instance.
// A durable global limiter still requires an external store.
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30

function isRateLimited(key) {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { start: now, count: 1 })

    if (rateLimitMap.size > 1000) {
      for (const [storedKey, storedEntry] of rateLimitMap.entries()) {
        if (now - storedEntry.start > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(storedKey)
      }
    }
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

function userFingerprint(userId) {
  return createHash('sha256').update(String(userId)).digest('hex').slice(0, 12)
}

function logGateway(event, fields = {}) {
  console.log(JSON.stringify({ scope: 'ai-gateway', event, ...fields }))
}

function isCreditError(status, errorData) {
  if (status === 402) return true
  const msg = JSON.stringify(errorData).toLowerCase()
  return msg.includes('credits') || msg.includes('balance') || msg.includes('afford') || msg.includes('insufficient')
}

function isRateLimitError(status, errorData) {
  if (status === 429 || status === 503 || status === 502) return true
  const msg = JSON.stringify(errorData).toLowerCase()
  return msg.includes('rate-limited') || msg.includes('rate limit') || msg.includes('overloaded') || msg.includes('too many requests')
}

export default async function handler(req, res) {
  const startedAt = Date.now()
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await authenticateRequest(req)
  if (!auth.ok) {
    logGateway('auth_rejected', { status: auth.status, latency_ms: Date.now() - startedAt })
    return res.status(auth.status).json({ error: auth.error })
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  const userRef = userFingerprint(auth.user.id)
  const rateLimitKey = `${auth.user.id}:${clientIp}`

  if (isRateLimited(rateLimitKey)) {
    logGateway('rate_limited', { user: userRef, latency_ms: Date.now() - startedAt })
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  try {
    const {
      provider = DEFAULT_PROVIDER,
      model = DEFAULT_MODEL,
      messages,
      system,
      max_tokens = 1000,
      temperature = 0.7,
      stream = false,
    } = req.body || {}

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' })
    }

    const safeMaxTokens = Math.min(Math.max(1, Number(max_tokens) || 1000), MAX_TOKENS_CAP)
    const safeTemperature = Math.min(Math.max(0, Number(temperature) || 0.7), 2)

    const providerConfig = PROVIDERS[provider]
    if (!providerConfig) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` })
    }

    const allowedModels = providerConfig.models
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: 'Model not allowed', allowed: allowedModels })
    }

    if (messages.length > 50) {
      return res.status(400).json({ error: 'Too many messages (max 50)' })
    }

    const totalChars = messages.reduce((sum, message) => sum + (typeof message?.content === 'string' ? message.content.length : 0), 0)
    if (totalChars > 50000) {
      return res.status(400).json({ error: 'Messages too long (max 50k chars)' })
    }

    let apiKey
    switch (provider) {
      case 'openrouter':
        apiKey = process.env.OPENROUTER_API_KEY
        break
      case 'groq':
        apiKey = process.env.GROQ_API_KEY
        break
      default:
        apiKey = null
    }

    if (!apiKey) {
      logGateway('provider_not_configured', { user: userRef, provider })
      return res.status(503).json({ error: 'Service temporarily unavailable' })
    }

    const endpoint = `${providerConfig.baseUrl}/chat/completions`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(provider === 'openrouter'
        ? {
            'HTTP-Referer': 'https://proyecto-pfc-iago-duran.vercel.app',
            'X-Title': 'Proyectos PFC',
          }
        : {}),
    }

    const body = {
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...messages,
      ],
      max_tokens: safeMaxTokens,
      temperature: safeTemperature,
    }

    let response
    let data
    let isFallback = false
    let currentModel = model

    const FREE_FALLBACKS = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'google/gemma-4-31b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
    ]

    const makeStreamRequest = async (modelName) => {
      body.model = modelName
      return fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
    }

    if (stream) {
      body.stream = true
      response = await makeStreamRequest(currentModel)

      if (!response.ok) {
        const errData = await response.clone().json().catch(() => ({}))
        if (isCreditError(response.status, errData) && !currentModel.endsWith(':free')) {
          isFallback = true
          currentModel = FREE_FALLBACKS[0]
          response = await makeStreamRequest(currentModel)
        }
      }

      if (!response.ok) {
        const errData = await response.clone().json().catch(() => ({}))
        if (isRateLimitError(response.status, errData)) {
          for (const fallbackModel of FREE_FALLBACKS) {
            if (fallbackModel === currentModel) continue
            isFallback = true
            currentModel = fallbackModel
            response = await makeStreamRequest(currentModel)
            if (response.ok) break
          }
        }
      }

      if (!response.ok) {
        logGateway('provider_error', {
          user: userRef,
          provider,
          model: currentModel,
          stream: true,
          upstream_status: response.status,
          latency_ms: Date.now() - startedAt,
        })
        res.setHeader('Content-Type', 'application/json')
        return res.status(502).json({ error: 'AI provider error. Please try again.' })
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache, no-store')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders()

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let responseChars = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const dataStr = line.slice(6).trim()
          if (dataStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(dataStr)
            const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || ''
            if (content) {
              responseChars += content.length
              res.write(`data: ${JSON.stringify({ content })}\n\n`)
            }
          } catch {
            // Ignore malformed provider lines; never forward them verbatim.
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
      logGateway('success', {
        user: userRef,
        provider,
        model: currentModel,
        fallback: isFallback,
        stream: true,
        response_chars: responseChars,
        latency_ms: Date.now() - startedAt,
      })
      return res.end()
    }

    const makeRequest = async (modelName) => {
      body.model = modelName
      const resObj = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const dataJson = await resObj.json().catch(() => ({}))
      return { resObj, dataJson }
    }

    let result = await makeRequest(currentModel)
    response = result.resObj
    data = result.dataJson

    if (!response.ok && isCreditError(response.status, data) && !currentModel.endsWith(':free')) {
      isFallback = true
      currentModel = FREE_FALLBACKS[0]
      result = await makeRequest(currentModel)
      response = result.resObj
      data = result.dataJson
    }

    if (!response.ok && isRateLimitError(response.status, data)) {
      for (const fallbackModel of FREE_FALLBACKS) {
        if (fallbackModel === currentModel) continue
        isFallback = true
        currentModel = fallbackModel
        result = await makeRequest(currentModel)
        response = result.resObj
        data = result.dataJson
        if (response.ok) break
      }
    }

    if (!response.ok) {
      logGateway('provider_error', {
        user: userRef,
        provider,
        model: currentModel,
        stream: false,
        upstream_status: response.status,
        latency_ms: Date.now() - startedAt,
      })
      return res.status(502).json({ error: 'AI provider error. Please try again.' })
    }

    let text = ''
    if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content
    } else if (typeof data.content === 'string') {
      text = data.content
    }

    logGateway('success', {
      user: userRef,
      provider,
      model: currentModel,
      fallback: isFallback,
      stream: false,
      response_chars: text.length,
      latency_ms: Date.now() - startedAt,
    })

    return res.status(200).json({
      text,
      provider,
      model: currentModel,
      fallback: isFallback,
    })
  } catch (error) {
    logGateway('internal_error', {
      user: userRef,
      error: error?.name || 'Error',
      latency_ms: Date.now() - startedAt,
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
