import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import the sophisticated template system components
import { resolveAllPlaceholders, type MicroContext, type UserInfo } from "../_shared/placeholderResolver.js";
import { safeValidateAndEnhanceGrammar } from "../_shared/enhancedPlaceholderValidator.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  pages: string[];
  userInfo: UserInfo;
  sessionId?: string;
}

interface ProcessResponse {
  success: boolean;
  processedPages: string[];
  processingMetadata: {
    placeholdersResolved: number;
    grammarEnhanced: boolean;
    grammarEnhancementErrors: number;
    grammarFailureReasons?: string[];
    source: 'unified-processor';
  };
  error?: string;
}

// Use shared pronoun derivation from placeholderResolver
import { derivePronoun } from '../_shared/placeholderResolver.js';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pages, userInfo, sessionId }: ProcessRequest = await req.json();
    
    console.log('🔄 Starting unified story content processing...', {
      pageCount: pages.length,
      userName: userInfo?.name,
      sessionId: sessionId?.substring(0, 8)
    });
    
    // FLICKER DETECTION: Log original content
    console.log('📚 [FLICKER-CHECK] Original story pages received:', {
      pageCount: pages.length,
      firstPageOriginal: pages[0]?.substring(0, 50) + '...',
      totalLength: pages.join(' ').length
    });

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      throw new Error('Invalid pages array provided');
    }

    const processedPages: string[] = [];
    let totalPlaceholdersResolved = 0;
    let grammarEnhancementSuccesses = 0;
    const grammarFailureReasons: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`📝 Processing page ${i + 1}/${pages.length}...`);
      
      // Step 1: Resolve all placeholders using sophisticated template system
      const placeholderContext: MicroContext = {
        userInfo,
        pageText: page,
        seed: {} // Could be populated with extracted context in future
      };
      
      const placeholderResolved = resolveAllPlaceholders(page, placeholderContext);
      console.log(`✅ Placeholders resolved for page ${i + 1}: ${placeholderResolved.substring(0, 50)}...`);
      
      // Count resolved placeholders (simple heuristic)
      const originalPlaceholders = (page.match(/\{[^}]+\}/g) || []).length;
      const remainingPlaceholders = (placeholderResolved.match(/\{[^}]+\}/g) || []).length;
      const resolvedCount = originalPlaceholders - remainingPlaceholders;
      totalPlaceholdersResolved += resolvedCount;
      
      // Step 2: Apply safe grammar validation and enhancement
      const pronoun = derivePronoun(userInfo);
      const grammarResult = safeValidateAndEnhanceGrammar(placeholderResolved, pronoun);
      
      if (grammarResult.success) {
        grammarEnhancementSuccesses++;
        console.log(`✅ Enhanced grammar applied for page ${i + 1}: ${grammarResult.result.substring(0, 50)}...`);
        
        // FLICKER DETECTION: Check for content changes
        if (grammarResult.result !== placeholderResolved) {
          console.log(`📚 [FLICKER-DETECTED] Page ${i + 1} text modified during grammar processing:`, {
            originalLength: placeholderResolved.length,
            processedLength: grammarResult.result.length,
            contentChanged: placeholderResolved.toLowerCase() !== grammarResult.result.toLowerCase()
          });
        }
      } else {
        grammarFailureReasons.push(`Page ${i + 1}: ${grammarResult.error}`);
        console.warn(`⚠️ Enhanced grammar enhancement failed for page ${i + 1}, using original text`);
      }
      
      processedPages.push(grammarResult.result);
    }

    console.log('✅ Unified processing complete with enhanced grammar system', {
      pagesProcessed: processedPages.length,
      totalPlaceholdersResolved,
      enhancedGrammarSuccesses: grammarEnhancementSuccesses,
      enhancedGrammarFailures: grammarFailureReasons.length,
      source: 'unified-processor-enhanced'
    });
    
    // FLICKER DETECTION: Final content comparison
    console.log('📚 [FLICKER-CHECK] Final processed story pages:', {
      pageCount: processedPages.length,
      firstPageProcessed: processedPages[0]?.substring(0, 50) + '...',
      totalLengthAfter: processedPages.join(' ').length,
      anyChangesDetected: processedPages.some((page, i) => page !== pages[i])
    });

    const response: ProcessResponse = {
      success: true,
      processedPages,
      processingMetadata: {
        placeholdersResolved: totalPlaceholdersResolved,
        grammarEnhanced: grammarEnhancementSuccesses === pages.length,
        grammarEnhancementErrors: grammarFailureReasons.length,
        grammarFailureReasons: grammarFailureReasons.length > 0 ? grammarFailureReasons : undefined,
        source: 'unified-processor-enhanced'
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Unified processing error:', error);
    
    const errorResponse: ProcessResponse = {
      success: false,
      processedPages: [],
      processingMetadata: {
        placeholdersResolved: 0,
        grammarEnhanced: false,
        grammarEnhancementErrors: 0,
        source: 'unified-processor-enhanced'
      },
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});