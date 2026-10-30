import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startIndex = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with max 5 pills
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl',
        className
      )}
    >
      {/* Information label */}
      <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
        Menampilkan{' '}
        <span className="font-bold text-slate-800">
          {startIndex}-{endIndex}
        </span>{' '}
        dari <span className="font-bold text-slate-800">{totalItems}</span> data
        <span className="text-[11px] text-slate-400 ml-1.5 hidden sm:inline">
          ({pageSize} per halaman)
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1 select-none">
        {/* First page (desktop) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Halaman pertama"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Prev page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 items-center gap-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
          title="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={'ellipsis-' + idx} className="px-1.5 text-xs text-slate-400">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all shadow-2xs',
                  isActive
                    ? 'bg-brand-600 text-white shadow-brand-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 items-center gap-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
          title="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page (desktop) */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Halaman terakhir"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Custom hook to manage responsive pagination:
 * 10 rows on desktop/tablet, 5 rows on mobile.
 */
export function useResponsivePagination<T>(
  items: T[],
  desktopPageSize: number = 10,
  mobilePageSize: number = 5
) {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageSize = isMobile ? mobilePageSize : desktopPageSize;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Auto-clamp currentPage if items decrease
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Reset to page 1 if items length changes drastically (e.g. searching)
  const prevItemsLengthRef = React.useRef(items.length);
  React.useEffect(() => {
    if (prevItemsLengthRef.current !== items.length) {
      setCurrentPage(1);
      prevItemsLengthRef.current = items.length;
    }
  }, [items.length]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = React.useMemo(() => {
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, startIndex, pageSize]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    isMobile,
  };
}
