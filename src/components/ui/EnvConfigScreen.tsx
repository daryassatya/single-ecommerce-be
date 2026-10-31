import { useState } from 'react';
import { saveManualSupabaseCredentials } from '@/lib/supabase';
import { Database, Copy, Check, Sparkles, ShieldCheck } from 'lucide-react';

const DEFAULT_SUPABASE_URL = 'https://qbwqixbfkwdmfcungqom.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7m1y95HFH3U6WVT7yX_4iQ_kVu6-bhG';

export function EnvConfigScreen() {
  const url = DEFAULT_SUPABASE_URL;
  const key = DEFAULT_SUPABASE_ANON_KEY;
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopy = (text: string, type: 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleQuickConnect = () => {
    saveManualSupabaseCredentials(url, key);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25 mb-3 ring-4 ring-amber-100">
            <Database className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Koneksi Supabase Diperlukan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Variabel environment belum terdeteksi dari proses build Vercel.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-6">
          {/* Notice box */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Mengapa Halaman Ini Muncul di Vercel?
            </p>
            Vite membaca variabel environment saat proses <em>build</em> (kompilasi). Jika repositori di-deploy ke Vercel sebelum menambahkan variabel environment di menu pengaturan Vercel, aplikasi tidak dapat menghubungi database Supabase secara otomatis.
          </div>

          {/* Quick Connect Button */}
          <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 text-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Solusi Instan: Hubungkan Sekarang (1-Klik)
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Gunakan kredensial resmi Supabase Cia Store yang telah disiapkan di bawah untuk masuk ke dashboard secara instan tanpa perlu menunggu redeploy Vercel.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickConnect}
              className="mt-3.5 w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan &amp; Masuk ke Dashboard Cia</span>
            </button>
          </div>

          {/* Step by Step for Permanent Vercel Configuration */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Atau Konfigurasi Permanen di Vercel Dashboard:
            </h3>

            {/* Variable 1 */}
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>1. VITE_SUPABASE_URL</span>
                <button
                  type="button"
                  onClick={() => handleCopy(url, 'url')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Tersalin' : 'Salin Nilai'}</span>
                </button>
              </div>
              <code className="block text-[11px] font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 truncate">
                {url}
              </code>
            </div>

            {/* Variable 2 */}
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>2. VITE_SUPABASE_ANON_KEY</span>
                <button
                  type="button"
                  onClick={() => handleCopy(key, 'key')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Tersalin' : 'Salin Nilai'}</span>
                </button>
              </div>
              <code className="block text-[11px] font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200/60 truncate">
                {key}
              </code>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 pt-1 leading-relaxed">
              <p>
                <strong>Langkah di Vercel:</strong>
              </p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Buka Vercel Dashboard &gt; Proyek <strong>syafira-store-be</strong>.</li>
                <li>Masuk ke menu <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                <li>Tambahkan kedua variabel di atas untuk environment <em>Production</em>, <em>Preview</em>, dan <em>Development</em>.</li>
                <li>Buka tab <strong>Deployments</strong>, klik tombol <strong>•••</strong> pada deployment terakhir, lalu klik <strong>Redeploy</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Cia Store CMS &copy; 2026.
        </p>
      </div>
    </div>
  );
}
