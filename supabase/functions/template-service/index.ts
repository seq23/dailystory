import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Import the single source of truth for templates
import { TemplateLibraryService } from '../_shared/TemplateLibraryService.js';

// Import dynamic template system
import { getTemplate, getTemplateCount } from '../_shared/templateImporter.ts';

// Import sophisticated placeholder resolution and grammar validation
import { resolveAllPlaceholders, MicroContext, UserInfo } from '../_shared/placeholderResolver.ts';
import { validateAndEnhanceGrammar } from '../_shared/grammarValidator.ts';

// Token limit configurations for dynamic page counts
interface TokenLimitConfig {
  difficulty: string;
  maxTokens: number;
  wordsPerToken: number;
  expectedPages?: number;
  tokensPerPage?: number;
}

const TOKEN_LIMITS: Record<string, TokenLimitConfig> = {
  beginner: { difficulty: 'beginner', maxTokens: 200, wordsPerToken: 0.75, expectedPages: 5, tokensPerPage: 40 },
  easy: { difficulty: 'easy', maxTokens: 300, wordsPerToken: 0.75, expectedPages: 6, tokensPerPage: 50 },
  medium: { difficulty: 'medium', maxTokens: 400, wordsPerToken: 0.75, expectedPages: 8, tokensPerPage: 50 },
  hard: { difficulty: 'hard', maxTokens: 600, wordsPerToken: 0.75, expectedPages: 10, tokensPerPage: 60 },
  expert: { difficulty: 'expert', maxTokens: 800, wordsPerToken: 0.75, expectedPages: 12, tokensPerPage: 65 },
  grade6: { difficulty: 'grade6', maxTokens: 1200, wordsPerToken: 0.75, expectedPages: 12, tokensPerPage: 100 },
  grade7: { difficulty: 'grade7', maxTokens: 1470, wordsPerToken: 0.75, expectedPages: 13, tokensPerPage: 113 },
  grade8: { difficulty: 'grade8', maxTokens: 1600, wordsPerToken: 0.75, expectedPages: 14, tokensPerPage: 114 },
  grade9: { difficulty: 'grade9', maxTokens: 1730, wordsPerToken: 0.75, expectedPages: 15, tokensPerPage: 115 },
  grade10: { difficulty: 'grade10', maxTokens: 1870, wordsPerToken: 0.75, expectedPages: 16, tokensPerPage: 117 }
};

// Get expected page count for difficulty level
function getExpectedPageCountForDifficulty(difficulty: string): number {
  return TOKEN_LIMITS[difficulty]?.expectedPages || 5;
}

function processStoryTemplate(template: string[], userInfo: UserInfo, pageCount: number = 5): string[] {
  const pages: string[] = [];

  // Process each page in the template
  const pagesToUse = template.slice(0, Math.min(pageCount, template.length));
  
  for (const page of pagesToUse) {
    let processedPage = page;
    
    // Apply sophisticated placeholder resolution
    const microContext: MicroContext = {
      userInfo: userInfo,
      pageText: processedPage
    };
    processedPage = resolveAllPlaceholders(processedPage, microContext);
    
    // Apply sophisticated grammar validation
    processedPage = validateAndEnhanceGrammar(processedPage, "they");
    
    pages.push(processedPage);
  }

  return pages;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, userInfo, pageCount, templateIndex, explore = false, mode = 'testing' } = await req.json();
    
    // Handle difficulty parameter
    const effectiveDifficulty = difficulty || userInfo?.difficultyLevel;
    
    // Dynamic page count calculation (Phase 1)
    const dynamicPageCount = pageCount || getExpectedPageCountForDifficulty(effectiveDifficulty);
    
    console.log('🎯 Template service request:', { 
      difficulty: effectiveDifficulty, 
      pageCount: dynamicPageCount, 
      templateIndex, 
      userInfo: userInfo ? 'provided' : 'missing', 
      explore,
      mode
    });

    // Difficulty mapping
    const levelMap: Record<string, string> = {
      'beginner': 'Level0',
      'easy': 'level1',
      'medium': 'level2',
      'hard': 'level3',
      'expert': 'level4',
      'grade6': 'grade6',
      'grade7': 'grade7',
      'grade8': 'grade8',
      'grade9': 'grade9',
      'grade10': 'grade10'
    };

    const templateLevel = levelMap[effectiveDifficulty] || 'Level0';

    // Handle exploration requests
    if (explore) {
      console.log('🔍 Exploration mode for level:', templateLevel);
      
      let templateCount: number;
      
      if (templateLevel === 'Level0') {
        templateCount = TemplateLibraryService.getTemplateCount(templateLevel);
      } else {
        // Use dynamic template count for non-Level0
        templateCount = await getTemplateCount(templateLevel);
      }
      
      return new Response(JSON.stringify({
        success: true,
        level: templateLevel,
        templateCount,
        templates: [{
          title: `${templateLevel} Templates`,
          theme: "Various themes available",
          scenes: templateCount,
          endings: 1
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get template from appropriate source
    console.log('📚 Getting template for level:', templateLevel);
    
    let pages: string[] | null = null;
    
    if (templateLevel === 'Level0') {
      // Use static Level 0 templates
      const template = TemplateLibraryService.getLevel0Template(templateIndex);
      if (template) {
        console.log('✅ Level0 template found with', template.length, 'pages');
        // Process with legacy placeholder system for Level0 (maintain original word density)
        pages = processStoryTemplate(template, userInfo || {}, dynamicPageCount);
      }
    } else {
      // Use dynamic import system for Level1+
      try {
        console.log('🔄 Loading dynamic template for:', templateLevel);
        pages = await getTemplate(templateLevel, templateIndex, userInfo || {}, dynamicPageCount, mode);
        
        if (pages) {
          console.log('✅ Dynamic template converted to', pages.length, 'pages');
        }
      } catch (dynamicError) {
        console.error('❌ Dynamic template import failed:', dynamicError);
        
        // Return structured error for dynamic import failure
        return new Response(JSON.stringify({
          error: 'Template system temporarily unavailable',
          level: templateLevel,
          canRetry: true,
          suggestion: 'Please try again in a moment, or try a different difficulty level'
        }), {
          status: 503, // Service Temporarily Unavailable
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!pages || pages.length === 0) {
      console.log('❌ No pages generated for level:', templateLevel);
      return new Response(JSON.stringify({
        error: 'No templates available for this difficulty level',
        level: templateLevel,
        canRetry: false,
        suggestion: 'Try a different difficulty level or check back later'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📖 Story generated successfully with', pages.length, 'pages');

    return new Response(JSON.stringify({
      success: true,
      pages: pages,
      level: templateLevel,
      pageCount: pages.length,
      expectedPages: dynamicPageCount,
      metadata: {
        sourceSystem: templateLevel === 'Level0' ? 'Static Templates' : 'Dynamic Templates',
        templateLevel,
        selectedTemplate: templateIndex,
        mode: mode,
        targetWordDensity: templateLevel === 'Level0' ? 'AI-matched' : 'Template-optimized'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Template service error:', error);

    // Emergency fallback
    const emergencyStory = [
      "Once upon a time, there was a curious child.",
      "They loved to explore and discover new things.",
      "Every day brought a new adventure.",
      "They learned something amazing.",
      "And they lived happily ever after."
    ];

    return new Response(JSON.stringify({
      success: true,
      pages: emergencyStory, // Changed from 'story' to 'pages' for consistency
      level: 'emergency',
      pageCount: emergencyStory.length,
      note: 'Emergency fallback story used due to system error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});