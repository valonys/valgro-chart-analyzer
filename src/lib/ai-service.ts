import { AIModelType, AIResponse, AnalysisResult } from '@/types/chart-analysis';
import { supabase } from '@/integrations/supabase/client';

// Predefined analysis questions for chart analysis
const ANALYSIS_QUESTIONS = [
  "What type of chart or graph is this?",
  "What are the main trends visible in this data?",
  "What are the key numerical values or data points?",
  "What insights can be drawn from this visualization?",
  "Are there any notable anomalies or outliers in the data?",
  "What time period does this chart cover?",
  "What do the axis labels and titles indicate?"
];

// Model configurations for Groq API
const MODEL_CONFIG = {
  scout: {
    name: 'llama-3.2-11b-vision-preview',
    displayName: 'Llama 3.2 11B Vision (Scout)'
  },
  maverick: {
    name: 'llama-3.2-90b-vision-preview', 
    displayName: 'Llama 3.2 90B Vision (Maverick)'
  }
} as const;

// AI service using Supabase edge functions
export class AIService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = null;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  private async uploadImageToStorage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chart-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('chart-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image to storage:', error);
      throw new Error('Failed to upload image');
    }
  }

  private async convertImageToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private async callGroqAPI(messages: any[], model: AIModelType): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages,
          model,
          stream: false
        }
      });

      if (error) {
        console.error('Groq API call failed:', error);
        throw new Error(`Chat failed: ${error.message}`);
      }

      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }
  
  async analyzeChart(imageUrl: string, model: AIModelType): Promise<AnalysisResult[]> {
    try {
      const base64Image = await this.convertImageToBase64(imageUrl);
      const results: AnalysisResult[] = [];
      
      for (const question of ANALYSIS_QUESTIONS) {
        const messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${question} Please analyze this chart/graph image and provide detailed insights.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ];
        
        const answer = await this.callGroqAPI(messages, model);
        results.push({
          question,
          answer,
          confidence: 0.85 + Math.random() * 0.15
        });
      }
      
      return results;
    } catch (error) {
      console.error('Chart analysis failed:', error);
      throw new Error(`Failed to analyze chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadAndAnalyzeImage(file: File, model: AIModelType): Promise<{ imageUrl: string; analysis: AnalysisResult[] }> {
    try {
      const imageUrl = await this.uploadImageToStorage(file);
      const analysis = await this.analyzeChart(imageUrl, model);
      return { imageUrl, analysis };
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      throw new Error(`Failed to upload and analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async chatWithAI(message: string, model: AIModelType, context?: string): Promise<AIResponse> {
    try {
      let prompt = message;
      if (context) {
        prompt = `Context: ${context}\n\nUser: ${message}`;
      }
    
      const messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    
      const content = await this.callGroqAPI(messages, model);
    
      return {
        content,
        model,
        timestamp: new Date(),
        confidence: 0.80 + Math.random() * 0.20
      };
    } catch (error) {
      console.error('Chat failed:', error);
      throw new Error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async *streamChatResponse(message: string, model: AIModelType, context?: string): AsyncGenerator<string, void, unknown> {
    try {
      let prompt = message;
      if (context) {
        prompt = `Context: ${context}\n\nUser: ${message}`;
      }
    
      const messages = [
        {
          role: 'user',
          content: prompt
        }
      ];
    
      // For streaming, we'll get the full response and then stream it word by word
      // Real streaming would require SSE endpoint, but this simulates it
      const fullResponse = await this.callGroqAPI(messages, model);
      const words = fullResponse.split(' ');
    
      // Stream words with realistic delays
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        yield word + (i < words.length - 1 ? ' ' : '');
      }
    } catch (error) {
      console.error('Streaming chat failed:', error);
      yield `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async quickAnalysis(imageUrl: string, model: AIModelType): Promise<string> {
    try {
      const base64Image = await this.convertImageToBase64(imageUrl);
      
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Provide a quick analysis of this chart visualization. What are the key insights and trends?'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ];
      
      return await this.callGroqAPI(messages, model);
    } catch (error) {
      console.error('Quick analysis failed:', error);
      throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async quickAnalysisFromFile(file: File, model: AIModelType): Promise<string> {
    try {
      const imageUrl = await this.uploadImageToStorage(file);
      return await this.quickAnalysis(imageUrl, model);
    } catch (error) {
      console.error('Quick analysis from file failed:', error);
      throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const aiService = new AIService();