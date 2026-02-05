
import React from 'react';
import { X, Terminal } from 'lucide-react';
import { Message } from '../types';

interface LogViewerProps {
  message: Message | null;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white dark:bg-[#09090b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#050507]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">SYS_LOG_TRACE // ID: {message.id}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50 dark:bg-[#020203]">
          <pre className="text-xs font-mono text-emerald-700 dark:text-emerald-500/80 leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
            {JSON.stringify(message, null, 2)}
          </pre>
        </div>
        
        {/* Footer */}
         <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#050507] text-[10px] text-slate-500 font-mono flex justify-between uppercase">
            <span>TIMESTAMP: {new Date(message.timestamp).toISOString()}</span>
            <span>PAYLOAD_SIZE: {new TextEncoder().encode(JSON.stringify(message)).length} BYTES</span>
         </div>
      </div>
    </div>
  );
};
