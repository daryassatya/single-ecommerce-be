import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Ambil nilai murni dari environment variables (fokus utama: SupabaseURL & SupabaseAPI)
const envRecord = import.meta.env as Record<string, string | undefined>;
let rawUrl = (envRecord.SupabaseURL || envRecord.VITE_SUPABASE_URL || envRecord.SUPABASE_URL || '').trim();
let rawKey = (envRecord.SupabaseAPI || envRecord.VITE_SUPABASE_ANON_KEY || envRecord.SUPABASE_ANON_KEY || envRecord.SUPABASE_KEY || '').trim();

// 2. Fallback ke localStorage jika kredensial kustom pernah disimpan pengguna
if (typeof window !== 'undefined') {
  try {
    const savedUrl = localStorage.getItem('SupabaseURL') || localStorage.getItem('VITE_SUPABASE_URL');
    const savedKey = localStorage.getItem('SupabaseAPI') || localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    if (savedUrl && savedKey) {
      rawUrl = savedUrl.trim();
      rawKey = savedKey.trim();
    }
  } catch (e) {
    console.warn('Unable to access localStorage:', e);
  }
}

export const isSupabaseConfigured: boolean = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.length > 0 &&
  rawKey.length > 0 &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('placeholder.supabase.co')
);

// Inisialisasi client: jika env belum diatur, gunakan placeholder aman agar tidak crash saat startup
const safeUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  safeUrl,
  safeKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
