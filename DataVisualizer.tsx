
import React, { useState } from 'react';
import { X, BarChart3, Activity, Play, FileJson, PieChart, TrendingUp, LayoutTemplate, Sparkles, Hexagon } from 'lucide-react';

interface DataVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: string, chartType: string) => void;
}

const SAMPLE_DATA = `08:00 - 45°C
09:00 - 48°C
10:00 - 65°C
11:00 - 92°C
12:00 - 145°C (CRITICAL)`;

type ChartType = 'auto' | 'line' | 'bar' | 'pie' | 'area' | 'radar';

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ isOpen, onClose, onGenerate }) => {
  const [inputData, setInputData] = useState('');
  const [selectedType, setSelectedType] = useState<ChartType>('auto');

  if (!isOpen) return null;

  const chartOptions: { id: ChartType; label: string; icon: any; desc: string }[] = [
    { 
        id: 'bar', 
        label: 'Bar Chart', 
        icon: BarChart3, 
        desc: 'Best for categorical comparisons.' 
    },
    { 
        id: 'line', 
        label: 'Line Chart', 
        icon: TrendingUp, 
        desc: 'Best for trends over time.' 
    },
    { 
        id: 'area', 
        label: 'Area Chart', 
        icon: Activity, 
        desc: 'Best for volume trends.' 
    },
    { 
        id: 'pie', 
        label: 'Pie Chart', 
        icon: PieChart, 
        desc: 'Best for proportional distribution.' 
    },
    { 
        id: 'radar', 
        label: 'Radar Chart', 
        icon: Hexagon, 
        desc: 'Best for multi-variable comparison.' 
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#050507]">
          <div>
              <h2 className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Holographic Data Visualizer
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                 Inject raw telemetry to generate visual models.
              </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
             {/* Data Input */}
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 font-mono flex items-center justify-between">
                    <span>INPUT_DATA_STREAM</span>
                    <button 
                        onClick={() => setInputData(SAMPLE_DATA)}
                        className="text-[10px] text-fuchsia-600 dark:text-fuchsia-500 hover:text-fuchsia-500 dark:hover:text-fuchsia-400 uppercase cursor-pointer"
                    >
                        Load Sample Telemetry
                    </button>
                </label>
                <textarea 
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md p-4 text-slate-800 dark:text-slate-300 font-mono text-xs focus:ring-1 focus:ring-fuchsia-500 outline-none leading-relaxed resize-none scrollbar-thin"
                  placeholder="Paste raw CSV, JSON, or log data here..."
                />
             </div>
             
             {/* Chart Type Selector */}
             <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 font-mono">
                    VISUALIZATION_TOPOLOGY
                </label>
                
                {/* AI Auto-Detect Main Option */}
                <button
                    onClick={() => setSelectedType('auto')}
                    className={`w-full mb-3 p-4 rounded-lg border text-left transition-all relative overflow-hidden group flex items-start gap-4 ${
                        selectedType === 'auto' 
                        ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-500 ring-1 ring-fuchsia-500/50' 
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/50'
                    }`}
                >
                     <div className={`p-2 rounded-full ${selectedType === 'auto' ? 'bg-fuchsia-100 dark:bg-fuchsia-500/20' : 'bg-slate-100 dark:bg-slate-900'}`}>
                        <Sparkles className={`w-5 h-5 ${selectedType === 'auto' ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-slate-400'}`} />
                     </div>
                     <div>
                        <span className={`text-sm font-bold flex items-center gap-2 ${selectedType === 'auto' ? 'text-fuchsia-700 dark:text-fuchsia-300' : 'text-slate-700 dark:text-slate-300'}`}>
                            AI Auto-Analysis
                            {selectedType === 'auto' && <span className="text-[10px] px-1.5 py-0.5 bg-fuchsia-200 dark:bg-fuchsia-500/30 text-fuchsia-800 dark:text-fuchsia-200 rounded-full">RECOMMENDED</span>}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Let the Neural Engine analyze your data topology and automatically select the optimal visualization format based on variables and relationships.
                        </p>
                     </div>
                </button>

                {/* Manual Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {chartOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setSelectedType(opt.id)}
                            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                                selectedType === opt.id 
                                ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-500 ring-1 ring-fuchsia-500/50' 
                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-500/50'
                            }`}
                        >
                             {selectedType === opt.id && (
                                <div className="absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 bg-fuchsia-500 rotate-45"></div>
                             )}
                             <div className="flex items-center gap-2 mb-1.5">
                                <opt.icon className={`w-4 h-4 ${selectedType === opt.id ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-slate-400'}`} />
                                <span className={`text-xs font-bold ${selectedType === opt.id ? 'text-fuchsia-700 dark:text-fuchsia-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {opt.label}
                                </span>
                             </div>
                             <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-tight">
                                {opt.desc}
                             </p>
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-200 dark:border-fuchsia-500/20 rounded-md p-3">
                 <div className="flex items-start gap-3">
                     <FileJson className="w-4 h-4 text-fuchsia-500 dark:text-fuchsia-400 mt-0.5" />
                     <div className="text-xs text-fuchsia-800 dark:text-fuchsia-200/80 leading-relaxed">
                         {selectedType === 'auto' 
                            ? "AI will classify input variables to select the most effective visualization format (e.g., Radar for multi-metric, Line for temporal)."
                            : `System will force render data as a ${selectedType.toUpperCase()} chart. Ensure data structure is compatible.`}
                     </div>
                 </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#050507] flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
                Abort
            </button>
            <button 
                onClick={() => {
                    if (inputData.trim()) {
                        onGenerate(inputData, selectedType);
                        onClose();
                        setInputData('');
                        setSelectedType('auto');
                    }
                }}
                disabled={!inputData.trim()}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md flex items-center gap-2 transition-all shadow-lg shadow-fuchsia-900/20 text-xs font-bold uppercase tracking-wider"
            >
                <BarChart3 className="w-4 h-4" />
                Render Visualization
            </button>
        </div>
      </div>
    </div>
  );
};
