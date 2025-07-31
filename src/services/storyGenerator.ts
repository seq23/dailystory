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
    
    // Multiple story variations for each difficulty level to ensure variety
    const storyVariations = {
      easy: [
        // Variation 1: Morning Adventure
        [
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
        // Variation 2: Garden Discovery
        [
          `${name} was playing in the garden.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} heard a soft sound.`,
          `Behind a ${color} flower sat a tiny ${animal}.`,
          `The ${animal} looked lost and scared.`,
          `${name} sat down very quietly.`,
          `"Don't worry," ${name} whispered softly.`,
          `The ${animal} slowly came closer.`,
          `${name} was very gentle and kind.`,
          `Soon they were playing together happily.`,
          `${name} had found a wonderful new friend.`
        ],
        // Variation 3: Rainy Day Story
        [
          `It was raining outside today.`,
          `${name} felt a little sad inside.`,
          `Then ${pronouns.subject} saw a ${color} ${animal} outside.`,
          `The ${animal} was getting very wet.`,
          `${name} opened the door quickly.`,
          `"Come in!" ${name} called out warmly.`,
          `The ${animal} ran inside gratefully.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} dried off by the warm fire.`,
          `Now the rainy day felt perfect.`,
          `${name} learned that helping feels wonderful.`
        ]
      ],
      medium: [
        // Variation 1: Magical Meeting
        [
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
        // Variation 2: Forest Adventure
        [
          `${name} discovered a path ${pronouns.subject} had never seen before.`,
          `The forest trail was covered in ${color} leaves.`,
          `As ${pronouns.subject} walked, a wise ${animal} appeared.`,
          `"This forest holds many secrets," the ${animal} explained.`,
          `${name} listened carefully to every word.`,
          `Together, they explored the mysterious woods.`,
          `The ${animal} taught ${name} about nature's magic.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} learned to read the signs in trees and flowers.`,
          `"You're a natural explorer," said the ${animal} proudly.`,
          `${name} felt proud of ${pronouns.possessive} new skills and friendship.`
        ],
        // Variation 3: Night Sky Story
        [
          `${name} loved looking at the stars each night.`,
          `One evening, a ${color} ${animal} joined ${pronouns.object} outside.`,
          `"Do you know the story of the constellations?" it asked.`,
          `${name} shook ${pronouns.possessive} head with curiosity.`,
          `The ${animal} began to tell amazing tales.`,
          `Each star had its own special story.`,
          `Together, they watched the moon rise slowly.`,
          `"The night sky connects all living things," the ${animal} shared.`,
          `${name} felt wonder fill ${pronouns.possessive} heart completely.`,
          `Every night became a new adventure in learning.`
        ]
      ],
      hard: [
        // Variation 1: Courage Quest
        [
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
        // Variation 2: Time Guardian
        [
          `${name} found an old pocket watch in ${pronouns.possessive} grandmother's attic.`,
          `When ${pronouns.subject} touched it, time seemed to slow down.`,
          `A shimmering ${color} ${animal} materialized before ${pronouns.object}.`,
          `"You've been chosen as a Time Guardian," it announced solemnly.`,
          `${name} learned that ${pronouns.subject} could help fix problems in history.`,
          `Together, they traveled to moments when kindness was needed most.`,
          `${name} helped children from different eras overcome their challenges.`,
          `"Every act of compassion ripples through time," the ${animal} explained.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} realized ${pronouns.possessive} own problems seemed smaller now.`,
          `${name} had learned that helping others was the greatest adventure of all.`
        ],
        // Variation 3: Dream Weaver
        [
          `${name} had the most vivid dreams every single night.`,
          `Unlike other children, ${pronouns.subject} could remember every detail.`,
          `One morning, a mystical ${color} ${animal} was waiting in ${pronouns.possessive} room.`,
          `"Your dreams are gateways to other worlds," it revealed mysteriously.`,
          `${name} learned that ${pronouns.subject} was a Dream Weaver.`,
          `Together, they entered dreams to help children facing nightmares.`,
          `${name} discovered ${pronouns.subject} could transform fear into hope.`,
          `"Your imagination is a powerful gift," the ${animal} encouraged warmly.`,
          `With each dream ${pronouns.subject} healed, ${name} grew more confident.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} had found ${pronouns.possessive} true calling as a helper of dreams.`
        ]
      ],
      expert: [
        // Variation 1: World Bridge
        [
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
        ],
        // Variation 2: Element Keeper
        [
          `${name} discovered that ${pronouns.subject} could communicate with the natural elements.`,
          `Fire whispered secrets, water sang melodies, earth shared ancient wisdom.`,
          `A majestic ${color} ${animal} appeared when the balance of nature was threatened.`,
          `"The elements have chosen you as their voice," it declared with reverence.`,
          `${name} learned that human actions were disrupting the elemental harmony.`,
          `Together, they embarked on a mission to restore the natural balance.`,
          `${name} had to convince people to change their relationship with nature.`,
          `"True leadership means serving something greater than yourself," the ${animal} taught.`,
          `Through patience and understanding, ${name} helped humans reconnect with the earth.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} became a bridge between civilization and the natural world.`
        ],
        // Variation 3: Memory Keeper
        [
          `${name} realized ${pronouns.subject} could see the memories hidden in old objects.`,
          `Every antique, every heirloom told its story when ${pronouns.subject} touched it.`,
          `An ancient ${color} ${animal} guardian appeared to guide this rare gift.`,
          `"Lost histories need someone to remember and preserve them," it explained thoughtfully.`,
          `${name} learned that forgotten stories held lessons for the present.`,
          `Together, they collected memories that were in danger of being lost forever.`,
          `${name} became a living library of human experiences and wisdom.`,
          `"Memory is the thread that connects all generations," the ${animal} shared deeply.`,
          `By preserving the past, ${name} was actually creating a better future.`,
          `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} understood that ${pronouns.possessive} gift was a responsibility to all humanity.`
        ]
      ]
    };

    // Randomly select a story variation to ensure variety between sessions
    const variations = storyVariations[difficulty] || storyVariations.easy;
    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
    const baseStory = selectedVariation;
    
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
        `Together, they set off to investigate this mystery.`,
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