// Cultural Context Service for Supabase Edge Functions
// Provides cultural arrays for dynamic AI prompt enhancement

export interface CulturalArrays {
  characterNames: string[];
  commonFoods: string[];
  celebrations: string[];
  values: string[];
  sports: string[];
}

const CULTURAL_CONTEXTS: Record<string, CulturalArrays> = {
  'ar': { // Arabic/MENA
    characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef'],
    commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives'],
    celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings'],
    values: ['hospitality', 'family honor', 'community respect', 'sharing with others'],
    sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
  },
  
  'es': { // Spanish/Latin American
    characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel'],
    commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices'],
    celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations'],
    values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders'],
    sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
  },

  'zh': { // Chinese
    characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun'],
    commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes'],
    celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions'],
    values: ['hard work', 'education', 'family harmony', 'perseverance'],
    sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
  },

  'hi': { // Hindi/Indian
    characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev'],
    commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea'],
    celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies'],
    values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality'],
    sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
  },

  'pt': { // Portuguese/Brazilian
    characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'],
    commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water'],
    celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals'],
    values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit'],
    sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
  },

  'fr': { // French
    characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas'],
    commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes'],
    celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day'],
    values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage'],
    sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
  },

  'fr-francophone-african': { // Francophone African
    characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou'],
    commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké'],
    celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings'],
    values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality'],
    sports: ['football', 'basketball', 'wrestling', 'running', 'handball']
  },

  'en': { // English - Native speakers
    characterNames: ['Emma', 'Liam', 'Olivia', 'Noah', 'Sophia', 'Mason', 'Isabella', 'Jacob'],
    commonFoods: ['sandwiches', 'pizza', 'burgers', 'salads', 'snacks', 'milk', 'fruit'],
    celebrations: ['birthdays', 'holidays', 'school events', 'sports games', 'family vacations'],
    values: ['independence', 'achievement', 'fairness', 'creativity'],
    sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
  },

  'en-african-american': { // African American
    characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos', 'Ace', 'Cruz', 'Crystal', 'Benny', 'Gerzell', 'Isabella', 'Imani', 'Jordan', 'Tori', 'Amari', 'Will', 'Justin', 'Paige', 'Val', 'Akeelah', 'Erin', 'Shannon', 'Reggie', 'Kelsie', 'Aerric', 'Ayden', 'Jared', 'Lennon', 'Brandon', 'Gabriella', 'Noah', 'Oliva', 'Sterling', 'Korri', 'Corey'],
    commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
    celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
    values: ['community strength', 'family pride', 'perseverance', 'educational achievement', 'cultural heritage', 'resilience'],
    sports: ['American football', 'basketball', 'baseball', 'soccer', 'hockey', 'tennis', 'swimming', 'track and field']
  }
};

/**
 * Fetches cultural arrays for dynamic AI prompt enhancement
 * Uses same logic as frontend CulturalAdaptationService but returns arrays
 */
export function fetchCulturalArrays(userInfo: any): CulturalArrays | null {
  if (!userInfo) return null;
  
  const nativeLanguage = userInfo.nativeLanguage || 'en';
  const skinTone = userInfo.avatar?.skinTone || userInfo.avatarSkinTone;
  
  // Determine cultural context key based on language + skin tone
  let culturalKey = nativeLanguage;
  if (nativeLanguage === 'en' && skinTone === 'dark') {
    culturalKey = 'en-african-american';
  } else if (nativeLanguage === 'fr' && skinTone === 'dark') {
    culturalKey = 'fr-francophone-african';
  }
  
  return CULTURAL_CONTEXTS[culturalKey] || null;
}