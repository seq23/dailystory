import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Template service now uses dynamic loading only

// Import dynamic template system
import { getTemplate, getTemplateCount, getRawTemplate } from '../_shared/templateImporter.ts';

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
  beginner: { difficulty: 'beginner', maxTokens: 240, wordsPerToken: 0.75, expectedPages: 6, tokensPerPage: 40 },
  easy: { difficulty: 'easy', maxTokens: 300, wordsPerToken: 0.75, expectedPages: 6, tokensPerPage: 50 },
  medium: { difficulty: 'medium', maxTokens: 400, wordsPerToken: 0.75, expectedPages: 8, tokensPerPage: 50 },
  hard: { difficulty: 'hard', maxTokens: 1070, wordsPerToken: 0.75, expectedPages: 10, tokensPerPage: 107 },
  expert: { difficulty: 'expert', maxTokens: 1596, wordsPerToken: 0.75, expectedPages: 12, tokensPerPage: 133 },
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
      'beginner': 'level0',
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

    const templateLevel = levelMap[effectiveDifficulty] || 'level0';

      // Handle exploration requests
    if (explore) {
      console.log('🔍 Exploration mode for level:', templateLevel);
      console.log(`📊 Getting template count for ${templateLevel}`);
      
      const templateCount = await getTemplateCount(templateLevel);
      console.log(`✅ Found ${templateCount} templates for ${templateLevel}`);
      
      // Helper function to extract Level 0 template titles from comments
      const extractLevel0Title = (templateIndex: number): string => {
        // Level 0 template titles based on comment structure in level0.js
        const titles = [
          "Morning Routine", "Bedtime Story", "Meal Time", "Getting Dressed", "Cleaning Up",
          "Playground Fun", "Library Visit", "Art Time", "Music Time", "Helping Mom",
          "Walking the Dog", "Grocery Store", "Cooking Together", "Bath Time", "Story Time",
          "Garden Work", "Car Ride", "Park Visit", "Friend Visit", "TV Time",
          "Doctor Visit", "Dental Checkup", "Getting a Shot", "Taking Medicine", "Hospital Visit",
          "Feeling Better", "Hand Washing", "Exercise Time", "Check-up Day", "Healthy Food",
          "ABC Learning", "Counting Fun", "Color Names", "Shape Game", "Size Learning",
          "Weather Talk", "Days of Week", "Month Names", "Number Practice", "Letter Sounds",
          "Reading Time", "Writing Practice", "School Day", "Teacher Help", "Learning Colors",
          "Hide and Seek", "Tag Game", "Ball Play", "Swing Time", "Slide Fun",
          "Sandbox Play", "Bike Ride", "Running Fast", "Jump Rope", "Dance Time",
          "Toy Sharing", "Building Blocks", "Puzzle Time", "Game Playing", "Fun Together",
          "Helper Day", "Store Visit", "Post Office", "Fire Station", "Police Visit",
          "Community Walk", "Neighbor Hello", "Park Clean", "Helping Others", "Being Kind",
          "Bus Ride", "Car Trip", "Train Ride", "Airplane Fun", "Boat Ride",
          "Walking Trip", "Scooter Ride", "Bike Path",
          "Birthday Party", "Holiday Fun", "Gift Giving", "Celebration Time", "Family Day",
          "Special Meal", "Dress Up", "Party Games", "Cake Time", "Happy Day", "Thank You Day",
          "Pet Care", "Bird Watching", "Bug Hunt", "Tree Climbing", "Flower Picking",
          "Beach Day", "Mountain Trip", "River Play", "Forest Walk", "Animal Friends"
        ];
        return titles[templateIndex] || `Template ${templateIndex + 1}`;
      };

      // Get actual template details for better exploration
      let templateDetails = [];
      try {
        // For Level 0, load ALL 100 templates to show complete dropdown
        const templatesToLoad = templateLevel === 'level0' ? templateCount : Math.min(templateCount, 5);
        
        console.log(`🔄 Loading ${templatesToLoad} templates for exploration`);
        
        for (let i = 0; i < templatesToLoad; i++) {
          const rawTemplate = await getRawTemplate(templateLevel, i);
          if (rawTemplate) {
            // Handle Level 0 templates (string arrays) vs structured templates
            if (Array.isArray(rawTemplate)) {
              templateDetails.push({
                title: extractLevel0Title(i),
                theme: i < 20 ? "Daily Life" : 
                       i < 30 ? "Healthcare" : 
                       i < 45 ? "Educational" : 
                       i < 60 ? "Play & Recreation" : 
                       i < 70 ? "Community" : 
                       i < 78 ? "Transportation" : 
                       i < 91 ? "Special Occasions" : "Nature & Animals",
                scenes: 6, // Level 0 templates always show 6 pages per template
                endings: 1 // Level 0 templates have implicit endings
              });
            } else {
              // Structured template with proper metadata
              templateDetails.push({
                title: rawTemplate.title || `Template ${i + 1}`,
                theme: rawTemplate.theme || "Adventure",
                scenes: rawTemplate.scenes?.length || 0,
                endings: rawTemplate.endings?.length || 0
              });
            }
          }
        }
      } catch (error) {
        console.log('Could not load template details, using defaults');
        templateDetails = [{
          title: "Template Available",
          theme: "Various Themes",
          scenes: 5,
          endings: 2
        }];
      }
      
      return new Response(JSON.stringify({
        success: true,
        level: templateLevel,
        templateCount: templateCount,
        templates: templateDetails
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get template from unified dynamic system
    console.log('📚 Getting template for level:', templateLevel);
    
    let pages: string[] | null = null;
    
    try {
      if (mode === 'testing') {
        console.log('🔄 Loading template using unified dynamic system for:', templateLevel);
      }
      
      // Use unified dynamic template system for ALL levels including Level0
      pages = await getTemplate(templateLevel, templateIndex, userInfo || {}, dynamicPageCount, mode);
      
      if (pages) {
        const pageCount = Array.isArray(pages) ? pages.length : pages.pages?.length || 0;
        
        if (mode === 'testing') {
          console.log('✅ Template loaded with', pageCount, 'pages');
        }
        
        // Apply additional processing for level0 templates (placeholder resolution only)
        if (templateLevel === 'level0' && Array.isArray(pages)) {
          pages = processStoryTemplate(pages, userInfo || {}, dynamicPageCount);
        }
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

    // Handle both simple pages array and enhanced testing data
    const isTestingResult = pages && !Array.isArray(pages) && typeof pages === 'object' && 'pages' in pages && 'testingData' in pages;
    const actualPages = isTestingResult ? pages.pages : pages;
    const testingData = isTestingResult ? pages.testingData : null;

    // Debug logging
    if (mode === 'testing') {
      console.log('🔍 Detection Result:', {
        isTestingResult,
        hasPages: !!(pages && Array.isArray(pages)),
        hasTestingData: !!(testingData),
        pageCount: actualPages?.length || 0,
        dataStructure: isTestingResult ? 'Enhanced Object' : 'Simple Array'
      });
    }

    if (!actualPages || actualPages.length === 0) {
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

    // Log differently based on mode
    if (mode === 'testing') {
      console.log('📖 Story generated successfully with', actualPages.length, 'pages');
      console.log('📊 Testing Data Available:', !!testingData);
    } else {
      console.log('📖 Converted to', actualPages.length, 'pages');
    }
    
    // Build response structure
    const responseData = {
      success: true,
      pages: actualPages,
      level: templateLevel,
      pageCount: actualPages.length,
      expectedPages: dynamicPageCount,
      metadata: {
        sourceSystem: 'Unified Dynamic Templates',
        templateLevel,
        mode: mode,
        targetWordDensity: 'Template-optimized'
      },
      ...(testingData && { testingData })
    };
    
    // Diagnostic logging only in testing mode
    if (mode === 'testing') {
      console.log('🔍 DIAGNOSTIC: Final response structure:', JSON.stringify(responseData, null, 2));
    }

    return new Response(JSON.stringify(responseData), {
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