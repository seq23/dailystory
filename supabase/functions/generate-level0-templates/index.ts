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
    
    const baseTemplatePrompt = `Write joyful, easy-to-read stories for pre-readers. Generate 100 story templates for children ages 3-5. Each template should be exactly 6 pages with 1 sentence per page.

Include {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {hobbies}, {friend}, {object}, {setting}, or {specialRequest} as clear, distinct story elements used throughout. Allow "I" and "the" pronouns. Avoid he/she/they/it pronouns.

CRITICAL REQUIREMENTS:
- Exactly 6 pages, one complete sentence per page
- Mix sentence lengths: 2, 3, 4, 5, and 6 words per sentence across the template
- Use mostly 2-4 letter words from Enhanced Level 0 vocabulary (a, am, at, be, do, go, he, i, in, is, it, me, my, no, on, so, to, up, we, all, and, are, ate, big, but, can, did, eat, for, get, had, new, not, now, one, our, out, ran, red, run, saw, say, she, the, too, two, was, who, yes, you, away, blue, came, come, down, find, four, good, have, help, here, into, jump, like, look, make, must, play, ride, said, soon, that, they, this, want, well, went, what, will, with)
- Allow essential longer words: funny, little, where, yellow, black, brown, please, pretty, there, under, white, three, been, called, water, time, words, each, which, would, doctor, dentist

SENTENCE LENGTH EXAMPLES:
- 2 words: "{userName} runs." / "I go." / "Cat sleeps." / "Ball bounces."  
- 3 words: "{userName} will run." / "I like cake." / "The cat runs." / "Ball is {favoriteColor}."
- 4 words: "{userName} and {friend} play." / "The big cat runs." / "I can see water."
- 5 words: "{userName} and {friend} will play." / "I can see the dog." / "The big {favoriteColor} ball bounces."
- 6 words: "{userName} and {friend} will play today." / "The big red cat runs fast." / "I can see the pretty flowers."

NATURAL PRONOUN PATTERNS:
- Use "I" statements: "I will go." / "I like cake."  
- Use "the" with objects: "The ball bounces." / "The cat runs."
- Use multi-character constructions: "{userName} and {friend} play."
- Use future tense to avoid awkward "-s" endings: "{userName} will run." instead of "{userName} runs."
- Avoid he/she/they/it - use names, "I", or "the" + object instead

STORY DISTRIBUTION (100 templates):
- Daily Life (20): Morning routines, meals, bedtime, home activities
- Healthcare (10): Doctor visits, dentist, staying healthy  
- Educational (15): School, library, learning, books
- Play & Recreation (15): Playground, sports, games, toys
- Community (10): Shopping, helpers, neighborhood
- Transportation (8): Cars, buses, walking, travel
- Special Occasions (12): Birthdays, holidays, celebrations
- Nature & Animals (10): Outdoors, pets, weather, gardens

TONE & STYLE:
- Keep content positive, warm, age-appropriate, and engaging for ages 3–5
- Make stories fun to read aloud with natural rhythm and flow
- Design for picture book format with visual engagement in mind
- Use natural language patterns that flow well when read aloud

Return as a JavaScript array of arrays, where each inner array contains exactly 6 sentences. Format:
[
  [
    "sentence 1",
    "sentence 2", 
    "sentence 3",
    "sentence 4",
    "sentence 5",
    "sentence 6"
  ],
  // ... 99 more templates
]`;

    const extensionTemplatePrompt = `Generate 10 story extension templates for children ages 3-5. Each template should be exactly 6 pages with 1 sentence per page.

CRITICAL REQUIREMENTS:
- Mix sentence lengths: 2, 3, 4, 5, and 6 words per sentence across each template
- Use mostly 2-4 letter words from Enhanced Level 0 vocabulary 
- Allow "I" and "the" pronouns, avoid he/she/they/it
- Include personalization placeholders: {userName}, {favoriteColor}, {favoriteAnimal}, {favoriteFood}, {friend}, {object}, {setting}

SENTENCE LENGTH EXAMPLES:
- 2 words: "{userName} runs." / "I go." / "Ball bounces."
- 3 words: "{userName} will run." / "I like cake." / "The cat runs."
- 4 words: "{userName} and {friend} play." / "The big cat runs."
- 5 words: "{userName} and {friend} will play." / "I can see the dog."
- 6 words: "{userName} and {friend} will play today." / "The big red cat runs fast."

NATURAL PATTERNS:
- Use future tense: "{userName} will go." instead of "{userName} goes."
- Multi-character: "{userName} and {friend} play."
- "I" statements: "I will help." / "I like this."
- Object focus: "The ball bounces high." / "The {favoriteColor} car goes."

STORY THEMES: Advanced adventures, problem-solving, helping others, discovery, seasonal activities, friendship.

Return as a JavaScript array of arrays, where each inner array contains exactly 6 sentences. Format:
[
  [
    "sentence 1",
    "sentence 2", 
    "sentence 3",
    "sentence 4",
    "sentence 5",
    "sentence 6"
  ],
  // ... 9 more templates
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