import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Import the single source of truth for templates
import { TemplateLibraryService } from '../_shared/TemplateLibraryService.js';

// Import dynamic template system
import { getTemplate, getTemplateCount } from '../_shared/templateImporter.ts';

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
      
      let templateCount: number;
      
      if (templateLevel === 'Level0') {
        templateCount = TemplateLibraryService.getTemplateCount(templateLevel);
      } else {
        // Use dynamic template count for non-Level0
        templateCount = await getTemplateCount(templateLevel);
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

    // Get template from appropriate source
    console.log('📚 Getting template for level:', templateLevel);
    
    let pages: string[] | null = null;
    
    if (templateLevel === 'Level0') {
      // Use static Level 0 templates
      const template = TemplateLibraryService.getLevel0Template(templateIndex);
      if (template) {
        console.log('✅ Level0 template found with', template.length, 'pages');
        // Process with legacy placeholder system for Level0
        pages = processStoryTemplate(template, userInfo || {}, pageCount);
      }
    } else {
      // Use dynamic import system for Level1+
      try {
        console.log('🔄 Loading dynamic template for:', templateLevel);
        pages = await getTemplate(templateLevel, templateIndex, userInfo || {}, pageCount);
        
        if (pages) {
          console.log('✅ Dynamic template converted to', pages.length, 'pages');
        }
      } catch (dynamicError) {
        console.error('❌ Dynamic template import failed:', dynamicError);
        
        // Return structured error for dynamic import failure
        return new Response(JSON.stringify({
          error: 'Template system temporarily unavailable',
          level: templateLevel,
          canRetry: true,
          suggestion: 'Please try again in a moment, or try a different difficulty level'
        }), {
          status: 503, // Service Temporarily Unavailable
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!pages || pages.length === 0) {
      console.log('❌ No pages generated for level:', templateLevel);
      return new Response(JSON.stringify({
        error: 'No templates available for this difficulty level',
        level: templateLevel,
        canRetry: false,
        suggestion: 'Try a different difficulty level or check back later'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📖 Story generated successfully with', pages.length, 'pages');

    return new Response(JSON.stringify({
      success: true,
      pages: pages, // Changed from 'story' to 'pages' for consistency
      level: templateLevel,
      pageCount: pages.length
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
      pages: emergencyStory, // Changed from 'story' to 'pages' for consistency
      level: 'emergency',
      pageCount: emergencyStory.length,
      note: 'Emergency fallback story used due to system error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});