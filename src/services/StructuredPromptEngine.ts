// Structured Prompt Template Engine
// Phase 1: Enhanced Prompt Engineering with intelligent composition
// Enhanced with placeholder integration and difficulty level mapping

import { SupportedLanguage } from "@/types/multilingual";
import { UserInfo, DifficultyLevel } from "@/types";
import { MulticulturalVisualService } from "./MulticulturalVisualService";
import { DifficultyLevelMapper } from "./DifficultyLevelMapper";

export interface PromptTemplate {
  visualAppearance: string;
  secondaryCharacters: string;
  sceneDescription: string;
  culturalSetting: string;
  styleFramework: string;
  qualityEnhancement: string;
}

export interface EmotionalContext {
  mood: 'happy' | 'calm' | 'exciting' | 'contemplative' | 'adventurous' | 'cozy';
  intensity: 'low' | 'medium' | 'high';
  colorPalette: string[];
  lightingStyle: string;
  compositionStyle: string;
}

export interface CharacterDescriptor {
  name: string;
  type: 'primary' | 'family' | 'friend' | 'teacher' | 'community';
  relationshipToMain: string;
  culturalRole: string;
  physicalTraits: string;
  clothingStyle: string;
  seed?: number;
  lastUsedPage: number;
}

export class StructuredPromptEngine {
  private static readonly STYLE_FRAMEWORKS: Record<DifficultyLevel, string> = {
    'beginner': 'Very simple children\'s book illustration, minimal details, large clear shapes, bright basic colors',
    'easy': 'Simple children\'s book illustration, clear lines, bright cheerful colors, minimal background details',
    'medium': 'Children\'s book art style, detailed characters, vibrant scenes, engaging composition',
    'hard': 'Professional children\'s book illustration, rich details, dynamic composition, sophisticated lighting',
    'expert': 'Award-winning children\'s book art, cinematic composition, masterful storytelling through visuals, complex scenes'
  };

  private static readonly EMOTIONAL_MAPPINGS: Record<string, EmotionalContext> = {
    'happy celebration': {
      mood: 'happy',
      intensity: 'high',
      colorPalette: ['warm yellows', 'bright oranges', 'cheerful blues'],
      lightingStyle: 'bright warm lighting',
      compositionStyle: 'dynamic joyful composition'
    },
    'peaceful moment': {
      mood: 'calm',
      intensity: 'low',
      colorPalette: ['soft pastels', 'gentle greens', 'warm beiges'],
      lightingStyle: 'soft natural lighting',
      compositionStyle: 'balanced serene composition'
    },
    'adventure scene': {
      mood: 'exciting',
      intensity: 'high',
      colorPalette: ['bold blues', 'energetic greens', 'adventurous purples'],
      lightingStyle: 'dramatic adventure lighting',
      compositionStyle: 'dynamic action composition'
    },
    'cozy family time': {
      mood: 'cozy',
      intensity: 'medium',
      colorPalette: ['warm earth tones', 'comfortable browns', 'gentle golds'],
      lightingStyle: 'warm intimate lighting',
      compositionStyle: 'cozy gathering composition'
    }
  };

