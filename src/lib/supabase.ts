import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qbwqixbfkwdmfcungqom.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7m1y95HFH3U6WVT7yX_4iQ_kVu6-bhG';

// 1. Check from build-time Vite environment variables, with fallback to default project credentials
let rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
let rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// 2. Fallback to localStorage if custom credentials were saved
if (typeof window !== 'undefined') {
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

export const supabase: SupabaseClient = createClient(
  rawUrl.trim(),
  rawKey.trim(),
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
