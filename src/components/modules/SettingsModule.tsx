import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { CustomerMessageModule } from './CustomerMessageModule';
import { SocialLinksModule } from './SocialLinksModule';
import { MessageSquareText, Share2, Sliders } from 'lucide-react';

export function SettingsModule() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60">
          <Sliders className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan CMS Toko
          </h1>
          <p className="text-sm text-slate-500">
            Kelola template pesan transaksi WhatsApp dan tautan media sosial toko Cia Store.
          </p>
        </div>
      </div>

      <Tabs defaultValue="message" className="w-full">
        <TabsList className="bg-slate-200/70 p-1.5 h-auto rounded-2xl gap-1">
          <TabsTrigger value="message" className="gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm">
            <MessageSquareText className="w-4 h-4" />
            Template Pesan Customer
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm">
            <Share2 className="w-4 h-4" />
            Social Media Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="message" className="pt-2">
          <CustomerMessageModule />
        </TabsContent>

        <TabsContent value="social" className="pt-2">
          <SocialLinksModule />
        </TabsContent>
      </Tabs>
    </div>
  );
}
