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
      negativePrompt,
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

    // Validate prompt length and add fallback if needed
    if (!positivePrompt || positivePrompt.trim().length < 10) {
      console.log("Empty or insufficient prompt detected, using fallback");
      positivePrompt = "A beautiful children's book illustration showing a friendly character in a colorful, cheerful scene";
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
      
      // Create appropriate gender and ethnicity descriptions based on skin tone
      let genderDesc;
      if (skinTone === 'dark') {
        genderDesc = avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young Black child';
      } else {
        genderDesc = avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'young child';
      }
      
      // Create highly specific character description for all skin tones
      let characterConsistency;
      if (skinTone === 'dark') {
        characterConsistency = `${genderDesc} named ${characterName} with ${consistentSkinTone}, beautiful African/African American features, realistic representation, consistent character design, same facial features, matching proportions`;
      } else {
        characterConsistency = `${genderDesc} named ${characterName} with ${consistentSkinTone}, consistent character design, same facial features, matching proportions`;
      }
      
      // Enhanced prompt with better representation and copyright awareness
      if (skinTone === 'dark') {
        enhancedPrompt = `A vibrant, realistic children's book illustration depicting ${characterConsistency} in the scene: ${positivePrompt}. 
        
        original art style, no copyrighted characters, unique design
        
        CRITICAL: The character ${characterName} must have beautiful dark skin tone with African/African American features, realistic and accurate representation, vibrant colors, detailed but child-appropriate, warm and welcoming children's book art style, diverse and inclusive, high quality, safe for children, NO TEXT OR WORDS IN IMAGE`;
      } else {
        enhancedPrompt = `A beautiful children's book illustration depicting ${characterConsistency} in the scene: ${positivePrompt}. 
        
        original art style, no copyrighted characters, unique design
        
        CRITICAL: The character ${characterName} must always have the same ${consistentSkinTone} and appear as the same ${genderDesc} in every image. consistent character design, same facial features, matching proportions, warm and welcoming children's book art style, high quality, safe for children, NO TEXT OR WORDS IN IMAGE`;
      }
      
      console.log(`Generating enhanced image ${pageIndex + 1} for ${characterName} (${genderDesc} with ${consistentSkinTone})`);
    }

    // Validate and truncate prompt length if needed (Runware max: 3000 chars)
    if (enhancedPrompt.length > 2800) {
      console.log(`Prompt too long (${enhancedPrompt.length} chars), truncating...`);
      
      // Intelligent truncation: keep core content, trim style suffixes
      const coreContent = enhancedPrompt.substring(0, 2000);
      const qualitySuffix = ", high quality children's book illustration, vibrant colors, professional artwork, inclusive and diverse, text-free";
      enhancedPrompt = coreContent + qualitySuffix;
      
      console.log(`Truncated prompt to ${enhancedPrompt.length} characters`);
    } else {
      // COMPRESSED QUALITY: Essential style enhancers only
      enhancedPrompt += `, high quality children's book illustration, vibrant colors, professional artwork, inclusive and diverse, text-free`;
    }

    // SMART TEXT RULES: Enhanced negative prompt allowing environmental text but preventing story overlays
    const defaultNegativePrompt = "bad anatomy, blurry, low quality, distorted, watermark, text, signature, cropped, ugly, deformed";
    
    // Combine default negative prompt with any additional negative prompt
    const finalNegativePrompt = negativePrompt 
      ? `${defaultNegativePrompt}, ${negativePrompt}`
      : defaultNegativePrompt;

    // Create WebSocket connection to Runware
    const ws = new WebSocket("wss://ws-api.runware.ai/v1");
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        console.log("Request timeout after 45 seconds");
        resolve(new Response(
          JSON.stringify({ 
            success: false,
            error: "Request timeout",
            characterName: characterName || undefined,
            pageIndex
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        ));
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
          console.error("Runware API error:", response.errorMessage || response.errors?.[0]?.message);
          
          resolve(new Response(
            JSON.stringify({ 
              success: false,
              error: response.errorMessage || response.errors?.[0]?.message || "Generation failed",
              characterName: characterName || undefined,
              pageIndex
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          ));
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
                negativePrompt: finalNegativePrompt,
                model,
                width,
                height,
                numberResults,
                outputFormat,
                steps: 6, // Increased steps for better quality and accuracy
                CFGScale: Math.max(3, CFGScale), // Higher guidance for better prompt adherence and quality
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
        resolve(new Response(
          JSON.stringify({ 
            success: false,
            error: "WebSocket connection failed",
            characterName: characterName || undefined,
            pageIndex
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        ));
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
        characterName: characterName || undefined,
        pageIndex: pageIndex || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})