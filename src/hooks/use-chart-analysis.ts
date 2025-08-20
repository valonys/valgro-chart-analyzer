import { useState, useCallback } from 'react';
import { AppState, ChatMessage, Analysis, UploadedImage, AIModel, AIModelType, Document } from '@/types/chart-analysis';
import { aiService } from '@/lib/ai-service';
import { vectorStore } from '@/lib/vector-store';
import { useToast } from '@/hooks/use-toast';

const models: AIModel[] = [
  {
    id: 'scout',
    name: 'Scout',
    description: 'Llama 4 Scout 17B Vision - Fast and efficient chart analysis',
    tier: 'standard'
  },
  {
    id: 'maverick',
    name: 'Maverick',
    description: 'Llama 4 Maverick 17B Vision - Advanced reasoning and detailed insights',
    tier: 'premium'
  }
];

export const useChartAnalysis = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<AppState>({
    currentTab: 'upload',
    selectedModel: 'scout',
    selectedDomain: 'business',
    chatHistory: [],
    analysisHistory: [],
    isProcessing: false
  });

  const setCurrentTab = useCallback((tab: AppState['currentTab']) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  }, []);

  const setSelectedModel = useCallback((model: AIModel) => {
    setState(prev => ({ ...prev, selectedModel: model.id }));
  }, []);

  const setSelectedDomain = useCallback((domain: 'business' | 'industrial' | 'medical') => {
    setState(prev => ({ ...prev, selectedDomain: domain }));
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // Upload and analyze the image with domain-specific analysis
      const result = await aiService.uploadAndAnalyzeImage(file, state.selectedModel, state.selectedDomain);
      
      // Create analysis entry
      const analysis: Analysis = {
        id: Date.now().toString(),
        imageUrl: result.imageUrl,
        results: result.analysis,
        timestamp: new Date(),
        model: state.selectedModel,
        domain: state.selectedDomain
      };

      // Add to vector store
      const analysisContent = result.analysis.map(r => `${r.question}: ${r.answer}`).join('\n');
      const document: Document = {
        id: analysis.id,
        content: analysisContent,
        metadata: {
          timestamp: new Date(),
          analysis_id: analysis.id,
          type: 'analysis',
          domain: state.selectedDomain
        }
      };
      vectorStore.addDocument(document);

      // Add to chat history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: `I've uploaded an image for ${state.selectedDomain} analysis. Can you analyze this chart for me?`,
        timestamp: new Date(),
        imageUrl: result.imageUrl
      };
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your chart image using ${state.selectedDomain} domain expertise. Here are the key insights I found:\n\n${result.analysis.map(r => `**${r.question}**\n${r.answer}\n`).join('\n')}`,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        currentAnalysis: analysis,
        analysisHistory: [analysis, ...prev.analysisHistory],
        chatHistory: [...prev.chatHistory, userMessage, aiMessage],
        isProcessing: false
      }));

      toast({
        title: "Upload and analysis complete",
        description: `Chart analyzed using ${state.selectedModel === 'scout' ? 'Scout' : 'Maverick'} model with ${state.selectedDomain} expertise`
      });
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload and analyze image",
        variant: "destructive"
      });
    }
  }, [state.selectedModel, state.selectedDomain, toast]);

  const analyzeChart = useCallback(async () => {
    if (!state.uploadedImage) return;

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const results = await aiService.analyzeChart(state.uploadedImage.url, state.selectedModel, state.selectedDomain);
      
      const analysis: Analysis = {
        id: Date.now().toString(),
        imageUrl: state.uploadedImage.url,
        results,
        timestamp: new Date(),
        model: state.selectedModel,
        domain: state.selectedDomain
      };

      // Add to vector store
      const analysisContent = results.map(r => `${r.question}: ${r.answer}`).join('\n');
      const document: Document = {
        id: analysis.id,
        content: analysisContent,
        metadata: {
          timestamp: new Date(),
          analysis_id: analysis.id,
          type: 'analysis',
          domain: state.selectedDomain
        }
      };
      vectorStore.addDocument(document);

      setState(prev => ({
        ...prev,
        currentAnalysis: analysis,
        analysisHistory: [analysis, ...prev.analysisHistory],
        isProcessing: false
      }));

      toast({
        title: "Analysis complete",
        description: `Chart analyzed using ${state.selectedModel === 'scout' ? 'Scout' : 'Maverick'} model with ${state.selectedDomain} expertise`
      });
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Analysis failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [state.uploadedImage, state.selectedModel, state.selectedDomain, toast]);

  const sendChatMessage = useCallback(async (message: string, useRAG: boolean = false) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      imageUrl: state.uploadedImage?.url
    };

    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage],
      isProcessing: true
    }));

    try {
      let context = '';
      
      if (useRAG) {
        const similarDocs = vectorStore.searchSimilar(message, 3);
        context = similarDocs.map(doc => doc.content).join('\n\n');
      }

      const response = await aiService.chatWithAI(message, state.selectedModel, context);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      // Add chat to vector store
      const chatContent = `User: ${message}\nAssistant: ${response.content}`;
      const document: Document = {
        id: assistantMessage.id,
        content: chatContent,
        metadata: {
          timestamp: new Date(),
          chat_id: assistantMessage.id,
          type: 'chat',
          domain: state.selectedDomain
        }
      };
      vectorStore.addDocument(document);

      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, assistantMessage],
        isProcessing: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Chat error",
        description: "Failed to get response",
        variant: "destructive"
      });
    }
  }, [state.selectedModel, state.uploadedImage?.url, toast]);

  const sendStreamingChatMessage = useCallback(async (message: string, useRAG: boolean = false, onToken: (token: string) => void) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      imageUrl: state.uploadedImage?.url
    };

    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMessage],
      isProcessing: true
    }));

    try {
      let context = '';
      
      if (useRAG) {
        const similarDocs = vectorStore.searchSimilar(message, 3);
        context = similarDocs.map(doc => doc.content).join('\n\n');
      }

      let fullResponse = '';
      
      for await (const token of aiService.streamChatResponse(message, state.selectedModel, context)) {
        fullResponse += token;
        onToken(token);
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      // Add chat to vector store
      const chatContent = `User: ${message}\nAssistant: ${fullResponse}`;
      const document: Document = {
        id: assistantMessage.id,
        content: chatContent,
        metadata: {
          timestamp: new Date(),
          chat_id: assistantMessage.id,
          type: 'chat',
          domain: state.selectedDomain
        }
      };
      vectorStore.addDocument(document);

      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, assistantMessage],
        isProcessing: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Chat error",
        description: "Failed to get response",
        variant: "destructive"
      });
    }
  }, [state.selectedModel, state.uploadedImage?.url, toast]);

  const clearChatHistory = useCallback(() => {
    setState(prev => ({ ...prev, chatHistory: [] }));
  }, []);

  const clearAnalysisHistory = useCallback(() => {
    setState(prev => ({ ...prev, analysisHistory: [], currentAnalysis: undefined }));
    vectorStore.clear();
  }, []);

  return {
    ...state,
    selectedModel: models.find(m => m.id === state.selectedModel) || models[0],
    setCurrentTab,
    setSelectedModel,
    setSelectedDomain,
    uploadImage,
    analyzeChart,
    sendChatMessage,
    sendStreamingChatMessage,
    clearChatHistory,
    clearAnalysisHistory
  };
};