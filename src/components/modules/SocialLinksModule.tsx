import { useState, useEffect } from 'react';
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
import { Plus, Edit2, Trash2, Share2, RefreshCw, ExternalLink } from 'lucide-react';

export function SocialLinksModule() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-brand-600" />
            Pengaturan Social Media Links
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola tautan WhatsApp, Discord, Telegram, dan media sosial toko beserta ikon Lucide.
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
              setEditingLink(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambah Link
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    Memuat daftar tautan...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada social media link yang ditambahkan.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
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
                      <Badge variant="brand">{link.platform}</Badge>
                    </td>

                    {/* URL */}
                    <td className="px-6 py-4 max-w-xs truncate">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline max-w-[220px] truncate"
                      >
                        {link.url}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* Sort Order */}
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        #{link.sort_order}
                      </span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      <SocialLinkFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingLink}
        onSubmit={handleCreateOrUpdate}
        isLoading={submitting}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Social Media Link?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tautan media sosial ini? Tindakan ini tidak dapat dibatalkan.
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
