import { describe, it, expect, beforeEach, vi } from 'vitest'
import { safeGetItem, safeSetItem, safeRemoveItem, safeGetJSON, safeSetJSON, safeClear } from '../utils/storage'

beforeEach(() => {
  const store = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  })
})

describe('safeGetItem', () => {
  it('returns stored value for existing key', () => {
    localStorage.setItem('test_key', 'hello')
    expect(safeGetItem('test_key')).toBe('hello')
  })

  it('returns null for missing key even with fallback (catch only)', () => {
    expect(safeGetItem('nonexistent', 'default')).toBeNull()
  })

  it('returns null fallback by default for missing key', () => {
    expect(safeGetItem('nonexistent')).toBeNull()
  })

  it('returns null if localStorage throws', () => {
    localStorage.getItem = vi.fn(() => { throw new Error('fail') })
    expect(safeGetItem('any')).toBeNull()
  })
})

describe('safeSetItem', () => {
  it('stores a value and returns true', () => {
    expect(safeSetItem('key', 'value')).toBe(true)
    expect(localStorage.getItem('key')).toBe('value')
  })

  it('overwrites existing value', () => {
    safeSetItem('key', 'first')
    safeSetItem('key', 'second')
    expect(localStorage.getItem('key')).toBe('second')
  })

  it('stores empty string', () => {
    safeSetItem('empty', '')
    expect(localStorage.getItem('empty')).toBe('')
  })

  it('returns false if localStorage.setItem throws', () => {
    localStorage.setItem = vi.fn(() => { throw new Error('fail') })
    expect(safeSetItem('any', 'val')).toBe(false)
  })
})

describe('safeRemoveItem', () => {
  it('removes existing key', () => {
    localStorage.setItem('key', 'value')
    safeRemoveItem('key')
    expect(localStorage.getItem('key')).toBeNull()
  })

  it('does not throw for missing key', () => {
    expect(() => safeRemoveItem('nonexistent')).not.toThrow()
  })

  it('does not throw if localStorage.removeItem throws', () => {
    localStorage.removeItem = vi.fn(() => { throw new Error('fail') })
    expect(() => safeRemoveItem('any')).not.toThrow()
  })
})

describe('safeGetJSON', () => {
  it('parses stored JSON value', () => {
    localStorage.setItem('obj', JSON.stringify({ a: 1, b: 'hello' }))
    expect(safeGetJSON('obj')).toEqual({ a: 1, b: 'hello' })
  })

  it('parses stored JSON array', () => {
    localStorage.setItem('arr', JSON.stringify([1, 2, 3]))
    expect(safeGetJSON('arr')).toEqual([1, 2, 3])
  })

  it('returns fallback for missing key', () => {
    expect(safeGetJSON('missing', [])).toEqual([])
  })

  it('returns fallback for invalid JSON', () => {
    localStorage.setItem('bad', 'not json')
    expect(safeGetJSON('bad', null)).toBeNull()
  })

  it('returns fallback when localStorage.getItem throws', () => {
    localStorage.getItem = vi.fn(() => { throw new Error('fail') })
    expect(safeGetJSON('any', 'fallback')).toBe('fallback')
  })
})

describe('safeSetJSON', () => {
  it('stores JSON stringified value', () => {
    safeSetJSON('obj', { a: 1, b: 'text' })
    expect(JSON.parse(localStorage.getItem('obj'))).toEqual({ a: 1, b: 'text' })
  })

  it('stores array as JSON', () => {
    safeSetJSON('arr', [1, 2, 3])
    expect(JSON.parse(localStorage.getItem('arr'))).toEqual([1, 2, 3])
  })

  it('stores primitive values', () => {
    safeSetJSON('num', 42)
    expect(safeGetJSON('num')).toBe(42)
  })

  it('returns false on error', () => {
    localStorage.setItem = vi.fn(() => { throw new Error('fail') })
    expect(safeSetJSON('any', 'val')).toBe(false)
  })
})

describe('safeClear', () => {
  it('clears all keys', () => {
    localStorage.setItem('a', '1')
    localStorage.setItem('b', '2')
    safeClear()
    expect(localStorage.getItem('a')).toBeNull()
    expect(localStorage.getItem('b')).toBeNull()
  })

  it('preserves specified keys', () => {
    localStorage.setItem('keep', 'stay')
    localStorage.setItem('remove', 'go')
    safeClear(['keep'])
    expect(localStorage.getItem('keep')).toBe('stay')
    expect(localStorage.getItem('remove')).toBeNull()
  })

  it('handles empty keepKeys array', () => {
    localStorage.setItem('a', '1')
    safeClear([])
    expect(localStorage.getItem('a')).toBeNull()
  })

  it('does not throw if localStorage.clear throws', () => {
    localStorage.clear = vi.fn(() => { throw new Error('fail') })
    expect(() => safeClear()).not.toThrow()
  })
})
