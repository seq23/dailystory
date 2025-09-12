// Phase 4: Background pre-generation cron job
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.js";

// ============= LAZY LOADING FUNCTIONS FOR HEAVY DEPENDENCIES =============

async function getDifficultyMapper() {
  try {
    const { DifficultyLevelMapper } = await import("../_shared/DifficultyLevelMapper.ts");
    return DifficultyLevelMapper;
  } catch (error) {
    console.warn('DifficultyLevelMapper lazy load failed:', error);
    return null;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Starting background image pre-generation...');

    // Get DifficultyLevelMapper with lazy loading
    const DifficultyLevelMapper = await getDifficultyMapper();
    if (!DifficultyLevelMapper) {
      throw new Error('DifficultyLevelMapper not available');
    }

    // Find stories without images (limit to 5 per run to avoid overload)
    const { data: stories, error } = await supabase
      .from('saved_stories')
      .select('*')
      .eq('has_images', false)
      .limit(5);

    if (error) {
      throw error;
    }

    if (!stories || stories.length === 0) {
      console.log('✅ No stories found that need image generation');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No stories need image generation',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let processedCount = 0;
    const maxConcurrent = 2; // Keep it low for background processing

    // Process stories in small batches
    for (let i = 0; i < stories.length; i += maxConcurrent) {
      const batch = stories.slice(i, i + maxConcurrent);
      
      await Promise.allSettled(batch.map(async (story) => {
        try {
          const storyData = story.story_data;
          if (!storyData?.pages?.length) return;

          console.log(`🎨 Pre-generating images for story ${story.id}`);

          // Generate images for each page using existing edge function
          const imagePromises = storyData.pages.map(async (pageText, pageIndex) => {
            try {
              // Properly construct userInfo with normalized difficulty
              const normalizedDifficulty = DifficultyLevelMapper.normalizeLevel(storyData.difficulty || 'easy');
              const userInfo = {
                ...storyData.userInfo,
                difficultyLevel: normalizedDifficulty,
                name: storyData.userInfo?.name || 'Background',
                age: storyData.userInfo?.age || 8
              };

              const { data: result } = await supabase.functions.invoke('runware-generate-image', {
                body: {
                  pageText,
                  userInfo,
                  storyId: `bg_${story.id}`,
                  pageNumber: pageIndex + 1,
                  totalPages: storyData.pages.length
                }
              });

              return result?.imageURL || null;
            } catch (error) {
              console.warn(`Failed to generate image for page ${pageIndex}:`, error);
              return null;
            }
          });

          const images = await Promise.allSettled(imagePromises);
          const successfulImages = images.filter(result => 
            result.status === 'fulfilled' && result.value
          ).length;

          // Update story to mark as having images if at least 50% generated
          if (successfulImages > storyData.pages.length * 0.5) {
            await supabase
              .from('saved_stories')
              .update({ has_images: true })
              .eq('id', story.id);
            
            processedCount++;
            console.log(`✅ Generated ${successfulImages}/${storyData.pages.length} images for story ${story.id}`);
          }

        } catch (error) {
          console.error(`Error processing story ${story.id}:`, error);
        }
      }));
    }

    console.log(`🎯 Background pre-generation complete. Processed ${processedCount} stories.`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedCount,
      total: stories.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Background pre-generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});