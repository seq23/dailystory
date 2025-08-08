import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = 'base' } = await req.json();
    
    const baseTemplatePrompt = `Generate 40 story templates for children ages 3-5. Each template should be exactly 5 pages with 1 sentence per page.

CRITICAL REQUIREMENTS:
- Each sentence must be 8 words or fewer
- Each template must have a natural mix of 2, 3, and 4-word sentences
- Include at least one 2-word sentence and one 3-word sentence per template
- Use only Enhanced Level 0 vocabulary (Dolch Pre-Primer + Primer + basic Fry words)
- Include personalization placeholders: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}

SENTENCE LENGTH EXAMPLES:
- 2-word sentences: "{userName} runs.", "Ball rolls.", "Cat sleeps.", "We play.", "Sun shines."
- 3-word sentences: "{userName} likes dogs.", "Ball is {favoriteColor}.", "We play together.", "Cat runs fast.", "Food tastes good."
- 4-word sentences: "{userName} sees the cat.", "The ball rolls away.", "They play all day.", "We eat {favoriteFood} together."

STORY THEMES: Animals, toys, family activities, nature, food, colors, simple adventures, friendship, daily activities.

Return as a JavaScript array of arrays, where each inner array contains exactly 5 sentences. Format:
[
  [
    "sentence 1",
    "sentence 2", 
    "sentence 3",
    "sentence 4",
    "sentence 5"
  ],
  // ... 39 more templates
]`;

    const extensionTemplatePrompt = `Generate 5 story extension templates for children ages 3-5. Each template should be exactly 5 pages with 1 sentence per page.

CRITICAL REQUIREMENTS:
- Each sentence must be 8 words or fewer
- Each template must have a natural mix of 2, 3, and 4-word sentences
- Include at least one 2-word sentence and one 3-word sentence per template
- Use only Enhanced Level 0 vocabulary (Dolch Pre-Primer + Primer + basic Fry words)
- Include personalization placeholders: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}

SENTENCE LENGTH EXAMPLES:
- 2-word sentences: "{userName} runs.", "Ball rolls.", "Cat sleeps.", "We play.", "Sun shines."
- 3-word sentences: "{userName} likes dogs.", "Ball is {favoriteColor}.", "We play together.", "Cat runs fast.", "Food tastes good."
- 4-word sentences: "{userName} sees the cat.", "The ball rolls away.", "They play all day.", "We eat {favoriteFood} together."

STORY THEMES: More advanced adventures, problem-solving, helping others, discovery, seasonal activities.

Return as a JavaScript array of arrays, where each inner array contains exactly 5 sentences. Format:
[
  [
    "sentence 1",
    "sentence 2", 
    "sentence 3",
    "sentence 4",
    "sentence 5"
  ],
  // ... 4 more templates
]`;

    const prompt = type === 'base' ? baseTemplatePrompt : extensionTemplatePrompt;

    console.log(`Generating ${type} templates...`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in early childhood education and story creation. Generate simple, engaging stories for ages 3-5 using only basic vocabulary. Focus on creating a natural mix of sentence lengths while maintaining story quality.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log(`Generated ${type} templates successfully`);

    return new Response(JSON.stringify({ 
      content: generatedContent,
      type: type,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating templates:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate Level 0 templates'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});