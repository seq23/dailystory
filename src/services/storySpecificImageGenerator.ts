import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export interface StoryImageContext {
  storyText: string;
  pageIndex: number;
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  storyCharacter?: string;
  allStoryPages?: string[];
}

export class StorySpecificImageGenerator {
  
  static generateStorySpecificPrompt(context: StoryImageContext): string {
    const { storyText, pageIndex, userInfo, difficulty, storyCharacter, allStoryPages } = context;
    
    // Get cultural context
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    
    // Create consistent main character description based on avatar
    const mainCharacter = this.createMainCharacterDescription(userInfo);
    
    // Extract story elements from current page
    const storyElements = this.extractStoryElements(storyText, storyCharacter, allStoryPages);
    
    // Determine image focus based on story content
    const imageFocus = this.determineImageFocus(storyText, pageIndex, storyElements);
    
    // Build the prompt
    let prompt = "Beautiful children's book illustration, ";
    
    // Art style based on difficulty
    const artStyle = this.getArtStyleForDifficulty(difficulty);
    prompt += `${artStyle}, `;
    
    // Build scene based on focus
    switch (imageFocus.type) {
      case 'character-introduction':
        prompt += `showing ${mainCharacter}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        if (imageFocus.activity) {
          prompt += ` ${imageFocus.activity}`;
        }
        break;
        
      case 'character-meeting':
        prompt += `showing ${mainCharacter} meeting ${storyElements.secondaryCharacter}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        if (imageFocus.emotion) {
          prompt += `, both looking ${imageFocus.emotion}`;
        }
        break;
        
      case 'adventure-scene':
        if (storyElements.secondaryCharacter) {
          prompt += `showing ${mainCharacter} and ${storyElements.secondaryCharacter}`;
        } else {
          prompt += `showing ${mainCharacter}`;
        }
        if (imageFocus.action) {
          prompt += ` ${imageFocus.action}`;
        }
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        break;
        
      case 'object-focus':
        prompt += `featuring ${imageFocus.object}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        if (mainCharacter && imageFocus.includeCharacter) {
          prompt += ` with ${mainCharacter} nearby`;
        }
        break;
        
      case 'setting-focus':
        prompt += `beautiful ${imageFocus.setting}`;
        if (imageFocus.mood) {
          prompt += ` with ${imageFocus.mood} atmosphere`;
        }
        break;
        
      default:
        prompt += `showing ${mainCharacter}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
    }
    
    // Add cultural elements
    prompt += this.addCulturalContext(culturalContext, userInfo.nativeLanguage);
    
    // Add quality and safety modifiers
    prompt += ", warm and inviting lighting, safe and friendly environment, high quality digital art, child-appropriate content";
    
    return prompt;
  }
  
  private static createMainCharacterDescription(userInfo: UserInfo): string {
    const genderDesc = userInfo.avatar?.type === "boy" ? "young boy" : "young girl";
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar?.skinTone] || "medium skin";
    
    const characterName = userInfo.name || 'child';
    
