import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
  'Vary': 'Origin, Access-Control-Request-Headers',
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

// Enhanced cache with educational word pre-population
const wordCache = new Map<string, WordData>();

// Educational word lists for pre-caching (379 core words)
const DOLCH_PRE_PRIMER = ['a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you'];

const DOLCH_PRIMER = ['all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came', 'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like', 'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran', 'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this', 'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will', 'with', 'yes'];

const DOLCH_FIRST_GRADE = ['after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some', 'stop', 'take', 'thank', 'them', 'think', 'walk', 'were', 'when'];

const DOLCH_SECOND_GRADE = ['always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold', 'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your'];

const FRY_FIRST_100 = ['about', 'add', 'air', 'almost', 'along', 'also', 'although', 'America', 'another', 'answer', 'appear', 'area', 'back', 'ball', 'base', 'become', 'bed', 'began', 'begin', 'being', 'below', 'between', 'boat', 'book', 'box', 'boy', 'bring', 'build', 'building', 'business', 'carry', 'case', 'cat', 'catch', 'cause', 'change', 'check', 'child', 'children', 'city', 'class', 'close', 'color', 'company', 'complete', 'country', 'course', 'cover', 'create', 'cut', 'day', 'deep', 'difference', 'different', 'door', 'draw', 'during', 'each', 'early', 'earth', 'easy', 'end', 'enough', 'even', 'ever', 'example', 'eye', 'face', 'fact', 'family', 'far', 'farm', 'father', 'feel', 'few', 'field'];

const FRY_SECOND_100 = ['figure', 'fill', 'final', 'fire', 'fish', 'food', 'form', 'friend', 'front', 'full', 'game', 'girl', 'government', 'great', 'ground', 'group', 'grow', 'half', 'hand', 'hard', 'head', 'hear', 'heat', 'high', 'hold', 'home', 'horse', 'hot', 'hour', 'house', 'however', 'hundred', 'idea', 'if', 'important', 'increase', 'inside', 'island', 'job', 'keep', 'kind', 'land', 'large', 'last', 'later', 'learn', 'leave', 'left', 'letter', 'life', 'light', 'line', 'list', 'live', 'local', 'long', 'lot', 'low', 'machine', 'man', 'meet', 'member', 'might', 'mile', 'mind', 'miss', 'money', 'month', 'morning', 'most', 'mother', 'move', 'music', 'name', 'near', 'need', 'never', 'next', 'night', 'north', 'nothing', 'number', 'object', 'often', 'order', 'part', 'people', 'person', 'picture', 'place', 'point', 'problem', 'program', 'question', 'real', 'reason', 'remember', 'right', 'room', 'school', 'sea', 'second', 'seem', 'sentence', 'serve', 'several', 'short', 'show', 'side', 'small', 'something', 'sound', 'special', 'start', 'state', 'story', 'student', 'study', 'system', 'table', 'today', 'together', 'turn', 'understand', 'until', 'voice', 'water', 'way', 'week', 'white', 'whole', 'word', 'world', 'write', 'year', 'young'];

// Combined educational words (379 unique words)
const EDUCATIONAL_WORDS = [...new Set([...DOLCH_PRE_PRIMER, ...DOLCH_PRIMER, ...DOLCH_FIRST_GRADE, ...DOLCH_SECOND_GRADE, ...FRY_FIRST_100, ...FRY_SECOND_100])];

// Pre-cache educational words on startup
let cacheInitialized = false;
const initEducationalCache = async () => {
  if (cacheInitialized) return;
  
  console.log('🎓 Initializing educational word cache with 379 core words...');
  
  for (const word of EDUCATIONAL_WORDS) {
    const cacheKey = `${word}-en-easy`;
    
    // Skip if already cached
    if (wordCache.has(cacheKey)) continue;
    
    // Pre-populate with basic educational definitions
    const wordData: WordData = {
      word: word,
      definition: getBasicDefinition(word),
      phonetic: `/${word}/`,
      sampleSentence: getBasicSentence(word),
      difficulty: getWordDifficulty(word),
      partOfSpeech: 'word'
    };
    
    wordCache.set(cacheKey, wordData);
  }
  
  cacheInitialized = true;
  console.log(`✅ Educational cache initialized with ${wordCache.size} words`);
};

