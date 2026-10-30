import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Package,
  MessageSquareText,
  Share2,
  Sliders,
  ExternalLink,
  Sparkles,
  LogOut,
  Heart,
  FileText,
  Store,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'products'
  | 'types'
  | 'testimonials'
  | 'hero'
  | 'terms'
  | 'social'
  | 'message'
  | 'profile'
  | 'settings'
  | 'account';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'products' as NavTab, label: 'Katalog Produk', icon: Package, badge: 'Shop' },
    { id: 'types' as NavTab, label: 'Tipe / Kategori', icon: Layers, badge: null },
    { id: 'testimonials' as NavTab, label: 'Testimoni Pembeli', icon: Heart, badge: 'Stories' },
    { id: 'hero' as NavTab, label: 'Hero Carousel', icon: Sparkles, badge: 'Slides' },
    { id: 'terms' as NavTab, label: 'Syarat & Ketentuan', icon: FileText, badge: 'T&C' },
    { id: 'social' as NavTab, label: 'Social & Quick Links', icon: Share2, badge: 'Cards' },
    { id: 'message' as NavTab, label: 'Template Pesan WA', icon: MessageSquareText, badge: 'Checkout' },
    { id: 'profile' as NavTab, label: 'Profil Toko & Ticker', icon: Store, badge: 'Bio' },
    { id: 'settings' as NavTab, label: 'Pengaturan CMS', icon: Sliders, badge: null },
    { id: 'account' as NavTab, label: 'Pengaturan Akun', icon: ShieldCheck, badge: 'Admin' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out',
          // Mobile Off-canvas behavior
          'w-72 shadow-xl lg:shadow-none',
          isOpen
            ? 'translate-x-0 lg:static lg:w-72 lg:translate-x-0'
            : '-translate-x-full lg:static lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0'
        )}
      >
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-base tracking-tight text-slate-900 truncate">
                Syafira Store
              </div>
              <div className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider truncate">
                Admin Dashboard & CMS
              </div>
            </div>
          </div>

          {/* Hide / Toggle button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            title="Sembunyikan Sidebar (Hide)"
            aria-label="Sembunyikan Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Utama
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-2xs border border-brand-200/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'h-4.5 w-4.5 shrink-0 transition-colors',
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                      isActive
                        ? 'bg-brand-200/70 text-brand-800'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                Supabase Live
              </span>
              <span className="text-[10px] font-mono text-slate-400">v1.1</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 truncate">
              Login: {user?.email}
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline"
            >
              Buka Supabase DB
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>

          <div className="mt-3 text-center text-[10px] text-slate-400">
            <span>Sistem dibuat oleh </span>
            <a
              href="https://daryas.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-500 hover:text-brand-600 transition underline underline-offset-2"
            >
              daryas.tech
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
