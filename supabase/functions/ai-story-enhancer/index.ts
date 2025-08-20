import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { EdgeErrorHandler, EdgeErrorType } from "../_shared/errorHandling.ts";

// AI Model Fallback Chain Configuration
const AI_MODELS = [
  { name: 'gpt-4.1-mini-2025-04-14', maxTokens: 'max_tokens', supportsTemperature: true },
  { name: 'gpt-5-mini-2025-08-07', maxTokens: 'max_completion_tokens', supportsTemperature: false },
  { name: 'gpt-4o-mini', maxTokens: 'max_tokens', supportsTemperature: true }
] as const;

async function callOpenAIWithFallback(messages: any[], timeout = 8000) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  for (let modelIndex = 0; modelIndex < AI_MODELS.length; modelIndex++) {
    const model = AI_MODELS[modelIndex];
    console.log(`🤖 Trying model ${modelIndex + 1}/${AI_MODELS.length}: ${model.name}`);
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const requestBody: any = {
          model: model.name,
          messages,
          [model.maxTokens]: 600
        };
        
        // Only add temperature for models that support it
        if (model.supportsTemperature) {
          requestBody.temperature = 0.3;
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Model ${model.name} succeeded on attempt ${attempt}`);
          return result;
        } else if (response.status === 503 || response.status === 429) {
          console.warn(`⚠️ Model ${model.name} returned ${response.status} on attempt ${attempt}, retrying...`);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            continue;
          }
        } else {
          console.error(`❌ Model ${model.name} failed with status ${response.status}`);
          break; // Don't retry on non-transient errors
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`⏰ Model ${model.name} timed out after ${timeout}ms on attempt ${attempt}`);
        } else {
          console.error(`❌ Model ${model.name} error on attempt ${attempt}:`, error.message);
        }
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    console.warn(`❌ Model ${model.name} failed after 2 attempts, trying next model...`);
  }
  
  throw new Error('All AI models failed after multiple attempts');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  return EdgeErrorHandler.withPerformanceTracking(
    'ai-story-enhancer',
    'fallback-chain',
    async () => {
      try {
        const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
        EdgeErrorHandler.validateRequest({
          pageText: undefined,
          positivePrompt: undefined,
          apiKey: openAIApiKey,
          functionName: 'ai-story-enhancer'
        });

        const { storyText, userInfo, sessionId, pageNumber, totalPages } = await req.json();

        if (!storyText) {
          throw {
            type: EdgeErrorType.VALIDATION,
            message: 'Missing required parameter: storyText'
          };
        }

    console.log(`🧠 AI Story Enhancer: Processing page ${pageNumber}/${totalPages} for session ${sessionId}`);

    const messages = [
      {
        role: 'system',
        content: `NO HALLUCINATIONS. NO ASSUMPTIONS. EXTRACT ONLY WHAT IS EXPLICITLY MENTIONED.

Extract specific details from the provided text ONLY for what is directly stated. Do NOT add details, assumptions, or interpretations.

CRITICAL RULES:
- If characters are not named, use "character" not made-up names
- If location is not specified, use "indoor scene" or "outdoor scene" based only on clear context
- If emotions are not stated, use "neutral" 
- If objects are not mentioned, return empty array
- If actions are not clear, use "general activity"
- NEVER add descriptive details not in the original text

Return ONLY valid JSON:
{
  "characters": [{"name": "character", "description": "child", "emotions": "neutral"}],
  "setting": {"location": "indoor scene", "timeOfDay": "daytime", "weather": "clear", "season": "unspecified"},
  "objects": [],
  "mood": "neutral",
  "narrativeElements": {"action": "general activity", "focus": "character", "perspective": "eye level"}
}

Extract ONLY what is explicitly written. Add nothing extra.`
      },
      {
        role: 'user',
        content: `Text content for page ${pageNumber} of ${totalPages}:

"${storyText}"

Extract ONLY what is explicitly stated in this text. Do not infer, assume, or add details. Focus on:
- Characters mentioned by name (if any)  
- Actions explicitly described
- Objects specifically mentioned
- Location if clearly stated
- Emotions if directly expressed

Return only facts from the text.`
      }
    ];

    // Call OpenAI with model fallback chain
    const aiResult = await callOpenAIWithFallback(messages);
    
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI fallback chain');
    }

    let enhancedStoryData;
    let aiValidationPassed = false;
    
    try {
      enhancedStoryData = JSON.parse(aiResult.choices[0].message.content);
      
      // AI VALIDATION LAYER - Check for hallucinations
      const originalText = storyText.toLowerCase();
      const aiResponse = JSON.stringify(enhancedStoryData).toLowerCase();
      
      // Check if AI added details not in original text
      const suspiciousAdditions = [];
      
      // Check character names
      if (enhancedStoryData.characters) {
        for (const char of enhancedStoryData.characters) {
          if (char.name && char.name !== "character" && !originalText.includes(char.name.toLowerCase())) {
            suspiciousAdditions.push(`character name: ${char.name}`);
          }
        }
      }
      
      // Check for specific objects that weren't mentioned
      if (enhancedStoryData.objects) {
        for (const obj of enhancedStoryData.objects) {
          if (!originalText.includes(obj.toLowerCase())) {
            suspiciousAdditions.push(`object: ${obj}`);
          }
        }
      }
      
      // Check for specific location details
      if (enhancedStoryData.setting?.location && 
          enhancedStoryData.setting.location !== "indoor scene" && 
          enhancedStoryData.setting.location !== "outdoor scene" &&
          !originalText.includes(enhancedStoryData.setting.location.toLowerCase())) {
        suspiciousAdditions.push(`location: ${enhancedStoryData.setting.location}`);
      }
      
      if (suspiciousAdditions.length > 0) {
        console.warn(`🚨 AI Hallucination detected: ${suspiciousAdditions.join(', ')}`);
        console.log(`📝 Original text: "${storyText}"`);
        console.log(`🤖 AI response: ${JSON.stringify(enhancedStoryData)}`);
        
        // Use safe fallback to prevent hallucinations
        enhancedStoryData = {
          characters: [{ name: "character", description: "child", emotions: "neutral" }],
          setting: { location: "indoor scene", timeOfDay: "daytime", weather: "clear", season: "unspecified" },
          objects: [],
          mood: "neutral",
          narrativeElements: { action: "general activity", focus: "character", perspective: "eye level" }
        };
        aiValidationPassed = false;
      } else {
        aiValidationPassed = true;
        console.log('✅ AI validation passed - no hallucinations detected');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResult.choices[0].message.content);
      // Fallback to basic structure
      enhancedStoryData = {
        characters: [{ name: "character", description: "child", emotions: "neutral" }],
        setting: { location: "indoor scene", timeOfDay: "daytime", weather: "clear", season: "unspecified" },
        objects: [],
        mood: "neutral",
        narrativeElements: { action: "general activity", focus: "character", perspective: "eye level" }
      };
      aiValidationPassed = false;
    }

    // Add context and metadata with validation info
    const result = {
      enhancedStoryData,
      extractedElements: {
        characterCount: enhancedStoryData.characters?.length || 0,
        objectCount: enhancedStoryData.objects?.length || 0,
        complexity: storyText.length > 200 ? 'complex' : storyText.length > 100 ? 'medium' : 'simple'
      },
      contextualInfo: {
        pageNumber,
        totalPages,
        sessionId,
        originalTextLength: storyText.length,
        processingTimestamp: new Date().toISOString()
      },
      narrativeEnhancements: {
        sceneType: enhancedStoryData.narrativeElements?.action || 'general activity',
        emotionalTone: enhancedStoryData.mood || 'neutral',
        visualFocus: enhancedStoryData.narrativeElements?.focus || 'character'
      },
      validation: {
        aiValidationPassed,
        hallucinationCheck: aiValidationPassed ? 'passed' : 'failed',
        originalTextPreserved: true,
        modelUsed: aiResult.model || 'fallback-chain'
      }
    };

        console.log(`✅ AI Analysis complete: ${enhancedStoryData.characters?.length || 0} characters, ${enhancedStoryData.objects?.length || 0} objects, validation: ${aiValidationPassed ? 'PASSED' : 'FAILED'}`);

        return createCorsResponse(result);

      } catch (error) {
        // Return basic fallback structure on error with tracking
        const fallbackResult = {
          enhancedStoryData: {
            characters: [{ name: "character", description: "child", emotions: "neutral" }],
            setting: { location: "indoor scene", timeOfDay: "daytime", weather: "clear", season: "unspecified" },
            objects: [],
            mood: "neutral",
            narrativeElements: { action: "general activity", focus: "character", perspective: "eye level" }
          },
          extractedElements: { characterCount: 1, objectCount: 1, complexity: 'simple' },
          contextualInfo: { pageNumber: 1, totalPages: 1, sessionId: '', processingTimestamp: new Date().toISOString() },
          narrativeEnhancements: { sceneType: 'general', emotionalTone: 'neutral', visualFocus: 'balanced' },
          error: error.message,
          fallbackUsed: true,
          performanceData: {
            gptModel: 'fallback-chain-failed',
            tokenUsage: 'unknown',
            responseTime: 'failed'
          }
        };

        console.log('🔄 Using fallback content due to AI analysis failure');
        return createCorsResponse(fallbackResult);
      }
    }
  );
});