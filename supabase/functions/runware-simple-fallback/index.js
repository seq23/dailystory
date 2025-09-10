// ============= TIER 2.5 NUCLEAR INDEPENDENCE - SHARED NUCLEAR NEGATIVE PROMPT SYSTEM =============
// This edge function uses the shared nuclear negative prompt system for consistency
import { generateNuclearNegativePrompt, detectCulturalProfileForNegatives } from "../_shared/NuclearNegativePrompts.js";
import { globalArcSessionManager } from "../_shared/sessionStateManager.js";
import { ExactWordExtractor } from "../_shared/ExactWordExtractor.js";
import { VisualDetailTracker } from "../_shared/VisualDetailTracker.js";
import { CharacterConsistencyService } from "../_shared/CharacterConsistencyService.js";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Nuclear Independent CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Nuclear Independent CORS Response Functions  
function createCorsResponse(data, status = 200) {
  const headers = { 
    ...corsHeaders, 
    'Content-Type': 'application/json' 
  };
  return new Response(JSON.stringify(data), { status, headers });
}

function createCorsErrorResponse(error, status = 500) {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Edge function error:', errorMessage);
  return createCorsResponse({ 
    success: false, 
    error: errorMessage 
  }, status);
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// ============= MAIN EDGE FUNCTION =============
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }
  
  const startTime = Date.now();
  console.log(`🚀 Tier 2.5: Nuclear Independence edge function started at ${new Date().toISOString()}`);
  
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📥 Request received:', requestBody);
    } catch (error) {
      console.error('❌ Request parsing error:', error.message);
      return createCorsErrorResponse('Invalid JSON in request body', 400);
    }
    
    // Validate required parameters
    const { userInfo, pageText, sessionId, pageNumber } = requestBody;
    
    if (!userInfo || !pageText || !sessionId) {
      console.error('❌ Missing required parameters');
      return createCorsErrorResponse('Missing required parameters: userInfo, pageText, sessionId', 400);
    }
    
    console.log(`🔍 Processing request - Session: ${sessionId}, Page: ${pageNumber || 1}`);
    
    // ============= MAIN PROCESSING PIPELINE =============
    console.log(`⚙️ Starting main processing pipeline`);
    
    const processingResult = await processEnhancedStoryPage(
      userInfo, 
      pageText, 
      sessionId, 
      pageNumber || 1
    );
    
    const { 
      prompt, 
      placeholders, 
      templateType, 
      difficulty, 
      characterData, 
      avatarMapping 
    } = processingResult;
    
    console.log(`✅ Processing complete - Generated prompt length: ${prompt.length} chars`);
    
    // ============= CULTURAL PROFILE AND NEGATIVE PROMPT GENERATION =============
    console.log(`🌍 Generating cultural profile and negative prompt`);
    
    let culturalProfile, negativePrompt;
    
    try {
      culturalProfile = await detectCulturalProfileForNegatives(userInfo, pageText, sessionId);
      negativePrompt = await generateNuclearNegativePrompt(culturalProfile, userInfo?.difficulty || 'medium');
      console.log(`🎭 Cultural profile: ${culturalProfile}`);
      console.log(`🚫 Negative prompt generated: ${negativePrompt.substring(0, 100)}...`);
    } catch (error) {
      console.warn(`⚠️ Cultural/negative prompt generation error: ${error.message}`);
      culturalProfile = 'universal';
      negativePrompt = 'low quality, blurred, distorted, inappropriate content';
    }
    
    // ============= IMAGE GENERATION PIPELINE =============
    console.log(`🎨 Starting image generation pipeline`);
    
    const tierPath = [];
    const attemptedTiers = [];
    let successfulTier = null;
    let enhancementLevel = 'premium';
    let fallbackReason = null;
    
    // Tier 2.5 settings
    const tier25Settings = NUCLEAR_STYLE_SETTINGS[difficulty] || NUCLEAR_STYLE_SETTINGS.medium;
    
    console.log(`🎯 Tier 2.5 settings:`, tier25Settings);
    
    try {
      tierPath.push('2.5 Nuclear Independence');
      attemptedTiers.push('2.5');
      
      console.log(`🚀 Attempting Tier 2.5: Nuclear Independence generation`);
      
      // Construct the Runware API request
      const runwareRequestPayload = [
        {
          taskType: "authentication", 
          apiKey: Deno.env.get('RUNWARE_API_KEY')
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          positivePrompt: prompt,
          negativePrompt: negativePrompt,
          height: 1024,
          width: 1024,
          model: "runware:100@1",
          steps: tier25Settings.steps,
          CFGScale: tier25Settings.CFGScale,
          outputFormat: "WEBP"
        }
      ];
      
      console.log(`📡 Runware API request constructed - Steps: ${tier25Settings.steps}, CFG: ${tier25Settings.CFGScale}`);
      
      // Make the HTTP request to Runware API
      const httpResponse = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('RUNWARE_API_KEY')}`
        },
        body: JSON.stringify(runwareRequestPayload)
      });
      
      if (!httpResponse.ok) {
        throw new Error(`HTTP ${httpResponse.status}: ${httpResponse.statusText}`);
      }
      
      const httpResult = await httpResponse.json();
      const imageData = httpResult.data?.find(item => item.taskType === 'imageInference');
      
      if (imageData?.imageURL) {
        const processingTime = Date.now() - startTime;
        successfulTier = '2.5 Nuclear Independence';
        
        console.log(`✅ Tier 2.5: Nuclear Independence successful!`);
        console.log(`📊 Processing time: ${processingTime}ms`);
        console.log(`🎯 Image URL: ${imageData.imageURL}`);
        
        return createCorsResponse({
          success: true,
          imageURL: imageData.imageURL,
          prompt: prompt,
          negativePrompt: negativePrompt,
          difficulty: difficulty,
          culturalProfile: culturalProfile,
          tier: '2.5 Nuclear Independence + Character Consistency',
          specificTier: successfulTier,
          templateType: templateType,
          tierPath: tierPath,
          enhancementLevel: enhancementLevel,
          fallbackReason: fallbackReason,
          processingTime: processingTime,
          attemptedTiers: attemptedTiers,
          placeholders: {
            objects: placeholders.action_objects || 'none',
            secondary_characters: placeholders.secondary_characters || 'none'
          },
          characterConsistency: {
            sessionId: sessionId,
            characterSeed: characterData?.seed || 'none',
            enhancementApplied: !!(characterData && characterData.seed),
            source: avatarMapping?.source || 'nuclear-mapping'
          }
        });
      } else {
        throw new Error('No image URL in HTTP response');
      }
      
    } catch (httpError) {
      console.error('❌ Tier 2.5: HTTP fallback failed:', httpError);
      return { success: false, error: httpError.message };
    }
  });
  
} catch (error) {
  console.error('❌ Tier 2.5: Main function error:', error);
  return createCorsErrorResponse(error.message || 'Internal server error', 500);
}
import { ArcSession } from '../_shared/ArcSession.js';
import { CharacterPrompts } from '../_shared/CharacterPrompts.js';
import { CharacterService } from '../_shared/CharacterService.js';
import { ConceptCache } from '../_shared/ConceptCache.js';
import { ConceptExtractor } from '../_shared/ConceptExtractor.js';
import { ConceptTypes } from '../_shared/ConceptTypes.js';
import { CulturalProfileDetector } from '../_shared/CulturalProfileDetector.js';
import { DataCache } from '../_shared/DataCache.js';
import { DetailedError } from '../_shared/DetailedError.js';
import { DialogueManager } from '../_shared/DialogueManager.js';
import { ExactEntities } from '../_shared/ExactEntities.js';
import { ExactWordMatcher } from '../_shared/ExactWordMatcher.js';
import { FocusPrompts } from '../_shared/FocusPrompts.js';
import { ImageTemplatePrompts } from '../_shared/ImageTemplatePrompts.js';
import { KeywordExtractor } from '../_shared/KeywordExtractor.js';
import { LocationExtractor } from '../_shared/LocationExtractor.js';
import { MemoryManager } from '../_shared/MemoryManager.js';
import { NuclearSettings } from '../_shared/NuclearSettings.js';
import { ObjectExtractor } from '../_shared/ObjectExtractor.js';
import { Persona } from '../_shared/Persona.js';
import { PlaceholderService } from '../_shared/PlaceholderService.js';
import { PlayerBehavior } from '../_shared/PlayerBehavior.js';
import { PlayerBehaviorExtractor } from '../_shared/PlayerBehaviorExtractor.js';
import { PromptBuilder } from '../_shared/PromptBuilder.js';
import { PromptCache } from '../_shared/PromptCache.js';
import { PromptClassifier } from '../_shared/PromptClassifier.js';
import { PromptEnricher } from '../_shared/PromptEnricher.js';
import { PromptTemplates } from '../_shared/PromptTemplates.js';
import { RunType } from '../_shared/RunType.js';
import { SceneContext } from '../_shared/SceneContext.js';
import { SceneService } from '../_shared/SceneService.js';
import { ScriptService } from '../_shared/ScriptService.js';
import { SemanticClassifier } from '../_shared/SemanticClassifier.js';
import { SemanticScorer } from '../_shared/SemanticScorer.js';
import { SessionState } from '../_shared/SessionState.js';
import { SessionStateManager } from '../_shared/SessionStateManager.js';
import { ShotDetector } from '../_shared/ShotDetector.js';
import { SimpleCache } from '../_shared/SimpleCache.js';
import { SimpleTemplate } from '../_shared/SimpleTemplate.js';
import { SpeechPrompts } from '../_shared/SpeechPrompts.js';
import { StylePrompts } from '../_shared/StylePrompts.js';
import { TemplatePrompts } from '../_shared/TemplatePrompts.js';
import { TextRazorService } from '../_shared/TextRazorService.js';
import { ThemePrompts } from '../_shared/ThemePrompts.js';
import { VisualDetailPrompts } from '../_shared/VisualDetailPrompts.js';
import { VisualStylePrompts } from '../_shared/VisualStylePrompts.js';
import { WordCache } from '../_shared/WordCache.js';
import { WordFrequencyAnalyzer } from '../_shared/WordFrequencyAnalyzer.js';
import { WordNetService } from '../_shared/WordNetService.js';
// ============= ARC SESSION STATE MANAGEMENT =============
const arcSessionManager = globalArcSessionManager;
// ============= CACHED DATA AND SERVICES (SINGLETONS) =============
const conceptCache = ConceptCache.getInstance();
const dataCache = DataCache.getInstance();
const promptCache = PromptCache.getInstance();
const scriptService = ScriptService.getInstance();
const sceneService = SceneService.getInstance();
const textRazorService = TextRazorService.getInstance();
const wordCache = WordCache.getInstance();
const wordNetService = WordNetService.getInstance();
const characterService = CharacterService.getInstance();
const visualDetailTracker = VisualDetailTracker.getInstance();
const characterConsistencyService = CharacterConsistencyService.getInstance();
// ============= PROMPT WEIGHTS AND SETTINGS =============
const PROMPT_WEIGHTS = {
    template: 0.7,
    keywords: 0.2,
    focus: 0.1,
};
const NUCLEAR_STYLE_SETTINGS = {
    low: { steps: 20, CFGScale: 6 },
    medium: { steps: 25, CFGScale: 7 },
    high: { steps: 30, CFGScale: 8 },
};
// ============= UTILITY FUNCTIONS =============
function extractObjectType(objectText) {
    const objectMatch = objectText.match(/a (\w+)|an (\w+)|the (\w+)/i);
    if (objectMatch) {
        return objectMatch[1] || objectMatch[2] || objectMatch[3] || 'object';
    }
    return 'object';
}
function limitString(str, maxLength = 1500) {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}
// ============= MAIN PROCESSING FUNCTION =============
async function processEnhancedStoryPage(userInfo, pageText, sessionId, pageNumber) {
    console.log(`📚 Processing story page: ${pageNumber}, Session: ${sessionId}`);
    const startTime = Date.now();
    try {
        // ============= INITIALIZE SESSION AND CONTEXT =============
        console.log(`🔄 Initializing session and context`);
        let arcSession = await arcSessionManager.getOrCreateSession(sessionId, userInfo);
        const sceneContext = new SceneContext(userInfo, pageText, pageNumber, arcSession);
        // ============= EXTRACT KEY CONCEPTS AND ENTITIES =============
        console.log(`🔑 Extracting key concepts and entities`);
        const conceptExtractor = new ConceptExtractor(sceneContext, textRazorService, conceptCache);
        const extractedConcepts = await conceptExtractor.extractConcepts();
        const objectExtractor = new ObjectExtractor(sceneContext, textRazorService);
        const extractedObjects = await objectExtractor.extractObjects();
        const locationExtractor = new LocationExtractor(sceneContext, textRazorService);
        const extractedLocations = await locationExtractor.extractLocations();
        const playerBehaviorExtractor = new PlayerBehaviorExtractor(sceneContext, textRazorService);
        const extractedPlayerBehaviors = await playerBehaviorExtractor.extractPlayerBehaviors();
        // ============= ANALYZE WORD FREQUENCY AND PLAYER BEHAVIOR =============
        console.log(`📊 Analyzing word frequency and player behavior`);
        const wordFrequencyAnalyzer = new WordFrequencyAnalyzer(pageText);
        const frequentWords = wordFrequencyAnalyzer.getFrequentWords(50);
        const playerBehavior = PlayerBehavior.analyzeBehavior(extractedPlayerBehaviors, frequentWords);
        // ============= CLASSIFY PROMPT AND DETECT SHOTS =============
        console.log(`🎬 Classifying prompt and detecting shots`);
        const promptClassifier = new PromptClassifier(sceneContext, textRazorService);
        const classifiedPromptType = await promptClassifier.classifyPrompt();
        const shotDetector = new ShotDetector(sceneContext, textRazorService);
        const detectedShots = await shotDetector.detectShots();
        // ============= BUILD INITIAL PROMPT =============
        console.log(`🏗️ Building initial prompt`);
        const promptBuilder = new PromptBuilder(sceneContext);
        promptBuilder.addConcepts(extractedConcepts, ConceptTypes.General);
        promptBuilder.addConcepts(extractedObjects, ConceptTypes.Object);
        promptBuilder.addConcepts(extractedLocations, ConceptTypes.Location);
        promptBuilder.setPromptType(classifiedPromptType);
        promptBuilder.setShots(detectedShots);
        // ============= ENRICH PROMPT WITH TEMPLATES AND KEYWORDS =============
        console.log(`➕ Enriching prompt with templates and keywords`);
        const promptEnricher = new PromptEnricher(sceneContext, promptBuilder, promptCache, wordNetService);
        await promptEnricher.enrichPrompt(PROMPT_WEIGHTS);
        // ============= HANDLE DIALOGUE AND MEMORY =============
        console.log(`💬 Handling dialogue and memory`);
        const dialogueManager = new DialogueManager(sceneContext, arcSession, textRazorService);
        const dialoguePrompts = await dialogueManager.generateDialoguePrompts();
        promptBuilder.addDialogue(dialoguePrompts);
        const memoryManager = new MemoryManager(sceneContext, arcSession);
        await memoryManager.updateMemory(extractedConcepts);
        // ============= CHARACTER CONSISTENCY AND AVATAR MAPPING =============
        console.log(`🎭 Applying character consistency`);
        let characterData = null;
        let avatarMapping = null;
        try {
            const characterResult = await characterConsistencyService.applyCharacterConsistency(userInfo, sceneContext, arcSession, promptBuilder);
            characterData = characterResult.characterData;
            avatarMapping = characterResult.avatarMapping;
        }
        catch (error) {
            console.warn("Character consistency failed, but continuing:", error);
        }
        // ============= PLACEHOLDER SERVICE =============
        console.log(`📍 Populating placeholders`);
        const placeholderService = new PlaceholderService(sceneContext, textRazorService);
        const placeholders = await placeholderService.populatePlaceholders(promptBuilder.getPrompt());
        // ============= FINAL PROMPT AND METADATA =============
        console.log(`✅ Finalizing prompt and metadata`);
        const finalPrompt = promptBuilder.buildFinalPrompt();
        const templateType = promptBuilder.getTemplateType();
        const difficulty = userInfo.difficulty || 'medium';
        const processingTime = Date.now() - startTime;
        console.log(`📊 Page processing completed in ${processingTime}ms`);
        return {
            prompt: finalPrompt,
            placeholders: placeholders,
            templateType: templateType,
            difficulty: difficulty,
            characterData: characterData,
            avatarMapping: avatarMapping,
        };
    }
    catch (error) {
        console.error("❌ Error in processEnhancedStoryPage:", error);
        if (error instanceof DetailedError) {
            console.error("Detailed Error:", error.details);
        }
        throw error;
    }
}
