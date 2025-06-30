import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-center p-4 rounded-lg border shadow-lg backdrop-blur-sm ${colors[toast.type]} animate-in slide-in-from-right-full duration-300`}
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Simple toast implementation for this example
let toastId = 0;
const activeToasts = new Set();

export const showToast = (type: ToastType, message: string) => {
  const id = `toast-${++toastId}`;
  
  if (activeToasts.has(message)) return;
  activeToasts.add(message);

  const toastDiv = document.createElement('div');
  toastDiv.id = id;
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  toastDiv.className = `fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border shadow-lg backdrop-blur-sm ${colors[type]} animate-in slide-in-from-right-full duration-300`;
  
  toastDiv.innerHTML = `
    <span class="mr-3 text-lg">${icons[type]}</span>
    <span class="text-sm font-medium flex-1">${message}</span>
    <button class="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors" onclick="this.parentElement.remove(); activeToasts.delete('${message}')">
      <span class="text-lg">×</span>
    </button>
  `;

  document.body.appendChild(toastDiv);

  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
      activeToasts.delete(message);
    }
  }, 5000);
};

export const Toaster: React.FC = () => {
  return null; // We're using the vanilla JS implementation above
};