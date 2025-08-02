// Centralized story generation service with high-quality templates
import type { UserInfo, DifficultyLevel } from "@/types";
import { 
  STORY_LANGUAGES, 
  getRandomStoryTemplate, 
  processStoryTemplate, 
  getContinuationText 
} from './storyTemplates';
import { validateAndFixGrammar } from '@/utils/grammarValidator';
import StoryQualityChecker from '@/utils/storyQualityChecker';
import { ProgressiveStoryGenerator } from './progressiveStoryGenerator';

export class StoryGeneratorService {
  /**
   * Main story generation method with progressive difficulty scaling
   */
  static async generateStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number = 10
  ): Promise<{ pages: string[]; config: any }> {
    try {
      console.log(`Generating progressive story for difficulty: ${difficulty}`);
      
      // Use progressive story generation for smoother difficulty transitions
      const result = ProgressiveStoryGenerator.generateProgressiveStory(userInfo, difficulty, pageCount);
      
      // Quality check all generated pages
      const qualityCheck = StoryQualityChecker.checkStoryQuality(result.pages, difficulty);
      if (!qualityCheck.isValid) {
        console.warn('Story quality issues detected:', qualityCheck.issues);
        // Apply grammar fixes to pages
        const fixedPages = result.pages.map(validateAndFixGrammar);
        console.log(`Successfully generated ${fixedPages.length} pages with progressive quality validation`);
        return { pages: fixedPages, config: result.config };
      }
      
      console.log(`Successfully generated ${result.pages.length} progressive pages`);
      return { pages: result.pages, config: result.config };
      
    } catch (error) {
      console.error('Progressive story generation failed, falling back to template system:', error);
      
      // Fallback to template-based generation
      const pages = this.getHighQualityStory(userInfo, difficulty, pageCount);
      const config = this.getReadingConfigForDifficulty(difficulty);
      return { pages, config };
    }
  }
  
  /**
   * Generate story continuation that flows from existing story context
   */
  static async generateStoryContinuation(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number = 5,
    existingContext: string = ""
  ): Promise<{ pages: string[]; config: any }> {
    try {
      console.log(`Generating story continuation for difficulty: ${difficulty}`);
      
      // Generate continuation pages
      const pages = this.getContinuationPages(userInfo, difficulty, pageCount);
      const config = this.getReadingConfigForDifficulty(difficulty);
      
      console.log(`Successfully generated ${pages.length} continuation pages`);
      return { pages, config };
      
    } catch (error) {
      console.warn('Story continuation failed, generating new pages:', error);
      
      // Fallback: Generate new pages using template system
      const result = await this.generateStory(userInfo, difficulty, pageCount);
      // Always use English for stories - this is an English reading education app
      const language = 'en';
      const name = userInfo.name || 'Alex';
      
      // Use the template system for continuation text (in English)
      const continuationText = getContinuationText(name, userInfo, language);
      
      // Add continuation context to first page
      if (result.pages.length > 0) {
        result.pages[0] = `${continuationText} ${result.pages[0]}`;
      }
      
      return result;
    }
  }
  
  /**
   * High-quality story templates using the new template system
   * NOTE: Currently focused on English reading education only
   */
  private static getHighQualityStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): string[] {
    // Always use English for stories - this is an English reading education app
    const language = 'en';
    
    // Get a random story template for English and this difficulty
    const template = getRandomStoryTemplate(language, difficulty);
    
    // Process the template with user data
    const processedPages = processStoryTemplate(template, userInfo, language);
    
    // If we need more pages than the template provides, extend it
    if (pageCount > processedPages.length) {
      const extendedStory = [...processedPages];
      const continuationPages = this.getContinuationPages(userInfo, difficulty, pageCount - processedPages.length);
      extendedStory.push(...continuationPages);
      return extendedStory;
    }
    
    // If we need fewer pages, return a slice of the processed story
    return processedPages.slice(0, pageCount);
  }
  
  /**
   * Generate continuation pages for adding to existing stories
   */
  private static getContinuationPages(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number): string[] {
    // Always use English for stories - this is an English reading education app
    const language = 'en';
    
    // Create a simple continuation template and process it
    const continuationTemplate = {
      name: "Story Continuation",
      pages: this.getContinuationTemplateForLanguage(language, difficulty, pageCount)
    };
    
    // Process the template with user data
    const processedPages = processStoryTemplate(continuationTemplate, userInfo, language);
    
    return processedPages.slice(0, pageCount);
  }
  
  /**
   * Get continuation templates based on language and difficulty
   */
  private static getContinuationTemplateForLanguage(language: string, difficulty: DifficultyLevel, pageCount: number): string[] {
    // ALWAYS use English templates for story generation - this is an English reading education app
    const templates = {
      easy: [
        `{name} and the {animal} went to explore.`,
        `{subject_cap} found a beautiful flower.`,
        `"Look at this!" said {name}.`,
        `The {animal} was very excited.`,
        `{subject_cap} picked flowers for home.`,
        `What a wonderful day it was!`,
        `{name} felt very happy.`,
        `The {animal} was happy too.`,
        `{subject_cap} played together all afternoon.`,
        `It was the best day ever.`
      ],
      medium: [
        `The next day brought a new adventure for {name}.`,
        `The {animal} had discovered something interesting nearby.`,
        `Together, they set out to investigate this mystery.`,
        `What {subject} found surprised them completely.`,
        `{name} realized this was just the beginning.`,
        `Each day would bring new discoveries and joy.`,
        `Their friendship continued to grow stronger.`,
        `The world seemed full of endless possibilities.`,
        `{name} learned something new every single day.`,
        `Adventure was waiting around every corner.`
      ],
      hard: [
        `{name}'s adventures were far from over.`,
        `New challenges arose that would test {possessive} growing wisdom.`,
        `The {animal} proved to be an invaluable guide and friend.`,
        `Together, they faced each obstacle with determination.`,
        `{name} discovered an inner strength {subject} never knew existed.`,
        `The lessons learned would serve {object} well in future trials.`,
        `Their bond deepened through shared experiences and trust.`,
        `Each victory made them more confident and capable.`,
        `{name} began to understand the true meaning of courage.`,
        `The journey had changed {object} in wonderful ways.`
      ],
      expert: [
        `{name}'s journey of growth and discovery continued to unfold.`,
        `The complexities of {possessive} world revealed new layers of understanding.`,
        `Working alongside the {animal}, {subject} faced increasingly difficult challenges.`,
        `Each experience taught valuable lessons about leadership and compassion.`,
        `{name} began to see how {possessive} actions affected the broader community.`,
        `The wisdom gained would guide {object} through future decisions.`,
        `{subject_cap} learned that true strength comes from helping others.`,
        `The {animal} became not just a companion, but a teacher of life's deeper truths.`,
        `{name} realized that every ending is actually a new beginning.`,
        `The greatest adventures were the ones that changed who {subject} was inside.`
      ]
    };
    
    const selectedTemplates = templates[difficulty] || templates.easy;
    
    // Return the requested number of pages, cycling through if necessary
    const result = [];
    for (let i = 0; i < pageCount; i++) {
      result.push(selectedTemplates[i % selectedTemplates.length]);
    }
    
    return result;
  }
  
  /**
   * Get reading configuration for difficulty level (updated for progressive scaling)
   */
  private static getReadingConfigForDifficulty(difficulty: DifficultyLevel) {
    // Use progressive story generator configuration for consistency
    return ProgressiveStoryGenerator.getReadingConfigForDifficulty(difficulty);
  }
}