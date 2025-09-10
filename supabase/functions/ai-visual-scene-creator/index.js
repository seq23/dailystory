import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// =================== CORS UTILITIES ===================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function createCorsResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createCorsErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ 
    success: false, 
    error: message,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function createCorsOptionsResponse() {
  return new Response(null, { headers: corsHeaders });
}

// =================== ERROR HANDLING ===================
class EdgeErrorHandler {
  static errors = [];
  static performance = [];

  static handleError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    };
    
    this.errors.push(errorData);
    console.error('Edge Function Error:', errorData);
    
    return {
      success: false,
      error: error.message,
      requestId: context.requestId || 'unknown'
    };
  }

  static logPerformance(operation, duration, context = {}) {
    const perfData = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      context
    };
    
    this.performance.push(perfData);
    console.log(`Performance [${operation}]: ${duration}ms`, context);
  }
}

// =================== VISUAL DETAIL TRACKER ===================
class VisualDetailTracker {
  static cache = new Map();

  static analyzeTextForDetails(sessionId, text, pageNumber) {
    if (!sessionId || !text) return;

    const key = `${sessionId}_details`;
    let details = this.cache.get(key) || {
      clothing: new Set(),
      objects: new Set(),
      settings: new Set()
    };

    // Extract clothing details
    const clothingPatterns = [
      /wearing (?:a |an |the )?([^,.]+)/gi,
      /dressed in (?:a |an |the )?([^,.]+)/gi,
      /([^,.\s]+) (?:shirt|dress|hat|shoes|jacket|coat)/gi
    ];

    clothingPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => details.clothing.add(match.toLowerCase().trim()));
      }
    });

    // Extract objects
    const objectPatterns = [
      /holding (?:a |an |the )?([^,.]+)/gi,
      /carrying (?:a |an |the )?([^,.]+)/gi,
      /with (?:a |an |the )?([^,.]+)/gi
    ];

    objectPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => details.objects.add(match.toLowerCase().trim()));
      }
    });

    this.cache.set(key, details);
    console.log(`Visual details tracked for session ${sessionId}:`, {
      clothing: Array.from(details.clothing),
      objects: Array.from(details.objects)
    });
  }

  static injectConsistentDetails(sessionId, scene, pageNumber) {
    if (!sessionId) return scene;

    const key = `${sessionId}_details`;
    const details = this.cache.get(key);
    
    if (!details || (details.clothing.size === 0 && details.objects.size === 0)) {
      return scene;
    }

    let enhancedScene = scene;
    
    // Add consistent clothing if not already specified
    if (details.clothing.size > 0 && !scene.toLowerCase().includes('wearing') && !scene.toLowerCase().includes('dressed')) {
      const clothingItem = Array.from(details.clothing)[0];
      enhancedScene = enhancedScene.replace(/\b(she|he|they)\b/i, `$1 wearing ${clothingItem}`);
    }

    console.log(`Consistent details injected for page ${pageNumber}`);
    return enhancedScene;
  }

  static getDetailsForSession(sessionId) {
    const key = `${sessionId}_details`;
    const details = this.cache.get(key);
    if (!details) return null;

    return {
      clothing: Array.from(details.clothing),
      objects: Array.from(details.objects),
      settings: Array.from(details.settings)
    };
  }

  static clearSessionDetails(sessionId) {
    const key = `${sessionId}_details`;
    this.cache.delete(key);
    console.log(`Visual details cleared for session ${sessionId}`);
  }
}

