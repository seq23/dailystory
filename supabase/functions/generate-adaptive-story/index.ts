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

// Hair color mapping for English speakers only
function getHairColorForSkinTone(skinTone: string | undefined): string | null {
  if (!skinTone) return null;
  
  const hairColorMap: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair', 
    'medium': 'brown hair',
    'olive': 'black hair',
    'dark': 'textured natural African American hair'
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
    
    // Extract skin tone for hair color mapping (English speakers only)
    const skinTone = config?.userInfo?.avatar?.skinTone || config?.avatar?.skinTone;
    const nativeLanguage = config?.userInfo?.nativeLanguage || config?.nativeLanguage || 'en';
    const isEnglishSpeaker = nativeLanguage === 'en';
    
    // Get hair color for English speakers only
    let hairColor: string | null = null;
    if (isEnglishSpeaker && skinTone) {
      hairColor = getHairColorForSkinTone(skinTone);
    }
    
    console.log('🎭 Avatar Context for AI Generation:', { 
      avatarType, 
      avatarGender, 
      userName,
      normalizedReadingLevel,
      skinTone,
      nativeLanguage,
      isEnglishSpeaker,
      hairColor: hairColor || 'none (non-English or no skin tone)'
    });
    
    // Get prompt configuration from shared prompt system
    const promptConfig = getStoryPrompt(normalizedReadingLevel);
    
    // Use dynamic token limits from getTokenLimitForDifficulty function
    const maxTokens = getTokenLimitForDifficulty(normalizedReadingLevel);
    
    // Inject avatar gender and pronouns into shared prompts
    const pronouns = avatarGender === 'girl' ? 'she/her' : avatarGender === 'boy' ? 'he/him' : 'they/them';
    
    // Create gender prompt with optional hair color for English speakers
    let genderPrompt = `The main character is a ${avatarGender} named {userName}`;
    if (hairColor) {
      genderPrompt += ` with ${hairColor}`;
    }
    genderPrompt += ` - use ${pronouns} pronouns consistently throughout. `;
    
    console.log('💇 Hair Color Integration:', {
      isEnglishSpeaker,
      skinTone,
      hairColor,
      genderPromptWithHair: hairColor ? 'included' : 'not included'
    });
    
    // Inject gender context into system prompt
    let systemPrompt = promptConfig.systemPrompt;
    if (!systemPrompt.includes('main character is a')) {
      systemPrompt = systemPrompt.replace('Always allow {userName}', `${genderPrompt}Always allow {userName}`);
    }
    
    // Format user prompt with placeholders - FIXED: Access nested userInfo
    const userInfo = {
      name: userName,
      favoriteColor: ensureColorName(config?.userInfo?.favoriteColor),
      favoriteAnimal: config?.userInfo?.favoriteAnimal || 'cat',
      favoriteFood: config?.userInfo?.favoriteFood || 'cookies',
      hobbies: config?.userInfo?.hobbies || 'playing outside',
      specialRequest: config?.userInfo?.specialRequest || 'adventure'
    };
    
    console.log('🔍 USER PREFERENCES DEBUG:', {
      requestedPreferences: config?.userInfo,
      resolvedUserInfo: userInfo,
      isUsingDefaults: {
        favoriteColor: !config?.userInfo?.favoriteColor,
        favoriteAnimal: !config?.userInfo?.favoriteAnimal,
        favoriteFood: !config?.userInfo?.favoriteFood,
        hobbies: !config?.userInfo?.hobbies,
        specialRequest: !config?.userInfo?.specialRequest
      }
    });
    
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
    
    console.log('🎯 Pre-AI Generation Configuration:', { 
      level: normalizedReadingLevel, 
      maxTokens,
      tokenLimitsExpected: `Medium:800 Hard:1200 Expert:1600`,
      hairColorEnabled: hairColor ? 'yes' : 'no'
    });
    
    // AI Generation with Retry Logic
    let storyText = '';
    let attempt = 1;
    const maxAttempts = 2;
    
    while (attempt <= maxAttempts && !storyText) {
      try {
        console.log(`🤖 AI Attempt ${attempt}/${maxAttempts}:`, { 
          level: normalizedReadingLevel,
          tokenBudget: maxTokens,
          retryMode: attempt > 1 ? 'enhanced-prompt' : 'standard'
        });
        
        // Enhanced prompt for retry attempts
        let retrySystemContent = resolvedSystemPrompt;
        let retryUserContent = resolvedUserPrompt;
        
        if (attempt > 1) {
          console.log('🔄 Applying enhanced retry prompts with stronger instructions...');
          retrySystemContent += `\n\nCRITICAL RETRY INSTRUCTIONS:
- Do NOT include ANY page numbers, titles, or chapter markers in your output
- Write flowing narrative content without numbered sections
- Generate natural story content that breaks cleanly into scenes
- Remove ALL formatting markers like **bold** or *italic*
- Each paragraph should be a complete scene or moment`;
          
          retryUserContent += ` IMPORTANT: Write clean story content without page numbers or formatting markers. Focus on natural narrative flow.`;
        }
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: retrySystemContent },
              { role: 'user', content: retryUserContent }
            ],
            max_completion_tokens: maxTokens
          }),
        });

        if (!response.ok) {
          throw new Error(`AI generation failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        storyText = data.choices[0].message.content;
        
        if (storyText && storyText.trim()) {
          console.log(`✅ AI Attempt ${attempt} SUCCESS:`, { 
            contentLength: storyText.length,
            hasContent: !!storyText.trim()
          });
          break;
        } else {
          console.log(`❌ AI Attempt ${attempt} produced empty content`);
          storyText = '';
        }
        
      } catch (error) {
        console.error(`❌ AI Attempt ${attempt} ERROR:`, error);
        storyText = '';
      }
      
      attempt++;
    }
    
    // If both AI attempts failed, proceed to fallback
    if (!storyText) {
      console.error('❌ Both AI attempts failed - will trigger fallback');
      throw new Error('AI generation failed after retry attempts');
    }
    
    // Enhanced comprehensive page number removal  
    storyText = storyText
      .replace(/\*\*Title:.*?\*\*/gi, '')
      .replace(/\*\*Chapter.*?\*\*/gi, '')
      .replace(/^Title:.*?\n/gmi, '')
      .replace(/^Chapter.*?\n/gmi, '')
      .replace(/^First page:.*?\n/gmi, '')
      .replace(/^Second page:.*?\n/gmi, '')
      .replace(/^Next:.*?\n/gmi, '')
      .replace(/^Finally:.*?\n/gmi, '')
      .replace(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./gmi, '')  // Roman numerals
      .replace(/^(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th):/gmi, '')  // Ordinals
      .replace(/^(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten):/gmi, '')  // Word numbers
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
      
      // Tier 3: Sentence-aware splitting for long sentences
      if (initialPages.some(page => page.split(' ').length > 8)) {
        console.log('🔄 Tier 3: Using sentence-aware splitting...');
        
        // Parse complete sentences first
        const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        initialPages = [];
        
        for (const sentence of sentences) {
          const words = sentence.trim().split(/\s+/).filter(w => w.trim());
          
          // If sentence fits in target range (2-6 words for level0), keep it whole
          if (words.length <= 6) {
            initialPages.push(sentence.trim() + '.');
          } else {
            // Split long sentences at logical points, preserving articles with nouns
            let currentPage = [];
            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              const nextWord = words[i + 1];
              
              currentPage.push(word);
              
              // If we're at ideal length (4-5 words) and not splitting article from noun
              if (currentPage.length >= 4 && 
                  !(word.toLowerCase() === 'a' || word.toLowerCase() === 'an' || word.toLowerCase() === 'the')) {
                initialPages.push(currentPage.join(' ') + '.');
                currentPage = [];
              }
            }
            
            // Add remaining words if any
            if (currentPage.length > 0) {
              initialPages.push(currentPage.join(' ') + '.');
            }
          }
        }
        
        console.log('📊 Tier 3 (Sentence-aware):', { found: initialPages.length });
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
      // Level-Appropriate 3-Tier Processing for Medium/Hard/Expert
      console.log(`🎯 Processing ${normalizedReadingLevel} content with adaptive 3-tier logic...`);
      
      // Tier 1: Paragraph-based splitting (same as beginner approach)
      let initialPages = storyText.split(/\n\n+/)
        .filter(p => p.trim())
        .map(p => p.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '));
      
      console.log('📄 Tier 1 (Paragraph splits):', { found: initialPages.length, hasContent: initialPages.some(p => p.length > 0) });
      
      // Tier 2: Adaptive sentence-based fallback (level-appropriate)
      if (initialPages.length === 0 || !initialPages.some(p => p.length > 0)) {
        console.log('🔄 Tier 2: Using adaptive sentence-based splitting...');
        initialPages = storyText.split(/[.!?]+/)
          .filter(s => s.trim())
          .map(s => s.trim() + '.')
          .slice(0, 12);
        console.log('📝 Tier 2 (Sentences):', { found: initialPages.length });
      }
      
      // Tier 3: Level-appropriate smart word-chunking  
      const targetWordCounts = {
        medium: { min: 40, max: 80, chunkSize: 55 },
        hard: { min: 60, max: 120, chunkSize: 90 },
        expert: { min: 80, max: 150, chunkSize: 115 }
      };
      
      const currentLevelConfig = targetWordCounts[normalizedReadingLevel as keyof typeof targetWordCounts] || targetWordCounts.medium;
      
      if (initialPages.some(page => page.split(' ').length > currentLevelConfig.max * 1.5)) {
        console.log(`🔄 Tier 3: Using smart word-chunking for ${normalizedReadingLevel} level...`);
        const words = storyText.replace(/[.!?]+/g, '').split(/\s+/).filter(w => w.trim());
        initialPages = [];
        
        for (let i = 0; i < Math.min(words.length, currentLevelConfig.chunkSize * 12); i += currentLevelConfig.chunkSize) {
          const pageWords = words.slice(i, i + currentLevelConfig.chunkSize);
          if (pageWords.length > 0) {
            initialPages.push(pageWords.join(' ') + '.');
          }
        }
        console.log(`📊 Tier 3 (${normalizedReadingLevel} word-chunks):`, { found: initialPages.length, chunkSize: currentLevelConfig.chunkSize });
      }
      
      // Enhanced page cleaning with comprehensive pattern removal
      let cleanedPages = initialPages.map(page => 
        page
          .replace(/^\*\*Page\s*\d+\*\*:?\s*/i, '')       // **Page 1:** or **Page 1**
          .replace(/^Page\s*\d+\s*:\s*/i, '')              // Page 1: 
          .replace(/^Page\s*\d+\s*/i, '')                  // Page 1
          .replace(/^\d+\.\s*/i, '')                       // 1. 
          .replace(/^Page\s*(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s*:?\s*/i, '') // Page One:
          .replace(/^Chapter\s*\d+\s*:?\s*/i, '')          // Chapter 1:
          .replace(/^\*\*\d+\*\*\s*:?\s*/i, '')           // **1**:
          .replace(/^First page:.*?\n/gmi, '')             // First page:
          .replace(/^Second page:.*?\n/gmi, '')            // Second page:
          .replace(/^Next:.*?\n/gmi, '')                   // Next:
          .replace(/^Finally:.*?\n/gmi, '')                // Finally:
          .replace(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./i, '') // Roman numerals
          .replace(/^(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th):/i, '') // Ordinals
          .replace(/^(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten):/i, '') // Word numbers
          .trim()
      ).filter(p => p.length > 10);
      
      // Level-appropriate content validation and adjustment
      pages = [];
      for (const rawPage of cleanedPages) {
        const sentences = rawPage.match(/[^.!?]*[.!?]+/g) || [rawPage];
        const wordCount = rawPage.split(/\s+/).length;
        
        // Level-appropriate splitting logic
        if (wordCount > currentLevelConfig.max * 1.2) {
          // Split oversized content appropriately for each level
          const targetSentences = normalizedReadingLevel === 'medium' ? 2 : 
                                 normalizedReadingLevel === 'hard' ? 3 : 4;
          
          if (sentences.length > targetSentences) {
            const sentenceChunks = [];
            for (let i = 0; i < sentences.length; i += targetSentences) {
              sentenceChunks.push(sentences.slice(i, i + targetSentences).join(' ').trim());
            }
            pages.push(...sentenceChunks);
          } else {
            pages.push(rawPage);
          }
        } else if (wordCount >= currentLevelConfig.min) {
          pages.push(rawPage);
        }
        // Skip pages that are too short for the level
      }
      
      pages = pages.slice(0, 12);
      
      console.log(`✅ ${normalizedReadingLevel} 3-tier processing complete:`, { 
        level: normalizedReadingLevel,
        pagesFound: pages.length, 
        avgWordCount: pages.length > 0 ? Math.round(pages.reduce((acc, p) => acc + p.split(' ').length, 0) / pages.length) : 0,
        targetRange: `${currentLevelConfig.min}-${currentLevelConfig.max} words`,
        samplesPreview: pages.slice(0, 2).map(p => `${p.split(' ').length} words`)
      });
    }
    
    // Final content validation and enhanced logging
    if (pages.length === 0) {
      console.error('❌ No pages generated from AI response - will trigger fallback');
      throw new Error('AI generated empty content');
    }
    
    // Enhanced success logging with performance metrics
    console.log('🎉 AI Generation SUCCESS - Final Results:', {
      level: normalizedReadingLevel,
      finalPageCount: pages.length,
      avgWordsPerPage: Math.round(pages.reduce((acc, p) => acc + p.split(' ').length, 0) / pages.length),
      totalWords: pages.reduce((acc, p) => acc + p.split(' ').length, 0),
      hairdColorUsed: hairColor ? 'yes' : 'no',
      pagesSample: pages.slice(0, 1).map((p, i) => `Page ${i+1}: ${p.substring(0, 50)}...`),
      processingTier: normalizedReadingLevel === 'beginner' ? 'beginner-3tier' : 'adaptive-3tier'
    });
    
    // Process pages through unified post-processing system
    console.log('🔄 Sending pages to unified post-processor...');
    const { data: processedResult, error: processingError } = await supabase.functions.invoke('process-story-content', {
      body: {
        pages: pages,
        userInfo: {
          name: userName,
          avatar: { type: avatarType },
          favoriteColor: ensureColorName(config?.userInfo?.favoriteColor),
          favoriteAnimal: config?.userInfo?.favoriteAnimal || 'cat',
          favoriteFood: config?.userInfo?.favoriteFood || 'cookies',
          hobbies: config?.userInfo?.hobbies || 'playing outside',
          specialRequest: config?.userInfo?.specialRequest || 'adventure'
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