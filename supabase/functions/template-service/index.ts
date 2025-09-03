import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Import nuclear template system for maximum reliability
import { nuclearLoadTemplate, initializeNuclearSystem, getSystemHealth, getNuclearEmergencyContent } from '../_shared/nuclearTemplateSystem.ts';
import { initializeNuclearSessionSystem } from '../_shared/nuclearSessionManager.ts';

// Import arc-aware template processing system
import { processArcAwarePage, batchProcessArcAwarePages, clearArcSession } from '../_shared/arcAwareTemplateProcessor.ts';
import { getTemplateCount, getRawTemplate } from '../_shared/templateImporter.ts';
import { clearTemplateCache } from '../_shared/dynamicTemplateLoader.js';
import { getBValue } from '../_shared/templates/registry.js';
import { getBValueForLevel, type ValidationLevel } from '../_shared/validation-utils.ts';

// Import sophisticated placeholder resolution  
import { resolveAllPlaceholders, MicroContext, UserInfo, FALLBACK_POOLS, pick } from '../_shared/placeholderResolver.ts';

// Token limit configurations for dynamic page counts
interface TokenLimitConfig {
  difficulty: string;
  expectedPages: number;
  tokensPerPage: number;
}

// BULLETPROOF HARDCODED FALLBACK - NEVER CHANGE - TEMPLATE SERVICE EMERGENCY SYSTEM
// This must remain independent of AI generation to serve as reliable fallback
const TOKEN_LIMITS: Record<string, TokenLimitConfig> = {
  beginner: { difficulty: 'beginner', expectedPages: 12, tokensPerPage: 15 },
  easy: { difficulty: 'easy', expectedPages: 12, tokensPerPage: 32 },
  medium: { difficulty: 'medium', expectedPages: 12, tokensPerPage: 150 },
  hard: { difficulty: 'hard', expectedPages: 12, tokensPerPage: 200 },
  expert: { difficulty: 'expert', expectedPages: 16, tokensPerPage: 500 },
  grade6: { difficulty: 'grade6', expectedPages: 16, tokensPerPage: 500 },
  grade7: { difficulty: 'grade7', expectedPages: 16, tokensPerPage: 500 },
  grade8: { difficulty: 'grade8', expectedPages: 16, tokensPerPage: 500 },
  grade9: { difficulty: 'grade9', expectedPages: 16, tokensPerPage: 500 },
  grade10: { difficulty: 'grade10', expectedPages: 16, tokensPerPage: 500 }
};

// Get expected page count for difficulty level - BULLETPROOF FALLBACK
function getExpectedPageCountForDifficulty(difficulty: string): number {
  return TOKEN_LIMITS[difficulty]?.expectedPages || 12;
}

// Generate fallback seed data for Level 0 templates when user data is missing
function generateFallbackSeed(userInfo: UserInfo): Record<string, any> {
  const seed: Record<string, any> = {};
  
  // Level 0 templates only use these micro-placeholders: {friend} and {object}
  // Canonical placeholders ({userName}, {favoriteColor}, etc.) are handled by resolveCanonicalPlaceholders()
  seed.friend = pick(FALLBACK_POOLS.friend);
  seed.object = pick(FALLBACK_POOLS.object);
  
  return seed;
}

function processStoryTemplate(template: string[], userInfo: UserInfo, pageCount: number = 5): string[] {
  const pages: string[] = [];

  // Process each page in the template
  const pagesToUse = template.slice(0, Math.min(pageCount, template.length));
  
  // Generate fallback seed data for Level 0 templates
  const seed = generateFallbackSeed(userInfo);
  
  for (const page of pagesToUse) {
    let processedPage = page;
    
    // Apply sophisticated placeholder resolution with generated seed data
    const microContext: MicroContext = {
      userInfo: userInfo,
      pageText: processedPage,
      seed: seed  // Now Level 0 has seed data for micro-placeholders
    };
    processedPage = resolveAllPlaceholders(processedPage, microContext);
    
    pages.push(processedPage);
  }

  return pages;
}

// Module-level initialization flag
let systemsInitialized = false;

