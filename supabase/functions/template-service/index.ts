import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Import the single source of truth for templates
// Import new template system files
import { LEVEL_0_TEMPLATES, getLevel0Template, getLevel0TemplateCount } from '../../src/constants/newFallbackTemplates/level0Templates.ts';
import { VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES, getVocabularyCompliantLevel0Template, getVocabularyCompliantLevel0TemplateCount } from '../../src/constants/newFallbackTemplates/level0VocabCompliant.ts';
import { LEVEL_0_EXTENSIONS, getLevel0Extension, getLevel0ExtensionCount } from '../../src/constants/newFallbackTemplates/level0Extensions.ts';

// Simple user info interface
interface UserInfo {
  name?: string;
  avatar?: any;
  favoriteColor?: string;
  favoriteAnimal?: string;
  favoriteFood?: string;
  hobbies?: string;
  specialRequest?: string;
  difficultyLevel?: string;
}

// Placeholder resolution functions
function resolveCanonicalPlaceholders(text: string, userInfo: UserInfo): string {
  let resolved = text;
  
  resolved = resolved.replace(/\{userName\}/g, userInfo.name || 'the child');
  resolved = resolved.replace(/\{favoriteColor\}/g, userInfo.favoriteColor || 'blue');
  resolved = resolved.replace(/\{favoriteAnimal\}/g, userInfo.favoriteAnimal || 'puppy');
  resolved = resolved.replace(/\{favoriteFood\}/g, userInfo.favoriteFood || 'cookies');
  resolved = resolved.replace(/\{hobbies\}/g, userInfo.hobbies || 'playing outside');
  resolved = resolved.replace(/\{specialRequest\}/g, userInfo.specialRequest || 'adventure');
  
  return resolved;
}

function validateAndFixGrammar(text: string): string {
  let fixedText = text;
  
  // Fix incorrect articles with plural nouns
  fixedText = fixedText.replace(/\b(a|an)\s+([a-zA-Z]*s\b|children|feet|geese|men|women|teeth|mice|people|sheep|deer|fish)/gi, 
    (match, article, noun) => noun);
  
  // Fix double spaces
  fixedText = fixedText.replace(/\s+/g, ' ');
  
  // Remove malformed template variables
  fixedText = fixedText.replace(/\{[^}]*\}/g, '');
  
  return fixedText.trim();
}

function processStoryTemplate(template: string[], userInfo: UserInfo, pageCount: number = 5): string[] {
  const pages: string[] = [];

  // Process each page in the template
  const pagesToUse = template.slice(0, Math.min(pageCount, template.length));
  
  for (const page of pagesToUse) {
    let processedPage = page;
    
    // Apply placeholder resolution
    processedPage = resolveCanonicalPlaceholders(processedPage, userInfo);
    
    // Apply grammar fixes
    processedPage = validateAndFixGrammar(processedPage);
    
    pages.push(processedPage);
  }

  return pages;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, userInfo, pageCount = 5, templateIndex, explore = false } = await req.json();
    
    // Handle difficulty parameter
    const effectiveDifficulty = difficulty || userInfo?.difficultyLevel;
    
    console.log('🎯 Template service request:', { 
      difficulty: effectiveDifficulty, 
      pageCount, 
      templateIndex, 
      userInfo: userInfo ? 'provided' : 'missing', 
      explore 
    });

    // Difficulty mapping
    const levelMap: Record<string, string> = {
      'beginner': 'Level0',
      'easy': 'level1',
      'medium': 'level2',
      'hard': 'level3',
      'expert': 'level4',
      'grade6': 'grade6',
      'grade7': 'grade7',
      'grade8': 'grade8',
      'grade9': 'grade9',
      'grade10': 'grade10'
    };

    const templateLevel = levelMap[effectiveDifficulty] || 'Level0';

    // Handle exploration requests
    if (explore) {
      console.log('🔍 Exploration mode for level:', templateLevel);
      
      let templateCount = 0;
      if (templateLevel === 'Level0') {
        templateCount = VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES.length + LEVEL_0_TEMPLATES.length + LEVEL_0_EXTENSIONS.length;
      }
      
      return new Response(JSON.stringify({
        success: true,
        level: templateLevel,
        templateCount,
        templates: [{
          title: `${templateLevel} Templates`,
          theme: "Various themes available",
          scenes: templateCount,
          endings: 1
        }]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get template using new system
    console.log('📚 Getting template from new system for level:', templateLevel);
    
    let template: string[] | null = null;
    
    if (templateLevel === 'Level0') {
      // Combine all Level 0 templates for selection
      const allLevel0Templates = [
        ...VOCABULARY_COMPLIANT_LEVEL_0_TEMPLATES, // Primary: 100 templates
        ...LEVEL_0_TEMPLATES,                      // Secondary: 43 templates  
        ...LEVEL_0_EXTENSIONS                      // Extensions: 7 templates
      ];
      
      if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < allLevel0Templates.length) {
        template = allLevel0Templates[templateIndex];
      } else {
        template = allLevel0Templates[Math.floor(Math.random() * allLevel0Templates.length)];
      }
    } else {
      // For higher levels, return null since we're only migrating Level 0
      template = null;
    }

    if (!template) {
      console.log('❌ No template found for level:', templateLevel);
      return new Response(JSON.stringify({
        error: 'No templates available for this difficulty level',
        level: templateLevel,
        suggestion: 'Try a different difficulty level or check back later'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Template found with', template.length, 'pages');

    // Process template with user info and grammar validation
    const processedPages = processStoryTemplate(
      template,
      userInfo || {},
      pageCount
    );

    console.log('📖 Story generated successfully with', processedPages.length, 'pages');

    return new Response(JSON.stringify({
      success: true,
      story: processedPages,
      level: templateLevel,
      pageCount: processedPages.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Template service error:', error);

    // Emergency fallback
    const emergencyStory = [
      "Once upon a time, there was a curious child.",
      "They loved to explore and discover new things.",
      "Every day brought a new adventure.",
      "They learned something amazing.",
      "And they lived happily ever after."
    ];

    return new Response(JSON.stringify({
      success: true,
      story: emergencyStory,
      level: 'emergency',
      pageCount: emergencyStory.length,
      note: 'Emergency fallback story used due to system error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});