import React, { useState, useEffect, useRef } from 'react';
import { messageSettingsService } from '@/services/messageSettingsService';
import { CustomerMessageSetting } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { MessageSquareText, Save, RefreshCw, Send, CheckCheck, Sparkles, HelpCircle, Info } from 'lucide-react';

const DEFAULT_QRIS_TEMPLATE = `Halo Admin, saya sudah melakukan pembayaran melalui QRIS. Berikut detail pesanan saya:

*No. Pesanan:* {orderId}
*Detail Pesanan:*
{daftar_item}

*Total Bayar:* {totalAmount}
*Metode Pembayaran:* {paymentMethod}

Berikut saya lampirkan screenshot bukti pembayarannya. Mohon diproses ya, terima kasih!`;

const VARIABLE_GUIDES = [
  { token: '{orderId}', desc: 'Nomor pesanan unik (contoh: CIA-MVV9WVA0)', highlight: true },
  { token: '{daftar_item}', desc: 'Daftar rincian produk dari keranjang (- Produk (Jenis - Opsi) x Qty = Subtotal)', highlight: true },
  { token: '{totalAmount}', desc: 'Total nominal pembayaran (contoh: Rp20.000)', highlight: true },
  { token: '{paymentMethod}', desc: 'Metode pembayaran (QRIS (Semua E-Wallet & Bank))', highlight: true },
  { token: '{items}', desc: 'Alias format rincian produk (sama seperti {daftar_item})', highlight: false },
  { token: '{nama_produk}', desc: 'Nama produk pertama/tunggal', highlight: false },
  { token: '{tipe_produk}', desc: 'Kategori / Jenis varian produk', highlight: false },
  { token: '{harga}', desc: 'Harga produk', highlight: false },
  { token: '{deskripsi}', desc: 'Keterangan produk', highlight: false },
];

