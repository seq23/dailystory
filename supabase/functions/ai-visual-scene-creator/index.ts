import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("AI Visual Scene Creator function called");
    
    const { prompt, style, mood } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Create visual scene description
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a visual scene creator for children's stories. Create detailed, vivid scene descriptions that are safe and age-appropriate.`
          },
          {
            role: "user",
            content: `Create a visual scene description for: ${prompt}. Style: ${style || 'colorful'}. Mood: ${mood || 'cheerful'}.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const sceneDescription = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        success: true, 
        sceneDescription,
        prompt,
        style: style || 'colorful',
        mood: mood || 'cheerful'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-visual-scene-creator:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});