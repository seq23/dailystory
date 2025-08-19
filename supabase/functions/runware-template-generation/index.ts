import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, createCorsOptionsResponse } from "../_shared/cors.ts";
import { StructuredPromptEngine } from "../_shared/StructuredPromptEngine.js";
import { AdvancedQualityEngine } from "../_shared/AdvancedQualityEngine.js";
import { getStyleFramework, buildCompletePrompt, getOptimizedParameters } from "../_shared/styleFrameworks.js";
import { MulticulturalVisualService } from "../_shared/cultural-visual-service.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmotionalContext {
  mood: string;
  intensity: number;
  colorPalette: string;
  lighting: string;
}

interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'secondary';
  relationship?: string;
  physicalTraits: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    console.log('🏭 Tier 2: Template-based image generation starting...');
    
    const { pageText, sessionId, userInfo, pageNumber = 1, totalPages = 10 } = await req.json();

    if (!pageText) {
      return createCorsErrorResponse('Missing pageText parameter', 400);
    }

    // Validate user info for consistency
    const validationResult = validateUserInfo(userInfo);
    if (!validationResult.valid) {
      console.warn(`⚠️ User info validation warning: ${validationResult.error}`);
    }

    console.log(`🏭 Building dynamic prompt for page ${pageNumber}/${totalPages} using master factory builder`);

    // Phase 1: Extract primary scene without AI
    const primaryScene = extractPrimarySceneFallback(pageText);
    console.log(`🎯 Primary scene: "${primaryScene}"`);

    // Phase 2: Detect characters, animals, and objects using templates
    const characterDescriptors = detectCharactersWithTemplates(pageText, userInfo);
    console.log(`👥 Detected ${characterDescriptors.length} characters`);

    // Phase 3: Analyze emotional context using template patterns
    const emotionalContext = analyzeEmotionalContentWithTemplates(pageText);
    console.log(`🎭 Emotional context: ${emotionalContext.mood} (${emotionalContext.intensity}/10)`);

    // Phase 4: Use StructuredPromptEngine to compose sophisticated prompt
    const promptTemplate = StructuredPromptEngine.composeStructuredPrompt(
      pageText,
      userInfo,
      pageNumber,
      characterDescriptors,
      emotionalContext
    );

    // Phase 5: Select dynamic style framework based on difficulty
    const difficulty = userInfo?.readingLevel || 'medium';
    const styleFramework = getStyleFramework(difficulty);
    console.log(`🎨 Selected style framework: ${styleFramework.name} for difficulty: ${difficulty}`);

    // Phase 6: Build complete prompt using factory system
    const culturalContext = MulticulturalVisualService.generateCulturalSetting(userInfo);
    let finalPrompt = buildCompletePrompt(
      styleFramework, 
      primaryScene, 
      characterDescriptors.map(c => `${c.name}: ${c.physicalTraits}`).join(', '),
      culturalContext,
      { mood: emotionalContext.mood, lighting: emotionalContext.lighting }
    );

    // Phase 7: Apply advanced quality optimization using existing engine
    const qualityResult = AdvancedQualityEngine.optimizeForChildrensBooks(
      finalPrompt,
      sessionId,
      pageNumber,
      userInfo
    );
    finalPrompt = qualityResult.enhancedPrompt;

    // Phase 8: Generate comprehensive negative prompt
    const negativePrompt = generateComprehensiveNegativePrompt(pageText, [], userInfo);

    // Phase 9: Get optimized parameters for generation
    const optimizedParameters = getOptimizedParameters(styleFramework, characterDescriptors.length);

    // Phase 10: Attempt Runware generation with sophisticated prompt
    const result = await generateWithRunware(
      finalPrompt,
      negativePrompt,
      optimizedParameters,
      sessionId,
      pageNumber
    );

    if (result.success) {
      console.log(`✅ Tier 2 generation successful using template-based enhancement`);
      return createCorsResponse({
        success: true,
        imageUrl: result.url,
        provider: 'runware-template',
        prompt: finalPrompt,
        qualityScore: qualityResult.qualityScore,
        enhancementLevel: 'template-based',
        optimizations: qualityResult.appliedOptimizations,
        processingTime: result.processingTime
      });
    } else {
      console.log(`❌ Tier 2 generation failed: ${result.error}`);
      return createCorsErrorResponse(result.error || 'Template-based generation failed', 500);
    }

  } catch (error) {
    console.error('❌ Tier 2 template generation error:', error);
    return createCorsErrorResponse(`Template generation failed: ${error.message}`, 500);
  }
});

