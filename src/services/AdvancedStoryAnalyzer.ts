// Advanced Story Content Analysis for Enhanced Image Generation
// Phase 2 & 3: Upgraded with character consistency and style integration

import type { UserInfo, DifficultyLevel } from '@/types';
import { DIFFICULTY_STYLE_MAPPING } from '@/config/appConfig';
import { supabase } from '@/integrations/supabase/client';
import { PromptLengthManager } from '@/utils/promptLengthManager';

export interface StoryAnalysis {
  // Core content analysis
  primaryCharacters: string[];
  secondaryCharacters: string[];
  mainAction: string;
  emotions: string[];
  objects: string[];
  setting: {
    location: string;
    timeOfDay: string;
    weather: string;
    season: string;
  };
  
  // Visual elements
  colors: string[];
  mood: string;
  composition: string;
  perspective: string;
  
  // Story context
  storyProgression: 'beginning' | 'middle' | 'climax' | 'resolution';
  intensity: 'calm' | 'moderate' | 'exciting' | 'dramatic';
  
  // Previous context for continuity
  previousElements?: string[];
  
  // AI enhancement tracking
  aiEnhanced?: boolean;
  enhancementSource?: 'static' | 'ai' | 'hybrid';
}

export interface AIStoryElements {
  characters: {
    primary: string[];
    relationships: string[];
  };
  scene: {
    setting: string;
    atmosphere: string;
    lighting: string;
    weather: string;
  };
  action: {
    mainActivity: string;
    emotion: string;
    intensity: string;
  };
  visual: {
    colors: string[];
    objects: string[];
    perspective: string;
    composition: string;
  };
  context: {
    storyProgression: string;
    thematicElements: string[];
  };
}

export interface EnhancedImagePrompt {
  mainPrompt: string;
  styleModifiers: string[];
  compositionHints: string[];
  colorPalette: string[];
  negativePrompt: string[];
}

export class AdvancedStoryAnalyzer {
  private static aiEnhancementCache: Map<string, { analysis: StoryAnalysis; timestamp: number }> = new Map();
  private static readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly CHARACTER_PATTERNS = [
    /\b([A-Z][a-z]+)\b(?:\s+(?:said|asked|walked|ran|jumped|smiled|laughed|cried|helped|found|saw|went|came|looked|felt|thought|knew|wanted|needed|liked|loved))/gi,
    /\b(?:the\s+)?([a-z]+(?:\s+[a-z]+)?)\s+(?:character|person|child|boy|girl|friend|teacher|parent|family)/gi
  ];

  private static readonly EMOTION_KEYWORDS = {
    happy: ['happy', 'joy', 'excited', 'cheerful', 'delighted', 'pleased', 'glad', 'smile', 'laugh', 'giggle'],
    sad: ['sad', 'cry', 'tears', 'upset', 'disappointed', 'lonely', 'sorrow', 'weep'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'upset', 'cross'],
    scared: ['scared', 'afraid', 'frightened', 'worried', 'nervous', 'anxious', 'fearful'],
    surprised: ['surprised', 'amazed', 'shocked', 'astonished', 'wonder', 'curious'],
    peaceful: ['calm', 'peaceful', 'quiet', 'serene', 'gentle', 'soft', 'cozy']
  };

  private static readonly OBJECT_CATEGORIES = {
    toys: ['toy', 'doll', 'teddy', 'bear', 'ball', 'blocks', 'puzzle', 'game'],
    nature: ['flower', 'tree', 'leaf', 'rock', 'shell', 'butterfly', 'bird', 'animal'],
    food: ['cake', 'cookie', 'fruit', 'apple', 'bread', 'ice cream', 'candy', 'snack'],
    tools: ['book', 'pencil', 'brush', 'scissors', 'key', 'box', 'bag', 'basket'],
    magical: ['wand', 'crystal', 'potion', 'spell', 'magic', 'fairy', 'dragon', 'unicorn']
  };

  private static readonly TIME_INDICATORS = {
    morning: ['morning', 'dawn', 'sunrise', 'early', 'breakfast'],
    afternoon: ['afternoon', 'lunch', 'midday', 'noon'],
    evening: ['evening', 'sunset', 'dinner', 'dusk'],
    night: ['night', 'dark', 'stars', 'moon', 'bedtime', 'sleep']
  };

  private static readonly WEATHER_PATTERNS = {
    sunny: ['sunny', 'bright', 'warm', 'sunshine', 'clear'],
    rainy: ['rain', 'wet', 'puddle', 'drizzle', 'storm'],
    cloudy: ['cloudy', 'overcast', 'gray', 'grey'],
    snowy: ['snow', 'cold', 'winter', 'ice', 'frozen'],
    windy: ['wind', 'breeze', 'breezy', 'gusty']
  };

