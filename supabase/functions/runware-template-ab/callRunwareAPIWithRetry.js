// Shared Runware API call with single attempt (no retries) for Template AB
export async function callRunwareAPIWithRetry(positivePrompt, negativePrompt, retries = 0) {
  const apiKey = Deno.env.get('RUNWARE_API_KEY');
  if (!apiKey) {
    throw new Error('RUNWARE_API_KEY not configured');
  }

  console.log('🌐 Calling Runware API with retry logic...');
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: apiKey.trim()
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: positivePrompt,
            negativePrompt: negativePrompt,
            width: 1024,
            height: 1024,
            model: "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            steps: 25,
            CFGScale: 8
          }
        ])
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const imageData = result.data?.find(item => item.taskType === 'imageInference');

      if (!imageData?.imageURL) {
        throw new Error('No image URL in API response');
      }

      console.log(`✅ Runware API call successful on attempt ${attempt}`);
      
      // Track Runware cost for analytics
      try {
        // FLUX.1 [schnell] pricing: $0.0013 per image
        const cost = 0.0013;
        
        // Import Supabase client
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.57.4');
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseClient.from('cost_tracking').insert({
          session_id: 'runware-session', // Will be updated when we get sessionId
          user_id: null,
          input_tokens: 0,
          output_tokens: 0,
          cost: cost,
          model_used: 'runware:100@1',
          operation_type: 'image_generation',
          provider: 'runware',
          api_endpoint: 'v1/imageInference',
          pricing_model: 'images',
          quantity_used: 1,
          unit_cost: cost
        });

        console.log(`💰 Runware cost tracked: $${cost} for image generation`);
      } catch (error) {
        console.warn('Failed to track Runware cost:', error);
      }

      return {
        imageURL: imageData.imageURL,
        provider: 'runware',
        tier: '2.5AB'
      };

    } catch (error) {
      console.error(`❌ Runware API attempt ${attempt}/${retries + 1} failed:`, error);
      
      if (attempt <= retries) {
        const delay = attempt * 1000; // Progressive delay
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
}