import React, { createContext, useContext, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = ({ title, description, variant = 'success' }: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, title, description, variant }]);
  };

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {messages.map((m) => (
          <ToastPrimitive.Root
            key={m.id}
            onOpenChange={(open) => !open && removeToast(m.id)}
            duration={4000}
            className={cn(
              'group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl p-4 shadow-xl border transition-all',
              'data-[state=open]:animate-slideIn data-[state=closed]:animate-hide',
              m.variant === 'success' && 'bg-white border-emerald-200 text-slate-800',
              m.variant === 'error' && 'bg-white border-rose-200 text-slate-800',
              m.variant === 'info' && 'bg-white border-sky-200 text-slate-800'
            )}
          >
            {m.variant === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {m.variant === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            {m.variant === 'info' && <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-semibold text-slate-900">
                {m.title}
              </ToastPrimitive.Title>
              {m.description && (
                <ToastPrimitive.Description className="mt-1 text-xs text-slate-600 line-clamp-2">
                  {m.description}
                </ToastPrimitive.Description>
              )}
            </div>

            <ToastPrimitive.Close className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-4 right-4 z-[9999] flex max-h-screen w-full max-w-sm flex-col-reverse gap-2 pointer-events-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
