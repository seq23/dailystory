// ⚠️ DEPRECATED - NEVER DELETE ⚠️
// DEPRECATION WARNING: This function is DEPRECATED as of 2025-09-14
// REASON: Switching to Runware-only approach, OpenAI gpt-image-1 no longer used in runtime
// STATUS: Preserved as emergency backup, DO NOT USE in production
// NEVER DELETE: Keep as fallback until user confirms Runware system is stable
// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const basePrompt = `A diverse group of four beautiful child characters with graceful features and charming expressions, each holding colorful hand-drawn signs that say 'IMAGES NOT WORKING' in playful, child-friendly lettering. 2.9D rendered illustration with golden hour volumetric lighting, SSS, AO, GI featuring: one blonde child with fair porcelain skin, bright blue eyes, and silky straight platinum blonde hair with natural shine; one red-haired child with fair skin dotted with gentle freckles, warm green eyes, and vibrant curly copper-red hair with individual strand definition; one medium-skinned child with warm caramel complexion, expressive brown eyes, and wavy chestnut brown hair with rich texture; one African American child with beautiful rich deep brown skin tone, bright expressive dark eyes, defined facial bone structure, and natural coily hair texture with dimensional volume. Semi-realistic digital art with photorealism-artistic balance, detailed hair strands, dimensional skin rendering, matte finish, realistic materials, AA, raytraced shadows, shallow DOF, high-end rendering, consistent topology & proportions. The children display resilient smiles despite the technical difficulty, showing positivity and teamwork. Child-friendly aesthetic with diverse representation, warm expressions, and bright vibrant colors optimized for young audiences.`;

    const variations = [
      "Main group shot with all four children together",
      "Blonde child with blue eyes holding sign, close-up view",
      "Red-haired child with freckles and green eyes, individual portrait",
      "Medium-skinned child with brown eyes and wavy hair, smiling portrait",
      "African American child with coily hair, confident expression",
      "Two children working together, showing teamwork and friendship"
    ];

    const images = [];

    for (let i = 0; i < variations.length; i++) {
      console.log(`Generating image ${i + 1}: ${variations[i]}`);
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: `${basePrompt} Focus on: ${variations[i]}`,
          size: '1024x1024',
          quality: 'high',
          output_format: 'png',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('OpenAI API error:', data);
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }

      // The response from gpt-image-1 already contains base64 data
      const base64Data = data.data[0].b64_json;
      images.push({
        index: i,
        variation: variations[i],
        base64: base64Data
      });
    }

    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating fallback images:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate images', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});