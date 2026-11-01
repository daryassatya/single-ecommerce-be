import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/AlertDialog';
import { ShieldAlert, Sparkles, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface DisplayModeContextType {
  isDisplayMode: boolean;
  triggerDisplayNotice: (actionName?: string) => void;
}

const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined);

// Event listener name for service-layer triggers
export const DISPLAY_MODE_EVENT = 'single_ecommerce_display_mode_attempt';

export function triggerGlobalDisplayNotice(actionName?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(DISPLAY_MODE_EVENT, { detail: { actionName } })
    );
  }
}

export function DisplayModeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const { toast } = useToast();

  const triggerDisplayNotice = (actionName?: string) => {
    setCurrentAction(actionName || null);
    setIsOpen(true);
    toast({
      title: 'Mode Display Showcase ✦',
      description: 'Fitur Create, Update, dan Delete dinonaktifkan pada dashboard demo ini.',
      variant: 'info',
    });
  };

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ actionName?: string }>;
      triggerDisplayNotice(customEvent.detail?.actionName);
    };

    window.addEventListener(DISPLAY_MODE_EVENT, handleEvent);
    return () => {
      window.removeEventListener(DISPLAY_MODE_EVENT, handleEvent);
    };
  }, []);

  return (
    <DisplayModeContext.Provider value={{ isDisplayMode: true, triggerDisplayNotice }}>
      {children}

      {/* Global Display Notice Modal */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-md border-amber-200/80 p-6 sm:p-7 rounded-3xl shadow-2xl bg-white">
          <div className="flex flex-col items-center text-center">
            {/* Header Icon */}
            <div className="h-16 w-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-4 shadow-sm ring-4 ring-amber-500/5">
              <ShieldAlert className="h-8 w-8" />
            </div>

            {/* Showcase Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-[11px] font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Mode Display Showcase</span>
            </div>

            {/* Title */}
            <AlertDialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              Aksi Dibatasi (Read-Only)
            </AlertDialogTitle>

            {/* Description */}
            <AlertDialogDescription className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Dashboard ini berfungsi sebagai <strong>live display &amp; portofolio demo</strong> produk Single Page E-Commerce.
            </AlertDialogDescription>

            {/* Action Details Box */}
            <div className="w-full my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="text-amber-600 font-bold shrink-0 mt-0.5">⚠️</span>
                <span>
                  {currentAction ? (
                    <>Tindakan <strong>&ldquo;{currentAction}&rdquo;</strong> tidak dapat diproses.</>
                  ) : (
                    <>Aksi <strong>Create, Update, dan Delete</strong> dinonaktifkan.</>
                  )}{' '}
                  Hal ini dilakukan untuk menjaga integritas dan kestabilan data display showcase.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">👁️</span>
                <span>
                  Anda tetap dapat menjelajahi seluruh modul navigasi, melihat pratinjau katalog produk, ikon Lucide, serta konfigurasi toko secara bebas.
                </span>
              </div>
            </div>

            {/* Action Button */}
            <AlertDialogFooter className="w-full sm:justify-center border-none pt-0 mt-0">
              <AlertDialogAction
                onClick={() => setIsOpen(false)}
                className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Saya Mengerti &amp; Lanjutkan Eksplorasi</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext);
  if (!context) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider');
  }
  return context;
}
