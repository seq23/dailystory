import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { StoryVisualStateManager } from "../_shared/storyVisualState.js"
import { AdvancedPronounResolver } from "../_shared/AdvancedPronounResolver.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, ...params } = await req.json();
    
    console.log(`🎨 Visual State API - Action: ${action}, Session: ${sessionId}`);

    let result;

    switch (action) {
      case 'initialize-character':
        result = await initializeCharacterContext(sessionId, params.userInfo, params.totalPages);
        break;

      case 'update-character':
        result = await updateCharacterWithSeed(
          sessionId, 
          params.characterName, 
          params.description, 
          params.seed, 
          params.pageNumber
        );
        break;

      case 'get-character-seed':
        result = await getCharacterSeed(sessionId, params.characterName);
        break;

      case 'resolve-pronouns':
        result = await resolvePronouns(sessionId, params.text, params.pageNumber);
        break;

      case 'analyze-details':
        result = await analyzeTextForDetails(sessionId, params.text, params.pageNumber);
        break;

      case 'inject-details':
        result = await injectConsistentDetails(sessionId, params.text, params.pageNumber);
        break;

      case 'get-prompt-details':
        result = await getVisualDetailsForPrompt(sessionId, params.pageNumber);
        break;

      case 'clear-state':
        result = await clearVisualState(sessionId);
        break;

      case 'update-setting':
        result = await updateSetting(sessionId, params.pageNumber, params.newSetting);
        break;

      case 'get-setting-prompt':
        result = await getSettingForPrompt(sessionId);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Visual State API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

/**
 * Initialize character context for visual consistency
 */
async function initializeCharacterContext(sessionId: string, userInfo: any, totalPages: number) {
  console.log(`🎭 Initializing character context for session: ${sessionId}`);
  
  // Initialize story state
  StoryVisualStateManager.getOrCreateStoryState(sessionId, false, totalPages);
  
  // Generate character description and store
  if (userInfo.name) {
    const characterDesc = generateCharacterDescription(userInfo);
    StoryVisualStateManager.updateCharacterWithSeed(sessionId, userInfo.name, undefined, characterDesc);
    console.log(`✅ Character context initialized for ${userInfo.name}`);
  }
  
  return { initialized: true, sessionId };
}

/**
 * Update character with seed for consistency
 */
async function updateCharacterWithSeed(
  sessionId: string,
  characterName: string,
  description: string,
  seed?: number,
  pageNumber: number = 1
) {
  console.log(`🎭 Updating character: ${characterName} with seed: ${seed}`);
  
  StoryVisualStateManager.updateCharacterWithSeed(sessionId, characterName, seed, description);
  
  return { 
    characterName, 
    seed, 
    description,
    pageNumber 
  };
}

/**
 * Get character seed for consistency
 */
async function getCharacterSeed(sessionId: string, characterName: string) {
  const seed = StoryVisualStateManager.getCharacterSeed?.(sessionId, characterName);
  
  console.log(`🎭 Retrieved seed for ${characterName}: ${seed}`);
  
  return { characterName, seed };
}

/**
 * Resolve pronouns in text for consistency
 */
async function resolvePronouns(sessionId: string, text: string, pageNumber: number) {
  console.log(`🔄 Resolving pronouns for session: ${sessionId}, page: ${pageNumber}`);
  
  // Use advanced pronoun resolver
  const resolvedText = AdvancedPronounResolver.resolveComplexPronouns(sessionId, text, pageNumber);
  
  // Also use story visual state pronoun resolution as fallback
  const finalText = StoryVisualStateManager.resolvePronouns(sessionId, resolvedText, pageNumber);
  
  return { 
    originalText: text,
    resolvedText: finalText,
    pageNumber 
  };
}

/**
 * Analyze text for visual details
 */
async function analyzeTextForDetails(sessionId: string, text: string, pageNumber: number) {
  console.log(`🔍 Analyzing visual details for session: ${sessionId}, page: ${pageNumber}`);
  
  const details = StoryVisualStateManager.analyzeAndTrackVisualDetails(sessionId, text, pageNumber);
  
  return { 
    details,
    pageNumber,
    detailCount: details.length 
  };
}

/**
 * Inject consistent details into text
 */
async function injectConsistentDetails(sessionId: string, text: string, pageNumber: number) {
  console.log(`🎯 Injecting consistent details for session: ${sessionId}, page: ${pageNumber}`);
  
  // This functionality would need to be implemented in the backend StoryVisualStateManager
  // For now, return the original text
  const enhancedText = text; // StoryVisualStateManager.injectConsistentDetails(sessionId, text, pageNumber);
  
  return { 
    originalText: text,
    enhancedText,
    pageNumber 
  };
}

/**
 * Get visual details for prompt enhancement
 */
async function getVisualDetailsForPrompt(sessionId: string, pageNumber?: number) {
  console.log(`📋 Getting visual details for prompt, session: ${sessionId}`);
  
  const details = StoryVisualStateManager.getVisualDetailsForPrompt(sessionId);
  
  return { 
    details,
    pageNumber,
    sessionId 
  };
}

/**
 * Clear visual state for session cleanup
 */
async function clearVisualState(sessionId: string) {
  console.log(`🗑️ Clearing visual state for session: ${sessionId}`);
  
  StoryVisualStateManager.clearStoryState(sessionId);
  AdvancedPronounResolver.clearSession(sessionId);
  
  return { 
    cleared: true,
    sessionId 
  };
}

/**
 * Update story setting for consistency
 */
async function updateSetting(sessionId: string, pageNumber: number, newSetting: any) {
  console.log(`🎨 Updating setting for session: ${sessionId}, page: ${pageNumber}`);
  
  const updated = StoryVisualStateManager.updateSetting(sessionId, newSetting);
  
  return { 
    updated,
    setting: newSetting,
    pageNumber 
  };
}

/**
 * Get setting for prompt enhancement
 */
async function getSettingForPrompt(sessionId: string) {
  console.log(`🎨 Getting setting for prompt, session: ${sessionId}`);
  
  // This would need to be implemented in backend StoryVisualStateManager
  const setting = ''; // StoryVisualStateManager.getSettingForPrompt(sessionId);
  
  return { 
    setting,
    sessionId 
  };
}

/**
 * Generate character description based on user info
 */
function generateCharacterDescription(userInfo: any): string {
  const { name, avatar } = userInfo;
  
  let description = name || 'child';
  
  if (avatar) {
    if (avatar.type === 'girl') {
      description += ', a young girl';
    } else if (avatar.type === 'boy') {
      description += ', a young boy';
    }
    
    if (avatar.skinTone) {
      description += ` with ${avatar.skinTone} skin`;
    }
    
    if (avatar.hairColor) {
      description += ` and ${avatar.hairColor} hair`;
    }
  }
  
  return description;
}