// Template-based scene extraction (no AI)
function extractPrimarySceneFallback(text: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  if (sentences.length <= 1) return text;
  
  // Template-based scoring for visual interest
  function scoreScene(sentence: string): number {
    let score = 0;
    
    // Action verbs get priority
    if (/\b(run|jump|play|climb|swing|slide|dance|laugh|walk|explore|discover|find)\b/i.test(sentence)) score += 15;
    
    // Character interaction gets priority
    if (/\b[A-Z][a-z]+\b.*\b(with|and|together)\b/i.test(sentence)) score += 12;
    
    // Visual elements get priority
    if (/\b(colorful|bright|big|small|red|blue|green|yellow|sparkly|shiny)\b/i.test(sentence)) score += 10;
    
    // Emotional content gets priority
    if (/\b(happy|excited|surprised|curious|delighted|loved|smiled|giggled)\b/i.test(sentence)) score += 13;
    
    // Penalty for purely descriptive introductions
    if (/\b(in the|there was|once upon|lived in)\b/i.test(sentence)) score -= 8;
    
    return Math.max(0, score);
  }
  
  // Score all sentences and find the most visually interesting one
  let bestScore = 0;
  let bestSentenceIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const score = scoreScene(sentences[i]);
    if (score > bestScore) {
      bestScore = score;
      bestSentenceIndex = i;
    }
  }
  
  // Return best scoring sentence or fallback to first
  return sentences[bestSentenceIndex] || sentences[0] || text;
}

// Template-based character detection using factory patterns
function detectCharactersWithTemplates(text: string, userInfo: any): CharacterDescriptor[] {
  const characters: CharacterDescriptor[] = [];
  const lowerText = text.toLowerCase();
  
  // Primary character from user info
  if (userInfo?.name) {
    const culturalTraits = MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
    characters.push({
      name: userInfo.name,
      type: 'primary',
      physicalTraits: culturalTraits
    });
  }
  
  // Family members detection using templates
  const familyPatterns = {
    'mother|mom|mama': { name: 'Mother', relationship: 'mother' },
    'father|dad|papa': { name: 'Father', relationship: 'father' },
    'sister|sis': { name: 'Sister', relationship: 'sister' },
    'brother|bro': { name: 'Brother', relationship: 'brother' },
    'grandmother|grandma': { name: 'Grandmother', relationship: 'grandmother' },
    'grandfather|grandpa': { name: 'Grandfather', relationship: 'grandfather' }
  };
  
  for (const [pattern, info] of Object.entries(familyPatterns)) {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    if (regex.test(text)) {
      characters.push({
        name: info.name,
        type: 'family',
        relationship: info.relationship,
        physicalTraits: generateFamilyMemberTraits(userInfo, info.relationship)
      });
    }
  }
  
  return characters;
}

// Template-based emotional analysis
function analyzeEmotionalContentWithTemplates(text: string): EmotionalContext {
  const lowerText = text.toLowerCase();
  
  // Template patterns for emotional content
  const emotionalPatterns = {
    joyful: /\b(happy|excited|joyful|delighted|cheerful|giggled|laughed|smiled)\b/i,
    adventurous: /\b(explore|adventure|discover|journey|quest|exciting)\b/i,
    peaceful: /\b(calm|peaceful|quiet|gentle|serene|soft)\b/i,
    curious: /\b(wonder|curious|question|look|examine|investigate)\b/i,
    playful: /\b(play|fun|game|silly|bounce|jump|dance)\b/i
  };
  
  let detectedMood = 'neutral';
  let intensity = 5;
  
  for (const [mood, pattern] of Object.entries(emotionalPatterns)) {
    if (pattern.test(text)) {
      detectedMood = mood;
      intensity = 7; // Higher intensity for detected emotions
      break;
    }
  }
  
  // Template-based color palette and lighting mapping
  const moodMapping = {
    joyful: { colorPalette: 'warm bright colors', lighting: 'sunny warm lighting' },
    adventurous: { colorPalette: 'vibrant dynamic colors', lighting: 'dramatic lighting' },
    peaceful: { colorPalette: 'soft pastel colors', lighting: 'gentle soft lighting' },
    curious: { colorPalette: 'clear bright colors', lighting: 'clear natural lighting' },
    playful: { colorPalette: 'fun rainbow colors', lighting: 'bright cheerful lighting' },
    neutral: { colorPalette: 'balanced natural colors', lighting: 'natural lighting' }
  };
  
  const mapping = moodMapping[detectedMood] || moodMapping.neutral;
  
  return {
    mood: detectedMood,
    intensity,
    colorPalette: mapping.colorPalette,
    lighting: mapping.lighting
  };
}

// Generate family member traits using cultural templates
function generateFamilyMemberTraits(userInfo: any, relationship: string): string {
  const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo?.nativeLanguage || 'en');
  const baseTrait = culturalProfile.skinTones[0]; // Consistent family skin tone
  
  const traitTemplates = {
    mother: `${baseTrait}, nurturing expression, ${culturalProfile.hairStyles[0]}, warm smile`,
    father: `${baseTrait}, gentle expression, ${culturalProfile.hairStyles[0]}, kind eyes`,
    grandmother: `${baseTrait}, wise kind eyes, gray hair, gentle wrinkles`,
    grandfather: `${baseTrait}, wise expression, gray hair, warm smile`,
    sister: `${baseTrait}, youthful appearance, ${culturalProfile.hairStyles[1]}, bright smile`,
    brother: `${baseTrait}, youthful appearance, ${culturalProfile.hairStyles[1]}, friendly expression`
  };
  
  return traitTemplates[relationship] || `${baseTrait}, friendly appearance`;
}

