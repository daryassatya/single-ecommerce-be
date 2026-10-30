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
import { IconPicker } from '@/components/ui/IconPicker';
import { SocialMediaLink, SocialMediaLinkInput } from '@/types/database';

interface SocialLinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SocialMediaLink | null;
  onSubmit: (input: SocialMediaLinkInput) => Promise<void>;
  isLoading: boolean;
}

export function SocialLinkFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: SocialLinkFormDialogProps) {
  const [platform, setPlatform] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('Share2');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setPlatform(initialData.platform);
      setTitle(initialData.title);
      setUrl(initialData.url);
      setIconName(initialData.icon_name || 'Share2');
      setSortOrder(initialData.sort_order);
      setIsActive(initialData.is_active);
    } else {
      setPlatform('');
      setTitle('');
      setUrl('');
      setIconName('Share2');
      setSortOrder(0);
      setIsActive(true);
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!platform.trim()) errs.platform = 'Nama platform wajib diisi';
    if (!title.trim()) errs.title = 'Judul tampilan link wajib diisi';
    if (!url.trim()) errs.url = 'URL link wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      platform: platform.trim(),
      title: title.trim(),
      url: url.trim(),
      icon_name: iconName.trim(),
      sort_order: Number(sortOrder),
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Ubah Social Media Link' : 'Tambah Social Media Link'}</DialogTitle>
            <DialogDescription>
              Kelola tautan media sosial toko dengan ikon Lucide dan urutan tampil.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Platform <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: WhatsApp, Discord, X"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {errors.platform && <p className="mt-1 text-xs text-rose-500">{errors.platform}</p>}
              </div>

              <div>
                <IconPicker
                  label="Ikon Lucide"
                  value={iconName}
                  onChange={setIconName}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Judul Tampilan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: WhatsApp Channel, Komunitas Mabar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Target URL Link <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {errors.url && <p className="mt-1 text-xs text-rose-500">{errors.url}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Nomor Urutan Tampil (Sort Order)</label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Status Aktif</p>
                <p className="text-xs text-slate-500">Tampilkan link ini di beranda etalase toko</p>
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
              {initialData ? 'Simpan Perubahan' : 'Tambah Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
