import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

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
    
    // Create different story variants based on difficulty and cultural context
    const createCulturalStoryByDifficulty = () => {
      const storyPages: string[] = [];
      
      // Base story elements
      const animals = ["friendly dragon", "wise owl", "playful rabbit", "gentle deer", "curious fox"];
      const settings = [culturalElements.setting, "magical forest", "enchanted garden", "crystal cave", "rainbow bridge"];
      const objects = ["glowing crystal", "magic book", "golden key", "silver compass", "rainbow gem"];
      const values = [culturalElements.value, "kindness", "courage", "friendship", "wisdom"];
      
      for (let i = 0; i < pageCount; i++) {
        let page = "";
        let wordCount = 0;
        
        if (difficulty === "easy") {
          // Simple, short sentences for early readers
          const easyTemplates = [
            `${characterName} saw a big ${animals[i % animals.length]}.`,
            `They walked to the ${settings[i % settings.length]}.`,
            `The ${animals[i % animals.length]} was very friendly.`,
            `${characterName} felt happy and excited.`,
            `They found a special ${objects[i % objects.length]}.`,
            `${characterName} learned about ${values[i % values.length]}.`,
            `The sun was bright and warm.`,
            `${characterName} smiled with joy.`,
            `Friends came to help too.`,
            `Everyone had a good time.`
          ];
          
          while (wordCount < targetWords) {
            const template = easyTemplates[Math.floor(Math.random() * easyTemplates.length)];
            const words = template.split(' ').length;
            if (wordCount + words <= targetWords + 5) {
              page += (page ? " " : "") + template;
              wordCount += words;
            } else {
              break;
            }
          }
        } else if (difficulty === "medium") {
          // More complex sentences for intermediate readers
          const mediumTemplates = [
            `${characterName} was exploring the magical ${settings[i % settings.length]} when they discovered a mysterious ${objects[i % objects.length]}.`,
            `The wise ${animals[i % animals.length]} told them about an ancient secret hidden in the ${settings[i % settings.length]}.`,
            `Together, they embarked on an exciting adventure through the ${settings[i % settings.length]}.`,
            `${characterName} learned important lessons about ${values[i % values.length]} and how it helps everyone.`,
            `The journey was challenging but filled with wonderful surprises and new discoveries.`,
            `${characterName} used their knowledge of ${userInfo.hobbies || "reading"} to solve the puzzle.`,
            `The ${animals[i % animals.length]} became ${characterName}'s trusted companion on this adventure.`,
            `They worked together to overcome obstacles and help others in need.`
          ];
          
          while (wordCount < targetWords) {
            const template = mediumTemplates[Math.floor(Math.random() * mediumTemplates.length)];
            const words = template.split(' ').length;
            if (wordCount + words <= targetWords + 8) {
              page += (page ? " " : "") + template;
              wordCount += words;
            } else {
              break;
            }
          }
        } else {
          // Complex sentences and vocabulary for advanced readers
          const hardTemplates = [
            `${characterName} embarked on an extraordinary adventure through the enchanting ${settings[i % settings.length]}, where they encountered a magnificent ${animals[i % animals.length]} who possessed ancient wisdom about ${values[i % values.length]}.`,
            `The mysterious ${objects[i % objects.length]} glowed with an ethereal light, revealing intricate patterns that seemed to tell the story of forgotten civilizations and their understanding of ${values[i % values.length]}.`,
            `Through perseverance and determination, ${characterName} overcame numerous obstacles, learning valuable lessons about resilience, empathy, and the importance of ${values[i % values.length]} in building strong communities.`,
            `The adventure challenged their problem-solving skills and encouraged them to think creatively about solutions to complex puzzles while maintaining their commitment to ${values[i % values.length]}.`,
            `As the journey continued, ${characterName} discovered that true strength comes not from physical power, but from the courage to be kind and the wisdom to understand that ${values[i % values.length]} guides all meaningful actions.`,
            `${characterName}'s expertise in ${userInfo.hobbies || "learning"} became instrumental in helping the ${animals[i % animals.length]} restore balance to the ${settings[i % settings.length]}.`,
            `The experience taught ${characterName} that leadership means inspiring others to discover their own potential while staying true to the principles of ${values[i % values.length]}.`
          ];
          
          while (wordCount < targetWords) {
            const template = hardTemplates[Math.floor(Math.random() * hardTemplates.length)];
            const words = template.split(' ').length;
            if (wordCount + words <= targetWords + 12) {
              page += (page ? " " : "") + template;
              wordCount += words;
            } else {
              break;
            }
          }
        }
        
        // Ensure we have content for the page
        if (!page.trim()) {
          page = `${characterName} continued their amazing adventure, learning more about ${values[i % values.length]} with each step.`;
        }
        
        storyPages.push(page);
      }
      
      return storyPages;
    };

    return createCulturalStoryByDifficulty();
  }

  private static generateCulturalExtension(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    pageCount: number,
    isESLLearner: boolean
  ): string[] {
    
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    const characterName = userInfo.name;
    
    const createCulturalExtensionByDifficulty = () => {
      if (difficulty === "easy") {
        const culturalEasyExtensions = [
          [
            `Oh look! ${characterName} finds a friend from ${culturalElements.setting}!`,
            `"Hello!" says the friend. "Would you like to share some ${culturalElements.food}?"`,
            `They sit together and talk about ${culturalElements.value}. This makes them both feel happy!`,
            `${characterName} shows their friend how to do ${userInfo.hobbies}. Sharing is so much fun!`,
            `"Thank you for being kind," says the friend. "You have a good heart, and that makes you a good friend!"`
          ],
          [
            `${characterName} hears music from ${culturalElements.celebration} in the distance.`,
            `"Come dance with us!" call the other children. "Today we celebrate together!"`,
            `They dance and laugh while eating ${culturalElements.food}. Everyone is included in the fun!`,
            `${characterName} teaches others about ${userInfo.hobbies}. Everyone learns something new!`,
            `"Different traditions make life colorful," thinks ${characterName}. "I'm glad we can all be friends!"`
          ]
        ];
        
        return culturalEasyExtensions[0].slice(0, pageCount);
        
      } else if (difficulty === "medium") {
        const culturalMediumExtensions = [
          [
            `${characterName} decided to organize a special event that would bring together friends from different cultural backgrounds.`,
            `They planned activities that included ${userInfo.hobbies} and foods like ${culturalElements.food} from various communities.`,
            `At first, some friends felt shy about sharing their traditions, but ${characterName} helped everyone feel welcome and valued.`,
            `The event became a beautiful celebration where everyone learned about ${culturalElements.value} from different perspectives.`,
            `"When we share our cultures with respect and curiosity," ${characterName} realized, "we all become richer in understanding and friendship."`
          ]
        ];
        
        return culturalMediumExtensions[0];
        
      } else { // hard and expert
        const culturalAdvancedExtensions = [
          [
            `${characterName}'s growing understanding of cultural diversity led them to start a community project that addressed real social challenges.`,
            `By combining their skills in ${userInfo.hobbies} with their commitment to ${culturalElements.value}, they created something that made a meaningful difference.`,
            `The project attracted participants from many backgrounds, including elders who shared wisdom and young people who brought fresh perspectives.`,
            `Together, they developed solutions that honored traditional knowledge while embracing innovative approaches to community building.`,
            `"True leadership," ${characterName} learned, "comes from helping others discover their own power to create positive change in the world."`
          ]
        ];
        
        return culturalAdvancedExtensions[0];
      }
    };

    return createCulturalExtensionByDifficulty() || [];
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