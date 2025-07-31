import type { UserInfo } from "@/components/UserInfoForm";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export interface ImageGenerationContext {
  storyText: string;
  pageIndex: number;
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  totalPages: number;
}

export class ImprovedImageGenerator {
  
  static generateImagePrompt(context: ImageGenerationContext): string {
    const { storyText, pageIndex, userInfo, difficulty, totalPages } = context;
    
    // Create simple, clear character description
    const character = this.createSimpleCharacter(userInfo, difficulty);
    
    // Extract ONE main element from the story text
    const mainElement = this.extractPrimaryElement(storyText);
    
    // Get art style for difficulty
    const artStyle = this.getSimpleArtStyle(difficulty);
    
    // Determine scene type based on page position
    const sceneType = this.getSceneType(pageIndex, totalPages);
    
    // Build clean, simple prompt
    let prompt = `${artStyle} children's book illustration. `;
    
    // Add character (always the main focus)
    prompt += `${character} `;
    
    // Add main scene element
    if (mainElement.action) {
      prompt += `${mainElement.action} `;
    } else if (mainElement.animal) {
      prompt += `with ${mainElement.animal} `;
    } else if (mainElement.object) {
      prompt += `with ${mainElement.object} `;
    } else if (mainElement.setting) {
      prompt += `in ${mainElement.setting} `;
    }
    
    // Add scene type context
    prompt += `${sceneType}. `;
    
    // Add quality and safety modifiers
    prompt += this.getQualityModifiers(difficulty);
    
    return prompt.trim();
  }
  
  private static createSimpleCharacter(userInfo: UserInfo, difficulty: DifficultyLevel): string {
    const isYoung = difficulty === 'easy' || difficulty === 'medium';
    const agePrefix = isYoung ? 'young ' : '';
    const gender = userInfo.avatar?.type === 'boy' ? 'boy' : 'girl';
    
    const skinTones = {
      pale: 'very light skin',
      light: 'light skin',
      medium: 'medium skin', 
      olive: 'olive skin',
      dark: 'dark skin'
    };
    
    const skinTone = skinTones[userInfo.avatar?.skinTone] || 'medium skin';
    const name = userInfo.name?.trim() || 'child';
    
    // Add clothing color if provided
    let characterDesc = `${agePrefix}${gender} named ${name} with ${skinTone}`;
    
    if (userInfo.favoriteColor) {
      characterDesc += `, wearing ${userInfo.favoriteColor.toLowerCase()} clothing`;
    }
    
    return characterDesc;
  }
  
  private static extractPrimaryElement(storyText: string): {
    action?: string;
    object?: string;
    setting?: string;
    animal?: string;
  } {
    const text = storyText.toLowerCase();
    
    // Simple action detection
    const actions = {
      'walking': 'walking',
      'running': 'running',
      'playing': 'playing',
      'looking': 'looking',
      'finding': 'finding something',
      'meeting': 'meeting someone',
      'exploring': 'exploring',
      'reading': 'reading',
      'sleeping': 'sleeping',
      'eating': 'eating',
      'dancing': 'dancing',
      'singing': 'singing'
    };
    
    // Simple object detection
    const objects = {
      'book': 'a magical book',
      'ball': 'a colorful ball',
      'flower': 'beautiful flowers',
      'tree': 'a big tree',
      'toy': 'a fun toy',
      'gift': 'a special gift',
      'treasure': 'hidden treasure',
      'crystal': 'a shiny crystal'
    };
    
    // Simple setting detection
    const settings = {
      'forest': 'a magical forest',
      'garden': 'a beautiful garden',
      'home': 'a cozy home',
      'school': 'a friendly school',
      'park': 'a sunny park',
      'beach': 'a sandy beach',
      'mountain': 'green mountains',
      'castle': 'a fairy tale castle'
    };
    
    // Simple animal detection - prioritized for story elements
    const animals = {
      'cat': 'a friendly cat',
      'kitten': 'a cute kitten',
      'dog': 'a happy dog',
      'puppy': 'a playful puppy',
      'bird': 'a colorful bird',
      'rabbit': 'a cute rabbit',
      'bunny': 'a fluffy bunny',
      'bear': 'a gentle bear',
      'deer': 'a graceful deer',
      'fox': 'a clever fox',
      'owl': 'a wise owl',
      'butterfly': 'a beautiful butterfly'
    };
    
    // Find first match in order of priority
    for (const [keyword, description] of Object.entries(actions)) {
      if (text.includes(keyword)) {
        return { action: description };
      }
    }
    
    for (const [keyword, description] of Object.entries(objects)) {
      if (text.includes(keyword)) {
        return { object: description };
      }
    }
    
    for (const [keyword, description] of Object.entries(animals)) {
      if (text.includes(keyword)) {
        return { animal: description };
      }
    }
    
    for (const [keyword, description] of Object.entries(settings)) {
      if (text.includes(keyword)) {
        return { setting: description };
      }
    }
    
    return { setting: 'a peaceful outdoor scene' };
  }
  
  private static getSimpleArtStyle(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'easy':
        return 'Colorful cartoon-style';
      case 'medium':
        return 'Gentle illustrated';
      case 'hard':
        return 'Detailed realistic';
      case 'expert':
        return 'Photorealistic';
      default:
        return 'Beautiful illustrated';
    }
  }
  
  private static getSceneType(pageIndex: number, totalPages: number): string {
    if (pageIndex === 0) {
      return 'Character introduction scene, clear and welcoming';
    } else if (pageIndex === totalPages - 1) {
      return 'Happy ending scene, peaceful and satisfying';
    } else if (pageIndex < totalPages / 2) {
      return 'Adventure beginning, exciting and safe';
    } else {
      return 'Story development, engaging and friendly';
    }
  }
  
  private static getQualityModifiers(difficulty: DifficultyLevel): string {
    const baseModifiers = 'Safe for children, no text in image, clear composition, warm lighting';
    
    switch (difficulty) {
      case 'easy':
        return `${baseModifiers}, simple and cheerful, bright colors`;
      case 'medium':
        return `${baseModifiers}, detailed and engaging, soft colors`;
      case 'hard':
        return `${baseModifiers}, rich detail, natural lighting`;
      case 'expert':
        return `${baseModifiers}, sophisticated detail, cinematic quality`;
      default:
        return baseModifiers;
    }
  }
}