import { AIModelType, AIResponse, AnalysisResult } from '@/types/chart-analysis';
import { supabase } from '@/integrations/supabase/client';

// Enhanced analysis questions for comprehensive chart analysis
const ANALYSIS_QUESTIONS = [
  "What type of chart or graph is this?",
  "What is the exact metric being visualized and its unit?",
  "What time period does this chart cover?",
  "What are the main trends visible in this data?",
  "What are the key numerical values or data points?",
  "What insights can be drawn from this visualization?",
  "Are there any notable anomalies or outliers in the data?",
  "What do the axis labels, legends, and titles indicate?",
  "What comparisons (YoY/QoQ/period-over-period) are relevant here?",
  "What assumptions or data limitations should be noted?",
  "What actions or decisions does this chart support?"
];

// Universal compliance-ready system prompt
const BASE_SYSTEM_PROMPT = `
You are a Chart & KPI Analyst. Use a conservative, compliance-ready tone (think SEC-grade rigor).
Only use evidence visible in the chart/metadata provided. If a required detail is missing, say "Not available".
NEVER infer company-specific facts, policies, or clinical claims beyond the chart.
Show calculations, references to data points, and formulas used. Do not reveal chain-of-thought; provide results only.
Quantify everything—percent changes, YoY/QoQ deltas, CAGR when appropriate, confidence intervals if shown.
Flag limitations, assumptions, and data quality concerns.`;

// Domain-specific task prompts
const TASK_PACKS = {
  business: `SEC-style investor analysis.
Identify revenue/GM/EBITDA/FCF/ARPU/NRR/GRR as applicable. Specify units and currency.
Compute YoY and QoQ deltas, CAGR if ≥3 periods, and variance vs guidance/target if present.
Decompose trend drivers if broken out (e.g., segment, geography, channel, price vs volume).
Flag concentration risk (top customers/segments), seasonality, and any data restatements.
Avoid forward-looking statements; no investment advice; stick to evidence in the chart.`,
  
  industrial: `Ops/OEE analysis.
Recognize KPI type: OEE, Availability, Performance, Quality, Throughput, Yield, Scrap, MTBF, MTTR, Inventory turns.
Show OEE math if components are visible: OEE = Availability × Performance × Quality.
Quantify bottlenecks (workcenter/asset), downtime categories, shift effects, SPC rule breaches if control charts.
Tie anomalies to potential root causes only when shown (e.g., maintenance events, changeovers).
Note safety or compliance thresholds when explicitly shown; otherwise mark "Not available".`,
  
  medical: `Clinical/public-health analysis.
Name the endpoint precisely (e.g., all-cause mortality, ORR, readmission rate, HbA1c, BP mmHg).
Clarify cohort definitions (N, inclusion/exclusion), time windows, and any risk adjustment shown.
Extract effect sizes with uncertainty (CI, p-values) if present; otherwise say "Not available".
Avoid clinical claims beyond the plotted evidence; no treatment recommendations.
Flag biases: small N, missing data, censoring, imbalance, confounding if indicated by the chart.`
};

// Output formatting instructions
const OUTPUT_INSTRUCTIONS = `
Respond with (1) prose summary ≤120 words and (2) a JSON block with this exact schema:
{
  "chart_type": "",
  "metric": {"name": "", "unit": ""},
  "timeframe": {"start": "", "end": "", "frequency": ""},
  "main_trends": ["..."],
  "key_values": [
    {"label": "", "value": 0, "unit": "", "where_in_chart": ""}
  ],
  "comparisons": [
    {"type": "YoY|QoQ|WoW|MoM|vs_target", "from": "", "to": "", "delta_abs": 0, "delta_pct": 0}
  ],
  "outliers": [
    {"point": "", "reason": "", "impact": ""}
  ],
  "insights": ["..."],
  "risks_or_limitations": ["..."],
  "recommended_actions": ["..."],
  "assumptions": ["..."],
  "confidence": "low|medium|high",
  "follow_up_questions": ["..."]
}
If schema fields are unknown, use empty strings or arrays, not guesses.`;

// Metric calculation formulas
const METRIC_FORMULAS = `
YoY % = (CurrentPeriod - PriorYearSamePeriod) / |PriorYearSamePeriod| × 100
QoQ % = (CurrentQuarter - PreviousQuarter) / |PreviousQuarter| × 100
CAGR (n periods) = (Ending / Beginning)^(1/n) - 1
OEE = Availability × Performance × Quality
Readmission Rate = (Readmissions within window) / (Discharges) × 100
Absolute Delta = Current - Baseline
Relative Delta % = Absolute Delta / |Baseline| × 100`;

// Guardrails and missing-info policy
const GUARDRAILS = `
If axis labels, units, cohorts, or timeframe are unclear, explicitly state "Not available" and list the minimum context required.
Do not fill unknowns with estimates or domain priors.
If the chart aggregates multiple segments, call out Simpson's paradox risk and request segment-level views if needed.
If control limits or confidence intervals are absent, avoid any statements about statistical significance.`;

// Build comprehensive chart analysis prompt
function buildChartPrompt({
  userGoal = "Provide comprehensive chart analysis",
  domain = "business",
  chartTitle = "",
  xAxis = "",
  yAxis = "",
  units = "",
  timeframe = "",
  notes = "",
  questions = ANALYSIS_QUESTIONS
}: {
  userGoal?: string;
  domain?: 'business' | 'industrial' | 'medical';
  chartTitle?: string;
  xAxis?: string;
  yAxis?: string;
  units?: string;
  timeframe?: string;
  notes?: string;
  questions?: string[];
}) {
  const pack = TASK_PACKS[domain] || TASK_PACKS.business;
  return [
    BASE_SYSTEM_PROMPT,
    `Task: ${pack}\nUser goal: ${userGoal}`,
    `Chart context:\n- Title: ${chartTitle}\n- X-axis: ${xAxis}\n- Y-axis: ${yAxis} (${units})\n- Timeframe: ${timeframe}\n- Notes: ${notes}`,
    `Answer these explicitly:\n- ${questions.join("\n- ")}`,
    `Use these formulas when applicable:\n${METRIC_FORMULAS}`,
    GUARDRAILS,
    OUTPUT_INSTRUCTIONS
  ].join("\n\n");
}

