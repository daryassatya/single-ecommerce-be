import { useState, useEffect, useMemo } from 'react';
import { productsService } from '@/services/productsService';
import { productTypesService } from '@/services/productTypesService';
import { Product, ProductInput, ProductType } from '@/types/database';
import { ProductFormDialog } from './ProductFormDialog';
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
import { DynamicIcon } from '@/lib/icons';
import { formatRupiah } from '@/lib/utils';
import { DebouncedSearchInput } from '@/components/ui/DebouncedSearchInput';
import { Pagination, useResponsivePagination } from '@/components/ui/Pagination';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  RefreshCw,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Accordion state for mobile view
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Form Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsData, typesData] = await Promise.all([
        productsService.getAll(),
        productTypesService.getAll(),
      ]);
      setProducts(prodsData);
      setProductTypes(typesData);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data produk';
      toast({
        title: 'Gagal Memuat Produk',
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

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.badge && p.badge.toLowerCase().includes(search.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

      const matchType =
        selectedTypeFilter === 'all' || p.type_id === selectedTypeFilter;

      return matchSearch && matchType;
    });
  }, [products, search, selectedTypeFilter]);

  // Responsive pagination (9 on desktop, 5 on mobile)
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(filteredProducts, 9, 5);

  const handleCreateOrUpdate = async (input: ProductInput) => {
    try {
      setSubmitting(true);
      if (editingProduct) {
        const updated = await productsService.update(editingProduct.id, input);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast({
          title: 'Produk Diperbarui',
          description: `Produk "${input.name}" berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await productsService.create(input);
        setProducts((prev) => [created, ...prev]);
        toast({
          title: 'Produk Ditambahkan',
          description: `Produk "${input.name}" siap dipajang di toko.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan produk';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await productsService.toggleActive(product.id, product.is_active);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast({
        title: updated.is_active ? 'Produk Diaktifkan' : 'Produk Dinonaktifkan',
        description: `Status produk "${product.name}" telah diubah.`,
        variant: 'info',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengubah status';
      toast({
        title: 'Gagal Mengubah Status',
        description: errorMsg,
        variant: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await productsService.delete(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      toast({
        title: 'Produk Dihapus',
        description: 'Produk telah dihapus dari sistem toko.',
        variant: 'success',
      });
      setDeleteId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus produk';
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
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-fancy">
            <Package className="w-6 h-6 text-brand-600" />
            <span>Katalog Produk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola aplikasi premium, varian durasi harga, dan ikon Lucide toko.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5"
            title="Muat ulang data dari Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
            size="sm"
            className="gap-1.5 shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </Button>
        </div>
      </div>

      {/* Filter and Debounced Search Bar (800ms delay with spinner) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Debounced Search */}
        <div className="flex-1 max-w-full sm:max-w-md">
          <DebouncedSearchInput
            placeholder="Cari nama produk, badge... (delay 800ms)"
            delay={800}
            onDebouncedChange={setSearch}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="h-10 w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 focus:outline-none transition-colors"
          >
            <option value="all">Semua Kategori</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Content: Desktop Table & Mobile Accordion */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            <span className="text-xs font-semibold">Memuat data produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Tidak ada produk yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <>
            {/* 1. DESKTOP TABLE VIEW (Visible on md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Ikon & Nama Produk</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Harga Dasar</th>
                    <th className="px-6 py-4">Varian Paket</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Icon & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60">
                            <DynamicIcon name={prod.icon_name || 'Package'} className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{prod.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-slate-400">
                                lucide:{prod.icon_name}
                              </span>
                              {prod.badge && (
                                <span className="inline-block text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200/50">
                                  {prod.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kategori */}
                      <td className="px-6 py-4">
                        <Badge variant="slate">
                          {prod.product_types?.name || 'Tanpa Kategori'}
                        </Badge>
                      </td>

                      {/* Harga */}
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {prod.has_variants ? (
                          <div>
                            <span className="text-[10px] text-brand-600 block font-mono">
                              Mulai dari
                            </span>
                            <span className="text-brand-700">{formatRupiah(prod.price)}</span>
                          </div>
                        ) : (
                          formatRupiah(prod.base_price ?? prod.price)
                        )}
                      </td>

                      {/* Varian */}
                      <td className="px-6 py-4 max-w-xs">
                        {prod.has_variants && prod.variant_types && prod.variant_types.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded-md">
                              <Layers className="w-3 h-3 text-brand-500" />
                              {prod.variant_types.length} Jenis Berjenjang
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {prod.variant_types.slice(0, 3).map((vt, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/50"
                                >
                                  {vt.name} ({(vt.options || vt.product_variant_options || []).length})
                                </span>
                              ))}
                              {prod.variant_types.length > 3 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{prod.variant_types.length - 3} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        ) : prod.variants && prod.variants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {prod.variants.slice(0, 3).map((v, i) => (
                              <span
                                key={i}
                                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {v}
                              </span>
                            ))}
                            {prod.variants.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{prod.variants.length - 3} lainnya
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            checked={prod.is_active}
                            onCheckedChange={() => handleToggleActive(prod)}
                          />
                          <Badge variant={prod.is_active ? 'success' : 'slate'}>
                            {prod.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(prod);
                              setDialogOpen(true);
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                            title="Ubah Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(prod.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE & TABLET ACCORDION VIEW (Prevents horizontal overflow) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedItems.map((prod) => {
                const isExpanded = !!expandedRows[prod.id];
                return (
                  <div key={prod.id} className="p-3.5 transition-colors hover:bg-slate-50/50">
                    {/* Collapsed Header Bar (Tap to toggle) */}
                    <div
                      onClick={() => toggleAccordion(prod.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60 shadow-2xs">
                          <DynamicIcon name={prod.icon_name || 'Package'} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{prod.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-medium truncate">
                              {prod.product_types?.name || 'Umum'}
                            </span>
                            <span className="text-[10px] font-bold text-brand-700">
                              {prod.has_variants ? `Mulai ${formatRupiah(prod.price)}` : formatRupiah(prod.base_price ?? prod.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={prod.is_active ? 'success' : 'slate'} className="text-[10px] px-1.5 py-0.5">
                          {prod.is_active ? 'Aktif' : 'Off'}
                        </Badge>
                        <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-100">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Drawer */}
                    {isExpanded && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3 text-xs bg-slate-50/60 p-3 rounded-xl animate-in fade-in duration-200">
                        {/* Badges & Description */}
                        {prod.badge && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">Badge:</span>
                            <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
                              {prod.badge}
                            </span>
                          </div>
                        )}

                        {prod.description && (
                          <div>
                            <span className="text-slate-400 text-[11px] block">Deskripsi:</span>
                            <p className="text-slate-600 text-xs mt-0.5">{prod.description}</p>
                          </div>
                        )}

                        {/* Variants */}
                        {prod.has_variants && prod.variant_types && prod.variant_types.length > 0 && (
                          <div>
                            <span className="text-slate-400 text-[11px] block mb-1">
                              Varian Paket ({prod.variant_types.length} jenis):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {prod.variant_types.map((vt, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                                >
                                  {vt.name} ({(vt.options || vt.product_variant_options || []).length} opsi)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Toggle & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold text-[11px]">Status Tayang:</span>
                            <Switch
                              checked={prod.is_active}
                              onCheckedChange={() => handleToggleActive(prod)}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProduct(prod);
                                setDialogOpen(true);
                              }}
                              className="h-8 gap-1 text-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteId(prod.id)}
                              className="h-8 gap-1 text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (10 desktop, 5 mobile) */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingProduct}
        productTypes={productTypes}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini permanen. Produk yang dihapus tidak akan lagi muncul di katalog toko frontend.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
