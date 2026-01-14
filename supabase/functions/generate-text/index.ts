
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, system, temperature = 0.7, max_tokens = 1000, format = 'text', model = 'gpt-4o-mini' } = await req.json()

    console.log('[generate-text] Received request:', { 
      promptLength: prompt?.length, 
      system: system?.substring(0, 50), 
      temperature, 
      max_tokens, 
      format, 
      model 
    })

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('[generate-text] OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase Edge Function secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call OpenAI API
    const messages = []
    if (system) {
      messages.push({ role: 'system', content: system })
    }
    messages.push({ role: 'user', content: prompt })

    console.log('[generate-text] Calling OpenAI API with model:', model)

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens,
        response_format: format === 'json' ? { type: 'json_object' } : undefined,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('[generate-text] OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate text from OpenAI', details: errorData }),
        { status: openaiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const generatedText = data.choices[0]?.message?.content || ''

    console.log('[generate-text] Successfully generated text, length:', generatedText.length)

    // Return the text directly instead of creating a blob URL
    return new Response(
      JSON.stringify({ 
        text: generatedText,
        usage: data.usage 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('[generate-text] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
