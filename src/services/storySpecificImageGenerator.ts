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
    
    // Create consistent main character description based on avatar and difficulty
    const mainCharacter = this.createMainCharacterDescription(userInfo, difficulty);
    
    // Extract story elements from current page and all pages for consistency
    const storyElements = this.extractStoryElements(storyText, storyCharacter, allStoryPages);
    
    // Determine image focus based on story content
    const imageFocus = this.determineImageFocus(storyText, pageIndex, storyElements);
    
    // Build the prompt with enhanced consistency and quality
    let prompt = "Professional children's book illustration, ";
    
    // Art style based on difficulty with enhanced quality
    const artStyle = this.getArtStyleForDifficulty(difficulty);
    prompt += `${artStyle}, `;
    
    // Ensure character consistency across all images
    prompt += `ALWAYS show the SAME main character: ${mainCharacter}, `;
    
    // Add secondary character consistency if present
    if (storyElements.secondaryCharacter) {
      prompt += `ALWAYS show the SAME ${storyElements.secondaryCharacter} with consistent appearance, `;
    }
    
    // Build scene based on focus with enhanced storytelling
    switch (imageFocus.type) {
      case 'character-introduction':
        prompt += `scene: ${mainCharacter}`;
        if (imageFocus.setting) {
          prompt += ` standing in ${imageFocus.setting}`;
        }
        if (imageFocus.activity) {
          prompt += ` ${imageFocus.activity}`;
        }
        prompt += `, clear view of character's face and clothing`;
        break;
        
      case 'character-meeting':
        prompt += `scene: ${mainCharacter} meeting a friendly ${storyElements.secondaryCharacter}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        if (imageFocus.emotion) {
          prompt += `, both characters looking ${imageFocus.emotion}`;
        }
        prompt += `, clear interaction between the two characters`;
        break;
        
      case 'adventure-scene':
        if (storyElements.secondaryCharacter) {
          prompt += `scene: ${mainCharacter} and the ${storyElements.secondaryCharacter}`;
        } else {
          prompt += `scene: ${mainCharacter}`;
        }
        if (imageFocus.action) {
          prompt += ` ${imageFocus.action}`;
        }
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        prompt += `, dynamic action scene showing movement and engagement`;
        break;
        
      case 'object-focus':
        prompt += `scene: featuring ${imageFocus.object}`;
        if (imageFocus.setting) {
          prompt += ` prominently displayed in ${imageFocus.setting}`;
        }
        if (mainCharacter && imageFocus.includeCharacter) {
          prompt += ` with ${mainCharacter} discovering or interacting with it`;
        }
        prompt += `, object should be clearly visible and important to the scene`;
        break;
        
      case 'setting-focus':
        prompt += `scene: beautiful detailed view of ${imageFocus.setting}`;
        if (imageFocus.mood) {
          prompt += ` with ${imageFocus.mood} atmosphere`;
        }
        if (mainCharacter) {
          prompt += ` showing ${mainCharacter} exploring the environment`;
        }
        prompt += `, rich environmental details and immersive background`;
        break;
        
      default:
        prompt += `scene: ${mainCharacter}`;
        if (imageFocus.setting) {
          prompt += ` in ${imageFocus.setting}`;
        }
        prompt += `, showing character clearly in the environment`;
    }
    
    // Add cultural elements with improved integration
    prompt += this.addCulturalContext(culturalContext, userInfo.nativeLanguage);
    
    // Add age-appropriate quality and complexity modifiers based on difficulty
    const qualityModifiers = this.getQualityModifiersForDifficulty(difficulty);
    prompt += `, ${qualityModifiers}`;
    
    return prompt;
  }
  
  private static createMainCharacterDescription(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    // Use the passed difficulty parameter instead of userInfo.difficultyLevel
    const difficultyLevel = difficulty;
    let genderDesc = userInfo.avatar?.type === "boy" ? "young boy" : "young girl";
    
    // Make characters slightly older-looking for higher difficulty levels
    if (difficultyLevel === 'hard' || difficultyLevel === 'expert') {
      genderDesc = userInfo.avatar?.type === "boy" ? "boy" : "girl";
    }
    
    const skinToneDesc = {
      pale: "very light skin",
      light: "light skin", 
      medium: "medium skin",
      olive: "olive skin",
      dark: "dark skin"
    }[userInfo.avatar?.skinTone] || "medium skin";
    
    // Ensure consistent character name spelling throughout the story
    const characterName = userInfo.name?.trim() || 'child';
    
    // Add consistent character details for better visual continuity
    const characterDetails = [];
    if (userInfo.favoriteColor) {
      characterDetails.push(`wearing ${userInfo.favoriteColor.toLowerCase()} clothing`);
    }
    
    // Add age-appropriate clothing style based on difficulty
    if (difficultyLevel === 'expert') {
      characterDetails.push('in realistic everyday clothing');
    } else if (difficultyLevel === 'hard') {
      characterDetails.push('in detailed adventure-appropriate clothing');
    }
    
    const baseDescription = `${genderDesc} named ${characterName} with ${skinToneDesc}`;
    
    return characterDetails.length > 0 
      ? `${baseDescription}, ${characterDetails.join(', ')}`
      : baseDescription;
  }
  
  private static extractStoryElements(storyText: string, storyCharacter?: string, allStoryPages?: string[]) {
    const lowerText = storyText.toLowerCase();
    
    // Extract animals/characters mentioned with better name recognition
    const animalKeywords = [
      'cat', 'kitten', 'dog', 'puppy', 'bird', 'eagle', 'owl', 'hawk', 'parrot', 'robin',
      'deer', 'rabbit', 'bunny', 'fox', 'bear', 'cub', 'elephant', 'lion', 'tiger', 
      'horse', 'pony', 'cow', 'pig', 'sheep', 'lamb', 'goat', 'duck', 'chicken', 
      'fish', 'turtle', 'frog', 'butterfly', 'bee', 'spider', 'mouse', 'rat', 
      'squirrel', 'chipmunk', 'raccoon', 'badger', 'hedgehog', 'dragon', 'unicorn'
    ];
    
    // First, look for the story character from previous pages to maintain consistency
    let secondaryCharacter = storyCharacter || null;
    
    // If we have all story pages, analyze them for consistent character naming
    if (allStoryPages && allStoryPages.length > 0) {
      const characterFrequency = new Map<string, number>();
      
      // Count mentions of each animal across all pages
      for (const page of allStoryPages) {
        const pageLower = page.toLowerCase();
        for (const animal of animalKeywords) {
          if (pageLower.includes(animal)) {
            characterFrequency.set(animal, (characterFrequency.get(animal) || 0) + 1);
          }
        }
      }
      
      // Select the most frequently mentioned character for consistency
      if (characterFrequency.size > 0) {
        const mostFrequent = [...characterFrequency.entries()].sort((a, b) => b[1] - a[1])[0];
        secondaryCharacter = mostFrequent[0];
      }
    }
    
    // If no character found yet, search current page
    if (!secondaryCharacter) {
      for (const animal of animalKeywords) {
        if (lowerText.includes(animal)) {
          secondaryCharacter = animal;
          break;
        }
      }
    }
    
    // Extract settings with better context awareness
    const settingKeywords = {
      'forest': 'magical forest',
      'woods': 'enchanted woods',
      'garden': 'beautiful garden',
      'park': 'sunny park',
      'home': 'cozy home',
      'house': 'warm house',
      'school': 'friendly school',
      'beach': 'sandy beach',
      'ocean': 'sparkling ocean',
      'mountain': 'green mountains',
      'castle': 'fairy tale castle',
      'library': 'warm library',
      'kitchen': 'bright kitchen',
      'bedroom': 'cozy bedroom',
      'playground': 'fun playground',
      'farm': 'peaceful farm',
      'meadow': 'flower-filled meadow',
      'valley': 'sunny valley',
      'river': 'flowing river',
      'lake': 'peaceful lake',
      'cave': 'mysterious cave',
      'village': 'friendly village',
      'town': 'bustling town'
    };
    
    let setting = null;
    // Look for setting in current text first, then check all pages for consistency
    for (const [keyword, description] of Object.entries(settingKeywords)) {
      if (lowerText.includes(keyword)) {
        setting = description;
        break;
      }
    }
    
    // If no setting found in current page, check previous pages for consistency
    if (!setting && allStoryPages) {
      for (const page of allStoryPages) {
        const pageLower = page.toLowerCase();
        for (const [keyword, description] of Object.entries(settingKeywords)) {
          if (pageLower.includes(keyword)) {
            setting = description;
            break;
          }
        }
        if (setting) break;
      }
    }
    
    // Extract objects with better recognition
    const objectKeywords = {
      'book': 'magical book',
      'toy': 'colorful toy',
      'ball': 'bouncing ball',
      'flower': 'beautiful flower',
      'tree': 'tall tree',
      'cake': 'delicious cake',
      'cookie': 'sweet cookie',
      'crystal': 'glowing crystal',
      'gem': 'sparkling gem',
      'treasure': 'shiny treasure',
      'chest': 'treasure chest',
      'gift': 'wrapped gift',
      'present': 'special present',
      'star': 'glowing star',
      'crown': 'golden crown',
      'key': 'magical key',
      'map': 'treasure map',
      'wand': 'magic wand',
      'sword': 'brave sword',
      'shield': 'protective shield'
    };
    
    let object = null;
    for (const [keyword, description] of Object.entries(objectKeywords)) {
      if (lowerText.includes(keyword)) {
        object = description;
        break;
      }
    }
    
    // Extract emotions/actions with better context
    const actionKeywords = {
      'walking': 'walking together',
      'running': 'running happily',
      'playing': 'playing together',
      'looking': 'searching carefully',
      'searching': 'looking carefully',
      'finding': 'discovering something',
      'discovering': 'finding something wonderful',
      'helping': 'helping each other',
      'smiling': 'smiling warmly',
      'laughing': 'laughing joyfully',
      'talking': 'talking together',
      'speaking': 'chatting friendly',
      'reading': 'reading together',
      'exploring': 'exploring together',
      'dancing': 'dancing happily',
      'singing': 'singing beautifully',
      'flying': 'soaring through the sky',
      'swimming': 'swimming gracefully',
      'climbing': 'climbing carefully',
      'hiding': 'playing hide and seek',
      'sleeping': 'resting peacefully',
      'eating': 'sharing a meal',
      'celebrating': 'celebrating joyfully'
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
        return 'cartoon-style children\'s book illustration, simple and friendly characters, bold outlines, bright saturated colors, cheerful and whimsical art style similar to Disney animation';
      case 'medium':
        return 'semi-realistic children\'s book illustration, detailed character expressions, soft lighting, warm watercolor and digital art blend, gentle realism with illustrated charm';
      case 'hard':
        return 'realistic children\'s book illustration with detailed textures, natural lighting and shadows, photographic quality with artistic enhancement, detailed backgrounds and environments';
      case 'expert':
        return 'photorealistic illustration style, complex lighting and composition, detailed natural textures, sophisticated artistic rendering similar to high-end animated films, realistic proportions and expressions';
      default:
        return 'beautiful children\'s book illustration with age-appropriate artistic style';
    }
  }
  
  private static getQualityModifiersForDifficulty(difficulty: DifficultyLevel): string {
    const baseModifiers = "consistent character design throughout story, safe and friendly environment, child-appropriate content, NO text or words in image, perfect character continuity";
    
    switch (difficulty) {
      case 'easy':
        return `${baseModifiers}, simple clear composition, bright cheerful lighting, easy to understand visual elements, bold and fun character expressions`;
      case 'medium':
        return `${baseModifiers}, warm atmospheric lighting, moderate detail level, engaging character interactions, balanced composition with clear focal points`;
      case 'hard':
        return `${baseModifiers}, natural realistic lighting with soft shadows, rich environmental details, complex scene composition, sophisticated color palette, detailed character expressions`;
      case 'expert':
        return `${baseModifiers}, cinematic lighting and composition, photorealistic textures and materials, advanced atmospheric effects, museum-quality artistic detail, professional illustration standards`;
      default:
        return `${baseModifiers}, high quality digital art`;
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