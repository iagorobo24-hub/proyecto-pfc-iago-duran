import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../supabase/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { access_token: 'test-access-token' } },
        error: null,
      })),
    },
  },
}))

const mockJsonResponse = (data, ok = true) =>
  Promise.resolve({
    ok,
    headers: new Map(Object.entries({ 'content-type': 'application/json' })),
    json: () => Promise.resolve(data),
    status: ok ? 200 : 429,
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

  return Promise.resolve({
    ok: true,
    headers: new Map(Object.entries({ 'content-type': 'text/event-stream' })),
    body: stream,
    status: 200,
    json: () => Promise.resolve({}),
  })
}

describe('rate limiting', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    globalThis.fetch = vi.fn()
  })

  describe('callAnthropicAI', () => {
    it('allows up to 20 calls within 60s window', async () => {
      globalThis.fetch.mockResolvedValue(mockJsonResponse({ text: 'ok' }))
      const { callAnthropicAI } = await import('../services/anthropicService')

      for (let i = 0; i < 20; i++) {
        const result = await callAnthropicAI({ messages: [{ role: 'user', content: 'test' }] })
        expect(result.text).toBe('ok')
      }
    })

    it('rejects the 21st call with rate limit error', async () => {
      globalThis.fetch.mockResolvedValue(mockJsonResponse({ text: 'ok' }))
      const { callAnthropicAI } = await import('../services/anthropicService')

      for (let i = 0; i < 20; i++) {
        await callAnthropicAI({ messages: [{ role: 'user', content: 'fill' }] })
      }

      await expect(
        callAnthropicAI({ messages: [{ role: 'user', content: 'overflow' }] })
      ).rejects.toThrow('Demasiadas peticiones')
    })

    it('allows calls again after the 60s window passes', async () => {
      vi.advanceTimersByTime(60001)
      globalThis.fetch.mockResolvedValue(mockJsonResponse({ text: 'ok after window' }))
      const { callAnthropicAI } = await import('../services/anthropicService')

      const result = await callAnthropicAI({ messages: [{ role: 'user', content: 'late' }] })
      expect(result.text).toBe('ok after window')
    })
  })

  describe('callAnthropicAIStream', () => {
    it('rejects calls when rate limit is exceeded', async () => {
      globalThis.fetch.mockResolvedValue(mockJsonResponse({ text: 'ok' }))
      const { callAnthropicAI, callAnthropicAIStream } = await import('../services/anthropicService')

      for (let i = 0; i < 20; i++) {
        await callAnthropicAI({ messages: [{ role: 'user', content: 'fill' }] })
      }

      await expect(
        callAnthropicAIStream(
          { messages: [{ role: 'user', content: 'stream overflow' }] },
          () => {}
        )
      ).rejects.toThrow('Demasiadas peticiones')
    })

    it('allows stream calls again after the window passes', async () => {
      vi.advanceTimersByTime(60001)
      const streamResponse = mockSSEResponse(['chunk1', 'chunk2'])
      globalThis.fetch.mockResolvedValue(streamResponse)
      const { callAnthropicAIStream } = await import('../services/anthropicService')

      const chunks = []
      await callAnthropicAIStream(
        { messages: [{ role: 'user', content: 'late stream' }] },
        (chunk) => chunks.push(chunk)
      )

      expect(chunks).toEqual(['chunk1', 'chunk2'])
    })
  })
})
