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

    // Extract user information for personalization
    const userName = config?.userName || 'the child';
    const userAge = config?.age || 8;
    const userGrade = config?.gradeLevel || 'K';
    const userInterests = interests || [];
    const favoriteColor = config?.favoriteColor || 'blue';
    const favoriteAnimal = config?.favoriteAnimal || 'cat';
    const hobbies = config?.hobbies || '';
    const favoriteFood = config?.favoriteFood || '';
    
    // Create user input words list for vocabulary exceptions
    const userInputWords = [
      userName,
      favoriteColor,
      favoriteAnimal,
      favoriteFood,
      ...(hobbies ? hobbies.split(' ').filter(w => w.length > 2) : []),
      ...(userInterests || [])
    ].filter(Boolean);
    
    // Create specs from config if not provided
    const specs = {
      ageRange: config?.age || userAge,
      maxWordsPerPage: readingLevel === 'beginner' ? 6 : readingLevel === 'easy' ? 17 : readingLevel === 'medium' ? 43 : 500,
      wordLimit: config?.maxLength || (readingLevel === 'beginner' ? 30 : readingLevel === 'easy' ? 100 : readingLevel === 'medium' ? 300 : 3000),
      pageCount: config?.expectedPages || (readingLevel === 'beginner' ? 5 : readingLevel === 'easy' ? 6 : readingLevel === 'medium' ? 7 : 8),
      sentenceStructure: readingLevel === 'beginner' ? 'simple' : readingLevel === 'easy' ? 'basic' : readingLevel === 'medium' ? 'complex' : 'advanced',
      vocabulary: readingLevel
    };
    
    // Character details - NO SKIN TONE REFERENCES
    const avatarType = config?.avatar?.type || 'child';
    
    // Build character description without skin tone
    const characterDesc = `${avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'child'}`;

    // Create enhanced prompts based on reading level with vocabulary enforcement
    const systemPrompt = readingLevel === 'beginner' 
      ? `You are a Level 0 story writer for ages 3-5. Create very simple stories using ONLY Dolch Pre-Primer and Primer sight words (92 words total).

STRICT REQUIREMENTS:
- Exactly ${specs.wordLimit} words total across entire story
- Exactly ${specs.pageCount} pages
- Exactly ${specs.maxWordsPerPage} words per page (1 simple sentence)
- Only Subject-Verb or Subject-Verb-Object sentences
- Use ONLY these 92 words: a, and, away, big, blue, can, come, down, find, for, funny, go, help, here, i, in, is, it, jump, little, look, make, me, my, not, one, play, red, run, said, see, the, three, to, two, up, we, where, yellow, you, all, am, are, at, ate, be, black, brown, but, came, did, do, eat, four, get, good, have, he, into, like, must, new, no, now, on, our, out, please, pretty, ran, ride, saw, say, she, so, soon, that, there, they, this, too, under, want, was, well, went, what, white, who, will, with, yes
- EXCEPTION: Always allow user's name (${userName}) and their inputs: ${userInputWords.join(', ')}
- Use ${userName} 60% of time, pronouns (he/she/they) 40% of time
- Every sentence must be joyful and positive
- NO conflicts, problems, or challenges

VOCABULARY ENFORCEMENT: If you use ANY word not in the 92-word list or user exceptions, the story will be rejected.

Return story in this exact format:
Page 1: [exactly 6 words]
Page 2: [exactly 6 words]  
Page 3: [exactly 6 words]
Page 4: [exactly 6 words]
Page 5: [exactly 6 words]`
      : readingLevel === 'easy'
      ? `You are a Level 1 story writer for ages 5-7. Create simple stories using cumulative Dolch vocabulary through 1st grade (133 words total).

REQUIREMENTS:
- Exactly ${specs.wordLimit} words total across entire story
- Exactly ${specs.pageCount} pages
- ${Math.floor(specs.wordLimit/specs.pageCount)}-${specs.maxWordsPerPage} words per page (1-2 simple sentences)
- Simple sentences with basic conjunctions
- Use cumulative Dolch vocabulary: Pre-Primer + Primer + 1st Grade words (133 total)
- EXCEPTION: Always allow user's name (${userName}) and their inputs: ${userInputWords.join(', ')}
- Use ${userName} 50% of time, pronouns 50% of time
- Include gentle adventures and positive problem-solving
- Focus on friendship, family, and discovery themes

Return story in this exact format:
Page 1: [${Math.floor(specs.wordLimit/specs.pageCount)}-${specs.maxWordsPerPage} words]
Page 2: [${Math.floor(specs.wordLimit/specs.pageCount)}-${specs.maxWordsPerPage} words]
etc. for ${specs.pageCount} pages`
      : readingLevel === 'medium'
      ? `You are a Level 2 story writer for ages 7-9. Create engaging stories using cumulative Dolch vocabulary through 2nd grade (179 words total).

REQUIREMENTS:
- ${specs.wordLimit} words total across entire story
- Exactly ${specs.pageCount} pages
- ${Math.floor(specs.wordLimit/specs.pageCount)}-${specs.maxWordsPerPage} words per page (2-3 sentences)
- Complex sentences with descriptive language
- Use cumulative Dolch vocabulary: Pre-Primer + Primer + 1st Grade + 2nd Grade words (179 total)
- EXCEPTION: Always allow user's name (${userName}) and their inputs: ${userInputWords.join(', ')}
- Use ${userName} 40% of time, pronouns 60% of time
- Include mild conflicts with positive resolution
- Focus on character development and emotions

Return story in this exact format:
Page 1: [${Math.floor(specs.wordLimit/specs.pageCount)}-${specs.maxWordsPerPage} words]
etc. for ${specs.pageCount} pages`
      : `You are an advanced children's story writer. Create age-appropriate stories with rich vocabulary and complex themes. Make ${userName} the main character and include their interests: ${userInputWords.join(', ')}.

Return story in exact page format as requested.`;

    // Create simplified user prompt
    const userPrompt = readingLevel === 'beginner'
      ? `Create a 30-word story for ${userName}. Use their favorite ${favoriteColor} ${favoriteAnimal}. Include ${hobbies}. Remember: exactly 6 words per page, 5 pages total. Use simple joy and happiness.`
      : readingLevel === 'easy'
      ? `Create a ${specs.wordLimit}-word story for ${userName} (age ${userAge}). They love ${favoriteAnimal} and ${favoriteColor}. Their hobby is ${hobbies} and they like ${favoriteFood}. Include gentle adventures and friendship.`
      : readingLevel === 'medium' 
      ? `Create a ${specs.wordLimit}-word adventure for ${userName} (age ${userAge}). They love ${favoriteAnimal} and ${favoriteColor}. Their passion is ${hobbies} and they enjoy ${favoriteFood}. Include problem-solving and character growth.`
      : `Create an engaging ${theme || 'adventure'} story for ${userName} (age ${userAge}). Include their interests: ${favoriteColor}, ${favoriteAnimal}, ${hobbies}, ${favoriteFood}. Theme: ${theme || 'adventure'}. Style: ${authorStyle || 'engaging'}.`;

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

    // Parse story into pages
    const pages = storyText.split(/Page \d+:/g)
      .filter(page => page.trim().length > 0)
      .map(page => page.trim().replace(/^\d+\.\s*/, ''));

    console.log(`Generated personalized story for ${userName} (${characterDesc}) about ${theme || 'adventure'}`);

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
    try {
      const requestBody = await req.json();
      fallbackConfig = requestBody.config || {};
    } catch (parseError) {
      console.error('Could not parse request for fallback:', parseError);
    }
    
    // Enhanced fallback with user details - NO SKIN TONE
    const userName = fallbackConfig?.userName || 'the child';
    const theme = fallbackConfig?.theme || 'adventure';
    const characterDesc = fallbackConfig?.avatar ? 
      `${fallbackConfig.avatar.type === 'boy' ? 'young boy' : fallbackConfig.avatar.type === 'girl' ? 'young girl' : 'child'}` :
      'brave young adventurer';
    
    const fallbackStory = readingLevel === 'beginner' 
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
            `${userName} was excited to start a new ${theme}!`,
            `The ${characterDesc} looked around with wonder and curiosity.`,
            `${userName} discovered something amazing that made them smile.`,
            `With courage and determination, ${userName} explored further.`,
            `${userName} learned something wonderful and felt proud of their journey.`
          ],
          difficulty: readingLevel || 'easy',
          title: `${userName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Story`,
          isComplete: true
        };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})