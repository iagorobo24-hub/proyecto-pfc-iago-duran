import { describe, it, expect } from 'vitest'
import { getFallbackModels } from '../../api/ai.js'

describe('AI gateway provider fallbacks', () => {
  it('uses OpenRouter model identifiers only for OpenRouter', () => {
    const models = getFallbackModels('openrouter')
    expect(models.length).toBeGreaterThan(0)
    expect(models.every(model => model.includes('/'))).toBe(true)
  })

  it('uses Groq-compatible model identifiers only for Groq', () => {
    expect(getFallbackModels('groq')).toEqual([
      'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768',
    ])
  })

  it('returns no fallbacks for unsupported providers', () => {
    expect(getFallbackModels('unsupported')).toEqual([])
  })
})
