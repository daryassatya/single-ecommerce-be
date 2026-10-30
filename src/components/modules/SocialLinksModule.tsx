import { useState, useEffect, useMemo } from 'react';
import { socialLinksService } from '@/services/socialLinksService';
import { SocialMediaLink, SocialMediaLinkInput } from '@/types/database';
import { SocialLinkFormDialog } from './SocialLinkFormDialog';
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
import { DebouncedSearchInput } from '@/components/ui/DebouncedSearchInput';
import { Pagination, useResponsivePagination } from '@/components/ui/Pagination';
import {
  Plus,
  Edit2,
  Trash2,
  Share2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function SocialLinksModule() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Accordion state for mobile view
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Alert Dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await socialLinksService.getAll();
      setLinks(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat social links';
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

  const filteredLinks = useMemo(() => {
    return links.filter(
      (l) =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.platform.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [links, search]);

  // Responsive pagination (10 on desktop, 5 on mobile)
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
  } = useResponsivePagination(filteredLinks, 10, 5);

  const handleCreateOrUpdate = async (input: SocialMediaLinkInput) => {
    try {
      setSubmitting(true);
      if (editingLink) {
        const updated = await socialLinksService.update(editingLink.id, input);
        setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        toast({
          title: 'Link Diperbarui',
          description: `Tautan "${input.title}" berhasil diupdate.`,
          variant: 'success',
        });
      } else {
        const created = await socialLinksService.create(input);
        setLinks((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
        toast({
          title: 'Link Ditambahkan',
          description: `Tautan "${input.title}" berhasil disimpan.`,
          variant: 'success',
        });
      }
      setDialogOpen(false);
      setEditingLink(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan link';
      toast({
        title: 'Gagal Menyimpan',
        description: errorMsg,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (link: SocialMediaLink) => {
    try {
      const updated = await socialLinksService.toggleActive(link.id, link.is_active);
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast({
        title: updated.is_active ? 'Link Diaktifkan' : 'Link Dinonaktifkan',
        description: `Status link "${link.title}" telah diubah.`,
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
      await socialLinksService.delete(deleteId);
      setLinks((prev) => prev.filter((l) => l.id !== deleteId));
      toast({
        title: 'Link Dihapus',
        description: 'Tautan media sosial telah dihapus.',
        variant: 'success',
      });
      setDeleteId(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus link';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-brand-600" />
            <span>Social Media & Quick Links</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola tautan sosial media, kontak WhatsApp, dan menu cepat pada frontend.
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
              setEditingLink(null);
              setDialogOpen(true);
            }}
            className="gap-1.5 shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Link</span>
          </Button>
        </div>
      </div>

      {/* Debounced Search Bar (800ms) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm border border-slate-200/80">
        <div className="flex-1 max-w-full sm:max-w-md">
          <DebouncedSearchInput
            placeholder="Cari judul link, platform, URL... (delay 800ms)"
            delay={800}
            onDebouncedChange={setSearch}
          />
        </div>

        <div className="text-xs font-medium text-slate-500 text-right sm:text-left">
          Total: <span className="font-semibold text-slate-800">{filteredLinks.length}</span> Tautan
        </div>
      </div>

      {/* Content Container: Desktop Table & Mobile Accordion */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
            <span className="text-xs font-semibold">Memuat daftar tautan...</span>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Share2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">Tidak ada tautan yang ditemukan.</p>
          </div>
        ) : (
          <>
            {/* 1. DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Ikon & Judul</th>
                    <th className="px-6 py-4">Platform</th>
                    <th className="px-6 py-4">Target URL</th>
                    <th className="px-6 py-4 text-center">Urutan</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.map((link) => (
                    <tr key={link.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Icon & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60">
                            <DynamicIcon name={link.icon_name || 'Share2'} className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{link.title}</div>
                            {link.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">{link.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400">
                                lucide:{link.icon_name}
                              </span>
                              {link.tab_target && (
                                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 rounded">
                                  Tab: {link.tab_target}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 capitalize">
                          {link.platform}
                        </span>
                      </td>

                      {/* Target URL */}
                      <td className="px-6 py-4 max-w-xs truncate">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline max-w-[200px] truncate"
                          title={link.url}
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </td>

                      {/* Sort order */}
                      <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                        {link.sort_order}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Switch
                            checked={link.is_active}
                            onCheckedChange={() => handleToggleActive(link)}
                          />
                          <Badge variant={link.is_active ? 'success' : 'slate'}>
                            {link.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLink(link);
                              setDialogOpen(true);
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                            title="Ubah Link"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(link.id)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Hapus Link"
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
              {paginatedItems.map((link) => {
                const isExpanded = !!expandedRows[link.id];
                return (
                  <div key={link.id} className="p-3.5 transition-colors hover:bg-slate-50/50">
                    <div
                      onClick={() => toggleAccordion(link.id)}
                      className="flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60 shadow-2xs">
                          <DynamicIcon name={link.icon_name || 'Share2'} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{link.title}</p>
                          <span className="text-[10px] text-slate-500 capitalize">{link.platform}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={link.is_active ? 'success' : 'slate'} className="text-[10px] px-1.5 py-0.5">
                          {link.is_active ? 'Aktif' : 'Off'}
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
                        {link.description && (
                          <div>
                            <span className="text-slate-400 text-[11px] block">Deskripsi:</span>
                            <p className="text-slate-700 text-xs mt-0.5">{link.description}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-slate-400 text-[11px] block">Target URL:</span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline break-all mt-0.5"
                          >
                            <span>{link.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold text-[11px]">Status Link:</span>
                            <Switch
                              checked={link.is_active}
                              onCheckedChange={() => handleToggleActive(link)}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingLink(link);
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
                              onClick={() => setDeleteId(link.id)}
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

            {/* Pagination Controls */}
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
      <SocialLinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingLink}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tautan Ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tautan media sosial akan dihapus dari sistem toko dan tidak akan muncul di website.
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
