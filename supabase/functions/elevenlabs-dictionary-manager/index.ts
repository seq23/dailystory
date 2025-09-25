// Clean Deploy: 2025-01-30T12:00:00Z - Force GitHub refresh
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createDynamicCorsResponse, createDynamicCorsErrorResponse, createDynamicCorsOptionsResponse } from "../_shared/corsAdvanced.js";
import { handleHealthAndCors } from "../_shared/healthCors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '600',
};

serve(async (req) => {
  // Handle CORS and health checks
  const healthResponse = handleHealthAndCors(req);
  if (healthResponse) return healthResponse;

  

  try {
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const { action, dictionaryName = 'charlotte-learning-lexicon' } = await req.json();
    
    console.log(`Dictionary manager action: ${action}`);

    if (action === 'upload') {
      // Complete Charlotte's learning lexicon for educational pronunciation
      const plsContent = `<?xml version="1.0" encoding="UTF-8"?>
<lexicon version="1.0" xmlns="http://www.w3.org/2005/01/pronunciation-lexicon" alphabet="ipa" xml:lang="en">
  <!-- Enhanced phonetic lexicon for children's reading assistance -->
  
  <!-- Common sight words with clear pronunciation -->
  <lexeme>
    <grapheme>the</grapheme>
    <phoneme>ðə</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>and</grapheme>
    <phoneme>ænd</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>said</grapheme>
    <phoneme>sɛd</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>was</grapheme>
    <phoneme>wʌz</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>you</grapheme>
    <phoneme>ju</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>they</grapheme>
    <phoneme>ðeɪ</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>there</grapheme>
    <phoneme>ðɛr</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>their</grapheme>
    <phoneme>ðɛr</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>where</grapheme>
    <phoneme>wɛr</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>were</grapheme>
    <phoneme>wɜr</phoneme>
  </lexeme>
  
  <!-- Common reading words with clear syllable breaks -->
  <lexeme>
    <grapheme>beautiful</grapheme>
    <phoneme>ˈbjutɪfəl</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>through</grapheme>
    <phoneme>θru</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>enough</grapheme>
    <phoneme>ɪˈnʌf</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>laugh</grapheme>
    <phoneme>læf</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>cough</grapheme>
    <phoneme>kɔf</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>rough</grapheme>
    <phoneme>rʌf</phoneme>
  </lexeme>
  
  <!-- Silent letters clarification -->
  <lexeme>
    <grapheme>knight</grapheme>
    <phoneme>naɪt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>island</grapheme>
    <phoneme>ˈaɪlənd</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>castle</grapheme>
    <phoneme>ˈkæsəl</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>listen</grapheme>
    <phoneme>ˈlɪsən</phoneme>
  </lexeme>
  
  <!-- Vowel sound clarifications -->
  <lexeme>
    <grapheme>bread</grapheme>
    <phoneme>brɛd</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>head</grapheme>
    <phoneme>hɛd</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>great</grapheme>
    <phoneme>greɪt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>break</grapheme>
    <phoneme>breɪk</phoneme>
  </lexeme>
  
  <!-- Compound words with clear pronunciation -->
  <lexeme>
    <grapheme>everyone</grapheme>
    <phoneme>ˈɛvriˌwʌn</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>something</grapheme>
    <phoneme>ˈsʌmθɪŋ</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>anything</grapheme>
    <phoneme>ˈɛniθɪŋ</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>everything</grapheme>
    <phoneme>ˈɛvriθɪŋ</phoneme>
  </lexeme>
  
  <!-- Common irregular verbs -->
  <lexeme>
    <grapheme>caught</grapheme>
    <phoneme>kɔt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>taught</grapheme>
    <phoneme>tɔt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>bought</grapheme>
    <phoneme>bɔt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>thought</grapheme>
    <phoneme>θɔt</phoneme>
  </lexeme>
  
  <!-- Numbers with clear pronunciation -->
  <lexeme>
    <grapheme>eight</grapheme>
    <phoneme>eɪt</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>forty</grapheme>
    <phoneme>ˈfɔrti</phoneme>
  </lexeme>
  
  <lexeme>
    <grapheme>ninety</grapheme>
    <phoneme>ˈnaɪnti</phoneme>
  </lexeme>
</lexicon>`;

      // Create form data for file upload
      const formData = new FormData();
      const blob = new Blob([plsContent], { type: 'application/xml' });
      formData.append('file', blob, `${dictionaryName}.pls`);
      formData.append('name', dictionaryName);
      formData.append('description', 'Charlotte\'s learning lexicon for educational pronunciation');

      const uploadResponse = await fetch('https://api.elevenlabs.io/v1/pronunciation-dictionaries/add-from-file', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('ElevenLabs dictionary upload failed:', errorText);
        throw new Error(`Dictionary upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Dictionary uploaded successfully:', uploadResult);

      return createDynamicCorsResponse({ 
        success: true, 
        dictionaryId: uploadResult.id,
        message: 'Dictionary uploaded successfully'
      }, req, 200);

    } else if (action === 'list') {
      // List existing dictionaries
      const listResponse = await fetch('https://api.elevenlabs.io/v1/pronunciation-dictionaries', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
      });

      if (!listResponse.ok) {
        throw new Error(`Failed to list dictionaries: ${listResponse.status}`);
      }

      const dictionaries = await listResponse.json();
      const charlotteDictionary = dictionaries.pronunciation_dictionaries?.find(
        (dict: any) => dict.name === dictionaryName
      );

      return createCorsResponse({ 
        success: true, 
        dictionaries: dictionaries.pronunciation_dictionaries || [],
        charlotteDictionaryId: charlotteDictionary?.id || null
      });

    } else if (action === 'delete') {
      const { dictionaryId } = await req.json();
      
      const deleteResponse = await fetch(`https://api.elevenlabs.io/v1/pronunciation-dictionaries/${dictionaryId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete dictionary: ${deleteResponse.status}`);
      }

      return createCorsResponse({ 
        success: true, 
        message: 'Dictionary deleted successfully'
      });

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Dictionary manager error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createDynamicCorsErrorResponse(errorMessage, req, 500);
  }
});