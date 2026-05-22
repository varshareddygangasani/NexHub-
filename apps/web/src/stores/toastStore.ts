import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => {
  return {
    toasts: [],
    
    showToast: (message, type = 'success') => {
      const id = `toast-${Date.now()}`;
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }]
      }));
      
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, 3000);
    },
    
    dismissToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }
  };
});
