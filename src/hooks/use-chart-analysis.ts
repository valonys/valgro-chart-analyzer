import { useState, useCallback } from 'react';
import { AppState, ChatMessage, Analysis, UploadedImage, AIModel, Document } from '@/types/chart-analysis';
import { aiService } from '@/lib/ai-service';
import { vectorStore } from '@/lib/vector-store';
import { useToast } from '@/hooks/use-toast';

export const useChartAnalysis = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<AppState>({
    currentTab: 'upload',
    selectedModel: 'scout',
    chatHistory: [],
    analysisHistory: [],
    isProcessing: false
  });

  const setCurrentTab = useCallback((tab: AppState['currentTab']) => {
    setState(prev => ({ ...prev, currentTab: tab }));
  }, []);

  const setSelectedModel = useCallback((model: AIModel) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const uploadImage = useCallback((file: File) => {
    const imageUrl = URL.createObjectURL(file);
    const uploadedImage: UploadedImage = {
      file,
      url: imageUrl,
      id: Date.now().toString()
    };
    
    setState(prev => ({ ...prev, uploadedImage }));
    toast({
      title: "Image uploaded successfully",
      description: "Your chart is ready for analysis"
    });
  }, [toast]);

  const analyzeChart = useCallback(async () => {
    if (!state.uploadedImage) return;

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const results = await aiService.analyzeChart(state.uploadedImage.url, state.selectedModel);
      
      const analysis: Analysis = {
        id: Date.now().toString(),
        imageUrl: state.uploadedImage.url,
        results,
        timestamp: new Date(),
        model: state.selectedModel
      };

      // Add to vector store
      const analysisContent = results.map(r => `${r.question}: ${r.answer}`).join('\n');
      const document: Document = {
        id: analysis.id,
        content: analysisContent,
        metadata: {
          timestamp: new Date(),
          analysis_id: analysis.id,
          type: 'analysis'
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
        description: `Chart analyzed using ${state.selectedModel === 'scout' ? 'Scout' : 'Maverick'} model`
      });
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      toast({
        title: "Analysis failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [state.uploadedImage, state.selectedModel, toast]);

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
          type: 'chat'
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
    setCurrentTab,
    setSelectedModel,
    uploadImage,
    analyzeChart,
    sendChatMessage,
    clearChatHistory,
    clearAnalysisHistory
  };
};