import { supabase } from "@/integrations/supabase/client";

export interface StoryGenerationConfig {
  age: number;
  gradeLevel: string;
  readingLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  interests: string[];
  theme?: string;
  wordLimit?: number;
  userName?: string;
  characterDescription?: string;
  avatar?: {
    type: 'boy' | 'girl' | 'prefer-not-to-answer';
    skinTone: 'pale' | 'light' | 'medium' | 'olive' | 'dark';
  };
  favoriteColor?: string;
  favoriteAnimal?: string;
  hobbies?: string;
  favoriteFood?: string;
  nativeLanguage?: string;
}

export interface GeneratedStory {
  id: string;
  title: string;
  content: string;
  pages: string[];
  readingLevel: string;
  ageGroup: string;
  authorStyle: string;
  theme: string;
  wordCount: number;
  pageCount: number;
  vocabularyWords: string[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  imagePrompts: string[];
  images?: Array<{url?: string, prompt: string}>; // Make images optional
}

const AUTHOR_STYLES = {
  beginner: {
    authors: ['Dr. Seuss', 'Eric Carle', 'Bill Martin Jr.'],
    characteristics: 'Simple repetitive text, rhyming patterns, 4-8 words per page, large colorful illustrations'
  },
  elementary: {
    authors: ['Junie B. Jones', 'Magic Tree House', 'Frog and Toad'],
    characteristics: 'Short sentences, familiar vocabulary, 20-50 words per page, engaging characters'
  },
  intermediate: {
    authors: ['Roald Dahl', 'Judy Blume', 'Beverly Cleary'],
    characteristics: 'Complex sentences, character development, 100-200 words per page, deeper themes'
  },
  advanced: {
    authors: ['J.K. Rowling', 'Suzanne Collins', 'Rick Riordan'],
    characteristics: 'Rich vocabulary, complex plots, 200+ words per page, sophisticated themes'
  }
};

const READING_LEVEL_SPECS = {
  beginner: {
    ageRange: '3-5',
    wordLimit: 50,
    maxWordsPerPage: 8,
    pageCount: 6,
    sentenceStructure: 'Very simple sentences, repetitive patterns, basic sight words',
    vocabulary: 'High-frequency words, simple nouns and verbs',
    themes: ['friendship', 'family', 'animals', 'colors', 'shapes', 'numbers']
  },
  elementary: {
    ageRange: '6-8',
    wordLimit: 300,
    maxWordsPerPage: 50,
    pageCount: 8,
    sentenceStructure: 'Simple and compound sentences, dialogue introduction',
    vocabulary: 'Expanding vocabulary, descriptive words, basic emotions',
    themes: ['school', 'adventures', 'problem-solving', 'emotions', 'seasons', 'community helpers']
  },
  intermediate: {
    ageRange: '9-11',
    wordLimit: 800,
    maxWordsPerPage: 150,
    pageCount: 10,
    sentenceStructure: 'Complex sentences, varied structure, character thoughts',
    vocabulary: 'Rich descriptive language, subject-specific terms, figurative language',
    themes: ['mystery', 'science', 'history', 'friendship challenges', 'growing up', 'different cultures']
  },
  advanced: {
    ageRange: '11+',
    wordLimit: 1500,
    maxWordsPerPage: 250,
    pageCount: 12,
    sentenceStructure: 'Sophisticated sentence variety, multiple perspectives, complex dialogue',
    vocabulary: 'Advanced vocabulary, academic terms, literary devices',
    themes: ['identity', 'social issues', 'fantasy worlds', 'coming of age', 'moral dilemmas', 'global awareness']
  }
};

export class AdaptiveStoryGenerator {
  private determineReadingLevel(age: number, gradeLevel: string): keyof typeof READING_LEVEL_SPECS {
    if (age <= 5 || gradeLevel === 'PreK' || gradeLevel === 'K') return 'beginner';
    if (age <= 8 || gradeLevel === '1st' || gradeLevel === '2nd') return 'elementary';
    if (age <= 11 || ['3rd', '4th', '5th'].includes(gradeLevel)) return 'intermediate';
    return 'advanced';
  }

  private selectAuthorStyle(readingLevel: keyof typeof READING_LEVEL_SPECS): string {
    const styles = AUTHOR_STYLES[readingLevel];
    return styles.authors[Math.floor(Math.random() * styles.authors.length)];
  }

