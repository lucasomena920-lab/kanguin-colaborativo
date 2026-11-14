import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Se as chaves não estiverem configuradas, o app continua funcionando sem login
export const supabase = url && chave ? createClient(url, chave) : null