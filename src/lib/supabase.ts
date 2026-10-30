import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Strict validation: do not silently fail or use hardcoded fallbacks
if (!supabaseUrl || !supabaseAnonKey || typeof supabaseUrl !== 'string' || typeof supabaseAnonKey !== 'string') {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  const errorMessage = 
    `[Supabase Client Configuration Error]: Variabel environment ${missing.join(' dan ')} belum dikonfigurasi. ` +
    `Pastikan file .env telah diisi untuk local development atau telah ditambahkan pada dashboard Environment Variables di Vercel.`;

  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
