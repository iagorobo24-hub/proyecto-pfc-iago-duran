import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSanitize } = vi.hoisted(() => ({
  mockSanitize: vi.fn((html) => html),
}))

vi.mock('dompurify', () => ({
  default: { sanitize: mockSanitize },
}))

import { renderMarkdown } from '../utils/markdown'

beforeEach(() => {
  mockSanitize.mockClear()
  mockSanitize.mockImplementation((html) => html)
})

describe('renderMarkdown', () => {
  it('converts basic markdown to HTML', () => {
    const html = renderMarkdown('# Hello\n\nThis is **bold**')
    expect(html).toContain('<h1')
    expect(html).toContain('Hello')
    expect(html).toContain('<strong>')
    expect(html).toContain('bold')
    expect(mockSanitize).toHaveBeenCalledOnce()
  })

  it('converts links', () => {
    const html = renderMarkdown('[click](https://example.com)')
    expect(html).toContain('<a')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('click')
  })

  it('converts code blocks', () => {
    const html = renderMarkdown('```\nconst x = 1\n```')
    expect(html).toContain('<code>')
    expect(html).toContain('const x = 1')
  })

  it('returns empty string for null', () => {
    expect(renderMarkdown(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(renderMarkdown(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(renderMarkdown('')).toBe('')
  })
})

describe('XSS prevention', () => {
  it('strips <script> tags via DOMPurify', () => {
    mockSanitize.mockImplementation((html) => html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''))
    const html = renderMarkdown('<script>alert("xss")</script>')
    expect(html).not.toContain('<script>')
  })

  it('strips inline event handlers via DOMPurify', () => {
    mockSanitize.mockImplementation((html) => html.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''))
    const html = renderMarkdown('<img onerror="alert(1)" src="x">')
    expect(html).not.toContain('onerror')
  })

  it('passes HTML through DOMPurify.sanitize for all rendering', () => {
    renderMarkdown('some text')
    expect(mockSanitize).toHaveBeenCalled()
  })

  it('always sanitizes regardless of input', () => {
    renderMarkdown('clean **text**')
    renderMarkdown('<b>bold</b>')
    expect(mockSanitize).toHaveBeenCalledTimes(2)
  })

  it('allows safe HTML tags like <b>, <i>, <em> (DOMPurify allows them)', () => {
    mockSanitize.mockImplementation((html) => html)
    const html = renderMarkdown('<b>bold</b> <i>italic</i> <em>emphasis</em>')
    expect(html).toContain('<b>')
    expect(html).toContain('bold')
    expect(html).toContain('<i>')
    expect(html).toContain('italic')
  })
})
