import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../supabase/supabaseClient'
import { sanitizeUrl, parseAIJsonResponse, callAnthropicAI, callAnthropicAIStream } from '../services/anthropicService'

vi.mock('../supabase/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}))

const validSession = {
  data: { session: { access_token: 'test-access-token' } },
  error: null,
}

describe('sanitizeUrl', () => {
  it('returns valid https URL unchanged', () => {
    expect(sanitizeUrl('https://www.se.com/manual.pdf')).toBe('https://www.se.com/manual.pdf')
  })

  it('returns valid http URL unchanged', () => {
    expect(sanitizeUrl('http://www.se.com/manual.pdf')).toBe('http://www.se.com/manual.pdf')
  })

  it('returns mailto: URLs unchanged', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
  })

  it('returns tel: URLs unchanged', () => {
    expect(sanitizeUrl('tel:+123456789')).toBe('tel:+123456789')
  })

  it('returns "#" for protocol-relative URLs', () => {
    expect(sanitizeUrl('//www.se.com/manual.pdf')).toBe('#')
  })

  it('returns "#" for bare URLs without protocol', () => {
    expect(sanitizeUrl('www.se.com/manual.pdf')).toBe('#')
  })

  it('returns empty string for null', () => {
    expect(sanitizeUrl(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(sanitizeUrl(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(sanitizeUrl('')).toBe('')
  })

  it('returns "#" for javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('#')
  })

  it('returns "#" for javascript: URLs with encoding', () => {
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('#')
  })

  it('returns "#" for data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#')
  })

  it('returns "#" for vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox("test")')).toBe('#')
  })

  it('returns "#" for ftp: URLs', () => {
    expect(sanitizeUrl('ftp://files.example.com/doc.pdf')).toBe('#')
  })

  it('returns whitespace-padded URLs as-is (no trimming)', () => {
    expect(sanitizeUrl('  https://www.se.com/manual.pdf  ')).toBe('  https://www.se.com/manual.pdf  ')
  })
})

describe('callAnthropicAI', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    supabase.auth.getSession.mockResolvedValue(validSession)
  })

  it('returns text from a successful API call and sends the session token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({ text: 'test response', provider: 'openrouter', model: 'claude-3.5-haiku' }),
    })

    vi.advanceTimersByTime(60001)
    const result = await callAnthropicAI({ messages: [{ role: 'user', content: 'hi' }] })

    expect(result.text).toBe('test response')
    expect(result.provider).toBe('openrouter')
    expect(result.model).toBe('claude-3.5-haiku')
    expect(fetch).toHaveBeenCalledWith('/api/ai', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-access-token',
      },
    }))
  })

  it('fails before calling the API when there is no authenticated session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    globalThis.fetch = vi.fn()

    vi.advanceTimersByTime(60001)
    await expect(callAnthropicAI({ messages: [{ role: 'user', content: 'hi' }] }))
      .rejects.toThrow('Sesión no disponible')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('throws on non-ok response with error message', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({ error: 'Model overloaded' }),
      status: 503,
    })

    vi.advanceTimersByTime(60001)
    await expect(callAnthropicAI({ messages: [] })).rejects.toThrow('Model overloaded')
  })

  it('throws on non-JSON response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: new Map(Object.entries({ 'content-type': 'text/html' })),
      text: () => Promise.resolve('Internal Server Error'),
      status: 500,
    })

    vi.advanceTimersByTime(60001)
    await expect(callAnthropicAI({ messages: [] })).rejects.toThrow('Server returned non-JSON response')
  })

  it('throws generic error when no error field in response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({}),
      status: 400,
    })

    vi.advanceTimersByTime(60001)
    await expect(callAnthropicAI({ messages: [] })).rejects.toThrow('Error 400')
  })

  it('sends correct request body with default values', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({ text: 'ok' }),
    })

    vi.advanceTimersByTime(60001)
    await callAnthropicAI({ messages: [{ role: 'user', content: 'test' }] })

    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.provider).toBe('openrouter')
    expect(callBody.model).toBe('meta-llama/llama-3.3-70b-instruct:free')
    expect(callBody.max_tokens).toBe(1000)
    expect(callBody.temperature).toBe(0.7)
    expect(callBody.stream).toBeUndefined()
  })

  it('uses custom provider and model when specified', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({ text: 'ok' }),
    })

    vi.advanceTimersByTime(60001)
    await callAnthropicAI({
      provider: 'groq',
      model: 'deepseek/deepseek-r1',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 500,
      temperature: 0.3,
    })

    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.provider).toBe('groq')
    expect(callBody.model).toBe('deepseek/deepseek-r1')
    expect(callBody.max_tokens).toBe(500)
    expect(callBody.temperature).toBe(0.3)
  })
})

