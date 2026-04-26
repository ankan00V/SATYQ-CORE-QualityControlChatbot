import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, BotMessage, TemplateManager, Login, LogViewer, ReportViewer, DataVisualizer, ModeIntro, ToastContainer, DeleteConfirmDialog, TourGuide } from './components';
import { AppMode, Message, ToastMessage, ChatSession } from './types';
import { generateResponse } from './services/puterService';
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
    addToast('info', 'Log Retrieved', `Session \"${session.title}\" loaded from archives.`);
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
        textToSend = `${textToSend}\\n\\n[FILE: ${attachedFile.name}]\\n${attachedFile.content}\\n[END FILE]`;
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
        // Updating it signifies a new \"branch\" of conversation.
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
      
      const prompt = `Extract numerical data from the following text and create a JSON chart configuration based on the SYSTEM_INSTRUCTION schema. \n        Text: """${sourceText}"""\n        Return ONLY the valid JSON block with "visualize": true.`;
      
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
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:shadow-none`}>
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
[TRUNCATED]