// Helper functions for basic educational content
const getBasicDefinition = (word: string): string => {
  const basicDefs: { [key: string]: string } = {
    'the': 'A word used before nouns',
    'a': 'One; any',
    'and': 'Also; plus',
    'is': 'To be',
    'in': 'Inside',
    'it': 'This thing',
    'you': 'The person I am talking to',
    'that': 'This one over there',
    'he': 'A boy or man',
    'was': 'Used to be',
    'for': 'Because of; to get',
    'on': 'Sitting on top of',
    'are': 'More than one is',
    'as': 'Like; when',
    'with': 'Together',
    'his': 'Belonging to him',
    'they': 'Those people',
    'at': 'In this place',
    'be': 'To exist',
    'this': 'The thing right here',
    'have': 'To own',
    'from': 'Starting at',
    'or': 'One choice or another',
    'one': 'The number 1',
    'had': 'Used to have',
    'by': 'Next to',
    'but': 'However',
    'what': 'Which thing',
    'all': 'Every single one',
    'were': 'Used to be (more than one)',
    'we': 'You and me together',
    'when': 'At what time',
    'your': 'Belonging to you',
    'can': 'Able to do',
    'said': 'Spoke words',
    'there': 'In that place',
    'each': 'Every one',
    'which': 'What one',
    'do': 'To perform an action',
    'how': 'In what way',
    'their': 'Belonging to them',
    'if': 'In case that',
    'up': 'Higher; toward the sky',
    'out': 'Away from inside',
    'many': 'A lot of',
    'then': 'After that',
    'them': 'Those people (object)',
    'these': 'The things right here',
    'so': 'Very; therefore',
    'some': 'A few',
    'her': 'Belonging to her',
    'would': 'Will; used to',
    'make': 'To create',
    'like': 'Similar to; enjoy',
    'into': 'Going inside',
    'time': 'Minutes and hours',
    'has': 'Owns',
    'look': 'To see',
    'two': 'The number 2',
    'more': 'Extra',
    'write': 'To make letters and words',
    'go': 'To move',
    'see': 'To look at',
    'no': 'Not yes',
    'way': 'How to do something',
    'could': 'Was able to',
    'people': 'Men, women, and children',
    'my': 'Belonging to me',
    'than': 'More than',
    'first': 'Before all others',
    'been': 'Was',
    'call': 'To shout; to name',
    'who': 'Which person',
    'its': 'Belonging to it',
    'now': 'Right at this time',
    'find': 'To look for and discover',
    'long': 'Not short',
    'down': 'Lower; toward the ground',
    'day': 'Time when the sun shines',
    'did': 'Performed an action',
    'get': 'To receive',
    'come': 'To move toward',
    'made': 'Created',
    'may': 'Might; allowed to',
    'part': 'A piece of something'
  };
  
  return basicDefs[word] || `${word} is an important word to learn.`;
};

