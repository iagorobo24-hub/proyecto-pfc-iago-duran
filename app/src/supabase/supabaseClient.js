import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fncmzrnmzmuhlullkrud.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuY216cm5tem11aGx1bGxrcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjA2OTUsImV4cCI6MjA4ODkzNjY5NX0.vlDAZQGhgvdxBLUkmlt2XHSJBvICLtRHM61rD2T4F88'

export const supabase = createClient(supabaseUrl, supabaseKey)