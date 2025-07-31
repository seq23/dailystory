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
    
    // Create different story variants based on difficulty and cultural context
    const createCulturalStoryByDifficulty = () => {
      const storyPages: string[] = [];
      
      // Enhanced story elements that incorporate user preferences
      const getPersonalizedElements = () => {
        // Base elements with fallbacks if user didn't provide preferences
        const animals = userInfo.favoriteAnimal 
          ? [`friendly ${userInfo.favoriteAnimal.toLowerCase()}`, "wise owl", "playful rabbit", "gentle deer", "curious fox"]
          : ["friendly dragon", "wise owl", "playful rabbit", "gentle deer", "curious fox"];
        
        const settings = [culturalElements.setting, "magical forest", "enchanted garden", "crystal cave", "rainbow bridge"];
        
        const objects = userInfo.favoriteColor 
          ? [`glowing ${userInfo.favoriteColor.toLowerCase()} crystal`, "magic book", "golden key", "silver compass", `${userInfo.favoriteColor.toLowerCase()} gem`]
          : ["glowing crystal", "magic book", "golden key", "silver compass", "rainbow gem"];
        
        const values = [culturalElements.value, "kindness", "courage", "friendship", "wisdom"];
        
        // Add food-related elements if user provided favorite food
        const foods = userInfo.favoriteFood 
          ? [`delicious ${userInfo.favoriteFood.toLowerCase()}`, "magical treats", "sweet berries", "golden honey"]
          : ["magical treats", "sweet berries", "golden honey", "crystal water"];
        
        // Add hobby-related activities if user provided hobbies
        const activities = userInfo.hobbies 
          ? [userInfo.hobbies.toLowerCase(), "exploring", "learning", "helping others"]
          : ["exploring", "learning", "helping others", "solving puzzles"];
        
        return { animals, settings, objects, values, foods, activities };
      };
      
      const { animals, settings, objects, values, foods, activities } = getPersonalizedElements();
      
      for (let i = 0; i < pageCount; i++) {
        let page = "";
        let wordCount = 0;
        
        if (difficulty === "easy") {
          // Dr. Seuss / Mo Willems / Eric Carle inspired style
          // Simple, repetitive language with rhythm. Large text, lots of white space
          const easyTemplates = [
            `${characterName} sees! ${characterName} sees a big, big ${animals[i % animals.length]}!`,
            `"Hello!" says ${characterName}. "Hello!" says the ${animals[i % animals.length]}.`,
            `They go. They go to the ${settings[i % settings.length]}.`,
            `${characterName} looks. ${characterName} looks and sees!`,
            `What is that? What is that ${objects[i % objects.length]}?`,
            `It is good! It is very, very good!`,
            userInfo.favoriteColor ? `${userInfo.favoriteColor} things! ${userInfo.favoriteColor} things everywhere!` : `Pretty things! Pretty things everywhere!`,
            `${characterName} smiles. Big smiles! Happy smiles!`,
            userInfo.favoriteFood ? `Yum, yum! ${foods[i % foods.length]} to share!` : `Good food! Good food to share!`,
            userInfo.hobbies ? `Fun time! ${activities[i % activities.length]} is fun!` : `Play time! Play time is fun!`,
            userInfo.specialRequest ? `${characterName} thinks about ${userInfo.specialRequest.toLowerCase()}. Good thoughts!` : `Good day! Very good day!`
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
          // Kevin Henkes / Jan Brett inspired style
          // Gentle storytelling with emotional depth, accessible language, clear story structure
          const mediumTemplates = [
            `One sunny morning, ${characterName} stepped into the gentle world of the ${settings[i % settings.length]}, where everything felt peaceful and welcoming.`,
            `A kind ${animals[i % animals.length]} approached slowly, its eyes twinkling with wisdom and warmth, ready to share an important story.`,
            `"Sometimes," whispered the ${animals[i % animals.length]}, "the most beautiful treasures are found when we learn about ${values[i % values.length]}."`,
            `${characterName} felt a warm glow in their heart as they discovered the special ${objects[i % objects.length]} hidden among the soft leaves.`,
            `The adventure unfolded like a gentle dream, each moment teaching ${characterName} something wonderful about friendship and kindness.`,
            userInfo.hobbies ? `Using their love of ${activities[i % activities.length]}, ${characterName} found a creative way to help their new friend.` : `With patience and care, ${characterName} found a gentle way to help their new friend.`,
            `The ${animals[i % animals.length]} smiled softly, knowing that ${characterName} had a generous heart full of ${values[i % values.length]}.`,
            `Together they worked, sharing quiet moments of understanding and building a friendship that would last forever.`,
            userInfo.favoriteColor ? `The world around them glowed with soft ${userInfo.favoriteColor.toLowerCase()} hues, making everything feel magical and serene.` : `The world around them glowed with soft, warm colors, making everything feel magical and serene.`,
            userInfo.favoriteFood ? `They shared a simple meal of ${foods[i % foods.length]}, savoring both the food and their growing friendship.` : `They shared a simple meal together, savoring both the food and their growing friendship.`,
            userInfo.specialRequest ? `${characterName} thought quietly about ${userInfo.specialRequest.toLowerCase()}, feeling grateful for this gentle lesson about what truly matters.` : `${characterName} felt grateful for this gentle lesson about what truly matters in life.`
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
        } else if (difficulty === "hard") {
          // Roald Dahl / Beverly Cleary / Judy Blume inspired style
          // Engaging plots with humor and heart, complex vocabulary, character relationships
          const hardTemplates = [
            `${characterName} couldn't believe their eyes when they stumbled upon the extraordinary ${settings[i % settings.length]}, a place where the impossible seemed perfectly ordinary and magic hummed in the air.`,
            `"Well, I'll be jiggered!" exclaimed the peculiar ${animals[i % animals.length]}, adjusting its spectacles and peering at ${characterName} with unmistakable curiosity. "Another visitor! How absolutely scrumptious!"`,
            `The ${objects[i % objects.length]} wasn't just any ordinary treasure - it was bursting with mysterious energy that made ${characterName}'s fingertips tingle with excitement and anticipation.`,
            `What started as a simple exploration quickly transformed into a rollicking adventure filled with unexpected twists, delightful surprises, and valuable lessons about ${values[i % values.length]}.`,
            `${characterName} discovered that growing up sometimes means facing challenges that seem impossible, but with determination and a dash of creativity, even the most daunting problems have solutions.`,
            userInfo.hobbies ? `"Your talent for ${activities[i % activities.length]} is exactly what we need!" declared the ${animals[i % animals.length]}, clapping its paws together with genuine enthusiasm.` : `"Your curiosity and courage are exactly what we need!" declared the ${animals[i % animals.length]}, clapping its paws together with genuine enthusiasm.`,
            `The friendship between ${characterName} and the ${animals[i % animals.length]} grew stronger with each shared laugh, each moment of understanding, and each act of mutual support.`,
            `Sometimes the most important lessons come disguised as ordinary moments, and ${characterName} was beginning to understand the true meaning of ${values[i % values.length]}.`,
            userInfo.favoriteColor ? `The entire landscape seemed to pulse with vibrant ${userInfo.favoriteColor.toLowerCase()} energy, as if the world itself was celebrating ${characterName}'s journey of discovery.` : `The entire landscape seemed to pulse with vibrant rainbow energy, as if the world itself was celebrating ${characterName}'s journey of discovery.`,
            userInfo.favoriteFood ? `"Nothing brings creatures together quite like sharing delicious ${foods[i % foods.length]}," chuckled the ${animals[i % animals.length]}, setting out a feast that would make any celebration complete.` : `"Nothing brings creatures together quite like sharing delicious food," chuckled the ${animals[i % animals.length]}, setting out a feast that would make any celebration complete.`,
            userInfo.specialRequest ? `As ${characterName} reflected on their adventure, they realized that their dream of ${userInfo.specialRequest.toLowerCase()} wasn't just a personal wish - it was a gift they could share with everyone they met.` : `As ${characterName} reflected on their adventure, they realized that kindness isn't just a personal quality - it's a gift they could share with everyone they met.`
          ];
          
          while (wordCount < targetWords) {
            const template = hardTemplates[Math.floor(Math.random() * hardTemplates.length)];
            const words = template.split(' ').length;
            if (wordCount + words <= targetWords + 10) {
              page += (page ? " " : "") + template;
              wordCount += words;
            } else {
              break;
            }
          }
        } else {
          // Kate DiCamillo / R.J. Palacio / Angie Thomas inspired style  
          // Sophisticated themes, complex character relationships, literary devices, nuanced emotions
          const expertTemplates = [
            `In the profound stillness of the ${settings[i % settings.length]}, ${characterName} encountered a moment of such unexpected beauty that it would forever change their understanding of what it means to truly see the world.`,
            `The ancient ${animals[i % animals.length]} regarded ${characterName} with eyes that held the accumulated wisdom of countless seasons, speaking in a voice that resonated with the timeless truths about ${values[i % values.length]}.`,
            `Sometimes, ${characterName} reflected, the most transformative journeys begin not with grand gestures or dramatic moments, but with the quiet courage to listen - really listen - to the stories that surround us every day.`,
            `The ${objects[i % objects.length]} seemed almost alive with memory, each surface telling a story of triumph and struggle, of love found and lost, of the eternal human quest to understand our place in the vast tapestry of existence.`,
            `What ${characterName} was learning about ${values[i % values.length]} couldn't be captured in simple words or easy explanations - it was something that had to be felt, experienced, and allowed to settle deep within the soul.`,
            userInfo.hobbies ? `Through the lens of ${activities[i % activities.length]}, ${characterName} began to see how individual passions and talents are threads in a larger fabric, connecting us all in ways both visible and invisible.` : `Through quiet observation and reflection, ${characterName} began to see how individual experiences are threads in a larger fabric, connecting us all in ways both visible and invisible.`,
            `The relationship between ${characterName} and the ${animals[i % animals.length]} transcended simple friendship, becoming a testament to the profound connections that can form when two beings truly see and accept each other.`,
            `In this place where time seemed to move differently, ${characterName} understood that growing up isn't about reaching a destination, but about learning to navigate the beautiful complexity of being human.`,
            userInfo.favoriteColor ? `The world around them shifted and shimmered with subtle ${userInfo.favoriteColor.toLowerCase()} light, as if the universe itself was responding to the depth of their emotional connection and understanding.` : `The world around them shifted and shimmered with subtle, ethereal light, as if the universe itself was responding to the depth of their emotional connection and understanding.`,
            userInfo.favoriteFood ? `They shared not just ${foods[i % foods.length]}, but stories and silences, laughter and tears, creating the kind of memory that becomes a touchstone for all future moments of connection.` : `They shared not just food, but stories and silences, laughter and tears, creating the kind of memory that becomes a touchstone for all future moments of connection.`,
            userInfo.specialRequest ? `${characterName} came to understand that ${userInfo.specialRequest.toLowerCase()} wasn't simply a personal aspiration, but a responsibility - a way of honoring the interconnectedness of all life and the sacred trust we have to care for one another.` : `${characterName} came to understand that compassion wasn't simply a personal quality, but a responsibility - a way of honoring the interconnectedness of all life and the sacred trust we have to care for one another.`
          ];
          
          while (wordCount < targetWords) {
            const template = expertTemplates[Math.floor(Math.random() * expertTemplates.length)];
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