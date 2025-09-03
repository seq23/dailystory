import type { UserInfo } from "@/types";

export interface CulturalContext {
  region: string;
  characterNames: string[];
  familyStructures: string[];
  commonFoods: string[];
  celebrations: string[];
  geographicalFeatures: string[];
  clothingStyles: string[];
  architecture: string[];
  languages: string[];
  values: string[];
}

export class CulturalAdaptationService {
  private static culturalContexts: Record<string, CulturalContext> = {
    'ar': { // Arabic/MENA
      region: 'MENA',
      characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef'],
      familyStructures: ['extended family', 'grandparents nearby', 'cousins visiting', 'family gatherings'],
      commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives'],
      celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings'],
      geographicalFeatures: ['desert landscapes', 'oasis gardens', 'coastal cities', 'mountain villages'],
      clothingStyles: ['flowing robes', 'colorful scarves', 'embroidered patterns', 'traditional dress'],
      architecture: ['domed buildings', 'courtyard houses', 'geometric patterns', 'fountains'],
      languages: ['Arabic phrases', 'family words in Arabic'],
      values: ['hospitality', 'family honor', 'community respect', 'sharing with others']
    },
    
    'es': { // Spanish/Latin American
      region: 'Latin America',
      characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel'],
      familyStructures: ['big family dinners', 'abuela stories', 'many cousins', 'family traditions'],
      commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices'],
      celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations'],
      geographicalFeatures: ['rainforests', 'mountains', 'beaches', 'colorful towns', 'plazas'],
      clothingStyles: ['bright colors', 'embroidered blouses', 'woven patterns', 'festive dresses'],
      architecture: ['colonial buildings', 'tile roofs', 'church bells', 'market squares'],
      languages: ['Spanish phrases', 'familia words'],
      values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders']
    },

    'zh': { // Chinese
      region: 'East Asia',
      characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun'],
      familyStructures: ['multigenerational homes', 'respect for elders', 'study groups', 'family meals'],
      commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes'],
      celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions'],
      geographicalFeatures: ['bamboo forests', 'mountains', 'rivers', 'ancient temples', 'gardens'],
      clothingStyles: ['silk garments', 'traditional patterns', 'red for celebrations', 'jade jewelry'],
      architecture: ['pagodas', 'courtyards', 'calligraphy', 'lanterns', 'bridges'],
      languages: ['Mandarin phrases', 'family titles'],
      values: ['hard work', 'education', 'family harmony', 'perseverance']
    },

    'hi': { // Hindi/Indian
      region: 'South Asia', 
      characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev'],
      familyStructures: ['joint families', 'multiple generations', 'arranged marriages', 'festival preparations'],
      commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea'],
      celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies'],
      geographicalFeatures: ['monsoon rains', 'rivers', 'mountains', 'tropical forests', 'holy sites'],
      clothingStyles: ['colorful saris', 'kurtas', 'intricate patterns', 'jewelry', 'henna designs'],
      architecture: ['temples', 'palaces', 'carved stonework', 'courtyards', 'domes'],
      languages: ['Hindi phrases', 'Sanskrit words'],
      values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality']
    },

    'pt': { // Portuguese/Brazilian
      region: 'South America',
      characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'],
      familyStructures: ['close families', 'beach gatherings', 'neighborhood friends', 'festive meals'],
      commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water'],
      celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals'],
      geographicalFeatures: ['tropical beaches', 'rainforests', 'mountains', 'rivers', 'colorful cities'],
      clothingStyles: ['bright swimwear', 'casual clothing', 'football jerseys', 'festival costumes'],
      architecture: ['colonial churches', 'colorful houses', 'beach huts', 'modern buildings'],
      languages: ['Portuguese phrases', 'musical terms'],
      values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit']
    },

    'fr': { // French
      region: 'Europe/Africa',
      characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas'],
      familyStructures: ['small families', 'weekend visits', 'café culture', 'evening dinners'],
      commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'wine culture'],
      celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics'],
      geographicalFeatures: ['countryside', 'châteaux', 'vineyards', 'coastal areas', 'mountain regions'],
      clothingStyles: ['elegant fashion', 'scarves', 'classic styles', 'seasonal clothing'],
      architecture: ['stone buildings', 'café terraces', 'historic monuments', 'gardens'],
      languages: ['French phrases', 'cultural expressions'],
      values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage']
    },

