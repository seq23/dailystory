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
    console.log("Runware Generate Image function called");
    
    const { prompt, width, height, model, steps } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    if (!runwareApiKey) {
      throw new Error("Runware API key not configured");
    }

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
          width: width || 1024,
          height: height || 1024,
          model: model || "runware:100@1",
          numberResults: 1,
          outputFormat: "WEBP",
          CFGScale: 1,
          scheduler: "FlowMatchEulerDiscreteScheduler",
          strength: 0.8,
          steps: steps || 4,
        }
      ]),
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.data.find((item: any) => item.taskType === "imageInference");

    if (!imageData || !imageData.imageURL) {
      throw new Error("Failed to generate image");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        image_url: imageData.imageURL,
        image_uuid: imageData.imageUUID,
        seed: imageData.seed,
        prompt,
        model: model || "runware:100@1"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in runware-generate-image:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});