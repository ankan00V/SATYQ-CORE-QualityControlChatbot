
import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BotMessage } from './components/BotMessage';
import { TemplateManager } from './components/TemplateManager';
import { Login } from './components/Login';
import { LogViewer } from './components/LogViewer';
import { ReportViewer } from './components/ReportViewer';
import { DataVisualizer } from './components/DataVisualizer';
import { ModeIntro } from './components/ModeIntro';
import { ToastContainer } from './components/Toast';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'; 
import { TourGuide } from './components/TourGuide';
import { AppMode, Message, ToastMessage, ChatSession } from './types';
import { generateResponse } from './services/geminiService';
import { Send, Image as ImageIcon, X, Loader2, BrainCircuit, ShieldCheck, Terminal, LayoutDashboard, Globe, ScanEye, Trash2, Activity, Menu, Pencil, Check, Banknote, MapPin, ChevronDown, Paperclip, FileText } from 'lucide-react';

// --- CONFIGURATION PER MODE ---
const MODE_CONFIG = {
  [AppMode.STANDARD]: {
    title: 'Ops Dashboard',
    color: 'cyan',
    modelName: 'SATYQ-CORE',
    desc: 'Standard operating procedure environment for routine defect reporting, shift logging, and general inquiries.',
    output: 'Concise Markdown reports, standard status indicators (Nominal/Critical), and simple trend visualization.',
    placeholder: 'Enter defect log or operational command...',
    examples: [
      'Initiate defect report for [Item ID]...',
      'Query operational status of [System]...',
      'Log maintenance activity for [Unit]...'
    ]
  },
  [AppMode.DEEP_REASON]: {
    title: 'Deep Logic Engine',
    color: 'violet',
    modelName: 'SATYQ-CORE',
    desc: 'Advanced reasoning environment using "Thinking Tokens" to perform Root Cause Analysis (5 Whys) and complex deduction.',
    output: 'Detailed logic traces, step-by-step reasoning chains, and comprehensive failure analysis.',
    placeholder: 'Input complex failure scenario for analysis...',
    examples: [
      'Conduct Root Cause Analysis on [Incident]...',
      'Evaluate failure logic for [Scenario]...',
      'Hypothesize reasons for [Observation]...'
    ]
  },
  [AppMode.DATA_ANALYSIS]: {
    title: 'Telemetry Lab',
    color: 'fuchsia',
    modelName: 'SATYQ-CORE',
    desc: 'Dedicated environment for processing raw telemetry data into visual models and statistical insights.',
    output: 'Strictly structured JSON for chart rendering, minimal conversational text, and statistical summaries.',
    placeholder: 'Input raw JSON, CSV, or sensor data for rendering...',
    examples: [
      'Generate visualization for [Dataset Description]...',
      'Analyze telemetry trends for [Metric]...',
      'Detect anomalies in [Data Source]...'
    ]
  },
  [AppMode.RESEARCH]: {
    title: 'Global Intel',
    color: 'emerald',
    modelName: 'SATYQ-CORE',
    desc: 'Connected environment for retrieving real-time ISO standards, regulatory compliance, and industrial news.',
    output: 'Fact-checked summaries with citation links, source verification, and external web references.',
    placeholder: 'Search for regulations or standards...',
    examples: [
      'Retrieve industrial standards for [Topic]...',
      'Search for compliance guidelines regarding [Regulation]...',
      'Find technical specifications for [Material/Component]...'
    ]
  },
  [AppMode.MARKET_VALUATION]: {
    title: 'Asset Valuation',
    color: 'lime',
    modelName: 'SATYQ-CORE',
    desc: 'Financial intelligence module for estimating industrial asset value, resale potential, and scrap rates based on regional markets.',
    output: 'Estimated market value range, currency conversion, and recommended sales channels.',
    placeholder: 'Describe asset or upload image for valuation...',
    examples: [
      'Calculate market value for [Asset]...',
      'Determine scrap metal rate for [Material]...',
      'Estimate liquidation price of [Equipment]...'
    ]
  },
  [AppMode.IMAGE_EDIT]: {
    title: 'Visual Recon',
    color: 'amber',
    modelName: 'SATYQ-CORE',
    desc: 'Multimodal analysis environment for visual defect inspection, severity grading, and surface anomaly detection.',
    output: 'Technical visual assessments, severity ratings (1-10), and repair recommendations based on visual data.',
    placeholder: 'Upload image and describe inspection criteria...',
    examples: [
      'Analyze this image for [Specific Defect]...',
      'Assess condition of [Component]...',
      'Identify surface irregularities on [Material]...'
    ]
  }
};

