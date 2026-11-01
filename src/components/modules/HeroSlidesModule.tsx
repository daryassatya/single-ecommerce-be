import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const MAX_SLIDES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function HeroSlidesModule() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<HeroSlideInput>({
    badge: 'CONTOH NAMA TOKO',
    title: '',
    description: '',
    sort_order: 1,
    is_active: true,
    image_url: null,
  });

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (slides.length >= MAX_SLIDES) {
      toast({
        title: 'Batas Maksimal Tercapai',
        description: `Maksimal ${MAX_SLIDES} slide banner carousel telah tercapai. Hapus slide lama sebelum menambah yang baru.`,
        variant: 'error',
      });
      return;
    }

    setEditingItem(null);
    setFormData({
      badge: 'PROMO SPESIAL',
      title: '',
      description: '',
      sort_order: slides.length + 1,
      is_active: true,
      image_url: null,
    });
    setSelectedFile(null);
    setImagePreview(null);
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
      image_url: slide.image_url || null,
    });
    setSelectedFile(null);
    setImagePreview(slide.image_url || null);
    setDialogOpen(true);
  };

  // Validasi dan Tangani File Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Pengecekan tipe file: Hanya boleh bertipe gambar
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format File Tidak Didukung',
        description: 'File yang dipilih bukan gambar. Hanya file gambar (JPG, PNG, WEBP, GIF) yang diperbolehkan.',
        variant: 'error',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Pengecekan ukuran file: Maksimal 5MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      toast({
        title: 'Ukuran Gambar Terlalu Besar',
        description: `Ukuran file (${sizeMb} MB) melebihi batas maksimal 5 MB.`,
        variant: 'error',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      let finalImageUrl = formData.image_url;

      // Upload file baru jika ada
      if (selectedFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await heroSlidesService.uploadImage(selectedFile);
        } catch (uploadErr) {
          const errMsg = uploadErr instanceof Error ? uploadErr.message : 'Gagal mengupload gambar';
          toast({
            title: 'Upload Gambar Gagal',
            description: errMsg,
            variant: 'error',
          });
          setSubmitting(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const payload: HeroSlideInput = {
        ...formData,
        image_url: finalImageUrl,
      };

      if (editingItem) {
        const updated = await heroSlidesService.update(editingItem.id, payload);
        setSlides((prev) =>
          prev
            .map((s) => (s.id === updated.id ? updated : s))
            .sort((a, b) => a.sort_order - b.sort_order)
        );
        toast({
          title: 'Banner Diperbarui',
          description: `Banner "${formData.title}" berhasil disimpan.`,
          variant: 'success',
        });
      } else {
        if (slides.length >= MAX_SLIDES) {
          throw new Error(`Maksimal ${MAX_SLIDES} slide banner carousel telah tercapai.`);
        }
        const created = await heroSlidesService.create(payload);
        setSlides((prev) =>
          [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
        );
        toast({
          title: 'Banner Ditambahkan',
          description: 'Slide banner baru siap ditampilkan di beranda frontend.',
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
        description: 'Status tayang banner di frontend telah diubah.',
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

  const isMaxSlidesReached = slides.length >= MAX_SLIDES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hero Banner Carousel</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
              isMaxSlidesReached
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              {slides.length} / {MAX_SLIDES} Slide
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola slide banner sambutan yang berputar otomatis di beranda frontend (maksimal {MAX_SLIDES} slide, gambar &le; 5MB).
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
          <Button
            onClick={handleOpenCreate}
            size="sm"
            disabled={isMaxSlidesReached}
            className={`gap-2 ${
              isMaxSlidesReached ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            title={isMaxSlidesReached ? 'Maksimal 5 slide telah tercapai' : 'Tambah Slide Banner'}
          >
            <Plus className="w-4 h-4" />
            <span>{isMaxSlidesReached ? 'Batas 5 Slide Penuh' : 'Tambah Slide Banner'}</span>
          </Button>
        </div>
      </div>

      {/* Slide Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada slide banner</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Buat slide sambutan pertama untuk memikat pengunjung toko Anda! (Maksimal {MAX_SLIDES} slide).
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
              className={`rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                slide.is_active
                  ? 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                  : 'bg-slate-50 border-slate-200/60 opacity-70'
              }`}
            >
              {/* Slide Preview Banner */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-900 border-b border-slate-100">
                {slide.image_url ? (
                  <>
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                  </>
                ) : (
                  <div className="w-full h-full p-5 bg-gradient-to-tr from-sky-100 via-brand-50 to-indigo-100 flex flex-col justify-between" />
                )}

                {/* Overlay Text Content */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-left">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                      slide.image_url
                        ? 'bg-black/60 text-white backdrop-blur-xs border border-white/20'
                        : 'bg-white/80 border border-brand-200 text-brand-700'
                    }`}>
                      Slide #{slide.sort_order || index + 1}
                    </span>
                    <Badge variant={slide.is_active ? 'success' : 'slate'} className="text-[10px]">
                      {slide.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>

                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                      slide.image_url ? 'text-brand-300' : 'text-slate-500'
                    }`}>
                      {slide.badge}
                    </p>
                    <h3 className={`text-sm sm:text-base font-extrabold leading-snug line-clamp-1 ${
                      slide.image_url ? 'text-white' : 'text-slate-900'
                    }`}>
                      {slide.title}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                      slide.image_url ? 'text-slate-200' : 'text-slate-600'
                    }`}>
                      {slide.description}
                    </p>
                  </div>
                </div>
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
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Ubah Slide Banner' : 'Tambah Slide Banner'}
              </DialogTitle>
              <DialogDescription>
                Unggah gambar banner (maks 5MB), teks sambutan, badge promosi, dan nomor urutan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 max-h-[75vh] overflow-y-auto px-1">
              {/* Image Upload Area */}
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                    Gambar Banner (Maks. 5MB, format JPG/PNG/WEBP/GIF)
                  </span>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Hapus Gambar
                    </button>
                  )}
                </label>

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-40 group">
                    <img
                      src={imagePreview}
                      alt="Preview Banner"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="bg-white text-slate-800 text-xs gap-1.5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Ganti Gambar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        className="text-xs gap-1.5"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50/70 hover:bg-brand-50/20 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Klik untuk unggah gambar banner
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hanya file gambar (JPG, PNG, WEBP, GIF) &bull; Ukuran maksimal 5MB
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Direct URL input fallback */}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar eksternal di sini (opsional)..."
                    value={formData.image_url || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      if (!selectedFile) setImagePreview(e.target.value || null);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Badge Atas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: CONTOH NAMA TOKO, FAST PROCESS 5-30 MINS"
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
                  placeholder="Contoh: Katalog Produk Digital Pilihan ✦"
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
                  rows={2}
                  placeholder="Contoh: Temukan berbagai kebutuhan aplikasi premium & voucher game dengan penawaran terbaik."
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
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-700">Status Tayang</span>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? (uploadingImage ? 'Mengunggah Gambar...' : 'Menyimpan...') : editingItem ? 'Simpan Perubahan' : 'Tambah Banner'}
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
              Slide ini tidak akan lagi tampil pada carousel di beranda Contoh Nama Toko.
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