  static analyzeStoryContent(
    storyText: string, 
    pageNumber: number, 
    totalPages: number,
    previousAnalysis?: StoryAnalysis
  ): StoryAnalysis {
    const cleanText = storyText.toLowerCase().trim();
    
    return {
      primaryCharacters: this.extractCharacters(storyText, 'primary'),
      secondaryCharacters: this.extractCharacters(storyText, 'secondary'),
      mainAction: this.extractMainAction(cleanText),
      emotions: this.extractEmotions(cleanText),
      objects: this.extractObjects(cleanText),
      setting: {
        location: this.extractLocation(cleanText),
        timeOfDay: this.extractTimeOfDay(cleanText),
        weather: this.extractWeather(cleanText),
        season: this.extractSeason(cleanText)
      },
      colors: this.extractColors(cleanText),
      mood: this.determineMood(cleanText),
      composition: this.determineComposition(cleanText, pageNumber),
      perspective: this.determinePerspective(cleanText, pageNumber),
      storyProgression: this.determineStoryProgression(pageNumber, totalPages),
      intensity: this.determineIntensity(cleanText),
      previousElements: previousAnalysis?.objects || [],
      aiEnhanced: false,
      enhancementSource: 'static'
    };
  }

  static async enhanceAnalysisWithAI(
    storyText: string,
    pageNumber: number,
    totalPages: number,
    difficultyLevel: DifficultyLevel,
    sessionId: string,
    userInfo?: UserInfo,
    previousAnalysis?: StoryAnalysis
  ): Promise<StoryAnalysis> {
    const cacheKey = `${sessionId}_${pageNumber}_${storyText.substring(0, 50)}`;
    
    // Check cache first
    const cached = this.aiEnhancementCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION_MS) {
      console.log(`🧠 Using cached AI analysis for page ${pageNumber}`);
      return cached.analysis;
    }

    // Get static analysis first
    const staticAnalysis = this.analyzeStoryContent(storyText, pageNumber, totalPages, previousAnalysis);
    
    // Determine if AI enhancement is needed
    if (!this.shouldEnhanceWithAI(staticAnalysis, storyText, difficultyLevel)) {
      console.log(`🧠 Static analysis sufficient for page ${pageNumber}`);
      return staticAnalysis;
    }

