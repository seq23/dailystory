// Clean Deploy: 2025-01-30T12:00:00Z - Enhanced with resilient loader
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { memoizedImport, createTieredSupabaseClient, createImportFailureResponse } from '../_shared/resilientLoader.ts';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.ts';
import { getPerPageTokenLimit, getStoryPrompt, formatUserPrompt, resolvePromptPlaceholders } from '../_shared/storyPrompts.ts';
import { ENHANCED_LEVEL_0_VOCABULARY } from '../_shared/vocabulary/dolchPrePrimer.ts';
import { handleStreamlinedGeneration } from './streamlined-handler.ts';

// Supabase client will be created inside handler for better error handling

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Max-Age': '600',
}

// Diagnostic function to check API key availability
function validateOpenAIApiKey(): { isValid: boolean; error?: string } {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  console.log('🔍 DIAGNOSTIC: Checking OpenAI API key availability', {
    hasApiKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
    timestamp: new Date().toISOString()
  });
  
  if (!apiKey) {
    return { isValid: false, error: 'OPENAI_API_KEY environment variable not set' };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return { isValid: false, error: 'Invalid OpenAI API key format' };
  }
  
  if (apiKey.length < 20) {
    return { isValid: false, error: 'OpenAI API key appears to be incomplete' };
  }
  
  return { isValid: true };
}

// ============================================================================
// SIMPLIFIED STORY GENERATION - DEBLOATED VERSION
// Template processing moved to dedicated template-service edge function
// ============================================================================

// Name formatting utilities for proper capitalization
class NameFormatter {
  static capitalize(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    const trimmed = name.trim();
    if (!trimmed) return '';
    
    // Handle hyphenated names (Mary-Jane -> Mary-Jane)
    if (trimmed.includes('-')) {
      return trimmed.split('-')
        .map(part => this.capitalizeWord(part))
        .join('-');
    }
    
    // Handle multiple words (Mary Jane -> Mary Jane)
    if (trimmed.includes(' ')) {
      return trimmed.split(' ')
        .map(part => this.capitalizeWord(part))
        .join(' ');
    }
    
    // Single word
    return this.capitalizeWord(trimmed);
  }
  
  private static capitalizeWord(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

// Color converter utility
const HEX_TO_COLOR_MAP: Record<string, string> = {
  '#3B82F6': 'blue',
  '#EF4444': 'red', 
  '#10B981': 'green',
  '#F59E0B': 'yellow',
  '#8B5CF6': 'purple',
  '#EC4899': 'pink',
  '#F97316': 'orange',
  '#06B6D4': 'cyan',
  '#84CC16': 'lime',
  '#6366F1': 'indigo',
  '#14B8A6': 'teal',
  '#F43F5E': 'rose',
  '#A855F7': 'violet',
  '#22C55E': 'emerald'
};

function ensureColorName(color: string | undefined): string {
  if (!color) return 'blue';
  if (!color?.startsWith('#')) {
    return color || 'blue';
  }
  const colorName = HEX_TO_COLOR_MAP[color.toLowerCase()];
  return colorName || 'blue';
}

// Hair color mapping for English speakers only
function getHairColorForSkinTone(skinTone: string | undefined): string | null {
  if (!skinTone) return null;
  
  const hairColorMap: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair', 
    'medium': 'brown hair',
    'olive': 'black hair',
    'dark': 'textured natural hair'
  };
  
  return hairColorMap[skinTone] || null;
}

// All template arrays removed - moved to template-service edge function
// This saves ~900 lines of hardcoded template data

// Removed: EnhancedFallbackManager - replaced by template-service edge function

// Removed: getFallbackTemplate and getEnhancedFallbackPages - replaced by template-service calls

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Health endpoint
  if (req.method === 'HEAD' && new URL(req.url).pathname === '/health') {
    return new Response(null, { 
      status: 200, 
      headers: { 
        ...corsHeaders,
        'x-health': 'true', 
        'Cache-Control': 'no-store' 
      }
    });
  }

  // Health check endpoint
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('📊 Health check requested');
    return new Response(JSON.stringify({ status: 'healthy' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Read request body once at the top to avoid double consumption
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (error) {
    console.error('❌ Failed to read request body:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to read request body' 
    }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Create Supabase client inside handler for better error handling
  let supabase;
  try {
    supabase = await createTieredSupabaseClient();
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    
    // TIER 3: Emergency Template Service Fallback - Fixed detection and body forwarding
    if (error instanceof Error && (((error.message || '').toLowerCase().includes('supabase_unavailable')) || ((error.message || '').toLowerCase().includes('service unavailable')))) {
      console.log('🚨 TIER 3 ACTIVATED: Routing to template service for emergency content generation');
      
      try {
        // Use the already-read request body
        
        const templateServiceUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/template-service`;
        console.log('📡 Calling template service at:', templateServiceUrl);
        
        const templateResponse = await fetch(templateServiceUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: rawBody // Forward original body intact
        });
        
        if (templateResponse.ok) {
          console.log('✅ Template service responded successfully - forwarding response');
          return templateResponse;
        } else {
          console.error('❌ Template service failed:', templateResponse.status);
        }
      } catch (templateError) {
        console.error('💥 Template service error:', templateError);
      }
    }
    
    return createImportFailureResponse(error, 'generate-adaptive-story');
  }

  // Log request diagnostics
  const contentType = req.headers.get('content-type') || 'unknown';
  const contentLength = req.headers.get('content-length') || 'unknown';
  console.log('📨 REQUEST DIAGNOSTICS:', {
    method: req.method,
    contentType,
    contentLength,
    timestamp: new Date().toISOString()
  });

  // Safe request body parsing
  let requestBody = null;
  
  try {
    // Use the already-read raw body
    
    // Check for empty body
    if (!rawBody || rawBody.trim().length === 0) {
      console.warn('⚠️ Empty request body received');
      return new Response(JSON.stringify({
        success: false,
        error: 'Empty body; expected JSON with { bundle, config }'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON safely
    try {
      requestBody = JSON.parse(rawBody);
      console.log('✅ Request body parsed successfully', {
        hasBundle: !!requestBody.bundle,
        hasConfig: !!requestBody.config
      });
    } catch (jsonError) {
      console.error('❌ Invalid JSON in request body:', jsonError instanceof Error ? jsonError.message : String(jsonError));
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // UNIFIED 4-TIER ARCHITECTURE: Handle pre-processed bundles from StoryGenerationService
    if (requestBody.bundle) {
      console.log('🎯 Processing bundle request');
      return await handleStreamlinedGeneration(requestBody);
    }
    
    // Missing bundle - proper error message
    console.warn('⚠️ Request missing bundle parameter');
    return new Response(JSON.stringify({
      success: false,
      error: 'Legacy direct calls deprecated. Please send { bundle, config }'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 Story generation error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Story generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});