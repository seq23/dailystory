// Streamlined Story Generation Handler
// Processes pre-processed bundles from frontend services  
// Uses existing prompts from storyPrompts.ts - LEAN & DRY

import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, resolvePromptPlaceholders, type DifficultyLevel, type ExpertGradeLevel } from "../_shared/storyPrompts.ts";

interface StreamlinedBundle {
  storyContent: string;
  userVocabulary: string[];
  systemSettings: {
    gradeLevel: number;
    complianceTarget: number;
  };
}

interface StreamlinedConfig {
  sessionType: 'free' | 'premium';
  pageNumber: number;
  existingStory?: string;
}

// Hair color mapping for English speakers only (moved from main handler)
function getHairColorForSkinTone(skinTone: string | undefined): string | null {
  if (!skinTone) return null;
  
  const hairColorMap: Record<string, string> = {
    'pale': 'red hair',
    'light': 'blonde hair', 
    'medium': 'brown hair',
    'olive': 'black hair',
    'dark': 'dark curly hair'
  };
  
  return hairColorMap[skinTone] || null;
}

export async function handleStreamlinedGeneration(requestBody: any) {
  const { bundle, config }: { bundle: StreamlinedBundle; config: StreamlinedConfig } = requestBody;
  
  console.log('🎯 STREAMLINED: Processing lean bundle');
  
  try {
    // Use existing prompts from storyPrompts.ts
    const difficulty = mapGradeLevelToDifficulty(bundle.systemSettings.gradeLevel);
    const promptConfig = getStoryPrompt(difficulty);
    
    // Extract userInfo from already-resolved bundle
    let userInfo = {};
    try {
      const matches = bundle.storyContent.match(/Character Info: ({.*})/);
      if (matches) {
        userInfo = JSON.parse(matches[1]);
      }
    } catch (e) {
      console.warn('Could not extract userInfo from bundle, using defaults');
    }

    // Bundle already contains resolved natural language - use directly
    const aiPrompt = {
      systemPrompt: promptConfig.systemPrompt,
      userPrompt: bundle.storyContent // Already resolved by 4-tier system
    };
    
    // Generate story with OpenAI
    const storyText = await generateWithOpenAI(aiPrompt, bundle.systemSettings.gradeLevel, userInfo);
    
    // Parse into pages (simplified)
    const pages = parseIntoPages(storyText, bundle.systemSettings.gradeLevel);
    
    // Return streamlined response
    return new Response(JSON.stringify({
      success: true,
      story: storyText,
      pages: pages,
      vocabCompliance: 1.0, // Frontend handles validation
      metadata: {
        processingMode: 'streamlined-lean',
        userVocabularyCount: bundle.userVocabulary.length,
        gradeLevel: bundle.systemSettings.gradeLevel
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ STREAMLINED: Generation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Story generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function mapGradeLevelToDifficulty(gradeLevel: number): DifficultyLevel {
  if (gradeLevel === 0) return 'beginner';
  if (gradeLevel === 1) return 'easy';
  if (gradeLevel === 2) return 'medium';
  if (gradeLevel === 3) return 'hard';
  return 'expert';
}

async function generateWithOpenAI(prompt: { systemPrompt: string; userPrompt: string }, gradeLevel: number, userInfo?: any): Promise<string> {
  const maxTokens = getTokensForGrade(gradeLevel);
  
  // Add hair color mapping for English speakers
  let enhancedUserPrompt = prompt.userPrompt;
  if (userInfo?.avatar?.skinTone && userInfo?.nativeLanguage === 'en') {
    const hairColor = getHairColorForSkinTone(userInfo.avatar.skinTone);
    if (hairColor) {
      enhancedUserPrompt += `\nCharacter appearance: ${userInfo.name} has ${hairColor}.`;
    }
  }
  
  console.log('🤖 STREAMLINED: Calling OpenAI', { gradeLevel, maxTokens });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: enhancedUserPrompt }
      ],
      max_completion_tokens: maxTokens
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const storyText = data.choices[0].message.content;

  if (!storyText?.trim()) {
    throw new Error('Empty story generated');
  }

  return cleanStoryText(storyText);
}

function cleanStoryText(text: string): string {
  return text
    .replace(/\*\*.*?\*\*/g, '') // Remove bold formatting
    .replace(/^(Page|Chapter|\d+\.)\s*[:\-]?\s*/gmi, '') // Remove page markers
    .replace(/\n\n+/g, '\n\n') // Normalize spacing
    .trim();
}

function parseIntoPages(storyText: string, gradeLevel: number): string[] {
  const targetWordsPerPage = gradeLevel === 0 ? 15 : gradeLevel <= 2 ? 30 : 60;
  
  // Simple paragraph-based splitting
  const paragraphs = storyText.split(/\n\n+/).filter(p => p.trim());
  const pages: string[] = [];
  
  let currentPage = '';
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).length;
    
    if (currentWordCount + paragraphWords > targetWordsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = paragraph;
      currentWordCount = paragraphWords;
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph;
      currentWordCount += paragraphWords;
    }
  }
  
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  // Ensure we have at least one page
  return pages.length > 0 ? pages : [storyText];
}

function getTokensForGrade(gradeLevel: number): number {
  const tokenMap: Record<number, number> = {
    0: 400,  // PreK
    1: 600,  // 1st
    2: 800,  // 2nd  
    3: 1000, // 4th
    4: 1200  // 6th+
  };
  return tokenMap[gradeLevel] || 800;
}

// Export for use in main handler
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};