    try {
      console.log(`🧠 Enhancing analysis with AI for ${difficultyLevel} level, page ${pageNumber}`);
      
      const { data, error } = await supabase.functions.invoke('extract-story-elements', {
        body: {
          storyText,
          pageNumber,
          totalPages,
          difficultyLevel,
          sessionId,
          userInfo
        }
      });

      if (error || !data?.success) {
        console.warn('🧠 AI enhancement failed, using static analysis:', error);
        return staticAnalysis;
      }

      const aiElements: AIStoryElements = data.elements;
      const enhancedAnalysis = this.mergeAIWithStatic(staticAnalysis, aiElements);
      
      // Cache the result
      this.aiEnhancementCache.set(cacheKey, {
        analysis: enhancedAnalysis,
        timestamp: Date.now()
      });

      console.log(`🧠 AI enhancement complete: enriched ${enhancedAnalysis.colors.length} colors, ${enhancedAnalysis.objects.length} objects`);
      return enhancedAnalysis;

    } catch (error) {
      console.warn('🧠 AI enhancement error, using static fallback:', error);
      return staticAnalysis;
    }
  }

  private static shouldEnhanceWithAI(staticAnalysis: StoryAnalysis, storyText: string, difficultyLevel: DifficultyLevel): boolean {
    // Always enhance for medium and above difficulty levels
    if (['medium', 'hard', 'expert'].includes(difficultyLevel)) {
      return true;
    }

    // For easy level, enhance if static analysis is lacking
    const lacksVisualDetails = staticAnalysis.colors.length < 2 || staticAnalysis.objects.length < 2;
    const hasComplexLanguage = storyText.length > 100 || /[A-Z][a-z]+\s+(said|asked|thought|wondered|felt)/.test(storyText);
    
    return lacksVisualDetails || hasComplexLanguage;
  }

  private static mergeAIWithStatic(staticAnalysis: StoryAnalysis, aiElements: AIStoryElements): StoryAnalysis {
    return {
      ...staticAnalysis,
      primaryCharacters: [...new Set([...staticAnalysis.primaryCharacters, ...aiElements.characters.primary])],
      mainAction: aiElements.action.mainActivity || staticAnalysis.mainAction,
      emotions: [...new Set([...staticAnalysis.emotions, aiElements.action.emotion].filter(Boolean))],
      objects: [...new Set([...staticAnalysis.objects, ...aiElements.visual.objects])],
      setting: {
        location: aiElements.scene.setting || staticAnalysis.setting.location,
        timeOfDay: staticAnalysis.setting.timeOfDay,
        weather: aiElements.scene.weather || staticAnalysis.setting.weather,
        season: staticAnalysis.setting.season
      },
      colors: [...new Set([...staticAnalysis.colors, ...aiElements.visual.colors])],
      mood: aiElements.scene.atmosphere || staticAnalysis.mood,
      composition: aiElements.visual.composition || staticAnalysis.composition,
      perspective: aiElements.visual.perspective || staticAnalysis.perspective,
      aiEnhanced: true,
      enhancementSource: 'hybrid'
    };
  }

  private static extractCharacters(text: string, type: 'primary' | 'secondary'): string[] {
    const characters = new Set<string>();
    
    for (const pattern of this.CHARACTER_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 2 && match[1] !== 'The') {
          characters.add(match[1]);
        }
      }
    }
    
    // Simple heuristic: most mentioned characters are primary
    const characterCounts = new Map<string, number>();
    for (const char of characters) {
      const count = (text.match(new RegExp(char, 'gi')) || []).length;
      characterCounts.set(char, count);
    }
    
    const sorted = Array.from(characterCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([char]) => char);
    
    return type === 'primary' ? sorted.slice(0, 2) : sorted.slice(2, 4);
  }

  private static extractMainAction(text: string): string {
    const actionMap = {
      'exploring': ['explore', 'discover', 'find', 'search', 'look for', 'adventure'],
      'playing': ['play', 'game', 'fun', 'toy', 'ball', 'run around'],
      'learning': ['learn', 'study', 'read', 'practice', 'teach', 'school'],
      'helping': ['help', 'assist', 'support', 'care', 'share', 'kind'],
      'creating': ['make', 'build', 'create', 'craft', 'draw', 'paint'],
      'traveling': ['go', 'walk', 'journey', 'travel', 'visit', 'move'],
      'celebrating': ['party', 'celebrate', 'birthday', 'festival', 'happy'],
      'solving': ['solve', 'figure out', 'problem', 'puzzle', 'mystery'],
      'resting': ['rest', 'sleep', 'relax', 'calm', 'peaceful', 'quiet']
    };

    for (const [action, keywords] of Object.entries(actionMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return action;
      }
    }
    
    return 'enjoying a moment';
  }

  private static extractEmotions(text: string): string[] {
    const emotions: string[] = [];
    
    for (const [emotion, keywords] of Object.entries(this.EMOTION_KEYWORDS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        emotions.push(emotion);
      }
    }
    
    return emotions.length > 0 ? emotions : ['peaceful'];
  }

  private static extractObjects(text: string): string[] {
    const objects: string[] = [];
    
    for (const [category, items] of Object.entries(this.OBJECT_CATEGORIES)) {
      for (const item of items) {
        if (text.includes(item)) {
          objects.push(item);
        }
      }
    }
    
    return objects;
  }

  private static extractLocation(text: string): string {
    const locationMap = {
      'magical forest': ['forest', 'woods', 'trees', 'woodland', 'jungle'],
      'cozy home': ['home', 'house', 'room', 'kitchen', 'bedroom', 'living room'],
      'beautiful garden': ['garden', 'flowers', 'plants', 'greenhouse'],
      'peaceful beach': ['beach', 'ocean', 'sea', 'sand', 'waves'],
      'mountain adventure': ['mountain', 'hill', 'peak', 'valley', 'cliff'],
      'friendly school': ['school', 'classroom', 'library', 'playground'],
      'bustling city': ['city', 'street', 'building', 'shop', 'market'],
      'serene countryside': ['farm', 'field', 'meadow', 'barn', 'countryside'],
      'magical castle': ['castle', 'palace', 'tower', 'kingdom'],
      'space adventure': ['space', 'planet', 'stars', 'rocket', 'galaxy']
    };

    for (const [location, keywords] of Object.entries(locationMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return location;
      }
    }
    
    return 'wonderful place';
  }

  private static extractTimeOfDay(text: string): string {
    for (const [time, keywords] of Object.entries(this.TIME_INDICATORS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return time;
      }
    }
    return 'daytime';
  }

  private static extractWeather(text: string): string {
    for (const [weather, keywords] of Object.entries(this.WEATHER_PATTERNS)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return weather;
      }
    }
    return 'pleasant';
  }

  private static extractSeason(text: string): string {
    if (['spring', 'bloom', 'flowers', 'growth'].some(w => text.includes(w))) return 'spring';
    if (['summer', 'hot', 'vacation', 'swimming'].some(w => text.includes(w))) return 'summer';
    if (['autumn', 'fall', 'leaves', 'harvest'].some(w => text.includes(w))) return 'autumn';
    if (['winter', 'snow', 'cold', 'holiday'].some(w => text.includes(w))) return 'winter';
    return 'any season';
  }

  private static extractColors(text: string): string[] {
    const colorMap = {
      'red': ['red', 'crimson', 'scarlet', 'ruby'],
      'blue': ['blue', 'azure', 'navy', 'sky', 'ocean'],
      'green': ['green', 'emerald', 'forest', 'mint', 'grass'],
      'yellow': ['yellow', 'golden', 'sunny', 'bright', 'lemon'],
      'purple': ['purple', 'violet', 'lavender', 'magical'],
      'orange': ['orange', 'autumn', 'sunset', 'warm'],
      'pink': ['pink', 'rose', 'blush', 'soft'],
      'white': ['white', 'snow', 'pure', 'clean', 'bright'],
      'brown': ['brown', 'earth', 'wood', 'natural']
    };

    const colors: string[] = [];
    for (const [color, keywords] of Object.entries(colorMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        colors.push(color);
      }
    }
    
    return colors.length > 0 ? colors : ['warm', 'cheerful'];
  }

  private static determineMood(text: string): string {
    if (['adventure', 'exciting', 'amazing', 'wonderful'].some(w => text.includes(w))) return 'adventurous';
    if (['calm', 'peaceful', 'quiet', 'gentle'].some(w => text.includes(w))) return 'serene';
    if (['happy', 'joy', 'fun', 'celebration'].some(w => text.includes(w))) return 'joyful';
    if (['mystery', 'secret', 'hidden', 'discover'].some(w => text.includes(w))) return 'mysterious';
    if (['magic', 'magical', 'spell', 'enchanted'].some(w => text.includes(w))) return 'magical';
    return 'heartwarming';
  }

  private static determineComposition(text: string, pageNumber: number): string {
    // Vary composition based on content and page
    if (text.includes('far') || text.includes('distance')) return 'wide panoramic view';
    if (text.includes('close') || text.includes('detail')) return 'close-up intimate view';
    if (pageNumber % 3 === 0) return 'dynamic diagonal composition';
    if (text.includes('group') || text.includes('together')) return 'centered group composition';
    return 'balanced rule-of-thirds composition';
  }

  private static determinePerspective(text: string, pageNumber: number): string {
    if (text.includes('above') || text.includes('sky')) return 'bird\'s eye view';
    if (text.includes('ground') || text.includes('below')) return 'low angle view';
    if (pageNumber % 4 === 0) return 'eye-level perspective';
    return 'child\'s perspective';
  }

  private static determineStoryProgression(pageNumber: number, totalPages: number): 'beginning' | 'middle' | 'climax' | 'resolution' {
    const progress = pageNumber / totalPages;
    if (progress <= 0.25) return 'beginning';
    if (progress <= 0.75) return 'middle';
    if (progress <= 0.9) return 'climax';
    return 'resolution';
  }

  private static determineIntensity(text: string): 'calm' | 'moderate' | 'exciting' | 'dramatic' {
    const excitingWords = ['adventure', 'amazing', 'incredible', 'fantastic', 'wonderful'];
    const dramaticWords = ['problem', 'trouble', 'help', 'save', 'danger', 'important'];
    const calmWords = ['peaceful', 'quiet', 'gentle', 'soft', 'calm', 'rest'];
    
    if (dramaticWords.some(w => text.includes(w))) return 'dramatic';
    if (excitingWords.some(w => text.includes(w))) return 'exciting';
    if (calmWords.some(w => text.includes(w))) return 'calm';
    return 'moderate';
  }

  static generateEnhancedPrompt(
    analysis: StoryAnalysis, 
    userInfo: UserInfo,
    difficultyLevel: DifficultyLevel,
    sessionId: string,
    style: string = 'children-book-illustration'
  ): EnhancedImagePrompt {
    // Apply style framework based on difficulty
    const styleFramework = DIFFICULTY_STYLE_MAPPING[difficultyLevel];
    const characterDesc = this.buildCharacterDescription(userInfo, difficultyLevel);
    const settingDesc = this.buildSettingDescription(analysis.setting);
    const moodDesc = this.buildMoodDescription(analysis);
    
    // Combine scene content + style framework + character consistency + rendering + brand suffix
    const coreContent = `${analysis.mainAction} in ${settingDesc}. ${moodDesc}. ${analysis.composition}, ${analysis.perspective}`;
    const renderingStyle = styleFramework.rendering || '';
    const brandSuffix = styleFramework.brandSuffix || '';
    
    // Use advanced prompt management with AI-enhanced preferences
    const userPreferences = {
      prioritizeCharacterConsistency: true, // AI mode prioritizes character consistency
      preferDetailedStyle: difficultyLevel === 'expert' || difficultyLevel === 'hard',
      optimizeForSpeed: false,              // AI mode allows longer generation for quality
      allowStyleReduction: true,
      maxPromptComplexity: 'detailed' as const
    };
    
    const segments = PromptLengthManager.createSegments(
      `${styleFramework.prompt}. ${characterDesc} ${coreContent}`,
      renderingStyle,
      characterDesc,
      brandSuffix,
      'standard' // Use standard quality tier for AI-enhanced mode
    );
    
    const { optimizedPrompt, wasOptimized, originalLength, finalLength, optimizations, strategy } = 
      PromptLengthManager.optimizeWithAdvancedPrioritization(segments, userInfo, difficultyLevel, userPreferences);
    
    // Log AI-enhanced prompt optimization results
    if (wasOptimized) {
      console.log(`🤖 AI-enhanced prompt optimized: ${originalLength} → ${finalLength} chars (${strategy} strategy)`);
      console.log(`🔧 Applied optimizations: ${optimizations.join(', ')}`);
    } else {
      console.log(`🤖 AI-enhanced prompt generated: ${finalLength} chars (${strategy} strategy, no optimization needed)`);
    }
    
    const styleModifiers = [
      `Color palette: ${styleFramework.colorPalette}`,
      `Detail level: ${styleFramework.detailLevel}`,
      `Complexity: ${styleFramework.complexity}`
    ];
    
    const compositionHints = [
      analysis.composition,
      analysis.perspective,
      `${analysis.intensity} energy level`,
      `${analysis.storyProgression} story moment`,
      `${styleFramework.complexity} artistic complexity`
    ];
    
    const colorPalette = analysis.colors.length > 0 
      ? analysis.colors.map(c => `rich ${c} tones`)
      : [styleFramework.colorPalette];
    
    const negativePrompt = [
      'scary content',
      'inappropriate imagery', 
      'dark themes',
      'violence',
      'adult content',
      'disturbing elements',
      'poor quality',
      'blurry',
      'distorted faces',
      'inconsistent character appearance',
      'extra limbs',
      'multiple arms',
      'multiple legs',
      'three legs',
      'extra hands',
      'deformed anatomy',
      'malformed body parts',
      'incorrect anatomy',
      'distorted proportions',
      'anatomical errors',
      'inconsistent limb count',
      'body part duplication',
      'malformed characters'
    ];
    
    return {
      mainPrompt: optimizedPrompt,
      styleModifiers,
      compositionHints,
      colorPalette,
      negativePrompt
    };
  }

  private static buildCharacterDescription(userInfo: UserInfo, difficultyLevel?: DifficultyLevel): string {
    const age = userInfo.age;
    const ageGroup = age <= 5 ? 'young child' : age <= 8 ? 'child' : age <= 12 ? 'older child' : 'young person';
    
    // Generate fresh character details each time to avoid repetition
    const appearances = ['cheerful', 'curious', 'friendly', 'adventurous', 'thoughtful'];
    const skinTones = ['light', 'medium', 'olive', 'dark', 'warm'];
    const hairStyles = ['short', 'curly', 'straight', 'wavy'];
    
    const randomAppearance = appearances[Math.floor(Math.random() * appearances.length)];
    const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    
    return `${ageGroup} with ${randomAppearance} expression, ${randomSkinTone} skin tone, ${randomHair} hair`;
  }

  private static buildSettingDescription(setting: any): string {
    let desc = setting.location;
    
    if (setting.timeOfDay !== 'daytime') {
      desc += ` during ${setting.timeOfDay}`;
    }
    
    if (setting.weather !== 'pleasant') {
      desc += ` with ${setting.weather} weather`;
    }
    
    if (setting.season !== 'any season') {
      desc += ` in ${setting.season}`;
    }
    
    return desc;
  }

  private static buildMoodDescription(analysis: StoryAnalysis): string {
    const emotions = analysis.emotions.join(', ');
    const objects = analysis.objects.slice(0, 3).join(', ');
    
    let desc = `Conveying ${emotions} emotions`;
    
    if (objects) {
      desc += `, featuring ${objects}`;
    }
    
    desc += `, creating a ${analysis.mood} atmosphere`;
    
    return desc;
  }
}