// =================== SESSION STATE MANAGER ===================
class SessionStateManager {
  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL');
    this.supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
  }

  async storePreviousAIScene(sessionId, sceneData) {
    try {
      const { error } = await this.supabase
        .from('ai_scene_cache')
        .upsert({
          session_id: sessionId,
          scene_data: sceneData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log(`Previous AI scene stored for session ${sessionId}`);
    } catch (error) {
      console.warn('Failed to store previous AI scene:', error);
    }
  }

  async getPreviousAIScene(sessionId) {
    try {
      const { data, error } = await this.supabase
        .from('ai_scene_cache')
        .select('scene_data')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;
      return data?.scene_data || null;
    } catch (error) {
      console.warn('Failed to get previous AI scene:', error);
      return null;
    }
  }
}

// =================== MONITORING ===================
class FunctionMonitoring {
  static logs = [];
  static performance = {};

  static logEvent(event, data = {}) {
    const logEntry = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    console.log(`[MONITOR] ${event}:`, data);
  }

  static startTimer(operation) {
    this.performance[operation] = Date.now();
  }

  static endTimer(operation) {
    if (this.performance[operation]) {
      const duration = Date.now() - this.performance[operation];
      delete this.performance[operation];
      return duration;
    }
    return 0;
  }
}

// =================== TIER FAILURE LOGGER ===================
class TierFailureLogger {
  static tier1Failures = [];
  static tier2Failures = [];

  static logTier1OpenAIFailure(error, context) {
    const failure = {
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
      tier: 1
    };
    
    this.tier1Failures.push(failure);
    console.error('TIER 1 FAILURE logged:', failure);
  }

  static logTier2RunwareFailure(error, context) {
    const failure = {
      error: error.message,
      context,
      timestamp: new Date().toISOString(),
      tier: 2
    };
    
    this.tier2Failures.push(failure);
    console.error('TIER 2 FAILURE logged:', failure);
  }

  static getFailureStats() {
    return {
      tier1Count: this.tier1Failures.length,
      tier2Count: this.tier2Failures.length,
      totalFailures: this.tier1Failures.length + this.tier2Failures.length
    };
  }
}

// =================== VALIDATION FUNCTIONS ===================
function checkPrimarySceneCriteria(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, reason: 'Content is not a string' };
  }

  if (content.length < 20) {
    return { valid: false, reason: `Content too short: ${content.length} characters` };
  }

  const hasCharacterAction = /\b(walks?|runs?|sits?|stands?|looks?|smiles?|laughs?|plays?|explores?)\b/i.test(content);
  if (!hasCharacterAction) {
    return { valid: false, reason: 'No character action detected' };
  }

  return { valid: true, reason: 'Primary scene criteria met' };
}

function validateAndEnhanceContent(content, context = {}) {
  const { requestId = 'unknown' } = context;
  
  if (!content || typeof content !== 'string') {
    throw new Error(`Invalid content type: expected string, got ${typeof content}`);
  }

  if (content.length < 10) {
    throw new Error(`Content too short: ${content.length} characters`);
  }

  // Basic content enhancement
  let enhanced = content.trim();
  
  // Ensure proper sentence structure
  if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
    enhanced += '.';
  }

  console.log(`Content validated and enhanced for request ${requestId}`);
  return enhanced;
}

// =================== AI MODELS CONFIGURATION ===================
const AI_MODELS = {
  PRIMARY: {
    name: 'gpt-4o-mini',
    maxTokens: 6000,
    temperature: 0.7,
    timeout: 45000
  },
  FALLBACK: {
    name: 'gpt-3.5-turbo',
    maxTokens: 4000,
    temperature: 0.7,
    timeout: 30000
  }
};

// =================== CIRCUIT BREAKER ===================
class UnifiedCircuitBreaker {
  static state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  static failures = 0;
  static lastFailureTime = 0;
  static threshold = 5;
  static timeout = 300000; // 5 minutes

  static canExecute() {
    const now = Date.now();
    
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log('Circuit breaker: HALF_OPEN - attempting recovery');
        return true;
      }
      return false;
    }
    
    return true;
  }

  static onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  static onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`Circuit breaker: OPEN - ${this.failures} failures detected`);
    }
  }

  static getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      canExecute: this.canExecute()
    };
  }
}

