import React from 'react';
import { AppMode, ChatSession } from './types';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  BrainCircuit,
  Globe,
  Image as ImageIcon,
  FileText,
  LogOut,
  ChevronRight,
  Plus,
  History,
  Trash2,
  Clock,
  BarChart3,
  Moon,
  Sun,
  Activity,
  X,
  Banknote
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  onSetMode: (mode: AppMode) => void;
  onOpenTemplates: () => void;
  onOpenVisualizer: () => void;
  onLogout: () => void;
  config: any;
  sessions: ChatSession[];
  onNewSession: () => void;
  onLoadSession: (session: ChatSession) => void;
  onDeleteSession: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSetMode,
  onOpenTemplates,
  onOpenVisualizer,
  onLogout,
  config,
  sessions,
  onNewSession,
  onLoadSession,
  onDeleteSession,
  theme,
  onToggleTheme,
  onClose
}) => {
  const modes = [
    { id: AppMode.STANDARD, icon: LayoutDashboard },
    { id: AppMode.DEEP_REASON, icon: BrainCircuit },
    { id: AppMode.DATA_ANALYSIS, icon: Activity },
    { id: AppMode.RESEARCH, icon: Globe },
    { id: AppMode.MARKET_VALUATION, icon: Banknote },
    { id: AppMode.IMAGE_EDIT, icon: ImageIcon }
  ];

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="w-64 bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-white/5 flex flex-col h-full shrink-0 z-20 shadow-2xl transition-colors duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#050507] justify-between group">
        <Logo size="sm" mode="full" className="dark:text-white text-slate-900" />
        <div className="flex items-center gap-2">
          <button
            onClick={onNewSession}
            className="p-1.5 bg-cyan-100 dark:bg-cyan-900/20 hover:bg-cyan-200 dark:hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 rounded-md"
            title="New Operation"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Mobile Close Button */}
          <button onClick={onClose} className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-6">
        {/* Modules Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Modules</div>
          {modes.map((mode) => {
            const isActive = currentMode === mode.id;
            const modeConfig = config?.[mode.id] ?? { color: 'cyan', title: mode.id };
            const color = modeConfig.color || 'cyan';

            const activeClass = `bg-${color}-50 dark:bg-${color}-950/20 text-${color}-600 dark:text-${color}-400 border border-${color}-200 dark:border-${color}-500/20 shadow-sm`;
            const inactiveClass = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent';

            const Icon = mode.icon;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSetMode(mode.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isActive ? activeClass : inactiveClass}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? `text-${color}-600 dark:text-${color}-400` : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                  <span className="text-sm font-medium">{modeConfig.title}</span>
                </div>
                {isActive && <ChevronRight className={`w-3 h-3 text-${color}-500`} />}
              </button>
            );
          })}
        </div>

        {/* Utilities Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Utilities</div>

          <button
            onClick={() => {
              onOpenTemplates();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white/90"
          >
            <FileText className="w-4 h-4 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            <span className="text-sm font-medium">Report Templates</span>
          </button>

          <button
            onClick={() => {
              onOpenVisualizer();
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white/90"
          >
            <BarChart3 className="w-4 h-4 group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400 transition-colors" />
            <span className="text-sm font-medium">Data Visualizer</span>
          </button>
        </div>

        {/* History Section */}
        {sessions && sessions.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
              <History className="w-3 h-3" />
              Mission Logs
            </div>
            <div className="space-y-0.5">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group relative w-full flex flex-col items-start px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent"
                  onClick={() => {
                    onLoadSession(session);
                    if (onClose) onClose();
                  }}
                >
                  <div className="w-full flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate pr-2 max-w-[140px] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {session.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-mono">{formatDate(session.timestamp)}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-600 truncate w-full mt-1 font-mono">{session.preview}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#050507]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" mode="icon" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 dark:text-white">Operator</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500">Level 4 Clearance</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              className="text-slate-500 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400 transition-colors p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-md">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
