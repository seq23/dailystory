// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.ts';
import { getPerPageTokenLimit, getStoryPrompt, formatUserPrompt, resolvePromptPlaceholders } from '../_shared/storyPrompts.ts';
import { ENHANCED_LEVEL_0_VOCABULARY } from '../_shared/vocabulary/dolchPrePrimer.ts';
import { handleStreamlinedGeneration } from './streamlined-handler.ts';
import { handleHealthAndCors } from "../_shared/healthCors.ts";

// Initialize Supabase client for service-to-service communication
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  // Health check endpoint
  if (req.method === 'GET' || req.method === 'HEAD') {
    console.log('📊 Health check requested');
    return new Response(JSON.stringify({ status: 'healthy' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
    // Get raw body text first
    const rawBody = await req.text();
    
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
      console.error('❌ Invalid JSON in request body:', jsonError.message);
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
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Story generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});