  /**
   * Phase 1: Intelligent Prompt Composition
   */
  static composeStructuredPrompt(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number,
    characterDescriptors: CharacterDescriptor[],
    emotionalContext?: EmotionalContext
  ): PromptTemplate {
    // Guard: Story text from OpenAI is already resolved, don't re-process
    // Analyze story text for emotional content directly
    const detectedEmotion = this.analyzeEmotionalContent(storyText);
    const finalEmotionalContext = emotionalContext || detectedEmotion;

    // Extract primary scene from story text
    const primaryScene = this.extractPrimaryScene(storyText);
    
    // Generate cultural visual elements
    const culturalProfile = MulticulturalVisualService.getCulturalVisualProfile(userInfo.nativeLanguage as SupportedLanguage);
    
    // Map difficulty level properly
    const normalizedDifficulty = DifficultyLevelMapper.normalizeLevel(
      userInfo.readingLevel || userInfo.difficultyLevel || 'easy'
    );
    
    // Compose template sections with placeholder-resolved data
    const template: PromptTemplate = {
      visualAppearance: this.composeVisualAppearance(userInfo, characterDescriptors),
      secondaryCharacters: this.composeSecondaryCharacters(characterDescriptors, culturalProfile),
      sceneDescription: this.composeSceneDescription(primaryScene, finalEmotionalContext, userInfo),
      culturalSetting: this.composeCulturalSetting(userInfo, culturalProfile),
      styleFramework: this.composeStyleFramework(normalizedDifficulty, finalEmotionalContext),
      qualityEnhancement: this.composeQualityEnhancement(userInfo, culturalProfile)
    };

    console.log(`🎨 Structured prompt composed for page ${pageNumber}:`, {
      emotion: finalEmotionalContext.mood,
      characterCount: characterDescriptors.length,
      culturalContext: userInfo.nativeLanguage
    });

    return template;
  }

  /**
   * Analyze story text for emotional content and map to visual style
   */
  private static analyzeEmotionalContent(storyText: string): EmotionalContext {
    const text = storyText.toLowerCase();
    
    // Happy/celebration patterns
    if (text.includes('laugh') || text.includes('smile') || text.includes('joy') || 
        text.includes('celebrate') || text.includes('party') || text.includes('happy')) {
      return this.EMOTIONAL_MAPPINGS['happy celebration'];
    }
    
    // Adventure/exciting patterns
    if (text.includes('adventure') || text.includes('explore') || text.includes('discover') ||
        text.includes('journey') || text.includes('exciting') || text.includes('climb')) {
      return this.EMOTIONAL_MAPPINGS['adventure scene'];
    }
    
    // Cozy/family patterns
    if (text.includes('family') || text.includes('home') || text.includes('cozy') ||
        text.includes('together') || text.includes('warm') || text.includes('hug')) {
      return this.EMOTIONAL_MAPPINGS['cozy family time'];
    }
    
    // Default to peaceful
    return this.EMOTIONAL_MAPPINGS['peaceful moment'];
  }

  /**
   * Extract the most visually descriptive scene from story text
   */
  private static extractPrimaryScene(storyText: string): string {
    const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Score sentences by visual action words
    const actionWords = ['walk', 'run', 'play', 'look', 'see', 'go', 'find', 'hold', 'sit', 'stand', 'move', 'jump', 'climb'];
    
    let bestScene = sentences[0] || storyText;
    let highestScore = 0;
    
    for (const sentence of sentences) {
      const words = sentence.toLowerCase().split(/\s+/);
      const score = words.filter(word => actionWords.includes(word)).length;
      
      if (score > highestScore) {
        highestScore = score;
        bestScene = sentence.trim();
      }
    }
    
    return bestScene;
  }

  /**
   * Compose visual appearance section with cultural authenticity
   */
  private static composeVisualAppearance(userInfo: UserInfo, characters: CharacterDescriptor[]): string {
    const primaryCharacter = characters.find(c => c.type === 'primary');
    if (!primaryCharacter) {
      return MulticulturalVisualService.generateCulturalCharacterDescription(userInfo);
    }
    
    return primaryCharacter.physicalTraits;
  }

  /**
   * Compose secondary characters with family resemblance and cultural consistency
   */
  private static composeSecondaryCharacters(characters: CharacterDescriptor[], culturalProfile: any): string {
    const secondaryChars = characters.filter(c => c.type !== 'primary');
    
    if (secondaryChars.length === 0) return '';
    
    const descriptions = secondaryChars.map(char => {
      // Add family resemblance for family members
      if (char.type === 'family') {
        return `${char.relationshipToMain} with similar ${culturalProfile.skinTones[0]}, ${char.physicalTraits}`;
      }
      
      return `${char.relationshipToMain} ${char.physicalTraits}`;
    });
    
    return descriptions.length > 0 ? `, with ${descriptions.join(', ')}` : '';
  }

