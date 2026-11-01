import React, { useState, useEffect, useMemo } from 'react';
import { testimonialsService } from '@/services/testimonialsService';
import { Testimonial, TestimonialInput } from '@/types/database';
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
  Heart,
  MessageSquare,
  CheckCircle,
  EyeOff,
  Calendar,
} from 'lucide-react';

export function TestimonialsModule() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialInput>({
    name: '',
    product: 'Netflix Premium',
    text: '',
    is_approved: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await testimonialsService.getAll();
      setTestimonials(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat testimoni';
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

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.text.toLowerCase().includes(search.toLowerCase());

      const matchApproved =
        filterApproved === 'all'
          ? true
          : filterApproved === 'approved'
          ? item.is_approved
          : !item.is_approved;

      return matchSearch && matchApproved;
    });
  }, [testimonials, search, filterApproved]);

  // Responsive pagination (10 desktop, 5 mobile)
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(filteredTestimonials, 10, 5);


  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      product: 'Netflix Premium',
      text: '',
      is_approved: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      product: item.product,
      text: item.text,
      is_approved: item.is_approved,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) {
      toast({
        title: 'Form Belum Lengkap',
        description: 'Nama pelanggan dan isi ulasan wajib diisi.',
        variant: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await testimonialsService.update(editingItem.id, formData);
        setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast({
          title: 'Testimoni Diperbarui',
          description: `Ulasan dari "${formData.name}" berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await testimonialsService.create(formData);
        setTestimonials((prev) => [created, ...prev]);
        toast({
          title: 'Testimoni Ditambahkan',
          description: `Ulasan baru dari "${formData.name}" berhasil disimpan.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan testimoni';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleApproval = async (item: Testimonial) => {
    try {
      const updated = await testimonialsService.toggleApproval(item.id, !item.is_approved);
      setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast({
        title: updated.is_approved ? 'Testimoni Ditampilkan' : 'Testimoni Disembunyikan',
        description: `Status ulasan "${item.name}" berhasil diubah.`,
        variant: 'info',
      });
    } catch {
      toast({
        title: 'Gagal Mengubah Status',
        description: 'Terjadi kendala saat mengubah status publikasi.',
        variant: 'error',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await testimonialsService.delete(deleteId);
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteId));
      toast({
        title: 'Testimoni Dihapus',
        description: 'Ulasan telah dihapus dari sistem.',
        variant: 'success',
      });
      setDeleteId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus testimoni';
      toast({
        title: 'Gagal Menghapus',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-fancy">
            <span>Ulasan &amp; Testimoni Pelanggan</span>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola ulasan pembeli (Sweet Stories) yang tampil pada tab Testimonials di frontend store.
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
            <span>Tambah Testimoni</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full max-w-full sm:max-w-md">
          <DebouncedSearchInput
            placeholder="Cari nama pembeli, produk, atau isi pesan... (delay 800ms)"
            delay={800}
            onDebouncedChange={setSearch}
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterApproved('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterApproved === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({testimonials.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterApproved('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterApproved === 'approved'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui ({testimonials.filter((t) => t.is_approved).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterApproved('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterApproved === 'pending'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disembunyikan ({testimonials.filter((t) => !t.is_approved).length})
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada ulasan testimoni</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? 'Tidak ditemukan testimoni yang cocok dengan kata kunci pencarian.'
              : 'Tambahkan testimoni pertama atau biarkan pelanggan mengisi ulasan dari website!'}
          </p>
          {!search && (
            <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Tambah Testimoni</span>
            </Button>
          )}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border transition-all ${
                item.is_approved
                  ? 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                  : 'bg-amber-50/40 border-amber-200/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold text-sm flex items-center justify-center uppercase shadow-inner">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {item.name}
                    </h4>
                    <span className="inline-block text-[11px] font-semibold text-brand-600 bg-brand-50/80 px-2 py-0.5 rounded-full mt-0.5">
                      {item.product}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant={item.is_approved ? 'success' : 'warning'} className="text-[10px]">
                    {item.is_approved ? 'Tampil di Web' : 'Disembunyikan'}
                  </Badge>
                </div>
              </div>

              {/* Message quote */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
                &ldquo;{item.text}&rdquo;
              </div>

              {/* Footer action bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(item)}
                    title={item.is_approved ? 'Sembunyikan dari web' : 'Tampilkan di web'}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                  >
                    {item.is_approved ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    title="Ubah Ulasan"
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(item.id)}
                    title="Hapus Ulasan"
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
                {editingItem ? 'Ubah Testimoni Pelanggan' : 'Tambah Testimoni Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi rincian ulasan pelanggan untuk ditampilkan pada Sweet Stories di website.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Nama Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: zee, difa, shenziyy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Produk yang Diulas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Robux Roblox, Netflix Premium, Canva Pro"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Isi Testimoni / Pesan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tulis ulasan pembeli di sini..."
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Tampilkan Langsung di Website</p>
                  <p className="text-[11px] text-slate-500">Ulasan akan langsung dapat dibaca oleh pengunjung toko.</p>
                </div>
                <Switch
                  checked={formData.is_approved}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
                />
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
                {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Testimoni'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Testimoni Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus ulasan ini secara permanen dari database Supabase dan tidak dapat dipulihkan.
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