describe('callAnthropicAIStream', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    supabase.auth.getSession.mockResolvedValue(validSession)
  })

  function mockSSEResponse(chunks, doneAfter = true) {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
        }
        if (doneAfter) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        }
        controller.close()
      },
    })
    return {
      ok: true,
      headers: new Map(Object.entries({ 'content-type': 'text/event-stream' })),
      body: stream,
      status: 200,
    }
  }

  it('receives chunks via streaming callback', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockSSEResponse(['Hello', ' World', '!']))

    vi.advanceTimersByTime(60001)
    const chunks = []
    await callAnthropicAIStream(
      { messages: [{ role: 'user', content: 'hi' }] },
      (chunk) => chunks.push(chunk)
    )

    expect(chunks).toEqual(['Hello', ' World', '!'])
  })

  it('calls onDone when stream completes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockSSEResponse(['done']))

    vi.advanceTimersByTime(60001)
    const onDone = vi.fn()
    await callAnthropicAIStream(
      { messages: [{ role: 'user', content: 'hi' }] },
      () => {},
      onDone
    )

    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('handles empty stream gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockSSEResponse([]))

    vi.advanceTimersByTime(60001)
    const chunks = []
    await callAnthropicAIStream(
      { messages: [{ role: 'user', content: 'empty' }] },
      (chunk) => chunks.push(chunk)
    )

    expect(chunks).toEqual([])
  })

  it('throws on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: new Map(Object.entries({ 'content-type': 'application/json' })),
      json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      status: 429,
    })

    vi.advanceTimersByTime(60001)
    await expect(
      callAnthropicAIStream({ messages: [] }, () => {})
    ).rejects.toThrow('Rate limit exceeded')
  })

  it('sends stream: true in the request body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Map(Object.entries({ 'content-type': 'text/event-stream' })),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        },
      }),
      status: 200,
    })

    vi.advanceTimersByTime(60001)
    await callAnthropicAIStream({ messages: [{ role: 'user', content: 'test' }] }, () => {})

    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.stream).toBe(true)
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer test-access-token')
  })
})

describe('parseAIJsonResponse', () => {
  it('parses valid JSON', () => {
    const text = '{"caracteristicas": ["test"], "aplicaciones": [], "normas": [], "url_manual": "", "consejo_tecnico": ""}'
    const result = parseAIJsonResponse(text)
    expect(result.error).toBe(false)
    expect(result.data.caracteristicas).toEqual(['test'])
  })

  it('parses JSON wrapped in markdown code blocks', () => {
    const text = '```json\n{"caracteristicas": ["test"], "aplicaciones": []}\n```'
    const result = parseAIJsonResponse(text)
    expect(result.error).toBe(false)
    expect(result.data.caracteristicas).toEqual(['test'])
  })

  it('returns error for text mixed with JSON (no code fence)', () => {
    const text = 'Aquí tienes la info:\n\n{"caracteristicas": ["test"]}\n\nSaludos.'
    const result = parseAIJsonResponse(text)
    expect(result.error).toBe(true)
  })

  it('returns error for completely invalid text', () => {
    const result = parseAIJsonResponse('not json at all')
    expect(result.error).toBe(true)
    expect(result.message).toBeTruthy()
  })

  it('returns error for empty string', () => {
    const result = parseAIJsonResponse('')
    expect(result.error).toBe(true)
  })

  it('returns error for null', () => {
    const result = parseAIJsonResponse(null)
    expect(result.error).toBe(true)
  })

  it('validates against schema when provided', () => {
    const text = '{"name": "test"}'
    const validator = (data) => ({
      valid: !!data.name,
      message: data.name ? '' : 'name is required'
    })
    const result = parseAIJsonResponse(text, validator)
    expect(result.error).toBe(false)
    expect(result.data.name).toBe('test')
  })

  it('returns error when validator fails', () => {
    const text = '{"name": "test"}'
    const validator = (/* _data */) => ({
      valid: false,
      message: 'missing required field: age'
    })
    const result = parseAIJsonResponse(text, validator)
    expect(result.error).toBe(true)
    expect(result.message).toContain('age')
  })
})
