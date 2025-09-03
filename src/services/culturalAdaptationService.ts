import type { UserInfo } from "@/types";

export interface CulturalContext {
  region: string;
  characterNames: string[];
  commonFoods: string[];
  celebrations: string[];
  values: string[];
  sports: string[];
}

export class CulturalAdaptationService {
  private static culturalContexts: Record<string, CulturalContext> = {
    'ar': { // Arabic/MENA
      region: 'MENA',
      characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef'],
      commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives'],
      celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings'],
      values: ['hospitality', 'family honor', 'community respect', 'sharing with others'],
      sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
    },
    
    'es': { // Spanish/Latin American
      region: 'Latin America',
      characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel'],
      commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices'],
      celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations'],
      values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders'],
      sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
    },

    'zh': { // Chinese
      region: 'East Asia',
      characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun'],
      commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes'],
      celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions'],
      values: ['hard work', 'education', 'family harmony', 'perseverance'],
      sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
    },

    'hi': { // Hindi/Indian
      region: 'South Asia', 
      characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev'],
      commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea'],
      celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies'],
      values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality'],
      sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
    },

    'pt': { // Portuguese/Brazilian
      region: 'South America',
      characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'],
      commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water'],
      celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals'],
      values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit'],
      sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
    },

    'fr': { // French
      region: 'France',
      characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas'],
      commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes'],
      celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day'],
      values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage'],
      sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
    },

    'fr-francophone-african': { // Francophone African
      region: 'Francophone Africa',
      characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou'],
      commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké'],
      celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings'],
      values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality'],
      sports: ['football', 'basketball', 'wrestling', 'running', 'handball']
    },

    'en': { // English - Native speakers
      region: 'English-speaking',
      characterNames: ['Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Mason', 'Isabella', 'Jacob'],
      commonFoods: ['sandwiches', 'pizza', 'burgers', 'salads', 'snacks', 'milk', 'fruit'],
      celebrations: ['birthdays', 'holidays', 'school events', 'sports games', 'family vacations'],
      values: ['independence', 'achievement', 'fairness', 'creativity'],
      sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
    },

    'en-african-american': { // African American
      region: 'African American',
      characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos'],
      commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
      celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
      values: ['community strength', 'family pride', 'perseverance', 'educational achievement', 'cultural heritage', 'resilience'],
      sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
    }
  };

  static getCulturalContext(nativeLanguage: string, userInfo?: UserInfo): CulturalContext {
    // Check for African American cultural context (English + dark skin)
    if (nativeLanguage === 'en' && userInfo?.avatar?.skinTone === 'dark') {
      return this.culturalContexts['en-african-american'] || this.culturalContexts['en'];
    }
    // Check for Francophone African cultural context (French + dark skin)
    if (nativeLanguage === 'fr' && userInfo?.avatar?.skinTone === 'dark') {
      return this.culturalContexts['fr-francophone-african'] || this.culturalContexts['fr'];
    }
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
    sport: string;
    value: string;
  } {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en', userInfo);
    
    return {
      food: context.commonFoods[Math.floor(Math.random() * context.commonFoods.length)],
      celebration: context.celebrations[Math.floor(Math.random() * context.celebrations.length)],
      sport: context.sports[Math.floor(Math.random() * context.sports.length)],
      value: context.values[Math.floor(Math.random() * context.values.length)]
    };
  }

  static adaptStoryForCulture(
    storyTemplate: string, 
    userInfo: UserInfo,
    isESLLearner: boolean = false
  ): string {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en', userInfo);
    const elements = this.getCulturalElements(userInfo);
    
    let adaptedStory = storyTemplate;

    // Replace generic elements with culturally appropriate ones
    adaptedStory = adaptedStory.replace(/\{cultural_food\}/g, elements.food);
    adaptedStory = adaptedStory.replace(/\{cultural_celebration\}/g, elements.celebration);
    adaptedStory = adaptedStory.replace(/\{cultural_sport\}/g, elements.sport);
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

  static getCulturalGuidanceString(userInfo: UserInfo): string {
    const nativeLanguage = userInfo.nativeLanguage || 'en';
    const skinTone = userInfo.avatar?.skinTone;
    
    // Determine cultural context key based on language + skin tone
    let culturalKey = nativeLanguage;
    if (nativeLanguage === 'en' && skinTone === 'dark') {
      culturalKey = 'en-african-american';
    } else if (nativeLanguage === 'fr' && skinTone === 'dark') {
      culturalKey = 'fr-francophone-african';
    }
    
    const context = this.getCulturalContext(culturalKey, userInfo);
    
    const languageGuidance: Record<string, string> = {
      'fr': `This child is likely from French culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'fr-francophone-african': `This child is likely from Francophone African culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'es': `This child is likely from Hispanic/Latino culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'ar': `This child is likely from Arabic/MENA culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'pt': `This child is likely from Portuguese/Brazilian culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'zh': `This child is likely from Chinese/East Asian culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'hi': `This child is likely from Indian/South Asian culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'en-african-american': `This child is likely from African American culture, subtly weave ${context.commonFoods[0]} or ${context.celebrations[0]} into the story in small, varied ways—like a passing detail and never a stereotype. Use sparingly and randomly. never repeat. never make it the focus. always background noise.`,
      'en': '' // English + non-dark skin = empty string (no cultural context)
    };

    return languageGuidance[culturalKey] || '';
  }

  static generateCulturallyAdaptedCharacterDescription(userInfo: UserInfo): string {
    const context = this.getCulturalContext(userInfo.nativeLanguage || 'en', userInfo);
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