  private generateImagePrompts(readingLevel: keyof typeof READING_LEVEL_SPECS, theme: string, pageCount: number): string[] {
    const complexity = {
      beginner: 'Simple, bright, cartoon-style illustration with bold colors and clear shapes',
      elementary: 'Colorful, friendly illustration with clear details and engaging characters',
      intermediate: 'Detailed illustration with realistic elements and rich backgrounds',
      advanced: 'Sophisticated artwork with complex scenes and atmospheric details'
    };

    const prompts: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      prompts.push(`${complexity[readingLevel]} depicting ${theme}, page ${i + 1} of a children's story, high quality, child-friendly`);
    }
    return prompts;
  }

  async generateStory(config: StoryGenerationConfig): Promise<GeneratedStory> {
    const readingLevel = this.determineReadingLevel(config.age, config.gradeLevel);
    const specs = READING_LEVEL_SPECS[readingLevel];
    const authorStyle = this.selectAuthorStyle(readingLevel);
    const theme = config.theme || specs.themes[Math.floor(Math.random() * specs.themes.length)];

    console.log(`Generating story for ${config.userName} (${readingLevel} level) - Character consistency maintained`);

    // CRITICAL: Mark this as character-established story
    const isCharacterEstablished = !!config.userName && !!config.avatar;

    // Generate story using enhanced Supabase edge function
    const { data: storyData, error } = await supabase.functions.invoke('generate-adaptive-story', {
      body: {
        readingLevel,
        authorStyle,
        theme,
        interests: config.interests,
        specs,
        config: {
          ...config,
          theme,
          nativeLanguage: config.nativeLanguage || 'en',
          characterEstablished: isCharacterEstablished
        }
      }
    });

    if (error) {
      console.error('Story generation error:', error);
      // Fallback to a personalized story template
      return this.generateFallbackStory(config, readingLevel, authorStyle, theme, specs);
    }

    // Parse the generated story into pages - ensure exactly 10 pages
    const targetPageCount = 10;
    let pages = this.parseStoryIntoPages(storyData.content, specs.maxWordsPerPage);
    
    // Adjust to exactly 10 pages
    if (pages.length < targetPageCount) {
      const additionalContent = this.generateAdditionalContent(theme, readingLevel, targetPageCount - pages.length);
      pages = [...pages, ...additionalContent];
    } else if (pages.length > targetPageCount) {
      pages = pages.slice(0, targetPageCount);
    }
    
    const vocabularyWords = this.extractVocabularyWords(storyData.content, readingLevel);
    const comprehensionQuestions = this.generateComprehensionQuestions(storyData.content, readingLevel);
    
    // CRITICAL: Only generate image prompts, don't auto-generate images yet
    // Let the component control when/if images are generated to maintain character consistency
    const imagePrompts = this.generateImagePrompts(readingLevel, theme, pages.length);
    
    // Initialize images array with enhanced prompts only - actual generation controlled by component
    const initialImages = pages.map((_, i) => ({ 
      prompt: `${imagePrompts[i]} - Character: ${config.userName || 'main character'} as ${config.avatar?.type || 'child'} with ${config.avatar?.skinTone || 'medium'} skin tone` 
    }));

    const story: GeneratedStory = {
      id: crypto.randomUUID(),
      title: storyData.title || `${config.userName}'s ${theme} Adventure`,
      content: storyData.content,
      pages,
      readingLevel,
      ageGroup: specs.ageRange,
      authorStyle,
      theme,
      wordCount: storyData.content.split(' ').length,
      pageCount: pages.length,
      vocabularyWords,
      comprehensionQuestions,
      imagePrompts: imagePrompts,
      images: initialImages
    };

    // Store the story in Supabase with character details
    await this.saveStoryToDatabase(story);
    
    console.log(`Successfully generated personalized story: "${story.title}"`);
    return story;
  }

  private parseStoryIntoPages(content: string, maxWordsPerPage: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(' ').length;
      
      if (currentWordCount + sentenceWords > maxWordsPerPage && currentPage) {
        pages.push(currentPage.trim() + '.');
        currentPage = sentence.trim();
        currentWordCount = sentenceWords;
      } else {
        currentPage += (currentPage ? '. ' : '') + sentence.trim();
        currentWordCount += sentenceWords;
      }
    }

