// Direct Content Extractor for Page-Accurate Image Generation
// Extracts exactly what's written on the page for precise visual representation

import type { UserInfo } from '@/types';

export interface PageContent {
  subject: string;
  action: string;
  object?: string;
  location?: string;
  descriptor?: string;
}

export interface DirectImagePrompt {
  visualPrompt: string;
  characterInfo: string;
  style: string;
  negativePrompt: string[];
}

export class DirectContentExtractor {
  private static readonly SIMPLE_SUBJECTS = [
    'cat', 'dog', 'bird', 'fish', 'bear', 'rabbit', 'mouse', 'elephant', 'lion', 'tiger',
    'sally', 'tom', 'sam', 'alex', 'emma', 'jack', 'lily', 'ben', 'zoe', 'max',
    'boy', 'girl', 'child', 'friend', 'family', 'mom', 'dad', 'teacher'
  ];

  private static readonly SIMPLE_ACTIONS = [
    'runs', 'walks', 'jumps', 'plays', 'sees', 'finds', 'goes', 'comes', 'sits', 'stands',
    'looks', 'smiles', 'laughs', 'helps', 'reads', 'eats', 'sleeps', 'wakes', 'calls', 'says'
  ];

  private static readonly SIMPLE_OBJECTS = [
    'ball', 'toy', 'book', 'tree', 'house', 'car', 'bike', 'flower', 'cake', 'apple',
    'chair', 'table', 'bed', 'door', 'window', 'box', 'bag', 'hat', 'shoe', 'coat'
  ];

  private static readonly SIMPLE_LOCATIONS = [
    'park', 'home', 'school', 'garden', 'forest', 'beach', 'yard', 'room', 'kitchen', 'outside'
  ];

  static extractPageContent(pageText: string): PageContent {
    const cleanText = pageText.toLowerCase().trim();
    const words = cleanText.split(/\s+/);
    
    // Find subject (who/what is doing something)
    const subject = this.findSubject(words);
    
    // Find action (what they're doing)
    const action = this.findAction(words);
    
    // Find object (what they're interacting with)
    const object = this.findObject(words);
    
    // Find location (where it's happening)
    const location = this.findLocation(words);
    
    // Find descriptors (how/what kind)
    const descriptor = this.findDescriptor(words);
    
    return {
      subject,
      action,
      object,
      location,
      descriptor
    };
  }

  private static findSubject(words: string[]): string {
    // Look for names (capitalized) or common subjects
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (this.SIMPLE_SUBJECTS.includes(word)) {
        return word;
      }
    }
    
    // If no clear subject, use first word that might be a name
    for (const word of words) {
      if (word.length > 2 && /^[A-Z]/.test(word)) {
        return word.toLowerCase();
      }
    }
    
    return 'child';
  }

  private static findAction(words: string[]): string {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_ACTIONS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for common action patterns
    if (words.some(w => w.includes('run'))) return 'running';
    if (words.some(w => w.includes('walk'))) return 'walking';
    if (words.some(w => w.includes('jump'))) return 'jumping';
    if (words.some(w => w.includes('play'))) return 'playing';
    if (words.some(w => w.includes('see'))) return 'looking at';
    if (words.some(w => w.includes('go'))) return 'going';
    
    return 'standing happily';
  }

  private static findObject(words: string[]): string | undefined {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_OBJECTS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for "a/an/the + object" patterns
    for (let i = 0; i < words.length - 1; i++) {
      if (['a', 'an', 'the'].includes(words[i].toLowerCase())) {
        const nextWord = words[i + 1].toLowerCase().replace(/[.,!?]/, '');
        if (nextWord.length > 2) {
          return nextWord;
        }
      }
    }
    
    return undefined;
  }

  private static findLocation(words: string[]): string | undefined {
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (this.SIMPLE_LOCATIONS.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // Look for "in/at/to + location" patterns
    for (let i = 0; i < words.length - 1; i++) {
      if (['in', 'at', 'to', 'near'].includes(words[i].toLowerCase())) {
        const nextWord = words[i + 1].toLowerCase().replace(/[.,!?]/, '');
        if (this.SIMPLE_LOCATIONS.includes(nextWord)) {
          return nextWord;
        }
      }
    }
    
    return undefined;
  }

  private static findDescriptor(words: string[]): string | undefined {
    const descriptors = ['big', 'small', 'fast', 'slow', 'happy', 'sad', 'red', 'blue', 'green', 'yellow', 'little', 'old', 'new', 'good', 'nice', 'funny'];
    
    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/, '');
      if (descriptors.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    return undefined;
  }

  static generateDirectPrompt(
    content: PageContent, 
    userInfo: UserInfo,
    style: string = 'children-book-illustration'
  ): DirectImagePrompt {
    // Build character description
    const characterInfo = this.buildSimpleCharacterDescription(userInfo, content.subject);
    
    // Build the visual scene directly from page content
    let visualScene = '';
    
    if (content.subject === userInfo.name.toLowerCase() || ['child', 'boy', 'girl'].includes(content.subject)) {
      // It's the main character
      visualScene = `${characterInfo} ${content.action}`;
    } else {
      // It's another character/object
      const descriptor = content.descriptor ? `${content.descriptor} ` : '';
      visualScene = `${descriptor}${content.subject} ${content.action}`;
      
      // Add character if mentioned alongside
      if (content.object && content.object.includes(userInfo.name.toLowerCase())) {
        visualScene += ` with ${characterInfo}`;
      }
    }
    
    // Add object if present
    if (content.object && !content.object.includes(userInfo.name.toLowerCase())) {
      const descriptor = content.descriptor && !visualScene.includes(content.descriptor) ? `${content.descriptor} ` : '';
      visualScene += ` ${descriptor}${content.object}`;
    }
    
    // Add location if present
    if (content.location) {
      visualScene += ` in ${content.location}`;
    }
    
    const visualPrompt = `A ${style} showing ${visualScene}. Bright, cheerful, safe for children.`;
    
    const negativePrompt = [
      'scary', 'dark', 'violent', 'inappropriate', 'adult content', 'disturbing',
      'blurry', 'low quality', 'distorted', 'text', 'words', 'letters'
    ];
    
    return {
      visualPrompt,
      characterInfo,
      style,
      negativePrompt
    };
  }

  private static buildSimpleCharacterDescription(userInfo: UserInfo, subject: string): string {
    // Only describe the main character if they're the subject
    if (subject === userInfo.name.toLowerCase() || ['child', 'boy', 'girl'].includes(subject)) {
      const age = userInfo.age;
      const ageGroup = age <= 5 ? 'young child' : age <= 8 ? 'child' : 'older child';
      const skinTone = userInfo.avatar?.skinTone || 'medium';
      
      return `${ageGroup} named ${userInfo.name} with ${skinTone} skin`;
    }
    
    return subject;
  }

  static createSimplePrompt(pageText: string, userInfo: UserInfo): string {
    const content = this.extractPageContent(pageText);
    const prompt = this.generateDirectPrompt(content, userInfo);
    
    console.log(`📝 Direct Content: "${pageText}" → "${prompt.visualPrompt}"`);
    
    return prompt.visualPrompt;
  }
}