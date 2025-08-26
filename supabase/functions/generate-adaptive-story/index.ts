import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.js';

// Initialize Supabase client for service-to-service communication
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// All template arrays removed - moved to template-service edge function
// This saves ~900 lines of hardcoded template data

// Removed: EnhancedFallbackManager - replaced by template-service edge function

// Removed: getFallbackTemplate and getEnhancedFallbackPages - replaced by template-service calls

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Diagnostic mode check
    if (requestBody.diagnostic === true) {
      const diagnostic = requestBody.type;
      
      if (diagnostic === 'key_validation') {
        const keyValidation = validateOpenAIApiKey();
        return new Response(
          JSON.stringify({ 
            success: keyValidation.isValid,
            diagnostic: true,
            message: keyValidation.isValid ? 'OpenAI API key is configured and valid' : keyValidation.error,
            keyValidation
          }),
          { 
            status: keyValidation.isValid ? 200 : 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    const { readingLevel, interests, config, sessionType } = requestBody;
    
    // Server-side COPPA validation
    console.log('🔍 Running COPPA compliance checks...');
    
    if (interests && Array.isArray(interests)) {
      for (const interest of interests) {
        if (typeof interest === 'string') {
          const lowerInterest = interest.toLowerCase();
          if (lowerInterest.includes('adult') || lowerInterest.includes('mature')) {
            throw new Error('Content not suitable for children');
          }
        }
      }
    }

    // Create age-appropriate prompt
    const userName = NameFormatter.capitalize(config?.userName || 'the child');
    const normalizedReadingLevel = DifficultyLevelMapper.normalizeLevel(readingLevel || 'easy');
    
    const basePrompt = `Create a personalized children's story for ${userName} at ${normalizedReadingLevel} reading level.`;
    
    console.log('📝 Generating story with OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: 'You are a children\'s story writer. Create age-appropriate, positive stories.' },
          { role: 'user', content: basePrompt }
        ],
        max_completion_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const storyText = data.choices[0].message.content;
    
    // Simple page parsing
    const pages = storyText.split(/\n\n+/).filter(p => p.trim()).slice(0, 8);
    
    console.log('EDGE SOURCE=ai', { readingLevel: normalizedReadingLevel, pagesCount: pages.length });
    return new Response(JSON.stringify({
      source: 'ai',
      pages: pages,
      difficulty: normalizedReadingLevel,
      title: `${userName}'s Story`,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Story generation error:', error);
    
    const fallbackConfig = requestBody?.config || {};
    const fallbackReadingLevel = requestBody?.readingLevel || 'easy';
    const userName = fallbackConfig?.userName || 'the child';
    
    // Get fallback pages using template-service edge function
    const { data: templateResult, error: templateError } = await supabase.functions.invoke('template-service', {
      body: {
        difficulty: fallbackReadingLevel,
        userInfo: {
          name: userName,
          avatar: fallbackConfig?.avatar,
          favoriteColor: fallbackConfig?.favoriteColor,
          favoriteAnimal: fallbackConfig?.favoriteAnimal,
          favoriteFood: fallbackConfig?.favoriteFood,
          hobbies: fallbackConfig?.hobbies,
          specialRequest: fallbackConfig?.specialRequest
        },
        pageCount: 5
      }
    });

    let rawFallbackPages: string[] = [];
    if (templateResult && !templateError) {
      rawFallbackPages = templateResult.pages || [];
      console.log('✅ Template service provided fallback pages:', rawFallbackPages.length);
    } else {
      console.warn('⚠️ Template service failed:', templateError);
      console.log('🚨 Using emergency fallback');
      rawFallbackPages = [
        `${userName} loves adventures and making new friends.`,
        "Every day brings wonderful discoveries and surprises.",
        "With kindness and courage, anything is possible.",
        "The best stories are the ones we create together."
      ];
    }

    console.log('EDGE SOURCE=fallback', { readingLevel: fallbackReadingLevel, pagesCount: rawFallbackPages.length });
    return new Response(JSON.stringify({
      source: 'fallback',
      pages: rawFallbackPages,
      difficulty: fallbackReadingLevel,
      title: `${userName}'s Story`,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});