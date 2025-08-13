// Enhanced Input Processing System
// Extends InputEnhancementEngine with advanced features

import type { UserInfo, DifficultyLevel, LanguageCode } from '../types';
import { InputEnhancementEngine } from './inputEnhancementEngine';
import { SmartInputParser } from './smartInputParser';
import { extractThemeIntent } from '@/utils/themeIntent';

interface CulturalContext {
  language: LanguageCode;
  culturalElements: string[];
  narrativeStyles: string[];
  familyStructures: string[];
}

interface ProcessedUserElements {
  characterTraits: string[];
  storyElements: string[];
  culturalConnections: string[];
  skillBasedTraits: string[];
  interestThemes: string[];
}

export class EnhancedInputProcessor {
  private static culturalContextCache = new Map<LanguageCode, CulturalContext>();
  private static userPreferenceHistory = new Map<string, string[]>();

  /**
   * Process user inputs with advanced cultural and contextual awareness
   */
  static async processUserInputsAdvanced(
    userInfo: UserInfo,
    difficulty: DifficultyLevel
  ): Promise<ProcessedUserElements> {
    console.log(`🚀 Starting enhanced input processing for ${userInfo.name}`);

    // Get base enhanced inputs
    const baseEnhanced = InputEnhancementEngine.enhanceUserInputs(userInfo);
    
    // Add cultural context
    const culturalContext = await this.generateCulturalContext(userInfo);
    
    // Process special requests with advanced parsing
    const advancedSpecialElements = await this.processSpecialRequestsAdvanced(userInfo);
    
    // Generate skill-based character traits
    const skillTraits = this.generateSkillBasedTraits(userInfo);
    
    // Create interest-driven story themes
    const interestThemes = this.generateInterestThemes(userInfo);

    // Merge theme intent extraction
    const themeIntent = extractThemeIntent(userInfo);

    // Learn from user preferences
    this.learnUserPreferences(userInfo, baseEnhanced);

    return {
      characterTraits: [
        ...baseEnhanced.enhancedTraits,
        ...skillTraits,
        ...culturalContext.narrativeStyles
      ],
      storyElements: [
        ...baseEnhanced.storyElements.map(e => e.description),
        ...advancedSpecialElements,
        ...culturalContext.culturalElements
      ],
      culturalConnections: [
        ...baseEnhanced.thematicConnections,
        ...culturalContext.culturalElements
      ],
      skillBasedTraits: skillTraits,
      interestThemes: Array.from(new Set([...(interestThemes || []), ...(themeIntent.themes || [])]))
    };
  }

  /**
   * Generate cultural context based on user's native language
   */
  private static async generateCulturalContext(userInfo: UserInfo): Promise<CulturalContext> {
    const language = userInfo.nativeLanguage || 'en';
    
    // Check cache first
    if (this.culturalContextCache.has(language)) {
      return this.culturalContextCache.get(language)!;
    }

    const culturalMappings = {
      'en': {
        language: 'en' as LanguageCode,
        culturalElements: ['community helpers', 'school traditions', 'neighborhood festivals'],
        narrativeStyles: ['curious and friendly', 'collaborative and helpful'],
        familyStructures: ['family dinner traditions', 'weekend activities', 'holiday celebrations']
      },
      'es': {
        language: 'es' as LanguageCode,
        culturalElements: ['familia grande', 'fiestas comunitarias', 'tradiciones culturales'],
        narrativeStyles: ['warm and expressive', 'family-centered storytelling'],
        familyStructures: ['extended family gatherings', 'cultural celebrations', 'community unity']
      },
      'ar': {
        language: 'ar' as LanguageCode,
        culturalElements: ['community respect', 'learning traditions', 'hospitality customs'],
        narrativeStyles: ['respectful and thoughtful', 'wisdom-seeking'],
        familyStructures: ['family wisdom', 'elder respect', 'community learning']
      },
      'zh': {
        language: 'zh' as LanguageCode,
        culturalElements: ['harmony with nature', 'educational achievement', 'cultural heritage'],
        narrativeStyles: ['diligent and respectful', 'balance-seeking'],
        familyStructures: ['family honor', 'educational support', 'cultural traditions']
      },
      'hi': {
        language: 'hi' as LanguageCode,
        culturalElements: ['diversity celebration', 'ancient wisdom', 'colorful festivals'],
        narrativeStyles: ['vibrant and diverse', 'wisdom-respecting'],
        familyStructures: ['joint family values', 'cultural festivals', 'spiritual learning']
      },
      'pt': {
        language: 'pt' as LanguageCode,
        culturalElements: ['joyful celebrations', 'nature appreciation', 'music and dance'],
        narrativeStyles: ['joyful and rhythmic', 'nature-connected'],
        familyStructures: ['festive gatherings', 'musical traditions', 'outdoor activities']
      },
      'fr': {
        language: 'fr' as LanguageCode,
        culturalElements: ['artistic appreciation', 'culinary traditions', 'intellectual curiosity'],
        narrativeStyles: ['refined and curious', 'aesthetically aware'],
        familyStructures: ['family meals', 'cultural discussions', 'artistic pursuits']
      }
    };

    const context = culturalMappings[language] || culturalMappings['en'];
    this.culturalContextCache.set(language, context);
    
    return context;
  }

