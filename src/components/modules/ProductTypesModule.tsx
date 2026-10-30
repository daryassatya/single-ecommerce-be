import { useState, useEffect, useMemo } from 'react';
import { productTypesService } from '@/services/productTypesService';
import { ProductType, ProductTypeInput } from '@/types/database';
import { ProductTypeFormDialog } from './ProductTypeFormDialog';
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
import { Plus, Search, Edit2, Trash2, Layers, RefreshCw } from 'lucide-react';

export function ProductTypesModule() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await productTypesService.getAll();
      setTypes(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil data';
      toast({
        title: 'Gagal Memuat Kategori',
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

  const filteredTypes = useMemo(() => {
    return types.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [types, search]);

  const handleCreateOrUpdate = async (input: ProductTypeInput) => {
    try {
      setSubmitting(true);
      if (editingType) {
        const updated = await productTypesService.update(editingType.id, input);
        setTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast({
          title: 'Berhasil Diperbarui',
          description: `Kategori "${input.name}" berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await productTypesService.create(input);
        setTypes((prev) => [created, ...prev]);
        toast({
          title: 'Berhasil Ditambahkan',
          description: `Kategori "${input.name}" siap digunakan.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
      setEditingType(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan data';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (type: ProductType) => {
    try {
      const updated = await productTypesService.toggleActive(type.id, type.is_active);
      setTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast({
        title: updated.is_active ? 'Kategori Diaktifkan' : 'Kategori Dinonaktifkan',
        description: `Status kategori "${type.name}" telah diubah.`,
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
      await productTypesService.delete(deleteId);
      setTypes((prev) => prev.filter((t) => t.id !== deleteId));
      toast({
        title: 'Berhasil Dihapus',
        description: 'Kategori produk telah dihapus dari sistem.',
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-600" />
            Tipe Produk & Kategori
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola pengelompokan kategori produk untuk etalase toko Syafira Store.
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
              setEditingType(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kategori atau slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total: <span className="font-semibold text-slate-800">{filteredTypes.length}</span> Kategori
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Kategori</th>
                <th className="px-6 py-4">Slug URL</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    Memuat data kategori...
                  </td>
                </tr>
              ) : filteredTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada kategori yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{type.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                        {type.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <Switch
                          checked={type.is_active}
                          onCheckedChange={() => handleToggleActive(type)}
                        />
                        <Badge variant={type.is_active ? 'success' : 'slate'}>
                          {type.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingType(type);
                            setDialogOpen(true);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                          title="Ubah Kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(type.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Hapus Kategori"
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
      <ProductTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingType}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tipe Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Seluruh produk yang terkait dengan kategori ini akan diputus relasinya. Tindakan ini tidak dapat dibatalkan.
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
