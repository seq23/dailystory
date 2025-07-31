import { supabase } from "@/integrations/supabase/client";

export interface StoryGenerationConfig {
  age: number;
  gradeLevel: string;
  readingLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  interests: string[];
  theme?: string;
  wordLimit?: number;
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

    // Generate story using Supabase edge function
    const { data: storyData, error } = await supabase.functions.invoke('generate-adaptive-story', {
      body: {
        readingLevel,
        authorStyle,
        theme,
        interests: config.interests,
        specs,
        config
      }
    });

    if (error) {
      console.error('Story generation error:', error);
      // Fallback to a simple story template
      return this.generateFallbackStory(config, readingLevel, authorStyle, theme, specs);
    }

    // Parse the generated story into pages
    const pages = this.parseStoryIntoPages(storyData.content, specs.maxWordsPerPage);
    const vocabularyWords = this.extractVocabularyWords(storyData.content, readingLevel);
    const comprehensionQuestions = this.generateComprehensionQuestions(storyData.content, readingLevel);
    const imagePrompts = this.generateImagePrompts(readingLevel, theme, pages.length);

    const story: GeneratedStory = {
      id: crypto.randomUUID(),
      title: storyData.title,
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
      imagePrompts
    };

    // Store the story in Supabase
    await this.saveStoryToDatabase(story);
    
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
    const fallbackContent = readingLevel === 'beginner' 
      ? "The cat sat on the mat. The cat was happy. The cat played with a ball. The ball was red. The cat ran fast. The end."
      : readingLevel === 'elementary'
      ? "Once upon a time, there was a brave little mouse named Max. Max lived in a cozy hole under the kitchen. One day, Max decided to explore the big house. He found many interesting things and made new friends along the way."
      : "In a small village nestled between rolling hills, lived a curious girl named Luna. She had always wondered about the mysterious forest that bordered her town. When strange lights began appearing among the trees each night, Luna knew she had to investigate and discover the magical secret hidden within.";

    const pages = this.parseStoryIntoPages(fallbackContent, specs.maxWordsPerPage);

    return {
      id: crypto.randomUUID(),
      title: `A ${theme} Adventure`,
      content: fallbackContent,
      pages,
      readingLevel,
      ageGroup: specs.ageRange,
      authorStyle,
      theme,
      wordCount: fallbackContent.split(' ').length,
      pageCount: pages.length,
      vocabularyWords: this.extractVocabularyWords(fallbackContent, readingLevel),
      comprehensionQuestions: this.generateComprehensionQuestions(fallbackContent, readingLevel),
      imagePrompts: this.generateImagePrompts(readingLevel, theme, pages.length)
    };
  }
}

export const adaptiveStoryGenerator = new AdaptiveStoryGenerator();