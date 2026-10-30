import { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebouncedSearchInputProps {
  value?: string;
  onDebouncedChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
  autoFocus?: boolean;
}

export function DebouncedSearchInput({
  value = '',
  onDebouncedChange,
  placeholder = 'Cari data...',
  delay = 800,
  className,
  autoFocus = false,
}: DebouncedSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Sync internal state if parent resets value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    // If search term hasn't changed from prop, don't trigger
    if (searchTerm === value) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      onDebouncedChange(searchTerm);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay, onDebouncedChange, value]);

  const handleClear = () => {
    setSearchTerm('');
    onDebouncedChange('');
    setIsDebouncing(false);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        autoFocus={autoFocus}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-2xs"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isDebouncing ? (
          <span className="flex items-center gap-1 text-[10px] text-brand-600 font-semibold animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" />
            <span className="hidden sm:inline">800ms</span>
          </span>
        ) : searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
