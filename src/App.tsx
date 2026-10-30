import { useState } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewModule } from '@/components/modules/OverviewModule';
import { ProductsModule } from '@/components/modules/ProductsModule';
import { ProductTypesModule } from '@/components/modules/ProductTypesModule';
import { CustomerMessageModule } from '@/components/modules/CustomerMessageModule';
import { SocialLinksModule } from '@/components/modules/SocialLinksModule';
import { SettingsModule } from '@/components/modules/SettingsModule';

export function App() {
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

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

export default App;
