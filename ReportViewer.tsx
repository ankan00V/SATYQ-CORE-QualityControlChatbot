
import React from 'react';
import { X, FileText, Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface ReportViewerProps {
  message: Message | null;
  onClose: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ message, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!message) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white dark:bg-[#09090b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#050507]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent rounded-md">
                <FileText className="w-5 h-5 text-sky-600 dark:text-sky-500" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide uppercase">Raw Output Stream</h3>
                <span className="text-xs font-mono text-slate-500">ID: {message.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md transition-colors border border-slate-200 dark:border-slate-700"
            >
                {copied ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'COPIED' : 'COPY RAW'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-slate-50 dark:bg-[#020203]">
          <div className="font-mono text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {message.text}
          </div>
        </div>
        
        {/* Footer */}
         <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#050507] text-[10px] text-slate-500 font-mono flex justify-between uppercase">
            <span>CHARACTERS: {message.text.length}</span>
            <span>FORMAT: MARKDOWN/TEXT</span>
         </div>
      </div>
    </div>
  );
};
