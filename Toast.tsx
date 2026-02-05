import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  let bg = 'bg-[#1e293b]/90 border-slate-700';
  let icon = <Info className="w-4 h-4 text-sky-400" />;

  if (toast.type === 'success') {
    bg = 'bg-[#064e3b]/90 border-emerald-500/50';
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  } else if (toast.type === 'error') {
    bg = 'bg-[#450a0a]/90 border-red-500/50';
    icon = <AlertCircle className="w-4 h-4 text-red-400" />;
  }

  return (
    <div className={`w-80 p-4 rounded-lg border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-fade-in-up pointer-events-auto transition-all ${bg}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">{toast.title}</h4>
        <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="text-white/50 hover:text-white transition-colors">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
