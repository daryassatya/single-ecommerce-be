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
import { DebouncedSearchInput } from '@/components/ui/DebouncedSearchInput';
import { Pagination, useResponsivePagination } from '@/components/ui/Pagination';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function ProductTypesModule() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Accordion state for mobile view
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Responsive pagination (10 on desktop, 5 on mobile)
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(filteredTypes, 10, 5);

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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-600" />
            <span>Tipe Produk & Kategori</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola pengelompokan kategori produk untuk etalase toko Cia Store.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            title="Refresh Data"
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingType(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </Button>
        </div>
      </div>

      {/* Filter and Debounced Search Bar (800ms) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm border border-slate-200/80">
        <div className="flex-1 max-w-full sm:max-w-md">
          <DebouncedSearchInput
            placeholder="Cari nama kategori atau slug... (delay 800ms)"
            delay={800}
            onDebouncedChange={setSearch}
          />
        </div>

        <div className="text-xs font-medium text-slate-500 text-right sm:text-left">
          Total: <span className="font-semibold text-slate-800">{filteredTypes.length}</span> Kategori
        </div>
      </div>

      {/* Content Container: Desktop Table & Mobile Accordion */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            <span className="text-xs font-semibold">Memuat data kategori...</span>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Tidak ada kategori yang ditemukan.</p>
          </div>
        ) : (
          <>
            {/* 1. DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
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
                  {paginatedItems.map((type) => (
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE & TABLET ACCORDION VIEW */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedItems.map((type) => {
                const isExpanded = !!expandedRows[type.id];
                return (
                  <div key={type.id} className="p-3.5 transition-colors hover:bg-slate-50/50">
                    <div
                      onClick={() => toggleAccordion(type.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">{type.name}</p>
                        <code className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                          {type.slug}
                        </code>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={type.is_active ? 'success' : 'slate'} className="text-[10px] px-1.5 py-0.5">
                          {type.is_active ? 'Aktif' : 'Off'}
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

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs bg-slate-50/60 p-3 rounded-xl animate-in fade-in duration-200">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Deskripsi:</span>
                          <p className="text-slate-700 text-xs mt-0.5">
                            {type.description || 'Tidak ada deskripsi tambahan.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold text-[11px]">Status Kategori:</span>
                            <Switch
                              checked={type.is_active}
                              onCheckedChange={() => handleToggleActive(type)}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingType(type);
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
                              onClick={() => setDeleteId(type.id)}
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

            {/* Pagination */}
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

      {/* Form Dialog */}
      <ProductTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingType}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kategori produk akan dihapus dari database.
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
