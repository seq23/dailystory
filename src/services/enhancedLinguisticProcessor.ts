import { UserInfo, LanguageCode } from "@/types";

// Enhanced multilingual dictionary with expanded animal coverage for better fuzzy matching
const MULTILINGUAL_DICTIONARY = {
  animals: {
    en: ['dog', 'dogs', 'cat', 'cats', 'bird', 'birds', 'fish', 'rabbit', 'rabbits', 'horse', 'horses', 
         'cow', 'cows', 'pig', 'pigs', 'sheep', 'chicken', 'chickens', 'lion', 'lions', 'tiger', 'tigers',
         'bear', 'bears', 'wolf', 'wolves', 'fox', 'foxes', 'elephant', 'elephants', 'giraffe', 'giraffes',
         'monkey', 'monkeys', 'duck', 'ducks', 'puppy', 'puppies', 'kitten', 'kittens', 'bunny', 'bunnies'],
    es: ['perro', 'perros', 'gato', 'gatos', 'pájaro', 'pájaros', 'pez', 'peces', 'conejo', 'conejos', 
         'caballo', 'caballos', 'vaca', 'vacas', 'cerdo', 'cerdos', 'oveja', 'ovejas', 'pollo', 'pollos'],
    fr: ['chien', 'chiens', 'chat', 'chats', 'oiseau', 'oiseaux', 'poisson', 'poissons', 'lapin', 'lapins', 
         'cheval', 'chevaux', 'vache', 'vaches', 'cochon', 'cochons', 'mouton', 'moutons', 'poulet', 'poulets'],
    zh: ['狗', '猫', '鸟', '鱼', '兔子', '马', '牛', '猪', '羊', '鸡'],
    ar: ['كلب', 'قطة', 'طائر', 'سمك', 'أرنب', 'حصان', 'بقرة', 'خنزير', 'خروف', 'دجاج'],
    hi: ['कुत्ता', 'बिल्ली', 'पक्षी', 'मछली', 'खरगोश', 'घोड़ा', 'गाय', 'सूअर', 'भेड़', 'मुर्गी'],
    pt: ['cão', 'cães', 'gato', 'gatos', 'pássaro', 'pássaros', 'peixe', 'peixes', 'coelho', 'coelhos', 
         'cavalo', 'cavalos', 'vaca', 'vacas', 'porco', 'porcos', 'ovelha', 'ovelhas', 'frango', 'frangos']
  },
  foods: {
    en: ['pizza', 'apple', 'apples', 'banana', 'bananas', 'bread', 'rice', 'pasta', 'chicken', 'beef', 'fish', 
         'vegetables', 'veggies', 'burger', 'burgers', 'cake', 'cookies', 'ice cream', 'sandwich', 'sandwiches',
         'cheese', 'milk', 'eggs', 'bacon', 'ham', 'turkey', 'salad', 'soup', 'noodles', 'cereal',
         'chocolate', 'candy', 'fruit', 'fruits', 'meat', 'potatoes', 'tomato', 'tomatoes'],
    es: ['pizza', 'manzana', 'manzanas', 'plátano', 'plátanos', 'pan', 'arroz', 'pasta', 'pollo', 'carne', 
         'pescado', 'verduras', 'hamburguesa', 'pastel', 'galletas', 'helado', 'sándwich', 'queso', 'leche'],
    fr: ['pizza', 'pomme', 'pommes', 'banane', 'bananes', 'pain', 'riz', 'pâtes', 'poulet', 'bœuf', 
         'poisson', 'légumes', 'hamburger', 'gâteau', 'biscuits', 'glace', 'sandwich', 'fromage', 'lait'],
    zh: ['比萨', '苹果', '香蕉', '面包', '米饭', '意大利面', '鸡肉', '牛肉', '鱼', '蔬菜'],
    ar: ['بيتزا', 'تفاح', 'موز', 'خبز', 'أرز', 'معكرونة', 'دجاج', 'لحم بقر', 'سمك', 'خضروات'],
    hi: ['पिज्जा', 'सेब', 'केला', 'रोटी', 'चावल', 'पास्ता', 'चिकन', 'बीफ', 'मछली', 'सब्जियां'],
    pt: ['pizza', 'maçã', 'maçãs', 'banana', 'bananas', 'pão', 'arroz', 'massa', 'frango', 'carne', 
         'peixe', 'vegetais', 'hambúrguer', 'bolo', 'biscoitos', 'sorvete', 'sanduíche', 'queijo', 'leite']
  },
  hobbies: {
    en: ['reading', 'swimming', 'dancing', 'singing', 'drawing', 'playing', 'running', 'jumping'],
    es: ['leer', 'nadar', 'bailar', 'cantar', 'dibujar', 'jugar', 'correr', 'saltar'],
    fr: ['lire', 'nager', 'danser', 'chanter', 'dessiner', 'jouer', 'courir', 'sauter'],
    zh: ['读书', '游泳', '跳舞', '唱歌', '画画', '玩', '跑步', '跳跃'],
    ar: ['قراءة', 'سباحة', 'رقص', 'غناء', 'رسم', 'لعب', 'جري', 'قفز'],
    hi: ['पढ़ना', 'तैरना', 'नृत्य', 'गायन', 'चित्र', 'खेल', 'दौड़ना', 'कूदना'],
    pt: ['ler', 'nadar', 'dançar', 'cantar', 'desenhar', 'brincar', 'correr', 'pular']
  }
};

