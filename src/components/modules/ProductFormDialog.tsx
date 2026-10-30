import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { IconPicker } from '@/components/ui/IconPicker';
import { Product, ProductInput, ProductType } from '@/types/database';
import { Plus, X } from 'lucide-react';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product | null;
  productTypes: ProductType[];
  onSubmit: (input: ProductInput) => Promise<void>;
  isLoading: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  productTypes,
  onSubmit,
  isLoading,
}: ProductFormDialogProps) {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState<string>('none');
  const [price, setPrice] = useState<number>(0);
  const [badge, setBadge] = useState('');
  const [iconName, setIconName] = useState('Package');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<string[]>([]);
  const [newVariant, setNewVariant] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTypeId(initialData.type_id || 'none');
      setPrice(initialData.price);
      setBadge(initialData.badge || '');
      setIconName(initialData.icon_name || 'Package');
      setDescription(initialData.description || '');
      setVariants(initialData.variants || []);
      setIsActive(initialData.is_active);
    } else {
      setName('');
      setTypeId(productTypes[0]?.id || 'none');
      setPrice(0);
      setBadge('');
      setIconName('Package');
      setDescription('');
      setVariants([]);
      setIsActive(true);
    }
    setNewVariant('');
    setErrors({});
  }, [initialData, open, productTypes]);

  const handleAddVariant = () => {
    const trimmed = newVariant.trim();
    if (trimmed && !variants.includes(trimmed)) {
      setVariants([...variants, trimmed]);
      setNewVariant('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama produk wajib diisi';
    if (price < 0) errs.price = 'Harga tidak boleh negatif';
    if (!iconName.trim()) errs.iconName = 'Pilih ikon produk';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      type_id: typeId === 'none' ? null : typeId,
      price: Number(price),
      badge: badge.trim() || null,
      icon_name: iconName.trim(),
      variants: variants,
      description: description.trim() || null,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Ubah Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              Produk menggunakan <strong>Lucide Icon</strong> sebagai identitas visual tanpa upload gambar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Nama Produk */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Netflix Premium, Robux Roblox, Canva Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Grid 2 Kolom: Kategori & Icon Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tipe / Kategori Produk
                </label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Kategori</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lucide Icon Picker Component */}
              <div>
                <IconPicker
                  label="Ikon Produk (Lucide)"
                  value={iconName}
                  onChange={setIconName}
                />
                {errors.iconName && <p className="mt-1 text-xs text-rose-500">{errors.iconName}</p>}
              </div>
            </div>

            {/* Grid 2 Kolom: Harga & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Harga Dasar (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Badge Label (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: AI · 5 varian, Promo, Best Seller"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Varian Produk */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Daftar Varian Produk (Paket / Opsi Durasi)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik varian, misal: 1 Bulan, 100 Robux..."
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVariant();
                    }
                  }}
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddVariant}>
                  <Plus className="w-4 h-4" />
                  Tambah
                </Button>
              </div>

              {variants.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {variants.map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Keterangan / Deskripsi Produk</label>
              <textarea
                rows={3}
                placeholder="Deskripsi produk, garansi, keunggulan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Toggle Status Aktif */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Status Aktif</p>
                <p className="text-xs text-slate-500">Tampilkan produk ini di katalog etalase toko</p>
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
              {initialData ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