export function CustomerMessageModule() {
  const [setting, setSetting] = useState<CustomerMessageSetting | null>(null);
  const [title, setTitle] = useState('Template Pesan Order WhatsApp');
  const [description, setDescription] = useState(
    'Format pesan yang otomatis dikirim customer saat checkout ke admin WhatsApp setelah scan QRIS.'
  );
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const loadSetting = async () => {
    try {
      setLoading(true);
      const data = await messageSettingsService.get('default_order_message');
      if (data && data.message_template) {
        setSetting(data);
        setTitle(data.title || 'Template Pesan Order WhatsApp');
        setDescription(data.description || '');
        setTemplate(data.message_template);
      } else {
        setTemplate(DEFAULT_QRIS_TEMPLATE);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat pengaturan';
      toast({
        title: 'Gagal Memuat Pengaturan',
        description: errorMsg,
        variant: 'error',
      });
      setTemplate(DEFAULT_QRIS_TEMPLATE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const handleInsertVariable = (variableToken: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = template;
    const newText = text.substring(0, start) + variableToken + text.substring(end);
    setTemplate(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableToken.length, start + variableToken.length);
    }, 0);
  };

  const handleResetDefault = () => {
    setTemplate(DEFAULT_QRIS_TEMPLATE);
    toast({
      title: 'Template Direset',
      description: 'Template dikembalikan ke format pembayaran QRIS default.',
      variant: 'info',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template.trim()) {
      toast({
        title: 'Validasi Gagal',
        description: 'Template pesan tidak boleh kosong.',
        variant: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await messageSettingsService.update('default_order_message', {
        title: title.trim(),
        description: description.trim(),
        message_template: template,
      });
      setSetting(updated);
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Template pesan order customer berhasil diperbarui ke Supabase.',
        variant: 'success',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan template';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate simulated preview text
  const simulatedOrderItems = `- CapCut Pro (Sharing 3U - 1 Bulan) x 1 = Rp35.000
- Canva Pro (Member - 1 Bulan) x 1 = Rp12.000`;

  const previewText = template
    .replace(/\{orderId\}/g, 'CIA-MVV9WVA0')
    .replace(/\{daftar_item\}/g, simulatedOrderItems)
    .replace(/\{items\}/g, simulatedOrderItems)
    .replace(/\{totalAmount\}/g, 'Rp47.000')
    .replace(/\{paymentMethod\}/g, 'QRIS (Semua E-Wallet & Bank)')
    .replace(/\{nama_produk\}/g, 'CapCut Pro')
    .replace(/\{tipe_produk\}/g, 'Sharing 3U - 1 Bulan')
    .replace(/\{harga\}/g, 'Rp35.000')
    .replace(/\{deskripsi\}/g, simulatedOrderItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquareText className="w-6 h-6 text-brand-600" />
            Pengaturan Template Pesan WhatsApp
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi template pesan checkout WhatsApp yang otomatis terisi saat pembeli menekan tombol &ldquo;Saya sudah bayar &rarr; WhatsApp&rdquo;.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleResetDefault}
            title="Kembalikan ke Template QRIS Default"
          >
            Reset Default QRIS
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={loadSetting}
            disabled={loading}
            title="Refresh Setting"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Muat Ulang
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
          <span className="ml-2 text-sm text-slate-500">Memuat data pengaturan...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Editor (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Judul Pengaturan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Keterangan / Deskripsi Admin</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Dynamic Variable Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    Sisipkan Variabel Dinamis (Klik untuk Menambahkan):
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  {VARIABLE_GUIDES.map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => handleInsertVariable(item.token)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all active:scale-95 shadow-2xs ${
                        item.highlight
                          ? 'bg-brand-50 border border-brand-300 text-brand-700 font-semibold hover:bg-brand-100 hover:border-brand-500'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      title={item.desc}
                    >
                      <span className="font-bold">+</span>
                      {item.token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Template */}
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Template Teks Pesan Otomatis <span className="text-rose-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  rows={9}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Ketik template pesan di sini..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 leading-relaxed"
                />
              </div>

              {/* Panduan Variabel Dinamis Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-500" />
                  Daftar Panduan Variabel Dinamis:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="font-mono font-bold text-brand-700">{"{orderId}"}</span> : Nomor pesanan unik (contoh: CIA-MVV9WVA0)
                  </div>
                  <div>
                    <span className="font-mono font-bold text-brand-700">{"{totalAmount}"}</span> : Total nominal (contoh: Rp20.000)
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-mono font-bold text-brand-700">{"{daftar_item}"}</span> atau <span className="font-mono font-bold text-brand-700">{"{items}"}</span> : Rincian pesanan keranjang (format: <code className="bg-slate-200/70 px-1 rounded">- Nama (Jenis - Opsi) x Qty = RpSubtotal</code>)
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-mono font-bold text-brand-700">{"{paymentMethod}"}</span> : Metode pembayaran (contoh: QRIS (Semua E-Wallet & Bank))
                  </div>
                </div>
              </div>

              {setting?.updated_at && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Terakhir diperbarui: {new Date(setting.updated_at).toLocaleString('id-ID')}
                </p>
              )}

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" isLoading={saving} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-1.5" />
                  Simpan Template Pesan
                </Button>
              </div>
            </form>
          </div>

          {/* Live Interactive WhatsApp Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl flex-1 flex flex-col border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live WhatsApp Simulation
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Contoh Pesan Customer</span>
              </div>

              {/* WhatsApp chat mockup container */}
              <div
                className="flex-1 rounded-xl p-4 flex flex-col justify-end"
                style={{
                  backgroundColor: '#0b141a',
                  backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Chat bubble */}
                <div className="self-end max-w-[92%] rounded-2xl rounded-tr-none bg-[#005c4b] p-3.5 text-white shadow-md relative">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {previewText}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-emerald-200/80">
                    <span>10:45</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 bg-[#202c33] rounded-full px-3.5 py-2 text-slate-400 text-xs">
                  <span className="truncate flex-1">Ketik pesan...</span>
                  <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 text-center">
                Preview ini memperlihatkan teks yang akan otomatis terisi saat pembeli menekan tombol &ldquo;Saya sudah bayar &rarr; WhatsApp&rdquo; di website Contoh Nama Toko.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
