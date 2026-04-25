import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, BotMessage, TemplateManager, Login, LogViewer, ReportViewer, DataVisualizer, ModeIntro, ToastContainer, DeleteConfirmDialog, TourGuide } from './components';
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