export class EnhancedSpellingCorrector {
  
  // Advanced fuzzy matching across languages with contextual awareness
  static fuzzyMatch(input: string, language: LanguageCode, context: 'animals' | 'foods' | 'hobbies'): {
    suggestion: string;
    confidence: number;
    originalLanguage: LanguageCode;
  } | null {
    
    const normalizedInput = input.toLowerCase().trim();
    const contextDict = MULTILINGUAL_DICTIONARY[context];
    
    // Check all languages for fuzzy matches
    for (const [lang, words] of Object.entries(contextDict)) {
      for (const word of words) {
        const similarity = this.calculateSimilarity(normalizedInput, word);
        
        if (similarity > 0.7) {
          // High similarity found - suggest English equivalent
          const englishIndex = contextDict.en.findIndex(enWord => 
            contextDict[lang as LanguageCode]?.indexOf(word) === contextDict.en.indexOf(enWord)
          );
          
          return {
            suggestion: contextDict.en[englishIndex] || word,
            confidence: similarity,
            originalLanguage: lang as LanguageCode
          };
        }
      }
    }
    
    return null;
  }
  
  // Levenshtein distance for fuzzy matching
  private static calculateSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    const distance = matrix[str2.length][str1.length];
    return 1 - distance / Math.max(str1.length, str2.length);
  }
  
  // Context-aware smart suggestions
  static getSmartSuggestions(input: string, userInfo: UserInfo): {
    suggestions: string[];
    corrections: Array<{original: string; suggested: string; confidence: number}>;
  } {
    const words = input.split(/[,\\s]+/);
    const suggestions: string[] = [];
    const corrections: Array<{original: string; suggested: string; confidence: number}> = [];
    
    for (const word of words) {
      if (!word.trim()) continue;
      
      // Try fuzzy matching for each context
      const contexts: Array<'animals' | 'foods' | 'hobbies'> = ['animals', 'foods', 'hobbies'];
      
      for (const context of contexts) {
        const match = this.fuzzyMatch(word, userInfo.nativeLanguage, context);
        
        if (match && match.confidence > 0.7) {
          suggestions.push(match.suggestion);
          corrections.push({
            original: word,
            suggested: match.suggestion,
            confidence: match.confidence
          });
          break;
        }
      }
      
      // If no fuzzy match, keep original word (may need translation)
      if (!suggestions.includes(word) && !corrections.some(c => c.original === word)) {
        suggestions.push(word);
      }
    }
    
    return { suggestions: suggestions.filter(s => s.length > 0), corrections };
  }
}

export class AdvancedGrammarProcessor {
  
  // Enhanced grammar processing with article selection and verb agreement
  static processTranslatedText(text: string, originalLanguage: LanguageCode): string {
    let processed = text.trim();
    
    // Handle comma-separated values intelligently
    if (processed.includes(',')) {
      const items = processed.split(',').map(item => item.trim());
      const processedItems = items.map(item => this.processIndividualItem(item, originalLanguage));
      processed = this.formatList(processedItems);
    } else {
      processed = this.processIndividualItem(processed, originalLanguage);
    }
    
    return processed;
  }
  
