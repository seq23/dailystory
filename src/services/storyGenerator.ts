// Centralized story generation service with high-quality templates
import type { UserInfo, DifficultyLevel } from "@/types";
import { 
  STORY_LANGUAGES, 
  getRandomStoryTemplate, 
  processStoryTemplate, 
  getContinuationText 
} from './storyTemplates';

export class StoryGeneratorService {
  /**
   * Main story generation method with high-quality templates
   */
  static async generateStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number = 10
  ): Promise<{ pages: string[]; config: any }> {
    try {
      console.log(`Generating high-quality story for difficulty: ${difficulty}`);
      
      // Use our template-based story system
      const pages = this.getHighQualityStory(userInfo, difficulty, pageCount);
      const config = this.getReadingConfigForDifficulty(difficulty);
      
      console.log(`Successfully generated ${pages.length} pages`);
      return { pages, config };
      
    } catch (error) {
      console.error('Story generation failed:', error);
      throw error;
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
      const language = userInfo.nativeLanguage || 'en';
      const name = userInfo.name || 'Alex';
      
      // Use the template system for continuation text
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
    const templates = language === 'es' ? {
      easy: [
        `{name} y el {animal} fueron a explorar.`,
        `{subject_cap} encontraron una hermosa flor.`,
        `"¡Mira esto!" dijo {name}.`,
        `El {animal} estaba muy emocionado.`,
        `{subject_cap} recogieron flores para casa.`,
        `¡Qué día tan maravilloso fue!`,
        `{name} se sintió muy feliz.`,
        `El {animal} también estaba feliz.`
      ],
      medium: [
        `El día siguiente trajo una nueva aventura para {name}.`,
        `El {animal} había descubierto algo interesante cerca.`,
        `Juntos, se dispusieron a investigar este misterio.`,
        `Lo que {subject} encontraron los sorprendió completamente.`,
        `{name} se dio cuenta de que esto era solo el comienzo.`,
        `Cada día traería nuevos descubrimientos y alegría.`,
        `Su amistad continuó creciendo más fuerte.`,
        `El mundo parecía lleno de posibilidades infinitas.`
      ],
      hard: [
        `Las aventuras de {name} estaban lejos de terminar.`,
        `Surgieron nuevos desafíos que pondrían a prueba su sabiduría creciente.`,
        `El {animal} demostró ser una guía y amigo invaluable.`,
        `Juntos, enfrentaron cada obstáculo con determinación.`,
        `{name} descubrió una fuerza interior que nunca supo que existía.`,
        `Las lecciones aprendidas le servirían bien en futuras pruebas.`,
        `Su vínculo se profundizó a través de experiencias compartidas y confianza.`,
        `Cada victoria los hizo más confiados y capaces.`
      ],
      expert: [
        `El viaje de crecimiento y descubrimiento de {name} continuó desarrollándose.`,
        `Las complejidades de su mundo revelaron nuevas capas de comprensión.`,
        `Trabajando con el {animal}, {subject} enfrentó desafíos cada vez más difíciles.`,
        `Cada experiencia enseñó lecciones valiosas sobre liderazgo y compasión.`,
        `{name} comenzó a ver cómo sus acciones afectaban a la comunidad más amplia.`,
        `La asociación evolucionó en una fuerza poderosa para el cambio positivo.`,
        `Su historia se convirtió en una inspiración para otros que enfrentaban luchas similares.`,
        `{name} entendió que el verdadero éxito significaba elevar a otros también.`
      ]
    } : {
      easy: [
        `{name} and the {animal} went exploring.`,
        `{subject_cap} found a beautiful flower.`,
        `"Look at this!" said {name}.`,
        `The {animal} was very excited.`,
        `{subject_cap} picked flowers for home.`,
        `What a wonderful day it was!`,
        `{name} felt so happy.`,
        `The {animal} was happy too.`
      ],
      medium: [
        `The next day brought a new adventure for {name}.`,
        `The {animal} had discovered something interesting nearby.`,
        `Together, they set off to investigate this mystery.`,
        `What {subject} found surprised {object} both completely.`,
        `{name} realized this was just the beginning.`,
        `Each day would bring new discoveries and joy.`,
        `{possessive} friendship continued to grow stronger.`,
        `The world seemed full of endless possibilities.`
      ],
      hard: [
        `{name}'s adventures were far from over.`,
        `New challenges emerged that would test {possessive} growing wisdom.`,
        `The {animal} proved to be an invaluable guide and friend.`,
        `Together, {subject} faced each obstacle with determination.`,
        `{name} discovered inner strength {subject} never knew existed.`,
        `The lessons learned would serve {object} well in future trials.`,
        `{possessive} bond deepened through shared experiences and trust.`,
        `Each victory made {object} more confident and capable.`
      ],
      expert: [
        `{name}'s journey of growth and discovery continued to unfold.`,
        `The complexities of {possessive} world revealed new layers of understanding.`,
        `Working with the {animal}, {subject} tackled increasingly difficult challenges.`,
        `Each experience taught valuable lessons about leadership and compassion.`,
        `{name} began to see how {possessive} actions affected the broader community.`,
        `The partnership evolved into a powerful force for positive change.`,
        `{possessive} story became an inspiration for others facing similar struggles.`,
        `{name} understood that true success meant lifting others up as well.`
      ]
    };
    
    const baseTemplates = templates[difficulty] || templates.easy;
    const pages: string[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const templateIndex = i % baseTemplates.length;
      pages.push(baseTemplates[templateIndex]);
    }
    
    return pages;
  }
  
  /**
   * Get educational reading configuration for difficulty level
   * Now uses standardized educational word count limits
   */
  private static getReadingConfigForDifficulty(difficulty: DifficultyLevel) {
    const configs = {
      easy: {
        maxWordsPerPage: 6,  // Educational standard for emergent readers
        fontSize: 'text-4xl md:text-5xl lg:text-6xl',
        lineHeight: 'leading-loose',
        spacing: 'space-y-8'
      },
      medium: {
        maxWordsPerPage: 8,  // Educational standard for early readers
        fontSize: 'text-3xl md:text-4xl lg:text-5xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-6'
      },
      hard: {
        maxWordsPerPage: 12, // Educational standard for developing readers
        fontSize: 'text-2xl md:text-3xl lg:text-4xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-4'
      },
      expert: {
        maxWordsPerPage: 15, // Educational standard for fluent readers
        fontSize: 'text-xl md:text-2xl lg:text-3xl',
        lineHeight: 'leading-normal',
        spacing: 'space-y-4'
      }
    };
    
    return configs[difficulty] || configs.easy;
  }
}