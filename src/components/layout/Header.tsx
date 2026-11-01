
import { useAuth } from '@/context/AuthContext';
import { Menu, ShieldCheck, LogOut, UserCog } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTabTitle: string;
  onNavigateToAccount?: () => void;
}

export function Header({ onToggleSidebar, activeTabTitle, onNavigateToAccount }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3.5 sm:px-8 backdrop-blur-md">
      {/* Left: Hamburger button & Active Tab Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 active:scale-95 focus:outline-none transition-all shadow-2xs border border-slate-200/60"
          title="Buka / Tutup Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Contoh Nama Toko</span>
            <span>/</span>
            <span className="text-brand-600">Admin</span>
          </div>
          <h2 className="text-sm sm:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight truncate font-fancy">
            {activeTabTitle}
          </h2>
        </div>
      </div>

      {/* Right: Admin Profile, Account Settings, and Logout (Cleaned up from unnecessary badges) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Admin profile trigger */}
        <button
          type="button"
          onClick={onNavigateToAccount}
          className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/60 text-left group"
          title="Klik untuk membuka Pengaturan Akun"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-full bg-gradient-to-tr from-brand-600 to-sky-400 text-white font-bold text-xs ring-2 ring-brand-500/20 shadow-2xs">
            {(user?.name || 'Admin')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors">
              {user?.name || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
              <span>{user?.role || 'Super Admin'}</span>
            </p>
          </div>
        </button>

        {/* Quick Account Settings button */}
        {onNavigateToAccount && (
          <button
            type="button"
            onClick={onNavigateToAccount}
            className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors border border-transparent hover:border-brand-200"
            title="Pengaturan Akun (Email & Password)"
          >
            <UserCog className="w-4 h-4" />
          </button>
        )}

        {/* Logout button */}
        <button
          type="button"
          onClick={logout}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
          title="Keluar dari Dashboard (Logout)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
