import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fncmzrnmzmuhlullkrud.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey && import.meta.env.PROD) {
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY no está definida. Establece la variable de entorno.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)