    return `${genderDesc} named ${characterName} with ${skinToneDesc}`;
  }
  
  private static extractStoryElements(storyText: string, storyCharacter?: string, allStoryPages?: string[]) {
    const lowerText = storyText.toLowerCase();
    
    // Extract animals/characters mentioned
    const animalKeywords = ['cat', 'dog', 'bird', 'owl', 'deer', 'rabbit', 'fox', 'bear', 'elephant', 'lion', 'tiger', 'horse', 'cow', 'pig', 'sheep', 'goat', 'duck', 'chicken', 'fish', 'turtle', 'frog', 'butterfly', 'bee', 'spider', 'mouse', 'rat', 'squirrel', 'chipmunk'];
    
    let secondaryCharacter = storyCharacter || null;
    
    // If we don't have a story character, try to find one
    if (!secondaryCharacter) {
      for (const animal of animalKeywords) {
        if (lowerText.includes(animal)) {
          secondaryCharacter = animal;
          break;
        }
      }
    }
    
    // Extract settings
    const settingKeywords = {
      'forest': 'magical forest',
      'garden': 'beautiful garden',
      'park': 'sunny park',
      'home': 'cozy home',
      'school': 'friendly school',
      'beach': 'sandy beach',
      'mountain': 'green mountains',
      'castle': 'fairy tale castle',
      'library': 'warm library',
      'kitchen': 'bright kitchen',
      'bedroom': 'cozy bedroom',
      'playground': 'fun playground',
      'farm': 'peaceful farm'
    };
    
    let setting = null;
    for (const [keyword, description] of Object.entries(settingKeywords)) {
      if (lowerText.includes(keyword)) {
        setting = description;
        break;
      }
    }
    
    // Extract objects
    const objectKeywords = {
      'book': 'magical book',
      'toy': 'colorful toy',
      'ball': 'bouncing ball',
      'flower': 'beautiful flower',
      'tree': 'tall tree',
      'cake': 'delicious cake',
      'cookie': 'sweet cookie',
      'crystal': 'glowing crystal',
      'treasure': 'shiny treasure',
      'gift': 'wrapped gift'
    };
    
    let object = null;
    for (const [keyword, description] of Object.entries(objectKeywords)) {
      if (lowerText.includes(keyword)) {
        object = description;
        break;
      }
    }
    
    // Extract emotions/actions
    const actionKeywords = {
      'walking': 'walking together',
      'running': 'running happily',
      'playing': 'playing together',
      'looking': 'searching carefully',
      'finding': 'discovering something',
      'helping': 'helping each other',
      'smiling': 'smiling warmly',
      'laughing': 'laughing joyfully',
      'talking': 'talking together',
      'reading': 'reading together'
    };
    
    let action = null;
    for (const [keyword, description] of Object.entries(actionKeywords)) {
      if (lowerText.includes(keyword)) {
        action = description;
        break;
      }
    }
    
    return {
      secondaryCharacter,
      setting,
      object,
      action
    };
  }
  
  private static determineImageFocus(storyText: string, pageIndex: number, storyElements: any) {
    const lowerText = storyText.toLowerCase();
    
    // First page - character introduction
    if (pageIndex === 0) {
      return {
        type: 'character-introduction',
        setting: storyElements.setting || 'magical forest',
        activity: 'looking happy and ready for adventure',
        includeCharacter: true
      };
    }
    
    // Character meeting detection
    if (storyElements.secondaryCharacter && (
      lowerText.includes('meet') || 
      lowerText.includes('saw') || 
      lowerText.includes('found') ||
      lowerText.includes('rustling') ||
      lowerText.includes('says') ||
      lowerText.includes('hello') ||
      lowerText.includes('hi')
    )) {
      return {
        type: 'character-meeting',
        setting: storyElements.setting,
        emotion: 'friendly and curious',
        includeCharacter: true
      };
    }
    
    // Object focus - if there's an important object
    if (storyElements.object && (
      lowerText.includes('lost') ||
      lowerText.includes('found') ||
      lowerText.includes('treasure') ||
      lowerText.includes('crystal') ||
      lowerText.includes('special')
    )) {
      return {
        type: 'object-focus',
        object: storyElements.object,
        setting: storyElements.setting,
        includeCharacter: true
      };
    }
    
    // Adventure scene - action happening
    if (storyElements.action || 
      lowerText.includes('together') ||
      lowerText.includes('adventure') ||
      lowerText.includes('journey') ||
      lowerText.includes('explore')
    ) {
      return {
        type: 'adventure-scene',
        action: storyElements.action || 'having an adventure',
        setting: storyElements.setting,
        includeCharacter: true
      };
    }
    
    // Setting focus - beautiful environment
    if (storyElements.setting && !storyElements.secondaryCharacter) {
      return {
        type: 'setting-focus',
        setting: storyElements.setting,
        mood: 'peaceful and magical',
        includeCharacter: false
      };
    }
    
    // Default - character scene
    return {
      type: 'character-scene',
      setting: storyElements.setting || 'beautiful outdoor scene',
      activity: storyElements.action || 'looking happy',
      includeCharacter: true
    };
  }
  
  private static getArtStyleForDifficulty(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'easy':
        return 'simple and colorful children\'s book style, large clear shapes, bright cheerful colors';
      case 'medium':
        return 'warm and detailed children\'s book illustration, gentle watercolor style';
      case 'hard':
        return 'detailed children\'s book illustration with rich textures and engaging details';
      case 'expert':
        return 'sophisticated children\'s book illustration with complex composition and beautiful artistic details';
      default:
        return 'beautiful children\'s book illustration';
    }
  }
  
  private static addCulturalContext(culturalContext: any, nativeLanguage: string): string {
    if (nativeLanguage === 'en') {
      return ', diverse and inclusive representation';
    }
    
    // Add subtle cultural elements without being overly specific
    const culturalElements = [];
    
    if (culturalContext.architecture) {
      culturalElements.push('architectural elements inspired by traditional style');
    }
    
    if (culturalContext.clothing) {
      culturalElements.push('culturally appropriate clothing');
    }
    
    if (culturalElements.length > 0) {
      return `, ${culturalElements.join(', ')}`;
    }
    
    return ', culturally diverse and inclusive representation';
  }
}