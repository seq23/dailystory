import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { readingLevel, authorStyle, theme, interests, specs, config } = await req.json()
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Extract user information for personalization
    const userName = config.userName || 'the child';
    const userAge = config.age;
    const userGrade = config.gradeLevel;
    const userInterests = interests || [];
    const favoriteColor = config.favoriteColor || 'blue';
    const favoriteAnimal = config.favoriteAnimal || 'cat';
    const hobbies = config.hobbies || '';
    const favoriteFood = config.favoriteFood || '';
    const nativeLanguage = config.nativeLanguage || 'en';
    
    // Character details for consistency
    const avatarType = config.avatar?.type || 'child';
    const skinTone = config.avatar?.skinTone || 'medium';
    
    // Build character description
    const characterDesc = `${avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'child'} with ${skinTone} skin tone`;

    // Create highly detailed and personalized prompt
    const systemPrompt = `You are a master children's book author who creates deeply personalized stories that make each child the hero of their own adventure.

CHILD PROFILE:
- Name: ${userName}
- Age: ${userAge} (Grade ${userGrade})
- Character: ${characterDesc}
- Reading Level: ${readingLevel}
- Native Language: ${nativeLanguage}
- Interests: ${userInterests.join(', ')}
- Favorite Color: ${favoriteColor}
- Favorite Animal: ${favoriteAnimal}
- Hobbies: ${hobbies}
- Favorite Food: ${favoriteFood}

STORY REQUIREMENTS:
- Theme: ${theme}
- Author Style: ${authorStyle}
- Target Age: ${specs.ageRange}
- Max words per page: ${specs.maxWordsPerPage}
- Total word limit: ${specs.wordLimit}
- Page count: ${specs.pageCount}
- Sentence structure: ${specs.sentenceStructure}
- Vocabulary level: ${specs.vocabulary}

CRITICAL PERSONALIZATION RULES:
1. ${userName} MUST be the main character and hero
2. Naturally incorporate their favorite color, animal, and interests
3. Include their hobbies and favorite food when contextually appropriate
4. Make the character description consistent: ${characterDesc}
5. Use age-appropriate language and concepts for ${userAge}-year-olds
6. Create situations where ${userName} demonstrates bravery, kindness, and problem-solving

WRITING STYLE FOR ${readingLevel.toUpperCase()}:
${readingLevel === 'beginner' ? 
  `- Simple, repetitive patterns like Dr. Seuss
  - 4-8 words per sentence maximum
  - Basic sight words and simple concepts
  - Rhyming patterns when possible
  - Focus on colors, shapes, and basic emotions` :
readingLevel === 'elementary' ? 
  `- Conversational tone like Junie B. Jones
  - 10-20 words per sentence
  - Simple dialogue and character emotions
  - Relatable everyday situations
  - Gentle humor and friendship themes` :
readingLevel === 'intermediate' ?
  `- Rich descriptions like Roald Dahl
  - Complex sentences with varied structure
  - Character development and mild conflict
  - Descriptive language and figurative speech
  - Problem-solving and growing up themes` :
  `- Sophisticated style like J.K. Rowling
  - Complex plots and character arcs
  - Rich world-building and themes
  - Advanced vocabulary and literary devices
  - Identity and moral decision themes`
}

STORY STRUCTURE:
- Opening: Introduce ${userName} in their familiar world
- Inciting Incident: Something related to ${theme} happens
- Rising Action: ${userName} faces challenges using their interests/skills
- Climax: ${userName} overcomes the main challenge heroically
- Resolution: ${userName} learns something valuable and feels proud

Create a complete, engaging story that makes ${userName} feel like the hero of their own adventure.`

    const userPrompt = `Write a ${theme} story where ${userName}, a ${characterDesc}, goes on an amazing adventure. The story should naturally include their favorite color (${favoriteColor}), their favorite animal (${favoriteAnimal}), and their interests (${userInterests.join(', ')}). Make ${userName} brave, clever, and kind. The story should be exactly right for a ${userAge}-year-old at ${readingLevel} reading level. Make it feel like ${userName} is really the hero!

${hobbies ? `Include ${userName}'s hobby of ${hobbies} in a meaningful way.` : ''}
${favoriteFood ? `Maybe include ${userName}'s favorite food (${favoriteFood}) at an appropriate moment.` : ''}

Write this as a complete story that flows naturally from beginning to end, without mentioning page numbers.`

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
        max_tokens: readingLevel === 'beginner' ? 300 : readingLevel === 'elementary' ? 600 : readingLevel === 'intermediate' ? 1200 : 2500,
        temperature: 0.8,
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

    // Always return structured response
    const storyResult = {
      title: `${userName}'s ${theme} Adventure`,
      content: storyText,
      characterDetails: {
        name: userName,
        description: characterDesc,
        favoriteColor,
        favoriteAnimal,
        skinTone,
        avatarType
      }
    }

    console.log(`Generated personalized story for ${userName} (${characterDesc}) about ${theme}`);

    return new Response(JSON.stringify(storyResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Story generation error:', error)
    
    // Enhanced fallback with user details
    const userName = config?.userName || 'the child';
    const theme = config?.theme || 'adventure';
    const characterDesc = config?.avatar ? 
      `${config.avatar.type === 'boy' ? 'young boy' : config.avatar.type === 'girl' ? 'young girl' : 'child'} with ${config.avatar.skinTone} skin tone` :
      'brave young adventurer';
    
    const fallbackStory = {
      title: `${userName}'s Special ${theme}`,
      content: `Once upon a time, there was a wonderful ${characterDesc} named ${userName}. ${userName} was very special and brave. One day, ${userName} went on an amazing ${theme} adventure. Along the way, ${userName} met friendly animals and discovered magical places. ${userName} showed great courage and kindness. In the end, ${userName} felt very proud of all the wonderful things they had accomplished. And they lived happily ever after, ready for their next adventure!`,
      characterDetails: {
        name: userName,
        description: characterDesc
      }
    };
    
    return new Response(JSON.stringify(fallbackStory), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})