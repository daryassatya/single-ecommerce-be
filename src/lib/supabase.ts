import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fokus HANYA pada environment variables SupabaseURL dan SupabaseAPI
const envRecord = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = (envRecord.SupabaseURL || '').trim();
const supabaseAnonKey = (envRecord.SupabaseAPI || '').trim();

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder.supabase.co')
);

// Inisialisasi client: jika env belum diatur, gunakan placeholder aman agar runtime tidak crash saat startup
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

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