// Comprehensive negative prompt generation
function generateComprehensiveNegativePrompt(text: string, secondaryCharacters: string[], userInfo?: any): string {
  const baseNegative = [
    "blurry", "low quality", "distorted", "deformed", "ugly", "bad anatomy",
    "bad proportions", "extra limbs", "cloned face", "disfigured", "gross proportions",
    "malformed limbs", "missing arms", "missing legs", "extra arms", "extra legs",
    "mutated hands", "poorly drawn hands", "poorly drawn face", "mutation",
    "bad hands", "bad fingers", "watermark", "signature", "text", "logo"
  ];

  const childSafetyNegative = [
    "adult content", "inappropriate", "scary", "frightening", "violent", "weapon",
    "blood", "dark themes", "horror", "nightmare", "creepy", "disturbing"
  ];

  const qualityNegative = [
    "jpeg artifacts", "pixelated", "noise", "grainy", "overexposed", "underexposed",
    "too dark", "too bright", "oversaturated", "undersaturated", "color bleeding"
  ];

  return [...baseNegative, ...childSafetyNegative, ...qualityNegative].join(", ");
}

// Validate user info for template consistency
function validateUserInfo(userInfo: any): { valid: boolean; error?: string } {
  if (!userInfo) {
    return { valid: false, error: "No user info provided" };
  }
  
  if (!userInfo.name) {
    return { valid: false, error: "Missing user name" };
  }
  
  return { valid: true };
}

// Runware generation using template-built prompts
async function generateWithRunware(
  prompt: string,
  negativePrompt: string,
  parameters: any,
  sessionId: string,
  pageNumber: number
): Promise<{ success: boolean; url?: string; error?: string; processingTime?: number }> {
  const startTime = Date.now();
  
  try {
    const apiKey = Deno.env.get('RUNWARE_API_KEY');
    if (!apiKey) {
      throw new Error('Runware API key not configured');
    }

    console.log(`🚀 Generating with Runware using template-built prompt: "${prompt.substring(0, 80)}..."`);
    
    // WebSocket connection to Runware
    const ws = new WebSocket('wss://ws-api.runware.ai/v1');
    
    return new Promise((resolve) => {
      let authCompleted = false;
      const timeout = setTimeout(() => {
        ws.close();
        resolve({ success: false, error: 'Generation timeout' });
      }, 45000);

      ws.onopen = () => {
        // Authenticate first
        const authMessage = JSON.stringify([{
          taskType: "authentication",
          apiKey: apiKey
        }]);
        ws.send(authMessage);
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.data) {
          for (const item of response.data) {
            if (item.taskType === 'authentication' && !authCompleted) {
              authCompleted = true;
              console.log('🔐 Runware authenticated, sending generation request');
              
              // Send image generation request
              const generationMessage = JSON.stringify([{
                taskType: "imageInference",
                taskUUID: crypto.randomUUID(),
                positivePrompt: prompt,
                negativePrompt: negativePrompt,
                width: parameters.width || 1024,
                height: parameters.height || 1024,
                model: parameters.model || "runware:100@1",
                steps: parameters.steps || 8,
                CFGScale: parameters.CFGScale || 3.0,
                scheduler: parameters.scheduler || "FlowMatchEulerDiscreteScheduler",
                seed: parameters.seed || null,
                numberResults: 1,
                outputFormat: "WEBP"
              }]);
              
              ws.send(generationMessage);
            } else if (item.taskType === 'imageInference') {
              clearTimeout(timeout);
              ws.close();
              
              if (item.imageURL) {
                const processingTime = Date.now() - startTime;
                console.log(`✅ Runware template generation completed in ${processingTime}ms`);
                resolve({ 
                  success: true, 
                  url: item.imageURL,
                  processingTime
                });
              } else {
                resolve({ success: false, error: 'No image URL in response' });
              }
            }
          }
        }
        
        if (response.error || response.errors) {
          clearTimeout(timeout);
          ws.close();
          const errorMessage = response.errorMessage || response.errors?.[0]?.message || 'Unknown error';
          resolve({ success: false, error: errorMessage });
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Runware WebSocket error:', error);
        resolve({ success: false, error: 'WebSocket connection failed' });
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        if (!authCompleted) {
          resolve({ success: false, error: 'Connection closed before authentication' });
        }
      };
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Runware generation error:', error);
    return { success: false, error: error.message, processingTime };
  }
}