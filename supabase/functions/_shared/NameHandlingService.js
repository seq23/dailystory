/**
 * ============================================================================
 * NAME HANDLING CLARIFICATION SERVICE - PHASE 7 IMPLEMENTATION
 * ============================================================================
 * 
 * CRITICAL DISTINCTION:
 * - Image Generation: ALWAYS uses userInfo.name (child's real name)
 * - Story Generation: Uses cultural name arrays for fictional characters only
 * 
 * This service prevents confusion between real names and story names
 * ============================================================================
 */

// ============= CULTURAL NAME ARRAYS FOR STORY GENERATION ONLY =============
const CULTURAL_STORY_NAMES = {
  // English/American names for story characters
  'en': {
    boys: ['Alex', 'Ben', 'Charlie', 'David', 'Ethan', 'Felix', 'George', 'Henry', 'Ian', 'Jack'],
    girls: ['Ava', 'Bella', 'Chloe', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah', 'Iris', 'Julia']
  },
  
  // African American story names
  'en-african-american': {
    boys: ['Jamal', 'Marcus', 'Darius', 'Xavier', 'Malik', 'Khalil', 'Ashton', 'Trevon', 'Jordan', 'Andre'],
    girls: ['Aaliyah', 'Zara', 'Nia', 'Maya', 'Kendra', 'Jasmine', 'Imani', 'Keisha', 'Tiana', 'Alicia']
  },
  
  // Chinese story names
  'zh': {
    boys: ['Wei', 'Ming', 'Jun', 'Hao', 'Lei', 'Feng', 'Chen', 'Li', 'Yang', 'Kai'],
    girls: ['Mei', 'Ling', 'Xia', 'Yun', 'Hui', 'Jing', 'Na', 'Fang', 'Yan', 'Xin']
  },
  
  // Hindi/Indian story names
  'hi': {
    boys: ['Arjun', 'Rohan', 'Aarav', 'Vihaan', 'Adit', 'Kiran', 'Dev', 'Raj', 'Vikram', 'Arun'],
    girls: ['Priya', 'Kavya', 'Ananya', 'Diya', 'Isha', 'Meera', 'Riya', 'Sanya', 'Tara', 'Zara']
  },
  
  // Arabic story names
  'ar': {
    boys: ['Omar', 'Ali', 'Ahmed', 'Hassan', 'Yusuf', 'Khalid', 'Samir', 'Tariq', 'Faris', 'Nabil'],
    girls: ['Layla', 'Fatima', 'Aisha', 'Zeinab', 'Nour', 'Amina', 'Maryam', 'Sara', 'Dina', 'Lina']
  },
  
  // Spanish/Portuguese story names
  'es': {
    boys: ['Diego', 'Carlos', 'Miguel', 'Luis', 'Pablo', 'Rafael', 'Eduardo', 'Gabriel', 'Mateo', 'Adrian'],
    girls: ['Sofia', 'Isabella', 'Carmen', 'Elena', 'Maria', 'Ana', 'Lucia', 'Paula', 'Valeria', 'Natalia']
  },
  
  'pt': {
    boys: ['João', 'Pedro', 'Lucas', 'Mateus', 'Gabriel', 'Rafael', 'Bruno', 'André', 'Felipe', 'Daniel'],
    girls: ['Ana', 'Maria', 'Beatriz', 'Julia', 'Laura', 'Sophia', 'Helena', 'Camila', 'Isabela', 'Manuela']
  },
  
  // French story names
  'fr': {
    boys: ['Antoine', 'Louis', 'Gabriel', 'Paul', 'Pierre', 'Hugo', 'Nathan', 'Theo', 'Lucas', 'Leo'],
    girls: ['Emma', 'Louise', 'Chloe', 'Manon', 'Inès', 'Jade', 'Lina', 'Zoé', 'Léa', 'Mila']
  },
  
  // Francophone African story names
  'fr-francophone-african': {
    boys: ['Mamadou', 'Ibrahim', 'Ousmane', 'Abdoul', 'Moussa', 'Sekou', 'Amadou', 'Bakary', 'Souleymane', 'Ismaël'],
    girls: ['Aisha', 'Fatou', 'Aminata', 'Mariam', 'Kadija', 'Hawa', 'Fatoumata', 'Adja', 'Nene', 'Awa']
  }
};

export class NameHandlingService {
  
  /**
   * ============================================================================
   * IMAGE GENERATION NAME RESOLUTION
   * ============================================================================
   * For image generation, ALWAYS use the child's real name (userInfo.name)
   * This ensures the child sees themselves in the images
   */
  static getImageGenerationName(userInfo) {
    console.log('🎯 NAME HANDLER: Image Generation Name Resolution');
    console.log('📝 Input userInfo.name:', userInfo?.name);
    
    const realName = userInfo?.name?.trim();
    
    if (!realName) {
      console.log('⚠️ NAME HANDLER: No real name provided, using fallback "Child"');
      return 'Child';
    }
    
    // Clean and format the real name
    const formattedName = this.formatRealName(realName);
    
    console.log('✅ NAME HANDLER: Using real child name for image:', formattedName);
    return formattedName;
  }
  
  /**
   * ============================================================================
   * STORY GENERATION NAME RESOLUTION
   * ============================================================================
   * For story generation, can use cultural name arrays for fictional characters
   * while still using the real child name as the main protagonist
   */
  static getStoryGenerationName(userInfo, purpose = 'protagonist') {
    console.log('📚 NAME HANDLER: Story Generation Name Resolution');
    console.log('🎭 Purpose:', purpose);
    console.log('📝 Input userInfo.name:', userInfo?.name);
    
    if (purpose === 'protagonist' || purpose === 'main-character') {
      // Main character should always be the child's real name
      return this.getImageGenerationName(userInfo);
    }
    
    if (purpose === 'secondary-character' || purpose === 'fictional-character') {
      // Secondary characters can use cultural names
      return this.getCulturalStoryName(userInfo);
    }
    
    // Default to real name for safety
    return this.getImageGenerationName(userInfo);
  }
  
  /**
   * ============================================================================
   * CULTURAL STORY NAME SELECTION
   * ============================================================================
   * Selects appropriate fictional names based on cultural context
   * ONLY used for secondary/fictional characters in stories
   */
  static getCulturalStoryName(userInfo, gender = null) {
    console.log('🌍 NAME HANDLER: Cultural Story Name Selection');
    
    const culturalProfile = this.detectCulturalProfile(userInfo);
    const avatarType = gender || userInfo?.avatar?.type || 'prefer-not-to-answer';
    
    console.log('🏷️ Cultural Profile:', culturalProfile);
    console.log('👤 Avatar Type:', avatarType);
    
    // Get appropriate name array
    const nameArray = CULTURAL_STORY_NAMES[culturalProfile];
    
    if (!nameArray) {
      console.log('⚠️ NAME HANDLER: No cultural names found, using English fallback');
      return this.getRandomFromArray(CULTURAL_STORY_NAMES['en'][avatarType === 'girl' ? 'girls' : 'boys']);
    }
    
    // Select gender-appropriate name
    let genderArray;
    if (avatarType === 'girl') {
      genderArray = nameArray.girls || nameArray.boys || ['Friend'];
    } else {
      genderArray = nameArray.boys || nameArray.girls || ['Friend'];
    }
    
    const selectedName = this.getRandomFromArray(genderArray);
    console.log('✅ NAME HANDLER: Selected cultural story name:', selectedName);
    
    return selectedName;
  }
  
  /**
   * ============================================================================
   * CULTURAL PROFILE DETECTION
   * ============================================================================
   * Determines cultural context from user information
   */
  static detectCulturalProfile(userInfo) {
    const nativeLanguage = userInfo?.nativeLanguage || userInfo?.storyLanguagePreference || 'en';
    
    // Map language codes to cultural profiles
    const culturalMap = {
      'en-african-american': 'en-african-american',
      'fr-francophone-african': 'fr-francophone-african',
      'zh': 'zh',
      'hi': 'hi',
      'ar': 'ar',
      'es': 'es',
      'pt': 'pt',
      'fr': 'fr'
    };
    
    return culturalMap[nativeLanguage] || 'en';
  }
  
  /**
   * ============================================================================
   * NAME FORMATTING UTILITIES
   * ============================================================================
   */
  static formatRealName(name) {
    if (!name || typeof name !== 'string') return 'Child';
    
    // Clean the name
    const cleaned = name.trim();
    if (!cleaned) return 'Child';
    
    // Capitalize first letter, keep rest as provided
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  static getRandomFromArray(array) {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return 'Friend';
    }
    
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * ============================================================================
   * AVATAR IDENTITY NAME VALIDATION
   * ============================================================================
   * Ensures avatarIdentity uses the correct name for its purpose
   */
  static validateAvatarIdentityName(avatarIdentity, userInfo, purpose = 'image-generation') {
    console.log('🔍 NAME HANDLER: Avatar Identity Name Validation');
    console.log('🎯 Purpose:', purpose);
    console.log('📝 Current avatarIdentity.name:', avatarIdentity?.name);
    
    let correctName;
    
    if (purpose === 'image-generation') {
      correctName = this.getImageGenerationName(userInfo);
    } else if (purpose === 'story-generation') {
      correctName = this.getStoryGenerationName(userInfo, 'protagonist');
    } else {
      correctName = this.getImageGenerationName(userInfo); // Safe default
    }
    
    // Update avatarIdentity if needed
    if (avatarIdentity && avatarIdentity.name !== correctName) {
      console.log('🔄 NAME HANDLER: Correcting avatarIdentity.name');
      console.log('❌ Was:', avatarIdentity.name);
      console.log('✅ Now:', correctName);
      
      avatarIdentity.name = correctName;
    }
    
    return avatarIdentity;
  }
  
  /**
   * ============================================================================
   * DEBUG AND LOGGING
   * ============================================================================
   */
  static logNameUsage(context, name, source) {
    console.log(`📛 NAME USAGE [${context}]: "${name}" from ${source}`);
  }
  
  /**
   * ============================================================================
   * AVAILABLE CULTURAL STORY NAMES (for reference)
   * ============================================================================
   */
  static getAvailableCulturalNames() {
    return Object.keys(CULTURAL_STORY_NAMES);
  }
  
  static getCulturalNameArray(culturalProfile, gender) {
    const names = CULTURAL_STORY_NAMES[culturalProfile];
    if (!names) return null;
    
    if (gender === 'girl' || gender === 'girls') {
      return names.girls;
    } else if (gender === 'boy' || gender === 'boys') {
      return names.boys;
    }
    
    return null;
  }
}

// ============= EXPORTS =============
export { CULTURAL_STORY_NAMES };
export default NameHandlingService;
