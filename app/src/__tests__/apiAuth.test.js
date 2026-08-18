import { describe, it, expect, vi } from 'vitest'
import { extractBearerToken, authenticateRequest } from '../../api/_auth.js'

describe('AI API authentication', () => {
  it('extracts a bearer token case-insensitively', () => {
    expect(extractBearerToken({ authorization: 'Bearer token-123' })).toBe('token-123')
    expect(extractBearerToken({ Authorization: 'bearer token-456' })).toBe('token-456')
  })

  it('rejects requests without a bearer token', async () => {
    const validateToken = vi.fn()
    const result = await authenticateRequest({ headers: {} }, validateToken)

    expect(result).toEqual({ ok: false, status: 401, error: 'Authentication required' })
    expect(validateToken).not.toHaveBeenCalled()
  })

  it('rejects invalid sessions', async () => {
    const validateToken = vi.fn().mockResolvedValue(null)
    const result = await authenticateRequest(
      { headers: { authorization: 'Bearer invalid' } },
      validateToken,
    )

    expect(result).toEqual({ ok: false, status: 401, error: 'Invalid or expired session' })
  })

  it('returns the authenticated user for a valid session', async () => {
    const user = { id: 'user-123' }
    const validateToken = vi.fn().mockResolvedValue(user)
    const result = await authenticateRequest(
      { headers: { authorization: 'Bearer valid-token' } },
      validateToken,
    )

    expect(result).toEqual({ ok: true, user })
    expect(validateToken).toHaveBeenCalledWith('valid-token')
  })

  it('fails closed when the auth backend is unavailable', async () => {
    const validateToken = vi.fn().mockRejectedValue(new Error('paused'))
    const result = await authenticateRequest(
      { headers: { authorization: 'Bearer valid-token' } },
      validateToken,
    )

    expect(result).toEqual({ ok: false, status: 503, error: 'Authentication service unavailable' })
  })
})
