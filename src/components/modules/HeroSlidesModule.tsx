import React, { useState, useEffect } from 'react';
import { heroSlidesService } from '@/services/heroSlidesService';
import { HeroSlide, HeroSlideInput } from '@/types/database';
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
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';

export function HeroSlidesModule() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<HeroSlideInput>({
    badge: 'SYAFIRA DIGITAL WORLD',
    title: '',
    description: '',
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
      const data = await heroSlidesService.getAll();
      setSlides(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat hero slides';
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

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      badge: 'PROMO SPESIAL',
      title: '',
      description: '',
      sort_order: slides.length + 1,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingItem(slide);
    setFormData({
      badge: slide.badge,
      title: slide.title,
      description: slide.description,
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Form Belum Lengkap',
        description: 'Judul dan deskripsi banner wajib diisi.',
        variant: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await heroSlidesService.update(editingItem.id, formData);
        setSlides((prev) =>
          prev
            .map((s) => (s.id === updated.id ? updated : s))
            .sort((a, b) => a.sort_order - b.sort_order)
        );
        toast({
          title: 'Banner Diperbarui',
          description: `Banner "${formData.title}" berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await heroSlidesService.create(formData);
        setSlides((prev) =>
          [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
        );
        toast({
          title: 'Banner Ditambahkan',
          description: `Banner baru siap ditampilkan di website.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan slide';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const updated = await heroSlidesService.update(slide.id, { is_active: !slide.is_active });
      setSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast({
        title: updated.is_active ? 'Banner Diaktifkan' : 'Banner Dinonaktifkan',
        description: `Status tayang banner telah diubah.`,
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
      await heroSlidesService.delete(deleteId);
      setSlides((prev) => prev.filter((s) => s.id !== deleteId));
      toast({
        title: 'Banner Dihapus',
        description: 'Slide banner telah dihapus dari sistem.',
        variant: 'success',
      });
      setDeleteId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus slide';
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hero Banner Carousel</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola slide banner sambutan yang berputar otomatis di bagian atas frontend store.
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
            <span>Tambah Slide Banner</span>
          </Button>
        </div>
      </div>

      {/* Slide Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada slide banner</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Buat slide sambutan pertama untuk memikat pengunjung toko Anda!
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Tambah Slide Banner</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`rounded-3xl overflow-hidden border transition-all ${
                slide.is_active
                  ? 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                  : 'bg-slate-50 border-slate-200/60 opacity-70'
              }`}
            >
              {/* Cute pastel preview banner */}
              <div className="relative p-5 bg-gradient-to-tr from-sky-100 via-brand-50 to-indigo-100 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-brand-200 text-[10px] font-bold text-brand-700 uppercase tracking-wider shadow-xs">
                    Slide #{slide.sort_order || index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={slide.is_active ? 'success' : 'slate'} className="text-[10px]">
                      {slide.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  {slide.badge}
                </p>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                  {slide.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {slide.description}
                </p>
              </div>

              {/* Action bar */}
              <div className="p-4 flex items-center justify-between bg-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Tayang:</span>
                  <Switch
                    checked={slide.is_active}
                    onCheckedChange={() => handleToggleActive(slide)}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(slide)}
                    className="h-8 gap-1.5 text-slate-600 hover:text-slate-900"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(slide.id)}
                    className="h-8 gap-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Ubah Slide Banner' : 'Tambah Slide Banner'}
              </DialogTitle>
              <DialogDescription>
                Atur teks sambutan, badge promosi, dan nomor urutan tampil banner di frontend.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Badge Atas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SYAFIRA DIGITAL WORLD, FAST PROCESS 5-30 MINS"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Judul Utama Banner <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Welcome to Syafira Land! ✦˚𝜗𝜚.ᐟ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Deskripsi / Kalimat Pendukung <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Tempat paling nyaman buat top up game & langganan aplikasi premium dengan warna baru yang segar."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Urutan Tampil (Sort Order)
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
                    <span className="text-xs font-semibold text-slate-700">Status Tayang</span>
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
                {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Slide Banner Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Slide ini tidak akan lagi tampil pada carousel di beranda toko Syafira.
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
