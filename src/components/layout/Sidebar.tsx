import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Layers,
  Package,
  MessageSquareText,
  Share2,
  Sliders,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'overview' | 'types' | 'products' | 'message' | 'social' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onTabChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'products' as NavTab, label: 'Katalog Produk', icon: Package, badge: 'Lucide' },
    { id: 'types' as NavTab, label: 'Tipe / Kategori', icon: Layers, badge: null },
    { id: 'message' as NavTab, label: 'Template Pesan', icon: MessageSquareText, badge: 'WhatsApp' },
    { id: 'social' as NavTab, label: 'Social Media', icon: Share2, badge: null },
    { id: 'settings' as NavTab, label: 'Pengaturan CMS', icon: Sliders, badge: null },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-md shadow-brand-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                Syafira Store
              </div>
              <div className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                Admin Dashboard & CMS
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
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
                  onClose();
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-2xs border border-brand-200/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full',
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                Supabase Connected
              </span>
              <span className="text-[10px] font-mono text-slate-400">v1.0.0</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Database PostgreSQL terintegrasi aman via RLS policies.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:underline"
            >
              Buka Supabase Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
