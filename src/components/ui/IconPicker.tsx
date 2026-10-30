import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { POPULAR_ICONS, DynamicIcon } from '@/lib/icons';
import { Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  className?: string;
}

export function IconPicker({ value, onChange, label, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredIcons = useMemo(() => {
    return POPULAR_ICONS.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase().trim());
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-left"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 border border-brand-200/60">
                <DynamicIcon name={value || 'Package'} className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-800">{value || 'Pilih Ikon'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama ikon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                autoFocus
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'commerce', label: 'Toko' },
                { id: 'gaming', label: 'Game' },
                { id: 'media', label: 'Media' },
                { id: 'social', label: 'Sosial' },
                { id: 'general', label: 'Umum' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors',
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            <div className="max-h-56 overflow-y-auto pr-1">
              {filteredIcons.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ada ikon yang cocok dengan "{search}"
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {filteredIcons.map((icon) => {
                    const isSelected = value?.toLowerCase() === icon.name.toLowerCase();
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => {
                          onChange(icon.name);
                          setOpen(false);
                        }}
                        title={icon.name}
                        className={cn(
                          'relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all text-center group border',
                          isSelected
                            ? 'bg-brand-50 border-brand-500 text-brand-600 ring-1 ring-brand-500'
                            : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                        )}
                      >
                        <DynamicIcon
                          name={icon.name}
                          className={cn(
                            'h-5 w-5 mb-1 transition-transform group-hover:scale-110',
                            isSelected ? 'text-brand-600' : 'text-slate-600'
                          )}
                        />
                        <span className="text-[10px] font-medium leading-tight truncate w-full">
                          {icon.name}
                        </span>

                        {isSelected && (
                          <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-brand-600 flex items-center justify-center text-white">
                            <Check className="h-2 w-2" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
