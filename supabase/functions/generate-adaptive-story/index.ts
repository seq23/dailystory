import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// ENHANCED TEMPLATE LIBRARY INTEGRATION
// ============================================================================

// Name formatting utilities for proper capitalization
class NameFormatter {
  static capitalize(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    const trimmed = name.trim();
    if (!trimmed) return '';
    
    // Handle hyphenated names (Mary-Jane -> Mary-Jane)
    if (trimmed.includes('-')) {
      return trimmed.split('-')
        .map(part => this.capitalizeWord(part))
        .join('-');
    }
    
    // Handle multiple words (Mary Jane -> Mary Jane)
    if (trimmed.includes(' ')) {
      return trimmed.split(' ')
        .map(part => this.capitalizeWord(part))
        .join(' ');
    }
    
    // Single word
    return this.capitalizeWord(trimmed);
  }
  
  private static capitalizeWord(word: string): string {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

// Color converter utility
const HEX_TO_COLOR_MAP: Record<string, string> = {
  '#3B82F6': 'blue',
  '#EF4444': 'red', 
  '#10B981': 'green',
  '#F59E0B': 'yellow',
  '#8B5CF6': 'purple',
  '#EC4899': 'pink',
  '#F97316': 'orange',
  '#06B6D4': 'cyan',
  '#84CC16': 'lime',
  '#6366F1': 'indigo',
  '#14B8A6': 'teal',
  '#F43F5E': 'rose',
  '#A855F7': 'violet',
  '#22C55E': 'emerald'
};

function ensureColorName(color: string | undefined): string {
  if (!color) return 'blue';
  if (!color?.startsWith('#')) {
    return color || 'blue';
  }
  const colorName = HEX_TO_COLOR_MAP[color.toLowerCase()];
  return colorName || 'blue';
}

// Enhanced Template Library Templates
const ENHANCED_FALLBACK_TEMPLATES = {
  "1": [
    {
      setup: [
        "{NAME} has a {COLOR} ball.",
        "{NAME} sees a {COLOR} cat.",
        "{NAME} finds a big {COLOR} dog."
      ],
      development: [
        "The ball is fun to play with.",
        "The cat likes to run and jump.",
        "The dog wags its tail happily."
      ],
      climax: [
        "{NAME} throws the ball high up.",
        "The cat and dog run very fast.",
        "All the animals want to play."
      ],
      resolution: [
        "{NAME} feels very happy.",
        "Everyone plays together nicely.",
        "The sun shines on all the friends."
      ],
      contextualContinuations: []
    }
  ],
  "2": [
    {
      setup: [
        "{NAME} began a wonderful adventure in the magical garden.",
        "{NAME} discovered beautiful {COLOR} flowers everywhere around.",
        "{NAME} found a friendly butterfly sitting on a rose."
      ],
      development: [
        "The curious child explored the winding garden paths.",
        "Many colorful creatures lived among the flowers.",
        "The butterfly showed {NAME} secret hiding places."
      ],
      climax: [
        "{NAME} helped the butterfly find its lost friend.",
        "Together they discovered a hidden waterfall.",
        "The garden revealed its most beautiful secret."
      ],
      resolution: [
        "{NAME} felt amazed by all the natural beauty.",
        "The butterfly thanked {NAME} for the kind help.",
        "They promised to meet again next spring."
      ],
      contextualContinuations: []
    }
  ],
  "3": [
    {
      setup: [
        "{NAME} embarked on an exciting journey through the mysterious forest.",
        "{NAME} noticed ancient trees whispering secrets in the wind.",
        "{NAME} encountered a wise owl sitting on a {COLOR} branch."
      ],
      development: [
        "The brave explorer followed winding trails deeper into the woods.",
        "Many fascinating creatures called the forest their home.",
        "The owl offered helpful guidance for the challenging path ahead."
      ],
      climax: [
        "{NAME} discovered a hidden clearing filled with magical wonder.",
        "The forest revealed its most carefully guarded secrets.",
        "Ancient wisdom flowed through every leaf and stone."
      ],
      resolution: [
        "{NAME} returned home with incredible stories to share.",
        "The experience taught valuable lessons about nature's balance.",
        "Forever changed, {NAME} became a true friend of the forest."
      ],
      contextualContinuations: []
    }
  ],
  "4": [
    {
      setup: [
        "{NAME} initiated an extraordinary expedition into the uncharted wilderness, determined to uncover its secrets.",
        "{NAME} meticulously prepared advanced equipment for the challenging scientific research ahead.",
        "{NAME} established a base camp near a pristine {COLOR} mountain lake."
      ],
      development: [
        "The intrepid researcher documented fascinating discoveries while navigating treacherous terrain.",
        "Complex ecological relationships revealed themselves through careful observation and analysis.",
        "Environmental challenges tested every aspect of {NAME}'s scientific knowledge and determination."
      ],
      climax: [
        "{NAME} successfully decoded the intricate mysteries of the ecosystem's delicate balance.",
        "Revolutionary discoveries emerged from months of dedicated fieldwork and research.",
        "The breakthrough findings would transform humanity's understanding of wilderness conservation."
      ],
      resolution: [
        "{NAME} emerged as an accomplished naturalist, having contributed invaluable knowledge to science.",
        "The expedition's success opened new frontiers for environmental research and protection.",
        "Future generations would benefit from {NAME}'s groundbreaking conservation discoveries."
      ],
      contextualContinuations: []
    }
  ]
};

// Enhanced Fallback Manager
class EnhancedFallbackManager {
  private static usedTemplates: Set<string> = new Set();
  
  static getFallbackTemplate(difficulty: string, userInfo: any, pageIndex: number = 0): string {
    const templates = ENHANCED_FALLBACK_TEMPLATES[difficulty] || ENHANCED_FALLBACK_TEMPLATES["2"];
    const template = templates[0]; // Use first template for simplicity
    
    const storyPosition = this.determineStoryPosition(pageIndex);
    const phrases = template[storyPosition] || template.setup;
    const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    return this.processTemplate(selectedPhrase, userInfo);
  }
  
  private static determineStoryPosition(pageIndex: number): keyof typeof ENHANCED_FALLBACK_TEMPLATES["1"][0] {
    if (pageIndex === 0) return 'setup';
    if (pageIndex <= 2) return 'development';
    if (pageIndex === 3) return 'climax';
    return 'resolution';
  }
  
  private static processTemplate(template: string, userInfo: any): string {
    const userName = NameFormatter.capitalize(userInfo?.name || 'the child');
    const userColor = ensureColorName(userInfo?.favoriteColor);
    
    return template
      .replace(/{NAME}/g, userName)
      .replace(/{COLOR}/g, userColor);
  }
  
  static clearSession(): void {
    this.usedTemplates.clear();
  }
}

// Enhanced fallback page generator using the Enhanced Template Library
function getEnhancedFallbackPages(difficulty: string, userInfo: any): string[] {
  const difficultyMap: Record<string, string> = {
    'beginner': '1',
    'easy': '2', 
    'medium': '3',
    'hard': '4'
  };
  
  const mappedDifficulty = difficultyMap[difficulty] || '2';
  
  // Generate 5 pages using Enhanced Template Library
  const pages: string[] = [];
  for (let i = 0; i < 5; i++) {
    const page = EnhancedFallbackManager.getFallbackTemplate(mappedDifficulty, userInfo, i);
    pages.push(page);
  }
  
  return pages;
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