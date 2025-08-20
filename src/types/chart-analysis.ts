export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface Analysis {
  id: string;
  imageUrl: string;
  results: AnalysisResult[];
  timestamp: Date;
  model: AIModelType;
  domain?: 'business' | 'industrial' | 'medical';
}

export interface AnalysisResult {
  question: string;
  answer: string;
  confidence?: number;
}

export interface Document {
  id: string;
  content: string;
  metadata: {
    timestamp: Date;
    analysis_id?: string;
    chat_id?: string;
    type: 'analysis' | 'chat';
    domain?: 'business' | 'industrial' | 'medical';
  };
  vector?: number[];
}

export type AIModelType = 'scout' | 'maverick';

export interface AIModel {
  id: AIModelType;
  name: string;
  description: string;
  tier: 'standard' | 'premium';
}

export interface AIResponse {
  content: string;
  model: AIModelType;
  timestamp: Date;
  confidence?: number;
}

export interface UploadedImage {
  file: File;
  url: string;
  id: string;
}

export interface AppState {
  currentTab: 'upload' | 'chat' | 'analysis' | 'history';
  selectedModel: AIModelType;
  selectedDomain: 'business' | 'industrial' | 'medical';
  uploadedImage?: UploadedImage;
  chatHistory: ChatMessage[];
  analysisHistory: Analysis[];
  isProcessing: boolean;
  currentAnalysis?: Analysis;
}