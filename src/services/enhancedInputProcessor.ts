// Enhanced Input Processing System
// Extends InputEnhancementEngine with advanced features

import type { UserInfo, DifficultyLevel, LanguageCode } from '../types';
import { InputEnhancementEngine } from './inputEnhancementEngine';
import { extractThemeIntent } from '@/utils/themeIntent';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { validateThemeBatch } from '@/utils/themeValidation';

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
      interestThemes: Array.from(new Set([...(interestThemes || []), ...(themeIntent.theme || [])]))
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

    // Helper method for random selection
    const randomPick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)];
    
    const culturalMappings = {
      'en': {
        language: 'en' as LanguageCode,
        culturalElements: [
          // Foods
          'apple pie', 'grilled cheese sandwiches', 'pancakes with maple syrup', 'hot dogs at baseball games',
          // Celebrations  
          'Fourth of July fireworks', 'Thanksgiving dinner', 'Halloween trick-or-treating', 'Christmas morning',
          // Activities
          'Little League baseball', 'school field trips', 'neighborhood block parties', 'camping trips',
          // Settings
          'suburban neighborhoods', 'public libraries', 'community parks', 'school cafeterias'
        ],
        narrativeStyles: ['curious and friendly', 'collaborative and helpful', 'adventurous and optimistic'],
        familyStructures: ['nuclear family dynamics', 'weekend family activities', 'holiday traditions', 'extended family visits']
      },
      'es': {
        language: 'es' as LanguageCode,
        culturalElements: [
          // Foods
          'empanadas caseras', 'arroz con leche', 'tacos familiares', 'dulce de leche',
          // Celebrations
          'Día de los Muertos altares', 'quinceañeras', 'Nochebuena cenas', 'fiestas patronales',
          // Activities  
          'fútbol en el parque', 'mercados dominicales', 'serenatas familiares', 'bailes tradicionales',
          // Settings
          'plazas centrales', 'casas de abuelos', 'iglesias comunitarias', 'patios familiares'
        ],
        narrativeStyles: ['warm and expressive', 'family-centered storytelling', 'rhythmic and musical'],
        familyStructures: ['extended family gatherings', 'multi-generational homes', 'godparent relationships', 'community celebrations']
      },
      'ar': {
        language: 'ar' as LanguageCode,
        culturalElements: [
          // Foods
          'ma\'amoul cookies', 'mansaf sharing', 'Ramadan iftar', 'Arabic coffee hospitality',
          // Celebrations
          'Eid celebrations', 'wedding henna nights', 'graduation honors', 'religious holidays',
          // Activities
          'calligraphy learning', 'poetry recitation', 'mosque community', 'elder storytelling',
          // Settings
          'family courtyards', 'community mosques', 'traditional markets', 'hospitality rooms'
        ],
        narrativeStyles: ['respectful and thoughtful', 'wisdom-seeking', 'hospitality-focused'],
        familyStructures: ['extended family respect', 'elder guidance', 'community support', 'traditional values']
      },
      'zh': {
        language: 'zh' as LanguageCode,
        culturalElements: [
          // Foods
          'mooncakes sharing', 'dumplings making', 'hot pot gatherings', 'tea ceremony',
          // Celebrations
          'Spring Festival reunions', 'Mid-Autumn Festival', 'Dragon Boat racing', 'Lantern Festival',
          // Activities
          'calligraphy practice', 'martial arts training', 'ancestral respect', 'academic achievement',
          // Settings
          'traditional courtyards', 'temple visits', 'family study rooms', 'community gardens'
        ],
        narrativeStyles: ['diligent and respectful', 'balance-seeking', 'harmony-focused'],
        familyStructures: ['multi-generational wisdom', 'educational support', 'cultural preservation', 'family honor']
      },
      'hi': {
        language: 'hi' as LanguageCode,
        culturalElements: [
          // Foods
          'masala chai sharing', 'festival sweets', 'family thali meals', 'street food adventures',
          // Celebrations
          'Diwali lights', 'Holi colors', 'Dussehra celebrations', 'wedding festivities',
          // Activities
          'classical dance learning', 'cricket playing', 'temple visits', 'storytelling traditions',
          // Settings
          'joint family homes', 'local temples', 'festival grounds', 'community courtyards'
        ],
        narrativeStyles: ['vibrant and diverse', 'wisdom-respecting', 'celebration-focused'],
        familyStructures: ['joint family values', 'multi-generational living', 'cultural festivals', 'spiritual learning']
      },
      'pt': {
        language: 'pt' as LanguageCode,
        culturalElements: [
          // Foods
          'feijoada weekends', 'açaí bowls', 'pão de açúcar', 'churrasco gatherings',
          // Celebrations
          'Carnaval parades', 'Festa Junina', 'Copa celebrations', 'beach New Year',
          // Activities
          'capoeira circles', 'samba dancing', 'beach volleyball', 'music circles',
          // Settings
          'beach communities', 'favela solidarity', 'music venues', 'outdoor gatherings'
        ],
        narrativeStyles: ['joyful and rhythmic', 'nature-connected', 'music-infused'],
        familyStructures: ['festive gatherings', 'musical traditions', 'outdoor activities', 'community bonds']
      },
      'fr': {
        language: 'fr' as LanguageCode,
        culturalElements: [
          // Foods
          'croissant mornings', 'family cheese courses', 'market fresh bread', 'Sunday lunches',
          // Celebrations
          'Bastille Day', 'Christmas réveillon', 'harvest festivals', 'art gallery openings',
          // Activities
          'museum visits', 'countryside walks', 'café conversations', 'artistic pursuits',
          // Settings
          'countryside châteaux', 'Parisian cafés', 'village markets', 'family dining rooms'
        ],
        narrativeStyles: ['refined and curious', 'aesthetically aware', 'intellectually engaging'],
        familyStructures: ['family meals importance', 'cultural discussions', 'artistic appreciation', 'intellectual curiosity']
      }
    };

    const context = culturalMappings[language] || culturalMappings['en'];
    this.culturalContextCache.set(language, context);
    
    return context;
  }

  /**
   * Process special requests with sanitization and validation
   */
  private static async processSpecialRequestsAdvanced(userInfo: UserInfo): Promise<string[]> {
    if (!userInfo.specialRequest || userInfo.specialRequest.trim().length === 0) {
      return [];
    }

    const elements: string[] = [];
    
    try {
      // Parse the special request for multiple elements
      const requestParts = userInfo.specialRequest.split(/[,;.]/);
      const sanitizedParts: string[] = [];
      
      // Sanitize each part
      for (const part of requestParts) {
        const trimmed = part.trim();
        if (trimmed.length === 0) continue;
        
        const sanitized = InputSanitizer.sanitizeThemeInput(trimmed);
        if (sanitized) sanitizedParts.push(sanitized);
      }
      
      // Validate themes in batch
      const validation = validateThemeBatch(sanitizedParts);
      
      // Use only valid themes
      for (const validTheme of validation.validThemes) {
        elements.push(this.convertToStoryElement(validTheme));
      }
      
      // Log rejections for monitoring
      if (validation.rejectedThemes.length > 0) {
        console.warn('Rejected themes for safety:', validation.rejectedThemes);
      }
      
    } catch (error) {
      console.warn('Advanced special request processing failed:', error);
      // Fallback to simple processing with sanitization
      const sanitized = InputSanitizer.sanitizeThemeInput(userInfo.specialRequest);
      if (sanitized) {
        elements.push(`special interest in ${sanitized}`);
      }
    }

    return elements;
  }

  /**
   * Convert word to story element with internal categorization
   */
  private static convertToStoryElement(word: string): string {
    // Simple categorization for story elements
    const animals = ['dog', 'cat', 'bird', 'fish', 'horse', 'lion', 'tiger', 'elephant', 'bear', 'fox', 'rabbit'];
    const people = ['mom', 'dad', 'sister', 'brother', 'friend', 'teacher', 'doctor', 'princess', 'prince'];
    const places = ['home', 'school', 'park', 'beach', 'forest', 'mountain', 'city', 'farm', 'library'];
    const foods = ['apple', 'banana', 'bread', 'cake', 'cookie', 'chocolate', 'candy', 'pizza'];
    
    const lowerWord = word.toLowerCase();
    
    if (animals.some(animal => lowerWord.includes(animal))) {
      return `a friendly ${word}`;
    } else if (people.some(person => lowerWord.includes(person))) {
      return `a kind ${word}`;
    } else if (places.some(place => lowerWord.includes(place))) {
      return `the magical ${word}`;
    } else if (foods.some(food => lowerWord.includes(food))) {
      return `delicious ${word}`;
    } else {
      return word.includes(' ') ? word : `something about ${word}`;
    }
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
