
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Brush, AreaChart, Area, PieChart, Pie, Cell, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Bot, ExternalLink, Activity, Info, Database, Terminal, CheckCircle2, FileText, Trash2, ScanEye, Settings2, X, Palette, Grid, Type, LayoutTemplate, BarChart3, MoveHorizontal, Download, Image as ImageIcon, FileCode, Hexagon } from 'lucide-react';

interface BotMessageProps {
  message: Message;
  hasImageContext?: boolean;
  onViewLogs: (msg: Message) => void;
  onViewReport: (msg: Message) => void;
  onArchive: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onVisualRecon?: (msg: Message) => void;
  onVisualize?: (msg: Message) => void;
  theme?: 'dark' | 'light';
  isLatest?: boolean;
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-700 p-3 shadow-2xl backdrop-blur-md rounded-md min-w-[120px]">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono mb-1.5 uppercase tracking-wider">{label || payload[0].name}</p>
        <div className="flex items-center justify-between gap-4">
             <span className="text-xs font-mono text-slate-500 dark:text-slate-300">VALUE:</span>
             <p className="text-slate-800 dark:text-white font-bold text-sm font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: payload[0].color || payload[0].payload.fill, color: payload[0].color || payload[0].payload.fill }}></span>
                {payload[0].value}
            </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- Theme Definitions ---
const CHART_THEMES: Record<string, { label: string; color: string; lineType: any; showGrid: boolean; }> = {
  INDUSTRIAL: { label: 'Industrial', color: '#06b6d4', lineType: 'step', showGrid: true },
  NEON: { label: 'Neon', color: '#d946ef', lineType: 'monotone', showGrid: false },
  WARNING: { label: 'Warning', color: '#f59e0b', lineType: 'linear', showGrid: true },
  ECO: { label: 'Eco', color: '#10b981', lineType: 'monotone', showGrid: false },
  CRITICAL: { label: 'Critical', color: '#ef4444', lineType: 'stepAfter', showGrid: true },
  MINIMALIST: { label: 'Minimalist', color: '#94a3b8', lineType: 'monotone', showGrid: false },
  HIGH_CONTRAST: { label: 'High Contrast', color: '#f97316', lineType: 'linear', showGrid: true },
  BLUEPRINT: { label: 'Blueprint', color: '#3b82f6', lineType: 'step', showGrid: true },
};

const COLOR_PALETTE = ['#06b6d4', '#38bdf8', '#818cf8', '#d946ef', '#f43f5e', '#f59e0b', '#10b981', '#94a3b8', '#f97316', '#3b82f6'];

export const BotMessage: React.FC<BotMessageProps> = ({ message, hasImageContext, onViewLogs, onViewReport, onArchive, onDelete, onVisualRecon, onVisualize, theme = 'dark', isLatest = false }) => {
  const [isArchived, setIsArchived] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Chart Customization State
  const [chartSettings, setChartSettings] = useState({
    color: '#06b6d4',
    lineType: 'step' as 'step' | 'monotone' | 'linear' | 'stepAfter',
    showGrid: true,
    fontSize: 10,
    enableZoom: false
  });

  // Initialize from message config
  useEffect(() => {
    if (message.chartConfig) {
      setChartSettings(prev => ({
        ...prev,
        color: message.chartConfig!.color || '#06b6d4'
      }));
    }
  }, [message.chartConfig]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('knowledge_base');
      if (stored) {
        const archive = JSON.parse(stored);
        if (Array.isArray(archive) && archive.some((m: any) => m.id === message.id)) {
          setIsArchived(true);
        }
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, [message.id]);

  const handleArchiveClick = () => {
    if (!isArchived) {
      onArchive(message);
      setIsArchived(true);
    }
  };

  const applyTheme = (themeKey: string) => {
    const theme = CHART_THEMES[themeKey];
    setChartSettings(prev => ({
      ...prev,
      color: theme.color,
      lineType: theme.lineType,
      showGrid: theme.showGrid
    }));
  };

  const handleExport = (format: 'png' | 'svg') => {
    if (!chartContainerRef.current) return;
    const svg = chartContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Get exact dimensions from the rendered SVG
    const { width, height } = svg.getBoundingClientRect();
    
    // Clone to manipulate for export without affecting display
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('width', width.toString());
    clone.setAttribute('height', height.toString());

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(clone);

    const filename = (message.chartConfig?.title || 'chart').toLowerCase().replace(/\s+/g, '-');

    if (format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill background based on current theme, as SVG background is transparent
      ctx.fillStyle = theme === 'dark' ? '#0b1120' : '#f8fafc'; 
      ctx.fillRect(0, 0, width, height);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${filename}.png`;
        link.click();
      };
      
      // Handle special characters in SVG string for data URI
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base md:text-lg font-bold text-sky-600 dark:text-sky-400 mt-6 mb-3 font-mono uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-4 mb-2 font-mono">{line.replace('### ', '')}</h4>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-slate-900 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ')) {
        return <li key={idx} className="ml-4 text-slate-600 dark:text-slate-300 pl-2 mb-1 border-l-2 border-slate-300 dark:border-slate-700">{formattedLine}</li>;
      }
      if (line.trim().match(/^\d+\. /)) {
        return <div key={idx} className="ml-4 text-slate-600 dark:text-slate-300 mb-2 font-mono text-sm">
            <span className="text-sky-500 mr-2">[{line.split('.')[0]}]</span>
            <span>{line.replace(/^\d+\. /, '')}</span>
        </div>;
      }

      if (line.trim() === '') return <div key={idx} className="h-3" />;

      return <p key={idx} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-1 text-sm">{formattedLine}</p>;
    });
  };

  const chartAxisColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const chartGridColor = theme === 'light' ? '#e2e8f0' : '#1e293b';

  // Render different chart types
  const renderChart = () => {
    if (!message.chartConfig) return null;

    const CommonComponents = () => (
      <>
        {chartSettings.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />}
        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{stroke: chartSettings.color, strokeWidth: 1, strokeDasharray: '4 4'}} />
        {chartSettings.enableZoom && message.chartConfig.chartType !== 'pie' && message.chartConfig.chartType !== 'radar' && (
             <Brush 
                dataKey={message.chartConfig.xAxisKey || "label"}
                height={24} 
                stroke={chartAxisColor}
                fill={theme === 'light' ? '#f1f5f9' : '#0f172a'}
                tickFormatter={() => ""}
                travellerWidth={10}
              />
        )}
      </>
    );

    switch (message.chartConfig.chartType) {
        case 'line':
            return (
                <LineChart data={message.chartConfig.data}>
                    <XAxis 
                      dataKey={message.chartConfig.xAxisKey || "label"} 
                      stroke={chartAxisColor} 
                      tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis 
                      stroke={chartAxisColor} 
                      tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}}
                      tickLine={false}
                      axisLine={false}
                    />
                    <CommonComponents />
                    <Line 
                      type={chartSettings.lineType} 
                      dataKey={message.chartConfig.dataKey || "value"} 
                      stroke={chartSettings.color} 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{r: 4, fill: chartSettings.color, stroke: theme === 'light' ? '#fff' : '#0f172a', strokeWidth: 2}}
                    />
                </LineChart>
            );
        case 'area':
            return (
                <AreaChart data={message.chartConfig.data}>
                    <XAxis 
                      dataKey={message.chartConfig.xAxisKey || "label"} 
                      stroke={chartAxisColor} 
                      tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis 
                      stroke={chartAxisColor} 
                      tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}}
                      tickLine={false}
                      axisLine={false}
                    />
                    <CommonComponents />
                    <Area 
                      type={chartSettings.lineType} 
                      dataKey={message.chartConfig.dataKey || "value"} 
                      stroke={chartSettings.color} 
                      fill={chartSettings.color}
                      fillOpacity={0.3}
                    />
                </AreaChart>
            );
        case 'pie':
            return (
                <PieChart>
                    <Pie
                        data={message.chartConfig.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey={message.chartConfig.dataKey || "value"}
                        nameKey={message.chartConfig.xAxisKey || "label"}
                    >
                        {message.chartConfig.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} stroke={theme === 'light' ? '#fff' : '#0f172a'} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    />
                </PieChart>
            );
        case 'radar':
            return (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={message.chartConfig.data}>
                    <PolarGrid stroke={chartGridColor} />
                    <PolarAngleAxis 
                        dataKey={message.chartConfig.xAxisKey || "label"} 
                        tick={{ fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace' }} 
                    />
                    <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 'auto']} 
                        tick={{ fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace' }} 
                        axisLine={false}
                    />
                    <Radar
                        name={message.chartConfig.title}
                        dataKey={message.chartConfig.dataKey || "value"}
                        stroke={chartSettings.color}
                        fill={chartSettings.color}
                        fillOpacity={0.4}
                    />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                </RadarChart>
            );
        case 'bar':
        default:
            return (
                <BarChart data={message.chartConfig.data}>
                    <XAxis 
                        dataKey={message.chartConfig.xAxisKey || "label"} 
                        stroke={chartAxisColor} 
                        tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}} 
                        minTickGap={20}
                    />
                    <YAxis 
                        stroke={chartAxisColor} 
                        tick={{fill: chartAxisColor, fontSize: chartSettings.fontSize, fontFamily: 'monospace'}} 
                    />
                    <CommonComponents />
                    <Bar dataKey={message.chartConfig.dataKey || "value"} fill={chartSettings.color} radius={[4, 4, 0, 0]} />
                </BarChart>
            );
    }
  };

  return (
    <div className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/60 dark:bg-[#0f172a]/40 border-l-2 border-sky-500/50 mb-4 animate-fade-in group/msg rounded-r-md">
      <div className="shrink-0 pt-1">
        <div className="w-6 h-6 rounded-sm bg-sky-100 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="prose prose-slate dark:prose-invert max-w-none text-sm md:text-base">
          {formatText(message.text)}
        </div>

        {message.chartConfig && message.chartConfig.visualize && (
          <div className="mt-6 mb-4 bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 p-3 md:p-4 rounded-md relative group/chart shadow-sm">
            
            {/* Chart Header - Updated with visible Export Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
              <h3 className="text-xs font-mono font-bold text-sky-600 dark:text-sky-500 uppercase flex items-center gap-2">
                <Activity className="w-3 h-3" />
                {message.chartConfig.title}
              </h3>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                 {/* Explicit Download Buttons */}
                 <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 mr-1 overflow-hidden">
                    <button 
                        onClick={() => handleExport('png')}
                        className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors border-r border-slate-200 dark:border-slate-700"
                        title="Download as PNG Image"
                    >
                        <ImageIcon className="w-3 h-3" /> PNG
                    </button>
                    <button 
                        onClick={() => handleExport('svg')}
                        className="px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                        title="Download as SVG Vector"
                    >
                        <FileCode className="w-3 h-3" /> SVG
                    </button>
                 </div>

                 <button 
                   onClick={() => setShowSettings(!showSettings)}
                   className={`p-1.5 rounded-md transition-all ${showSettings ? 'bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                   title="Customize Visualization"
                 >
                    <Settings2 className="w-3.5 h-3.5" />
                 </button>
                 
                 {isLatest ? (
                   <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-mono flex items-center gap-2 animate-pulse ml-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      LIVE
                   </div>
                 ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono flex items-center gap-2 ml-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      HIST
                   </div>
                 )}
              </div>
            </div>

            {/* Customization Panel */}
            {showSettings && (
                <div className="absolute top-12 right-2 md:right-4 z-20 w-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-2xl rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chart Config</span>
                        <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-3 h-3" /></button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {/* Themes */}
                        <div className="mb-4">
                            <label className="text-[10px] text-slate-500 font-mono mb-2 block flex items-center gap-1.5">
                                <LayoutTemplate className="w-3 h-3" /> PRESET THEMES
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(CHART_THEMES).map(([key, theme]) => (
                                    <button
                                        key={key}
                                        onClick={() => applyTheme(key)}
                                        className="text-[10px] px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left truncate"
                                        title={theme.label}
                                    >
                                        <span className="w-2 h-2 rounded-full inline-block mr-2" style={{ backgroundColor: theme.color }}></span>
                                        {theme.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Styling Controls */}
                        <div className="space-y-4 mb-4">
                            {/* Line Style - Only for Line Charts */}
                            {(message.chartConfig.chartType === 'line' || message.chartConfig.chartType === 'area') && (
                                <div>
                                    <label className="text-[10px] text-slate-500 font-mono mb-2 block flex items-center gap-1.5">
                                        <Activity className="w-3 h-3" /> INTERPOLATION
                                    </label>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-md p-0.5 border border-slate-200 dark:border-slate-800">
                                        {['step', 'linear', 'monotone'].map((type) => (
                                            <button 
                                                key={type}
                                                onClick={() => setChartSettings(prev => ({...prev, lineType: type as any}))}
                                                className={`flex-1 text-[10px] py-1 rounded capitalize transition-colors ${chartSettings.lineType === type ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Colors */}
                            <div>
                                <label className="text-[10px] text-slate-500 font-mono mb-2 block flex items-center gap-1.5">
                                    <Palette className="w-3 h-3" /> ACCENT COLOR
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_PALETTE.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setChartSettings(prev => ({...prev, color}))}
                                            className={`w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform ${chartSettings.color === color ? 'ring-2 ring-slate-400 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-[#0f172a]' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                    <Grid className="w-3 h-3" /> SHOW GRID
                                </label>
                                <button 
                                    onClick={() => setChartSettings(prev => ({...prev, showGrid: !prev.showGrid}))}
                                    className={`w-8 h-4 rounded-full transition-colors relative ${chartSettings.showGrid ? 'bg-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform ${chartSettings.showGrid ? 'translate-x-4 bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                                </button>
                            </div>

                            {/* Zoom Toggle - Hide for Pie & Radar */}
                            {message.chartConfig.chartType !== 'pie' && message.chartConfig.chartType !== 'radar' && (
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                        <MoveHorizontal className="w-3 h-3" /> ZOOM & PAN
                                    </label>
                                    <button 
                                        onClick={() => setChartSettings(prev => ({...prev, enableZoom: !prev.enableZoom}))}
                                        className={`w-8 h-4 rounded-full transition-colors relative ${chartSettings.enableZoom ? 'bg-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full transition-transform ${chartSettings.enableZoom ? 'translate-x-4 bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                                    <Type className="w-3 h-3" /> FONT SIZE
                                </label>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setChartSettings(prev => ({...prev, fontSize: 8}))} className={`px-2 py-0.5 text-[10px] rounded border ${chartSettings.fontSize === 8 ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>S</button>
                                    <button onClick={() => setChartSettings(prev => ({...prev, fontSize: 10}))} className={`px-2 py-0.5 text-[10px] rounded border ${chartSettings.fontSize === 10 ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>M</button>
                                    <button onClick={() => setChartSettings(prev => ({...prev, fontSize: 12}))} className={`px-2 py-0.5 text-[10px] rounded border ${chartSettings.fontSize === 12 ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600' : 'text-slate-500 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>L</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-64 w-full" ref={chartContainerRef}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChart() || <div className="flex items-center justify-center h-full text-slate-400 text-xs">NO VISUAL DATA</div>}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/50">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info className="w-3 h-3" /> Source Intel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {message.groundingSources.map((source, idx) => (
                <a 
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-slate-50 dark:bg-[#0b1120] hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 border-l-2 border-slate-300 dark:border-slate-700 hover:border-sky-500 transition-all group"
                >
                  <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate font-mono">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-sky-500" />
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Technical Actions Footer */}
        <div className="flex items-center gap-3 md:gap-4 mt-6 border-t border-slate-200 dark:border-slate-800/50 pt-4 opacity-80 md:opacity-70 group-hover/msg:opacity-100 transition-opacity flex-wrap">
            <button 
              onClick={() => onViewLogs(message)}
              className="text-[10px] font-mono text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5 group"
            >
                <Terminal className="w-3 h-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                <span className="hidden xs:inline">VIEW_</span>LOGS 
            </button>
            <button 
              onClick={() => onViewReport(message)}
              className="text-[10px] font-mono text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1.5 group"
            >
                <FileText className="w-3 h-3 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
                <span className="hidden xs:inline">VIEW_</span>REPORT
            </button>
            <button 
              onClick={handleArchiveClick}
              disabled={isArchived}
              className={`text-[10px] font-mono transition-colors flex items-center gap-1.5 ${isArchived ? 'text-emerald-600 dark:text-emerald-500 cursor-default' : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500'}`}
            >
                {isArchived ? (
                  <>
                     <CheckCircle2 className="w-3 h-3" />
                     <span className="hidden xs:inline">ARCHIVED</span>
                  </>
                ) : (
                  <>
                     <Database className="w-3 h-3" />
                     <span className="hidden xs:inline">ARCHIVE</span>
                  </>
                )}
            </button>

            {/* Visual Recon Action */}
            {hasImageContext && onVisualRecon && (
              <button 
                onClick={() => onVisualRecon(message)}
                className="text-[10px] font-mono text-amber-600/80 dark:text-amber-500/80 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group border border-amber-500/30 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/10 px-2 py-0.5 rounded"
              >
                  <ScanEye className="w-3 h-3 group-hover:text-amber-500 dark:group-hover:text-amber-300" />
                  RECON
              </button>
            )}
            
            {/* Visualize Data Action - NEW */}
            {!message.chartConfig && onVisualize && (
              <button 
                onClick={() => onVisualize(message)}
                className="text-[10px] font-mono text-fuchsia-600 dark:text-fuchsia-500 hover:text-fuchsia-500 dark:hover:text-fuchsia-400 transition-colors flex items-center gap-1.5 group"
              >
                  <BarChart3 className="w-3 h-3 group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400" />
                  VISUALIZE
              </button>
            )}

            <div className="flex-1"></div>
            <button 
              onClick={() => onDelete(message)}
              className="text-[10px] font-mono text-slate-500 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 group"
            >
                <Trash2 className="w-3 h-3 group-hover:text-red-500 dark:group-hover:text-red-400" />
            </button>
        </div>
      </div>
    </div>
  );
};
