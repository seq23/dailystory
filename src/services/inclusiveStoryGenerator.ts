import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

// Author-inspired writing styles by difficulty level
const AUTHOR_STYLES = {
  easy: {
    authors: ["Mo Willems", "Eric Carle", "Dr. Seuss"],
    characteristics: "Simple, repetitive language with rhythm and rhyme. Large, clear text with lots of white space. Playful, fun tone with silly situations. Short sentences with basic vocabulary.",
    wordCount: "10-20 words per page",
    fontSize: "large",
    structure: "Simple cause-and-effect, repetitive patterns"
  },
  medium: {
    authors: ["Kevin Henkes", "Jan Brett"],
    characteristics: "Gentle storytelling with emotional depth. Rich descriptions but accessible language. Character-driven stories with clear beginning, middle, end. Moderate sentence complexity.",
    wordCount: "25-45 words per page",
    fontSize: "medium-large",
    structure: "Clear story arc with character development"
  },
  hard: {
    authors: ["Roald Dahl", "Beverly Cleary", "Judy Blume"],
    characteristics: "Engaging plots with humor and heart. More complex vocabulary and sentence structures. Character relationships and personal growth. Dialogue and varied pacing.",
    wordCount: "50-80 words per page",
    fontSize: "medium",
    structure: "Multiple plot threads, character development"
  },
  expert: {
    authors: ["Kate DiCamillo", "R.J. Palacio", "Angie Thomas"],
    characteristics: "Sophisticated themes and complex character relationships. Rich, descriptive language with literary devices. Nuanced emotional content. Advanced vocabulary and varied sentence structures.",
    wordCount: "70-100 words per page",
    fontSize: "standard",
    structure: "Complex narratives with multiple themes"
  }
};

export class InclusiveStoryGenerator {
  
  static generateCulturallyAdaptedStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    isExtension: boolean = false,
    pageCount: number = 10
  ): string[] {
    
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (isExtension) {
      return this.generateCulturalExtension(userInfo, difficulty, pageCount, isESLLearner);
    } else {
      return this.generateCulturalInitialStory(userInfo, difficulty, isESLLearner, pageCount);
    }
  }

  private static generateCulturalInitialStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    isESLLearner: boolean,
    pageCount: number = 10
  ): string[] {
    
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    const characterName = userInfo.name;
    
    // Determine words per page based on difficulty level
    const wordsPerPage = {
      easy: 15,      // Pre-K - 1st Grade: 10-20 words
      medium: 35,    // 2nd - 3rd Grade: 25-45 words  
      hard: 65,      // 4th - 5th Grade: 50-80 words
      expert: 85     // 6th Grade+: 70-100 words
    };
    
    const targetWords = wordsPerPage[difficulty] || 35;
    
    // Create a cohesive story that flows like a book
    const createCohesiveStory = () => {
      const storyPages: string[] = [];
      
      // Enhanced story elements that incorporate user preferences
      const getPersonalizedElements = () => {
        const animal = userInfo.favoriteAnimal 
          ? userInfo.favoriteAnimal.toLowerCase()
          : ["dragon", "owl", "rabbit", "deer", "fox"][Math.floor(Math.random() * 5)];
        
        const setting = culturalElements.setting || "magical forest";
        
        const object = userInfo.favoriteColor 
          ? `glowing ${userInfo.favoriteColor.toLowerCase()} crystal`
          : "glowing crystal";
        
        const value = culturalElements.value || "kindness";
        
        const food = userInfo.favoriteFood 
          ? userInfo.favoriteFood.toLowerCase()
          : "magical berries";
        
        const activity = userInfo.hobbies 
          ? userInfo.hobbies.toLowerCase()
          : "exploring";
        
        return { animal, setting, object, value, food, activity };
      };
      
      const { animal, setting, object, value, food, activity } = getPersonalizedElements();
      
      // Create story structure based on difficulty
      const createStoryStructure = () => {
        if (difficulty === "easy") {
          // Simple 3-act structure: Meet character → Adventure → Resolution
          return {
            introduction: Math.ceil(pageCount * 0.3), // 30% introduction
            adventure: Math.ceil(pageCount * 0.5),     // 50% adventure
            resolution: Math.floor(pageCount * 0.2)    // 20% resolution
          };
        } else if (difficulty === "medium") {
          // Classic story arc: Setup → Inciting incident → Rising action → Climax → Resolution
          return {
            introduction: Math.ceil(pageCount * 0.2),
            adventure: Math.ceil(pageCount * 0.6),
            resolution: Math.floor(pageCount * 0.2)
          };
        } else {
          // Complex structure with character development and subplots
          return {
            introduction: Math.ceil(pageCount * 0.25),
            adventure: Math.ceil(pageCount * 0.55),
            resolution: Math.floor(pageCount * 0.2)
          };
        }
      };
      
      const structure = createStoryStructure();
      let currentSection = 'introduction';
      let sectionPageCount = 0;
      let storyProgress = {
        metCharacter: false,
        foundObject: false,
        facedChallenge: false,
        learnedLesson: false,
        journeyComplete: false
      };
      
      for (let i = 0; i < pageCount; i++) {
        // Determine current story section
        if (currentSection === 'introduction' && sectionPageCount >= structure.introduction) {
          currentSection = 'adventure';
          sectionPageCount = 0;
        } else if (currentSection === 'adventure' && sectionPageCount >= structure.adventure) {
          currentSection = 'resolution';
          sectionPageCount = 0;
        }
        
        let page = "";
        
        if (difficulty === "easy") {
          page = this.generateEasyPage(i, currentSection, characterName, animal, setting, object, value, food, activity, storyProgress, targetWords);
        } else if (difficulty === "medium") {
          page = this.generateMediumPage(i, currentSection, characterName, animal, setting, object, value, food, activity, storyProgress, targetWords);
        } else if (difficulty === "hard") {
          page = this.generateHardPage(i, currentSection, characterName, animal, setting, object, value, food, activity, storyProgress, targetWords);
        } else {
          page = this.generateExpertPage(i, currentSection, characterName, animal, setting, object, value, food, activity, storyProgress, targetWords);
        }
        
        storyPages.push(page);
        sectionPageCount++;
        
        // Update story progress
        this.updateStoryProgress(i, currentSection, storyProgress);
      }
      
      return storyPages;
    };

    return createCohesiveStory();
  }

  private static generateEasyPage(
    pageIndex: number,
    section: string,
    characterName: string,
    animal: string,
    setting: string,
    object: string,
    value: string,
    food: string,
    activity: string,
    progress: any,
    targetWords: number
  ): string {
    // Mo Willems style: Simple dialogue, repetition, emotional expressions
    // Dr. Seuss style: Rhyme, rhythm, playful language
    // Eric Carle style: Simple concepts, exploration, discovery
    
    if (section === 'introduction') {
      if (pageIndex === 0) {
        // Mo Willems style introduction with emotion
        return `This is ${characterName}. ${characterName} is VERY excited today! "I want an adventure!" says ${characterName}. "A BIG adventure!"`;
      } else if (pageIndex === 1) {
        // Dr. Seuss style rhythm and exploration
        return `${characterName} goes here. ${characterName} goes there. ${characterName} goes everywhere! Where will ${characterName} go? Nobody knows!`;
      } else {
        // Eric Carle style discovery
        return `Look! Look! What does ${characterName} see? The ${setting}! It is big and bright and beautiful!`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Mo Willems style dialogue and surprise
        return `"Hello!" says a voice. ${characterName} looks up. "HELLO!" ${characterName} says back. It is a friendly ${animal}!`;
      } else if (!progress.foundObject) {
        // Dr. Seuss style problem introduction with rhythm
        return `"Oh no! Oh me! I lost my ${object}!" says the ${animal}. "Will you help? Will you please?"`;
      } else if (!progress.facedChallenge) {
        // Eric Carle style methodical searching
        return `They look here. They look there. Under the rock? No! Behind the tree? No! Where can it be?`;
      } else {
        // Mo Willems style excitement and discovery
        return `"THERE!" shouts ${characterName}. "I found it! I found it!" The ${object} sparkles in the grass!`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Mo Willems style emotional resolution
        return `"Thank you! Thank you!" says the ${animal}. ${characterName} feels happy. Very, very happy!`;
      } else {
        // Dr. Seuss style wisdom with rhythm
        return `${characterName} learned about ${value} today. Being kind is the best way! Hip hooray!`;
      }
    }
  }

  private static generateMediumPage(
    pageIndex: number,
    section: string,
    characterName: string,
    animal: string,
    setting: string,
    object: string,
    value: string,
    food: string,
    activity: string,
    progress: any,
    targetWords: number
  ): string {
    // Kevin Henkes style: Gentle emotions, quiet moments, family-like warmth
    // Jan Brett style: Rich detail, seasonal elements, cozy settings
    
    if (section === 'introduction') {
      if (pageIndex === 0) {
        // Kevin Henkes style quiet beginning with emotion
        return `${characterName} woke up that morning with a flutter of excitement in their chest. Something wonderful was waiting, though they couldn't quite say what it might be.`;
      } else if (pageIndex === 1) {
        // Jan Brett style detailed setting description
        return `The path to the ${setting} wound through patches of wildflowers and past a babbling brook where dragonflies danced in the dappled sunlight.`;
      } else {
        // Kevin Henkes style wonder and discovery
        return `When ${characterName} first glimpsed the ${setting}, they stopped and caught their breath. It was more beautiful than anything they had ever imagined.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Kevin Henkes style gentle introduction of characters
        return `A soft rustling in the bushes made ${characterName} turn around. There, with kind eyes and a gentle smile, sat a ${animal} who seemed both wise and friendly.`;
      } else if (!progress.foundObject) {
        // Jan Brett style storytelling with emotional depth
        return `"I've lost something very precious," the ${animal} said quietly. "My grandmother's ${object}. Without it, I feel like a part of my heart is missing."`;
      } else if (!progress.facedChallenge) {
        // Kevin Henkes style patient, methodical approach
        return `Together, ${characterName} and the ${animal} searched with care and patience, checking each hollow log and looking beneath every fallen leaf.`;
      } else {
        // Jan Brett style magical discovery moment
        return `Suddenly, a glimmer caught ${characterName}'s eye. There, nestled among the roots of an ancient oak tree, the ${object} lay waiting like a precious secret.`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Kevin Henkes style emotional connection and gratitude
        return `The ${animal}'s eyes filled with happy tears. "You helped me when you didn't have to," it whispered. "That's what true ${value} looks like."`;
      } else {
        // Jan Brett style warm, cozy ending
        return `As ${characterName} walked home through the golden afternoon light, their heart felt as warm as a cup of hot cocoa on a winter day. They had learned that ${value} makes the world more beautiful.`;
      }
    }
  }

  private static generateHardPage(
    pageIndex: number,
    section: string,
    characterName: string,
    animal: string,
    setting: string,
    object: string,
    value: string,
    food: string,
    activity: string,
    progress: any,
    targetWords: number
  ): string {
    // Roald Dahl style: Whimsical language, unexpected twists, "scrumptious" vocabulary
    // Beverly Cleary style: Real emotions, relatable problems, character growth
    // Judy Blume style: Honest feelings, complex situations, personal development
    
    if (section === 'introduction') {
      if (pageIndex === 0) {
        // Roald Dahl style whimsical beginning
        return `${characterName} was having what grown-ups might call "one of those days," but what ${characterName} secretly suspected was the beginning of something absolutely scrumptious and wonderfully unexpected.`;
      } else if (pageIndex === 1) {
        // Beverly Cleary style realistic approach to adventure
        return `The truth was, ${characterName} had been feeling a bit ordinary lately. Not sad exactly, but not particularly excited either—until they remembered the mysterious ${setting} that everyone whispered about but no one seemed to visit.`;
      } else {
        // Judy Blume style honest emotional reaction
        return `Standing at the edge of the ${setting}, ${characterName} felt a mixture of nervousness and excitement that made their stomach flip like a pancake on Sunday morning.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Roald Dahl style quirky character introduction
        return `"Well, blow me down with a feather!" exclaimed a voice from above. ${characterName} looked up to see a most peculiar ${animal} wearing what appeared to be tiny spectacles and a very serious expression.`;
      } else if (!progress.foundObject) {
        // Beverly Cleary style realistic problem-solving
        return `The ${animal} explained the situation with the kind of practical honesty that adults often forgot to use. "I've lost my ${object}, and frankly, I'm not sure how I'm going to get it back without help."`;
      } else if (!progress.facedChallenge) {
        // Judy Blume style persistence through difficulty
        return `The search was harder than ${characterName} had expected. There were moments when they wanted to give up, when their feet hurt and their confidence wavered, but something inside kept them going.`;
      } else {
        // Roald Dahl style triumphant discovery
        return `"Great galloping galoshes!" shouted ${characterName}, using a phrase they'd never used before but which seemed perfectly appropriate. There, gleaming like a star that had fallen to earth, was the ${object}!`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Beverly Cleary style realistic gratitude and recognition
        return `The ${animal} looked at ${characterName} with genuine admiration. "You know," it said thoughtfully, "most people would have given up by now. But you didn't. That tells me something important about who you are."`;
      } else {
        // Judy Blume style mature reflection on growth
        return `Walking home, ${characterName} realized they felt different somehow—not because anything magical had happened to them, but because they had discovered they were capable of more ${value} than they'd ever imagined.`;
      }
    }
  }

  private static generateExpertPage(
    pageIndex: number,
    section: string,
    characterName: string,
    animal: string,
    setting: string,
    object: string,
    value: string,
    food: string,
    activity: string,
    progress: any,
    targetWords: number
  ): string {
    // Kate DiCamillo style: Lyrical language, profound themes, emotional depth
    // R.J. Palacio style: Empathy, perspective-taking, social awareness
    // Angie Thomas style: Authentic voice, social consciousness, empowerment
    
    if (section === 'introduction') {
      if (pageIndex === 0) {
        // Kate DiCamillo style lyrical beginning with deep emotion
        return `There are moments in life when the ordinary world seems to crack open just enough to reveal something luminous beneath, and for ${characterName}, this particular morning felt heavy with that kind of possibility.`;
      } else if (pageIndex === 1) {
        // R.J. Palacio style perspective and empathy
        return `As ${characterName} approached the ${setting}, they tried to imagine how many other people had stood in this exact spot, each carrying their own hopes and fears, each seeing something different in the landscape before them.`;
      } else {
        // Angie Thomas style authentic voice and empowerment
        return `The thing about ${characterName} was that they had always felt different—not in a way that made them sad, but in a way that made them notice things others missed, like the way light moved differently here, as if the ${setting} itself was alive.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Kate DiCamillo style magical realism and profound connection
        return `When the ${animal} spoke, its voice carried the weight of ancient stories and the gentleness of rainfall. "I have been waiting," it said, "not for someone special, but for someone willing to see."`;
      } else if (!progress.foundObject) {
        // R.J. Palacio style understanding through different perspectives
        return `"The ${object} isn't lost," the ${animal} explained carefully, watching ${characterName}'s face. "It's hidden from those who aren't ready to understand that power and ${value} are the same thing."`;
      } else if (!progress.facedChallenge) {
        // Angie Thomas style inner strength and social awareness
        return `The real challenge wasn't physical—it was learning to trust that their own voice mattered, that their own understanding of ${value} was not only valid but necessary in a world that often seemed to have forgotten what kindness looked like.`;
      } else {
        // Kate DiCamillo style moment of profound recognition
        return `When ${characterName} finally understood where the ${object} had been all along—not hidden in the ${setting} but carried within their own capacity for ${value}—the world around them seemed to exhale with relief.`;
      }
    } else {
      if (!progress.learnedLesson) {
        // R.J. Palacio style wisdom about empathy and connection
        return `"You chose to see me," the ${animal} said simply, "and in doing so, you chose to see yourself. This is how ${value} works—it connects us across all the differences that might otherwise keep us apart."`;
      } else {
        // Angie Thomas style empowerment and social responsibility
        return `As ${characterName} returned to their everyday world, they carried with them not just the memory of magic, but the understanding that they had the power to create change, to spread ${value}, and to help others find their own light in a world that needed more illumination.`;
      }
    }
  }

  private static updateStoryProgress(pageIndex: number, section: string, progress: any): void {
    if (section === 'adventure') {
      if (pageIndex > 2 && !progress.metCharacter) progress.metCharacter = true;
      if (pageIndex > 4 && !progress.foundObject) progress.foundObject = true;
      if (pageIndex > 6 && !progress.facedChallenge) progress.facedChallenge = true;
    } else if (section === 'resolution') {
      if (!progress.learnedLesson) progress.learnedLesson = true;
      if (pageIndex > 8) progress.journeyComplete = true;
    }
  }

  private static generateCulturalExtension(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number,
    isESLLearner: boolean
  ): string[] {
    
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    const characterName = userInfo.name;
    
    // Get the same story elements from the main story for consistency
    const animal = userInfo.favoriteAnimal 
      ? userInfo.favoriteAnimal.toLowerCase()
      : ["dragon", "owl", "rabbit", "deer", "fox"][Math.floor(Math.random() * 5)];
    
    const setting = culturalElements.setting || "magical forest";
    const object = userInfo.favoriteColor 
      ? `glowing ${userInfo.favoriteColor.toLowerCase()} crystal`
      : "glowing crystal";
    
    const value = culturalElements.value || "kindness";
    const food = userInfo.favoriteFood 
      ? userInfo.favoriteFood.toLowerCase()
      : "magical berries";
    
    const activity = userInfo.hobbies 
      ? userInfo.hobbies.toLowerCase()
      : "exploring";
    
    const createCohesiveExtension = () => {
      const extensionPages: string[] = [];
      
      // Continue the story naturally from where it left off
      for (let i = 0; i < pageCount; i++) {
        let page = "";
        
        if (difficulty === "easy") {
          const continuationTemplates = [
            `${characterName} has more friends to meet! Look who is coming to say hello!`,
            `The ${animal} shows ${characterName} a new place. "Come see!" says the ${animal}.`,
            `${characterName} learns something new every day. Learning is so much fun!`,
            `"Let's play!" says ${characterName}. All the friends want to play together.`,
            `More adventures wait for ${characterName}. What will happen next?`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else if (difficulty === "medium") {
          const continuationTemplates = [
            `As their friendship with the ${animal} deepened, ${characterName} discovered there were many more secrets hidden in the ${setting}.`,
            `The ${animal} introduced ${characterName} to other creatures who had their own stories of ${value} and friendship to share.`,
            `Each new day brought fresh adventures and opportunities for ${characterName} to practice what they had learned about ${value}.`,
            `The magical ${setting} seemed to grow more wonderful each time ${characterName} visited, revealing new paths and hidden treasures.`,
            `${characterName} began to understand that every ending was really just the beginning of a new and even more exciting chapter.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else if (difficulty === "hard") {
          const continuationTemplates = [
            `Word of ${characterName}'s acts of ${value} had spread throughout the ${setting}, attracting other adventurers who sought to learn from their example.`,
            `The ${animal} revealed that the ${object} was just one of many artifacts that needed guardians who truly understood the responsibility that comes with power.`,
            `${characterName} found themselves becoming a mentor to younger travelers, sharing the wisdom they had gained through their own challenging journey.`,
            `New mysteries emerged from the depths of the ${setting}, each one requiring ${characterName} to apply their growing understanding of ${value} in different ways.`,
            `The ripple effects of ${characterName}'s choices continued to spread, creating positive changes that would benefit generations of future adventurers.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else { // expert
          const continuationTemplates = [
            `The profound transformation ${characterName} had undergone in the ${setting} began to manifest in ways that transcended the boundaries between the magical realm and the everyday world.`,
            `Other seekers, drawn by an inexplicable pull, began to arrive at the ${setting}, each bringing their own questions about the nature of ${value} and purpose.`,
            `${characterName} discovered that their journey had been preparing them not just to find answers, but to help others frame the right questions about their own paths.`,
            `The ${animal} revealed that the greatest magic lay not in the artifacts or spells, but in the web of connections that ${value} creates between all living beings.`,
            `As ${characterName} prepared to return to their ordinary life, they carried with them the understanding that magic and ${value} are not separate from daily existence, but the very foundation upon which a meaningful life is built.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        }
        
        extensionPages.push(page);
      }
      
      return extensionPages;
    };

    return createCohesiveExtension();
  }

  // Helper method to add learning-focused elements for different user types
  static addLearningElements(
    story: string[], 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string[] {
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (isESLLearner) {
      // For ESL learners: Add language patterns and repetitive structures
      return story.map(paragraph => {
        // Add simple connectors and repetitive patterns to help with language acquisition
        return paragraph;
      });
    } else if (isNativeEnglishSpeaker) {
      // For native speakers: Add vocabulary challenges and reading comprehension elements
      if (userInfo.age && userInfo.age > 10) {
        // Add more sophisticated vocabulary for older native speakers
        return story.map(paragraph => {
          // Could add synonym challenges, complex sentence structures, etc.
          return paragraph;
        });
      }
    }
    
    return story;
  }
}

export default InclusiveStoryGenerator;