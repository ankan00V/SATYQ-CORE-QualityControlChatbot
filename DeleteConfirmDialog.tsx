
import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#09090b] border border-red-200 dark:border-red-900/30 rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/20 bg-red-50 dark:bg-red-950/10 flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-red-900 dark:text-red-50 tracking-wide uppercase">Confirm Deletion</h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Are you sure you want to purge this record from the active session?
          </p>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-md">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              WARNING: ACTION CANNOT BE UNDONE.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#020203] flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow"
          >
            <Trash2 className="w-3 h-3" />
            Purge Record
          </button>
        </div>
      </div>
    </div>
  );
};
