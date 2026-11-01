import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi email dan password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        toast({
          title: 'Selamat Datang!',
          description: 'Login berhasil. Mengakses dashboard admin Contoh Nama Toko...',
          variant: 'success',
        });
      } else {
        setErrorMessage(res.error || 'Email atau password salah.');
        toast({
          title: 'Login Gagal',
          description: res.error || 'Periksa kembali kredensial Anda.',
          variant: 'error',
        });
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat mencoba masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@daryas.tech');
    setPassword('@demo123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-100/70 via-brand-50/40 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Logo and Brand Title */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 via-sky-500 to-indigo-600 text-white shadow-xl shadow-brand-500/25 mb-4 ring-4 ring-white">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Contoh Nama Toko
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">
            Admin Dashboard &amp; CMS &bull; <span className="text-brand-600 font-semibold">Display Showcase</span>
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-fadeIn">
                <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                  <span>Gagal Masuk</span>
                </p>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@daryas.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Credentials Box for Display Dashboard */}
            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                  🧪 Mode Display &amp; Portofolio Demo
                </p>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 px-3 rounded-lg bg-white border border-brand-200 hover:border-brand-300 hover:bg-brand-50/50 text-brand-700 font-semibold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Isi Otomatis Kredensial Demo</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; 2026 Contoh Nama Toko &bull; Sistem dibuat oleh{" "}
          <a
            href="https://daryas.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-500 hover:text-brand-600 underline underline-offset-2 transition"
          >
            daryas.tech
          </a>
        </p>
      </div>
    </div>
  );
}
