export function resolveSupabaseConfig(env = {}) {
  const missing = []
  if (!env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL')
  if (!env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY')

  return {
    configured: missing.length === 0,
    missing,
  }
}

export const supabaseConfig = resolveSupabaseConfig(import.meta.env)
