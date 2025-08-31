// Streamlined Story Generation Handler
// Processes pre-processed bundles from frontend services
// Focuses ONLY on AI generation with minimal processing

interface StreamlinedBundle {
  storyContent: string;
  authorVoice: {
    voice: {
      name: string;
      styleSummary: string;
      characteristics: string[];
    };
    selectedPatterns: {
      opening: string;
      transitions: string[];
      closing: string;
    };
  };
  userVocabulary: string[];
  systemSettings: {
    gradeLevel: number;
    complianceTarget: number;
  };
}

interface StreamlinedConfig {
  sessionType: 'free' | 'premium';
  pageNumber: number;
  existingStory?: string;
}

export async function handleStreamlinedGeneration(requestBody: any) {
  const { bundle, config }: { bundle: StreamlinedBundle; config: StreamlinedConfig } = requestBody;
  
  console.log('🎯 STREAMLINED: Processing pre-processed bundle');
  
  try {
    // Build AI prompt from pre-processed content
    const aiPrompt = buildStreamlinedPrompt(bundle, config);
    
    // Generate story with OpenAI
    const storyText = await generateWithOpenAI(aiPrompt, bundle.systemSettings.gradeLevel);
    
    // Parse into pages (simplified)
    const pages = parseIntoPages(storyText, bundle.systemSettings.gradeLevel);
    
    // Return streamlined response
    return new Response(JSON.stringify({
      success: true,
      story: storyText,
      pages: pages,
      vocabCompliance: 1.0, // Frontend handles validation
      metadata: {
        authorVoice: bundle.authorVoice.voice.name,
        userVocabularyCount: bundle.userVocabulary.length,
        gradeLevel: bundle.systemSettings.gradeLevel,
        processingMode: 'streamlined'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ STREAMLINED: Generation failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Story generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function buildStreamlinedPrompt(bundle: StreamlinedBundle, config: StreamlinedConfig): {
  systemPrompt: string;
  userPrompt: string;
} {
  // Simplified system prompt - no vocabulary validation needed
  const systemPrompt = `You are a children's story writer using the "${bundle.authorVoice.voice.name}" voice.

STYLE: ${bundle.authorVoice.voice.styleSummary}
CHARACTERISTICS: ${bundle.authorVoice.voice.characteristics.join(', ')}

STORY PATTERNS:
- Opening style: ${bundle.authorVoice.selectedPatterns.opening}
- Transition examples: ${bundle.authorVoice.selectedPatterns.transitions.slice(0, 2).join(' / ')}
- Closing style: ${bundle.authorVoice.selectedPatterns.closing}

Generate ${config.sessionType === 'free' ? '6 pages maximum' : 'continuing story pages'}.
Write clean narrative without page numbers or formatting.
${bundle.userVocabulary.length > 0 ? `INCLUDE these priority words naturally: ${bundle.userVocabulary.join(', ')}` : ''}`;

  // Simplified user prompt - content already processed
  const userPrompt = bundle.storyContent;

  return { systemPrompt, userPrompt };
}

async function generateWithOpenAI(prompt: { systemPrompt: string; userPrompt: string }, gradeLevel: number): Promise<string> {
  const maxTokens = getTokensForGrade(gradeLevel);
  
  console.log('🤖 STREAMLINED: Calling OpenAI', { gradeLevel, maxTokens });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt.systemPrompt },
        { role: 'user', content: prompt.userPrompt }
      ],
      max_completion_tokens: maxTokens
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const storyText = data.choices[0].message.content;

  if (!storyText?.trim()) {
    throw new Error('Empty story generated');
  }

  return cleanStoryText(storyText);
}

function cleanStoryText(text: string): string {
  return text
    .replace(/\*\*.*?\*\*/g, '') // Remove bold formatting
    .replace(/^(Page|Chapter|\d+\.)\s*[:\-]?\s*/gmi, '') // Remove page markers
    .replace(/\n\n+/g, '\n\n') // Normalize spacing
    .trim();
}

function parseIntoPages(storyText: string, gradeLevel: number): string[] {
  const targetWordsPerPage = gradeLevel === 0 ? 15 : gradeLevel <= 2 ? 30 : 60;
  
  // Simple paragraph-based splitting
  const paragraphs = storyText.split(/\n\n+/).filter(p => p.trim());
  const pages: string[] = [];
  
  let currentPage = '';
  let currentWordCount = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.split(/\s+/).length;
    
    if (currentWordCount + paragraphWords > targetWordsPerPage && currentPage) {
      pages.push(currentPage.trim());
      currentPage = paragraph;
      currentWordCount = paragraphWords;
    } else {
      currentPage += (currentPage ? '\n\n' : '') + paragraph;
      currentWordCount += paragraphWords;
    }
  }
  
  if (currentPage.trim()) {
    pages.push(currentPage.trim());
  }
  
  // Ensure we have at least one page
  return pages.length > 0 ? pages : [storyText];
}

function getTokensForGrade(gradeLevel: number): number {
  const tokenMap: Record<number, number> = {
    0: 400,  // PreK
    1: 600,  // 1st
    2: 800,  // 2nd  
    3: 1000, // 4th
    4: 1200  // 6th+
  };
  return tokenMap[gradeLevel] || 800;
}

// Export for use in main handler
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};