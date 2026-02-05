
export enum AppMode {
  STANDARD = 'Standard',
  DEEP_REASON = 'Deep Reason',
  RESEARCH = 'Research',
  IMAGE_EDIT = 'Image Edit',
  DATA_ANALYSIS = 'Data Analysis',
  MARKET_VALUATION = 'Market Valuation'
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}

export interface ChartConfig {
  visualize: boolean;
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'radar';
  title: string;
  data: ChartDataPoint[];
  xAxisKey?: string;
  dataKey?: string;
  color?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  isThinking?: boolean; // For loading state
  chartConfig?: ChartConfig;
  groundingSources?: GroundingSource[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  timestamp: number;
  title: string;
  preview: string;
  mode: AppMode;
  messages: Message[];
}

export interface Template {
  id: string;
  name: string;
  content: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