  /**
   * Process special requests with advanced natural language understanding
   */
  private static async processSpecialRequestsAdvanced(userInfo: UserInfo): Promise<string[]> {
    if (!userInfo.specialRequest || userInfo.specialRequest.trim().length === 0) {
      return [];
    }

    const elements: string[] = [];
    
    try {
      // Parse the special request for multiple elements
      const requestParts = userInfo.specialRequest.split(/[,;.]/);
      
      for (const part of requestParts) {
        const trimmed = part.trim();
        if (trimmed.length === 0) continue;

        // Use SmartInputParser to analyze the request part
        const parseResult = await SmartInputParser.parseTaggedInput([trimmed], userInfo);
        
        for (const tag of parseResult.parsedTags) {
          if (tag.confidence > 0.6) {
            elements.push(this.convertToStoryElement(tag.corrected, tag.category));
          }
        }
      }
    } catch (error) {
      console.warn('Advanced special request processing failed:', error);
      // Fallback to simple processing
      elements.push(`special interest in ${userInfo.specialRequest}`);
    }

    return elements;
  }

  /**
   * Convert parsed tag to story element
   */
  private static convertToStoryElement(word: string, category?: string): string {
    const elementMappings = {
      'animal': `adventures with ${word} companions`,
      'food': `sharing ${word} in the story`,
      'place': `exploring ${word} locations`,
      'person': `meeting helpful ${word} characters`,
      'object': `discovering magical ${word} items`,
      'other': `incorporating ${word} themes`
    };

    return elementMappings[category || 'other'] || `featuring ${word}`;
  }

  /**
   * Generate skill-based character traits from hobbies
   */
  private static generateSkillBasedTraits(userInfo: UserInfo): string[] {
    const traits: string[] = [];
    
    if (!userInfo.hobbies) return traits;

    const skillMappings = {
      'reading': ['excellent memory', 'loves learning new things', 'great storyteller'],
      'sports': ['physically active', 'team player', 'competitive spirit'],
      'art': ['creative thinker', 'observant eye', 'imaginative problem solver'],
      'music': ['rhythmic awareness', 'emotional expression', 'pattern recognition'],
      'cooking': ['following instructions', 'creative combinations', 'sharing with others'],
      'building': ['spatial awareness', 'logical thinking', 'patient construction'],
      'gardening': ['nurturing nature', 'patient growth', 'environmental awareness'],
      'dancing': ['graceful movement', 'rhythm coordination', 'expressive performance']
    };

    const hobbies = userInfo.hobbies.toLowerCase().split(/[,\\s]+/);
    
    for (const hobby of hobbies) {
      for (const [skill, traits_list] of Object.entries(skillMappings)) {
        if (hobby.includes(skill)) {
          traits.push(...traits_list.map(trait => `${userInfo.name} is ${trait}`));
          break;
        }
      }
    }

    return traits.slice(0, 3); // Limit to avoid overwhelming
  }