const getBasicSentence = (word: string): string => {
  const basicSentences: { [key: string]: string } = {
    'the': 'The cat is sleeping.',
    'a': 'I have a book.',
    'and': 'I like apples and oranges.',
    'is': 'She is happy.',
    'in': 'The toy is in the box.',
    'it': 'It is raining outside.',
    'you': 'You are my friend.',
    'that': 'That is a big dog.',
    'he': 'He is playing.',
    'was': 'Yesterday was sunny.',
    'for': 'This gift is for you.',
    'on': 'The book is on the table.',
    'are': 'We are going home.',
    'as': 'She runs as fast as the wind.',
    'with': 'I play with my friends.',
    'his': 'His backpack is blue.',
    'they': 'They are having fun.',
    'at': 'Meet me at the park.',
    'be': 'I want to be a teacher.',
    'this': 'This is my favorite toy.',
    'have': 'I have a pet cat.',
    'from': 'This letter is from grandma.',
    'or': 'Do you want cake or cookies?',
    'one': 'I have one sister.',
    'had': 'She had a great day.',
    'by': 'The river runs by our house.',
    'but': 'I tried, but it was hard.',
    'what': 'What is your name?',
    'all': 'All the children are here.',
    'were': 'The cookies were delicious.',
    'we': 'We are best friends.',
    'when': 'When will you visit?',
    'your': 'Your smile makes me happy.',
    'can': 'I can ride a bike.',
    'said': 'She said hello to me.',
    'there': 'Put the ball over there.',
    'each': 'Each child gets a turn.',
    'which': 'Which color do you like?',
    'do': 'What do you want to do?',
    'how': 'How did you do that?',
    'their': 'Their house is pretty.',
    'if': 'If it rains, we\'ll stay inside.',
    'up': 'The balloon floated up high.',
    'out': 'Come out and play.',
    'many': 'Many birds live in the tree.',
    'then': 'First we eat, then we play.',
    'them': 'I gave them some cookies.',
    'these': 'These flowers smell nice.',
    'so': 'The puppy is so cute.',
    'some': 'May I have some water?',
    'her': 'Her dress is beautiful.',
    'would': 'Would you like to play?',
    'make': 'Let\'s make a sandcastle.',
    'like': 'I like to read books.',
    'into': 'The cat jumped into the box.',
    'time': 'What time is it?',
    'has': 'She has a new bike.',
    'two': 'I have two eyes.',
    'more': 'Can I have more juice?',
    'go': 'Let\'s go to the park.',
    'no': 'No, thank you.',
    'way': 'This is the way home.',
    'could': 'I could help you.',
    'people': 'Many people came to the party.',
    'my': 'This is my favorite book.',
    'than': 'I am taller than my brother.',
    'first': 'I was first in line.',
    'been': 'I have been to the zoo.',
    'call': 'Please call me later.',
    'who': 'Who is at the door?',
    'now': 'We need to go now.',
    'find': 'Can you find my keys?',
    'long': 'That is a very long train.',
    'down': 'The ball rolled down the hill.',
    'day': 'Today is a beautiful day.',
    'did': 'Did you have fun?',
    'get': 'I need to get my coat.',
    'come': 'Please come here.',
    'made': 'Mom made cookies.',
    'may': 'May I have a cookie?',
    'part': 'This is part of the puzzle.'
  };
  
  return basicSentences[word] || `The word "${word}" is used in sentences.`;
};

const getWordDifficulty = (word: string): 'easy' | 'medium' | 'hard' => {
  if (DOLCH_PRE_PRIMER.includes(word) || DOLCH_PRIMER.includes(word)) return 'easy';
  if (DOLCH_FIRST_GRADE.includes(word) || DOLCH_SECOND_GRADE.includes(word)) return 'easy';
  if (FRY_FIRST_100.includes(word)) return 'medium';
  return 'hard';
};

serve(async (req) => {
  // Initialize educational cache on first request
  await initEducationalCache();
  
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  let userLanguage = 'en'; // Default fallback
  try {
    const { word, userLevel = 'easy', userLanguage: reqUserLanguage = 'en' } = await req.json();
    userLanguage = reqUserLanguage; // Store for error handling

    if (!word) {
      throw new Error('Word is required');
    }

    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '').trim();
    const cacheKey = `${cleanWord}-${userLanguage}-${userLevel}`;
    
    // Check enhanced cache first (now includes 379 educational words pre-cached)
    if (wordCache.has(cacheKey)) {
      const cachedData = wordCache.get(cacheKey)!;
      console.log(`📚 Cache hit for educational word: ${cleanWord}`);
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

    // Cache the result for future requests
    wordCache.set(cacheKey, wordData);

    console.log(`Generated dictionary entry for: ${cleanWord} (${userLanguage}) - Total cache size: ${wordCache.size}`);

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
        error: error instanceof Error ? error.message : String(error),
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