    if (currentPage) {
      pages.push(currentPage.trim() + (currentPage.endsWith('.') ? '' : '.'));
    }

    return pages;
  }

  private extractVocabularyWords(content: string, readingLevel: keyof typeof READING_LEVEL_SPECS): string[] {
    const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Filter based on reading level complexity
    const complexityFilter = {
      beginner: (word: string) => word.length <= 6,
      elementary: (word: string) => word.length <= 8,
      intermediate: (word: string) => word.length <= 10,
      advanced: (word: string) => true
    };

    return uniqueWords
      .filter(complexityFilter[readingLevel])
      .slice(0, readingLevel === 'beginner' ? 3 : readingLevel === 'elementary' ? 5 : 8);
  }

  private generateComprehensionQuestions(content: string, readingLevel: keyof typeof READING_LEVEL_SPECS): any[] {
    // Simplified comprehension questions based on reading level
    const questionTemplates = {
      beginner: [
        { template: "What color was the {subject}?", type: "detail" },
        { template: "Who was the main character?", type: "character" },
        { template: "What did {character} do?", type: "action" }
      ],
      elementary: [
        { template: "Why did {character} feel {emotion}?", type: "emotion" },
        { template: "What happened first in the story?", type: "sequence" },
        { template: "Where did the story take place?", type: "setting" }
      ],
      intermediate: [
        { template: "What was the main problem in the story?", type: "problem" },
        { template: "How did {character} solve the problem?", type: "solution" },
        { template: "What lesson did {character} learn?", type: "theme" }
      ],
      advanced: [
        { template: "What motivated {character} to make their decision?", type: "motivation" },
        { template: "How did the character change throughout the story?", type: "development" },
        { template: "What is the deeper meaning of this story?", type: "analysis" }
      ]
    };

    // Return simplified questions for now
    return questionTemplates[readingLevel].slice(0, 2).map((template, index) => ({
      question: template.template.replace('{character}', 'the main character').replace('{subject}', 'object'),
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'This is the correct answer based on the story.'
    }));
  }

  private async saveStoryToDatabase(story: GeneratedStory): Promise<void> {
    try {
      const { error } = await supabase.from('stories').insert({
        title: story.title,
        content: story.content,
        reading_level: story.readingLevel,
        age_group: story.ageGroup,
        author_style: story.authorStyle,
        theme: story.theme,
        word_count: story.wordCount,
        page_count: story.pageCount,
        vocabulary_words: story.vocabularyWords,
        comprehension_questions: story.comprehensionQuestions
      });

      if (error) {
        console.error('Error saving story to database:', error);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  private generateFallbackStory(
    config: StoryGenerationConfig,
    readingLevel: keyof typeof READING_LEVEL_SPECS,
    authorStyle: string,
    theme: string,
    specs: any
  ): GeneratedStory {
    // Enhanced personalized fallback with exactly 10 pages
    const userName = config.userName || 'the child';
    const characterDesc = config.avatar ? 
      `${config.avatar.type === 'boy' ? 'young boy' : config.avatar.type === 'girl' ? 'young girl' : 'child'} with ${config.avatar.skinTone} skin tone` :
      'brave young adventurer';
    
    const fallbackPages = [
      `Once upon a time, there was a wonderful ${characterDesc} named ${userName}.`,
      `${userName} lived in a magical place full of ${theme} adventures.`,
      `One bright morning, ${userName} discovered something amazing.`,
      `With great courage, ${userName} decided to explore this new discovery.`,
      `Along the way, ${userName} met friendly animals and helpful friends.`,
      `Together, they faced exciting challenges with bravery and kindness.`,
      `${userName} learned important lessons about friendship and courage.`,
      `The adventure taught ${userName} to believe in themselves.`,
      `Everyone was proud of how brave and kind ${userName} had been.`,
      `And ${userName} lived happily ever after, ready for new adventures.`
    ];

    return {
      id: crypto.randomUUID(),
      title: `${userName}'s ${theme} Adventure`,
      content: fallbackPages.join(' '),
      pages: fallbackPages,
      readingLevel,
      ageGroup: specs.ageRange,
      authorStyle,
      theme,
      wordCount: this.countWords(fallbackPages.join(' ')),
      pageCount: fallbackPages.length,
      vocabularyWords: [],
      comprehensionQuestions: [],
      imagePrompts: fallbackPages.map((_, i) => `Illustration for page ${i + 1} depicting ${theme} with ${userName}`),
      images: [] // Empty for fallback
    };
  }

  private countWords(text: string): number {
    return text.split(' ').filter(word => word.trim().length > 0).length;
  }

  private generateAdditionalContent(theme: string, readingLevel: string, count: number): string[] {
    const additional: string[] = [];
    for (let i = 0; i < count; i++) {
      additional.push(`The ${theme} adventure continued with new discoveries and excitement.`);
    }
    return additional;
  }

  private async generateStoryImages(
    readingLevel: string, 
    theme: string, 
    pages: string[], 
    config: StoryGenerationConfig,
    storyTitle: string
  ): Promise<Array<{url?: string, prompt: string}>> {
    const images: Array<{url?: string, prompt: string}> = [];
    
    // Extract character details from config
    const characterName = config.userName || 'the main character';
    const characterDescription = config.characterDescription || '';
    
    // Determine skin tone and gender from character description or avatar
    const skinToneMap: {[key: string]: string} = {
      'dark': 'dark skin',
      'medium': 'medium skin tone', 
      'light': 'light skin',
      'olive': 'olive skin tone',
      'pale': 'pale skin'
    };
    
    // Extract skin tone from character description
    let skinTone = 'medium skin tone'; // default
    Object.keys(skinToneMap).forEach(tone => {
      if (characterDescription.toLowerCase().includes(tone)) {
        skinTone = skinToneMap[tone];
      }
    });
    
    // Determine gender
    const gender = characterDescription.toLowerCase().includes('girl') ? 'girl' : 
                  characterDescription.toLowerCase().includes('boy') ? 'boy' : 'child';
    
    const artStyle = {
      beginner: 'simple and bright children\'s book illustration with bold colors and clear shapes',
      elementary: 'colorful and friendly children\'s book illustration with clear details', 
      intermediate: 'detailed children\'s book illustration with realistic elements and rich backgrounds',
      advanced: 'sophisticated children\'s book artwork with complex scenes and atmospheric details'
    }[readingLevel] || 'colorful children\'s book illustration';
    
    try {
      // Generate images for each page using Runware
      for (let i = 0; i < Math.min(pages.length, 10); i++) {
        const pageContent = pages[i];
        
        // Create story-specific prompt following the user's example format
        const prompt = `A beautiful children's book illustration depicting the scene where young ${gender} named ${characterName} with ${skinTone} in the setting described in this story page: "${pageContent.substring(0, 200)}..." based on the story "${storyTitle}" about ${theme}, with a happy and cheerful atmosphere, warm earth tones and natural colors, contemporary children's book art style, ${artStyle}, appealing to all children regardless of gender, diverse and inclusive, high quality, safe for children, NO TEXT, NO WORDS, NO LETTERS in the image`;
        
        try {
          const { data: imageData, error } = await supabase.functions.invoke('runware-generate-image', {
            body: {
              positivePrompt: prompt,
              model: "runware:100@1",
              width: 1024,
              height: 1024,
              numberResults: 1,
              outputFormat: "WEBP"
            }
          });
          
          if (!error && imageData?.imageURL) {
            images.push({ url: imageData.imageURL, prompt });
            console.log(`Generated personalized image ${i + 1}/${pages.length} for ${characterName}`);
          } else {
            console.warn(`Failed to generate image for page ${i + 1}:`, error);
            images.push({ prompt }); // Just store the prompt if generation fails
          }
        } catch (imgError) {
          console.warn(`Image generation failed for page ${i + 1}:`, imgError);
          images.push({ prompt }); // Just store the prompt if generation fails
        }
        
        // Add a small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error generating story images:', error);
      // Return prompts only if image generation fails
      pages.forEach((page, i) => {
        const fallbackPrompt = `Children's book illustration for page ${i + 1} showing ${characterName} with ${skinTone} in ${theme} setting, based on: ${page.substring(0, 100)}...`;
        images.push({ prompt: fallbackPrompt });
      });
    }
    
    return images;
  }

  // Enhanced method to generate a single image for a specific page with accurate representation
  async generatePageImage(
    pageIndex: number,
    pageContent: string,
    config: StoryGenerationConfig,
    storyTitle: string,
    theme: string,
    readingLevel: string
  ): Promise<{url?: string, prompt: string}> {
    // Extract character details from config
    const characterName = config.userName || 'the main character';
    const skinTone = config.avatar?.skinTone || 'medium';
    const avatarType = config.avatar?.type || 'child';
    
    // Enhanced skin tone mapping for accurate representation
    const skinToneMap: {[key: string]: string} = {
      'pale': 'very light skin tone, pale complexion',
      'light': 'light skin tone, fair complexion',
      'medium': 'medium skin tone, warm brown complexion',
      'olive': 'olive skin tone, Mediterranean complexion',
      'dark': 'dark skin tone, beautiful deep brown African/African American complexion'
    };
    
    const consistentSkinTone = skinToneMap[skinTone] || 'medium skin tone';
    
    // Enhanced gender and ethnicity descriptions
    let genderDesc;
    if (skinTone === 'dark') {
      genderDesc = avatarType === 'boy' ? 'young Black boy' : avatarType === 'girl' ? 'young Black girl' : 'young Black child';
    } else {
      genderDesc = avatarType === 'boy' ? 'young boy' : avatarType === 'girl' ? 'young girl' : 'child';
    }
    
    const artStyle = {
      beginner: 'vibrant and simple children\'s book illustration with bold colors and clear shapes',
      elementary: 'colorful and realistic children\'s book illustration with clear details', 
      intermediate: 'detailed children\'s book illustration with realistic elements and rich backgrounds',
      advanced: 'sophisticated children\'s book artwork with complex scenes and atmospheric details'
    }[readingLevel] || 'vibrant children\'s book illustration';
    
    // Create enhanced prompt with accurate representation
    let prompt;
    if (skinTone === 'dark') {
      prompt = `A vibrant, realistic children's book illustration showing ${genderDesc} named ${characterName} with ${consistentSkinTone} and beautiful African/African American features in the scene: "${pageContent.substring(0, 200)}..." This is from the story "${storyTitle}" about ${theme}. The illustration should have vibrant colors, realistic skin tone representation, ${artStyle}, diverse and inclusive, high quality, safe for children, accurate and respectful representation, NO TEXT, NO WORDS, NO LETTERS in the image`;
    } else {
      prompt = `A beautiful children's book illustration depicting ${genderDesc} named ${characterName} with ${consistentSkinTone} in the scene: "${pageContent.substring(0, 200)}..." from the story "${storyTitle}" about ${theme}, with a happy and cheerful atmosphere, ${artStyle}, appealing to all children, diverse and inclusive, high quality, safe for children, NO TEXT, NO WORDS, NO LETTERS in the image`;
    }
    
    try {
      console.log(`Generating enhanced image for page ${pageIndex + 1} for ${characterName} (${genderDesc} with ${consistentSkinTone})`);
      const { data: imageData, error } = await supabase.functions.invoke('runware-generate-image', {
        body: {
          positivePrompt: prompt,
          characterName,
          characterDescription: `${genderDesc} with ${consistentSkinTone}`,
          skinTone,
          avatarType,
          storyTheme: theme,
          pageIndex,
          model: "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: 1,
          outputFormat: "WEBP"
        }
      });
      
      if (!error && imageData?.imageURL) {
        console.log(`Generated accurate image for page ${pageIndex + 1}: ${imageData.imageURL}`);
        return { url: imageData.imageURL, prompt };
      } else {
        console.warn(`Failed to generate image for page ${pageIndex + 1}:`, error);
        return { prompt }; // Just store the prompt if generation fails
      }
    } catch (imgError) {
      console.warn(`Image generation failed for page ${pageIndex + 1}:`, imgError);
      return { prompt }; // Just store the prompt if generation fails
    }
  }

  // Generate images asynchronously in background
  private generateStoryImagesAsync(readingLevel: string, theme: string, pages: string[], config: StoryGenerationConfig, storyTitle: string): void {
    // Don't await this - let it run in background
    this.generateStoryImages(readingLevel, theme, pages, config, storyTitle).catch(error => {
      console.warn('Background image generation failed:', error);
    });
  }
}

export const adaptiveStoryGenerator = new AdaptiveStoryGenerator();