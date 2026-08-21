export function resolveSupabaseConfig(env = {}) {
  const missing = []
  if (!env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
  if (!env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')

  const enabled = env.VITE_SUPABASE_ENABLED !== 'false'
  const configured = missing.length === 0
  const mode = enabled && configured ? 'cloud' : 'local'

  return {
    enabled,
    configured,
    mode,
    missing,
  }
}

export function canUseCatalog(backendMode, env = import.meta.env) {
  if (backendMode === 'cloud') return true
  if (backendMode !== 'local') return false

  const config = resolveSupabaseConfig(env)
  const isDevelopmentFixture = env.DEV === true || env.MODE === 'test'

  return isDevelopmentFixture && config.enabled && !config.configured
}

export const supabaseConfig = resolveSupabaseConfig(import.meta.env)
