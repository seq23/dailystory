import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'
import { CONSOLIDATED_LEVEL_1_TEMPLATES } from "../_shared/consolidatedLevel1Templates.ts";
import { CONSOLIDATED_LEVEL_2_TEMPLATES } from "../_shared/consolidatedLevel2Templates.ts";
import { CONSOLIDATED_LEVEL_3_TEMPLATES } from "../_shared/consolidatedLevel3Templates.ts";
import { CONSOLIDATED_LEVEL_4_TEMPLATES } from "../_shared/consolidatedLevel4Templates.ts";
import { CONSOLIDATED_GRADE_6_TEMPLATES } from "../_shared/consolidatedGrade6Templates.ts";
import { CONSOLIDATED_GRADE_7_TEMPLATES } from "../_shared/consolidatedGrade7Templates.ts";
import { CONSOLIDATED_GRADE_8_TEMPLATES } from "../_shared/consolidatedGrade8Templates.ts";
import { CONSOLIDATED_GRADE_9_TEMPLATES } from "../_shared/consolidatedGrade9Templates.ts";
import { CONSOLIDATED_GRADE_10_TEMPLATES } from "../_shared/consolidatedGrade10Templates.ts";
import { TemplateLibraryService } from '../_shared/TemplateLibraryService.js';

// Placeholder resolution and user info interfaces
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

interface Seed {
  animal?: string;
  color?: string;
  name?: string;
}

interface MicroContext {
  userInfo?: UserInfo;
  seed?: Seed;
  sceneIndex?: number;
}

// Fallback pools for placeholder resolution
const FALLBACK_POOLS = {
  animals: ['puppy', 'kitten', 'bunny', 'bird', 'fish', 'hamster', 'turtle'],
  colors: ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink'],
  names: ['Alex', 'Sam', 'Charlie', 'Riley', 'Jordan', 'Casey', 'Taylor'],
  foods: ['pizza', 'cookies', 'apples', 'pasta', 'sandwiches'],
  hobbies: ['playing outside', 'reading books', 'drawing pictures', 'building blocks']
};

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

function resolveMicroPlaceholders(text: string, ctx: MicroContext = {}): string {
  let resolved = text;
  
  // Simple random selections from fallback pools
  resolved = resolved.replace(/<animal:random>/g, () => {
    const animals = FALLBACK_POOLS.animals;
    return animals[Math.floor(Math.random() * animals.length)];
  });
  
  resolved = resolved.replace(/<color:random>/g, () => {
    const colors = FALLBACK_POOLS.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  });
  
  resolved = resolved.replace(/<name:character>/g, () => {
    const names = FALLBACK_POOLS.names;
    return names[Math.floor(Math.random() * names.length)];
  });
  
  return resolved;
}

function resolveAllPlaceholders(text: string, ctx: MicroContext = {}): string {
  let resolved = text;
  
  if (ctx.userInfo) {
    resolved = resolveCanonicalPlaceholders(resolved, ctx.userInfo);
  }
  
  resolved = resolveMicroPlaceholders(resolved, ctx);
  
  return resolved;
}

// Template processing utilities
function templateToStringArray(template: StoryTemplate): string[] {
  const scenes = template.scenes || [];
  return scenes.map(scene => scene.text || '');
}

// ============================================================================
// NEW TEMPLATE SYSTEM INTEGRATION
// ============================================================================

// Note: In edge functions, we need to inline the new template system types and data
// since we can't import from src/ directories

interface SceneMicroVariants {
  text: string;
  alternatives: string[];
  optionalDetails: string[];
}

interface StoryScene {
  text: string;
  pause: boolean;
  hook: string;
  microVariants: SceneMicroVariants;
}

interface AttachableEnding {
  type: 'cozy' | 'silly' | 'triumphant' | 'reflective';
  text: string;
  microVariants: string[];
}

interface StoryTemplate {
  title: string;
  theme: string;
  level: string;
  scenes: StoryScene[];
  endings: AttachableEnding[];
  reuse: {
    swappableElements: Record<string, string[]>;
    weatherVariants: string[];
    settingVariants: string[];
    randomSeed?: number;
  };
}

// NEW TEMPLATE SYSTEM MAPPING - Complete Integration with Grade 6-10
const NEW_TEMPLATE_SYSTEM: Record<string, StoryTemplate[]> = {
  level1: CONSOLIDATED_LEVEL_1_TEMPLATES,
  level2: CONSOLIDATED_LEVEL_2_TEMPLATES, 
  level3: CONSOLIDATED_LEVEL_3_TEMPLATES,
  level4: CONSOLIDATED_LEVEL_4_TEMPLATES,
  grade6: CONSOLIDATED_GRADE_6_TEMPLATES,
  grade7: CONSOLIDATED_GRADE_7_TEMPLATES,
  grade8: CONSOLIDATED_GRADE_8_TEMPLATES,
  grade9: CONSOLIDATED_GRADE_9_TEMPLATES,
  grade10: CONSOLIDATED_GRADE_10_TEMPLATES
};

