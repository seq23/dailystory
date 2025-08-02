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

QUALITY REQUIREMENTS (MANDATORY):
- Use PERFECT grammar and spelling throughout the story
- Maintain consistent verb tenses (past tense for narrative)
- Ensure proper punctuation, capitalization, and sentence structure
- Write complete, well-formed sentences that flow naturally
- Use correct subject-verb agreement and pronoun usage
- Before completing the story, mentally proofread every sentence

CRITICAL PERSONALIZATION RULES:
1. ${userName} MUST be the main character and hero
2. Naturally incorporate their favorite color, animal, and interests
3. Include their hobbies and favorite food when contextually appropriate
4. Make the character description consistent: ${characterDesc}
5. Use age-appropriate language and concepts for ${userAge}-year-olds
6. Create situations where ${userName} demonstrates bravery, kindness, and problem-solving

WRITING STYLE FOR ${readingLevel.toUpperCase()}:
${readingLevel === 'beginner' ? 
  `- Write like Julia Donaldson, Mo Willems, Dr. Seuss, and Kevin Henkes
  - Maximum 6 words per page only
  - Very simple sentences with repetitive patterns
  - Use simple past tense consistently, basic punctuation
  - Focus on rhythm, rhyme, and emotional connection
  - Use basic sight words and simple concepts
  - Emphasize friendship, discovery, and gentle adventures` :
readingLevel === 'elementary' ? 
  `- Write like Jeff Kinney, Roald Dahl, Dav Pilkey, and Andrea Beaty
  - Approximately 200 words per page for 2-minute reading time
  - Conversational tone with humor and relatability
  - Maintain consistent narrative tense, proper dialogue punctuation
  - Include simple dialogue and character emotions
  - Focus on friendship, problem-solving, and everyday adventures
  - Use descriptive language that's accessible but engaging` :
readingLevel === 'intermediate' ?
  `- Write like Katherine Applegate, C.S. Lewis, and J.K. Rowling
  - Approximately 300 words per page for 2-minute reading time
  - Rich descriptions and character development
  - Complex sentence structures with correct grammar
  - Include mild conflict and emotional depth
  - Use figurative language and deeper themes about growing up` :
  `- Write like Sharon Creech, Anna Sewell, Louis Sachar, Jacqueline Woodson, Suzanne Collins, John Green, and Markus Zusak
  - Approximately 500 words per page for 2-minute reading time
  - Sophisticated storytelling with complex plots
  - Sophisticated grammar with varied sentence types
  - Rich world-building and character arcs
  - Advanced vocabulary and literary devices
  - Explore themes of identity, relationships, and moral decisions
  - Randomly vary difficulty within 6th-12th grade range`
}

STORY STRUCTURE:
- Opening: Introduce ${userName} in their familiar world
- Inciting Incident: Something related to ${theme} happens
- Rising Action: ${userName} faces challenges using their interests/skills
- Climax: ${userName} overcomes the main challenge heroically
- Resolution: ${userName} learns something valuable and feels proud

Create a complete, engaging story that makes ${userName} feel like the hero of their own adventure.`

    const userPrompt = `Write a captivating ${theme} story featuring ${userName}, a ${characterDesc}. This should read like a real children's book with natural flow and pacing.

STORY ELEMENTS TO WEAVE IN NATURALLY:
IMPORTANT: Select only 2-3 elements that naturally fit your ${theme} story. Don't force all elements into the narrative. Choose the most relevant ones:

Available elements (intelligently select 2-3 that fit organically):
- Favorite color: ${favoriteColor}
- Favorite animal: ${favoriteAnimal}  
- Interests: ${userInterests.join(', ')}
${hobbies ? `- Hobby: ${hobbies}` : ''}
${favoriteFood ? `- Favorite food: ${favoriteFood}` : ''}

SELECTION GUIDANCE:
- For adventure themes: Consider animal, hobbies, and interests that relate to exploration
- For friendship themes: Focus on interests and activities that bring people together  
- For magic themes: Choose elements that could have magical properties (colors, animals, objects)
- For mystery themes: Select elements that could be clues or helpful tools
- ONLY use elements that enhance your specific story - ignore others that don't fit naturally

COPYRIGHT AWARENESS:
If any user inputs reference copyrighted characters, brands, or content (like Godzilla, Pokemon, Disney characters, etc.), create original alternatives that capture the spirit:
- Instead of "Godzilla" → create "Gigantus the friendly giant lizard" or "Mega-Rex the gentle giant"
- Instead of "Pokemon" → create "magical creature companions" or "wonder pets"
- Instead of "Batman" → create "Night Hero" or "Cape Guardian"
- Use descriptive, original names that evoke similar feelings without copyright issues

WRITING APPROACH:
- Let the story flow naturally like a published children's book
- Don't force all elements into the beginning - spread them throughout when they naturally fit
- Some elements might appear early, others in the middle or end
- Focus on creating engaging scenes, character development, and a satisfying narrative arc
- ${userName} should feel like a real, relatable character going on a genuine adventure

STORY STRUCTURE:
- Start with an engaging opening that draws readers in
- Build the world and character naturally
- Let the adventure unfold with proper pacing
- Include moments of challenge, discovery, and triumph
- End with a satisfying conclusion that feels complete

Make this feel like a real book that ${userName} would love to read about themselves. Age-appropriate for ${userAge} years old at ${readingLevel} level.

FINAL QUALITY CHECK:
Before finishing, review the entire story for grammatical errors and fix any issues with spelling, punctuation, or sentence structure.

Write as a complete, flowing narrative without page breaks or section markers.`

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