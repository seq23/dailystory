import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const runwareApiKey = Deno.env.get('RUNWARE_API_KEY');

interface PromptStudioRequest {
  type: 'generate' | 'batch' | 'analyze';
  positivePrompt: string;
  negativePrompt?: string;
  userInfo?: {
    name: string;
    age: number;
    avatar?: {
      type: string;
      skinTone: string;
    };
  };
  difficultyLevel?: string;
  sessionId?: string;
  parameters?: {
    width?: number;
    height?: number;
    cfgScale?: number;
    steps?: number;
    model?: string;
    outputFormat?: string;
    seed?: number;
    numberResults?: number;
  };
  batchCount?: number;
  enhancementLevel?: 'minimal' | 'standard' | 'detailed';
}

interface PromptStudioResponse {
  success: boolean;
  imageURL?: string;
  imageURLs?: string[];
  enhancedPrompt?: string;
  analysis?: {
    originalLength: number;
    enhancedLength: number;
    optimizations: string[];
    strategy: string;
  };
  parameters?: any;
  cost?: number;
  seed?: number;
  error?: string;
}

// Advanced prompt enhancement using GPT-4o-mini
async function enhancePromptWithAI(
  prompt: string, 
  userInfo?: any, 
  difficultyLevel: string = 'medium',
  enhancementLevel: string = 'standard'
): Promise<{ enhancedPrompt: string; analysis: any }> {
  if (!openAIApiKey) {
    return { 
      enhancedPrompt: prompt, 
      analysis: { error: 'OpenAI API key not configured' } 
    };
  }

  const systemPrompt = `You are an expert prompt engineer for children's book illustrations. Transform simple scene descriptions into detailed, professional prompts for AI image generation.

CRITICAL QUALITY RULES:
- Always use specific descriptive details (colors, expressions, lighting, textures)
- Include character emotions and facial expressions
- Describe setting atmosphere and lighting conditions
- Add composition and artistic style elements
- Use warm, inviting tones suitable for children

SCENE DESCRIPTION BEST PRACTICES:
- Instead of "cat" → "Orange tabby cat with bright green eyes and friendly expression"  
- Instead of "children playing" → "Two diverse children with curly hair, laughing while building colorful block tower"
- Always include specific colors, lighting, and emotional context

Keep content age-appropriate and suitable for children's books.
Output only the enhanced prompt text, no explanations.`;

  const enhancementInstructions = {
    minimal: "Add basic visual details and children's book style",
    standard: "Add comprehensive visual details, lighting, and artistic style",
    detailed: "Add extensive visual details, composition, artistic techniques, and emotional atmosphere"
  };

  const userPrompt = `Transform this ${difficultyLevel} level scene for a children's book:
"${prompt}"

${userInfo ? `Main character: ${userInfo.name}, ${userInfo.age} years old, ${userInfo.avatar?.type || 'friendly'} appearance, ${userInfo.avatar?.skinTone || 'warm'} skin tone.` : ''}

Enhancement level: ${enhancementInstructions[enhancementLevel as keyof typeof enhancementInstructions]}

Create a professional illustration prompt suitable for children's book art.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 400
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;
    
    return {
      enhancedPrompt,
      analysis: {
        originalLength: prompt.length,
        enhancedLength: enhancedPrompt.length,
        optimizations: ['AI enhancement', 'Children\'s book style', 'Character consistency'],
        strategy: enhancementLevel
      }
    };
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return { 
      enhancedPrompt: prompt, 
      analysis: { error: error.message } 
    };
  }
}

// Connect to Runware via WebSocket
async function generateWithRunware(
  enhancedPrompt: string,
  negativePrompt: string,
  parameters: any
): Promise<any> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket("wss://ws-api.runware.ai/v1");
      let authenticated = false;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          ws.close();
          resolve({ success: false, error: 'Generation timeout' });
        }
      }, 30000);

      ws.onopen = () => {
        console.log("🔌 WebSocket connected to Runware");
        
        const authMessage = [{
          taskType: "authentication",
          apiKey: runwareApiKey
        }];
        
        ws.send(JSON.stringify(authMessage));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.data) {
            for (const item of response.data) {
              if (item.taskType === "authentication") {
                authenticated = true;
                console.log("✅ Authenticated with Runware");
                
                // Send image generation request
                const generationMessage = [{
                  taskType: "imageInference",
                  taskUUID: crypto.randomUUID(),
                  positivePrompt: enhancedPrompt,
                  negativePrompt: negativePrompt || "",
                  model: parameters.model || "runware:100@1",
                  width: parameters.width || 1024,
                  height: parameters.height || 1024,
                  numberResults: parameters.numberResults || 1,
                  outputFormat: parameters.outputFormat || "WEBP",
                  CFGScale: parameters.cfgScale || 3,
                  scheduler: "FlowMatchEulerDiscreteScheduler",
                  steps: parameters.steps || 8,
                  ...(parameters.seed && { seed: parameters.seed })
                }];
                
                ws.send(JSON.stringify(generationMessage));
              } else if (item.taskType === "imageInference") {
                clearTimeout(timeout);
                if (!resolved) {
                  resolved = true;
                  ws.close();
                  resolve({
                    success: true,
                    imageURL: item.imageURL,
                    cost: item.cost || 0.002,
                    seed: item.seed,
                    parameters: parameters
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ WebSocket message error:", error);
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: 'WebSocket connection failed' });
        }
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: 'WebSocket closed unexpectedly' });
        }
      };

    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  // Handle WebSocket upgrade for real-time connections
  const upgradeHeader = req.headers.get("upgrade");
  if (upgradeHeader?.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log("🔌 Prompt Studio WebSocket client connected");
      socket.send(JSON.stringify({ type: 'connected', message: 'Prompt Studio ready' }));
    };

    socket.onmessage = async (event) => {
      try {
        const request: PromptStudioRequest = JSON.parse(event.data);
        
        if (request.type === 'generate') {
          // Enhance prompt with AI
          const { enhancedPrompt, analysis } = await enhancePromptWithAI(
            request.positivePrompt,
            request.userInfo,
            request.difficultyLevel || 'medium',
            request.enhancementLevel || 'standard'
          );

          // Generate image with enhanced prompt
          const result = await generateWithRunware(
            enhancedPrompt,
            request.negativePrompt || "",
            request.parameters || {}
          );

          const response: PromptStudioResponse = {
            ...result,
            enhancedPrompt,
            analysis
          };

          socket.send(JSON.stringify(response));
          
        } else if (request.type === 'analyze') {
          // Just analyze and enhance the prompt without generation
          const { enhancedPrompt, analysis } = await enhancePromptWithAI(
            request.positivePrompt,
            request.userInfo,
            request.difficultyLevel || 'medium',
            request.enhancementLevel || 'standard'
          );

          const response: PromptStudioResponse = {
            success: true,
            enhancedPrompt,
            analysis
          };

          socket.send(JSON.stringify(response));
          
        } else if (request.type === 'batch') {
          // Batch generation
          const batchCount = request.batchCount || 4;
          const results = [];

          for (let i = 0; i < batchCount; i++) {
            const { enhancedPrompt } = await enhancePromptWithAI(
              request.positivePrompt,
              request.userInfo,
              request.difficultyLevel || 'medium',
              request.enhancementLevel || 'standard'
            );

            const result = await generateWithRunware(
              enhancedPrompt,
              request.negativePrompt || "",
              { ...request.parameters, seed: undefined } // Different seed each time
            );

            if (result.success) {
              results.push(result.imageURL);
            }

            // Send progress update
            socket.send(JSON.stringify({
              type: 'progress',
              completed: i + 1,
              total: batchCount,
              currentImage: result.success ? result.imageURL : null
            }));
          }

          socket.send(JSON.stringify({
            success: true,
            imageURLs: results,
            type: 'batch_complete'
          }));
        }
        
      } catch (error) {
        socket.send(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    };

    socket.onclose = () => {
      console.log("🔌 Prompt Studio WebSocket client disconnected");
    };

    return response;
  }

  // Handle regular HTTP requests for simple generation
  try {
    const request: PromptStudioRequest = await req.json();
    
    if (!runwareApiKey) {
      return createCorsErrorResponse('RUNWARE_API_KEY not configured', 500);
    }

    const { enhancedPrompt, analysis } = await enhancePromptWithAI(
      request.positivePrompt,
      request.userInfo,
      request.difficultyLevel || 'medium',
      request.enhancementLevel || 'standard'
    );

    const result = await generateWithRunware(
      enhancedPrompt,
      request.negativePrompt || "",
      request.parameters || {}
    );

    const response: PromptStudioResponse = {
      ...result,
      enhancedPrompt,
      analysis
    };

    return createCorsResponse(response);

  } catch (error) {
    console.error('❌ Prompt Studio error:', error);
    return createCorsErrorResponse(`Prompt Studio error: ${error.message}`, 500);
  }
});