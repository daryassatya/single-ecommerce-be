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
import { Plus, Search, Edit2, Trash2, Package, RefreshCw, Filter } from 'lucide-react';

export function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-brand-600" />
            Manajemen Produk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Katalog produk berbasis <strong>Lucide Icons</strong> (tanpa file upload foto) dengan harga dan varian.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={loadData}
            disabled={loading}
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama produk, badge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:border-brand-500 focus:outline-none"
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

        <div className="text-xs font-medium text-slate-500">
          Total: <span className="font-semibold text-slate-800">{filteredProducts.length}</span> Produk
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    Memuat data produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
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
                      {formatRupiah(prod.price)}
                    </td>

                    {/* Varian */}
                    <td className="px-6 py-4 max-w-xs">
                      {prod.variants && prod.variants.length > 0 ? (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingProduct}
        productTypes={productTypes}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk ini dari katalog toko? Data yang telah dihapus tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={deleting}>
                Batal
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
                Ya, Hapus
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
