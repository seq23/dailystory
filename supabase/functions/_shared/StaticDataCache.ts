// Self-contained StaticDataCache for _shared modules
// This file MUST NOT import from other function folders to avoid deployment errors

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class EdgeStaticCache {
  private static instance: EdgeStaticCache;
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours TTL (reduced from 24h)

  private constructor() {}

  static getInstance(): EdgeStaticCache {
    if (!EdgeStaticCache.instance) {
      EdgeStaticCache.instance = new EdgeStaticCache();
    }
    return EdgeStaticCache.instance;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  invalidateOnImportFailure(): void {
    // Clear cache when critical imports fail to force fresh data load
    console.log('🧹 Invalidating static cache due to import failures');
    this.cache.clear();
  }
}

const cache = EdgeStaticCache.getInstance();

// Cultural Context Arrays - Self-contained implementation
export const getCulturalContextArrays = () => {
  const cacheKey = 'cultural_context_arrays';
  
  let contexts = cache.get<any>(cacheKey);
  if (!contexts) {
    contexts = {
      'ar': {
        characterNames: ['Layla', 'Omar', 'Fatima', 'Hassan', 'Amira', 'Karim', 'Zahra', 'Youssef', 'Nadia', 'Tariq'],
        commonFoods: ['dates', 'hummus', 'flatbread', 'lamb', 'rice dishes', 'mint tea', 'olives', 'baklava', 'tahini', 'falafel'],
        celebrations: ['Eid celebrations', 'family feasts', 'mosque gatherings', 'traditional weddings', 'Ramadan iftar', 'harvest festivals', 'naming ceremonies', 'homecoming parties', 'religious holidays', 'community festivals'],
        values: ['hospitality', 'family honor', 'community respect', 'sharing', 'generosity'],
        sports: ['football', 'camel racing', 'horseback riding', 'wrestling', 'archery']
      },
      'es': {
        characterNames: ['Sofia', 'Diego', 'Esperanza', 'Carlos', 'Isabella', 'Miguel', 'Valentina', 'Gabriel', 'Lucia', 'Alejandro'],
        commonFoods: ['tortillas', 'rice and beans', 'tropical fruits', 'empanadas', 'fresh juices', 'tamales', 'quesadillas', 'churros', 'plantains', 'mole'],
        celebrations: ['quinceañeras', 'Día de los Muertos', 'family parties', 'saint day celebrations', 'Las Posadas', 'Cinco de Mayo', 'baptisms', 'Christmas traditions', 'patron saint festivals', 'wedding celebrations'],
        values: ['family loyalty', 'celebration of life', 'community support', 'respect for elders', 'joy'],
        sports: ['football', 'baseball', 'boxing', 'volleyball', 'cycling']
      },
      'es-afro-latina': {
        characterNames: ['Esperanza', 'Joaquín', 'Marisol', 'Roberto', 'Xiomara', 'Esteban', 'Yolanda', 'Fernando', 'Soledad', 'Ramón'],
        commonFoods: ['moros y cristianos', 'tostones', 'yuca con mojo', 'ropa vieja', 'tres leches cake', 'platanos maduros', 'arroz con pollo', 'frijoles negros', 'croquetas', 'café cubano'],
        celebrations: ['carnival celebrations', 'salsa festivals', 'Día de la Raza', 'family reunions', 'quinceañeras', 'religious processions', 'música y baile', 'community block parties', 'cultural heritage festivals', 'Christmas parrandas'],
        values: ['familia', 'resistencia', 'celebración', 'comunidad', 'orgullo'],
        sports: ['football', 'baseball', 'boxing', 'salsa dancing', 'volleyball']
      },
      'zh': {
        characterNames: ['Li Wei', 'Mei Lin', 'Chen Yu', 'Zhang Min', 'Wang Lei', 'Liu Xin', 'Zhou Yun', 'Huang Jie', 'Sun Hua', 'Zhao Gang'],
        commonFoods: ['rice', 'noodles', 'dumplings', 'tea', 'fresh vegetables', 'tofu dishes', 'steamed buns', 'hot pot', 'spring rolls', 'congee'],
        celebrations: ['Chinese New Year', 'Moon Festival', 'Dragon Boat Festival', 'family reunions', 'Lantern Festival', 'Qingming Festival', 'Children\'s Day', 'National Day', 'wedding banquets', 'birthday celebrations'],
        values: ['hard work', 'education', 'family harmony', 'perseverance', 'respect'],
        sports: ['table tennis', 'badminton', 'martial arts', 'diving', 'gymnastics']
      },
      'hi': {
        characterNames: ['Priya', 'Arjun', 'Kavya', 'Rohan', 'Ananya', 'Vikram', 'Sita', 'Dev', 'Ravi', 'Meera'],
        commonFoods: ['curry', 'rice', 'chapati', 'lentils', 'spices', 'mango', 'chai tea', 'samosas', 'biryani', 'lassi'],
        celebrations: ['Diwali', 'Holi', 'weddings', 'harvest festivals', 'temple ceremonies', 'Raksha Bandhan', 'Navratri', 'Karva Chauth', 'Eid celebrations', 'Ganesh Chaturthi'],
        values: ['respect for teachers', 'spiritual growth', 'community harmony', 'hospitality', 'wisdom'],
        sports: ['cricket', 'kabaddi', 'field hockey', 'badminton', 'wrestling']
      },
      'pt': {
        characterNames: ['Ana', 'João', 'Mariana', 'Pedro', 'Beatriz', 'Gabriel', 'Camila', 'Rafael', 'Isabela', 'Lucas'],
        commonFoods: ['fresh fruits', 'grilled meats', 'beans and rice', 'açaí', 'coconut water', 'pão de açúcar', 'feijoada', 'brigadeiros', 'pastéis', 'tapioca'],
        celebrations: ['Carnival', 'beach parties', 'football matches', 'music festivals', 'Festa Junina', 'New Year\'s Eve', 'family gatherings', 'saints\' days', 'graduation parties', 'Christmas celebrations'],
        values: ['joy and celebration', 'friendship', 'environmental care', 'community spirit', 'warmth'],
        sports: ['football', 'volleyball', 'capoeira', 'surfing', 'beach volleyball']
      },
      'fr': {
        characterNames: ['Marie', 'Pierre', 'Camille', 'Antoine', 'Sophie', 'Louis', 'Émilie', 'Nicolas', 'Chloé', 'Alexandre'],
        commonFoods: ['bread', 'cheese', 'pastries', 'fresh produce', 'chocolate', 'croissants', 'baguettes', 'wine', 'crêpes', 'coq au vin'],
        celebrations: ['village festivals', 'harvest celebrations', 'art exhibitions', 'family picnics', 'Bastille Day', 'Christmas markets', 'wine festivals', 'music concerts', 'cultural events', 'regional fairs'],
        values: ['appreciation of beauty', 'culinary arts', 'intellectual discussion', 'cultural heritage', 'elegance'],
        sports: ['football', 'rugby', 'cycling', 'tennis', 'handball']
      },
      'fr-francophone-african': {
        characterNames: ['Aminata', 'Mamadou', 'Fatou', 'Ibrahim', 'Aicha', 'Oumar', 'Mariam', 'Sekou', 'Kadiatou', 'Moussa'],
        commonFoods: ['couscous', 'tajines', 'plantains', 'yassa', 'thieboudienne', 'mafe', 'attiéké', 'fufu', 'jollof rice', 'bissap'],
        celebrations: ['independence days', 'traditional ceremonies', 'harvest festivals', 'community gatherings', 'naming ceremonies', 'mask festivals', 'drumming circles', 'storytelling nights', 'market days', 'seasonal celebrations'],
        values: ['community solidarity', 'respect for elders', 'oral tradition', 'hospitality', 'Ubuntu'],
        sports: ['football', 'basketball', 'wrestling', 'running', 'handball']
      },
      // ⚠️  CRITICAL WARNING FOR FUTURE DEVELOPERS ⚠️
      // 
      // The African American character names array below contains names that are 
      // SENTIMENTAL TO THE OWNER OF THIS APP and must NEVER be modified, removed, 
      // or reduced in any way. These names have deep personal meaning.
      //
      // YOU MAY MODIFY: foods, celebrations, values, sports arrays
      // YOU MUST NEVER TOUCH: the characterNames array for 'en-african-american'
      //
      // ⚠️  DO NOT MODIFY THE NAMES BELOW - THEY ARE SACRED ⚠️
      'en-african-american': {
        characterNames: ['Zoe', 'Cheyenne', 'Brooklyn', 'Surrayah', 'Layla', 'Ricky', 'Scooter', 'Kennedy', 'Christian', 'Carter', 'Calli', 'Serenity', 'Asia', 'India', 'Nia', 'Dariane', 'Eden', 'Sofia', 'Hudson', 'Hanson', 'Holland', 'Harper', 'Cameron', 'Brayden', 'Jayden', 'Chyna', 'Lena', 'Ari', 'Mercedes', 'Sequoia', 'Yaw', 'Amara', 'Kenzie', 'Abo', 'Carlos', 'Ace', 'Cruz', 'Crystal', 'Benny', 'Gerzell', 'Isabella', 'Imani', 'Jordan', 'Tori', 'Amari', 'Will', 'Justin', 'Paige', 'Val', 'Akeelah', 'Erin', 'Shannon', 'Reggie', 'Kelsie', 'Aerric', 'Ayden', 'Jared', 'Lennon', 'Brandon', 'Gabriella', 'Noah', 'Oliva', 'Sterling', 'Korri', 'Corey'],
        commonFoods: ['cornbread', 'fried chicken', 'mac and cheese', 'collard greens', 'sweet potato pie', 'black-eyed peas', 'catfish', 'banana pudding', 'peach cobbler', 'gumbo', 'jambalaya', 'barbecue ribs', 'candied yams', 'pound cake', 'red beans and rice', 'biscuits and gravy', 'shrimp and grits', 'pecan pie', 'chess pie'],
        celebrations: ['Juneteenth', 'family reunions', 'church gatherings', 'block parties', 'graduation celebrations'],
        values: ['community strength', 'family pride', 'perseverance', 'cultural heritage', 'resilience'],
        sports: ['American football', 'basketball', 'baseball', 'soccer', 'track and field']
      },
      'pt-afro-brazilian': {
        characterNames: ['Dandara', 'Zumbi', 'Conceição', 'Benedito', 'Aparecida', 'Joaquim', 'Francisca', 'Sebastião', 'Antônia', 'Manoel'],
        commonFoods: ['acarajé', 'vatapá', 'caruru', 'dendê', 'moqueca', 'bobo de camarão', 'xinxim de galinha', 'abará', 'cocada', 'quindim'],
        celebrations: ['Festa de Iemanjá', 'Lavagem do Bonfim', 'blocos afro', 'capoeira rodas', 'Festa de São João', 'Congadas', 'Maracatu', 'Festival de Inverno de Bonito', 'Festa do Divino', 'Bumba meu boi'],
        values: ['resistência', 'ancestralidade', 'comunidade', 'axé', 'força espiritual'],
        sports: ['capoeira', 'football', 'samba', 'basketball', 'volleyball']
      }
    };
    cache.set(cacheKey, contexts);
  }
  
  return contexts;
};

// Cultural bundle helper for consistency with frontend
export const getCulturalBundle = () => {
  return {
    culturalArrays: getCulturalContextArrays()
  };
};