// Clean edge function - no hardcoded template data

// ============================================================================
// COMPLETE LEVEL 0 TEMPLATE SYSTEM (200+ Templates)
// ============================================================================

// All Level 0 template data moved to TemplateLibraryService

// ============================================================================
// COMPLETE GRAMMAR SYSTEM INTEGRATION
// ============================================================================

class GrammarValidator {
  private static CONJUGATION_VERBS = {
    'eat': { thirdPerson: 'eats', other: 'eat' },
    'run': { thirdPerson: 'runs', other: 'run' },
    'play': { thirdPerson: 'plays', other: 'play' },
    'like': { thirdPerson: 'likes', other: 'like' },
    'go': { thirdPerson: 'goes', other: 'go' },
    'come': { thirdPerson: 'comes', other: 'come' },
    'see': { thirdPerson: 'sees', other: 'see' },
    'find': { thirdPerson: 'finds', other: 'find' },
    'help': { thirdPerson: 'helps', other: 'help' },
    'love': { thirdPerson: 'loves', other: 'love' },
    'want': { thirdPerson: 'wants', other: 'want' },
    'need': { thirdPerson: 'needs', other: 'need' },
    'have': { thirdPerson: 'has', other: 'have' },
    'do': { thirdPerson: 'does', other: 'do' }
  };