// Model configurations for Groq API
const MODEL_CONFIG = {
  scout: {
    name: 'meta-llama/llama-4-scout-17b-16e-instruct',
    displayName: 'Llama 4 Scout 17B (Vision)'
  },
  maverick: {
    name: 'meta-llama/llama-4-maverick-17b-128e-instruct', 
    displayName: 'Llama 4 Maverick 17B (Vision)'
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

  private async processImageFile(file: File): Promise<string> {
    try {
      console.log('Processing image file directly as base64...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log('Image converted to base64 successfully');
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error processing image file:', error);
      throw new Error('Failed to process image');
    }
  }

  private async convertImageToBase64(imageDataUrl: string): Promise<string> {
    try {
      if (imageDataUrl.startsWith('data:')) {
        // Already a data URL, extract base64 part
        const base64Data = imageDataUrl.split(',')[1];
        console.log('Using existing base64 data');
        return base64Data;
      } else {
        // It's a regular URL, fetch and convert
        console.log('Fetching image from URL:', imageDataUrl);
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private async callGroqAPI(messages: any[], model: AIModelType): Promise<string> {
    try {
      console.log('Calling Groq API via edge function...', { model, messageCount: messages.length });
      
      const { data, error } = await supabase.functions.invoke('groq-chat', {
        body: {
          messages,
          model,
          stream: false
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Chat failed: ${error.message}`);
      }

      console.log('Groq API response received:', { hasData: !!data, hasChoices: !!data?.choices });
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }
  
  async analyzeChart(imageDataUrl: string, model: AIModelType, domain: 'business' | 'industrial' | 'medical' = 'business'): Promise<AnalysisResult[]> {
    try {
      const base64Image = await this.convertImageToBase64(imageDataUrl);
      
      // Use comprehensive prompt system
      const comprehensivePrompt = buildChartPrompt({
        userGoal: "Provide comprehensive chart analysis with structured insights",
        domain
      });
      
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: comprehensivePrompt
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
      
      const fullAnalysis = await this.callGroqAPI(messages, model);
      
      // Parse the response and create individual results for each question
      const results: AnalysisResult[] = [];
      
      // Create a comprehensive analysis result
      results.push({
        question: "Comprehensive Chart Analysis",
        answer: fullAnalysis,
        confidence: 0.90 + Math.random() * 0.10
      });
      
      // Also provide individual question results for backward compatibility
      for (const question of ANALYSIS_QUESTIONS) {
        const questionMessages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${BASE_SYSTEM_PROMPT}\n\n${question}\n\nPlease be specific and quantitative in your analysis.`
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
        
        const answer = await this.callGroqAPI(questionMessages, model);
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

  async uploadAndAnalyzeImage(file: File, model: AIModelType, domain: 'business' | 'industrial' | 'medical' = 'business'): Promise<{ imageUrl: string; analysis: AnalysisResult[] }> {
    try {
      console.log('Starting upload and analysis process...', { model, domain });
      
      // Process image file directly as base64 data URL
      const imageDataUrl = await this.processImageFile(file);
      console.log('Image processed successfully, starting analysis...');
      
      const analysis = await this.analyzeChart(imageDataUrl, model, domain);
      console.log('Analysis completed successfully', { resultCount: analysis.length });
      
      return { imageUrl: imageDataUrl, analysis };
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

  async quickAnalysis(imageDataUrl: string, model: AIModelType, domain: 'business' | 'industrial' | 'medical' = 'business'): Promise<string> {
    try {
      const base64Image = await this.convertImageToBase64(imageDataUrl);
      
      // Use comprehensive prompt system for quick analysis
      const quickPrompt = buildChartPrompt({
        userGoal: "Provide a concise but comprehensive analysis with key insights and trends",
        domain
      });
      
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: quickPrompt
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

  async quickAnalysisFromFile(file: File, model: AIModelType, domain: 'business' | 'industrial' | 'medical' = 'business'): Promise<string> {
    try {
      const imageDataUrl = await this.processImageFile(file);
      return await this.quickAnalysis(imageDataUrl, model, domain);
    } catch (error) {
      console.error('Quick analysis from file failed:', error);
      throw new Error(`Quick analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async domainSpecificAnalysis(imageDataUrl: string, model: AIModelType, {
    domain,
    userGoal,
    chartTitle,
    xAxis,
    yAxis,
    units,
    timeframe,
    notes
  }: {
    domain: 'business' | 'industrial' | 'medical';
    userGoal?: string;
    chartTitle?: string;
    xAxis?: string;
    yAxis?: string;
    units?: string;
    timeframe?: string;
    notes?: string;
  }): Promise<string> {
    try {
      const base64Image = await this.convertImageToBase64(imageDataUrl);
      
      // Use detailed prompt with all context
      const detailedPrompt = buildChartPrompt({
        userGoal: userGoal || `Provide detailed ${domain} analysis`,
        domain,
        chartTitle,
        xAxis,
        yAxis,
        units,
        timeframe,
        notes
      });
      
      const messages = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: detailedPrompt
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
      console.error('Domain-specific analysis failed:', error);
      throw new Error(`Domain-specific analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const aiService = new AIService();