
import React from 'react';
import { AppMode } from '../types';
import { LayoutDashboard, BrainCircuit, Globe, Image as ImageIcon, ArrowRight, Zap, Activity } from 'lucide-react';

interface ModeIntroProps {
  mode: AppMode;
  config: any;
  onQuickAction: (text: string) => void;
}

export const ModeIntro: React.FC<ModeIntroProps> = ({ mode, config, onQuickAction }) => {
  const getIcon = () => {
    switch (mode) {
      case AppMode.STANDARD: return <LayoutDashboard className="w-6 h-6 md:w-12 md:h-12" />;
      case AppMode.DEEP_REASON: return <BrainCircuit className="w-6 h-6 md:w-12 md:h-12" />;
      case AppMode.RESEARCH: return <Globe className="w-6 h-6 md:w-12 md:h-12" />;
      case AppMode.IMAGE_EDIT: return <ImageIcon className="w-6 h-6 md:w-12 md:h-12" />;
      case AppMode.DATA_ANALYSIS: return <Activity className="w-6 h-6 md:w-12 md:h-12" />;
      default: return <LayoutDashboard className="w-6 h-6 md:w-12 md:h-12" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-2 md:p-8 animate-in fade-in zoom-in-95 duration-500 w-full">
      <div className={`p-4 md:p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-${config.color}-200 dark:border-${config.color}-500/30 shadow-lg dark:shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] max-w-2xl w-full backdrop-blur-sm`}>
        
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-6 mb-3 md:mb-8">
          <div className={`p-2.5 md:p-4 rounded-xl bg-${config.color}-100 dark:bg-${config.color}-500/10 border border-${config.color}-200 dark:border-${config.color}-500/20 text-${config.color}-600 dark:text-${config.color}-400 shrink-0`}>
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-0.5 md:mb-1 truncate leading-tight">
              {config.title}
            </h1>
            <div className={`text-[10px] md:text-xs font-mono text-${config.color}-600 dark:text-${config.color}-400 tracking-widest uppercase truncate`}>
              Module Online • {config.modelName}
            </div>
          </div>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-3 md:mb-8">
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-500 dark:text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Core Directive
            </h3>
            <p className="text-slate-700 dark:text-slate-200 text-[10px] md:text-sm leading-relaxed">
              {config.desc}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3 md:p-4 rounded-lg border border-slate-200 dark:border-slate-800">
             <h3 className="text-slate-500 dark:text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" /> Expected Output
            </h3>
            <p className="text-slate-700 dark:text-slate-200 text-[10px] md:text-sm leading-relaxed">
              {config.output}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-slate-500 dark:text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3">
            Initialize Workflow
          </h3>
          <div className="grid grid-cols-1 gap-1.5 md:gap-2">
            {config.examples.map((ex: string, i: number) => (
              <button
                key={i}
                onClick={() => onQuickAction(ex)}
                className={`text-left px-3 py-2 md:px-4 md:py-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-${config.color}-400 hover:dark:border-${config.color}-500/50 hover:bg-${config.color}-50 dark:hover:bg-${config.color}-950/20 transition-all text-xs md:text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group shadow-sm flex items-start`}
              >
                <span className={`text-${config.color}-600 dark:text-${config.color}-500 mr-2 opacity-50 group-hover:opacity-100 shrink-0 mt-0.5`}>//</span>
                <span className="break-words leading-relaxed line-clamp-2 md:line-clamp-none">{ex}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
