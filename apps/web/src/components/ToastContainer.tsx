import { useToastStore } from '../stores/toastStore';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-apple-green" />,
  info: <Info className="w-5 h-5 text-apple-blue" />,
  warning: <AlertTriangle className="w-5 h-5 text-apple-orange" />,
  error: <AlertCircle className="w-5 h-5 text-apple-red" />,
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50 pointer-events-none max-w-sm w-[90vw] sm:w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto material-thick rounded-2xl px-4 py-3 flex items-start gap-3 shadow-apple-lg animate-slide-up"
        >
          <div className="shrink-0 mt-0.5">{ICONS[toast.type]}</div>
          <div className="flex-1 text-[13px] font-medium leading-snug text-foreground">
            {toast.message}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
