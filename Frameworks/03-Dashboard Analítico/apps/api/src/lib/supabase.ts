import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!
const anonKey = process.env.SUPABASE_ANON_KEY!

if (!url || !serviceKey) throw new Error('Supabase env vars required')

// Cliente admin para operaciones de gestión
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Cliente con anon key para auth de usuarios (login/signup)
export const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})