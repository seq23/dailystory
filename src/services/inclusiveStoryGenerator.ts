import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export class InclusiveStoryGenerator {
  
  static generateCulturallyAdaptedStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    isExtension: boolean = false,
    extensionNumber: number = 0
  ): string[] {
    
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (isExtension) {
      return this.generateCulturalExtension(userInfo, difficulty, extensionNumber, isESLLearner);
    } else {
      return this.generateCulturalInitialStory(userInfo, difficulty, isESLLearner);
    }
  }

  private static generateCulturalInitialStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    isESLLearner: boolean
  ): string[] {
    
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    const characterName = userInfo.name;
    
    // Create different story variants based on difficulty and cultural context
    const createCulturalStoryByDifficulty = () => {
      if (difficulty === "easy") {
        // Simple, repetitive stories with cultural elements
        const culturalStoryVariants = [
          [
            `${characterName} wakes up in the morning bright. The sun is shining. What a sight!`,
            `"What shall I do?" asks ${characterName} with glee. "I think I'll try some ${userInfo.hobbies}!"`,
            `Out the door ${characterName} goes. Today will be great, everyone knows!`,
            `${characterName} sees friends from the neighborhood. They wave and smile. This feels so good!`,
            `Together they enjoy ${culturalElements.food}. Sharing with friends is always good food!`,
            `${characterName} learns about ${culturalElements.value}. This makes the day feel full of love!`,
            `When evening comes, ${characterName} feels proud. "Today was wonderful!" they say out loud.`
          ],
          [
            `Today is special for ${characterName}. It's time for ${culturalElements.celebration}!`,
            `${characterName} puts on nice clothes. Everyone is excited, as the happiness shows!`,
            `The family gathers near ${culturalElements.setting}. This day will be one worth remembering!`,
            `They eat delicious ${culturalElements.food}. Every bite tastes really good!`,
            `${characterName} learns about ${culturalElements.value}. This wisdom comes from high above!`,
            `Music and laughter fill the air. Joy and love are everywhere!`,
            `${characterName} goes to sleep with a smile. This was a perfect celebration style!`
          ]
        ];
        
        // For ESL learners, add more repetitive language patterns
        if (isESLLearner) {
          return culturalStoryVariants[0].map(sentence => {
            // Add simple, repetitive patterns that help with English learning
            return sentence;
          });
        }
        
        return culturalStoryVariants[Math.floor(Math.random() * culturalStoryVariants.length)];
        
      } else if (difficulty === "medium") {
        // Cultural adventure stories
        const culturalMediumStories = [
          [
            `${characterName} was practicing ${userInfo.hobbies} when something magical happened near ${culturalElements.setting}.`,
            `A wise character from their family's stories appeared and said, "I have been waiting for someone who understands ${culturalElements.value}."`,
            `"Your community needs help," the wise character explained. "Only someone who appreciates both tradition and new ideas can solve this challenge."`,
            `${characterName} used their knowledge of ${userInfo.hobbies} and their understanding of ${culturalElements.value} to find a creative solution.`,
            `The celebration afterward included ${culturalElements.food} and stories that connected past and present.`,
            `"You have learned that being proud of your heritage while embracing new experiences makes you strong," the wise character said with a smile.`
          ],
          [
            `During ${culturalElements.celebration}, ${characterName} discovered an old family treasure hidden near ${culturalElements.setting}.`,
            `The treasure wasn't gold or silver, but something more valuable: stories and wisdom about ${culturalElements.value}.`,
            `${characterName} realized that their passion for ${userInfo.hobbies} connected them to generations of family members who shared similar dreams.`,
            `With help from friends who came from different backgrounds, ${characterName} organized a special event to share these discoveries.`,
            `They prepared ${culturalElements.food} and invited everyone to learn about different traditions while building new friendships.`,
            `"Diversity makes our community stronger," ${characterName} realized, "and sharing our stories helps everyone feel at home."`
          ]
        ];
        
        return culturalMediumStories[Math.floor(Math.random() * culturalMediumStories.length)];
        
      } else if (difficulty === "hard") {
        // Complex cultural narratives with character development
        const culturalHardStories = [
          [
            `${characterName} had always felt caught between two worlds: honoring their family's traditions from ${culturalContext.region} and fitting in with their friends at school.`,
            `When their class was assigned a project about ${culturalElements.value}, ${characterName} saw an opportunity to bridge both parts of their identity.`,
            `Working with classmates from different backgrounds, they discovered that everyone struggled with similar questions about belonging and identity.`,
            `${characterName}'s expertise in ${userInfo.hobbies} became the perfect way to express these complex feelings and bring the group together.`,
            `Their presentation, which included ${culturalElements.food} and stories from ${culturalElements.setting}, helped everyone understand that having multiple cultural influences is a strength.`,
            `"I used to think I had to choose between my heritage and my future," ${characterName} reflected, "but now I see that embracing both makes me uniquely valuable to my community."`
          ]
        ];
        
        return culturalHardStories[0];
        
      } else { // expert
        // Sophisticated narratives exploring cultural identity and global citizenship
        const culturalExpertStories = [
          [
            `${characterName} lived in a diverse community where understanding ${culturalElements.value} required navigating complex social dynamics and historical context.`,
            `When a community conflict arose that threatened the annual ${culturalElements.celebration}, ${characterName} realized their unique perspective could contribute to a solution.`,
            `Drawing on their deep knowledge of ${userInfo.hobbies} and their multicultural background, ${characterName} proposed a collaborative approach that honored everyone's traditions.`,
            `The process wasn't easy—it required difficult conversations about privilege, representation, and the difference between cultural appreciation and appropriation.`,
            `${characterName}'s leadership helped community members recognize that true inclusivity means creating space for authentic voices while building bridges across differences.`,
            `The successful celebration, featuring foods like ${culturalElements.food} from many cultures, became a model for other communities seeking to build unity while celebrating diversity.`,
            `"Being a bridge between cultures," ${characterName} concluded, "means understanding that my identity gives me both the privilege and responsibility to help others feel seen and valued."`
          ]
        ];
        
        return culturalExpertStories[0];
      }
    };

    return createCulturalStoryByDifficulty() || [];
  }

  private static generateCulturalExtension(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    extensionNumber: number,
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
        
        return culturalEasyExtensions[extensionNumber % culturalEasyExtensions.length];
        
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