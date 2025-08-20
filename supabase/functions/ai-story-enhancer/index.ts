import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { EdgeErrorHandler, EdgeErrorType } from "../_shared/errorHandling.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  return EdgeErrorHandler.withPerformanceTracking(
    'ai-story-enhancer',
    'gpt-5-mini-2025-08-07',
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

    // AI-enhanced story analysis using GPT-5
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an AI story analyzer for children's book illustrations. Give the most concise breakdown prioritizing: 1) Characters and actions 2) Emotional state 3) Environment 4) Key objects. Be token-efficient.

CRITICAL: Return ONLY valid JSON with this exact structure:
{
  "characters": [{"name": "string", "description": "string", "emotions": "string"}],
  "setting": {"location": "string", "timeOfDay": "string", "weather": "string", "season": "string"},
  "objects": ["string"],
  "mood": "string",
  "narrativeElements": {"action": "string", "focus": "string", "perspective": "string"}
}

Focus on essential visual elements only. Be specific but concise about character appearances, key environmental details, lighting, and emotional atmosphere.`
          },
          {
            role: 'user',
            content: `Analyze this story text for page ${pageNumber} of ${totalPages}:

"${storyText}"

Extract all visual elements, characters, settings, objects, lighting, mood, and composition that would be needed to create a perfect children's book illustration for this scene.`
          }
        ],
        max_completion_tokens: 600
      }),
    });

    const aiResult = await response.json();
    
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('No content received from OpenAI');
    }

    let enhancedStoryData;
    try {
      enhancedStoryData = JSON.parse(aiResult.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResult.choices[0].message.content);
      // Fallback to basic structure
      enhancedStoryData = {
        characters: [{ name: "character", description: "child character", emotions: "curious" }],
        setting: { location: "indoor scene", timeOfDay: "daytime", weather: "clear", season: "spring" },
        objects: ["book"],
        mood: "cheerful",
        narrativeElements: { action: "reading", focus: "character", perspective: "eye level" }
      };
    }

    // Add context and metadata
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
        sceneType: enhancedStoryData.narrativeElements?.action || 'general',
        emotionalTone: enhancedStoryData.mood || 'neutral',
        visualFocus: enhancedStoryData.narrativeElements?.focus || 'balanced'
      }
    };

        console.log(`✅ AI Analysis complete: ${enhancedStoryData.characters?.length || 0} characters, ${enhancedStoryData.objects?.length || 0} objects`);

        return createCorsResponse(result);

      } catch (error) {
        // Return basic fallback structure on error with tracking
        const fallbackResult = {
          enhancedStoryData: {
            characters: [{ name: "character", description: "child character", emotions: "curious" }],
            setting: { location: "indoor scene", timeOfDay: "daytime", weather: "clear", season: "spring" },
            objects: ["book"],
            mood: "cheerful",
            narrativeElements: { action: "reading", focus: "character", perspective: "eye level" }
          },
          extractedElements: { characterCount: 1, objectCount: 1, complexity: 'simple' },
          contextualInfo: { pageNumber: 1, totalPages: 1, sessionId: '', processingTimestamp: new Date().toISOString() },
          narrativeEnhancements: { sceneType: 'general', emotionalTone: 'neutral', visualFocus: 'balanced' },
          error: error.message,
          fallbackUsed: true,
          performanceData: {
            gptModel: 'gpt-5-mini-2025-08-07',
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