// Direct Content Extractor for simple scene analysis
// Used as a shared utility across image generation functions

export class DirectContentExtractor {
  static extractPageContent(pageText) {
    const text = pageText.toLowerCase();
    
    // Extract characters (look for names and pronouns)
    const characters = this.extractCharacters(text);
    
    // Extract setting/location
    const setting = this.extractSetting(text);
    
    // Extract objects mentioned
    const objects = this.extractObjects(text);
    
    // Get primary scene (main action sentence)
    const primaryScene = this.extractPrimaryScene(pageText);
    
    return {
      characters,
      setting,
      objects,
      primaryScene,
      textLength: pageText.length
    };
  }
  
  static extractCharacters(text) {
    const characters = [];
    
    // Common names that might appear
    const commonNames = ['alice', 'bob', 'charlie', 'diana', 'emma', 'frank', 'grace', 'henry', 'isabella', 'jack', 'kate', 'liam', 'mia', 'noah', 'olivia', 'peter', 'quinn', 'ruby', 'sam', 'tara'];
    
    commonNames.forEach(name => {
      if (text.includes(name)) {
        characters.push(name);
      }
    });
    
    // Look for pronouns to infer characters
    if (text.includes('she') || text.includes('her')) {
      characters.push('girl');
    }
    if (text.includes('he') || text.includes('him')) {
      characters.push('boy');
    }
    
    return [...new Set(characters)]; // Remove duplicates
  }
  
  static extractSetting(text) {
    const settings = {
      'forest': ['forest', 'trees', 'woods', 'woodland'],
      'beach': ['beach', 'ocean', 'sea', 'sand', 'waves'],
      'house': ['house', 'home', 'kitchen', 'bedroom', 'living room'],
      'school': ['school', 'classroom', 'teacher', 'students'],
      'park': ['park', 'playground', 'swing', 'slide'],
      'garden': ['garden', 'flowers', 'plants', 'grass'],
      'city': ['city', 'street', 'buildings', 'cars'],
      'farm': ['farm', 'barn', 'animals', 'cow', 'horse']
    };
    
    for (const [setting, keywords] of Object.entries(settings)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return setting;
      }
    }
    
    return 'outdoor scene';
  }
  
  static extractObjects(text) {
    const objects = [];
    const objectKeywords = [
      'ball', 'book', 'toy', 'car', 'bike', 'tree', 'flower', 'dog', 'cat', 
      'bird', 'fish', 'apple', 'cake', 'chair', 'table', 'bag', 'hat', 
      'shoe', 'door', 'window', 'sun', 'moon', 'star', 'cloud', 'rainbow'
    ];
    
    objectKeywords.forEach(obj => {
      if (text.includes(obj)) {
        objects.push(obj);
      }
    });
    
    return objects;
  }
  
  static extractPrimaryScene(pageText) {
    // Split into sentences and find the most action-packed one
    const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return pageText;
    if (sentences.length === 1) return sentences[0].trim();
    
    // Score sentences based on action words
    const actionWords = ['run', 'jump', 'play', 'walk', 'go', 'see', 'look', 'find', 'take', 'give', 'help', 'love', 'like', 'want', 'need'];
    
    let bestSentence = sentences[0];
    let bestScore = 0;
    
    sentences.forEach(sentence => {
      let score = 0;
      const lowerSentence = sentence.toLowerCase();
      
      actionWords.forEach(word => {
        if (lowerSentence.includes(word)) score++;
      });
      
      // Prefer sentences with more words (more descriptive)
      score += sentence.split(' ').length * 0.1;
      
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    });
    
    return bestSentence.trim();
  }
}