const SESSION_STORAGE_KEY = 'apex9_chat_sessions';
const TOUR_STORAGE_KEY = 'satyq_core_tour_completed';

const COUNTRY_OPTIONS = [
    { code: 'USA', label: 'United States', currency: 'USD' },
    { code: 'UK', label: 'United Kingdom', currency: 'GBP' },
    { code: 'DE', label: 'Germany', currency: 'EUR' },
    { code: 'JP', label: 'Japan', currency: 'JPY' },
    { code: 'CN', label: 'China', currency: 'CNY' },
    { code: 'IN', label: 'India', currency: 'INR' },
    { code: 'CA', label: 'Canada', currency: 'CAD' },
    { code: 'AU', label: 'Australia', currency: 'AUD' },
    { code: 'BR', label: 'Brazil', currency: 'BRL' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.STANDARD);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState('USA'); 
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Tour State
  const [showTour, setShowTour] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    return 'dark';
  });
  
  // Edit Feature State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // New State for features
  const [selectedLogMessage, setSelectedLogMessage] = useState<Message | null>(null);
  const [selectedReportMessage, setSelectedReportMessage] = useState<Message | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null); // State for deletion
  
  // Session History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const activeConfig = MODE_CONFIG[currentMode];

  useEffect(() => {
    const loaded = localStorage.getItem(SESSION_STORAGE_KEY);
    if (loaded) {
      try {
        setSessions(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  const saveSessions = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSessions));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMode, editingMessageId]); // Scroll when mode changes or editing starts

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Check for tour completion
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
        setShowTour(true);
    }
    // Start empty to show the Mode Intro
    setMessages([]); 
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    addToast('success', 'System Calibrated', 'Orientation complete. Systems nominal.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMessages([]);
    setInputText('');
    setSelectedImage(null);
    setAttachedFile(null);
  };

  const handleSetMode = (mode: AppMode) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);
    setMessages([]); // Clear chat to show the new Mode Intro
    setInputText('');
    setSelectedImage(null);
    setAttachedFile(null);
  };

  // --- Session Management ---

  const handleNewSession = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? (firstUserMsg.text.slice(0, 24) + (firstUserMsg.text.length > 24 ? '...' : '')) : 'Untitled Operation';
      const preview = messages[messages.length - 1].text.slice(0, 40) + '...';

      const newSession: ChatSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title,
        preview,
        mode: currentMode,
        messages: [...messages]
      };

      const updatedSessions = [newSession, ...sessions];
      saveSessions(updatedSessions);
      addToast('success', 'Operation Logged', 'Previous session archived to mission logs.');
    } else {
       addToast('info', 'New Operation', 'Workspace initialized.');
    }
    
    setMessages([]);
    setInputText('');
    setSelectedImage(null);
    setAttachedFile(null);
  };

  const handleLoadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentMode(session.mode);
    addToast('info', 'Log Retrieved', `Session "${session.title}" loaded from archives.`);
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    addToast('info', 'Log Purged', 'Session removed from history.');
  };

  // --- File Processing ---
  const handleProcessFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
        addToast('info', 'Image Loaded', 'Visual buffer ready for analysis.');
    } else {
        addToast('error', 'Invalid Media', 'System accepts standard image formats only.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };
  
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
             addToast('error', 'File Limit', 'Max file size is 5MB.');
             return;
        }
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAttachedFile({ name: file.name, content: ev.target?.result as string });
            addToast('success', 'File Attached', 'Document ready for transmission.');
        };
        reader.onerror = () => addToast('error', 'Read Error', 'Could not read file.');
        reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSubmit = async (e?: React.FormEvent, overrideText?: string, overrideMode?: AppMode, overrideImage?: string) => {
    e?.preventDefault();
    let textToSend = overrideText || inputText;
    const modeToUse = overrideMode || currentMode;
    const imageToSend = overrideImage || selectedImage;
    
    // Append attached file content if present
    if (attachedFile && !overrideText) {
        textToSend = `${textToSend}\n\n[FILE: ${attachedFile.name}]\n${attachedFile.content}\n[END FILE]`;
    }
    
    if ((!textToSend.trim() && !imageToSend) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      image: imageToSend || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    if (!overrideImage) {
        setSelectedImage(null);
        setAttachedFile(null);
    }
    setIsLoading(true);

    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'model',
      text: '',
      isThinking: modeToUse === AppMode.DEEP_REASON, // Visual trigger for thinking
      timestamp: Date.now()
    }]);

    // Lookup full country object for label and currency
    const countryObj = COUNTRY_OPTIONS.find(c => c.code === selectedCountryCode) || COUNTRY_OPTIONS[0];

    try {
      const response = await generateResponse({
        prompt: userMsg.text,
        history: messages, // Pass conversation history here
        imageBase64: imageToSend || undefined,
        mode: modeToUse,
        country: countryObj.label, 
        currency: countryObj.currency
      });

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== loadingId);
        return [...filtered, {
          id: Date.now().toString(),
          role: 'model',
          text: response.text,
          chartConfig: response.chartConfig,
          groundingSources: response.groundingSources,
          timestamp: Date.now()
        }];
      });

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.filter(m => m.id !== loadingId)); 
      addToast('error', 'Transmission Failed', 'Could not reach neural core.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit Message Logic ---
  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return;

    const existingMsg = messages[index];
    
    // Truncate history to the point just before this message
    const previousHistory = messages.slice(0, index);

    // Create updated message object
    const updatedUserMsg: Message = {
        ...existingMsg,
        text: editText,
        // We preserve the original timestamp or update it? 
        // Updating it signifies a new "branch" of conversation.
        timestamp: Date.now() 
    };

    // Reset Edit State
    setEditingMessageId(null);
    setEditText('');
    setIsLoading(true);

    // Optimistically update UI: History + Updated Message
    setMessages([...previousHistory, updatedUserMsg]);

    // Add loading placeholder
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
        id: loadingId,
        role: 'model',
        text: '',
        isThinking: currentMode === AppMode.DEEP_REASON,
        timestamp: Date.now()
    }]);

    const countryObj = COUNTRY_OPTIONS.find(c => c.code === selectedCountryCode) || COUNTRY_OPTIONS[0];

    try {
        const response = await generateResponse({
            prompt: updatedUserMsg.text,
            history: previousHistory,
            imageBase64: updatedUserMsg.image,
            mode: currentMode,
            country: countryObj.label,
            currency: countryObj.currency
        });

        setMessages(prev => {
            const filtered = prev.filter(m => m.id !== loadingId);
            return [...filtered, {
                id: Date.now().toString(),
                role: 'model',
                text: response.text,
                chartConfig: response.chartConfig,
                groundingSources: response.groundingSources,
                timestamp: Date.now()
            }];
        });
        
        addToast('success', 'Context Updated', 'Message edited and response regenerated.');

    } catch (error) {
        console.error(error);
        setMessages(prev => prev.filter(m => m.id !== loadingId));
        addToast('error', 'Update Failed', 'Could not regenerate response.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleArchive = (msg: Message) => {
    const KB_KEY = 'knowledge_base';
    try {
      const existing = localStorage.getItem(KB_KEY);
      const archive: Message[] = existing ? JSON.parse(existing) : [];
      
      if (!archive.some(m => m.id === msg.id)) {
        archive.push(msg);
        localStorage.setItem(KB_KEY, JSON.stringify(archive));
        setTimeout(() => {
            addToast('success', 'Archived Successfully', `Message ID ${msg.id.slice(-4)} saved to secure Knowledge Base.`);
        }, 600);
      } else {
        addToast('info', 'Already Archived', 'This record is already in the Knowledge Base.');
      }
    } catch (e) {
      console.error('Archive failed', e);
      addToast('error', 'System Error', 'Failed to write to local storage persistence layer.');
    }
  };

  const handleDeleteRequest = (msgId: string) => {
    setMessageToDelete(msgId);
  };

  const handleConfirmDelete = () => {
    if (messageToDelete) {
      setMessages(prev => prev.filter(m => m.id !== messageToDelete));
      setMessageToDelete(null);
      addToast('success', 'Purge Complete', 'Record deleted from active stream.');
    }
  };

  const handleVisualRecon = (botMsg: Message) => {
    const index = messages.findIndex(m => m.id === botMsg.id);
    if (index > 0) {
      const prevMsg = messages[index - 1];
      if (prevMsg.role === 'user' && prevMsg.image) {
        setCurrentMode(AppMode.IMAGE_EDIT);
        const prompt = "Conduct a specialized Visual Recon analysis on this component. Identify specific defect patterns, surface anomalies, and structural integrity risks based on visual data.";
        handleSubmit(undefined, prompt, AppMode.IMAGE_EDIT, prevMsg.image);
        addToast('info', 'Visual Recon Active', 'Re-analyzing visual data with advanced optics protocol.');
      }
    }
  };

  const handleVisualize = async (msg: Message) => {
    if (isLoading) return;
    
    // Capture content before any state changes
    const sourceText = msg.text;

    // Force switch to Data Analysis mode to separate contexts
    if (currentMode !== AppMode.DATA_ANALYSIS) {
        setCurrentMode(AppMode.DATA_ANALYSIS);
        setMessages([]); // Clear previous chat to separate context
        addToast('info', 'Importing Data...', 'Transferring context to Telemetry Lab.');
    } else {
        addToast('info', 'Generating Visualization...', 'Extracting structured data from message content.');
    }
    
    setIsLoading(true);
    
    // Create a temporary loading message
    const loadingId = 'loading-' + Date.now();
    setMessages(prev => [...prev, {
        id: loadingId,
        role: 'model',
        text: '',
        isThinking: false,
        timestamp: Date.now()
    }]);

    try {
        const countryObj = COUNTRY_OPTIONS.find(c => c.code === selectedCountryCode) || COUNTRY_OPTIONS[0];
        
        const prompt = `Extract numerical data from the following text and create a JSON chart configuration based on the SYSTEM_INSTRUCTION schema. 
        Text: """${sourceText}"""
        Return ONLY the valid JSON block with "visualize": true.`;
        
        // Use explicit analysis mode
        const response = await generateResponse({
            prompt: prompt,
            mode: AppMode.DATA_ANALYSIS,
            country: countryObj.label,
            currency: countryObj.currency
        });

        if (response.chartConfig) {
             setMessages(prev => {
                const filtered = prev.filter(m => m.id !== loadingId);
                return [...filtered, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: response.text || "Telemetry Analysis Complete.",
                    chartConfig: response.chartConfig,
                    timestamp: Date.now()
                }];
             });
             addToast('success', 'Visualization Ready', 'Data rendered to holographic display.');
        } else {
             setMessages(prev => prev.filter(m => m.id !== loadingId));
             addToast('error', 'Visualization Failed', 'No quantifiable data found in message stream.');
        }

    } catch (e) {
        console.error(e);
        setMessages(prev => prev.filter(m => m.id !== loadingId));
        addToast('error', 'System Error', 'Visualization subsystem failed.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} theme={theme} />;
  }

  // Dynamic Border Color based on mode
  const focusRing = `focus-within:border-${activeConfig.color}-500/50`;
  const iconColor = `text-${activeConfig.color}-400`;

  const countryObj = COUNTRY_OPTIONS.find(c => c.code === selectedCountryCode) || COUNTRY_OPTIONS[0];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans overflow-hidden selection:bg-sky-500/30 transition-colors duration-500">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Tour Guide Overlay */}
      {showTour && <TourGuide onComplete={handleTourComplete} />}

      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
            currentMode={currentMode}
            onSetMode={handleSetMode}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onOpenVisualizer={() => setIsVisualizerOpen(true)}
            onLogout={handleLogout}
            config={MODE_CONFIG}
            sessions={sessions}
            onNewSession={handleNewSession}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            theme={theme}
            onToggleTheme={toggleTheme}
            onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      <main className="flex-1 flex flex-col relative bg-slate-50/50 dark:bg-[#020617] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:[background-size:24px_24px] min-w-0">
        
        {/* Top Bar - Dynamic */}
        <div className={`h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-[#020617]/90 backdrop-blur-md sticky top-0 z-10 transition-colors duration-500`}>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md"
            >
                <Menu className="w-5 h-5" />
            </button>
            
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? `bg-${activeConfig.color}-500 animate-ping` : 'bg-slate-400 dark:bg-slate-500'}`}></div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline-block">
              {isLoading ? 'PROCESSING STREAM...' : 'SYSTEM IDLE'}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:hidden">
              {isLoading ? 'BUSY' : 'IDLE'}
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono transition-colors duration-300 border-${activeConfig.color}-900`}>
             <ShieldCheck className={`w-3 h-3 ${iconColor}`} />
             <span className="text-slate-600 dark:text-slate-300 uppercase">{activeConfig.title} <span className="hidden sm:inline">PROTOCOL</span></span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="min-h-full flex flex-col items-center justify-start md:justify-center p-4 pt-8 md:pt-4 pb-40">
              <ModeIntro 
                mode={currentMode} 
                config={activeConfig} 
                onQuickAction={(text) => setInputText(text)} 
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto w-full pb-48 pt-8 px-4">
               {messages.map((msg, index) => (
                  msg.role === 'user' ? (
                    <div key={msg.id} className="flex flex-col items-end py-4 animate-fade-in-up group/user-msg">
                      <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-4 rounded-sm border border-slate-200 dark:border-transparent border-r-2 border-r-slate-400 dark:border-r-slate-500 w-full max-w-[90%] md:max-w-[80%] shadow-lg relative">
                        {editingMessageId === msg.id ? (
                          // Edit Mode
                          <div className="w-full flex flex-col gap-2">
                             <textarea 
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                rows={Math.max(3, editText.split('\n').length)}
                             />
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1 transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Save & Regenerate
                                </button>
                             </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            {msg.image && (
                              <div className="mb-3 border border-slate-200 dark:border-slate-600">
                                <img src={msg.image} alt="Upload" className="max-h-64 object-cover" />
                              </div>
                            )}
                            <p className="whitespace-pre-wrap text-sm font-light leading-relaxed">{msg.text}</p>
                          </>
                        )}
                      </div>
                      
                      {/* Action Bar */}
                      <div className="flex items-center gap-2 mt-1 mr-1">
                           <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">USER_ID_8492</span>
                           <div className="flex items-center opacity-0 group-hover/user-msg:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleStartEdit(msg)}
                                disabled={editingMessageId !== null}
                                className="text-slate-400 hover:text-sky-500 dark:text-slate-600 dark:hover:text-sky-400 p-1 transition-colors disabled:opacity-50"
                                title="Edit & Regenerate"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleDeleteRequest(msg.id)}
                                disabled={editingMessageId !== null}
                                className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-1 transition-colors disabled:opacity-50"
                                title="Delete Message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                           </div>
                      </div>
                    </div>
                  ) : msg.isThinking ? (
                    <div key={msg.id} className={`py-6 flex gap-5 pl-6 animate-in fade-in slide-in-from-left-4 duration-500 border-l-2 border-${activeConfig.color}-500/20`}>
                      {/* Avatar Area */}
                      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        <div className={`relative z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-${activeConfig.color}-500/40 flex items-center justify-center shadow-lg`}>
                           <BrainCircuit className={`w-4 h-4 text-${activeConfig.color}-600 dark:text-${activeConfig.color}-400 ${currentMode === AppMode.DEEP_REASON ? 'animate-pulse' : ''}`} />
                        </div>
                      </div>
                      
                      {/* Text/Status Area */}
                      <div className="flex flex-col justify-center gap-2">
                        <div className="flex items-center gap-2">
                           <span className={`text-xs font-mono font-bold text-${activeConfig.color}-600 dark:text-${activeConfig.color}-400 tracking-widest`}>
                             {currentMode === AppMode.DEEP_REASON ? 'NEURAL_ENGINE_SYNTHESIS' : 'ANALYZING_INPUT'}
                           </span>
                           <div className="flex gap-1">
                              <span className={`w-1 h-1 bg-${activeConfig.color}-500 rounded-full animate-bounce`}></span>
                              <span className={`w-1 h-1 bg-${activeConfig.color}-500 rounded-full animate-bounce [animation-delay:150ms]`}></span>
                              <span className={`w-1 h-1 bg-${activeConfig.color}-500 rounded-full animate-bounce [animation-delay:300ms]`}></span>
                           </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                           <div className={`h-1 w-48 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden`}>
                              <div className={`h-full bg-${activeConfig.color}-500/80 rounded-full w-full origin-left animate-pulse`}></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <BotMessage 
                      key={msg.id} 
                      message={msg} 
                      hasImageContext={index > 0 && messages[index - 1].role === 'user' && !!messages[index - 1].image}
                      onViewLogs={(m) => setSelectedLogMessage(m)}
                      onViewReport={(m) => setSelectedReportMessage(m)}
                      onArchive={handleArchive}
                      onDelete={(m) => handleDeleteRequest(m.id)}
                      onVisualRecon={handleVisualRecon}
                      onVisualize={handleVisualize}
                      theme={theme}
                      isLatest={index === messages.length - 1}
                    />
                  )
               ))}
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-[#020617] dark:via-[#020617] z-20">
          <div 
            className="max-w-5xl mx-auto w-full relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
             {/* Market Context Badge - Only in Valuation Mode */}
             {currentMode === AppMode.MARKET_VALUATION && (
                 <div className="absolute bottom-full mb-2 md:mb-3 right-0 md:right-auto md:left-0 flex animate-in slide-in-from-bottom-2">
                     <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-lime-500/10 border border-lime-500/30 rounded-md backdrop-blur-md shadow-lg">
                        <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-lime-600 dark:text-lime-400" />
                        <span className="text-[9px] md:text-[10px] font-mono font-bold text-lime-700 dark:text-lime-300 uppercase tracking-wide">
                            Context: {countryObj?.label} ({countryObj?.currency})
                        </span>
                     </div>
                 </div>
             )}

            {/* Drag Overlay */}
            {isDragging && (
                <div className="absolute -inset-6 bg-slate-900/95 border-2 border-dashed border-cyan-500/50 rounded-xl z-50 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-4 p-8 pointer-events-none">
                        <div className="p-4 bg-cyan-500/10 rounded-full animate-bounce">
                            <ImageIcon className="w-10 h-10 text-cyan-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-cyan-400 font-bold font-mono tracking-widest text-lg">DROP VISUAL DATA</p>
                            <p className="text-cyan-500/50 text-xs font-mono mt-1">INITIATING UPLOAD PROTOCOL</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Unified Preview Container */}
            <div className="absolute bottom-full left-0 w-full mb-2 px-0 flex flex-col gap-2 pointer-events-none">
                {/* File Preview */}
                {attachedFile && (
                    <div className="pointer-events-auto self-start ml-0 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 rounded-lg">
                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                            <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{attachedFile.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono">READY_TO_UPLOAD</span>
                        </div>
                        <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                {/* Image Preview */}
                {selectedImage && (
                  <div className="pointer-events-auto self-start ml-0 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 rounded-lg">
                    <div className="relative group/img">
                        <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover border border-slate-200 dark:border-slate-600 rounded-sm" />
                        <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        IMAGE_BUFFER_READY
                      </div>
                      <div className="flex items-center gap-3">
                         <button
                           onClick={() => {
                             const prompt = inputText.trim() || "Conduct a detailed visual inspection of this image. Identify defects, severity, and recommend actions.";
                             setCurrentMode(AppMode.IMAGE_EDIT); 
                             handleSubmit(undefined, prompt, AppMode.IMAGE_EDIT);
                           }}
                           className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 rounded text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-bold tracking-wide transition-all uppercase"
                        >
                           <ScanEye className="w-3 h-3" />
                           Visual Recon
                        </button>
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="text-[10px] text-slate-500 hover:text-red-500 transition-colors uppercase font-mono"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            
            <form onSubmit={(e) => handleSubmit(e)} className="relative group">
              <div className={`relative flex items-stretch gap-0 bg-white dark:bg-[#0b1120] border border-slate-300 dark:border-slate-700 shadow-2xl transition-all rounded-lg overflow-hidden ${focusRing} ${isDragging ? 'border-cyan-500 ring-2 ring-cyan-500/20' : ''}`}>
                <div className={`flex items-center justify-center border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 ${currentMode === AppMode.MARKET_VALUATION ? 'px-3' : 'w-12 md:w-14 p-0'}`}>
                    {currentMode === AppMode.MARKET_VALUATION ? (
                       <div className="flex items-center gap-3">
                           {/* Existing Country Selector */}
                           <div className="relative flex items-center gap-2 cursor-pointer group/country py-1 hover:bg-lime-500/10 rounded-md transition-all" title="Change Target Market">
                                <MapPin className="w-3.5 h-3.5 text-lime-600 dark:text-lime-500" />
                                <span className="text-[10px] font-bold text-lime-700 dark:text-lime-400 font-mono tracking-wider">{selectedCountryCode}</span>
                                <ChevronDown className="w-3 h-3 text-lime-400 opacity-50 group-hover/country:opacity-100" />
                                
                                {/* Native Select Overlay */}
                                <select 
                                  value={selectedCountryCode}
                                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                >
                                   {COUNTRY_OPTIONS.map(c => (
                                     <option key={c.code} value={c.code}>{c.label} ({c.currency})</option>
                                   ))}
                                </select>
                           </div>
                           
                           {/* Separator */}
                           <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>

                           {/* File Upload for Valuation */}
                            <button
                                type="button"
                                onClick={() => docInputRef.current?.click()}
                                className="text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                                title="Attach File"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                            </button>
                       </div>
                    ) : (
                       <button
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        className="w-full h-full flex items-center justify-center text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-slate-50/50 dark:bg-slate-900/20"
                        title="Attach File"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    )}
                </div>
                
                <input ref={docInputRef} type="file" className="hidden" onChange={handleDocUpload} />
                
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={currentMode === AppMode.MARKET_VALUATION ? `Valuation Request for ${countryObj?.label}...` : activeConfig.placeholder}
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 py-3 md:py-3.5 min-h-[50px] max-h-[150px] resize-none scrollbar-hide text-sm font-mono leading-relaxed"
                  rows={1}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-12 md:w-14 flex items-center justify-center text-slate-400 hover:text-${activeConfig.color}-600 dark:hover:text-${activeConfig.color}-400 transition-colors border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20`}
                  title="Upload Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
                
                <button
                  type="submit"
                  disabled={isLoading || (!inputText.trim() && !selectedImage && !attachedFile)}
                  className={`w-12 md:w-14 flex items-center justify-center bg-slate-100 hover:bg-${activeConfig.color}-100 dark:bg-slate-800 dark:hover:bg-${activeConfig.color}-900/50 text-slate-600 dark:text-white disabled:opacity-50 transition-colors border-l border-slate-200 dark:border-slate-700`}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-2 md:mt-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono text-slate-500 dark:text-slate-600">
                <div className="order-2 md:order-1 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                    <span>&copy; 2026 Satyq Core. All rights reserved.</span>
                </div>
                <div className="order-1 md:order-2 flex flex-wrap justify-center items-center gap-3 md:gap-4 w-full md:w-auto pb-1 md:pb-0 border-b border-slate-200 dark:border-slate-800 md:border-0">
                     <button className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors uppercase whitespace-nowrap">Privacy Protocol</button>
                     <button className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors uppercase whitespace-nowrap">Terms of Access</button>
                     <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <span className="text-emerald-600/70 dark:text-emerald-500/50 whitespace-nowrap">SYSTEM_OPTIMAL</span>
                     </div>
                     <span className="text-slate-600 dark:text-slate-700">v4.2.0</span>
                </div>
            </div>

          </div>
        </div>
      </main>

      {/* Utilities */}
      <TemplateManager 
        isOpen={isTemplatesOpen} 
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(content) => {
          setInputText(content);
        }}
      />
      
      <DataVisualizer
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
        onGenerate={(data, chartType) => {
          // Switch to new dedicated Data Analysis mode
          if (currentMode !== AppMode.DATA_ANALYSIS) {
              setMessages([]); // Clear previous chat if switching
              setCurrentMode(AppMode.DATA_ANALYSIS);
          }
          
          const prompt = `[SYSTEM: DATA_VISUALIZATION_MODE]\n
          User Preferred Visualization: ${chartType.toUpperCase()}
          (If preference is AUTO, analyze data topology to select the best chart type).
          
          Visualize the following telemetry data. \n\nDATA:\n${data}\n\nREQUIREMENT:\n1. Analyze the data.\n2. Output a JSON object following the visualization schema.\n3. Do NOT output conversational text, defect reports, or workflow steps. ONLY return the JSON.`;
          
          handleSubmit(undefined, prompt, AppMode.DATA_ANALYSIS);
        }}
      />

      <LogViewer 
        message={selectedLogMessage} 
        onClose={() => setSelectedLogMessage(null)} 
      />

      <ReportViewer 
        message={selectedReportMessage} 
        onClose={() => setSelectedReportMessage(null)} 
      />

      <DeleteConfirmDialog 
        isOpen={!!messageToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMessageToDelete(null)}
      />

      <ToastContainer 
        toasts={toasts} 
        onDismiss={removeToast} 
      />

    </div>
  );
}
