import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced Template Library integration for fallbacks
function getEnhancedFallbackPages(difficulty, userInfo) {
  const userName = userInfo.name || 'the child';
  
  // Enhanced fallback templates based on difficulty
  const templates = {
    beginner: {
      setup: [
        `${userName} sees a big red ball.`,
        `${userName} finds a blue cat.`,
        `${userName} meets a nice dog.`
      ],
      development: [
        `The ball is fun to play with.`,
        `The cat wants to play too.`,
        `The dog wags its tail happily.`
      ],
      climax: [
        `${userName} throws the ball high.`,
        `The cat and dog run fast.`,
        `All three friends play together.`
      ],
      resolution: [
        `${userName} feels very happy.`,
        `The animals are good friends now.`,
        `They all play until the sun sets.`
      ]
    },
    easy: [
      `${userName} began a wonderful adventure in the garden.`,
      `The curious child discovered beautiful flowers everywhere.`,
      `${userName} found a friendly butterfly sitting on a rose.`,
      `Together they explored the magical garden paths.`,
      `${userName} felt amazed by all the colorful beauty around.`
    ],
    medium: [
      `${userName} embarked on an exciting journey through the mysterious forest.`,
      `The brave explorer noticed ancient trees whispering secrets in the wind.`,
      `${userName} encountered a wise owl who offered helpful guidance.`,
      `Following the owl's advice, ${userName} discovered a hidden clearing filled with wonder.`,
      `${userName} returned home with incredible stories and newfound wisdom about nature.`
    ],
    hard: [
      `${userName} initiated an extraordinary expedition into the uncharted wilderness, determined to uncover its secrets.`,
      `The intrepid adventurer meticulously documented fascinating discoveries while navigating through challenging terrain.`,
      `${userName} demonstrated exceptional problem-solving abilities when confronted with a complex environmental puzzle.`,
      `Through perseverance and scientific observation, ${userName} successfully decoded the mysteries of the ecosystem.`,
      `${userName} emerged as a accomplished naturalist, having contributed valuable knowledge to the understanding of wildlife conservation.`
    ]
  };

  if (difficulty === 'beginner') {
    // For beginner, create a 5-page story from the structured template
    const template = templates.beginner;
    return [
      template.setup[Math.floor(Math.random() * template.setup.length)],
      template.development[Math.floor(Math.random() * template.development.length)],
      template.climax[Math.floor(Math.random() * template.climax.length)],
      template.resolution[Math.floor(Math.random() * template.resolution.length)],
      `${userName} smiles and feels proud.`
    ];
  }
  
  return templates[difficulty] || templates.easy;
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
    
    // Enhanced fallback using simplified template system
    const userName = fallbackConfig?.userName || 'the child';
    
    // Get fallback pages using Enhanced Template Library logic
    const fallbackPages = getEnhancedFallbackPages(fallbackReadingLevel, {
      name: userName,
      avatar: fallbackConfig?.avatar,
      interests: fallbackConfig?.interests || []
    });

    const fallbackStory = {
      pages: fallbackPages,
      difficulty: fallbackReadingLevel || 'easy',
      title: `${userName}'s ${fallbackTheme.charAt(0).toUpperCase() + fallbackTheme.slice(1)} Story`,
      isComplete: true
    };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})