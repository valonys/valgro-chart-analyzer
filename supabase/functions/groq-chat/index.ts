import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found');
      throw new Error('Groq API key not configured');
    }

    const { messages, model, stream = false } = await req.json();
    
    if (!messages || !model) {
      throw new Error('Missing required fields: messages and model');
    }

    const modelName = MODEL_CONFIG[model as keyof typeof MODEL_CONFIG]?.name;
    if (!modelName) {
      throw new Error(`Invalid model: ${model}`);
    }

    console.log(`Making Groq API call with model: ${modelName}`);

    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: 1000,
        temperature: 0.3,
        stream: stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    if (stream) {
      // For streaming responses, return the response directly
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });
    } else {
      // For non-streaming responses, parse and return JSON
      const data = await response.json();
      console.log('Groq API response received successfully');
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});