  /**
   * Compose scene description with emotional tone mapping and placeholder integration
   */
  private static composeSceneDescription(
    primaryScene: string, 
    emotionalContext: EmotionalContext,
    userInfo: UserInfo
  ): string {
    // Guard: Scene from generated story is already resolved
    // Integrate user preferences into scene composition
    const userColorPreference = userInfo.favoriteColor;
    let colorPalette = emotionalContext.colorPalette.join(', ');
    
    // Enhance color palette with user's favorite color if appropriate
    if (userColorPreference && !colorPalette.toLowerCase().includes(userColorPreference.toLowerCase())) {
      colorPalette = `${userColorPreference} tones, ${colorPalette}`;
    }
    
    const lighting = emotionalContext.lightingStyle;
    
    return `${primaryScene}, ${colorPalette}, ${lighting}`;
  }

  /**
   * Compose cultural setting with authentic elements and user preferences
   */
  private static composeCulturalSetting(userInfo: UserInfo, culturalProfile: any): string {
    let setting = MulticulturalVisualService.generateCulturalSetting(userInfo);
    
    // Note: Setting generation should handle user info directly, not through placeholders
    
    const culturalElements = culturalProfile.culturalElements.slice(0, 2).join(', ');
    
    // Integrate user's special request into cultural setting if relevant
    const specialRequest = userInfo.specialRequest;
    if (specialRequest && specialRequest.includes('theme:')) {
      const theme = specialRequest.replace('theme:', '').trim();
      return `${setting}, ${culturalElements}, ${theme} atmosphere`;
    }
    
    return `${setting}, ${culturalElements}`;
  }

  /**
   * Compose style framework based on difficulty and emotion
   */
  private static composeStyleFramework(difficulty: DifficultyLevel, emotionalContext: EmotionalContext): string {
    const baseStyle = this.STYLE_FRAMEWORKS[difficulty];
    const composition = emotionalContext.compositionStyle;
    
    return `${baseStyle}, ${composition}`;
  }

  /**
   * Compose quality enhancement with cultural sensitivity
   */
  private static composeQualityEnhancement(userInfo: UserInfo, culturalProfile: any): string {
    const baseQuality = MulticulturalVisualService.getQualityEnhancementTerms(userInfo);
    const negativePrompt = MulticulturalVisualService.generateCulturalNegativePrompt(userInfo);
    
    return `${baseQuality}, positive cultural representation, respectful authentic portrayal`;
  }

  /**
   * Convert template to final prompt string
   */
  static templateToPrompt(template: PromptTemplate): string {
    const sections = [
      template.visualAppearance,
      template.secondaryCharacters,
      template.sceneDescription,
      template.culturalSetting,
      template.styleFramework,
      template.qualityEnhancement
    ].filter(section => section.trim().length > 0);
    
    return sections.join(' ');
  }

  /**
   * Context-aware style selection based on story elements
   */
  static selectDynamicStyle(
    storyText: string,
    userInfo: UserInfo,
    pageNumber: number,
    totalPages: number
  ): string {
    // Guard: Story text is already resolved from generation
    const emotionalContext = this.analyzeEmotionalContent(storyText);
    
    // Use proper difficulty level mapping
    const difficulty = DifficultyLevelMapper.normalizeLevel(
      userInfo.readingLevel || userInfo.difficultyLevel || 'easy'
    );
    
    // Adjust complexity based on story progression
    const progressionFactor = pageNumber / totalPages;
    let adjustedDifficulty = difficulty;
    
    // Increase visual complexity in later pages for advanced readers
    if (difficulty === 'expert' && progressionFactor > 0.7) {
      return `${this.STYLE_FRAMEWORKS[difficulty]}, ${emotionalContext.compositionStyle}, increasingly sophisticated visual storytelling`;
    }
    
    return this.composeStyleFramework(adjustedDifficulty, emotionalContext);
  }
}
