// Enhanced story generator with word limits for early readers
import type { UserInfo, DifficultyLevel } from "@/types";

interface ReadingConfig {
  maxWordsPerPage: number;
  fontSize: string;
  lineHeight: string;
  spacing: string;
}

export class EarlyReaderStoryGenerator {
  
  // Configure reading experience by difficulty level (optimized for UI aesthetics)
  // Word counts and text sizes balanced for container space (max-h-[400px])
  // HARD RULE: Easy level capped at 6 words maximum per page for early readers
  // Text sizes: BIGGEST for easiest levels, SMALLER as difficulty increases
  private static getReadingConfig(difficulty: DifficultyLevel): ReadingConfig {
    switch (difficulty) {
      case 'easy': // Emergent readers (ages 4-6): Maximum 6 words per page with biggest text
        return {
          maxWordsPerPage: 6, // PEDAGOGICAL STANDARD: 6 words max for emergent readers
          fontSize: 'text-4xl md:text-5xl lg:text-6xl', // Largest text for beginning readers
          lineHeight: 'leading-loose', // Extra spacing for readability
          spacing: 'space-y-8' // Generous spacing for easy visual tracking
        };
      case 'medium': // Early readers (ages 5-7): 10-12 words per page for developing skills
        return {
          maxWordsPerPage: 12, // PEDAGOGICAL STANDARD: 10-12 words for early readers
          fontSize: 'text-3xl md:text-4xl lg:text-5xl', // Large text for growing confidence
          lineHeight: 'leading-relaxed',
          spacing: 'space-y-6'
        };
      case 'hard': // Developing readers (ages 6-8): 20-22 words per page for fluency building
        return {
          maxWordsPerPage: 20, // PEDAGOGICAL STANDARD: 20-22 words for developing readers
          fontSize: 'text-2xl md:text-3xl lg:text-4xl', // Medium-large text for sustained reading
          lineHeight: 'leading-normal',
          spacing: 'space-y-4'
        };
      case 'expert': // Fluent readers (ages 7-9): 35-40 words per page for advanced comprehension
        return {
          maxWordsPerPage: 40, // PEDAGOGICAL STANDARD: 35-40 words for fluent readers
          fontSize: 'text-xl md:text-2xl lg:text-3xl', // Appropriate text size for longer passages
          lineHeight: 'leading-normal',
          spacing: 'space-y-3'
        };
    }
  }

  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): {
    pages: string[];
    config: ReadingConfig;
  } {
    const config = this.getReadingConfig(difficulty);
    const characterName = userInfo.name?.trim() || 'Alex';
    
    // Collect and organize user inputs for organic integration
    const userElements = this.extractUserElements(userInfo);
    
    // Generate story content with organic user element integration 
    // CRITICAL: Stories are ALWAYS generated in English regardless of user's native language
    const storyContent = this.createStoryContent(characterName, userElements, difficulty);
    
    // Split into pages respecting word limits with continuing user elements
    const pages = this.splitIntoPages(storyContent, config.maxWordsPerPage, pageCount, characterName, userElements, difficulty);
    
    // Verify word limits are being enforced
    this.verifyWordLimits(pages, config.maxWordsPerPage, difficulty);
    
    return { pages, config };
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
    difficulty: DifficultyLevel
  ): string {
    switch (difficulty) {
      case 'easy':
        return this.createEasyStory(characterName, userElements);
      case 'medium':
        return this.createMediumStory(characterName, userElements);
      case 'hard':
        return this.createHardStory(characterName, userElements);
      case 'expert':
        return this.createExpertStory(characterName, userElements);
    }
  }

  private static createEasyStory(characterName: string, userElements: any): string {
    // PreK-1st Grade Style: Julia Donaldson, Mo Willems, Dr. Seuss, Kevin Henkes
    // Simple, rhythmic, repetitive patterns with very basic vocabulary
    const { favoriteColor, favoriteAnimal, favoriteFood } = userElements;
    
    const simpleStories = [
      `${characterName} saw a ${favoriteColor} ${favoriteAnimal}. Big ${favoriteAnimal}! Happy ${favoriteAnimal}! The ${favoriteAnimal} saw ${characterName}. Happy ${characterName}! They played with ${favoriteColor} toys. Fun, fun, fun! Time for ${favoriteFood}. Yum! Wave goodbye! The end.`,
      `Look, ${characterName}! See the ${favoriteAnimal}? The ${favoriteAnimal} is ${favoriteColor}. The ${favoriteAnimal} is soft. ${characterName} likes ${favoriteAnimal}. ${favoriteAnimal} likes ${favoriteFood} too. They share and eat. Good friends! Happy day! Hooray!`,
      `Go, ${characterName}, go! Run to the ${favoriteColor} house. The ${favoriteAnimal} runs too. Fast, fast, fast! Stop for ${favoriteFood}. Yum, yum! Time to play with ${favoriteColor} ball. Play and laugh. What a day! Home we go.`
    ];
    return simpleStories[Math.floor(Math.random() * simpleStories.length)];
  }

  private static createMediumStory(characterName: string, userElements: any): string {
    // 2nd-3rd Grade Style: Jeff Kinney, Roald Dahl, Dav Pilkey, Andrea Beaty
    // Engaging plots with humor, simple dialogue, and kid-friendly adventures
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies } = userElements;
    const mainHobby = hobbies[0] || 'playing';
    
    const mediumStories = [
      `${characterName} was having the most ordinary Tuesday ever when something extraordinary happened. A talking ${favoriteAnimal} with beautiful ${favoriteColor} fur knocked on the front door! "I need your help," said the ${favoriteAnimal} politely. "I've lost my favorite ${favoriteFood} recipe!" It turns out there was a mystery in the park that only a brave kid who loved ${mainHobby} like ${characterName} could solve. Together, they followed mysterious ${favoriteColor} paw prints that led to a hidden treasure chest filled with magical recipes. What an adventure! ${characterName} and the ${favoriteAnimal} decided to meet every Tuesday for more fun.`,
      `"This is going to be AWESOME!" shouted ${characterName} as they grabbed their ${favoriteColor} backpack and raced to the playground for some ${mainHobby}. But when they arrived, they discovered a very sad ${favoriteAnimal} sitting all alone on a bench, looking at an empty ${favoriteFood} container. The ${favoriteAnimal} had lost its lunch and couldn't find any ${favoriteFood} anywhere! ${characterName} had a brilliant idea - they would organize the greatest ${favoriteColor}-themed treasure hunt the neighborhood had ever seen! By the end of the day, not only did they find plenty of ${favoriteFood} to share, but they also made twenty new friends who loved ${mainHobby} too.`,
      `${characterName} loved ${mainHobby} and inventing things in their ${favoriteColor} garage workshop. Today's project was a Super-Duper Pet Communicator 3000! When they tested it on a friendly ${favoriteAnimal} from next door while sharing some ${favoriteFood}, something magical happened - they could actually understand each other! The ${favoriteAnimal} told jokes about ${favoriteColor} things, shared secrets, and even helped ${characterName} with homework between bites of ${favoriteFood}. From that day forward, ${characterName} knew that the best inventions always bring friends together, especially when you share your favorite things.`
    ];
    return mediumStories[Math.floor(Math.random() * mediumStories.length)];
  }

  private static createHardStory(characterName: string, userElements: any): string {
    // 4th-5th Grade Style: Katherine Applegate, C.S. Lewis, J.K. Rowling
    // More complex plots with character development and meaningful themes
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const mainHobby = hobbies[0] || 'exploring';
    const secondInterest = interests[1] || 'magic';
    
    const hardStories = [
      `${characterName} had always been fascinated by ${mainHobby}, but nothing could have prepared them for what they discovered that ${favoriteColor}-skied morning. Deep in the ancient forest behind their house, they encountered a magnificent ${favoriteAnimal} who possessed the rare ability to speak human language. "I've been waiting for someone like you," the ${favoriteAnimal} said mysteriously, leading ${characterName} to a hidden grove where ${favoriteColor} flowers grew in perfect circles. The ${favoriteAnimal} explained that these flowers held the secret to understanding ${secondInterest}, but only someone pure of heart who truly appreciated simple pleasures like sharing ${favoriteFood} could unlock their power. As ${characterName} learned to communicate with the forest creatures and master the art of ${secondInterest}, they discovered that the greatest magic of all was the friendship they'd found.`,
      `When ${characterName} inherited their grandmother's old ${favoriteColor} journal, they never expected it to change their life forever. The journal contained detailed notes about a legendary ${favoriteAnimal} that supposedly lived in the mountains beyond their town. Most people thought it was just a fairy tale, but ${characterName}'s passion for ${mainHobby} had taught them to look beyond the surface of things. Following cryptic clues that mentioned ${favoriteFood} as an offering and ${secondInterest} as a key, ${characterName} embarked on the adventure of a lifetime. The journey tested their courage, wisdom, and determination, but when they finally met the ancient ${favoriteAnimal} in a cave filled with ${favoriteColor} crystals, they realized that the real treasure wasn't gold or jewels—it was the confidence they'd gained and the knowledge that even the most impossible dreams could come true.`,
      `${characterName} never thought their love of ${mainHobby} would lead to saving their entire town, but that's exactly what happened on the day the ${favoriteColor} comet appeared in the sky. The mysterious comet brought with it a magical ${favoriteAnimal} who landed right in ${characterName}'s backyard while they were enjoying their favorite meal of ${favoriteFood}. The ${favoriteAnimal} spoke of an ancient prophecy involving someone who understood both ${mainHobby} and ${secondInterest}, and who possessed the rare combination of bravery and kindness. Together, ${characterName} and the ${favoriteAnimal} discovered that the comet was actually a warning—a great challenge was coming that would require all their skills, creativity, and the help of every person in town. Through perseverance, teamwork, and the power of believing in themselves, they not only saved their community but also forged friendships that would last a lifetime.`
    ];
    return hardStories[Math.floor(Math.random() * hardStories.length)];
  }

  private static createExpertStory(characterName: string, userElements: any): string {
    // 6th-12th Grade Style: Sharon Creech, Louis Sachar, Suzanne Collins, John Green
    // Sophisticated themes with complex character development and deeper meaning
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies, interests } = userElements;
    const mainHobby = hobbies[0] || 'writing';
    const secondInterest = interests[1] || 'philosophy';
    const thirdInterest = interests[2] || 'science';
    
    const expertStories = [
      `The morning ${characterName} turned sixteen, they discovered that their lifelong obsession with ${mainHobby} wasn't just a hobby—it was preparation for something far greater than they could have imagined. The mysterious ${favoriteAnimal} that had been appearing in their dreams for years finally materialized in their room, its ${favoriteColor} eyes holding depths of ancient wisdom. "Your journey begins now," the creature whispered, revealing that ${characterName} possessed a rare gift that connected them to both ${secondInterest} and ${thirdInterest} in ways that could reshape the balance between two parallel worlds. As ${characterName} learned to navigate between realities, they discovered that even simple pleasures like sharing ${favoriteFood} with friends took on profound meaning when viewed through the lens of infinite possibility. The choices they made would not only determine their own fate but also the future of countless others who depended on someone brave enough to bridge the gap between what is and what could be.`,
      `${characterName} had always felt different, but it wasn't until they met the enigmatic ${favoriteAnimal} in the abandoned ${favoriteColor} lighthouse that they understood why. The creature, ancient beyond measure, revealed that ${characterName}'s passion for ${mainHobby} and deep understanding of ${secondInterest} marked them as one of the rare individuals capable of seeing beyond the veil of ordinary reality. Through a series of increasingly challenging trials that tested not only their intellectual grasp of ${thirdInterest} but also their emotional resilience and moral compass, ${characterName} learned that true power lay not in what they could take from the world, but in what they could give back to it. Even their simple ritual of eating ${favoriteFood} while contemplating life's mysteries became a sacred practice that connected them to the universal truths the ${favoriteAnimal} had spent centuries protecting. In the end, ${characterName} realized that growing up meant accepting responsibility not just for their own choices, but for the ripple effects those choices would have on everyone around them.`,
      `The letter arrived on ${characterName}'s seventeenth birthday, written in ${favoriteColor} ink that seemed to shimmer with its own inner light. It spoke of a destiny connected to their love of ${mainHobby}, their intellectual curiosity about ${secondInterest}, and their scientific interest in ${thirdInterest}. The sender was revealed to be a ${favoriteAnimal} of extraordinary intelligence who had been watching ${characterName} for years, waiting for the right moment to reveal a truth that would change everything they thought they knew about themselves and the world. As ${characterName} embarked on a journey that would take them from the familiar comfort of sharing ${favoriteFood} with family to the edge of known reality itself, they learned that the most important battles aren't fought with weapons or armies, but with ideas, compassion, and the courage to stand up for what's right even when the cost seems unbearable. The ${favoriteAnimal} taught them that true wisdom comes not from having all the answers, but from asking the right questions and being brave enough to follow where those questions lead.`
    ];
    return expertStories[Math.floor(Math.random() * expertStories.length)];
  }

  private static splitIntoPages(
    content: string, 
    maxWordsPerPage: number, 
    targetPageCount: number, 
    characterName: string, 
    userElements: any, 
    difficulty: DifficultyLevel
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
      const continuationPage = this.generateContinuationPage(characterName, userElements, difficulty, pages.length);
      pages.push(continuationPage);
    }

    return pages.slice(0, targetPageCount);
  }

  private static generateContinuationPage(
    characterName: string, 
    userElements: any, 
    difficulty: DifficultyLevel,
    pageNumber: number
  ): string {
    const { favoriteColor, favoriteAnimal, favoriteFood, hobbies } = userElements;
    const mainHobby = hobbies[0] || 'playing';
    
    const continuations = {
      easy: [
        `${characterName} plays.`,
        `${favoriteAnimal} runs.`,
        `They eat ${favoriteFood}.`,
        `${characterName} smiles.`,
        `Fun ${favoriteColor} day.`,
        `Friends play together.`
      ],
      medium: [
        `${characterName} discovered something amazing about ${favoriteColor} magic with their ${favoriteAnimal} friend.`,
        `They explored a new part of their world while enjoying ${favoriteFood} together.`,
        `The ${favoriteAnimal} showed ${characterName} a hidden ${favoriteColor} treasure.`,
        `Together they used their love of ${mainHobby} to solve a fun puzzle.`,
        `${characterName} and the ${favoriteAnimal} helped other animals find ${favoriteFood}.`,
        `Their friendship grew stronger through their shared adventures and ${favoriteColor} discoveries.`
      ],
      hard: [
        `${characterName} realized that their adventure with the ${favoriteAnimal} was teaching them important lessons about ${mainHobby} and friendship.`,
        `The wise ${favoriteAnimal} shared ancient secrets about the ${favoriteColor} forest while they enjoyed ${favoriteFood} together.`,
        `Together, ${characterName} and the ${favoriteAnimal} encountered mysterious creatures who appreciated their knowledge of ${mainHobby}.`,
        `${characterName} discovered they had special abilities that only appeared when combining their love of ${favoriteColor} things with their ${favoriteAnimal} companion.`,
        `The bond between ${characterName} and the ${favoriteAnimal} created a powerful magic that transformed everything ${favoriteColor} in their world.`
      ],
      expert: [
        `${characterName} contemplated the profound connection they shared with the ${favoriteAnimal}, understanding that their relationship transcended ordinary friendship and had become something extraordinary, much like their appreciation for both ${favoriteColor} beauty and ${favoriteFood}.`,
        `The ancient ${favoriteAnimal} revealed that ${characterName} possessed a rare gift - the ability to bridge two worlds through their understanding of ${mainHobby} and bring harmony between seemingly opposing forces.`,
        `Through trials that tested both their intellect and emotional resilience, ${characterName} and the ${favoriteAnimal} discovered that their greatest strength lay not in their individual abilities, but in their unwavering trust in each other and their shared values.`,
        `${characterName} realized that their journey with the ${favoriteAnimal} was part of a larger destiny, one that would require them to make difficult choices about ${mainHobby} and ${favoriteColor} that would affect not just themselves, but their entire community.`
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
        console.warn(`Page ${index + 1} exceeds word limit: ${wordCount} words (max: ${maxWordsPerPage}) - "${page.substring(0, 50)}..."`);
      } else {
        console.log(`✓ Page ${index + 1}: ${wordCount}/${maxWordsPerPage} words (${difficulty} level)`);
      }
    });
  }

  static getReadingConfigForDifficulty(difficulty: DifficultyLevel): ReadingConfig {
    return this.getReadingConfig(difficulty);
  }
}