  /**
   * Generate interest themes for story generation
   */
  private static generateInterestThemes(userInfo: UserInfo): string[] {
    const themes: string[] = [];
    
    // Combine interests from multiple sources
    const sources = [
      userInfo.favoriteAnimal,
      userInfo.favoriteFood, 
      userInfo.hobbies,
      userInfo.specialRequest
    ].filter(Boolean);

    const themeGenerators = {
      'space': ['cosmic adventures', 'star exploration', 'alien friendships'],
      'ocean': ['underwater discoveries', 'marine life friendships', 'treasure hunting'],
      'forest': ['woodland adventures', 'animal helpers', 'nature mysteries'],
      'magic': ['mystical powers', 'enchanted objects', 'spell learning'],
      'science': ['experiment adventures', 'discovery journeys', 'invention stories'],
      'friendship': ['loyalty themes', 'helping others', 'team adventures']
    };

    for (const source of sources) {
      const lowerSource = source!.toLowerCase();
      
      for (const [keyword, themeList] of Object.entries(themeGenerators)) {
        if (lowerSource.includes(keyword)) {
          themes.push(...themeList);
        }
      }
    }

    return [...new Set(themes)].slice(0, 4); // Remove duplicates and limit
  }

  /**
   * Learn from user preferences to improve future stories
   */
  private static learnUserPreferences(userInfo: UserInfo, enhanced: any): void {
    const userId = `${userInfo.name}-${userInfo.age}`;
    const preferences = this.userPreferenceHistory.get(userId) || [];
    
    // Track successful element combinations
    const newPreferences = [
      userInfo.favoriteAnimal,
      userInfo.favoriteFood,
      userInfo.favoriteColor,
      ...enhanced.enhancedTraits.slice(0, 2)
    ].filter(Boolean);

    preferences.push(...newPreferences);
    
    // Keep only recent preferences (last 20)
    if (preferences.length > 20) {
      preferences.splice(0, preferences.length - 20);
    }
    
    this.userPreferenceHistory.set(userId, preferences);
  }

  /**
   * Get personalized recommendations based on learning
   */
  static getPersonalizedRecommendations(userInfo: UserInfo): string[] {
    const userId = `${userInfo.name}-${userInfo.age}`;
    const history = this.userPreferenceHistory.get(userId) || [];
    
    if (history.length === 0) {
      return ['Try adding more details to your interests!'];
    }

    // Analyze patterns in user preferences
    const frequentElements = this.analyzeFrequentElements(history);
    
    return [
      `Stories often feature ${frequentElements[0] || 'your favorites'}`,
      `You enjoy themes involving ${frequentElements[1] || 'adventure'}`,
      'Consider exploring new interests for story variety!'
    ];
  }

  /**
   * Analyze frequent elements in user history
   */
  private static analyzeFrequentElements(history: string[]): string[] {
    const frequency = new Map<string, number>();
    
    for (const element of history) {
      frequency.set(element, (frequency.get(element) || 0) + 1);
    }
    
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([element]) => element);
  }

  /**
   * Clear caches and learning data
   */
  static clearProcessingData(): void {
    this.culturalContextCache.clear();
    this.userPreferenceHistory.clear();
    InputEnhancementEngine.clearCache();
  }

  /**
   * Get processing analytics
   */
  static getProcessingAnalytics() {
    return {
      culturalLanguagesSupported: this.culturalContextCache.size,
      usersWithHistory: this.userPreferenceHistory.size,
      avgPreferencesPerUser: Array.from(this.userPreferenceHistory.values())
        .reduce((sum, prefs) => sum + prefs.length, 0) / Math.max(1, this.userPreferenceHistory.size),
      supportedFeatures: [
        'cultural_context',
        'skill_mapping',
        'advanced_parsing',
        'preference_learning',
        'multilingual_support'
      ]
    };
  }
}
