import { AIModel, AIResponse, AnalysisResult } from '@/types/chart-analysis';

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

// Mock AI service to simulate Groq API calls
export class AIService {
  private async simulateAICall(prompt: string, model: AIModel): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Mock responses based on model and prompt type
    if (prompt.includes("chart") || prompt.includes("graph")) {
      const responses = [
        `Based on my analysis using ${model === 'scout' ? 'Llama-4 Scout' : 'Llama-4 Maverick'}, this appears to be a comprehensive data visualization showing multiple data series with clear trending patterns.`,
        `The visualization demonstrates significant correlations between variables, with notable peaks and valleys that suggest seasonal or cyclical patterns in the underlying data.`,
        `Key insights from this chart include upward trends in the primary metrics, with confidence intervals indicating statistical significance in the observed patterns.`,
        `This data representation shows clear segmentation across different categories, with varying performance levels that warrant further investigation into root causes.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // General chat responses
    const chatResponses = [
      `Using advanced ${model === 'scout' ? 'Scout' : 'Maverick'} analysis capabilities, I can help you understand the patterns and insights in your chart data.`,
      `Based on the context of our previous analysis, I notice several interesting correlations that might be relevant to your question.`,
      `Let me analyze this in the context of the chart data we've been discussing. The patterns suggest...`,
      `From an analytical perspective, considering the data visualization we're examining, I can provide insights on...`
    ];
    
    return chatResponses[Math.floor(Math.random() * chatResponses.length)];
  }
  
  async analyzeChart(imageUrl: string, model: AIModel): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];
    
    for (const question of ANALYSIS_QUESTIONS) {
      const answer = await this.simulateAICall(`Analyze this chart: ${question}`, model);
      results.push({
        question,
        answer,
        confidence: 0.85 + Math.random() * 0.15 // Simulate confidence scores
      });
    }
    
    return results;
  }
  
  async chatWithAI(message: string, model: AIModel, context?: string): Promise<AIResponse> {
    let prompt = message;
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }
    
    const content = await this.simulateAICall(prompt, model);
    
    return {
      content,
      model,
      timestamp: new Date(),
      confidence: 0.80 + Math.random() * 0.20
    };
  }
  
  async quickAnalysis(imageUrl: string, model: AIModel): Promise<string> {
    return this.simulateAICall(`Provide a quick analysis of this chart visualization`, model);
  }
}

export const aiService = new AIService();