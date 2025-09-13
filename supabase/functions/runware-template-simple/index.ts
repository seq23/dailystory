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
    console.log("Runware Template Simple function called");
    
    const { prompt, size } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    if (!runwareApiKey) {
      throw new Error("Runware API key not configured");
    }

    // Simple size mapping
    let width = 1024, height = 1024;
    if (size === "square") {
      width = height = 1024;
    } else if (size === "landscape") {
      width = 1536; height = 1024;
    } else if (size === "portrait") {
      width = 1024; height = 1536;
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
          width,
          height,
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
        prompt,
        size: `${width}x${height}`,
        seed: imageData.seed
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in runware-template-simple:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});