import React, { useState, useEffect, useMemo } from 'react';
import { termsService } from '@/services/termsService';
import { TermsAndCondition, TermsAndConditionInput } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ui/Toast';
import { DebouncedSearchInput } from '@/components/ui/DebouncedSearchInput';
import { Pagination, useResponsivePagination } from '@/components/ui/Pagination';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  FileText,
  ClipboardCheck,
} from 'lucide-react';

export function TermsModule() {
  const [terms, setTerms] = useState<TermsAndCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'apps' | 'robux' | 'mlbb'>('apps');
  const [search, setSearch] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TermsAndCondition | null>(null);
  const [formData, setFormData] = useState<TermsAndConditionInput>({
    category: 'apps',
    content: '',
    sort_order: 1,
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await termsService.getAll();
      setTerms(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat syarat & ketentuan';
      toast({
        title: 'Gagal Memuat Data',
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

  const currentCategoryTerms = useMemo(() => {
    return terms
      .filter((t) => t.category === selectedCategory && (!search || t.content.toLowerCase().includes(search.toLowerCase())))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [terms, selectedCategory, search]);

  // Responsive pagination (10 desktop, 5 mobile)
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(currentCategoryTerms, 10, 5);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      category: selectedCategory,
      content: '',
      sort_order: currentCategoryTerms.length + 1,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: TermsAndCondition) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      content: item.content,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast({
        title: 'Form Belum Lengkap',
        description: 'Isi poin ketentuan wajib diisi.',
        variant: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await termsService.update(editingItem.id, formData);
        setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast({
          title: 'Ketentuan Diperbarui',
          description: `Poin ketentuan berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await termsService.create(formData);
        setTerms((prev) => [...prev, created]);
        toast({
          title: 'Poin Ketentuan Ditambahkan',
          description: `Ketentuan baru berhasil ditambahkan ke kategori ${formData.category}.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan ketentuan';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: TermsAndCondition) => {
    try {
      const updated = await termsService.update(item.id, { is_active: !item.is_active });
      setTerms((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast({
        title: updated.is_active ? 'Poin Diaktifkan' : 'Poin Dinonaktifkan',
        description: `Status tayang ketentuan telah diubah.`,
        variant: 'info',
      });
    } catch {
      toast({
        title: 'Gagal Mengubah Status',
        description: 'Terjadi kendala saat update status.',
        variant: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await termsService.delete(deleteId);
      setTerms((prev) => prev.filter((t) => t.id !== deleteId));
      toast({
        title: 'Poin Ketentuan Dihapus',
        description: 'Ketentuan telah dihapus dari sistem.',
        variant: 'success',
      });
      setDeleteId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus';
      toast({
        title: 'Gagal Menghapus',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const categoryLabels: Record<'apps' | 'robux' | 'mlbb', { title: string; desc: string }> = {
    apps: {
      title: 'Apps Premium',
      desc: 'Syarat & ketentuan langganan aplikasi streaming, produktivitas, dan AI.',
    },
    robux: {
      title: 'Robux via Send',
      desc: 'Aturan pengiriman Robux, gamepass, dan durasi pending Roblox.',
    },
    mlbb: {
      title: 'Mobile Legends',
      desc: 'Petunjuk top-up diamond MLBB dan Weekly Diamond Pass via User ID & Zone ID.',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-fancy">
            <span>Syarat &amp; Ketentuan Layanan (T&amp;C)</span>
            <FileText className="w-5 h-5 text-brand-600" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola rincian aturan pesanan yang tampil di modal Terms &amp; Conditions pada frontend store.
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
          <Button onClick={handleOpenCreate} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Poin Aturan</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['apps', 'robux', 'mlbb'] as const).map((catKey) => {
          const isActive = selectedCategory === catKey;
          const count = terms.filter((t) => t.category === catKey).length;
          return (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{categoryLabels[catKey].title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Description Banner */}
      <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-950">
              Kategori: {categoryLabels[selectedCategory].title}
            </h4>
            <p className="text-[11px] text-brand-800/80 mt-0.5">
              {categoryLabels[selectedCategory].desc}
            </p>
          </div>
        </div>

        <Button onClick={handleOpenCreate} size="sm" variant="outline" className="text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Poin</span>
        </Button>
      </div>

      {/* Search Bar (800ms) */}
      <div className="max-w-md">
        <DebouncedSearchInput
          placeholder="Cari isi poin aturan T&C... (delay 800ms)"
          delay={800}
          onDebouncedChange={setSearch}
        />
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : currentCategoryTerms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada aturan untuk kategori ini</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tambahkan poin syarat dan ketentuan pertama untuk kategori {categoryLabels[selectedCategory].title}!
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Tambah Poin Aturan</span>
          </Button>
        </div>
      ) : (
        <>
        <div className="space-y-2.5">
          {paginatedItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.is_active
                  ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.sort_order || index + 1}
                </div>
                <div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={item.is_active ? 'success' : 'slate'} className="text-[10px]">
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => handleToggleActive(item)}
                />
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  title="Ubah Ketentuan"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(item.id)}
                  title="Hapus Ketentuan"
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          className="rounded-2xl border border-slate-200/80 shadow-2xs mt-4"
        />
        </>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Ubah Poin Ketentuan' : 'Tambah Poin Ketentuan Baru'}
              </DialogTitle>
              <DialogDescription>
                Tuliskan aturan atau instruksi yang harus dipahami pembeli sebelum checkout.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Kategori Ketentuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as 'apps' | 'robux' | 'mlbb' })
                  }
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
                >
                  <option value="apps">Apps Premium (Netflix, Canva, ChatGPT, dll)</option>
                  <option value="robux">Robux via Send (Roblox)</option>
                  <option value="mlbb">Mobile Legends (MLBB)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Isi Ketentuan / Aturan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: 1. Silakan lakukan pembayaran setelah Admin Contoh Nama Toko mengirimkan rincian pesanan dan QRIS resmi."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Nomor Urut Poin (Sort Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-700">Status Aktif</span>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Ketentuan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Poin Ketentuan Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Poin ketentuan ini tidak akan lagi tampil pada dialog Terms &amp; Conditions di website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
