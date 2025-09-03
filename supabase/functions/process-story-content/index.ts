import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import the sophisticated template system components
import { resolveAllPlaceholders, type MicroContext, type UserInfo } from "../_shared/placeholderResolver.ts";

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
    source: 'unified-processor';
  };
  error?: string;
}

// Use shared pronoun derivation from placeholderResolver
import { derivePronoun } from '../_shared/placeholderResolver.ts';

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

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      throw new Error('Invalid pages array provided');
    }

    const processedPages: string[] = [];
    let totalPlaceholdersResolved = 0;

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
      
      // Step 2: Apply grammar validation and enhancement
      const pronoun = derivePronoun(userInfo);
      const grammarEnhanced = validateAndEnhanceGrammar(placeholderResolved, pronoun);
      console.log(`✅ Grammar enhanced for page ${i + 1}: ${grammarEnhanced.substring(0, 50)}...`);
      
      processedPages.push(grammarEnhanced);
    }

    console.log('✅ Unified processing complete', {
      pagesProcessed: processedPages.length,
      totalPlaceholdersResolved,
      source: 'unified-processor'
    });

    const response: ProcessResponse = {
      success: true,
      processedPages,
      processingMetadata: {
        placeholdersResolved: totalPlaceholdersResolved,
        grammarEnhanced: true,
        source: 'unified-processor'
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
        source: 'unified-processor'
      },
      error: error.message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});