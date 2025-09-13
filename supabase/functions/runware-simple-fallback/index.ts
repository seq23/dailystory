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
    console.log("Runware Simple Fallback function called");
    
    const { prompt, fallback_style } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    
    // Try Runware first
    if (runwareApiKey) {
      try {
        const response = await fetch("https://api.runware.ai/v1", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            {
              taskType: "authentication",
              apiKey: runwareApiKey,
            },
            {
              taskType: "imageInference",
              taskUUID: crypto.randomUUID(),
              positivePrompt: prompt,
              width: 512,
              height: 512,
              model: "runware:100@1",
              numberResults: 1,
              outputFormat: "WEBP",
              CFGScale: 1,
              scheduler: "FlowMatchEulerDiscreteScheduler",
              strength: 0.8,
              steps: 4,
            }
          ]),
        });

        if (response.ok) {
          const data = await response.json();
          const imageData = data.data.find((item: any) => item.taskType === "imageInference");
          
          if (imageData && imageData.imageURL) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                image_url: imageData.imageURL,
                source: "runware",
                prompt
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (error) {
        console.log("Runware failed, attempting fallback:", error.message);
      }
    }

    // Fallback to OpenAI DALL-E
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiApiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "url"
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data[0] && data.data[0].url) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                image_url: data.data[0].url,
                source: "openai",
                prompt
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (error) {
        console.log("OpenAI fallback failed:", error.message);
      }
    }

    // Ultimate fallback - placeholder
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "All image generation services unavailable",
        fallback_url: "https://via.placeholder.com/512x512/e0e0e0/666666?text=Image+Generation+Unavailable",
        source: "placeholder"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in runware-simple-fallback:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});