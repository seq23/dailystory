// Enhanced story generator with word limits for early readers
import type { UserInfo, DifficultyLevel } from "@/types";

interface ReadingConfig {
  maxWordsPerPage: number;
  fontSize: string;
  lineHeight: string;
  spacing: string;
}

export class EarlyReaderStoryGenerator {
  
  // Configure reading experience by difficulty level (2 minutes reading per page)
  // Average reading speeds: PreK-1st: 20-50 WPM, 2nd-3rd: 80-120 WPM, 4th-5th: 140-160 WPM, 6th-12th: 200-300 WPM
  private static getReadingConfig(difficulty: DifficultyLevel): ReadingConfig {
    switch (difficulty) {
      case 'easy': // PreK-1st grade (Julia Donaldson, Mo Willems, Dr. Seuss, Kevin Henkes style)
        return {
          maxWordsPerPage: 6, // Very simple for early readers
          fontSize: 'text-5xl md:text-6xl lg:text-7xl', // Bigger text for early readers
          lineHeight: 'leading-relaxed',
          spacing: 'space-y-6'
        };
      case 'medium': // 2nd-3rd grade (Jeff Kinney, Roald Dahl, Dav Pilkey, Andrea Beaty style)
        return {
          maxWordsPerPage: 200, // ~2 min at 100 WPM average
          fontSize: 'text-2xl md:text-3xl lg:text-4xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-4'
        };
      case 'hard': // 4th-5th grade (Katherine Applegate, C.S. Lewis, J.K. Rowling style)
        return {
          maxWordsPerPage: 300, // ~2 min at 150 WPM average
          fontSize: 'text-xl md:text-2xl lg:text-3xl',
          lineHeight: 'leading-normal',
          spacing: 'space-y-3'
        };
      case 'expert': // 6th-12th grade (Sharon Creech, Louis Sachar, Suzanne Collins, John Green style)
        return {
          maxWordsPerPage: 500, // ~2 min at 250 WPM average
          fontSize: 'text-lg md:text-xl lg:text-2xl',
          lineHeight: 'leading-snug',
          spacing: 'space-y-2'
        };
    }
  }

  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): {
    pages: string[];
    config: ReadingConfig;
  } {
    const config = this.getReadingConfig(difficulty);
    const characterName = userInfo.name?.trim() || 'Alex';
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat';
    
    // Generate story content based on difficulty
    const storyContent = this.createStoryContent(characterName, favoriteAnimal, difficulty);
    
    // Split into pages respecting word limits
    const pages = this.splitIntoPages(storyContent, config.maxWordsPerPage, pageCount, characterName, favoriteAnimal, difficulty);
    
    return { pages, config };
  }

  private static createStoryContent(
    characterName: string,
    favoriteAnimal: string,
    difficulty: DifficultyLevel
  ): string {
    switch (difficulty) {
      case 'easy':
        return this.createEasyStory(characterName, favoriteAnimal);
      case 'medium':
        return this.createMediumStory(characterName, favoriteAnimal);
      case 'hard':
        return this.createHardStory(characterName, favoriteAnimal);
      case 'expert':
        return this.createExpertStory(characterName, favoriteAnimal);
    }
  }

  private static createEasyStory(characterName: string, favoriteAnimal: string): string {
    // PreK-1st Grade Style: Julia Donaldson, Mo Willems, Dr. Seuss, Kevin Henkes
    // Simple, rhythmic, repetitive patterns with very basic vocabulary
    const simpleStories = [
      `${characterName} saw a ${favoriteAnimal}. Big ${favoriteAnimal}! Happy ${favoriteAnimal}! The ${favoriteAnimal} saw ${characterName}. Happy ${characterName}! They played together. Fun, fun, fun! Time to go. Wave goodbye! The end.`,
      `Look, ${characterName}! See the ${favoriteAnimal}? The ${favoriteAnimal} is big. The ${favoriteAnimal} is soft. ${characterName} likes ${favoriteAnimal}. ${favoriteAnimal} likes ${characterName}. They are friends. Good friends! Happy day! Hooray!`,
      `Go, ${characterName}, go! Run to the ${favoriteAnimal}. The ${favoriteAnimal} runs too. Fast, fast, fast! Stop, ${characterName}, stop! Time to play. Play and laugh. What a day! Home we go.`
    ];
    return simpleStories[Math.floor(Math.random() * simpleStories.length)];
  }

  private static createMediumStory(characterName: string, favoriteAnimal: string): string {
    // 2nd-3rd Grade Style: Jeff Kinney, Roald Dahl, Dav Pilkey, Andrea Beaty
    // Engaging plots with humor, simple dialogue, and kid-friendly adventures
    const mediumStories = [
      `${characterName} was having the most ordinary Tuesday ever when something extraordinary happened. A talking ${favoriteAnimal} knocked on the front door! "I need your help," said the ${favoriteAnimal} politely. It turns out there was a mystery in the park that only a brave kid like ${characterName} could solve. Together, they followed mysterious paw prints that led to a hidden treasure. What an adventure! ${characterName} and the ${favoriteAnimal} decided to meet every Tuesday for more fun.`,
      `"This is going to be AWESOME!" shouted ${characterName} as they raced to the playground. But when they arrived, they discovered a very sad ${favoriteAnimal} sitting all alone on a bench. The ${favoriteAnimal} had lost its favorite toy and couldn't find it anywhere. ${characterName} had a brilliant idea - they would organize the greatest treasure hunt the neighborhood had ever seen! By the end of the day, not only did they find the toy, but they also made twenty new friends.`,
      `${characterName} loved inventing things in the garage workshop. Today's project was a Super-Duper Pet Communicator 3000! When they tested it on a friendly ${favoriteAnimal} from next door, something magical happened - they could actually understand each other! The ${favoriteAnimal} told jokes, shared secrets, and even helped ${characterName} with math homework. From that day forward, ${characterName} knew that the best inventions always bring friends together.`
    ];
    return mediumStories[Math.floor(Math.random() * mediumStories.length)];
  }

  private static createHardStory(characterName: string, favoriteAnimal: string): string {
    // 4th-5th Grade Style: Katherine Applegate, C.S. Lewis, J.K. Rowling
    // Rich storytelling with deeper themes, character development, and magical elements
    const hardStories = [
      `${characterName} had always believed that magic was just something that happened in stories, until the day they discovered a wounded ${favoriteAnimal} in the ancient forest behind their grandmother's house. This wasn't an ordinary ${favoriteAnimal} - its eyes held wisdom that seemed older than time itself, and when it spoke, its voice carried the music of wind through leaves. "I am the Guardian of the Whispering Woods," it explained, "and I need your help to save our realm from the Shadow that grows stronger each day." Through courage, kindness, and an unbreakable bond of friendship, ${characterName} embarked on a quest that would test not only their bravery but also their faith in the power of hope. Together, they discovered that the greatest magic of all lies within the heart of those who choose to help others, no matter how impossible the task may seem.`,
      `The letter arrived on a perfectly ordinary Wednesday, addressed to ${characterName} in shimmering silver ink that seemed to dance across the parchment. Inside was an invitation to attend the Academy for Extraordinary Friendships, where students learned to communicate with magical creatures. ${characterName}'s assigned partner was a magnificent ${favoriteAnimal} named Stardust, who possessed the remarkable ability to show people their deepest dreams through rainbow-colored visions. As they trained together, ${characterName} learned that being extraordinary wasn't about having special powers - it was about having the courage to stand up for what's right, the wisdom to listen with your heart, and the strength to never give up on the people you care about.`,
      `When ${characterName} inherited their great-aunt's mysterious cottage, they never expected to find a talking ${favoriteAnimal} living in the library. This ${favoriteAnimal} was the keeper of a thousand stories, each one containing a lesson that could help someone in the world. But the stories were disappearing one by one, stolen by the Silence that sought to drain all joy and wonder from the world. ${characterName} and the ${favoriteAnimal} realized they must embark on a dangerous journey through the Realm of Lost Tales to recover the stolen stories and restore hope to children everywhere. Along the way, they learned that every person has their own story to tell, and that sharing our stories with others is what makes us truly human.`
    ];
    return hardStories[Math.floor(Math.random() * hardStories.length)];
  }

  private static createExpertStory(characterName: string, favoriteAnimal: string): string {
    // 6th-12th Grade Style: Sharon Creech, Louis Sachar, Suzanne Collins, John Green, Markus Zusak
    // Complex themes, sophisticated language, emotional depth, and social awareness
    const expertStories = [
      `${characterName} had grown up hearing whispers about the old ${favoriteAnimal} that lived at the edge of town - some said it was just a legend, others claimed it held the memories of everyone who had ever lived there. The truth, as ${characterName} discovered on the anniversary of their grandmother's passing, was far more extraordinary than anyone could have imagined. This ancient ${favoriteAnimal} was indeed real, and it carried within its heart the stories of countless generations, preserving the wisdom, love, and dreams of all who had come before. Through late-night conversations under starlit skies, the ${favoriteAnimal} taught ${characterName} that grief and joy are not opposites but companions, that remembering the past gives meaning to the present, and that every ending is also a beginning. Together, they began documenting these precious stories, ensuring that no one's life would ever be forgotten, and that the lessons learned by one generation could guide the next toward a more compassionate future.`,
      `The summer ${characterName} turned sixteen, the world seemed to be falling apart. Climate change was ravaging their coastal town, families were struggling financially, and hope felt like a luxury no one could afford. It was during this crisis that ${characterName} encountered an injured ${favoriteAnimal} that had been displaced by the rising seas. As they nursed the creature back to health, they realized that both of them were refugees in their own homeland. This shared experience of loss sparked an idea that would transform their entire community: what if they could create a sanctuary not just for displaced wildlife, but for displaced people too? Through months of organizing, fundraising, and building bridges between different communities, ${characterName} and their ${favoriteAnimal} companion proved that even in the darkest times, young people have the power to create change. Their sanctuary became a symbol of resilience, showing that when we care for each other and the natural world with equal compassion, we can build a future worth believing in.`,
      `In a world where empathy had become a rare and dangerous gift, ${characterName} tried desperately to hide their ability to feel others' emotions. Society had become cold and calculating, valuing efficiency over human connection, until the day ${characterName} met a remarkable ${favoriteAnimal} that shared the same extraordinary sensitivity. Together, they discovered an underground network of individuals who refused to abandon their humanity despite the risks. This ${favoriteAnimal} had been guiding lost souls toward this hidden community for years, using its intuitive understanding of the human heart to identify those who still carried hope within them. As ${characterName} learned to embrace their gift rather than fear it, they realized that empathy wasn't a weakness to be overcome but a strength that could heal a broken world. Through small acts of kindness and profound moments of understanding, they began a quiet revolution that would remind humanity what it truly means to be alive, to feel deeply, and to choose love over fear in even the most challenging circumstances.`
    ];
    return expertStories[Math.floor(Math.random() * expertStories.length)];
  }

  private static splitIntoPages(
    text: string, 
    maxWordsPerPage: number, 
    targetPageCount: number,
    characterName?: string,
    favoriteAnimal?: string,
    difficulty?: DifficultyLevel
  ): string[] {
    // Split by sentence boundaries while preserving punctuation
    const sentences = text.match(/[^.!?]*[.!?]+/g) || [text];
    const pages: string[] = [];
    let currentPage = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // If adding this sentence would exceed word limit, start new page
      if (currentWordCount > 0 && currentWordCount + words.length > maxWordsPerPage) {
        if (currentPage.trim()) {
          pages.push(currentPage.trim());
        }
        currentPage = sentence.trim();
        currentWordCount = words.length;
      } else {
        // Add sentence to current page
        if (currentPage) {
          currentPage += ' ' + sentence.trim();
        } else {
          currentPage = sentence.trim();
        }
        currentWordCount += words.length;
      }
    }

    // Add final page if there's content
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }

    // Ensure we maintain exactly targetPageCount pages regardless of difficulty
    if (pages.length > targetPageCount) {
      return pages.slice(0, targetPageCount);
    }
    
    // If we need more pages, duplicate and extend content proportionally
    while (pages.length < targetPageCount && pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      if (lastPage.includes('.') && lastPage.split('.').length > 2) {
        // Split the last page into two parts
        const sentences = lastPage.split('.').filter(s => s.trim().length > 0);
        if (sentences.length >= 2) {
          const mid = Math.ceil(sentences.length / 2);
          const firstHalf = sentences.slice(0, mid).join('.') + '.';
          const secondHalf = sentences.slice(mid).join('.') + '.';
          pages[pages.length - 1] = firstHalf;
          pages.push(secondHalf);
        } else {
          // Add a simple continuation page
          const defaultName = characterName || 'Alex';
          const defaultAnimal = favoriteAnimal || 'cat';
          pages.push(`${defaultName} continued their wonderful adventure with the ${defaultAnimal}.`);
        }
      } else {
        // Add continuation content based on difficulty level
        const defaultName = characterName || 'Alex';
        const defaultAnimal = favoriteAnimal || 'cat';
        const defaultDifficulty = difficulty || 'medium';
        const continuationPage = this.generateContinuationPage(defaultName, defaultAnimal, defaultDifficulty, pages.length);
        pages.push(continuationPage);
      }
    }

    // Always return exactly targetPageCount pages
    return pages.slice(0, targetPageCount);
  }

  private static generateContinuationPage(
    characterName: string, 
    favoriteAnimal: string, 
    difficulty: DifficultyLevel,
    pageNumber: number
  ): string {
    const continuations = {
      easy: [
        `${characterName} and ${favoriteAnimal} play.`,
        `They run and jump.`,
        `${characterName} is very happy.`,
        `The ${favoriteAnimal} smiles too.`,
        `They find new friends.`,
        `Everyone plays together nicely.`
      ],
      medium: [
        `${characterName} discovered something amazing with their ${favoriteAnimal} friend.`,
        `They explored a new part of their magical world together.`,
        `The ${favoriteAnimal} showed ${characterName} a hidden treasure.`,
        `Together they solved a fun puzzle and felt proud.`,
        `${characterName} and the ${favoriteAnimal} helped other animals.`,
        `Their friendship grew stronger with each adventure.`
      ],
      hard: [
        `${characterName} realized that their adventure with the ${favoriteAnimal} was teaching them important lessons about courage and friendship.`,
        `The wise ${favoriteAnimal} shared ancient secrets about the magical forest that had been hidden for generations.`,
        `Together, ${characterName} and the ${favoriteAnimal} encountered mysterious creatures who needed their help to solve a complex problem.`,
        `${characterName} discovered they had special abilities that only appeared when working together with their ${favoriteAnimal} companion.`,
        `The bond between ${characterName} and the ${favoriteAnimal} created a powerful magic that transformed their entire world.`
      ],
      expert: [
        `${characterName} contemplated the profound connection they shared with the ${favoriteAnimal}, understanding that their relationship transcended ordinary friendship and had become something truly extraordinary.`,
        `The ancient ${favoriteAnimal} revealed that ${characterName} possessed a rare gift - the ability to bridge two worlds and bring harmony between seemingly opposing forces.`,
        `Through trials that tested both their intellect and emotional resilience, ${characterName} and the ${favoriteAnimal} discovered that their greatest strength lay not in their individual abilities, but in their unwavering trust in each other.`,
        `${characterName} realized that their journey with the ${favoriteAnimal} was part of a larger destiny, one that would require them to make difficult choices that would affect not just themselves, but their entire community.`
      ]
    };
    
    const options = continuations[difficulty];
    return options[pageNumber % options.length];
  }

  static getReadingConfigForDifficulty(difficulty: DifficultyLevel): ReadingConfig {
    return this.getReadingConfig(difficulty);
  }
}