  private static processIndividualItem(item: string, originalLanguage: LanguageCode): string {
    let processed = item.trim();
    
    // Add proper articles for nouns
    processed = this.addProperArticle(processed);
    
    // Handle plural forms correctly
    processed = this.handlePluralForms(processed);
    
    // Capitalize appropriately
    processed = this.capitalizeAppropriately(processed);
    
    return processed;
  }
  
  private static addProperArticle(word: string): string {
    // Skip if already has article
    if (/^(a|an|the)\s+/i.test(word)) return word;
    
    // Skip articles for plurals
    if (this.isPlural(word)) return word;
    
    // Add "a" or "an" based on first letter sound
    const vowelSounds = /^[aeiou]/i;
    const consonantSounds = /^[bcdfghjklmnpqrstvwxyz]/i;
    
    if (vowelSounds.test(word)) {
      return `an ${word}`;
    } else if (consonantSounds.test(word)) {
      return `a ${word}`;
    }
    
    return word;
  }
  
  private static isPlural(word: string): boolean {
    // Enhanced plural detection
    const pluralPatterns = [
      /ies$/i,           // stories, cities
      /ves$/i,           // wolves, knives
      /ses$/i,           // buses, glasses
      /ches$/i,          // beaches, churches
      /shes$/i,          // dishes, wishes
      /xes$/i,           // boxes, foxes
      /s$/i,             // cats, dogs, books
      /children$/i,      // children
      /feet$/i,          // feet
      /teeth$/i,         // teeth
      /men$/i,           // men, women
      /mice$/i,          // mice
      /geese$/i          // geese
    ];
    
    // Common irregular plurals
    const irregularPlurals = [
      'children', 'feet', 'teeth', 'men', 'women', 'mice', 'geese',
      'people', 'sheep', 'deer', 'fish', 'series', 'species'
    ];
    
    if (irregularPlurals.includes(word.toLowerCase())) return true;
    
    return pluralPatterns.some(pattern => pattern.test(word));
  }

  private static handlePluralForms(word: string): string {
    // If it's already plural, leave it as is
    if (this.isPlural(word)) {
      return word;
    }
    
    // Otherwise, keep as singular
    return word;
  }
  
  private static capitalizeAppropriately(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  
  private static formatList(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    
    // For 3+ items, use Oxford comma
    const lastItem = items[items.length - 1];
    const firstItems = items.slice(0, -1);
    return `${firstItems.join(', ')}, and ${lastItem}`;
  }
}

// Enhanced content signature for story uniqueness
export class ContentSignatureGenerator {
  
  static generateSignature(userInfo: UserInfo, translationContext?: {
    originalInputs: Record<string, string>;
    translatedInputs: Record<string, string>;
  }): string {
    
    const baseElements = [
      userInfo.name.toLowerCase(),
      userInfo.age.toString(),
      userInfo.grade,
      userInfo.nativeLanguage,
      userInfo.favoriteAnimal?.toLowerCase() || '',
      userInfo.favoriteFood?.toLowerCase() || '',
      userInfo.hobbies?.toLowerCase() || ''
    ];
    
    // Include translation context for uniqueness
    if (translationContext) {
      const translationElements = Object.entries(translationContext.originalInputs)
        .map(([field, value]) => `${field}:${value}:${translationContext.translatedInputs[field] || value}`)
        .sort();
      
      baseElements.push(...translationElements);
    }
    
    // Create a hash-like signature
    const content = baseElements.join('|');
    return this.simpleHash(content);
  }
  
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export class SessionManager {
  
  // Enhanced session tracking with translation awareness
  static generateSessionSignature(
    userInfo: UserInfo, 
    difficulty: string,
    translationContext?: any
  ): string {
    
    const signature = ContentSignatureGenerator.generateSignature(userInfo, translationContext);
    return `${signature}_${difficulty}_${Date.now()}`;
  }
  
  static isUniqueSession(
    newSignature: string, 
    existingSessions: string[],
    maxSessions: number = 100
  ): boolean {
    
    // For premium users, always allow (infinite uniqueness)
    if (maxSessions === -1) return true;
    
    // For free users, check against existing sessions
    const baseSignature = newSignature.split('_')[0]; // Remove timestamp
    const existingBaseSignatures = existingSessions.map(sig => sig.split('_')[0]);
    
    return !existingBaseSignatures.includes(baseSignature) || existingSessions.length < maxSessions;
  }
}