  static conjugateVerb(verb: string, subject: string): string {
    if (!verb || !subject) return verb || '';
    
    const normalizedVerb = verb.toLowerCase();
    const normalizedSubject = subject.toLowerCase();
    
    if (!this.CONJUGATION_VERBS[normalizedVerb]) return verb;
    
    const conjugation = this.CONJUGATION_VERBS[normalizedVerb];
    
    if (normalizedSubject === 'he' || normalizedSubject === 'she' || normalizedSubject === 'it') {
      return conjugation.thirdPerson;
    }
    
    return conjugation.other;
  }
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

// ============================================================================
// ENHANCED TEMPLATE PROCESSING SYSTEM
// ============================================================================

function getFallbackTemplate(level: string, templateIndex?: number): string[] | null {
  console.log('🎯 Getting template for level:', level);
  
  // Level 0 - Use TemplateLibraryService (199+ templates)
  if (level === 'Level0' || level === 'beginner') {
    return TemplateLibraryService.getLevel0Template(templateIndex);
  }
  
  // New Template System - Import from actual template files
  try {
    // Import template system (simplified approach for edge function)
    const levelToFallbackMapping: Record<string, any> = {
      'Level1': 'level1',
      'Level2': 'level2', 
      'Level3': 'level3',
      'Level4': 'level4',
      'grade6': 'grade6',
      'grade7': 'grade7',
      'grade8': 'grade8',
      'grade9': 'grade9',
      'grade10': 'grade10'
    };
    
    const fallbackLevel = levelToFallbackMapping[level];
    if (fallbackLevel) {
      console.log('📚 Attempting to use new template system for:', fallbackLevel);
      
      // Use TemplateLibraryService for basic templates
      const basicTemplate = TemplateLibraryService.createBasicTemplate(level, fallbackLevel);
      if (basicTemplate) {
        console.log('✅ Using generated template for level:', level);
        return basicTemplate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error accessing new template system:', error);
  }
  
  // Fallback to Level 0 if no templates available for requested level
  console.log('⚠️ Falling back to Level 0 templates for:', level);
  return TemplateLibraryService.getLevel0Template();
}

function processStoryTemplate(template: string[], userInfo: UserInfo, pageCount: number = 5): string[] {
  const pages: string[] = [];
  const context: MicroContext = { userInfo };

  // Process each page in the template
  const pagesToUse = template.slice(0, Math.min(pageCount, template.length));
  
  for (const page of pagesToUse) {
    let processedPage = page;
    
    // Apply complete placeholder resolution
    processedPage = resolveAllPlaceholders(processedPage, context);
    
    // Apply grammar fixes
    processedPage = validateAndFixGrammar(processedPage);
    
    pages.push(processedPage);
  }

  return pages;
}

// ============================================================================
// TEMPLATE EXPLORATION FUNCTIONS
// ============================================================================

function handleExploration(templateLevel: string, difficulty: string) {
  console.log('🔍 Exploration mode for level:', templateLevel);
  
  // Count Level 0 templates
  if (templateLevel === 'Level0') {
    const templateCount = TemplateLibraryService.getTemplateCount('Level0');
    
    return new Response(JSON.stringify({
      success: true,
      level: templateLevel,
      templateCount,
      templates: [{
        title: "Level 0 Vocabulary Templates",
        theme: "Basic Vocabulary & Simple Sentences",
        scenes: templateCount, // Each template is essentially one scene
        endings: 1 // Simple templates have single endings
      }]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // Handle new template system levels
  const templates = NEW_TEMPLATE_SYSTEM[templateLevel] || [];
  
  if (templates.length === 0) {
    // Return empty but valid response for missing levels
    return new Response(JSON.stringify({
      success: true,
      level: templateLevel,
      templateCount: 0,
      templates: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // Extract template metadata
  const templateInfo = templates.map(template => ({
    title: template.title,
    theme: template.theme,
    scenes: template.scenes.length,
    endings: template.endings.length
  }));
  
  console.log('📊 Template exploration results:', {
    level: templateLevel,
    count: templates.length,
    totalScenes: templateInfo.reduce((sum, t) => sum + t.scenes, 0),
    totalEndings: templateInfo.reduce((sum, t) => sum + t.endings, 0)
  });
  
  return new Response(JSON.stringify({
    success: true,
    level: templateLevel,
    templateCount: templates.length,
    templates: templateInfo
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// MAIN SERVICE HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { difficulty, userInfo, pageCount = 5, templateIndex, explore = false } = await req.json();
    
    // Handle difficulty parameter - check top-level first, then userInfo fallback
    const effectiveDifficulty = difficulty || userInfo?.difficultyLevel;
    
    console.log('🎯 Template service request:', { 
      difficulty: effectiveDifficulty, 
      pageCount, 
      templateIndex, 
      userInfo: userInfo ? 'provided' : 'missing', 
      explore 
    });

    // Enhanced difficulty mapping supporting both Level 0 and new template system
    const levelMap: Record<string, string> = {
      'beginner': 'Level0',     // Level 0 System (199+ templates)
      'easy': 'level1',         // New System Level 1
      'medium': 'level2',       // New System Level 2  
      'hard': 'level3',         // New System Level 3
      'expert': 'level4',       // New System Level 4
      'grade6': 'grade6',       // New System Grade 6
      'grade7': 'grade7',       // New System Grade 7
      'grade8': 'grade8',       // New System Grade 8
      'grade9': 'grade9',       // New System Grade 9
      'grade10': 'grade10'      // New System Grade 10
    };

    const templateLevel = levelMap[effectiveDifficulty] || 'Level0'; // Default to Level 0
    
    console.log('📚 Selecting template for level:', templateLevel);
    
    // Handle exploration mode - return template metadata instead of generated stories
    if (explore) {
      return handleExploration(templateLevel, effectiveDifficulty);
    }
    
    // Get template with Level 0 priority system
    const template = getFallbackTemplate(templateLevel, templateIndex);

    if (!template) {
      throw new Error(`No templates available for level: ${templateLevel}`);
    }

    console.log('✨ Using template:', { 
      level: templateLevel, 
      pages: template.length,
      sample: template[0]
    });

    // Process template with complete placeholder resolution and grammar fixes
    const processedPages = processStoryTemplate(template, userInfo || {}, pageCount);

    // Determine template source for logging
    const isLevel0 = effectiveDifficulty === 'beginner' || templateLevel === 'Level0';
    const isNewSystem = ['Level1', 'Level2', 'Level3', 'Level4', 'grade6', 'grade7', 'grade8', 'grade9', 'grade10'].includes(templateLevel);
    const source = isLevel0 ? 'Level0-System' : isNewSystem ? 'New-Template-System' : 'Fallback';
    
    console.log('✅ Template processing complete:', { 
      pagesGenerated: processedPages.length,
      templateLevel,
      source,
      totalLevel0Templates: TemplateLibraryService.getTemplateCount('Level0'),
      newSystemLevels: Object.keys(NEW_TEMPLATE_SYSTEM).length
    });

    return new Response(JSON.stringify({
      success: true,
      source: 'template-service',
      templateSystem: source,
      pages: processedPages,
      difficulty,
      title: `${userInfo?.name || 'Child'}'s Story`,
      templateCount: isLevel0 ? TemplateLibraryService.getTemplateCount('Level0') : 'varies',
      level: templateLevel,
      isComplete: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Template service error:', error);
    
    // Emergency fallback with Level 0 vocabulary
    const emergencyPages = [
      "Child plays outside.",
      "Fun time now.",
      "Run and jump.",
      "Happy day."
    ];

    return new Response(JSON.stringify({
      success: false,
      source: 'emergency-fallback',
      pages: emergencyPages,
      difficulty: 'beginner',
      title: 'Emergency Story',
      error: error.message,
      isComplete: false
    }), {
      status: 200, // Return 200 to avoid cascade failures
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});