// Centralized story generation service with high-quality templates
import type { UserInfo, DifficultyLevel } from "@/types";

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
      
      // Use our carefully crafted templates
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
      
      // Fallback: Generate new pages
      const result = await this.generateStory(userInfo, difficulty, pageCount);
      const name = userInfo.name || 'Alex';
      const gender = userInfo.avatar?.type || 'boy';
      const pronoun = gender === 'girl' ? 'her' : gender === 'prefer-not-to-answer' ? 'their' : 'his';
      
      // Add continuation context to first page
      if (result.pages.length > 0) {
        result.pages[0] = `Meanwhile, ${name} continued ${pronoun} adventure. ${result.pages[0]}`;
      }
      
      return result;
    }
  }
  
  /**
   * High-quality story templates that read like real children's books
   */
  private static getHighQualityStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): string[] {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    const color = userInfo.favoriteColor || 'blue';
    
    // Get proper pronouns based on user's gender selection
    const getPronouns = () => {
      const gender = userInfo.avatar?.type || 'boy';
      if (gender === 'girl') {
        return { subject: 'she', object: 'her', possessive: 'her' };
      } else if (gender === 'prefer-not-to-answer') {
        return { subject: 'they', object: 'them', possessive: 'their' };
      } else {
        return { subject: 'he', object: 'him', possessive: 'his' };
      }
    };
    
    const pronouns = getPronouns();
    
    const stories = {
      easy: [
        `${name} woke up early one morning.`,
        `Outside, ${name} saw something wonderful.`,
        `A friendly ${color} ${animal} was playing.`,
        `"Hello!" said ${name} with a smile.`,
        `The ${animal} came over to play.`,
        `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} had so much fun together.`,
        `${name} gave the ${animal} some food.`,
        `"Thank you!" the ${animal} seemed to say.`,
        `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} became the very best friends.`,
        `Every day was full of joy.`
      ],
      medium: [
        `${name} loved exploring the world around ${pronouns.object}.`,
        `One sunny afternoon, something magical happened.`,
        `A beautiful ${color} ${animal} appeared in ${pronouns.possessive} garden.`,
        `This wasn't just any ordinary ${animal} - it was special.`,
        `"I've been waiting for someone like you," it said gently.`,
        `${name} felt excited and a little nervous too.`,
        `Together, they walked to a secret place.`,
        `The ${animal} showed ${name} hidden wonders everywhere.`,
        `"You have a kind heart," said the ${animal} warmly.`,
        `From that day on, they shared amazing adventures.`
      ],
      hard: [
        `${name} had always felt different from other children.`,
        `While friends played normal games, ${name} dreamed of greater adventures.`,
        `One evening, an extraordinary ${color} ${animal} arrived at ${pronouns.possessive} door.`,
        `"I need your help," the ${animal} said urgently.`,
        `"There's trouble in the enchanted forest, and only someone with your courage can help."`,
        `${name} didn't hesitate - this was the adventure ${pronouns.subject} had been waiting for.`,
        `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} journeyed through mysterious paths filled with wonder and danger.`,
        `Along the way, ${name} discovered hidden strengths and newfound confidence.`,
        `Together, they solved the forest's ancient mystery.`,
        `${name} returned home forever changed, knowing ${pronouns.subject} was truly special.`
      ],
      expert: [
        `${name} had always possessed an unusual gift for understanding the world differently.`,
        `When others saw ordinary things, ${name} glimpsed the extraordinary magic hidden beneath.`,
        `The arrival of a wise ${color} ${animal} confirmed what ${name} had long suspected.`,
        `"Your perspective is needed to heal an ancient rift between our worlds," it explained.`,
        `This wasn't just about helping - it was about ${name}'s destiny and purpose.`,
        `The journey would test not only ${name}'s courage but ${pronouns.possessive} wisdom and compassion.`,
        `Through trials that challenged everything ${name} believed about ${pronouns.object}self, ${pronouns.subject} persevered.`,
        `The ${animal} became not just a guide, but a teacher of life's deeper truths.`,
        `By story's end, ${name} had not only saved both worlds but discovered ${pronouns.possessive} true calling.`,
        `The adventure was over, but ${name}'s real journey of purpose had just begun.`
      ]
    };
    
    const baseStory = stories[difficulty] || stories.easy;
    
    // If we need more pages than the base story provides, extend it
    if (pageCount > baseStory.length) {
      const extendedStory = [...baseStory];
      const continuationTemplates = {
        easy: [
          `${name} and the ${animal} played every day.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} found new friends to join ${pronouns.object}.`,
          `The ${animal} taught ${name} fun games.`,
          `${name} learned to be even kinder.`,
          `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} friendship grew stronger each day.`,
          `Everyone loved ${name} and the ${animal}.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} helped other children too.`,
          `The neighborhood became happier.`,
          `${name} felt proud and grateful.`,
          `It was the best friendship ever.`
        ],
        medium: [
          `${name} and the ${animal} explored new places together.`,
          `Each adventure taught ${pronouns.object} valuable lessons about friendship.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} helped other creatures ${pronouns.subject} met along the way.`,
          `${name} grew more confident with each passing day.`,
          `The ${animal} shared ancient wisdom about kindness and courage.`,
          `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} bond became an inspiration to everyone around ${pronouns.object}.`,
          `Other children began to notice ${name}'s special gift.`,
          `${name} learned that helping others brought the greatest joy.`,
          `The adventures continued, but now with new friends joining.`,
          `${name} realized that magic exists in everyday moments.`
        ],
        hard: [
          `${name}'s reputation as a brave problem-solver began to spread.`,
          `New challenges arrived, each one teaching important life lessons.`,
          `The ${animal} remained a loyal companion through every trial.`,
          `${name} learned that true strength comes from caring about others.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} faced fears that once seemed impossible to overcome.`,
          `With each victory, ${name}'s confidence and wisdom grew.`,
          `The partnership with the ${animal} evolved into deep mutual respect.`,
          `Other young people sought ${name}'s advice and friendship.`,
          `${name} discovered that leadership means lifting others up.`,
          `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} story became a legend that inspired future generations.`
        ],
        expert: [
          `${name}'s journey had awakened abilities ${pronouns.subject} never knew existed.`,
          `The complexity of ${pronouns.possessive} mission required both intellect and emotional intelligence.`,
          `Working alongside the ${animal}, ${pronouns.subject} tackled problems that affected entire communities.`,
          `Each success brought new responsibilities and deeper understanding.`,
          `${name} learned to balance personal desires with collective needs.`,
          `The relationship with the ${animal} became a model of partnership and trust.`,
          `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} work began to bridge divides between different groups and cultures.`,
          `${name} discovered that true heroism lies in consistent, everyday choices.`,
          `The legacy ${pronouns.subject} were building would outlast any single adventure.`,
          `${name} understood that this was only the beginning of a life dedicated to service.`
        ]
      };
      
      const templates = continuationTemplates[difficulty] || continuationTemplates.easy;
      
      // Add pages until we reach the requested count
      for (let i = baseStory.length; i < pageCount; i++) {
        const templateIndex = (i - baseStory.length) % templates.length;
        extendedStory.push(templates[templateIndex]);
      }
      
      return extendedStory;
    }
    
    // If we need fewer pages, return a slice of the base story
    return baseStory.slice(0, pageCount);
  }
  
  /**
   * Generate continuation pages for adding to existing stories
   */
  private static getContinuationPages(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number): string[] {
    const name = userInfo.name || 'Alex';
    const animal = userInfo.favoriteAnimal || 'cat';
    
    // Get proper pronouns based on user's gender selection
    const getPronouns = () => {
      const gender = userInfo.avatar?.type || 'boy';
      if (gender === 'girl') {
        return { subject: 'she', object: 'her', possessive: 'her' };
      } else if (gender === 'prefer-not-to-answer') {
        return { subject: 'they', object: 'them', possessive: 'their' };
      } else {
        return { subject: 'he', object: 'him', possessive: 'his' };
      }
    };
    
    const pronouns = getPronouns();
    
    const continuationTemplates = {
      easy: [
        `${name} and the ${animal} went exploring.`,
        `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} found a beautiful flower.`,
        `"Look at this!" said ${name}.`,
        `The ${animal} was very excited.`,
        `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} picked flowers for home.`,
        `What a wonderful day it was!`,
        `${name} felt so happy.`,
        `The ${animal} was happy too.`
      ],
      medium: [
        `The next day brought a new adventure for ${name}.`,
        `The ${animal} had discovered something interesting nearby.`,
        `Together, ${pronouns.subject} set off to investigate this mystery.`,
        `What ${pronouns.subject} found surprised ${pronouns.object} both completely.`,
        `${name} realized this was just the beginning.`,
        `Each day would bring new discoveries and joy.`,
        `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} friendship continued to grow stronger.`,
        `The world seemed full of endless possibilities.`
      ],
      hard: [
        `${name}'s adventures were far from over.`,
        `New challenges emerged that would test ${pronouns.possessive} growing wisdom.`,
        `The ${animal} proved to be an invaluable guide and friend.`,
        `Together, ${pronouns.subject} faced each obstacle with determination.`,
        `${name} discovered inner strength ${pronouns.subject} never knew existed.`,
        `The lessons learned would serve ${pronouns.object} well in future trials.`,
        `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} bond deepened through shared experiences and trust.`,
        `Each victory made ${pronouns.object} more confident and capable.`
      ],
      expert: [
        `${name}'s journey of growth and discovery continued to unfold.`,
        `The complexities of ${pronouns.possessive} world revealed new layers of understanding.`,
        `Working with the ${animal}, ${pronouns.subject} tackled increasingly difficult challenges.`,
        `Each experience taught valuable lessons about leadership and compassion.`,
        `${name} began to see how ${pronouns.possessive} actions affected the broader community.`,
        `The partnership evolved into a powerful force for positive change.`,
        `${pronouns.possessive.charAt(0).toUpperCase() + pronouns.possessive.slice(1)} story became an inspiration for others facing similar struggles.`,
        `${name} understood that true success meant lifting others up as well.`
      ]
    };
    
    const templates = continuationTemplates[difficulty] || continuationTemplates.easy;
    const pages: string[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const templateIndex = i % templates.length;
      pages.push(templates[templateIndex]);
    }
    
    return pages;
  }
  
  /**
   * Get reading configuration for difficulty level
   */
  private static getReadingConfigForDifficulty(difficulty: DifficultyLevel) {
    const configs = {
      easy: {
        maxWordsPerPage: 6,
        fontSize: 'text-4xl md:text-5xl lg:text-6xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-4'
      },
      medium: {
        maxWordsPerPage: 35,
        fontSize: 'text-3xl md:text-4xl lg:text-5xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-4'
      },
      hard: {
        maxWordsPerPage: 65,
        fontSize: 'text-2xl md:text-3xl lg:text-4xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-4'
      },
      expert: {
        maxWordsPerPage: 85,
        fontSize: 'text-xl md:text-2xl lg:text-3xl',
        lineHeight: 'leading-relaxed',
        spacing: 'space-y-4'
      }
    };
    
    return configs[difficulty] || configs.easy;
  }
}