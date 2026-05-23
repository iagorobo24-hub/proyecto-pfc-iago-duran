import { describe, it, expect } from 'vitest'
import { sanitizeUrl, parseAIJsonResponse, formatAIResponse } from '../services/anthropicService'

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
    const validator = (data) => ({
      valid: false,
      message: 'missing required field: age'
    })
    const result = parseAIJsonResponse(text, validator)
    expect(result.error).toBe(true)
    expect(result.message).toContain('age')
  })
})

describe('formatAIResponse', () => {
  it('returns non-empty string unchanged (no markdown)', () => {
    expect(formatAIResponse('test response')).toBe('test response')
  })

  it('converts **bold** to <strong>', () => {
    expect(formatAIResponse('**bold** text')).toBe('<strong>bold</strong> text')
  })

  it('converts *italic* to <em>', () => {
    expect(formatAIResponse('*italic* text')).toBe('<em>italic</em> text')
  })

  it('converts `code` to styled span', () => {
    const result = formatAIResponse('use `code` here')
    expect(result).toContain('<code')
    expect(result).toContain('code')
  })

  it('converts newlines to <br>', () => {
    expect(formatAIResponse('line1\nline2')).toBe('line1<br>line2')
  })

  it('returns empty string for empty input', () => {
    expect(formatAIResponse('')).toBe('')
  })

  it('returns empty string for null', () => {
    expect(formatAIResponse(null)).toBe('')
  })
})
