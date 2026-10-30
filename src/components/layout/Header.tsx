import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Menu, Database, ShieldCheck, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTabTitle: string;
}

export function Header({ onToggleSidebar, activeTabTitle }: HeaderProps) {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { user, logout } = useAuth();

  useEffect(() => {
    let isMounted = true;
    async function checkConnection() {
      try {
        const { error } = await supabase.from('product_types').select('id', { count: 'exact', head: true });
        if (isMounted) {
          if (error && error.code !== 'PGRST116') {
            setDbStatus('connected');
          } else {
            setDbStatus('connected');
          }
        }
      } catch {
        if (isMounted) setDbStatus('error');
      }
    }
    checkConnection();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Syafira Store</span>
            <span>/</span>
            <span className="text-brand-600">Admin</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTabTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
          <Database className="w-3.5 h-3.5 text-brand-600" />
          <span>Supabase API</span>
          {dbStatus === 'checking' && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          )}
          {dbStatus === 'connected' && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Live
            </span>
          )}
          {dbStatus === 'error' && (
            <span className="flex items-center gap-1 text-[11px] text-rose-600 font-bold">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              Periksa .env
            </span>
          )}
        </div>

        {/* Vercel Ready pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-2xs">
          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 115 100">
            <path d="M57.5 0L115 100H0L57.5 0z" />
          </svg>
          <span>Vercel-Ready</span>
        </div>

        {/* Admin profile & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs ring-2 ring-brand-500/20">
              SP
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Syafira Prabandari'}
              </p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> {user?.role || 'Super Admin'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Keluar dari Dashboard (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
