import { useState, useEffect, lazy, Suspense } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Sparkles, RefreshCw } from 'lucide-react';

// Code-splitting & Lazy-loading for all dashboard modules (Spec 3)
const OverviewModule = lazy(() =>
  import('@/components/modules/OverviewModule').then((m) => ({ default: m.OverviewModule }))
);
const ProductsModule = lazy(() =>
  import('@/components/modules/ProductsModule').then((m) => ({ default: m.ProductsModule }))
);
const ProductTypesModule = lazy(() =>
  import('@/components/modules/ProductTypesModule').then((m) => ({ default: m.ProductTypesModule }))
);
const TestimonialsModule = lazy(() =>
  import('@/components/modules/TestimonialsModule').then((m) => ({ default: m.TestimonialsModule }))
);
const HeroSlidesModule = lazy(() =>
  import('@/components/modules/HeroSlidesModule').then((m) => ({ default: m.HeroSlidesModule }))
);
const TermsModule = lazy(() =>
  import('@/components/modules/TermsModule').then((m) => ({ default: m.TermsModule }))
);
const SocialLinksModule = lazy(() =>
  import('@/components/modules/SocialLinksModule').then((m) => ({ default: m.SocialLinksModule }))
);
const CustomerMessageModule = lazy(() =>
  import('@/components/modules/CustomerMessageModule').then((m) => ({ default: m.CustomerMessageModule }))
);
const StoreProfileModule = lazy(() =>
  import('@/components/modules/StoreProfileModule').then((m) => ({ default: m.StoreProfileModule }))
);
const SettingsModule = lazy(() =>
  import('@/components/modules/SettingsModule').then((m) => ({ default: m.SettingsModule }))
);
const AccountSettingsModule = lazy(() =>
  import('@/components/modules/AccountSettingsModule').then((m) => ({ default: m.AccountSettingsModule }))
);

function DashboardModuleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 bg-slate-200/70 rounded-xl" />
      <div className="h-4 w-96 bg-slate-200/50 rounded-lg" />
      <div className="h-64 w-full bg-white rounded-3xl border border-slate-200/80 p-8 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    </div>
  );
}

function DashboardContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const tabTitles: Record<NavTab, string> = {
    overview: 'Ringkasan & Metrik Toko',
    products: 'Manajemen Produk (Lucide Icons)',
    types: 'Tipe Produk & Kategori',
    testimonials: 'Testimoni & Ulasan Pembeli (Sweet Stories)',
    hero: 'Hero Banner Carousel (Top Slides)',
    terms: 'Syarat & Ketentuan Layanan (T&C)',
    social: 'Social Media & Quick Links',
    message: 'Template Pesan Order WhatsApp',
    profile: 'Profil Toko, Status Buka & Running Ticker',
    settings: 'Pengaturan CMS',
    account: 'Pengaturan Akun & Keamanan Admin',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Memuat Display Dashboard CMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-900 overflow-x-hidden">
      {/* Sidebar with mobile off-canvas & desktop collapsible mode */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 w-full overflow-x-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTabTitle={tabTitles[currentTab]}
          onNavigateToAccount={() => setCurrentTab('account')}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Suspense fallback={<DashboardModuleSkeleton />}>
            {currentTab === 'overview' && <OverviewModule onNavigate={setCurrentTab} />}
            {currentTab === 'products' && <ProductsModule />}
            {currentTab === 'types' && <ProductTypesModule />}
            {currentTab === 'testimonials' && <TestimonialsModule />}
            {currentTab === 'hero' && <HeroSlidesModule />}
            {currentTab === 'terms' && <TermsModule />}
            {currentTab === 'social' && <SocialLinksModule />}
            {currentTab === 'message' && <CustomerMessageModule />}
            {currentTab === 'profile' && <StoreProfileModule />}
            {currentTab === 'settings' && <SettingsModule />}
            {currentTab === 'account' && <AccountSettingsModule />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
