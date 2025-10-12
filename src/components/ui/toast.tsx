import React, { createContext, useContext, useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto remove after duration (default 5s)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIconAndColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          descColor: 'text-green-700',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          descColor: 'text-red-700',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          descColor: 'text-yellow-700',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          descColor: 'text-blue-700',
        };
    }
  };

  const { icon: Icon, bgColor, iconColor, titleColor, descColor } = getIconAndColors();

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out max-w-sm w-full
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${bgColor}`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${titleColor}`}>
              {toast.title}
            </h4>
            {toast.description && (
              <p className={`text-sm mt-1 ${descColor}`}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors
              ${iconColor}
            `}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for easy toast creation
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToast();
    addToast({ type: 'success', title, description, duration });
  },
  error: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToast();
    addToast({ type: 'error', title, description, duration });
  },
  info: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToast();
    addToast({ type: 'info', title, description, duration });
  },
  warning: (title: string, description?: string, duration?: number) => {
    const { addToast } = useToast();
    addToast({ type: 'warning', title, description, duration });
  },
};