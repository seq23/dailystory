import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface WordData {
  word: string;
  definition: string;
  phonetic: string;
  sampleSentence: string;
  difficulty: 'easy' | 'medium' | 'hard';
  partOfSpeech: string;
}

// Cache for word definitions to avoid repeated API calls
const wordCache = new Map<string, WordData>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { word, userLevel = 'easy' } = await req.json();

    if (!word) {
      throw new Error('Word is required');
    }

    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
    
    // Check cache first
    if (wordCache.has(cleanWord)) {
      const cachedData = wordCache.get(cleanWord)!;
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate comprehensive word data using OpenAI
    const prompt = `Provide comprehensive information for the word "${cleanWord}" suitable for a ${userLevel} level reader. Return ONLY a JSON object with this exact structure:
{
  "word": "${cleanWord}",
  "definition": "child-friendly definition in simple terms",
  "phonetic": "phonetic pronunciation using standard dictionary format",
  "sampleSentence": "age-appropriate example sentence using the word",
  "difficulty": "easy/medium/hard based on word complexity",
  "partOfSpeech": "noun/verb/adjective/etc"
}

Make the definition simple and clear for children. The sample sentence should be engaging and relatable to kids. Ensure the phonetic pronunciation follows standard dictionary format like /wɜːrd/.`;

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
            content: 'You are a children\'s dictionary assistant. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let wordData: WordData;
    try {
      wordData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      // Fallback word data
      wordData = {
        word: cleanWord,
        definition: `${cleanWord} is an important word.`,
        phonetic: `/${cleanWord}/`,
        sampleSentence: `The word "${cleanWord}" is used in sentences.`,
        difficulty: userLevel as 'easy' | 'medium' | 'hard',
        partOfSpeech: 'word'
      };
    }

    // Cache the result
    wordCache.set(cleanWord, wordData);

    console.log(`Generated dictionary entry for: ${cleanWord}`);

    return new Response(JSON.stringify(wordData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in word-dictionary function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        word: '',
        definition: 'Unable to get definition',
        phonetic: '',
        sampleSentence: '',
        difficulty: 'easy',
        partOfSpeech: 'word'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});