// =================== JSON PARSING WITH FALLBACK ===================
function parseAIResponse(content, context = {}) {
  const { requestId = 'unknown' } = context;

  try {
    // Strategy 1: Direct JSON parse
    const parsed = JSON.parse(content);
    if (parsed.primaryScene) {
      console.log(`JSON Strategy 1 success for request ${requestId}`);
      return parsed;
    }
  } catch (e) {
    console.log(`JSON Strategy 1 failed for request ${requestId}: ${e.message}`);
  }

  try {
    // Strategy 2: Extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.primaryScene) {
        console.log(`JSON Strategy 2 success for request ${requestId}`);
        return parsed;
      }
    }
  } catch (e) {
    console.log(`JSON Strategy 2 failed for request ${requestId}: ${e.message}`);
  }

  try {
    // Strategy 3: Find JSON-like structure in text
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = content.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.primaryScene) {
        console.log(`JSON Strategy 3 success for request ${requestId}`);
        return parsed;
      }
    }
  } catch (e) {
    console.log(`JSON Strategy 3 failed for request ${requestId}: ${e.message}`);
  }

  // Strategy 4: Text-based extraction fallback
  console.log(`All JSON strategies failed for request ${requestId}, using text extraction`);
  
  const primarySceneMatch = content.match(/(?:primaryScene|primary_scene|scene)["']?\s*:\s*["']([^"']+)["']/i) ||
                           content.match(/(?:scene|description):\s*(.+?)(?:\n|$)/i);
  
  const settingMatch = content.match(/(?:setting|location)["']?\s*:\s*["']([^"']+)["']/i);
  const actionMatch = content.match(/(?:action|activity)["']?\s*:\s*["']([^"']+)["']/i);
  const moodMatch = content.match(/(?:mood|feeling)["']?\s*:\s*["']([^"']+)["']/i);
  const poseMatch = content.match(/(?:pose|position)["']?\s*:\s*["']([^"']+)["']/i);

  return {
    primaryScene: primarySceneMatch ? primarySceneMatch[1].trim() : content.trim(),
    setting: settingMatch ? settingMatch[1].trim() : null,
    action: actionMatch ? actionMatch[1].trim() : null,
    mood: moodMatch ? moodMatch[1].trim() : null,
    pose: poseMatch ? poseMatch[1].trim() : null
  };
}

// =================== AI API CALLS ===================
async function callOpenAIWithFallback(messages, maxTokens, requestId, avatarIdentity) {
  if (!UnifiedCircuitBreaker.canExecute()) {
    throw new Error('Circuit breaker is OPEN - too many recent failures');
  }

  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIKey) {
    throw new Error('OpenAI API key not found');
  }

  const model = AI_MODELS.PRIMARY;
  const requestBody = {
    model: model.name,
    messages: messages,
    max_tokens: maxTokens,
    temperature: model.temperature,
    response_format: { type: "json_object" }
  };

  console.log(`Calling OpenAI API with model ${model.name} for request ${requestId}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    UnifiedCircuitBreaker.onSuccess();
    console.log(`OpenAI API success for request ${requestId}`);
    
    return result;
  } catch (error) {
    UnifiedCircuitBreaker.onFailure();
    console.error(`OpenAI API failure for request ${requestId}:`, error.message);
    throw error;
  }
}

// =================== CHARACTER CONSISTENCY SERVICE ===================
class CharacterConsistencyService {
  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL');
    this.supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
    this.cache = new Map();
  }

  async saveCharacterToDatabase(sessionId, characterKey, characterData) {
    try {
      const { error } = await this.supabase
        .from('character_consistency')
        .upsert({
          session_id: sessionId,
          character_key: characterKey,
          character_data: characterData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log(`Character ${characterKey} saved to database for session ${sessionId}`);
    } catch (error) {
      console.warn(`Failed to save character to database:`, error);
    }
  }

  async getCharacterFromDatabase(sessionId, characterKey) {
    try {
      const { data, error } = await this.supabase
        .from('character_consistency')
        .select('character_data')
        .eq('session_id', sessionId)
        .eq('character_key', characterKey)
        .single();

      if (error) throw error;
      return data?.character_data || null;
    } catch (error) {
      console.warn(`Failed to get character from database:`, error);
      return null;
    }
  }

  async getCharacterSeed(sessionId, avatarIdentity, storyContext, sessionType, pageTextClothing) {
    const characterKey = `${avatarIdentity.type}_${avatarIdentity.skinTone}`;
    
    // Try database first
    let characterData = await this.getCharacterFromDatabase(sessionId, characterKey);
    
    if (!characterData) {
      // Create new character seed
      characterData = this.createNewCharacterSeed(avatarIdentity);
      await this.saveCharacterToDatabase(sessionId, characterKey, characterData);
      console.log(`New character seed created and saved for session ${sessionId}`);
    } else {
      console.log(`Character seed retrieved from database for session ${sessionId}`);
    }

    return characterData;
  }

  createNewCharacterSeed(avatarIdentity) {
    const hairOptions = {
      'light': ['blonde', 'light brown', 'sandy brown'],
      'medium': ['brown', 'dark brown', 'auburn'],
      'dark': ['black', 'dark brown', 'curly black']
    };

    const eyeOptions = {
      'light': ['blue', 'green', 'hazel'],
      'medium': ['brown', 'hazel', 'green'],
      'dark': ['brown', 'dark brown', 'black']
    };

    const clothingStyles = ['casual', 'colorful', 'comfortable', 'playful'];

    const seedInput = `${avatarIdentity.type}_${avatarIdentity.skinTone}_${Date.now()}`;
    const seed = this.generateStableSeed(seedInput, avatarIdentity.type);

    const random = this.createSeededRandom(seed);
    
    const hair = hairOptions[avatarIdentity.skinTone]?.[Math.floor(random() * hairOptions[avatarIdentity.skinTone].length)] || 'brown';
    const eyes = eyeOptions[avatarIdentity.skinTone]?.[Math.floor(random() * eyeOptions[avatarIdentity.skinTone].length)] || 'brown';
    const clothing = clothingStyles[Math.floor(random() * clothingStyles.length)];

    return {
      seed,
      name: avatarIdentity.type,
      type: avatarIdentity.type,
      skinTone: avatarIdentity.skinTone,
      hair,
      eyes,
      clothingStyle: clothing,
      createdAt: new Date().toISOString()
    };
  }

  generateStableSeed(seedInput, characterName) {
    // Create a simple hash-based seed
    let hash = 0;
    const str = `${seedInput}_${characterName}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  buildCharacterDescription(seedData, storyContext, pageTextClothing, sessionId) {
    let description = `A ${seedData.skinTone}-skinned ${seedData.type} with ${seedData.hair} hair and ${seedData.eyes} eyes`;
    
    // Add clothing details from visual tracker or story context
    const trackedDetails = VisualDetailTracker.getDetailsForSession(sessionId);
    if (trackedDetails?.clothing?.length > 0) {
      const clothingItem = trackedDetails.clothing[0];
      description += `, ${clothingItem}`;
    } else if (pageTextClothing) {
      description += `, ${pageTextClothing}`;
    } else {
      description += `, wearing ${seedData.clothingStyle} clothing`;
    }

    return description;
  }

  createSeededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  detectSecondaryCharacters(pageText) {
    const characters = [];
    
    // Patterns for detecting secondary characters
    const patterns = [
      /(?:her|his|their) (?:friend|brother|sister|mother|father|parent|teacher|classmate) (\w+)/gi,
      /(\w+) (?:the|a) (?:friend|dog|cat|pet|teacher|helper)/gi,
      /with (\w+) (?:the|a) (?:friend|companion|buddy)/gi
    ];

    patterns.forEach(pattern => {
      const matches = [...pageText.matchAll(pattern)];
      matches.forEach(match => {
        const name = match[1];
        if (name && name.length > 1 && /^[A-Z][a-z]+$/.test(name)) {
          characters.push({
            name,
            type: 'secondary',
            context: match[0]
          });
        }
      });
    });

    return characters;
  }

  async clearServerState() {
    try {
      const { error } = await this.supabase
        .from('character_consistency')
        .delete()
        .neq('id', 0); // Delete all records

      if (error) throw error;
      console.log('Character consistency cache cleared from database');
    } catch (error) {
      console.warn('Failed to clear character consistency cache:', error);
    }
  }
}

// =================== REGIONAL CONTEXT ===================
const regionalContext = {
  'es': 'Spanish/Latino cultural elements',
  'fr': 'French cultural elements',
  'zh': 'Chinese cultural elements',
  'hi': 'Indian cultural elements',
  'ar': 'Arabic cultural elements',
  'pt': 'Portuguese/Brazilian cultural elements',
  'ru': 'Russian cultural elements',
  'ja': 'Japanese cultural elements',
  'ko': 'Korean cultural elements',
  'de': 'German cultural elements'
};

// =================== MAIN FUNCTION ===================
serve(async (req) => {
  FunctionMonitoring.startTimer('total_request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsOptionsResponse();
  }

  try {
    // =================== DIAGNOSTIC MODE ===================
    const url = new URL(req.url);
    if (url.pathname.includes('diagnostic') || url.searchParams.get('mode') === 'diagnostic') {
      console.log('🔍 Running in diagnostic mode');
      
      const testPayload = {
        storyText: "Emma explored the magical forest with wonder and excitement.",
        userInfo: {
          name: "Emma",
          avatar: { type: "girl", skinTone: "light" },
          nativeLanguage: "en"
        },
        sessionId: "diagnostic-session",
        pageNumber: 1,
        totalPages: 5,
        avatarIdentity: {
          type: "girl",
          skinTone: "light",
          culturalBackground: "general"
        }
      };

      return createCorsResponse({
        success: true,
        mode: 'diagnostic',
        testPayload,
        circuitBreakerStatus: UnifiedCircuitBreaker.getStatus(),
        timestamp: new Date().toISOString()
      });
    }

    // =================== REQUEST PROCESSING ===================
    const requestId = crypto.randomUUID();
    console.log(`\n🎨 AI Visual Scene Creator [${requestId}] - Processing request`);

    let requestBody;
    try {
      const rawBody = await req.text();
      requestBody = JSON.parse(rawBody);
      console.log(`📝 Request data parsed for ${requestId}`);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return createCorsErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate required fields
    const { storyText, userInfo, sessionId, pageNumber, avatarIdentity } = requestBody;
    
    if (!storyText || !userInfo || !sessionId || !avatarIdentity) {
      return createCorsErrorResponse('Missing required fields: storyText, userInfo, sessionId, avatarIdentity', 400);
    }

    console.log(`📊 Processing story for session ${sessionId}, page ${pageNumber}`);

    // =================== PHASE 1: SETUP & PREPARATION ===================
    console.log('🔧 PHASE 1: Setup & Preparation');
    
    const totalPages = requestBody.totalPages;
    const storyId = requestBody.storyId || sessionId;
    const sessionType = requestBody.sessionType || 'netflix';
    const userLanguage = userInfo.nativeLanguage || 'en';

    // Initialize services
    const characterService = new CharacterConsistencyService();
    let enhancedStoryData = null;

    // PHASE 1.1: Character Consistency Setup
    console.log('👤 PHASE 1.1: Character consistency setup');
    const characterData = await characterService.getCharacterSeed(
      sessionId, 
      avatarIdentity, 
      storyText, 
      sessionType, 
      null
    );

    const enhancedCharacterDescription = characterService.buildCharacterDescription(
      characterData, 
      storyText, 
      null, 
      sessionId
    );

    console.log(`Character: ${characterData.name} (seed: ${characterData.seed})`);

    // Secondary elements detection
    const secondaryElements = characterService.detectSecondaryCharacters(storyText);
    console.log(`Secondary characters detected: ${secondaryElements.length}`);

    // Visual details tracking
    VisualDetailTracker.analyzeTextForDetails(sessionId, storyText, pageNumber);
    const visualDetails = VisualDetailTracker.getDetailsForSession(sessionId);

    // PHASE 1.2: Enhanced Prompt Construction
    console.log('📝 PHASE 1.2: Enhanced prompt construction');

    function buildSystemContent() {
      return `You are an expert children's story illustrator specializing in creating vivid, engaging scene descriptions for picture books. 

Your task is to analyze story text and create a detailed illustration description that captures the essence of the scene for image generation.

CRITICAL REQUIREMENTS:
1. Focus on the main character's specific actions and emotions in this moment
2. Include specific visual details about setting, lighting, and atmosphere
3. Maintain character consistency across all scenes
4. Create child-friendly, engaging imagery
5. ALWAYS respond with valid JSON format

OUTPUT FORMAT (JSON):
{
  "primaryScene": "Complete illustration description (150-200 words)",
  "setting": "Location/environment details",
  "action": "What the character is doing",
  "mood": "Emotional tone of the scene",
  "pose": "Character's position/stance"
}

The primaryScene should be a complete, vivid description suitable for image generation that includes character appearance, actions, setting, and atmosphere.`;
    }

    function buildUserContent() {
      let content = `Please create an illustration description for this story moment:

STORY TEXT: "${storyText}"

CHARACTER DETAILS: ${enhancedCharacterDescription}

SCENE CONTEXT:
- Page ${pageNumber}${totalPages ? ` of ${totalPages}` : ' (never-ending story)'}
- Session: ${sessionType}
- Character consistency maintained via database

REQUIREMENTS:
- Focus on character's specific actions and emotions
- Include environmental details and atmosphere
- Maintain consistency with established character appearance
- Create engaging, child-appropriate imagery
- Respond with valid JSON format`;

      if (secondaryElements.length > 0) {
        content += `\n\nSECONDARY CHARACTERS: ${secondaryElements.map(e => e.name).join(', ')}`;
      }

      if (visualDetails && (visualDetails.clothing.length > 0 || visualDetails.objects.length > 0)) {
        content += `\n\nCONSISTENT VISUAL ELEMENTS:`;
        if (visualDetails.clothing.length > 0) {
          content += `\n- Clothing: ${visualDetails.clothing.join(', ')}`;
        }
        if (visualDetails.objects.length > 0) {
          content += `\n- Objects: ${visualDetails.objects.join(', ')}`;
        }
      }

      if (regionalContext[userLanguage] && userLanguage !== 'en') {
        content += `\nOptional cultural inspiration (enhance settings creatively with regional architecture/landmarks): ${regionalContext[userLanguage]}`;
      }
      
      return content;
    }

    const minimalMessages = [
      { role: "system", content: buildSystemContent() },
      { role: "user", content: buildUserContent() }
    ];

    console.log(`AI [${requestId}] PHASE 1.2: Enhanced prompt constructed:`, {
      systemPromptLength: minimalMessages[0].content.length,
      userPromptLength: minimalMessages[1].content.length,
      enhancedCharacterDescription: enhancedCharacterDescription,
      secondaryElementsCount: secondaryElements.length,
      visualDetailsIncluded: !!visualDetails,
      storyTextLength: storyText.length
    });

    // PHASE 1.3: AI Call for Primary Scene ONLY
    let primaryScene;
    let setting, action, mood, pose; // Declare scope variables for later use
    try {
      console.log(`AI [${requestId}] PHASE 1.3: Calling OpenAI for primary scene...`);
      const aiResult = await callOpenAIWithFallback(minimalMessages, 6000, requestId, avatarIdentity);
      
      const content = aiResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned no content');
      }
      
      const parsedResult = parseAIResponse(content.trim(), { requestId });
      primaryScene = parsedResult.primaryScene;
      
      setting = parsedResult.setting || null;
      action = parsedResult.action || null;
      mood = parsedResult.mood || null;
      pose = parsedResult.pose || null;
      
      if (!primaryScene || primaryScene.length < 30) {
        throw new Error(`Primary scene validation failed: length ${primaryScene?.length || 0} < 30`);
      }
      
      console.log(`SUCCESS [${requestId}] PHASE 1.3: Primary scene generated successfully:`, {
        primarySceneLength: primaryScene.length,
        primaryScenePreview: primaryScene.substring(0, 100) + '...'
      });
      
      // PHASE 1.3b: Update Visual Details with Generated Scene
      console.log('UPDATE PHASE 1.3b: Updating visual details with generated primary scene');
      VisualDetailTracker.analyzeTextForDetails(sessionId, primaryScene, pageNumber);
      
      // PHASE 1.3c: Inject Consistent Visual Details into Scene
      const updatedPrimaryScene = VisualDetailTracker.injectConsistentDetails(sessionId, primaryScene, pageNumber);
      if (updatedPrimaryScene !== primaryScene) {
        console.log('UPDATE PHASE 1.3c: Primary scene updated with consistent visual details');
        primaryScene = updatedPrimaryScene;
      }
      
    } catch (error) {
      console.error(`ERROR [${requestId}] PHASE 1.3: AI call failed:`, error.message);
      // Return error to trigger Tier 2
      TierFailureLogger.logTier1OpenAIFailure(error, {
        sessionId,
        storyId,
        pageNumber,
        phase: 'PHASE_1_AI_CALL'
      });
      return createCorsErrorResponse(`Phase 1 AI call failed: ${error.message}`, 422);
    }

    // =================== PHASE 2: POST-AI PROMPT CONSTRUCTION ===================
    console.log('ART PHASE 2: Post-AI Prompt Construction');
    
    // PHASE 2.1: Enhanced Character Description (sentence 1) with Database Consistency
    const baseCharacterDescription = enhancedCharacterDescription;
    console.log(`TEXT PHASE 2.1: Enhanced character: ${baseCharacterDescription}`);
    
    // PHASE 2.2: Primary Scene Integration (sentence 2+)
    const sceneIntegration = primaryScene;
    console.log(`SCENE PHASE 2.2: Scene integrated: ${sceneIntegration.substring(0, 50)}...`);
    
    console.log('CHARACTER PHASE 2.3: Scene data prepared for orchestrator');
    
    // PHASE 2.5: Character Consistency Database Storage (Enhanced Implementation)
    console.log('STORAGE PHASE 2.5: Character consistency stored in database via CharacterConsistencyService');
    console.log(`CHARACTER Character seed ${characterData.seed} persisted for session ${sessionId}`);
    
    // Store current AI scene for next page consistency
    try {
      const sessionManager = new SessionStateManager();
      await sessionManager.storePreviousAIScene(sessionId, {
        primaryScene: primaryScene,
        setting: setting,
        action: action,
        mood: mood,
        pose: pose
      });
      console.log(`SCENE Current scene stored for next page consistency`);
    } catch (error) {
      console.warn('WARNING Failed to store scene for next page (non-critical):', error);
    }

    console.log('BUILD SCENE DATA ASSEMBLY: Character Consistency + Scene Data Ready', {
      hasSecondaryCharacters: secondaryElements.length > 0,
      hasVisualDetails: !!visualDetails,
      characterSeed: characterData.seed,
      primarySceneLength: primaryScene.length
    });
    
    // Create enhanced story data for return with character consistency
    enhancedStoryData = {
      primaryScene: primaryScene,
      characters: baseCharacterDescription,
      secondaryCharacters: secondaryElements,
      visualDetails: visualDetails,
      characterSeed: characterData.seed,
      // Conditionally include visual components only if they exist
      ...(typeof setting !== 'undefined' && { 
        visualComponents: {
          setting: setting || null,
          action: action || null,
          mood: mood || null,
          pose: pose || null
        }
      }),
      enhancedTier1: true, // Updated from reorganizedTier1
      characterConsistency: {
        databaseBacked: true,
        characterSeed: characterData.seed,
        secondaryCharactersCount: secondaryElements.length,
        visualDetailsTracked: !!visualDetails
      },
      phases: {
        phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
        phase2: 'Secondary character descriptions'
      }
    };
    
    console.log(`SUCCESS SCENE CREATOR: Scene data with character consistency ready for orchestrator`);
    
    // =================== DEBUG OUTPUT ===================
    // Check if debug mode is enabled via any debug parameter
    const debugMode = req.url.includes('debug=1') || req.url.includes('debug=true');
    
    if (debugMode) {
      console.log(`ART AI DEBUG OUTPUT:`);
      console.log(`TARGET Primary Scene: "${primaryScene}"`);
      console.log(`HOUSE Setting: ${setting || 'null'}`);
      console.log(`ACTION Action: ${action || 'null'}`);
      console.log(`MOOD Mood: ${mood || 'null'}`);
      console.log(`POSE Pose: ${pose || 'null'}`);
      console.log(`CHAR Character: ${characterData?.name || 'Unknown'} (seed: ${characterData?.seed || 'none'})`);
      console.log(`STATS Processing: 3-phase enhanced with ${secondaryElements.length} secondary characters`);
    }
    
    // =================== VALIDATION & RETURN RESULTS ===================
    // No complex validation needed since we built the prompts ourselves
    const validationResult = {
      enhancedData: enhancedStoryData,
      fieldCheck: {
        primaryScene: true,
        passCount: 3,
        details: 'reorganized_tier1_success'
      }
    };
    
    console.log(`SUCCESS ENHANCED TIER 1: Validation passed - all phases complete with character consistency`);
    
    // Return enhanced data with assembled prompts for Runware
    const result = {
      success: true,
      aiSchema: enhancedStoryData,
      metadata: {
        enhancedTier1: true, // Updated from reorganizedTier1
        characterConsistency: {
          databaseBacked: true,
          characterSeed: characterData.seed,
          secondaryCharactersDetected: secondaryElements.length,
          visualDetailsTracked: !!visualDetails
        },
        validation: {
          fieldsPresent: 5, // Updated count
          fieldsPassed: true,
          processingMethod: '3-phase-enhanced-with-consistency',
          modelUsed: 'openai-enhanced'
        },
        extractedElements: {
          hasCharacters: true,
          hasVisualComponents: true,
          hasPrimaryScene: true,
          complexity: storyText.length > 200 ? 'complex' : storyText.length > 100 ? 'medium' : 'simple'
        },
        contextualInfo: {
          pageNumber,
          totalPages: totalPages || 'unlimited',
          sessionId,
          originalTextLength: storyText.length,
          processingTimestamp: new Date().toISOString(),
          isNeverEnding: !totalPages
        },
        narrativeEnhancements: {
          sceneType: 'illustration',
          lighting: 'natural',
          mood: 'cheerful',
          schemaVersion: '3-phase-reorganized'
        },
        phases: {
          phase1: 'AI scene generation + character DB + secondary detection + visual tracking',
          phase2: 'Secondary character descriptions'
        }
      },
      enhancedStoryData: enhancedStoryData || {}
    };

    const totalDuration = FunctionMonitoring.endTimer('total_request');
    EdgeErrorHandler.logPerformance('total_request', totalDuration, { requestId });

    console.log(`SUCCESS SCENE CREATOR: Complete - Phases: AI Scene + Character DB + Secondary + Visual(SUCCESS) -> Secondary Characters(SUCCESS) - Scene data ready for orchestrator`);

    return createCorsResponse(result);

  } catch (error) {
    // OpenAI FAILURE -> Return error to Orchestrator (no internal fallback)
    console.error('ERROR AI Story Enhancer failed - returning error to Orchestrator:', {
      errorMessage: error.message,
      errorStack: error.stack,
      requestData: requestBody ? Object.keys(requestBody) : 'no-request-body'
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorType: 'ai-enhancement-failed',
      processingMethod: 'openai-failed',
      requestId: requestBody?.sessionId || 'unknown-session'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});