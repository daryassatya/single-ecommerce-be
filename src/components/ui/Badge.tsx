import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'slate' | 'warning' | 'danger';
}

export function Badge({ className, variant = 'slate', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variant === 'brand' && 'bg-brand-50 text-brand-700 border border-brand-200/60',
        variant === 'success' && 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        variant === 'slate' && 'bg-slate-100 text-slate-700 border border-slate-200/60',
        variant === 'warning' && 'bg-amber-50 text-amber-700 border border-amber-200/60',
        variant === 'danger' && 'bg-rose-50 text-rose-700 border border-rose-200/60',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
