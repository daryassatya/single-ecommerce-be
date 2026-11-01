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
import { Product, ProductInput, ProductType, ProductVariantTypeInput } from '@/types/database';
import { Plus, Trash2, Layers, CheckCircle2, Sparkles } from 'lucide-react';

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
  const [isActive, setIsActive] = useState(true);

  // 2-Tier Nested Variant States
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [variantTypes, setVariantTypes] = useState<ProductVariantTypeInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTypeId(initialData.type_id || 'none');
      setPrice(initialData.base_price ?? initialData.price ?? 0);
      setBadge(initialData.badge || '');
      setIconName(initialData.icon_name || 'Package');
      setDescription(initialData.description || '');
      setIsActive(initialData.is_active);

      const hasVars = Boolean(
        initialData.has_variants || 
        (initialData.variant_types && initialData.variant_types.length > 0)
      );
      setHasVariants(hasVars);

      if (initialData.variant_types && initialData.variant_types.length > 0) {
        setVariantTypes(
          initialData.variant_types.map((vt) => ({
            id: vt.id,
            name: vt.name,
            sort_order: vt.sort_order,
            options: (vt.options || vt.product_variant_options || []).map((opt) => ({
              id: opt.id,
              label: opt.label,
              price: Number(opt.price || 0),
              is_available: opt.is_available ?? true,
              sort_order: opt.sort_order ?? 0,
            })),
          }))
        );
      } else if (initialData.variants && initialData.variants.length > 0) {
        // Convert legacy flat variants to default 2-tier structure if desired
        setVariantTypes(
          initialData.variants.map((v, idx) => ({
            name: v,
            sort_order: idx + 1,
            options: [
              { label: 'Standard', price: initialData.price || 0, is_available: true, sort_order: 1 }
            ]
          }))
        );
      } else {
        setVariantTypes([]);
      }
    } else {
      setName('');
      setTypeId(productTypes[0]?.id || 'none');
      setPrice(0);
      setBadge('');
      setIconName('Package');
      setDescription('');
      setIsActive(true);
      setHasVariants(false);
      setVariantTypes([]);
    }
    setErrors({});
  }, [initialData, open, productTypes]);

  // Nested Variant Handlers
  const handleAddVariantType = () => {
    setVariantTypes([
      ...variantTypes,
      {
        name: '',
        sort_order: variantTypes.length + 1,
        options: [
          { label: '1 Bulan', price: price || 50000, is_available: true, sort_order: 1 },
        ],
      },
    ]);
  };

  const handleRemoveVariantType = (typeIndex: number) => {
    setVariantTypes(variantTypes.filter((_, i) => i !== typeIndex));
  };

  const handleUpdateTypeName = (typeIndex: number, newName: string) => {
    const updated = [...variantTypes];
    updated[typeIndex] = { ...updated[typeIndex], name: newName };
    setVariantTypes(updated);
  };

  const handleAddOption = (typeIndex: number) => {
    const updated = [...variantTypes];
    const currentOptions = updated[typeIndex].options || [];
    updated[typeIndex] = {
      ...updated[typeIndex],
      options: [
        ...currentOptions,
        {
          label: '',
          price: 0,
          is_available: true,
          sort_order: currentOptions.length + 1,
        },
      ],
    };
    setVariantTypes(updated);
  };

  const handleRemoveOption = (typeIndex: number, optIndex: number) => {
    const updated = [...variantTypes];
    updated[typeIndex] = {
      ...updated[typeIndex],
      options: updated[typeIndex].options.filter((_, i) => i !== optIndex),
    };
    setVariantTypes(updated);
  };

  const handleUpdateOption = (
    typeIndex: number,
    optIndex: number,
    field: 'label' | 'price' | 'is_available',
    value: any
  ) => {
    const updated = [...variantTypes];
    const targetOpt = { ...updated[typeIndex].options[optIndex], [field]: value };
    const newOptions = [...updated[typeIndex].options];
    newOptions[optIndex] = targetOpt;
    updated[typeIndex] = { ...updated[typeIndex], options: newOptions };
    setVariantTypes(updated);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama produk wajib diisi';
    if (!iconName.trim()) errs.iconName = 'Pilih ikon produk';

    if (!hasVariants) {
      if (price < 0) errs.price = 'Harga tidak boleh negatif';
    } else {
      if (variantTypes.length === 0) {
        errs.variants = 'Tambahkan minimal 1 Jenis Varian (Level 1)';
      } else {
        for (let i = 0; i < variantTypes.length; i++) {
          const vt = variantTypes[i];
          if (!vt.name.trim()) {
            errs[`type_${i}`] = `Nama Jenis Varian #${i + 1} wajib diisi (misal: Plus, Pro, Ultra)`;
          }
          if (!vt.options || vt.options.length === 0) {
            errs[`type_options_${i}`] = `Jenis Varian "${vt.name || '#' + (i + 1)}" wajib memiliki minimal 1 opsi durasi/harga`;
          } else {
            for (let j = 0; j < vt.options.length; j++) {
              const opt = vt.options[j];
              if (!opt.label.trim()) {
                errs[`opt_label_${i}_${j}`] = `Label opsi wajib diisi (misal: 1 Bulan)`;
              }
              if (opt.price < 0) {
                errs[`opt_price_${i}_${j}`] = `Harga opsi tidak boleh negatif`;
              }
            }
          }
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Calculate display price
    let finalBasePrice: number | null = Number(price);
    let finalDisplayPrice: number = Number(price);

    if (hasVariants) {
      finalBasePrice = null;
      const allPrices: number[] = [];
      variantTypes.forEach((vt) => {
        vt.options.forEach((opt) => allPrices.push(Number(opt.price)));
      });
      if (allPrices.length > 0) {
        finalDisplayPrice = Math.min(...allPrices);
      }
    }

    await onSubmit({
      name: name.trim(),
      type_id: typeId === 'none' ? null : typeId,
      price: finalDisplayPrice,
      base_price: finalBasePrice,
      has_variants: hasVariants,
      badge: badge.trim() || null,
      icon_name: iconName.trim(),
      variants: hasVariants ? variantTypes.map((vt) => vt.name) : [],
      description: description.trim() || null,
      is_active: isActive,
      variant_types: hasVariants ? variantTypes : [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 pb-3 border-b border-slate-100">
            <DialogTitle>{initialData ? 'Ubah Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              Atur detail produk, kategori, ikon visual, dan arsitektur varian berjenjang 2 tingkat (Parent-Child).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6 py-4 overflow-y-auto flex-1 pr-3">
            {/* Display Mode Notice Banner inside dialog */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Mode Display:</strong> Formulir ini hanya untuk melihat struktur varian &amp; opsi produk. Aksi simpan dinonaktifkan.</span>
            </div>

            {/* Nama Produk */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Google Gemini Subscription, Netflix Premium, Mobile Legends"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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

              <div>
                <IconPicker
                  label="Ikon Produk (Lucide)"
                  value={iconName}
                  onChange={setIconName}
                />
                {errors.iconName && <p className="mt-1 text-xs text-rose-500">{errors.iconName}</p>}
              </div>
            </div>

            {/* Badge Label */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Badge Label (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: AI · 3 Tipe, Promo, Best Seller, Top-Up Kilat"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* TOGGLE: ARSITEKTUR VARIAN BERJENJANG (PARENT-CHILD) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                    <Layers className="w-4 h-4 text-brand-600" />
                    <span>Gunakan Varian Berjenjang 2 Tingkat (Parent–Child)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aktifkan jika produk memiliki pilihan Jenis/Tier (Parent) dan Opsi Durasi/Harga (Child).
                  </p>
                </div>
                <Switch
                  checked={hasVariants}
                  onCheckedChange={(checked) => setHasVariants(checked)}
                />
              </div>

              {/* TAMPILAN JIKA TIDAK ADA VARIAN: HARGA DASAR TUNGGAL */}
              {!hasVariants ? (
                <div className="pt-2 border-t border-slate-200/60">
                  <label className="text-xs font-semibold text-slate-700">
                    Harga Produk (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 h-10 w-full sm:w-64 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                  />
                  {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price}</p>}
                </div>
              ) : (
                /* TAMPILAN BUILDER VARIAN BERJENJANG 2 TINGKAT */
                <div className="pt-3 border-t border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 font-mono">
                        LEVEL 1: JENIS / PAKET VARIAN (PARENT)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Contoh: Gemini AI Plus, Gemini AI Pro, Gemini AI Ultra
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleAddVariantType}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Jenis Varian
                    </Button>
                  </div>

                  {errors.variants && (
                    <p className="text-xs text-rose-500 font-medium">{errors.variants}</p>
                  )}

                  {variantTypes.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-white border border-dashed border-slate-300 text-xs text-slate-400">
                      Belum ada jenis varian. Klik tombol <strong>&quot;Tambah Jenis Varian&quot;</strong> di atas.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {variantTypes.map((vt, typeIdx) => (
                        <div
                          key={typeIdx}
                          className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                        >
                          {/* Header Level 1: Nama Jenis & Tombol Hapus */}
                          <div className="flex items-start gap-2 justify-between">
                            <div className="flex-1">
                              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                                Jenis Varian #{typeIdx + 1} (Parent) <span className="text-rose-500">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Contoh: Gemini AI Plus / Gemini AI Pro"
                                  value={vt.name}
                                  onChange={(e) => handleUpdateTypeName(typeIdx, e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveVariantType(typeIdx)}
                                  className="text-slate-400 hover:text-rose-500 h-9 px-2"
                                  title="Hapus Jenis Varian ini"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {errors[`type_${typeIdx}`] && (
                                <p className="mt-1 text-[11px] text-rose-500">
                                  {errors[`type_${typeIdx}`]}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* LEVEL 2: OPSI DURASI & HARGA (CHILD) */}
                          <div className="pl-3 border-l-2 border-brand-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                Level 2: Opsi Durasi &amp; Harga Akhir (Child)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddOption(typeIdx)}
                                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Tambah Opsi</span>
                              </button>
                            </div>

                            {errors[`type_options_${typeIdx}`] && (
                              <p className="text-[11px] text-rose-500">
                                {errors[`type_options_${typeIdx}`]}
                              </p>
                            )}

                            {vt.options && vt.options.length > 0 ? (
                              <div className="space-y-2">
                                {vt.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
                                  >
                                    {/* Label Opsi */}
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        placeholder="Label (1 Bulan / 1 Tahun)"
                                        value={opt.label}
                                        onChange={(e) =>
                                          handleUpdateOption(typeIdx, optIdx, 'label', e.target.value)
                                        }
                                        className="h-8 w-full rounded-md border border-slate-200 px-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none bg-white"
                                      />
                                      {errors[`opt_label_${typeIdx}_${optIdx}`] && (
                                        <p className="text-[10px] text-rose-500 mt-0.5">
                                          {errors[`opt_label_${typeIdx}_${optIdx}`]}
                                        </p>
                                      )}
                                    </div>

                                    {/* Harga Opsi (Final Price) */}
                                    <div className="w-32">
                                      <div className="relative">
                                        <span className="absolute left-2 top-2 text-[10px] font-mono text-slate-400">
                                          Rp
                                        </span>
                                        <input
                                          type="number"
                                          min="0"
                                          step="500"
                                          placeholder="Harga"
                                          value={opt.price}
                                          onChange={(e) =>
                                            handleUpdateOption(
                                              typeIdx,
                                              optIdx,
                                              'price',
                                              Number(e.target.value)
                                            )
                                          }
                                          className="h-8 w-full rounded-md border border-slate-200 pl-7 pr-2 text-xs font-semibold text-slate-800 focus:border-brand-500 focus:outline-none bg-white"
                                        />
                                      </div>
                                      {errors[`opt_price_${typeIdx}_${optIdx}`] && (
                                        <p className="text-[10px] text-rose-500 mt-0.5">
                                          {errors[`opt_price_${typeIdx}_${optIdx}`]}
                                        </p>
                                      )}
                                    </div>

                                    {/* Status Stok / Tersedia */}
                                    <div className="flex items-center gap-1 shrink-0 px-1">
                                      <Switch
                                        checked={opt.is_available}
                                        onCheckedChange={(val) =>
                                          handleUpdateOption(typeIdx, optIdx, 'is_available', val)
                                        }
                                      />
                                      <span className="text-[10px] font-medium text-slate-500">
                                        {opt.is_available ? 'Ready' : 'Habis'}
                                      </span>
                                    </div>

                                    {/* Hapus Opsi */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(typeIdx, optIdx)}
                                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition"
                                      title="Hapus Opsi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Keterangan / Deskripsi Produk</label>
              <textarea
                rows={3}
                placeholder="Rincian garansi, panduan login, ketentuan sharing/private akun..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
              <div>
                <span className="text-xs font-semibold text-slate-800">Status Pajang Produk</span>
                <p className="text-[11px] text-slate-400">
                  Produk aktif akan langsung tampil di halaman etalase toko.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Buat Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
