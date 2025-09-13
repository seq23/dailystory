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
    console.log("Runware Template Advanced function called");
    
    const { 
      prompt, 
      negative_prompt,
      width, 
      height, 
      model, 
      steps,
      cfg_scale,
      scheduler,
      seed,
      num_images
    } = await req.json();
    
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const runwareApiKey = Deno.env.get("RUNWARE_API_KEY");
    if (!runwareApiKey) {
      throw new Error("Runware API key not configured");
    }

    const imageRequests = [];
    for (let i = 0; i < (num_images || 1); i++) {
      imageRequests.push({
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        ...(negative_prompt && { negativePrompt: negative_prompt }),
        width: width || 1024,
        height: height || 1024,
        model: model || "runware:100@1",
        numberResults: 1,
        outputFormat: "WEBP",
        CFGScale: cfg_scale || 7,
        scheduler: scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: 0.8,
        steps: steps || 20,
        ...(seed && { seed: seed })
      });
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
        ...imageRequests
      ]),
    });

    if (!response.ok) {
      throw new Error(`Runware API error: ${response.status}`);
    }

    const data = await response.json();
    const imageResults = data.data.filter((item: any) => item.taskType === "imageInference");

    if (!imageResults || imageResults.length === 0) {
      throw new Error("Failed to generate images");
    }

    const images = imageResults.map((result: any) => ({
      image_url: result.imageURL,
      image_uuid: result.imageUUID,
      seed: result.seed,
      nsfw_content: result.NSFWContent || false
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        images,
        config: {
          prompt,
          negative_prompt,
          width: width || 1024,
          height: height || 1024,
          model: model || "runware:100@1",
          steps: steps || 20,
          cfg_scale: cfg_scale || 7,
          scheduler: scheduler || "FlowMatchEulerDiscreteScheduler"
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in runware-template-advanced:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});