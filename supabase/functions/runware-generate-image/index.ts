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
      // Enhanced skin tone mapping for accurate representation
      const skinToneMap = {
        'pale': 'very light skin tone, pale complexion',
        'light': 'light skin tone, fair complexion', 
        'medium': 'medium skin tone, warm brown complexion',
        'olive': 'olive skin tone, Mediterranean complexion',
        'dark': 'dark skin tone, beautiful deep brown African/African American complexion'
      };
      
      const consistentSkinTone = skinToneMap[skinTone] || 'medium skin tone';
      const genderDesc = avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young Black child';
      
      // Create highly specific character description for darker skin tones
      let characterConsistency;
      if (skinTone === 'dark') {
        characterConsistency = `${genderDesc} named ${characterName} with ${consistentSkinTone}, beautiful African/African American features, realistic representation, same character throughout`;
      } else {
        characterConsistency = `${genderDesc} named ${characterName} with ${consistentSkinTone}, same character appearance throughout the story`;
      }
      
      // Enhanced prompt with better representation
      if (skinTone === 'dark') {
        enhancedPrompt = `A vibrant, realistic children's book illustration depicting ${characterConsistency} in the scene: ${positivePrompt}. CRITICAL: The character ${characterName} must have beautiful dark skin tone with African/African American features, realistic and accurate representation, vibrant colors, detailed but child-appropriate, warm and welcoming children's book art style, diverse and inclusive, high quality, safe for children`;
      } else {
        enhancedPrompt = `A beautiful children's book illustration depicting ${characterConsistency} in the scene: ${positivePrompt}. CRITICAL: The character ${characterName} must always have the same ${consistentSkinTone} and appear as the same ${genderDesc} in every image. Consistent character design, warm and welcoming children's book art style, high quality, safe for children`;
      }
      
      console.log(`Generating enhanced image ${pageIndex + 1} for ${characterName} (${genderDesc} with ${consistentSkinTone})`);
    }

    // Enhanced quality and style enhancers with better representation
    enhancedPrompt += `, vibrant children's book illustration style, realistic skin tones, accurate representation, warm colors, friendly atmosphere, high quality detailed artwork, child-appropriate, consistent art style, diverse and inclusive`;

    // Enhanced negative prompt for better skin tone accuracy
    const negativePrompt = "blurry, low quality, distorted, scary, inappropriate, adult content, violence, weapons, dark themes, inconsistent character, different character, wrong skin tone, inaccurate skin color, whitewashed, wrong gender, pale when should be dark, light when should be dark";

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
              
              // Send image generation request with enhanced parameters for accurate representation
              const taskUUID = crypto.randomUUID();
              const imageMessage = [{
                taskType: "imageInference",
                taskUUID,
                positivePrompt: enhancedPrompt,
                negativePrompt: negativePrompt,
                model,
                width,
                height,
                numberResults,
                outputFormat,
                steps: 6, // Increased steps for better quality and accuracy
                CFGScale: Math.max(2, CFGScale), // Higher guidance for better prompt adherence
                scheduler,
                strength,
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