    'en': { // English - Native speakers
      region: 'English-speaking',
      characterNames: ['Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Mason', 'Isabella', 'Jacob'],
      familyStructures: ['nuclear families', 'weekend activities', 'school friends', 'community events'],
      commonFoods: ['sandwiches', 'pizza', 'burgers', 'salads', 'snacks', 'milk', 'fruit'],
      celebrations: ['birthdays', 'holidays', 'school events', 'sports games', 'family vacations'],
      geographicalFeatures: ['parks', 'suburbs', 'schools', 'playgrounds', 'neighborhoods'],
      clothingStyles: ['casual wear', 'school uniforms', 'sports clothing', 'seasonal outfits'],
      architecture: ['houses with yards', 'schools', 'libraries', 'community centers'],
      languages: ['regional expressions', 'slang terms'],
      values: ['independence', 'achievement', 'fairness', 'creativity']
    }
  };

  static getCulturalContext(nativeLanguage: string): CulturalContext {
    return this.culturalContexts[nativeLanguage] || this.culturalContexts['en'];
  }

  static getAppropriateCharacterName(userInfo: UserInfo, gender?: 'boy' | 'girl'): string {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en');
    const names = context.characterNames;
    
    // For now, return a random culturally appropriate name
    // In the future, this could be more sophisticated based on gender, age, etc.
    return names[Math.floor(Math.random() * names.length)];
  }

  static getCulturalElements(userInfo: UserInfo): {
    food: string;
    celebration: string;
    setting: string;
    value: string;
  } {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en');
    
    return {
      food: context.commonFoods[Math.floor(Math.random() * context.commonFoods.length)],
      celebration: context.celebrations[Math.floor(Math.random() * context.celebrations.length)],
      setting: context.geographicalFeatures[Math.floor(Math.random() * context.geographicalFeatures.length)],
      value: context.values[Math.floor(Math.random() * context.values.length)]
    };
  }

  static adaptStoryForCulture(
    storyTemplate: string, 
    userInfo: UserInfo,
    isESLLearner: boolean = false
  ): string {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en');
    const elements = this.getCulturalElements(userInfo);
    
    let adaptedStory = storyTemplate;

    // Replace generic elements with culturally appropriate ones
    adaptedStory = adaptedStory.replace(/\{cultural_food\}/g, elements.food);
    adaptedStory = adaptedStory.replace(/\{cultural_celebration\}/g, elements.celebration);
    adaptedStory = adaptedStory.replace(/\{cultural_setting\}/g, elements.setting);
    adaptedStory = adaptedStory.replace(/\{cultural_value\}/g, elements.value);

    // Add ESL-friendly language patterns if user is learning English
    if (isESLLearner) {
      // Add more repetitive sentence structures for language learning
      adaptedStory = this.addLanguageLearningPatterns(adaptedStory, userInfo);
    }

    return adaptedStory;
  }

  private static addLanguageLearningPatterns(story: string, userInfo: UserInfo): string {
    // Add repetitive patterns that help with English language acquisition
    // This could include common English phrases, sentence structures, etc.
    return story;
  }

  static getCulturalGuidanceString(nativeLanguage: string): string {
    const context = this.getCulturalContext(nativeLanguage);
    
    const languageGuidance: Record<string, string> = {
      'fr': `aspects of French culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'es': `aspects of Hispanic/Latino culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'ar': `aspects of Arabic culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'pt': `aspects of Portuguese culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'zh': `aspects of Chinese culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'hi': `aspects of Indian culture. For inspiration: ${context.commonFoods[0]}, ${context.celebrations[0]}`,
      'en': '' // No cultural additions for English speakers
    };
    
    return languageGuidance[nativeLanguage] || '';
  }

  static generateCulturallyAdaptedCharacterDescription(userInfo: UserInfo): string {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en');
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    
    if (isESLLearner) {
      // For ESL learners, include cultural elements that make the character relatable
      return `a ${userInfo.avatar.type} from ${context.region} who loves ${userInfo.hobbies}`;
    } else {
      // For native speakers, use standard character description  
      return `a ${userInfo.avatar.type} who loves ${userInfo.hobbies}`;
    }
  }
}

export default CulturalAdaptationService;