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
    if (section === 'introduction') {
      if (pageIndex === 0) {
        return `This is ${characterName}. ${characterName} is very happy today! ${characterName} wants to go on a big adventure.`;
      } else if (pageIndex === 1) {
        return `${characterName} walks and walks. ${characterName} sees trees. ${characterName} sees flowers. Where will ${characterName} go?`;
      } else {
        return `Look! ${characterName} sees the ${setting}! It looks magical and fun. "I want to explore!" says ${characterName}.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        return `"Hello!" says a voice. ${characterName} looks around. A friendly ${animal} waves at ${characterName}. "Hi there!"`;
      } else if (!progress.foundObject) {
        return `"I lost my special ${object}," says the ${animal}. "Can you help me find it?" ${characterName} nods. "Yes! I will help!"`;
      } else if (!progress.facedChallenge) {
        return `They look and look. They look under rocks. They look behind trees. Where could the ${object} be?`;
      } else {
        return `"There it is!" shouts ${characterName}. The ${object} is hiding in the tall grass. It glows and sparkles!`;
      }
    } else {
      if (!progress.learnedLesson) {
        return `"Thank you!" says the ${animal}. "You are very kind." ${characterName} feels warm and happy inside.`;
      } else {
        return `${characterName} learned about ${value} today. What a wonderful adventure! ${characterName} can't wait for tomorrow.`;
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
    if (section === 'introduction') {
      if (pageIndex === 0) {
        return `${characterName} woke up feeling excited about the day ahead. Something special was going to happen, though ${characterName} didn't know what it would be yet.`;
      } else if (pageIndex === 1) {
        return `After breakfast, ${characterName} decided to take a walk through the peaceful ${setting}. The morning air was fresh and filled with the sweet scent of blooming flowers.`;
      } else {
        return `As ${characterName} wandered deeper into the ${setting}, the trees seemed to whisper secrets and the path sparkled with dewdrops like tiny diamonds.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        return `Suddenly, ${characterName} heard a soft whimpering sound coming from behind a large oak tree. There sat a gentle ${animal}, looking very sad and worried.`;
      } else if (!progress.foundObject) {
        return `"I've lost my precious ${object}," explained the ${animal} with tears in its eyes. "It was a gift from my grandmother, and without it, I feel so lost."`;
      } else if (!progress.facedChallenge) {
        return `${characterName} and the ${animal} searched everywhere together. They climbed hills, crossed streams, and even looked in the darkest corners of the forest.`;
      } else {
        return `Just when they were about to give up, ${characterName} spotted something glowing softly beneath a pile of autumn leaves. It was the ${object}!`;
      }
    } else {
      if (!progress.learnedLesson) {
        return `The ${animal}'s face lit up with joy and gratitude. "You didn't have to help me," it said, "but you chose to anyway. That shows true ${value}."`;
      } else {
        return `As ${characterName} walked home, their heart felt full of warmth. They had discovered that the greatest adventures come from helping others and showing ${value}.`;
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
    if (section === 'introduction') {
      if (pageIndex === 0) {
        return `${characterName} had always been curious about the mysterious ${setting} that lay beyond the edge of their neighborhood. Today, with a backpack full of supplies and a heart full of determination, they decided it was finally time to explore.`;
      } else if (pageIndex === 1) {
        return `The entrance to the ${setting} was marked by two ancient stone pillars covered in strange symbols. As ${characterName} passed between them, the air seemed to shimmer with an otherworldly energy that made their skin tingle with anticipation.`;
      } else {
        return `Every step deeper into the ${setting} revealed new wonders: flowers that chimed like bells in the breeze, streams that flowed uphill, and butterflies whose wings left trails of glittering stardust in the air.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        return `"Excuse me, young traveler," came a melodious voice from above. ${characterName} looked up to see a magnificent ${animal} perched on a branch, its wise eyes reflecting centuries of knowledge and experience.`;
      } else if (!progress.foundObject) {
        return `The ${animal} explained that long ago, a powerful ${object} had been hidden in the ${setting} to protect it from those who would misuse its magic. "But now," it said sadly, "the balance of our world depends on finding it again."`;
      } else if (!progress.facedChallenge) {
        return `The quest led ${characterName} through treacherous ravines and across rickety bridges suspended over misty chasms. Each obstacle tested not only their physical courage but also their commitment to helping others.`;
      } else {
        return `At the heart of the ${setting}, in a grove where sunlight danced through crystal leaves, ${characterName} discovered the ${object} resting on a pedestal of living stone, pulsing with gentle, warm light.`;
      }
    } else {
      if (!progress.learnedLesson) {
        return `"You could have kept the ${object} for yourself," observed the ${animal} with deep respect, "but instead you chose to return it to where it belongs. This is the true meaning of ${value}."`;
      } else {
        return `As ${characterName} made their way home, they realized that the real treasure hadn't been the magical ${object}, but the understanding that ${value} and selflessness are the most powerful forces in any world.`;
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
    if (section === 'introduction') {
      if (pageIndex === 0) {
        return `In the quiet moments before dawn, when the world exists in that liminal space between night and day, ${characterName} found themselves drawn to the ancient ${setting} that had haunted their dreams for weeks. There was something there, calling to them—a purpose they couldn't yet name but felt with every fiber of their being.`;
      } else if (pageIndex === 1) {
        return `The ${setting} existed in a realm where the laws of physics seemed more like gentle suggestions, where time moved in spirals rather than straight lines, and where every shadow held the potential for revelation. ${characterName} stepped forward, understanding instinctively that they were crossing a threshold from which there would be no return.`;
      } else {
        return `Each breath of the ethereal air filled ${characterName} with a profound sense of connection to something far greater than themselves. The very ground beneath their feet pulsed with the heartbeat of ancient wisdom, and the trees whispered stories in languages that predated human memory.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        return `"I have been waiting for you, ${characterName}," spoke a voice that seemed to emanate from the very essence of the ${setting} itself. Before them materialized a ${animal} whose presence radiated such depth of understanding that ${characterName} immediately knew they were in the presence of a being who had witnessed the rise and fall of civilizations.`;
      } else if (!progress.foundObject) {
        return `The ${animal} spoke of the ${object}, an artifact that existed as both a physical manifestation and a metaphysical concept—a bridge between the world of what is and the realm of what could be. "It has chosen you," the ${animal} explained, "not because you are perfect, but because you understand the weight of ${value}."`;
      } else if (!progress.facedChallenge) {
        return `The journey to the ${object} became a pilgrimage through the landscape of ${characterName}'s own soul. Each challenge they faced reflected an aspect of their character that needed to be examined, refined, and ultimately transcended. The external quest had become an internal transformation.`;
      } else {
        return `When ${characterName} finally stood before the ${object}, they understood that the true test was not in claiming it, but in recognizing that its power came not from possession but from the wisdom to know when and how to use it—and more importantly, when not to use it at all.`;
      }
    } else {
      if (!progress.learnedLesson) {
        return `"The greatest magic," the ${animal} observed as ${characterName} made their choice, "lies not in the artifacts we seek or the powers we acquire, but in the recognition that ${value} is both the journey and the destination, the question and the answer."`;
      } else {
        return `As ${characterName} emerged from the ${setting}, forever changed by their encounter with the profound mysteries of existence, they carried with them not just memories of magic, but the understanding that every choice, every act of ${value}, ripples outward to touch lives they may never know—and that this responsibility is both the burden and the gift of being truly human.`;
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