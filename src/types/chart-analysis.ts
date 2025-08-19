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
  model: AIModel;
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
  };
  vector?: number[];
}

export type AIModel = 'scout' | 'maverick';

export interface AIResponse {
  content: string;
  model: AIModel;
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
  selectedModel: AIModel;
  uploadedImage?: UploadedImage;
  chatHistory: ChatMessage[];
  analysisHistory: Analysis[];
  isProcessing: boolean;
  currentAnalysis?: Analysis;
}