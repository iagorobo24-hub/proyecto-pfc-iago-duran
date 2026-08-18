import { createClient } from '@supabase/supabase-js'

let authClient = null

function getHeader(headers, name) {
  if (!headers) return undefined
  const target = name.toLowerCase()
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === target)
  return entry?.[1]
}

export function extractBearerToken(headers = {}) {
  const raw = getHeader(headers, 'authorization')
  if (typeof raw !== 'string') return null

  const match = raw.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

function getSupabaseAuthClient() {
  if (authClient) return authClient

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase auth environment is not configured')
  }

  authClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return authClient
}

export async function validateSupabaseToken(token) {
  const client = getSupabaseAuthClient()
  const { data, error } = await client.auth.getUser(token)

  if (error) {
    const status = Number(error.status || error.statusCode || 0)
    if (status >= 500 || /fetch|network|unavailable/i.test(error.message || '')) {
      throw error
    }
    return null
  }

  return data?.user || null
}

export async function authenticateRequest(req, validateToken = validateSupabaseToken) {
  const token = extractBearerToken(req?.headers)
  if (!token) {
    return { ok: false, status: 401, error: 'Authentication required' }
  }

  try {
    const user = await validateToken(token)
    if (!user?.id) {
      return { ok: false, status: 401, error: 'Invalid or expired session' }
    }
    return { ok: true, user }
  } catch {
    return { ok: false, status: 503, error: 'Authentication service unavailable' }
  }
}
