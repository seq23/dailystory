import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { DifficultyLevelMapper } from '../_shared/DifficultyLevelMapper.js';
import { getTokenLimitForDifficulty, getStoryPrompt, formatUserPrompt, resolvePromptPlaceholders } from '../_shared/storyPrompts.ts';
import { ENHANCED_LEVEL_0_VOCABULARY } from '../_shared/vocabulary/dolchPrePrimer.ts';

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

  let requestBody = null;
  
  try {
    requestBody = await req.json();
    
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

    // Create age-appropriate prompt with avatar gender context
    const userName = NameFormatter.capitalize(config?.userName || 'the child');
    const normalizedReadingLevel = DifficultyLevelMapper.normalizeLevel(readingLevel || 'easy');
    
    // Extract avatar gender for correct pronoun usage in AI generation
    const avatarType = config?.userInfo?.avatar?.type || config?.avatar?.type || 'prefer-not-to-answer';
    const avatarGender = avatarType === 'girl' ? 'girl' : avatarType === 'boy' ? 'boy' : 'child';
    
    console.log('🎭 Avatar Context for AI Generation:', { 
      avatarType, 
      avatarGender, 
      userName,
      normalizedReadingLevel 
    });
    
    // Get prompt configuration from shared prompt system
    const promptConfig = getStoryPrompt(normalizedReadingLevel);
    
    // Use dynamic token limits from getTokenLimitForDifficulty function
    const maxTokens = getTokenLimitForDifficulty(normalizedReadingLevel);
    
    // Inject avatar gender and pronouns into shared prompts
    const pronouns = avatarGender === 'girl' ? 'she/her' : avatarGender === 'boy' ? 'he/him' : 'they/them';
    const genderPrompt = `The main character is a ${avatarGender} named {userName} - use ${pronouns} pronouns consistently throughout. `;
    
    // Inject gender context into system prompt
    let systemPrompt = promptConfig.systemPrompt;
    if (!systemPrompt.includes('main character is a')) {
      systemPrompt = systemPrompt.replace('Always allow {userName}', `${genderPrompt}Always allow {userName}`);
    }
    
    // Format user prompt with placeholders
    const userInfo = {
      name: userName,
      favoriteColor: ensureColorName(config?.favoriteColor),
      favoriteAnimal: config?.favoriteAnimal || 'cat',
      favoriteFood: config?.favoriteFood || 'cookies',
      hobbies: config?.hobbies || 'playing outside',
      specialRequest: config?.specialRequest || 'adventure'
    };
    
    let userPrompt = formatUserPrompt(promptConfig.userPromptTemplate, userInfo);
    
    // Add gender context to user prompt for clarity
    userPrompt = `${genderPrompt}${userPrompt}`;
    
    console.log('📝 Generating story with OpenAI...', { 
      level: normalizedReadingLevel, 
      isLevel0: normalizedReadingLevel === 'beginner',
      maxTokens 
    });
    
    console.log('🔍 BEFORE placeholder resolution:', {
      systemPromptPreview: systemPrompt.substring(0, 150) + '...',
      userPromptPreview: userPrompt.substring(0, 150) + '...',
      userInfo
    });
    
    // Resolve placeholders using shared prompt system
    const resolvedSystemPrompt = resolvePromptPlaceholders(systemPrompt, userInfo);
    const resolvedUserPrompt = resolvePromptPlaceholders(userPrompt, userInfo);
    
    console.log('✅ AFTER placeholder resolution:', {
      systemPromptPreview: resolvedSystemPrompt.substring(0, 150) + '...',
      userPromptPreview: resolvedUserPrompt.substring(0, 150) + '...',
      placeholdersResolved: true
    });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: resolvedSystemPrompt },
          { role: 'user', content: resolvedUserPrompt }
        ],
        max_completion_tokens: maxTokens
      }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let storyText = data.choices[0].message.content;
    
    // Remove any title/chapter patterns that may have slipped through
    storyText = storyText.replace(/\*\*Title:.*?\*\*/gi, '')
                        .replace(/\*\*Chapter.*?\*\*/gi, '')
                        .replace(/^Title:.*?\n/gmi, '')
                        .replace(/^Chapter.*?\n/gmi, '')
                        .trim();
    
    // Enhanced logging for debugging
    console.log('🔍 Raw OpenAI Response:', {
      hasContent: !!storyText,
      contentLength: storyText?.length || 0,
      contentPreview: storyText?.substring(0, 100) + '...',
      level: normalizedReadingLevel,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced page parsing for Level 0 with multi-tier fallbacks
    let pages: string[] = [];
    if (normalizedReadingLevel === 'beginner') {
      console.log('🎯 Processing Level 0 (beginner) content...');
      
      // Tier 1: Split by double line breaks (paragraph separation)
      let initialPages = storyText.split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => p.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '));
      
      console.log('📄 Tier 1 (Paragraph splits):', { found: initialPages.length, hasContent: initialPages.some(p => p.length > 0) });
      
      // Tier 2: Fallback to sentence-based splitting if no paragraphs found
      if (initialPages.length === 0 || !initialPages.some(p => p.length > 0)) {
        console.log('🔄 Tier 2: Using sentence-based splitting fallback...');
        initialPages = storyText.split(/[.!?]+/)
          .filter(s => s.trim())
          .map(s => s.trim() + '.')
          .slice(0, 12);
        console.log('📝 Tier 2 (Sentences):', { found: initialPages.length });
      }
      
      // Tier 3: Word-count based splitting if sentences are too long
      if (initialPages.some(page => page.split(' ').length > 8)) {
        console.log('🔄 Tier 3: Using word-count based splitting...');
        const words = storyText.replace(/[.!?]+/g, '').split(/\s+/).filter(w => w.trim());
        initialPages = [];
        for (let i = 0; i < Math.min(words.length, 60); i += 5) {
          const pageWords = words.slice(i, i + 5);
          if (pageWords.length > 0) {
            initialPages.push(pageWords.join(' ') + '.');
          }
        }
        console.log('📊 Tier 3 (Word-count):', { found: initialPages.length });
      }
      
      // Final validation and processing for Level 0
      pages = initialPages
        .slice(0, 12)
        .map(page => {
          // Ensure each page is exactly one sentence
          const sentences = page.split(/[.!?]+/).filter(s => s.trim());
          if (sentences.length > 1) {
            return sentences[0].trim() + '.';
          }
          // Ensure it ends with punctuation
          const cleanPage = page.trim();
          if (!cleanPage.match(/[.!?]$/)) {
            return cleanPage + '.';
          }
          return cleanPage;
        })
        .filter(page => {
          // Validate: 4-8 words for Level 0
          const wordCount = page.split(' ').length;
          return wordCount >= 2 && wordCount <= 8 && page.length > 3;
        });
      
      console.log('✅ Final Level 0 pages:', { 
        count: pages.length, 
        avgWordCount: pages.reduce((acc, p) => acc + p.split(' ').length, 0) / pages.length,
        samples: pages.slice(0, 2)
      });
      
    } else {
      // Other levels: improved content splitting to prevent concatenation  
      let rawPages = storyText.split(/\n\n+/).filter(p => p.trim());
      
      // Enhanced page cleaning to remove page markers
      rawPages = rawPages.map(page => 
        page
          .replace(/^\*\*Page\s*\d+\*\*:?\s*/i, '')       // **Page 1:** or **Page 1**
          .replace(/^Page\s*\d+\s*:\s*/i, '')              // Page 1: 
          .replace(/^Page\s*\d+\s*/i, '')                  // Page 1
          .replace(/^\d+\.\s*/i, '')                       // 1. 
          .replace(/^Page\s*(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s*:?\s*/i, '') // Page One:
          .replace(/^Chapter\s*\d+\s*:?\s*/i, '')          // Chapter 1:
          .replace(/^\*\*\d+\*\*\s*:?\s*/i, '')           // **1**:
          .trim()
      ).filter(p => p.length > 10);
      
      // If pages are too long, split them further
      pages = [];
      for (const rawPage of rawPages) {
        const sentences = rawPage.match(/[^.!?]*[.!?]+/g) || [rawPage];
        const wordCount = rawPage.split(/\s+/).length;
        
        if (wordCount > 80) {
          // Split long paragraphs into smaller chunks
          const midpoint = Math.floor(sentences.length / 2);
          if (sentences.length > 1) {
            pages.push(sentences.slice(0, midpoint).join(' ').trim());
            pages.push(sentences.slice(midpoint).join(' ').trim());
          } else {
            pages.push(rawPage);
          }
        } else {
          pages.push(rawPage);
        }
      }
      
      pages = pages.slice(0, 12);
      console.log('📖 Other level processing:', { level: normalizedReadingLevel, pagesFound: pages.length });
    }
    
    // Content validation before returning
    if (pages.length === 0) {
      console.error('❌ No pages generated from AI response - will trigger fallback');
      throw new Error('AI generated empty content');
    }
    
    // Process pages through unified post-processing system
    console.log('🔄 Sending pages to unified post-processor...');
    const { data: processedResult, error: processingError } = await supabase.functions.invoke('process-story-content', {
      body: {
        pages: pages,
        userInfo: {
          name: userName,
          avatar: { type: avatarType },
          favoriteColor: ensureColorName(config?.favoriteColor),
          favoriteAnimal: config?.favoriteAnimal || 'cat',
          favoriteFood: config?.favoriteFood || 'cookies',
          hobbies: config?.hobbies || 'playing outside',
          specialRequest: config?.specialRequest || 'adventure'
        }
      }
    });

    let finalPages = pages; // fallback to original pages
    if (processedResult && !processingError && processedResult.success) {
      finalPages = processedResult.processedPages;
      console.log('✅ Unified processing successful:', processedResult.processingMetadata);
    } else {
      console.warn('⚠️ Unified processing failed, using raw pages:', processingError);
    }
    
    console.log('EDGE SOURCE=ai', { readingLevel: normalizedReadingLevel, pagesCount: finalPages.length });
    return new Response(JSON.stringify({
      source: 'ai',
      pages: finalPages,
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