import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Check from build-time Vite environment variables
let rawUrl = import.meta.env.VITE_SUPABASE_URL;
let rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Fallback to localStorage if deployed on Vercel without build-time env vars
if ((!rawUrl || !rawKey) && typeof window !== 'undefined') {
  try {
    const savedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const savedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    if (savedUrl && savedKey) {
      rawUrl = savedUrl;
      rawKey = savedKey;
    }
  } catch (e) {
    console.warn('Unable to access localStorage:', e);
  }
}

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  typeof rawUrl === 'string' &&
  typeof rawKey === 'string' &&
  rawUrl.trim().length > 0 &&
  rawKey.trim().length > 0 &&
  !rawUrl.includes('placeholder.supabase.co')
);

export const missingEnvVars: string[] = [];
if (!rawUrl) missingEnvVars.push('VITE_SUPABASE_URL');
if (!rawKey) missingEnvVars.push('VITE_SUPABASE_ANON_KEY');

let clientInstance: SupabaseClient;

if (isSupabaseConfigured) {
  clientInstance = createClient(rawUrl.trim(), rawKey.trim(), {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn(
    `[Supabase Configuration]: Variabel environment ${missingEnvVars.join(' dan ')} belum terdeteksi. ` +
    `Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY telah diatur.`
  );
  // Safe dummy client to prevent module initialization crashes
  clientInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = clientInstance;
