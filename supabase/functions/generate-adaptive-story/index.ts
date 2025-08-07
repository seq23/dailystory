import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    const { readingLevel, authorStyle, theme, interests, config } = requestBody
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Use the prompts sent from the frontend services
    // If custom prompts are provided (from LiveGenerationService), use those
    // Otherwise, fall back to basic prompts for NetflixStyleStoryService  
    const systemPrompt = config?.systemPrompt || `You are a children's story writer. Create an engaging story for ${readingLevel} level readers.`;
    const userPrompt = config?.userPrompt || `Create a story for ${config?.userName || 'the child'} about ${theme || 'adventure'}.`;

    console.log('📖 Story Generation Request:', {
      readingLevel,
      theme,
      hasCustomPrompts: !!(config?.systemPrompt && config?.userPrompt),
      userName: config?.userName
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: readingLevel === 'beginner' ? 200 : readingLevel === 'easy' ? 400 : readingLevel === 'medium' ? 800 : 2000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const storyText = data.choices[0]?.message?.content?.trim()

    if (!storyText) {
      throw new Error('No story content generated')
    }

    // Parse story into pages with improved logic
    let pages = [];
    
    // Try multiple parsing strategies
    if (storyText.includes('Page ')) {
      // Standard format: "Page X: content"
      pages = storyText.split(/Page \d+:/g)
        .filter(page => page.trim().length > 0)
        .map(page => page.trim().replace(/^\d+\.\s*/, ''));
    } else if (storyText.includes('\n\n')) {
      // Fallback: Split by double newlines
      pages = storyText.split('\n\n')
        .filter(page => page.trim().length > 0)
        .map(page => page.trim());
    } else {
      // Emergency fallback: Split by sentences for single block
      const sentences = storyText.split(/\. (?=[A-Z])/);
      const wordsPerPage = readingLevel === 'beginner' ? 8 : readingLevel === 'easy' ? 15 : readingLevel === 'medium' ? 30 : 50;
      
      let currentPage = '';
      let currentWords = 0;
      
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(' ').length;
        if (currentWords + sentenceWords > wordsPerPage && currentPage) {
          pages.push(currentPage.trim() + (currentPage.endsWith('.') ? '' : '.'));
          currentPage = sentence;
          currentWords = sentenceWords;
        } else {
          currentPage += (currentPage ? '. ' : '') + sentence;
          currentWords += sentenceWords;
        }
      }
      if (currentPage) {
        pages.push(currentPage.trim() + (currentPage.endsWith('.') ? '' : '.'));
      }
    }

    const userName = config?.userName || 'the child';
    console.log(`Generated story for ${userName} about ${theme || 'adventure'}`);

    return new Response(JSON.stringify({
      pages,
      difficulty: readingLevel || 'easy',
      title: `${userName}'s ${theme || 'Adventure'} Story`,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Story generation error:', error)
    
    // Parse request body for fallback
    let fallbackConfig = {};
    let fallbackReadingLevel = 'easy';
    let fallbackTheme = 'adventure';
    try {
      const requestBody = await req.json();
      fallbackConfig = requestBody.config || {};
      fallbackReadingLevel = requestBody.readingLevel || 'easy';
      fallbackTheme = requestBody.theme || 'adventure';
    } catch (parseError) {
      console.error('Could not parse request for fallback:', parseError);
    }
    
    // Enhanced fallback with user details
    const userName = fallbackConfig?.userName || 'the child';
    const characterDesc = fallbackConfig?.avatar ? 
      `${fallbackConfig.avatar.type === 'boy' ? 'young boy' : fallbackConfig.avatar.type === 'girl' ? 'young girl' : 'child'}` :
      'brave young adventurer';
    
    const fallbackStory = fallbackReadingLevel === 'beginner'
      ? {
          pages: [
            `${userName} sees a cat.`,
            `The cat is red.`, 
            `${userName} likes cats.`,
            `She runs to play.`,
            `${userName} is happy.`
          ],
          difficulty: 'beginner',
          title: `${userName} and the Cat`,
          isComplete: true
        }
      : {
          pages: [
            `${userName} was excited to start a new ${fallbackTheme}!`,
            `The ${characterDesc} looked around with wonder and curiosity.`,
            `${userName} discovered something amazing that made them smile.`,
            `With courage and determination, ${userName} explored further.`,
            `${userName} learned something wonderful and felt proud of their journey.`
          ],
          difficulty: fallbackReadingLevel || 'easy',
          title: `${userName}'s ${fallbackTheme.charAt(0).toUpperCase() + fallbackTheme.slice(1)} Story`,
          isComplete: true
        };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})