import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { DifficultyLevelMapper } from "../_shared/DifficultyLevelMapper.js";
import { MultiStageEnhancementPipeline } from "../_shared/MultiStageEnhancementPipeline.js";

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

// Enhanced prompt processing using MultiStageEnhancementPipeline
async function enhancePromptWithPipeline(
  prompt: string, 
  userInfo?: any, 
  difficultyLevel: string = 'medium',
  enhancementLevel: string = 'standard'
): Promise<{ enhancedPrompt: string; analysis: any }> {
  try {
    console.log(`🎨 Prompt Studio using MultiStageEnhancementPipeline for: "${prompt.substring(0, 50)}..."`);
    
    // Map difficulty level for pipeline
    const mappedDifficulty = DifficultyLevelMapper.mapToImageDifficulty(userInfo || { readingLevel: difficultyLevel });
    console.log(`🔧 Mapped difficulty: ${mappedDifficulty} from input: ${difficultyLevel}`, {
      originalInput: difficultyLevel,
      userReadingLevel: userInfo?.readingLevel,
      finalMappedLevel: mappedDifficulty
    });

    // Process through the comprehensive pipeline
    const enhancementResult = await MultiStageEnhancementPipeline.processThroughPipeline(
      prompt,
      userInfo,
      crypto.randomUUID(), // sessionId
      1, // pageNumber
      1  // totalPages
    );

    console.log(`✅ Pipeline enhancement completed with quality score: ${enhancementResult.qualityScore}`);

    return {
      enhancedPrompt: enhancementResult.enhancedPrompt,
      analysis: {
        originalLength: prompt.length,
        enhancedLength: enhancementResult.enhancedPrompt.length,
        optimizations: enhancementResult.appliedOptimizations || ['Cultural intelligence', 'Emotional context', 'Quality enhancement'],
        strategy: enhancementLevel,
        qualityScore: enhancementResult.qualityScore,
        culturalContext: enhancementResult.culturalContext,
        emotionalContext: enhancementResult.emotionalContext
      }
    };
  } catch (error) {
    console.error('❌ Pipeline enhancement failed:', error);
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
          // Enhance prompt with MultiStageEnhancementPipeline
          const { enhancedPrompt, analysis } = await enhancePromptWithPipeline(
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
          const { enhancedPrompt, analysis } = await enhancePromptWithPipeline(
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
            const { enhancedPrompt } = await enhancePromptWithPipeline(
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

    const { enhancedPrompt, analysis } = await enhancePromptWithPipeline(
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