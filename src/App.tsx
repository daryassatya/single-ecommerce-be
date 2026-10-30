import { useState, useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewModule } from '@/components/modules/OverviewModule';
import { ProductsModule } from '@/components/modules/ProductsModule';
import { ProductTypesModule } from '@/components/modules/ProductTypesModule';
import { CustomerMessageModule } from '@/components/modules/CustomerMessageModule';
import { SocialLinksModule } from '@/components/modules/SocialLinksModule';
import { TestimonialsModule } from '@/components/modules/TestimonialsModule';
import { HeroSlidesModule } from '@/components/modules/HeroSlidesModule';
import { TermsModule } from '@/components/modules/TermsModule';
import { StoreProfileModule } from '@/components/modules/StoreProfileModule';
import { SettingsModule } from '@/components/modules/SettingsModule';
import { AccountSettingsModule } from '@/components/modules/AccountSettingsModule';
import { Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { EnvConfigScreen } from '@/components/ui/EnvConfigScreen';

function DashboardContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  // Default open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // If mobile on initial load, close sidebar
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
          <p className="text-xs font-semibold text-slate-500">Memuat Syafira Store CMS...</p>
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
        </main>
      </div>
    </div>
  );
}

export function App() {
  if (!isSupabaseConfigured) {
    return <EnvConfigScreen />;
  }

  return (
    <ToastProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
