import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      positivePrompt, 
      model = "runware:100@1",
      width = 1024,
      height = 1024,
      numberResults = 1,
      outputFormat = "WEBP",
      CFGScale = 1,
      scheduler = "FlowMatchEulerDiscreteScheduler",
      strength = 0.8,
      seed,
      // Character consistency parameters
      characterName,
      characterDescription,
      skinTone,
      avatarType,
      storyTheme,
      pageIndex = 0
    } = await req.json()
    
    const runwareApiKey = Deno.env.get('RUNWARE_API_KEY')
    if (!runwareApiKey) {
      throw new Error('Runware API key not configured')
    }

    // Build consistent character description for all images
    let enhancedPrompt = positivePrompt;
    
    if (characterName && characterDescription) {
      // Map skin tone to consistent descriptions
      const skinToneMap = {
        'pale': 'very light skin tone',
        'light': 'light skin tone', 
        'medium': 'medium skin tone',
        'olive': 'olive skin tone',
        'dark': 'dark skin tone'
      };
      
      const consistentSkinTone = skinToneMap[skinTone] || 'medium skin tone';
      const genderDesc = avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'child';
      
      // Create consistent character appearance description
      const characterConsistency = `${genderDesc} named ${characterName} with ${consistentSkinTone}, same character appearance throughout the story`;
      
      // Enhance the prompt with character consistency
      enhancedPrompt = `A beautiful children's book illustration depicting ${characterConsistency} in the scene: ${positivePrompt}. CRITICAL: The character ${characterName} must always have the same ${consistentSkinTone} and appear as the same ${genderDesc} in every image. Consistent character design, warm and welcoming children's book art style, high quality, safe for children`;
      
      console.log(`Generating image ${pageIndex + 1} for ${characterName} (${genderDesc} with ${consistentSkinTone})`);
    }

    // Add quality and style enhancers
    enhancedPrompt += `, children's book illustration style, warm colors, friendly atmosphere, high quality artwork, detailed but child-appropriate, consistent art style`;

    // Create WebSocket connection to Runware
    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Request timeout'));
      }, 45000); // 45 second timeout for better reliability

      ws.onopen = () => {
        console.log("WebSocket connected to Runware");
        
        // Send authentication
        const authMessage = [{
          taskType: "authentication",
          apiKey: runwareApiKey
        }];
        
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        console.log("Runware response:", response);
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          reject(new Error(response.errorMessage || response.errors?.[0]?.message || "Generation failed"));
          return;
        }

        if (response.data) {
          response.data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              console.log("Authenticated with Runware");
              
              // Send image generation request with enhanced parameters
              const taskUUID = crypto.randomUUID();
              const imageMessage = [{
                taskType: "imageInference",
                taskUUID,
                positivePrompt: enhancedPrompt,
                model,
                width,
                height,
                numberResults,
                outputFormat,
                steps: 4, // Fast generation
                CFGScale: Math.max(1, CFGScale), // Ensure minimum guidance
                scheduler,
                strength,
                // Add negative prompt for better quality
                negativePrompt: "blurry, low quality, distorted, scary, inappropriate, adult content, violence, weapons, dark themes, inconsistent character, different character, wrong skin tone, wrong gender",
                ...(seed && { seed })
              }];
              
              console.log("Sending enhanced image generation request");
              ws.send(JSON.stringify(imageMessage));
              
            } else if (item.taskType === "imageInference") {
              clearTimeout(timeout);
              ws.close();
              
              // Log successful generation with character details
              if (characterName) {
                console.log(`Successfully generated consistent image for ${characterName} (page ${pageIndex + 1})`);
              }
              
              resolve(new Response(
                JSON.stringify({
                  success: true,
                  imageURL: item.imageURL,
                  seed: item.seed,
                  cost: item.cost,
                  NSFWContent: item.NSFWContent,
                  characterName: characterName || undefined,
                  pageIndex,
                  prompt: enhancedPrompt
                }),
                { 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
              ));
            }
          });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        ws.close();
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection failed"));
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          console.log("WebSocket closed unexpectedly:", event.code, event.reason);
        }
      };
    });

  } catch (error) {
    console.error('Image generation error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        characterName: req.body?.characterName,
        pageIndex: req.body?.pageIndex || 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})