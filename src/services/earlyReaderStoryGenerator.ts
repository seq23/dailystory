// Enhanced story generator with word limits for early readers
import type { UserInfo, DifficultyLevel } from "@/types";
import StoryQualityChecker from "@/utils/storyQualityChecker";
import GrammarValidator from "@/utils/grammarValidator";
import { ProgressiveStoryGenerator } from "./progressiveStoryGenerator";
import { VocabularyLevelClassifier } from "@/utils/vocabularyLevelClassifier";

interface ReadingConfig {
  maxWordsPerPage: number;
  fontSize: string;
  lineHeight: string;
  spacing: string;
}

export class EarlyReaderStoryGenerator {
  
  // Configure reading experience by difficulty level (updated for progressive scaling)
  // Word counts and text sizes balanced for smoother learning progression
  // ENHANCED: Progressive difficulty with bridge levels for smoother transitions
  // Text sizes: BIGGEST for easiest levels, SMALLER as difficulty increases
  private static getReadingConfig(difficulty: DifficultyLevel): ReadingConfig {
    // Use progressive story generator for consistency and smooth transitions
    const progressiveConfig = ProgressiveStoryGenerator.getReadingConfigForDifficulty(difficulty);
    
    return {
      maxWordsPerPage: progressiveConfig.maxWordsPerPage,
      fontSize: progressiveConfig.fontSize,
      lineHeight: progressiveConfig.lineHeight,
      spacing: progressiveConfig.spacing
    };
  }

  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): {
    pages: string[];
    config: ReadingConfig;
  } {
    try {
      console.log(`Early Reader Generator: Using progressive approach for ${difficulty} level`);
      
      // Use progressive story generation for smoother transitions
      const result = ProgressiveStoryGenerator.generateProgressiveStory(userInfo, difficulty, pageCount);
      
      // Convert to ReadingConfig format for compatibility
      const config: ReadingConfig = {
        maxWordsPerPage: result.config.maxWordsPerPage,
        fontSize: result.config.fontSize,
        lineHeight: result.config.lineHeight,
        spacing: result.config.spacing
      };
      
      // Additional vocabulary validation for early readers
      this.validateEarlyReaderVocabulary(result.pages, difficulty);
      
      // Quality check the generated story
      const qualityCheck = StoryQualityChecker.checkStoryQuality(result.pages, difficulty);
      if (!qualityCheck.isValid) {
        console.warn('Early reader story quality issues detected:', qualityCheck.issues);
      }
      
      return { pages: result.pages, config };
      
    } catch (error) {
      console.warn('Progressive generation failed, falling back to traditional approach:', error);
      
      // Fallback to original approach
      const config = this.getReadingConfig(difficulty);
      const characterName = userInfo.name?.trim() || 'Alex';
      
      // Collect and organize user inputs for organic integration
      const userElements = this.extractUserElements(userInfo);
      
      // Determine correct pronouns based on avatar selection
      const pronouns = this.getPronounsFromAvatar(userInfo.avatar?.type);
      
      // Generate story content with organic user element integration 
      const storyContent = this.createStoryContent(characterName, userElements, difficulty, pronouns);
      
      // Split into pages respecting word limits with continuing user elements
      const pages = this.splitIntoPages(storyContent, config.maxWordsPerPage, pageCount, characterName, userElements, difficulty, pronouns);
      
      // Verify word limits are being enforced
      this.verifyWordLimits(pages, config.maxWordsPerPage, difficulty);
      
      return { pages, config };
    }
  }

  // Get correct pronouns based on avatar type
  private static getPronounsFromAvatar(avatarType?: string): { subject: string, object: string, possessive: string } {
    switch (avatarType) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }

  // Extract and organize user inputs for organic story integration
  private static extractUserElements(userInfo: UserInfo): {
    favoriteColor: string;
    favoriteAnimal: string;
    favoriteFood: string;
    hobbies: string[];
    interests: string[];
  } {
    const favoriteColor = userInfo.favoriteColor?.toLowerCase()?.trim() || 'blue';
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat';
    const favoriteFood = userInfo.favoriteFood?.toLowerCase()?.trim() || 'pizza';
    
    // Parse hobbies and interests into arrays
    const hobbies = userInfo.hobbies?.split(/[,\s]+/).filter(h => h.length > 0) || ['reading'];
    const interestsFromSpecialRequest = userInfo.specialRequest?.split(/[,\s]+/).filter(i => i.length > 0) || [];
    const interests = [...hobbies, ...interestsFromSpecialRequest].filter((item, index, arr) => 
      arr.indexOf(item) === index // Remove duplicates
    ).slice(0, 5); // Limit to 5 for manageable integration

    return {
      favoriteColor,
      favoriteAnimal,
      favoriteFood,
      hobbies,
      interests
    };
  }

  private static createStoryContent(
    characterName: string,
    userElements: any,
    difficulty: DifficultyLevel,
    pronouns: { subject: string, object: string, possessive: string }
  ): string {
    switch (difficulty) {
      case 'easy':
        return this.createEasyStory(characterName, userElements, pronouns);
      case 'medium':
        return this.createMediumStory(characterName, userElements, pronouns);
      case 'hard':
        return this.createHardStory(characterName, userElements, pronouns);
      case 'expert':
        return this.createExpertStory(characterName, userElements, pronouns);
    }
  }

  private static createEasyStory(characterName: string, userElements: any, pronouns: { subject: string, object: string, possessive: string }): string {
    // PreK-1st Grade Style: Julia Donaldson, Mo Willems, Dr. Seuss, Kevin Henkes
    // Simple, rhythmic, repetitive patterns with very basic vocabulary
    const { favoriteColor, favoriteAnimal, favoriteFood } = userElements;
    
    const simpleStories = [
      `${characterName} saw ${GrammarValidator.createNounPhrase(favoriteColor, favoriteAnimal)}. Big ${favoriteAnimal}! Happy ${favoriteAnimal}! The ${favoriteAnimal} saw ${characterName}. Happy ${characterName}! ${characterName} played with ${favoriteColor} toys. Fun, fun, fun! Time for ${favoriteFood}. Yum! Wave goodbye! The end.`,
      `Look, ${characterName}! See the ${favoriteAnimal}? The ${favoriteAnimal} is ${favoriteColor}. The ${favoriteAnimal} is soft. ${characterName} likes ${favoriteAnimal}. ${favoriteAnimal} likes ${favoriteFood} too. ${characterName} shares and eats. Good friends! Happy day! Hooray!`,
      `Go, ${characterName}, go! Run to the ${favoriteColor} house. The ${favoriteAnimal} runs too. Fast, fast, fast! Stop for ${favoriteFood}. Yum, yum! Time to play with ${favoriteColor} ball. Play and laugh. What a day! Home we go.`
    ];
    return simpleStories[Math.floor(Math.random() * simpleStories.length)];
  }

  private static createMediumStory(characterName: string, userElements: any, pronouns: { subject: string, object: string, possessive: string }): string {
    // 2nd-3rd Grade Style: Jeff Kinney, Roald Dahl, Dav Pilkey, Andrea Beaty
    // Engaging plots with humor, simple dialogue, and kid-friendly adventures
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies } = userElements;
    const mainHobby = hobbies[0] || 'playing';
    
    const mediumStories = [
      `${characterName} was having the most ordinary Tuesday ever when something extraordinary happened. ${GrammarValidator.createNounPhrase('talking', favoriteAnimal, false)} with beautiful ${favoriteColor} fur knocked on the front door! "I need your help," said the ${favoriteAnimal} politely. "I've lost my favorite ${favoriteFood} recipe!" It turns out there was a mystery in the park that only a brave kid who loved ${mainHobby} like ${characterName} could solve. Together, ${pronouns.subject} followed mysterious ${favoriteColor} paw prints that led to a hidden treasure chest filled with magical recipes. What an adventure! ${characterName} and the ${favoriteAnimal} decided to meet every Tuesday for more fun.`,
      `"This is going to be AWESOME!" shouted ${characterName} as ${pronouns.subject} grabbed ${pronouns.possessive} ${favoriteColor} backpack and raced to the playground for some ${mainHobby}. But when ${pronouns.subject} arrived, ${pronouns.subject} discovered ${GrammarValidator.createNounPhrase('very sad', favoriteAnimal, false)} sitting all alone on a bench, looking at an empty ${favoriteFood} container. The ${favoriteAnimal} had lost its lunch and couldn't find any ${favoriteFood} anywhere! ${characterName} had a brilliant idea - ${pronouns.subject} would organize the greatest ${favoriteColor}-themed treasure hunt the neighborhood had ever seen! By the end of the day, not only did ${pronouns.subject} find plenty of ${favoriteFood} to share, but ${pronouns.subject} also made twenty new friends who loved ${mainHobby} too.`,
      `${characterName} loved ${mainHobby} and inventing things in ${pronouns.possessive} ${favoriteColor} garage workshop. Today's project was a Super-Duper Pet Communicator 3000! When ${pronouns.subject} tested it on ${GrammarValidator.createNounPhrase('friendly', favoriteAnimal, false)} from next door while sharing some ${favoriteFood}, something magical happened - ${pronouns.subject} could actually understand each other! The ${favoriteAnimal} told jokes about ${favoriteColor} things, shared secrets, and even helped ${characterName} with homework between bites of ${favoriteFood}. From that day forward, ${characterName} knew that the best inventions always bring friends together, especially when you share your favorite things.`
    ];
    return mediumStories[Math.floor(Math.random() * mediumStories.length)];
  }

  private static createHardStory(characterName: string, userElements: any, pronouns: { subject: string, object: string, possessive: string }): string {
    // 4th-5th Grade Style: Katherine Applegate, C.S. Lewis, J.K. Rowling
    // More complex plots with character development and meaningful themes
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const mainHobby = hobbies[0] || 'exploring';
    const secondInterest = interests[1] || 'magic';
    
    const hardStories = [
      `${characterName} had always been fascinated by ${mainHobby}, but nothing could have prepared ${pronouns.object} for what ${pronouns.subject} discovered that ${favoriteColor}-skied morning. Deep in the ancient forest behind ${pronouns.possessive} house, ${pronouns.subject} encountered a magnificent ${favoriteAnimal} who possessed the rare ability to speak human language. "I've been waiting for someone like you," the ${favoriteAnimal} said mysteriously, leading ${characterName} to a hidden grove where ${favoriteColor} flowers grew in perfect circles. The ${favoriteAnimal} explained that these flowers held the secret to understanding ${secondInterest}, but only someone pure of heart who truly appreciated simple pleasures like sharing ${favoriteFood} could unlock ${pronouns.possessive} power. As ${characterName} learned to communicate with the forest creatures and master the art of ${secondInterest}, ${pronouns.subject} discovered that the greatest magic of all was the friendship ${pronouns.subject}'d found.`,
      `When ${characterName} inherited ${pronouns.possessive} grandmother's old ${favoriteColor} journal, ${pronouns.subject} never expected it to change ${pronouns.possessive} life forever. The journal contained detailed notes about a legendary ${favoriteAnimal} that supposedly lived in the mountains beyond ${pronouns.possessive} town. Most people thought it was just a fairy tale, but ${characterName}'s passion for ${mainHobby} had taught ${pronouns.object} to look beyond the surface of things. Following cryptic clues that mentioned ${favoriteFood} as an offering and ${secondInterest} as a key, ${characterName} embarked on the adventure of a lifetime. The journey tested ${pronouns.possessive} courage, wisdom, and determination, but when ${pronouns.subject} finally met the ancient ${favoriteAnimal} in a cave filled with ${favoriteColor} crystals, ${pronouns.subject} realized that the real treasure wasn't gold or jewels—it was the confidence ${pronouns.subject}'d gained and the knowledge that even the most impossible dreams could come true.`,
      `${characterName} never thought ${pronouns.possessive} love of ${mainHobby} would lead to saving ${pronouns.possessive} entire town, but that's exactly what happened on the day the ${favoriteColor} comet appeared in the sky. The mysterious comet brought with it a magical ${favoriteAnimal} who landed right in ${characterName}'s backyard while ${pronouns.subject} was enjoying ${pronouns.possessive} favorite meal of ${favoriteFood}. The ${favoriteAnimal} spoke of an ancient prophecy involving someone who understood both ${mainHobby} and ${secondInterest}, and who possessed the rare combination of bravery and kindness. Together, ${characterName} and the ${favoriteAnimal} discovered that the comet was actually a warning—a great challenge was coming that would require all ${pronouns.possessive} skills, creativity, and the help of every person in town. Through perseverance, teamwork, and the power of believing in ${pronouns.object}self, ${pronouns.subject} not only saved ${pronouns.possessive} community but also forged friendships that would last a lifetime.`
    ];
    return hardStories[Math.floor(Math.random() * hardStories.length)];
  }

  private static createExpertStory(characterName: string, userElements: any, pronouns: { subject: string, object: string, possessive: string }): string {
    // 6th-12th Grade Style: Sharon Creech, Louis Sachar, Suzanne Collins, John Green
    // Sophisticated themes with complex character development and deeper meaning
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const mainHobby = hobbies[0] || 'writing';
    const secondInterest = interests[1] || 'philosophy';
    const thirdInterest = interests[2] || 'science';
    
    const expertStories = [
      `The morning ${characterName} turned sixteen, ${pronouns.subject} discovered that ${pronouns.possessive} lifelong obsession with ${mainHobby} wasn't just a hobby—it was preparation for something far greater than ${pronouns.subject} could have imagined. The mysterious ${favoriteAnimal} that had been appearing in ${pronouns.possessive} dreams for years finally materialized in ${pronouns.possessive} room, its ${favoriteColor} eyes holding depths of ancient wisdom. "Your journey begins now," the creature whispered, revealing that ${characterName} possessed a rare gift that connected ${pronouns.object} to both ${secondInterest} and ${thirdInterest} in ways that could reshape the balance between two parallel worlds. As ${characterName} learned to navigate between realities, ${pronouns.subject} discovered that even simple pleasures like sharing ${favoriteFood} with friends took on profound meaning when viewed through the lens of infinite possibility. The choices ${pronouns.subject} made would not only determine ${pronouns.possessive} own fate but also the future of countless others who depended on someone brave enough to bridge the gap between what is and what could be.`,
      `${characterName} had always felt different, but it wasn't until ${pronouns.subject} met the enigmatic ${favoriteAnimal} in the abandoned ${favoriteColor} lighthouse that ${pronouns.subject} understood why. The creature, ancient beyond measure, revealed that ${characterName}'s passion for ${mainHobby} and deep understanding of ${secondInterest} marked ${pronouns.object} as one of the rare individuals capable of seeing beyond the veil of ordinary reality. Through a series of increasingly challenging trials that tested not only ${pronouns.possessive} intellectual grasp of ${thirdInterest} but also ${pronouns.possessive} emotional resilience and moral compass, ${characterName} learned that true power lay not in what ${pronouns.subject} could take from the world, but in what ${pronouns.subject} could give back to it. Even ${pronouns.possessive} simple ritual of eating ${favoriteFood} while contemplating life's mysteries became a sacred practice that connected ${pronouns.object} to the universal truths the ${favoriteAnimal} had spent centuries protecting. In the end, ${characterName} realized that growing up meant accepting responsibility not just for ${pronouns.possessive} own choices, but for the ripple effects those choices would have on everyone around ${pronouns.object}.`,
      `The letter arrived on ${characterName}'s seventeenth birthday, written in ${favoriteColor} ink that seemed to shimmer with its own inner light. It spoke of a destiny connected to ${pronouns.possessive} love of ${mainHobby}, ${pronouns.possessive} intellectual curiosity about ${secondInterest}, and ${pronouns.possessive} scientific interest in ${thirdInterest}. The sender was revealed to be a ${favoriteAnimal} of extraordinary intelligence who had been watching ${characterName} for years, waiting for the right moment to reveal a truth that would change everything ${pronouns.subject} thought ${pronouns.subject} knew about ${pronouns.object}self and the world. As ${characterName} embarked on a journey that would take ${pronouns.object} from the familiar comfort of sharing ${favoriteFood} with family to the edge of known reality itself, ${pronouns.subject} learned that the most important battles aren't fought with weapons or armies, but with ideas, compassion, and the courage to stand up for what's right even when the cost seems unbearable. The ${favoriteAnimal} taught ${pronouns.object} that true wisdom comes not from having all the answers, but from asking the right questions and being brave enough to follow where those questions lead.`
    ];
    return expertStories[Math.floor(Math.random() * expertStories.length)];
  }

  private static splitIntoPages(
    content: string, 
    maxWordsPerPage: number, 
    targetPageCount: number, 
    characterName: string, 
    userElements: any, 
    difficulty: DifficultyLevel,
    pronouns: { subject: string, object: string, possessive: string }
  ): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      // Clean sentence of any malformed characters
      const cleanSentence = sentence.trim()
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/\{[^}]*\}/g, '') // Remove unmatched template variables
        .replace(/\s+/g, ' ') // Clean up extra whitespace
        .trim();
      
      if (!cleanSentence) continue; // Skip empty sentences
      
      const sentenceWords = cleanSentence.split(/\s+/).length;
      
      if (currentWordCount + sentenceWords > maxWordsPerPage && currentPage.length > 0) {
        const finalPage = currentPage.trim() + '.';
        // Final check for malformed characters
        const cleanPage = finalPage
          .replace(/\[/g, '')
          .replace(/\]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanPage.includes(']') || cleanPage.includes('[')) {
          console.warn('Malformed page detected:', cleanPage);
        }
        
        pages.push(cleanPage);
        currentPage = cleanSentence;
        currentWordCount = sentenceWords;
      } else {
        currentPage += (currentPage.length > 0 ? '. ' : '') + cleanSentence;
        currentWordCount += sentenceWords;
      }
    }
    
    if (currentPage.trim().length > 0) {
      const finalPage = currentPage.trim() + '.';
      // Final check for malformed characters
      const cleanPage = finalPage
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanPage.includes(']') || cleanPage.includes('[')) {
        console.warn('Malformed final page detected:', cleanPage);
      }
      
      pages.push(cleanPage);
    }

    // Ensure we have the target number of pages with organic user element integration
    while (pages.length < targetPageCount) {
      const continuationPage = this.generateContinuationPage(characterName, userElements, difficulty, pages.length, pronouns);
      pages.push(continuationPage);
    }

    return pages.slice(0, targetPageCount);
  }

  private static generateContinuationPage(
    characterName: string, 
    userElements: any, 
    difficulty: DifficultyLevel,
    pageNumber: number,
    pronouns: { subject: string, object: string, possessive: string }
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies } = userElements;
    const mainHobby = hobbies[0] || 'playing';
    
    const continuations = {
      easy: [
        `${characterName} plays.`,
        `${favoriteAnimal} runs.`,
        `${characterName} eats ${favoriteFood}.`,
        `${characterName} smiles.`,
        `Fun ${favoriteColor} day.`,
        `Friends play together.`
      ],
      medium: [
        `${characterName} found ${GrammarValidator.createNounPhrase(favoriteColor, 'treasure')} with ${pronouns.possessive} ${favoriteAnimal} friend today.`,
        `${pronouns.subject} went on an adventure to find more ${favoriteFood} for everyone.`,
        `The ${favoriteAnimal} taught ${characterName} something new about ${mainHobby} skills.`,
        `Together ${pronouns.subject} helped other animals solve a tricky ${favoriteColor} puzzle.`,
        `${characterName} and the ${favoriteAnimal} discovered a secret place to play.`,
        `${pronouns.possessive} friendship grew stronger through teamwork and sharing ${favoriteFood} together.`
      ],
      hard: [
        `${characterName} realized ${pronouns.possessive} adventure was teaching important lessons about friendship and ${mainHobby}.`,
        `The wise ${favoriteAnimal} shared ancient secrets while ${pronouns.subject} enjoyed ${favoriteFood} together.`,
        `Together ${pronouns.subject} encountered mysterious creatures who appreciated ${pronouns.possessive} knowledge of ${mainHobby}.`,
        `${characterName} discovered special abilities that appeared when combining ${favoriteColor} magic with ${pronouns.possessive} companion.`,
        `${pronouns.possessive} bond created powerful magic that transformed everything ${favoriteColor} around ${pronouns.object}.`
      ],
      expert: [
        `${characterName} contemplated the profound connection ${pronouns.subject} shared with the ${favoriteAnimal}, understanding that ${pronouns.possessive} relationship transcended ordinary friendship and had become something extraordinary, much like ${pronouns.possessive} appreciation for both ${favoriteColor} beauty and ${favoriteFood}.`,
        `The ancient ${favoriteAnimal} revealed that ${characterName} possessed a rare gift - the ability to bridge two worlds through ${pronouns.possessive} understanding of ${mainHobby} and bring harmony between seemingly opposing forces.`,
        `Through trials that tested both ${pronouns.possessive} intellect and emotional resilience, ${characterName} and the ${favoriteAnimal} discovered that ${pronouns.possessive} greatest strength lay not in ${pronouns.possessive} individual abilities, but in ${pronouns.possessive} unwavering trust in each other and ${pronouns.possessive} shared values.`,
        `${characterName} realized that ${pronouns.possessive} journey with the ${favoriteAnimal} was part of a larger destiny, one that would require ${pronouns.object} to make difficult choices about ${mainHobby} and ${favoriteColor} that would affect not just ${pronouns.object}self, but ${pronouns.possessive} entire community.`
      ]
    };
    
    const options = continuations[difficulty];
    const selectedContinuation = options[pageNumber % options.length];
    
    // Clean the continuation text of any malformed characters
    const cleanContinuation = selectedContinuation
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\{[^}]*\}/g, '') // Remove unmatched template variables
      .replace(/\s+/g, ' ')
      .trim();
    
    // Log warning if malformed characters detected
    if (cleanContinuation.includes(']') || cleanContinuation.includes('[')) {
      console.warn('Malformed continuation detected:', cleanContinuation);
    }
    
    return cleanContinuation;
  }

  // Verification method to ensure word limits are being enforced
  private static verifyWordLimits(pages: string[], maxWordsPerPage: number, difficulty: DifficultyLevel): void {
    const expectedLimits = {
      easy: 6,
      medium: 12, 
      hard: 20,
      expert: 40
    };
    
    const expectedLimit = expectedLimits[difficulty];
    if (maxWordsPerPage !== expectedLimit) {
      console.warn(`Word limit mismatch for ${difficulty}: expected ${expectedLimit}, got ${maxWordsPerPage}`);
    }
    
    pages.forEach((page, index) => {
      const wordCount = page.split(/\s+/).filter(word => word.trim().length > 0).length;
      if (wordCount > maxWordsPerPage) {
        console.warn(`❌ Page ${index + 1} exceeds word limit: ${wordCount} words (max: ${maxWordsPerPage}) - "${page.substring(0, 50)}..."`);
      } else {
        console.log(`✅ Page ${index + 1}: ${wordCount}/${maxWordsPerPage} words (${difficulty} level)`);
      }
    });
  }

  /**
   * Validate vocabulary for early readers
   */
  private static validateEarlyReaderVocabulary(pages: string[], difficulty: DifficultyLevel): void {
    for (let i = 0; i < pages.length; i++) {
      const words = pages[i].split(/\s+/).filter(word => word.trim().length > 0);
      const validation = VocabularyLevelClassifier.validateVocabularyDistribution(words, difficulty);
      
      if (!validation.isValid) {
        console.warn(`Early Reader Page ${i + 1} vocabulary issues:`, validation.issues);
        // Log distribution for analysis
        console.log(`Page ${i + 1} vocabulary distribution:`, validation.distribution);
      }
    }
  }

  static getReadingConfigForDifficulty(difficulty: DifficultyLevel): ReadingConfig {
    return this.getReadingConfig(difficulty);
  }
}