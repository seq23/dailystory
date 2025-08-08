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
      userName: config?.userName,
      expertGrade: config?.expertGrade,
      model: 'gpt-4o',
      maxTokens: readingLevel === 'beginner' ? 100 : readingLevel === 'easy' ? 300 : readingLevel === 'medium' ? 600 : 1200
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: readingLevel === 'beginner' ? 100 : readingLevel === 'easy' ? 300 : readingLevel === 'medium' ? 600 : 1200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI API response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content
    });

    const storyText = data.choices[0]?.message?.content?.trim()

    if (!storyText) {
      console.error('No story content generated:', { data });
      throw new Error('No story content generated')
    }

    console.log('Generated story length:', storyText.length, 'characters');

    // Clean up markdown formatting from OpenAI response
    const cleanStoryText = storyText
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/\*+/g, '')            // Remove any remaining asterisks
      .trim();

    // Parse story into pages with improved logic
    let pages = [];
    
    // Try multiple parsing strategies
    if (cleanStoryText.includes('Page ')) {
      // Standard format: "Page X: content"
      pages = cleanStoryText.split(/Page \d+:/g)
        .filter(page => page.trim().length > 0)
        .map(page => page.trim().replace(/^\d+\.\s*/, ''));
    } else if (cleanStoryText.includes('\n\n')) {
      // Fallback: Split by double newlines
      pages = cleanStoryText.split('\n\n')
        .filter(page => page.trim().length > 0)
        .map(page => page.trim());
    } else {
      // Emergency fallback: Split by sentences for single block
      const sentences = cleanStoryText.split(/\. (?=[A-Z])/);
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
    
    // Use Enhanced Template Library for all fallbacks
    // Since we can't import the full template system in Edge Function,
    // we'll create a simplified fallback that matches the template structure
    const simpleTemplates = {
      beginner: [
        `${userName} sees a {color} {animal}.`,
        `The {animal} is happy.`,
        `${userName} plays with the {animal}.`,
        `They have fun together.`,
        `${userName} smiles big.`
      ],
      easy: [
        `${userName} started a wonderful adventure.`,
        `The brave child looked around with excitement.`,
        `${userName} found something special and amazing.`,
        `With courage, ${userName} explored the new place.`,
        `${userName} felt proud and happy about the journey.`
      ],
      medium: [
        `${userName} began an exciting journey through a magical place.`,
        `The curious adventurer discovered something truly remarkable.`,
        `${userName} faced a challenge with determination and cleverness.`,
        `Working together with new friends, ${userName} solved the problem.`,
        `${userName} returned home with wonderful memories and new wisdom.`
      ],
      hard: [
        `${userName} embarked on an extraordinary quest that would test their courage.`,
        `The determined young explorer encountered mysteries that sparked their curiosity.`,
        `${userName} demonstrated remarkable problem-solving skills when faced with obstacles.`,
        `Through perseverance and teamwork, ${userName} overcame the greatest challenges.`,
        `${userName} emerged victorious, having grown wiser and more confident than ever before.`
      ]
    };

    const templatePages = simpleTemplates[fallbackReadingLevel] || simpleTemplates.easy;
    const fallbackStory = {
      pages: templatePages,
      difficulty: fallbackReadingLevel || 'easy',
      title: `${userName}'s ${fallbackTheme.charAt(0).toUpperCase() + fallbackTheme.slice(1)} Story`,
      isComplete: true
    };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})