import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
          // Sizes
          size === 'sm' && 'h-9 px-3 text-xs gap-1.5',
          size === 'md' && 'h-10 px-4 text-sm gap-2',
          size === 'lg' && 'h-12 px-6 text-base gap-2.5',
          // Variants
          variant === 'primary' && 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500',
          variant === 'secondary' && 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
          variant === 'outline' && 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 focus:ring-brand-500',
          variant === 'danger' && 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
          variant === 'ghost' && 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
