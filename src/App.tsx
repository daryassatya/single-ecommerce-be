import { useState } from 'react';
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
import { SettingsModule } from '@/components/modules/SettingsModule';
import { Sparkles } from 'lucide-react';

function DashboardContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabTitles: Record<NavTab, string> = {
    overview: 'Ringkasan & Metrik Toko',
    products: 'Manajemen Produk (Lucide Icons)',
    types: 'Tipe Produk & Kategori',
    message: 'Pengaturan Pesan WhatsApp',
    social: 'Social Media Links',
    settings: 'Pengaturan CMS',
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
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTabTitle={tabTitles[currentTab]}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && <OverviewModule onNavigate={setCurrentTab} />}
          {currentTab === 'products' && <ProductsModule />}
          {currentTab === 'types' && <ProductTypesModule />}
          {currentTab === 'message' && <CustomerMessageModule />}
          {currentTab === 'social' && <SocialLinksModule />}
          {currentTab === 'settings' && <SettingsModule />}
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