serve(async (req) => {
  // Initialize nuclear systems on first request
  if (!systemsInitialized) {
    await initializeNuclearSystem();
    initializeNuclearSessionSystem();
    systemsInitialized = true;
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      difficulty, 
      userInfo, 
      pageCount, 
      templateIndex, 
      explore = false, 
      mode = 'testing',
      // New arc-aware parameters
      pageIndex,
      sessionId,
      isNeverEnding = false
    } = await req.json();
    
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
      mode,
      // Arc-aware logging
      pageIndex,
      sessionId,
      isNeverEnding
    });
    
    // Log Hard/Expert level targets
    if (effectiveDifficulty === 'hard' || effectiveDifficulty === 'expert') {
      const targetWords = effectiveDifficulty === 'hard' ? 80 : 100;
      console.log(`🎯 HARD/EXPERT TARGET: ${targetWords}+ words per page for ${dynamicPageCount} pages`);
    }

    // Difficulty mapping (Level 0 restored but excluded from arc processing)
    const levelMap: Record<string, string> = {
      'beginner': 'level0', // Restored to level0
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

    const templateLevel = levelMap[effectiveDifficulty] || 'level1';

      // Handle exploration requests
    if (explore) {
      // Clear template cache to ensure fresh data for exploration
      console.log('🧹 Clearing template cache for fresh exploration data');
      clearTemplateCache();
      
      console.log('🔍 Exploration mode for level:', templateLevel);
      console.log(`📊 Getting template count for ${templateLevel}`);
      
      const templateCount = await getTemplateCount(templateLevel);
      console.log(`✅ Found ${templateCount} templates for ${templateLevel}`);
      
      // Get actual template details for better exploration (Level 0 removed)
      let templateDetails = [];
      try {
        const templatesToLoad = Math.min(templateCount, 5);
        
        console.log(`🔄 Loading ${templatesToLoad} templates for exploration`);
        
        for (let i = 0; i < templatesToLoad; i++) {
          const rawTemplate = await getRawTemplate(templateLevel, i);
          if (rawTemplate) {
            // All templates are now structured templates (Level 0 removed)
            const sceneCount = rawTemplate.scenes?.length || 0;
            console.log(`📊 Template ${i}: "${rawTemplate.title}" has ${sceneCount} scenes`);
            templateDetails.push({
              title: rawTemplate.title || `Template ${i + 1}`,
              theme: rawTemplate.theme || "Adventure",
              scenes: sceneCount,
              endings: rawTemplate.endings?.length || 0
            });
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

    // Arc-aware processing for never-ending stories (EXCLUDES Level 0)
    if (isNeverEnding && pageIndex !== undefined && sessionId && templateLevel !== 'level0') {
      console.log(`🎪 Processing never-ending story: page ${pageIndex}, session ${sessionId}`);
      
      try {
        const result = await processArcAwarePage(
          pageIndex,
          userInfo || {},
          templateLevel,
          sessionId,
          mode
        );
        
        // Build arc-aware response
        const responseData = {
          success: true,
          pages: result.pages,
          level: templateLevel,
          pageCount: result.pages.length,
          metadata: {
            sourceSystem: 'Arc-Aware Dynamic Templates',
            templateLevel,
            mode,
            arcProcessing: true,
            ...result.metadata
          },
          ...(result.arcTransition && { arcTransition: result.arcTransition }),
          ...(result.sessionState && { sessionState: result.sessionState })
        };
        
        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (arcError) {
        console.error('❌ Arc-aware processing failed:', arcError);
        // Fall through to standard processing
      }
    }
    
    // Batch processing for testing mode with arc awareness (EXCLUDES Level 0)
    if (mode === 'testing' && pageIndex !== undefined && dynamicPageCount > 1 && templateLevel !== 'level0') {
      console.log(`🎪 Batch arc processing: ${dynamicPageCount} pages from ${pageIndex}`);
      
      try {
        const batchSessionId = sessionId || `test-${Date.now()}`;
        const result = await batchProcessArcAwarePages(
          pageIndex,
          dynamicPageCount,
          userInfo || {},
          templateLevel,
          batchSessionId,
          mode
        );
        
        const responseData = {
          success: true,
          pages: result.pages,
          level: templateLevel,
          pageCount: result.pages.length,
          metadata: {
            sourceSystem: 'Arc-Aware Batch Processing',
            templateLevel,
            mode,
            batchProcessing: true,
            ...result.metadata
          },
          ...(result.sessionState && { sessionState: result.sessionState })
        };
        
        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (batchError) {
        console.error('❌ Batch arc processing failed:', batchError);
        // Fall through to standard processing
      }
    }
    
    // Smart template selection for special requests
    let selectedTemplateIndex = templateIndex; // Use provided index if available
    
    // Try smart selection if special request exists and no index provided
    if (!selectedTemplateIndex && userInfo?.specialRequest) {
      try {
        console.log('🧠 Attempting smart template selection...');
        
        // Import smart template selector
        const { selectWithTimeout } = await import('../_shared/smartTemplateSelector.js');
        
        // Get template count for this level
        const templateCount = await getTemplateCount(templateLevel);
        
        if (templateCount > 0) {
          // Try smart selection with timeout protection
          const smartIndex = await selectWithTimeout(
            userInfo.specialRequest,
            templateLevel,
            templateCount,
            100 // 100ms timeout
          );
          
          if (smartIndex !== null && smartIndex >= 0) {
            selectedTemplateIndex = smartIndex;
            console.log(`🎯 Smart selection successful: Using template ${smartIndex}`);
          } else {
            console.log('📍 Smart selection found no strong matches, using random');
          }
        }
      } catch (smartError) {
        console.warn('⚠️ Smart template selection failed, using random fallback:', smartError.message);
        // selectedTemplateIndex remains unchanged (null or provided value)
      }
    }
    
    if (!selectedTemplateIndex) {
      // Random fallback selection
      const templateCount = await getTemplateCount(templateLevel);
      selectedTemplateIndex = Math.floor(Math.random() * (templateCount || 1));
    }
    
    // Fallback chain: Smart → Index → Random
    const finalTemplateIndex = selectedTemplateIndex ?? Math.floor(Math.random() * (await getTemplateCount(templateLevel) || 1));
    
    let pages: string[] | null = null;
    
    try {
      if (mode === 'testing') {
        console.log('🔄 Loading template using unified dynamic system for:', templateLevel);
        console.log(`📍 Template index: ${finalTemplateIndex} (${selectedTemplateIndex !== null ? 'smart/provided' : 'random'})`);
      }
      
      // Use nuclear template loading system for maximum reliability
      const rawTemplate = await nuclearLoadTemplate(templateLevel, finalTemplateIndex);
      
      if (rawTemplate) {
        // Process template with nuclear fallbacks
        if (Array.isArray(rawTemplate)) {
          // Level 0 templates - already string arrays
          pages = rawTemplate.slice(0, Math.min(dynamicPageCount, rawTemplate.length));
        } else {
          // Structured templates - use template converter
          const { getTemplate } = await import('../_shared/templateImporter.ts');
          pages = await getTemplate(templateLevel, finalTemplateIndex, userInfo || {}, dynamicPageCount, mode);
        }
      }
      
      if (pages) {
        const pageCount = Array.isArray(pages) ? pages.length : pages.pages?.length || 0;
        
        if (mode === 'testing') {
          console.log('✅ Template loaded with', pageCount, 'pages');
        }
        
        // Level 0 processing removed - all templates now use structured processing
      }
    } catch (dynamicError) {
      console.error('❌ Nuclear template loading failed:', dynamicError);
      
      // Nuclear fallback - never fail completely
      console.log('🚨 NUCLEAR FALLBACK: Using emergency content');
      
      // Use nuclear system's emergency content (single source of truth)
      const emergencyPages = getNuclearEmergencyContent(templateLevel);
      pages = emergencyPages.slice(0, dynamicPageCount);
      console.log('✅ Nuclear fallback content provided');
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

    // Nuclear guarantee - never return empty pages
    if (!actualPages || actualPages.length === 0) {
      console.log('🚨 NUCLEAR GUARANTEE: Providing absolute fallback content');
      
      const absoluteFallback = [
        "Here is your story.",
        "It begins with wonder.",
        "Adventure follows next.",
        "Excitement builds up.",
        "Joy fills the ending."
      ];
      
      actualPages = absoluteFallback.slice(0, dynamicPageCount);
      console.log('✅ Nuclear guarantee fulfilled with absolute fallback');
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
        targetWordDensity: 'Template-optimized',
        templateIndex: finalTemplateIndex,
        smartSelection: selectedTemplateIndex !== null,
        fallbackUsed: selectedTemplateIndex === null,
        arcAware: templateLevel !== 'level0',
        bValue: templateLevel !== 'level0' ? getBValueForLevel(templateLevel as ValidationLevel) : 0,
        nuclearSystemHealth: getSystemHealth()
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