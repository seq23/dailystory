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

  

  let userLanguage = 'en'; // Default fallback
  try {
    const { word, userLevel = 'easy', userLanguage: reqUserLanguage = 'en' } = await req.json();
    userLanguage = reqUserLanguage; // Store for error handling

    if (!word) {
      throw new Error('Word is required');
    }

    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
    const cacheKey = `${cleanWord}-${userLanguage}-${userLevel}`;
    
    // Check cache first
    if (wordCache.has(cacheKey)) {
      const cachedData = wordCache.get(cacheKey)!;
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Language-specific prompts
    const languageMap: { [key: string]: string } = {
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish', 
      'zh': 'Chinese',
      'hi': 'Hindi',
      'pt': 'Portuguese',
      'ar': 'Arabic'
    };

    const targetLanguage = languageMap[userLanguage] || 'English';
    const isEnglish = userLanguage === 'en';

    // Generate comprehensive word data using OpenAI
    const prompt = isEnglish 
      ? `Provide comprehensive information for the word "${cleanWord}" suitable for a ${userLevel} level reader. Return ONLY a JSON object with this exact structure:
{
  "word": "${cleanWord}",
  "definition": "child-friendly definition in simple terms",
  "phonetic": "phonetic pronunciation using standard dictionary format",
  "sampleSentence": "age-appropriate example sentence using the word",
  "difficulty": "easy/medium/hard based on word complexity",
  "partOfSpeech": "noun/verb/adjective/etc"
}

Make the definition simple and clear for children. The sample sentence should be engaging and relatable to kids. Ensure the phonetic pronunciation follows standard dictionary format like /wɜːrd/.`
      : `Provide comprehensive information for the word "${cleanWord}" suitable for a ${userLevel} level reader. Return ONLY a JSON object with this exact structure:
{
  "word": "${cleanWord}",
  "definition": "child-friendly definition in simple terms IN ${targetLanguage}",
  "phonetic": "phonetic pronunciation using standard dictionary format (always in English)",
  "sampleSentence": "age-appropriate example sentence using the word IN ${targetLanguage}",
  "difficulty": "easy/medium/hard based on word complexity",
  "partOfSpeech": "noun/verb/adjective/etc IN ${targetLanguage}"
}

IMPORTANT: The definition and sampleSentence must be in ${targetLanguage}, but the phonetic pronunciation must always be in English. Make the definition simple and clear for children. The sample sentence should be engaging and relatable to kids.`;

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
      // Fallback word data based on user language
      const fallbackLanguage = userLanguage === 'en' ? 'English' : (languageMap[userLanguage] || 'English');
      const fallbackDefinition = userLanguage === 'en' 
        ? `${cleanWord} is an important word.`
        : userLanguage === 'fr' ? `${cleanWord} est un mot important.`
        : userLanguage === 'es' ? `${cleanWord} es una palabra importante.`
        : userLanguage === 'zh' ? `${cleanWord} 是一个重要的词。`
        : userLanguage === 'hi' ? `${cleanWord} एक महत्वपूर्ण शब्द है।`
        : userLanguage === 'ar' ? `${cleanWord} كلمة مهمة.`
        : userLanguage === 'pt' ? `${cleanWord} é uma palavra importante.`
        : `${cleanWord} is an important word.`;
      
      const fallbackSentence = userLanguage === 'en' 
        ? `The word "${cleanWord}" is used in sentences.`
        : userLanguage === 'fr' ? `Le mot "${cleanWord}" est utilisé dans les phrases.`
        : userLanguage === 'es' ? `La palabra "${cleanWord}" se usa en oraciones.`
        : userLanguage === 'zh' ? `单词"${cleanWord}"在句子中使用。`
        : userLanguage === 'hi' ? `शब्द "${cleanWord}" वाक्यों में उपयोग किया जाता है।`
        : userLanguage === 'ar' ? `تُستخدم كلمة "${cleanWord}" في الجمل.`
        : userLanguage === 'pt' ? `A palavra "${cleanWord}" é usada em frases.`
        : `The word "${cleanWord}" is used in sentences.`;

      wordData = {
        word: cleanWord,
        definition: fallbackDefinition,
        phonetic: `/${cleanWord}/`,
        sampleSentence: fallbackSentence,
        difficulty: userLevel as 'easy' | 'medium' | 'hard',
        partOfSpeech: 'word'
      };
    }

    // Cache the result
    wordCache.set(cacheKey, wordData);

    console.log(`Generated dictionary entry for: ${cleanWord} (${userLanguage})`);

    return new Response(JSON.stringify(wordData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in word-dictionary function:', error);
    
    // Enhanced fallback based on language (userLanguage is available from scope)
    const fallbackDefinition = userLanguage === 'en' 
      ? 'Unable to get definition'
      : userLanguage === 'fr' ? 'Impossible d\'obtenir la définition'
      : userLanguage === 'es' ? 'No se puede obtener la definición'
      : userLanguage === 'zh' ? '无法获取定义'
      : userLanguage === 'hi' ? 'परिभाषा प्राप्त करने में असमर्थ'
      : userLanguage === 'ar' ? 'غير قادر على الحصول على التعريف'
      : userLanguage === 'pt' ? 'Não é possível obter a definição'
      : 'Unable to get definition';

    return new Response(
      JSON.stringify({ 
        error: error.message,
        word: '',
        definition: fallbackDefinition,
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