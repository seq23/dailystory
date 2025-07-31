import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";

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
    pageCount: number = 10,
    existingContext?: string
  ): string[] {
    
    const isESLLearner = userInfo.nativeLanguage !== 'en';
    const isNativeEnglishSpeaker = userInfo.nativeLanguage === 'en';
    
    if (isExtension) {
      return this.generateCulturalExtension(userInfo, difficulty, pageCount, isESLLearner, existingContext);
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
      easy: 6,       // Pre-K - Kindergarten: Maximum 6 words per page
      medium: 35,    // 2nd - 3rd Grade: 25-45 words  
      hard: 65,      // 4th - 5th Grade: 50-80 words
      expert: 85     // 6th Grade+: 70-100 words
    };
    
    const targetWords = wordsPerPage[difficulty] || 35;
    
    // Create a cohesive story that flows like a book
    const createCohesiveStory = () => {
      const storyPages: string[] = [];
      
      // Enhanced story elements that incorporate user preferences intelligently
      const getPersonalizedElements = () => {
        // Create a smart element tracker to ensure organic integration and prevent repetition
        const elementTracker = {
          animal: userInfo.favoriteAnimal ? userInfo.favoriteAnimal.toLowerCase() : null,
          setting: culturalElements.setting || "magical forest",
          object: userInfo.favoriteColor ? `glowing ${userInfo.favoriteColor.toLowerCase()} crystal` : "glowing crystal",
          value: culturalElements.value || "kindness",
          food: userInfo.favoriteFood ? userInfo.favoriteFood.toLowerCase() : null,
          activity: userInfo.hobbies ? userInfo.hobbies.toLowerCase() : null,
          specialTheme: userInfo.specialRequest ? userInfo.specialRequest.toLowerCase() : null,
          
          // Track story progression and prevent repetition
          usedElements: new Set(),
          usedPhrases: new Set(),
          selectedCharacter: null as string | null,
          storyMemory: {
            introducedCharacters: new Set(),
            visitedPlaces: new Set(),
            foundObjects: new Set(),
            learnedLessons: new Set(),
            sharedMoments: new Set()
          },
          
          // Smart element selection based on story context
          getAppropriateElement: function(context: string, fallbacks: string[]) {
            const contextMap = {
              'character': this.animal,
              'food': this.food,
              'activity': this.activity,
              'theme': this.specialTheme
            };
            
            const element = contextMap[context as keyof typeof contextMap];
            if (element && !this.usedElements.has(context)) {
              this.usedElements.add(context);
              return element;
            }
            
            // Return unused fallback to prevent repetition
            const unusedFallbacks = fallbacks.filter(f => !this.usedElements.has(f));
            const selectedFallback = unusedFallbacks.length > 0 
              ? unusedFallbacks[Math.floor(Math.random() * unusedFallbacks.length)]
              : fallbacks[Math.floor(Math.random() * fallbacks.length)];
            this.usedElements.add(selectedFallback);
            return selectedFallback;
          },
          
          // Get consistent character throughout the story
          getStoryCharacter: function(fallbacks: string[]) {
            if (this.selectedCharacter) {
              return this.selectedCharacter;
            }
            
            if (this.animal && !this.usedElements.has('character')) {
              this.selectedCharacter = this.animal;
              this.usedElements.add('character');
              this.storyMemory.introducedCharacters.add(this.selectedCharacter);
              return this.selectedCharacter;
            }
            
            // Select one character and stick with it
            this.selectedCharacter = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            this.storyMemory.introducedCharacters.add(this.selectedCharacter);
            return this.selectedCharacter;
          },
          
          // Generate unique content that builds on previous pages
          generateUniqueContent: function(pageIndex: number, section: string, baseTemplate: string) {
            const contentVariations = {
              greetings: ["Hello!", "Hi there!", "Nice to meet you!", "What a lovely day!", "How wonderful!"],
              movements: ["walked slowly", "ran quickly", "skipped happily", "wandered curiously", "explored carefully"],
              discoveries: ["found something amazing", "discovered a secret", "spotted something special", "noticed something magical", "uncovered a surprise"],
              emotions: ["felt excited", "was curious", "became happy", "grew confident", "felt grateful"],
              actions: ["helped their friend", "shared something special", "solved a problem", "made a discovery", "learned something new"]
            };
            
            // Ensure no repetition within categories
            for (const [category, variations] of Object.entries(contentVariations)) {
              if (baseTemplate.includes(category)) {
                const unusedVariations = variations.filter(v => !this.usedPhrases.has(v));
                if (unusedVariations.length > 0) {
                  const selected = unusedVariations[Math.floor(Math.random() * unusedVariations.length)];
                  this.usedPhrases.add(selected);
                  baseTemplate = baseTemplate.replace(category, selected);
                }
              }
            }
            
            return baseTemplate;
          },
          
          // Check if we should introduce a user element at this point
          shouldIntroduceElement: function(pageIndex: number, section: string, elementType: string) {
            const element = this[elementType as keyof Omit<typeof this, 'usedElements' | 'usedPhrases' | 'storyMemory' | 'getAppropriateElement' | 'shouldIntroduceElement' | 'generateUniqueContent'>];
            if (!element || this.usedElements.has(elementType)) return false;
            
            // Smart timing based on story structure
            if (section === 'introduction' && elementType === 'activity' && pageIndex === 1) return true;
            if (section === 'adventure' && elementType === 'animal' && pageIndex >= 3) return true;
            if (section === 'adventure' && elementType === 'food' && pageIndex >= 5) return true;
            if (section === 'resolution' && elementType === 'specialTheme' && pageIndex >= 8) return true;
            
            return false;
          }
        };
        
        return elementTracker;
      };
      
      const elementTracker = getPersonalizedElements();
      
      // Create story structure based on difficulty
      const createStoryStructure = () => {
        if (difficulty === "easy") {
          return {
            introduction: Math.ceil(pageCount * 0.3),
            adventure: Math.ceil(pageCount * 0.5),
            resolution: Math.floor(pageCount * 0.2)
          };
        } else if (difficulty === "medium") {
          return {
            introduction: Math.ceil(pageCount * 0.2),
            adventure: Math.ceil(pageCount * 0.6),
            resolution: Math.floor(pageCount * 0.2)
          };
        } else {
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
          page = this.generateEasyPageWithElements(i, currentSection, characterName, elementTracker, storyProgress, targetWords);
        } else if (difficulty === "medium") {
          page = this.generateMediumPageWithElements(i, currentSection, characterName, elementTracker, storyProgress, targetWords);
        } else if (difficulty === "hard") {
          page = this.generateHardPageWithElements(i, currentSection, characterName, elementTracker, storyProgress, targetWords);
        } else {
          page = this.generateExpertPageWithElements(i, currentSection, characterName, elementTracker, storyProgress, targetWords);
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

  private static generateEasyPageWithElements(
    pageIndex: number,
    section: string,
    characterName: string,
    elementTracker: any,
    progress: any,
    targetWords: number
  ): string {
    // Maximum 6 words per page for beginning readers
    // Using only the most basic sight words
    
    if (section === 'introduction') {
      if (pageIndex === 0) {
        // 4 words maximum
        return `This is ${characterName}. Hello!`;
      } else if (pageIndex === 1) {
        // 6 words maximum
        return `${characterName} likes to play. Fun!`;
      } else {
        // 6 words maximum
        return `Look! ${characterName} sees a tree.`;
      }
    } else if (section === 'adventure') {
      const animal = elementTracker.getStoryCharacter(['cat', 'dog', 'bird']);
      
      if (!progress.metCharacter) {
        // 5 words maximum
        return `"Hi!" says the ${animal}.`;
      } else if (!progress.foundObject) {
        // 6 words maximum
        return `"Help me find my toy!"`;
      } else if (!progress.facedChallenge) {
        // 6 words maximum
        return `They look here and there.`;
      } else {
        // 6 words maximum
        return `"I found it!" says ${characterName}.`;
      }
    } else {
      if (!progress.learnedLesson) {
        // 6 words maximum
        return `"Thank you!" They are happy.`;
      } else {
        // 6 words maximum
        return `${characterName} was nice. Good job!`;
      }
    }
  }

  private static generateMediumPageWithElements(
    pageIndex: number,
    section: string,
    characterName: string,
    elementTracker: any,
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
        // Intelligently introduce activity element
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'activity')) {
          return `After spending some time ${elementTracker.activity}, ${characterName} felt ready for adventure. The path to the ${elementTracker.setting} wound through patches of wildflowers and past a babbling brook.`;
        }
        // Jan Brett style detailed setting description
        return `The path to the ${elementTracker.setting} wound through patches of wildflowers and past a babbling brook where dragonflies danced in the dappled sunlight.`;
      } else {
        // Kevin Henkes style wonder and discovery
        return `When ${characterName} first glimpsed the ${elementTracker.setting}, they stopped and caught their breath. It was more beautiful than anything they had ever imagined.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Kevin Henkes style gentle introduction of characters
        const animal = elementTracker.getStoryCharacter(['wise owl', 'gentle deer', 'kind rabbit']);
        return `A soft rustling in the bushes made ${characterName} turn around. There, with kind eyes and a gentle smile, sat a ${animal} who seemed both wise and friendly.`;
      } else if (!progress.foundObject) {
        // Jan Brett style storytelling with emotional depth
        return `"I've lost something very precious," the friend said quietly. "My grandmother's ${elementTracker.object}. Without it, I feel like a part of my heart is missing."`;
      } else if (!progress.facedChallenge) {
        // Kevin Henkes style patient, methodical approach
        return `Together, ${characterName} and their new friend searched with care and patience, checking each hollow log and looking beneath every fallen leaf.`;
      } else {
        // Jan Brett style magical discovery moment
        return `Suddenly, a glimmer caught ${characterName}'s eye. There, nestled among the roots of an ancient oak tree, the ${elementTracker.object} lay waiting like a precious secret.`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Intelligently introduce food element
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'food')) {
          return `Their friend's eyes filled with happy tears. "Let's celebrate with some ${elementTracker.food}," it whispered. "You've shown me what true ${elementTracker.value} looks like."`;
        }
        // Kevin Henkes style emotional connection and gratitude
        return `Their friend's eyes filled with happy tears. "You helped me when you didn't have to," it whispered. "That's what true ${elementTracker.value} looks like."`;
      } else {
        // Intelligently weave in special theme
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'specialTheme')) {
          return `As ${characterName} walked home through the golden afternoon light, they thought about ${elementTracker.specialTheme} and how ${elementTracker.value} makes the world more beautiful.`;
        }
        // Jan Brett style warm, cozy ending
        return `As ${characterName} walked home through the golden afternoon light, their heart felt as warm as a cup of hot cocoa on a winter day. They had learned that ${elementTracker.value} makes the world more beautiful.`;
      }
    }
  }

  private static generateHardPageWithElements(
    pageIndex: number,
    section: string,
    characterName: string,
    elementTracker: any,
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
        // Intelligently introduce activity element
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'activity')) {
          return `After spending the morning ${elementTracker.activity}, ${characterName} had been feeling a bit restless. The mysterious ${elementTracker.setting} that everyone whispered about suddenly seemed like the perfect destination.`;
        }
        // Beverly Cleary style realistic approach to adventure
        return `The truth was, ${characterName} had been feeling a bit ordinary lately. Not sad exactly, but not particularly excited either—until they remembered the mysterious ${elementTracker.setting} that everyone whispered about but no one seemed to visit.`;
      } else {
        // Judy Blume style honest emotional reaction
        return `Standing at the edge of the ${elementTracker.setting}, ${characterName} felt a mixture of nervousness and excitement that made their stomach flip like a pancake on Sunday morning.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Roald Dahl style quirky character introduction
        const animal = elementTracker.getStoryCharacter(['peculiar owl', 'magnificent fox', 'extraordinary rabbit']);
        return `"Well, blow me down with a feather!" exclaimed a voice from above. ${characterName} looked up to see a most peculiar ${animal} wearing what appeared to be tiny spectacles and a very serious expression.`;
      } else if (!progress.foundObject) {
        // Beverly Cleary style realistic problem-solving
        return `The friend explained the situation with the kind of practical honesty that adults often forgot to use. "I've lost my ${elementTracker.object}, and frankly, I'm not sure how I'm going to get it back without help."`;
      } else if (!progress.facedChallenge) {
        // Judy Blume style persistence through difficulty
        return `The search was harder than ${characterName} had expected. There were moments when they wanted to give up, when their feet hurt and their confidence wavered, but something inside kept them going.`;
      } else {
        // Roald Dahl style triumphant discovery
        return `"Great galloping galoshes!" shouted ${characterName}, using a phrase they'd never used before but which seemed perfectly appropriate. There, gleaming like a star that had fallen to earth, was the ${elementTracker.object}!`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Intelligently introduce food element
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'food')) {
          return `Their friend looked at ${characterName} with genuine admiration. "Let's celebrate with some ${elementTracker.food}," it said thoughtfully. "You've shown me what real courage looks like."`;
        }
        // Beverly Cleary style realistic gratitude and recognition
        return `Their friend looked at ${characterName} with genuine admiration. "You know," it said thoughtfully, "most people would have given up by now. But you didn't. That tells me something important about who you are."`;
      } else {
        // Intelligently weave in special theme
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'specialTheme')) {
          return `Walking home, ${characterName} realized they felt different somehow—not because anything magical had happened, but because they had discovered they were capable of both ${elementTracker.value} and pursuing ${elementTracker.specialTheme} with courage.`;
        }
        // Judy Blume style mature reflection on growth
        return `Walking home, ${characterName} realized they felt different somehow—not because anything magical had happened to them, but because they had discovered they were capable of more ${elementTracker.value} than they'd ever imagined.`;
      }
    }
  }

  private static generateExpertPageWithElements(
    pageIndex: number,
    section: string,
    characterName: string,
    elementTracker: any,
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
        // Intelligently introduce activity element
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'activity')) {
          return `After spending time in quiet contemplation through ${elementTracker.activity}, ${characterName} approached the ${elementTracker.setting}, trying to imagine how many others had stood here, each seeing something different in the landscape before them.`;
        }
        // R.J. Palacio style perspective and empathy
        return `As ${characterName} approached the ${elementTracker.setting}, they tried to imagine how many other people had stood in this exact spot, each carrying their own hopes and fears, each seeing something different in the landscape before them.`;
      } else {
        // Angie Thomas style authentic voice and empowerment
        return `The thing about ${characterName} was that they had always felt different—not in a way that made them sad, but in a way that made them notice things others missed, like the way light moved differently here, as if the ${elementTracker.setting} itself was alive.`;
      }
    } else if (section === 'adventure') {
      if (!progress.metCharacter) {
        // Kate DiCamillo style magical realism and profound connection
        const animal = elementTracker.getStoryCharacter(['ancient owl', 'wise fox', 'gentle deer']);
        return `When the ${animal} spoke, its voice carried the weight of ancient stories and the gentleness of rainfall. "I have been waiting," it said, "not for someone special, but for someone willing to see."`;
      } else if (!progress.foundObject) {
        // R.J. Palacio style understanding through different perspectives
        return `"The ${elementTracker.object} isn't lost," their companion explained carefully, watching ${characterName}'s face. "It's hidden from those who aren't ready to understand that power and ${elementTracker.value} are the same thing."`;
      } else if (!progress.facedChallenge) {
        // Angie Thomas style inner strength and social awareness
        return `The real challenge wasn't physical—it was learning to trust that their own voice mattered, that their own understanding of ${elementTracker.value} was not only valid but necessary in a world that often seemed to have forgotten what kindness looked like.`;
      } else {
        // Kate DiCamillo style moment of profound recognition
        return `When ${characterName} finally understood where the ${elementTracker.object} had been all along—not hidden in the ${elementTracker.setting} but carried within their own capacity for ${elementTracker.value}—the world around them seemed to exhale with relief.`;
      }
    } else {
      if (!progress.learnedLesson) {
        // Intelligently introduce food element with deeper meaning
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'food')) {
          return `"You chose to see me," their companion said simply, "and in sharing something as simple as ${elementTracker.food}, you showed me that ${elementTracker.value} connects us across all differences."`;
        }
        // R.J. Palacio style wisdom about empathy and connection
        return `"You chose to see me," their companion said simply, "and in doing so, you chose to see yourself. This is how ${elementTracker.value} works—it connects us across all the differences that might otherwise keep us apart."`;
      } else {
        // Intelligently weave in special theme with social consciousness
        if (elementTracker.shouldIntroduceElement(pageIndex, section, 'specialTheme')) {
          return `As ${characterName} returned to their everyday world, they carried not just memories of magic, but understanding that they had the power to create change, to spread ${elementTracker.value}, and to help others discover ${elementTracker.specialTheme} in their own lives.`;
        }
        // Angie Thomas style empowerment and social responsibility
        return `As ${characterName} returned to their everyday world, they carried with them not just the memory of magic, but the understanding that they had the power to create change, to spread ${elementTracker.value}, and to help others find their own light in a world that needed more illumination.`;
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
    isESLLearner: boolean,
    existingContext?: string
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
      
      // Analyze existing context for narrative elements
      const contextAnalysis = existingContext ? {
        hasAnimal: existingContext.includes(animal),
        hasObject: existingContext.includes(object),
        hasFood: existingContext.includes(food),
        lastSentiment: existingContext.includes('happy') ? 'positive' : 
                     existingContext.includes('sad') ? 'negative' : 'neutral',
        currentLocation: existingContext.includes(setting) ? setting : 'unknown'
      } : {};
      
      // Generate progressive story continuation based on existing narrative
      for (let i = 0; i < pageCount; i++) {
        let page = "";
        const storyPhase = i < pageCount/2 ? 'development' : 'climax';
        
        if (difficulty === "easy") {
          const continuationTemplates = storyPhase === 'development' ? [
            `${characterName} and the ${animal} explore new parts of the ${setting}. "What's that?" asks ${characterName}, pointing to something shiny.`,
            `The friends find a hidden path covered with ${food} trees. "We can share these!" says ${characterName} happily.`,
            `A new friend appears - a wise turtle carrying stories. "Tell us an adventure!" asks ${characterName}.`,
            `${characterName} learns to help others, just like the ${animal} helped them. Being kind feels wonderful!`,
            `The sun shines brightly as ${characterName} discovers a magical garden where ${value} grows like flowers.`
          ] : [
            `All the friends gather together to celebrate their adventures. "We did it!" cheers ${characterName}.`,
            `${characterName} finds the most special ${object} - one that glows with friendship and ${value}.`,
            `The ${animal} shows ${characterName} how to make the ${setting} even more beautiful for everyone.`,
            `${characterName} realizes that the best treasure is having good friends who care about ${value}.`,
            `"Let's have another adventure tomorrow!" says ${characterName}, already excited for what comes next.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else if (difficulty === "medium") {
          const continuationTemplates = storyPhase === 'development' ? [
            `As ${characterName} and the ${animal} journeyed deeper into the ${setting}, they discovered ancient symbols carved into the trees that seemed to tell the story of ${value}.`,
            `The path led them to a village where other children were learning the same lessons about ${value} that ${characterName} had discovered.`,
            `${characterName} began to understand that their adventure was part of a larger tapestry, where every act of ${value} created ripples of positive change.`,
            `They encountered an elder who had been waiting for someone with ${characterName}'s understanding of ${value} to help solve an important challenge.`,
            `The ${object} revealed new powers when ${characterName} used it not for personal gain, but to help others in the ${setting}.`
          ] : [
            `${characterName} realized that their greatest strength came from combining their own talents with the wisdom they had learned about ${value}.`,
            `The celebration feast featured ${food} from every corner of the ${setting}, shared by all the friends ${characterName} had made along the way.`,
            `As the adventure drew to a close, ${characterName} understood that every ending was simply the beginning of a new chapter in the story of ${value}.`,
            `The ${animal} presented ${characterName} with a special gift - the knowledge that they could return to the ${setting} whenever they needed to remember their strength.`,
            `${characterName} looked forward to sharing their newfound wisdom about ${value} with friends back home, knowing that the adventure would continue in their everyday life.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else if (difficulty === "hard") {
          const continuationTemplates = storyPhase === 'development' ? [
            `The network of relationships ${characterName} had built throughout the ${setting} began to reveal a deeper pattern - each connection strengthened their understanding of ${value}.`,
            `${characterName} faced a complex moral dilemma where the right choice wasn't immediately clear, requiring them to synthesize everything they had learned about ${value}.`,
            `The ${animal} revealed that the ${object} was actually a test, and ${characterName}'s true power lay in their capacity to inspire ${value} in others.`,
            `A crisis in the ${setting} called for ${characterName} to lead a diverse group of characters, each bringing different strengths to solve the challenge through ${value}.`,
            `${characterName} discovered that their journey had been preparing them to become a bridge between different communities, using ${value} as the foundation for understanding.`
          ] : [
            `The resolution required ${characterName} to make a sacrifice that demonstrated their complete understanding of what ${value} truly means in practice.`,
            `${characterName} realized that the most profound transformations happen not through grand gestures, but through consistent daily choices guided by ${value}.`,
            `The celebration became a planning session, where ${characterName} and their allies designed systems to ensure that ${value} would flourish throughout the ${setting}.`,
            `As ${characterName} prepared to transition from student to teacher, they understood that their adventure was part of an ongoing cycle of growth and ${value}.`,
            `The story concluded with ${characterName} establishing new traditions that would help future adventurers discover their own relationship with ${value}.`
          ];
          page = continuationTemplates[i % continuationTemplates.length];
        } else { // expert
          const continuationTemplates = storyPhase === 'development' ? [
            `${characterName}'s integration of ${value} into their worldview began to catalyze transformations that extended far beyond the immediate scope of their adventure in the ${setting}.`,
            `The philosophical implications of ${characterName}'s journey became apparent as they encountered others whose lives had been touched by the ripple effects of their choices.`,
            `A meta-narrative emerged as ${characterName} realized they were both protagonist of their own story and supporting character in the larger epic of collective ${value}.`,
            `The boundaries between the magical elements of the ${setting} and the profound realities of human connection began to dissolve, revealing the deeper truths that ${value} represents.`,
            `${characterName} confronted the paradox that true mastery of ${value} requires embracing uncertainty and remaining open to continuous learning and growth.`
          ] : [
            `The resolution transcended simple problem-solving as ${characterName} helped establish new frameworks for understanding how ${value} operates at individual, community, and universal levels.`,
            `${characterName}'s journey culminated in the recognition that the most authentic expression of ${value} is the courage to remain vulnerable and present in each moment.`,
            `The ${setting} transformed into a living metaphor for the interior landscape where ${characterName} would continue to practice and deepen their relationship with ${value}.`,
            `As the adventure concluded, ${characterName} understood that graduation from one level of understanding simply marked the beginning of deeper questions about the nature of ${value}.`,
            `The final chapter revealed that ${characterName}'s entire journey had been preparing them to help others write their own stories of discovery, growth, and authentic expression of ${value}.`
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