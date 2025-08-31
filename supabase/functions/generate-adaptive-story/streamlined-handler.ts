// Streamlined Story Generation Handler
// Processes pre-processed bundles from frontend services  
// Uses existing prompts from storyPrompts.ts - LEAN & DRY

import { getStoryPrompt, getExpertStoryPrompt, formatUserPrompt, resolvePromptPlaceholders, getExpectedPages, getPerPageTokenLimit, mapGradeToExpertLevel, type DifficultyLevel, type ExpertGradeLevel } from "../_shared/storyPrompts.ts";

// CORS headers - moved to top to fix ReferenceError
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamlinedBundle {
  storyContent: string;
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
    // Use existing prompts from storyPrompts.ts - handle expert grades (6-10) separately
    const expertGrade = mapGradeToExpertLevel(bundle.systemSettings.gradeLevel);
    const promptConfig = expertGrade 
      ? getExpertStoryPrompt(expertGrade)
      : getStoryPrompt(mapGradeLevelToDifficulty(bundle.systemSettings.gradeLevel));
    
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

  // Enhanced AI Generation with 2-Attempt Quality-First Model Progression
  let storyText = '';
  let attempt = 1;
  const maxAttempts = 2;
  const startTime = Date.now();

  // Model progression for quality optimization
  const modelProgression = [
    { model: 'gpt-4.1-2025-04-14', description: 'enhanced quality', paramName: 'max_completion_tokens' }, 
    { model: 'gpt-5-mini-2025-08-07', description: 'fast & reliable', paramName: 'max_completion_tokens' }
  ];

  // Apply to BOTH attempts
  const baseInstructions = `
CRITICAL SUCCESS REQUIREMENTS:
- Generate a reliable engaging narrative suitable for children
- Include natural continuation hooks and smooth story flow  
- If target vocabulary provided, incorporate naturally throughout
- Never include page numbers, titles, or formatting markers
- This is a never-ending story - always continue, never conclude
`;

  while (attempt <= maxAttempts && !storyText) {
    try {
      const currentModel = modelProgression[attempt - 1];
      console.log(`🤖 AI Attempt ${attempt}/${maxAttempts} using ${currentModel.model} (${currentModel.description}):`, { 
        gradeLevel,
        tokenBudget: maxTokens,
        qualityFirst: attempt === 1,
        hasTargetVocabulary: enhancedUserPrompt.includes('Priority vocabulary')
      });
      
      // Attempt 1: Base prompt + complete instructions
      // Attempt 2: Same complete instructions + reliability emphasis
      let enhancedSystemPrompt = prompt.systemPrompt + baseInstructions;
      let finalUserPrompt = enhancedUserPrompt;
      
      if (attempt === 2) {
        enhancedSystemPrompt += `\n\nRELIABILITY EMPHASIS: This is the final attempt before template fallback - prioritize completion and reliability. Generate any engaging story content that meets the requirements above. Focus on natural story flow and ensure all target vocabulary is included if specified.`;
        finalUserPrompt += ` Create any engaging story with natural flow and clear narrative structure for this final attempt. Include all target vocabulary naturally.`;
      }
      
      // API call with correct model parameters
      const apiBody: any = {
        model: currentModel.model,
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: finalUserPrompt }
        ]
      };
      
      // Use correct parameter based on model
      apiBody[currentModel.paramName] = maxTokens;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      storyText = data.choices[0].message.content;
      
      if (storyText && storyText.trim()) {
        const vocabularyUsage = extractVocabularyUsage(storyText, enhancedUserPrompt);
        console.log(`✅ SUCCESS with ${currentModel.model}:`, { 
          attempt,
          contentLength: storyText.length,
          model: currentModel.model,
          processingTime: `${Date.now() - startTime}ms`,
          vocabularyTracking: vocabularyUsage
        });
        
        // Track vocabulary encounters if user is authenticated
        if (vocabularyUsage.hasTargetVocabulary && vocabularyUsage.usedWords.length > 0) {
          console.log(`📚 Vocabulary tracking: ${vocabularyUsage.usedWords.length} words used`);
        }
        
        break;
      } else {
        console.log(`❌ ${currentModel.model} produced empty content, trying next model...`);
        storyText = '';
      }
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} with ${modelProgression[attempt - 1].model} failed:`, error);
      storyText = '';
    }
    
    attempt++;
  }

  if (!storyText?.trim()) {
    throw new Error('All AI generation attempts failed');
  }

  return cleanStoryText(storyText);
}

// Helper function for vocabulary tracking
function extractVocabularyUsage(storyText: string, userPrompt: string): any {
  const vocabMatch = userPrompt.match(/Priority vocabulary to include: ([^\n]+)/);
  if (!vocabMatch) return { hasTargetVocabulary: false };
  
  const targetWords = vocabMatch[1].split(', ').filter(word => word.trim());
  const usedWords = targetWords.filter(word => 
    storyText.toLowerCase().includes(word.toLowerCase())
  );
  
  return {
    hasTargetVocabulary: true,
    targetWords,
    usedWords,
    usageRate: `${usedWords.length}/${targetWords.length}`,
    missingWords: targetWords.filter(word => !usedWords.includes(word))
  };
}

function cleanStoryText(text: string): string {
  return text
    .replace(/\*\*.*?\*\*/g, '') // Remove bold formatting
    .replace(/^(Page|Chapter|\d+\.)\s*[:\-]?\s*/gmi, '') // Remove page markers
    .replace(/\n\n+/g, '\n\n') // Normalize spacing
    .trim();
}

function cleanPageBreakMarkers(text: string): string {
  return text.replace(/\s*\*\*\*\s*/g, '').trim();
}

/**
 * Get correct word count range per page based on grade level
 */
function getWordsPerPageRange(gradeLevel: number): { min: number; max: number; target: number } {
  if (gradeLevel === 0) {
    return { min: 15, max: 24, target: 20 }; // Beginner
  } else if (gradeLevel === 1) {
    return { min: 50, max: 70, target: 60 }; // Easy  
  } else if (gradeLevel === 2) {
    return { min: 80, max: 120, target: 100 }; // Medium
  } else if (gradeLevel >= 3 && gradeLevel <= 5) {
    return { min: 120, max: 200, target: 160 }; // Hard
  } else {
    return { min: 200, max: 400, target: 300 }; // Expert (6th-10th grade)
  }
}

function parseIntoPages(storyText: string, gradeLevel: number): string[] {
  const expertGrade = mapGradeToExpertLevel(gradeLevel);
  const level = expertGrade || mapGradeLevelToDifficulty(gradeLevel);
  const expectedPages = getExpectedPages(level);
  
  // First try to split by ' *** ' markers
  if (storyText.includes(' *** ')) {
    const pages = storyText
      .split(' *** ')
      .map(page => cleanPageBreakMarkers(page))
      .filter(page => page.trim().length > 0)
      .slice(0, expectedPages);
    
    if (pages.length > 0) {
      return pages;
    }
  }
  
  // Fallback to existing word-count logic if no markers found
  // For beginner and easy levels, use sentence-based parsing
  if (gradeLevel === 0 || gradeLevel === 1) {
    const sentences = storyText
      .split(/\n\n+|\.\s*\n|\.\s*$/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s.endsWith('.') ? s : s + '.');
    
    return sentences.slice(0, expectedPages);
  }
  
  // For medium, hard, and expert levels, use proper word-count approach
  const wordRange = getWordsPerPageRange(gradeLevel);
  const targetWordsPerPage = wordRange.target;
  
  // Split by paragraphs and process
  const paragraphs = storyText.split(/\n\n+/).filter(p => p.trim());
  const pages: string[] = [];
  
  let currentPage = '';
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).length;
    
    // If adding this paragraph would exceed target AND we have content, start new page
    if (currentWordCount + paragraphWords > targetWordsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = paragraph;
      currentWordCount = paragraphWords;
      
      // Stop if we've reached expected pages
      if (pages.length >= expectedPages) {
        break;
      }
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph;
      currentWordCount += paragraphWords;
    }
  }
  
  // Add the last page if we have content and haven't exceeded expected pages
  if (currentPage.trim() && pages.length < expectedPages) {
    pages.push(currentPage.trim());
  }
  
  // Always limit to expected pages and ensure we have at least one page
  const limitedPages = pages.slice(0, expectedPages);
  return limitedPages.length > 0 ? limitedPages : [storyText];
}

function getTokensForGrade(gradeLevel: number): number {
  // Use system prompts as single source of truth for token limits
  const expertGrade = mapGradeToExpertLevel(gradeLevel);
  const difficulty = expertGrade || mapGradeLevelToDifficulty(gradeLevel);
  
  const perPageTokens = getPerPageTokenLimit(difficulty);
  const expectedPages = getExpectedPages(difficulty);
  const totalTokens = perPageTokens * expectedPages;
  
  console.log(`🎯 Token calculation for grade ${gradeLevel}: ${perPageTokens} tokens/page × ${expectedPages} pages = ${totalTokens} total tokens`);
  
  return totalTokens;
}
