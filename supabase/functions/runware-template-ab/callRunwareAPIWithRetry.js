// Shared Runware API call with retry logic for Template AB
export async function callRunwareAPIWithRetry(positivePrompt, negativePrompt, retries = 2) {
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