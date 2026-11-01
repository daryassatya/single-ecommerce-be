import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ProductType, ProductTypeInput } from '@/types/database';
import { slugify } from '@/lib/utils';

interface ProductTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ProductType | null;
  onSubmit: (input: ProductTypeInput) => Promise<void>;
  isLoading: boolean;
}

export function ProductTypeFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: ProductTypeFormDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description || '');
      setIsActive(initialData.is_active);
      setAutoSlug(false);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIsActive(true);
      setAutoSlug(true);
    }
    setErrors({});
  }, [initialData, open]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama tipe produk wajib diisi';
    if (!slug.trim()) errs.slug = 'Slug wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Ubah Tipe Produk' : 'Tambah Tipe Produk Baru'}</DialogTitle>
            <DialogDescription>
              {initialData
                ? 'Perbarui detail kategori produk di bawah ini.'
                : 'Tambahkan kategori baru untuk mengelompokkan produk di toko.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 flex items-center gap-2">
              <span className="font-bold text-amber-600">✦</span>
              <span><strong>Mode Display:</strong> Tambah/Ubah kategori dinonaktifkan pada mode display.</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Nama Tipe / Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Aplikasi Premium, Top Up Game"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Slug URL <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-brand-600 hover:underline"
                >
                  {autoSlug ? 'Kustomisasi manual' : 'Otomatis dari nama'}
                </button>
              </div>
              <input
                type="text"
                placeholder="contoh: aplikasi-premium"
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(slugify(e.target.value));
                }}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Deskripsi (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Keterangan singkat mengenai tipe produk ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Status Aktif</p>
                <p className="text-xs text-slate-500">Tampilkan kategori ini ke publik di toko</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
