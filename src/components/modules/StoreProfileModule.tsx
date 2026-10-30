import React, { useState, useEffect } from 'react';
import { storeProfileService } from '@/services/storeProfileService';
import { StoreProfile, StoreProfileInput } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import {
  Store,
  Save,
  RefreshCw,
  Bell,
  Sparkles,
  Phone,
  BarChart3,
  ScrollText,
  Plus,
  Trash2,
} from 'lucide-react';

export function StoreProfileModule() {
  const [, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState('Syafira Store ✦˚𝜗𝜚.ᐟ');
  const [handle, setHandle] = useState('@oepalin');
  const [badgeText, setBadgeText] = useState('DIGITAL GOODIES & SOCIAL HUB');
  const [bio, setBio] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('6281400688284');
  const [isOpen, setIsOpen] = useState(true);
  const [statGoodies, setStatGoodies] = useState('56');
  const [statFolls, setStatFolls] = useState('3.2k');
  const [statFolks, setStatFolks] = useState('4.1k');
  const [announcementText, setAnnouncementText] = useState(
    'Promo Syafira Store: Diskon Rp 2.000 untuk pembelian bundel Netflix + Canva Pro hari ini!'
  );
  const [marqueeMessages, setMarqueeMessages] = useState<string[]>([
    'check product details before ordering ✦',
    'made with love & pixel magic by Syafira Store ✦',
    'thank you for shopping small & supporting Syafira ✦',
    'fast response 5–30 minutes process ✦',
    'legal, safe & guaranteed warranty ✦',
  ]);
  const [newMarqueeText, setNewMarqueeText] = useState('');

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await storeProfileService.get();
      if (data) {
        setProfile(data);
        setStoreName(data.store_name);
        setHandle(data.handle);
        setBadgeText(data.badge_text);
        setBio(data.bio);
        setWhatsappNumber(data.whatsapp_number);
        setIsOpen(data.is_open);
        setStatGoodies(data.stat_goodies);
        setStatFolls(data.stat_folls);
        setStatFolks(data.stat_folks);
        setAnnouncementText(data.announcement_text);
        if (data.marquee_messages && data.marquee_messages.length > 0) {
          setMarqueeMessages(data.marquee_messages);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat profil toko';
      toast({
        title: 'Gagal Memuat Profil',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMarquee = () => {
    if (!newMarqueeText.trim()) return;
    setMarqueeMessages([...marqueeMessages, newMarqueeText.trim()]);
    setNewMarqueeText('');
  };

  const handleRemoveMarquee = (index: number) => {
    setMarqueeMessages(marqueeMessages.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<StoreProfileInput> = {
        store_name: storeName.trim(),
        handle: handle.trim(),
        badge_text: badgeText.trim(),
        bio: bio.trim(),
        whatsapp_number: whatsappNumber.trim(),
        is_open: isOpen,
        stat_goodies: statGoodies.trim(),
        stat_folls: statFolls.trim(),
        stat_folks: statFolks.trim(),
        announcement_text: announcementText.trim(),
        marquee_messages: marqueeMessages,
      };

      const updated = await storeProfileService.update(payload);
      setProfile(updated);
      toast({
        title: 'Profil Toko Disimpan',
        description: 'Informasi bio, kontak, status buka toko, dan running text berhasil diupdate ke Supabase.',
        variant: 'success',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan profil';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Profil Toko &amp; Teks Berjalan (Ticker)</span>
            <Store className="w-5 h-5 text-brand-600" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola bio kartu profil, status buka toko, angka metrik, lonceng promo, dan teks berjalan marquee di frontend.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>
          <Button onClick={handleSave} size="sm" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Store Profile & Contact */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Identitas & Bio Toko */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Identitas &amp; Kartu Profil Syafira (ProfileCard)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nama Toko</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Username / Handle</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Sub-Judul / Badge Kategori</label>
                <input
                  type="text"
                  required
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase tracking-wider text-[11px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp Toko (API)</label>
                <div className="relative mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Bio Kawaii Toko</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Teks deskripsi lucu yang tampil di dalam kotak pastel kartu profil Syafira.
              </p>
            </div>

            {/* Status Buka Toko Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    Status Toko: {isOpen ? 'Buka (Open)' : 'Tutup Sementara (Closed)'}
                  </p>
                  <p className="text-[11px] text-emerald-800/80">
                    {isOpen ? 'Yay, Syafira Store is open ♡' : 'Mohon maaf, toko sedang istirahat'}
                  </p>
                </div>
              </div>
              <Switch checked={isOpen} onCheckedChange={setIsOpen} />
            </div>
          </div>

          {/* Card 2: Lonceng Pengumuman Header */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Pesan Lonceng Pengumuman Header</span>
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700">Teks Notifikasi Promo / Broadcast</label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pesan ini akan muncul sebagai popup toast saat pengunjung mengklik ikon lonceng di navbar atas.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Running Marquee Ticker */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 3: Angka Statistik Profil (3 Kolom) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>3 Angka Statistik Toko (Stats)</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Goodies</label>
                <input
                  type="text"
                  value={statGoodies}
                  onChange={(e) => setStatGoodies(e.target.value)}
                  className="mt-1 w-full text-center px-2 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Digital goodies</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Followers</label>
                <input
                  type="text"
                  value={statFolls}
                  onChange={(e) => setStatFolls(e.target.value)}
                  className="mt-1 w-full text-center px-2 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Happy folls</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Pelanggan</label>
                <input
                  type="text"
                  value={statFolks}
                  onChange={(e) => setStatFolks(e.target.value)}
                  className="mt-1 w-full text-center px-2 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Happy folks</span>
              </div>
            </div>
          </div>

          {/* Card 4: Teks Berjalan Marquee Ticker */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ScrollText className="w-4 h-4 text-brand-600" />
              <span>Teks Berjalan di Bawah (MarqueeTicker)</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tambah kalimat running text baru..."
                value={newMarqueeText}
                onChange={(e) => setNewMarqueeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMarquee())}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <Button type="button" size="sm" onClick={handleAddMarquee} className="h-9 gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {marqueeMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-700 group hover:border-slate-200"
                >
                  <span className="truncate pr-2 font-mono text-[11px]">{msg}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMarquee(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus pesan ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button type="submit" size="lg" disabled={saving} className="w-full gap-2 shadow-md">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Semua Perubahan Profil'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
