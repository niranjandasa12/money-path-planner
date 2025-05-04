
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY is not set',
        choices: [{
          message: {
            content: "I'm sorry, I cannot process your request because the API key is not configured. Please contact support."
          }
        }]
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to OpenAI with messages:', JSON.stringify(messages));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI financial advisor assistant. Provide helpful, professional advice about financial planning, investments, and money management. Keep responses clear, concise, and focused on financial topics.'
          },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${errorData.error?.message || response.status}`,
        choices: [{
          message: {
            content: "I'm sorry, I encountered an error processing your request. Please try again later."
          }
        }]
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI API response:', JSON.stringify(data));
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in advisor-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      choices: [{
        message: {
          content: "I'm sorry, I encountered an error processing your request. Please try again later."
        }
      }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
