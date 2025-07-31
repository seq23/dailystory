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

    // Create detailed prompt based on reading level and author style
    const systemPrompt = `You are a professional children's book author specializing in writing stories in the style of ${authorStyle}. 

Reading Level: ${readingLevel}
Target Age: ${specs.ageRange}
Author Style: ${authorStyle}
Theme: ${theme}
Child's Interests: ${interests.join(', ')}

WRITING SPECIFICATIONS:
- Maximum words per page: ${specs.maxWordsPerPage}
- Total word limit: ${specs.wordLimit}
- Sentence structure: ${specs.sentenceStructure}
- Vocabulary level: ${specs.vocabulary}
- Page count target: ${specs.pageCount}

AUTHOR STYLE GUIDELINES:
${readingLevel === 'beginner' ? 
  "Write like Dr. Seuss or Eric Carle: Use simple, repetitive patterns, rhyming when possible, and vivid imagery. Focus on basic concepts and emotions." :
readingLevel === 'elementary' ? 
  "Write like Junie B. Jones or Magic Tree House: Use conversational tone, relatable situations, and gentle humor. Include dialogue and character emotions." :
readingLevel === 'intermediate' ?
  "Write like Roald Dahl or Judy Blume: Create engaging characters with distinct personalities, include mild challenges or conflicts, and use descriptive language." :
  "Write like J.K. Rowling or Rick Riordan: Develop complex characters, intricate plots, rich world-building, and sophisticated themes while remaining age-appropriate."
}

Create a complete story that is engaging, educational, and perfectly suited for the reading level. The story should incorporate the child's interests and follow the theme.

${config.userName ? `The child's name is ${config.userName}. You can include their name in the story or create characters that they can relate to.` : ''}

Respond with a JSON object containing:
{
  "title": "An engaging title that reflects the theme",
  "content": "The complete story text following all specifications"
}`

    const characterDescription = config.characterDescription || '';
    const userPrompt = `Please write a ${theme} story for a ${config.age}-year-old child named ${config.userName} who is interested in ${interests.join(', ')}. The main character should be ${config.userName} ${characterDescription}. Make ${config.userName} the hero of the story. The story should flow like a real book with logical progression, never mention page numbers in the text, and make it exactly right for their reading level. Incorporate their interests naturally into the story and make sure ${config.userName} is actively involved in the adventure.`

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
        max_tokens: readingLevel === 'beginner' ? 200 : readingLevel === 'elementary' ? 500 : readingLevel === 'intermediate' ? 1000 : 2000,
        temperature: 0.7
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

    // Try to parse as JSON, fall back to treating as plain text
    let storyResult
    try {
      storyResult = JSON.parse(storyText)
    } catch {
      // If not JSON, create a simple structure
      storyResult = {
        title: `A ${theme} Adventure`,
        content: storyText
      }
    }

    return new Response(JSON.stringify(storyResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Story generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})