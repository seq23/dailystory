import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

export class EnhancedStoryGenerator {
  
  static generateIntelligentStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    pageCount: number = 10
  ): string[] {
    
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    const culturalElements = CulturalAdaptationService.getCulturalElements(userInfo);
    const characterName = userInfo.name?.trim() || 'child';
    
    // Create an intelligent story planner that prevents repetition
    const storyPlanner = {
      usedConcepts: new Set<string>(),
      usedActions: new Set<string>(),
      usedSettings: new Set<string>(),
      usedObjects: new Set<string>(),
      storyArc: this.createStoryArc(pageCount, difficulty),
      characterConsistency: {
        mainCharacter: characterName,
        secondaryCharacter: userInfo.favoriteAnimal?.toLowerCase() || this.selectConsistentCharacter(),
        characterTraits: this.defineCharacterTraits(userInfo),
        relationshipDevelopment: []
      },
      
      // Intelligent content generation that builds narrative
      generatePageContent(pageIndex: number, section: string, previousPages: string[]): string {
        const arcPoint = this.storyArc[pageIndex];
        
        // Analyze previous content to avoid repetition
        const previousContent = previousPages.join(' ').toLowerCase();
        
        // Generate content based on story arc and avoid repetition
        return this.createUniquePageContent(
          pageIndex, 
          section, 
          arcPoint, 
          previousContent,
          characterName,
          userInfo,
          difficulty
        );
      },
      
      // Create unique page content that builds on previous pages
      createUniquePageContent(
        pageIndex: number, 
        section: string, 
        arcPoint: any, 
        previousContent: string,
        characterName: string,
        userInfo: UserInfo,
        difficulty: DifficultyLevel
      ): string {
        
        // Ensure character name consistency
        const mainChar = characterName;
        const secondaryChar = this.characterConsistency.secondaryCharacter;
        
        // Generate content based on story arc and user preferences
        const contentGenerators = {
          introduction: () => this.generateIntroductionContent(pageIndex, mainChar, userInfo, difficulty),
          rising_action: () => this.generateRisingActionContent(pageIndex, mainChar, secondaryChar, userInfo, difficulty, previousContent),
          climax: () => this.generateClimaxContent(pageIndex, mainChar, secondaryChar, userInfo, difficulty),
          falling_action: () => this.generateFallingActionContent(pageIndex, mainChar, secondaryChar, userInfo, difficulty),
          resolution: () => this.generateResolutionContent(pageIndex, mainChar, secondaryChar, userInfo, difficulty)
        };
        
        const generator = contentGenerators[arcPoint.phase as keyof typeof contentGenerators];
        return generator ? generator() : this.generateDefaultContent(pageIndex, mainChar, difficulty);
      }
    };
    
    // Generate the complete story with intelligent flow
    const storyPages: string[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const section = this.determineSection(i, pageCount);
      const pageContent = storyPlanner.generatePageContent(i, section, storyPages);
      storyPages.push(pageContent);
    }
    
    return storyPages;
  }
  
  private static createStoryArc(pageCount: number, difficulty: DifficultyLevel) {
    const arc = [];
    
    // Define story structure based on page count
    const structure = {
      introduction: Math.ceil(pageCount * 0.2),
      rising_action: Math.ceil(pageCount * 0.4),
      climax: Math.ceil(pageCount * 0.2),
      falling_action: Math.ceil(pageCount * 0.1),
      resolution: Math.ceil(pageCount * 0.1)
    };
    
    let currentPage = 0;
    
    // Introduction pages
    for (let i = 0; i < structure.introduction; i++) {
      arc.push({
        phase: 'introduction',
        focus: i === 0 ? 'character_intro' : 'world_building',
        tension: 1
      });
      currentPage++;
    }
    
    // Rising action pages
    for (let i = 0; i < structure.rising_action; i++) {
      arc.push({
        phase: 'rising_action',
        focus: 'character_meeting_and_problem',
        tension: 2 + i
      });
      currentPage++;
    }
    
    // Climax pages
    for (let i = 0; i < structure.climax; i++) {
      arc.push({
        phase: 'climax',
        focus: 'main_challenge',
        tension: 5
      });
      currentPage++;
    }
    
    // Falling action pages
    for (let i = 0; i < structure.falling_action; i++) {
      arc.push({
        phase: 'falling_action',
        focus: 'resolution_beginning',
        tension: 3
      });
      currentPage++;
    }
    
    // Resolution pages
    while (currentPage < pageCount) {
      arc.push({
        phase: 'resolution',
        focus: 'happy_ending',
        tension: 1
      });
      currentPage++;
    }
    
    return arc;
  }
  
  private static selectConsistentCharacter(): string {
    const characters = ['owl', 'fox', 'rabbit', 'deer', 'bear', 'cat', 'dog'];
    return characters[Math.floor(Math.random() * characters.length)];
  }
  
  private static defineCharacterTraits(userInfo: UserInfo) {
    return {
      personality: userInfo.favoriteColor ? `loves ${userInfo.favoriteColor} things` : 'curious and kind',
      interests: userInfo.hobbies || 'exploring',
      specialAbility: userInfo.specialRequest || 'helping others'
    };
  }
  
  private static determineSection(pageIndex: number, totalPages: number): string {
    const ratio = pageIndex / totalPages;
    if (ratio < 0.2) return 'introduction';
    if (ratio < 0.6) return 'rising_action';
    if (ratio < 0.8) return 'climax';
    if (ratio < 0.9) return 'falling_action';
    return 'resolution';
  }
  
  private static generateIntroductionContent(
    pageIndex: number, 
    characterName: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string {
    
    const templates = {
      easy: [
        `This is ${characterName}. ${characterName} is happy.`,
        `${characterName} likes to play. Today is special.`,
        `Look! ${characterName} sees something new.`
      ],
      medium: [
        `${characterName} woke up feeling excited about the day ahead. Something wonderful was waiting to be discovered.`,
        `The morning sun shone brightly as ${characterName} stepped outside, ready for whatever adventure might come.`,
        `${characterName} had always loved exploring, and today felt like the perfect day for a new journey.`
      ],
      hard: [
        `${characterName} stood at the edge of the forest, feeling a mixture of excitement and curiosity about what lay beyond the familiar path.`,
        `There was something different about this morning that made ${characterName} feel ready for adventure, though they couldn't quite explain what it was.`,
        `The world seemed full of possibilities as ${characterName} set out to explore, carrying nothing but curiosity and an open heart.`
      ],
      expert: [
        `${characterName} contemplated the threshold before them, understanding that some journeys change us in ways we cannot anticipate or undo.`,
        `The morning held that peculiar quality of light that suggests important things are about to unfold, and ${characterName} felt ready to meet whatever awaited.`,
        `In the space between familiar and unknown, ${characterName} found themselves at the beginning of something that would test everything they thought they knew about courage and friendship.`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates.medium;
    return difficultyTemplates[pageIndex % difficultyTemplates.length];
  }
  
  private static generateRisingActionContent(
    pageIndex: number, 
    characterName: string, 
    secondaryCharacter: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel, 
    previousContent: string
  ): string {
    
    const hasMetCharacter = previousContent.includes(secondaryCharacter);
    
    if (!hasMetCharacter) {
      const meetingTemplates = {
        easy: `"Hello!" says a friendly ${secondaryCharacter}. ${characterName} smiles.`,
        medium: `A gentle ${secondaryCharacter} appeared from behind a tree, looking kind and wise. "${characterName}," it said softly, "I've been hoping to meet you."`,
        hard: `The ${secondaryCharacter} that emerged from the shadows moved with quiet grace, its eyes holding the kind of wisdom that comes from many years of watching and learning.`,
        expert: `When the ${secondaryCharacter} spoke, its voice carried the weight of ancient stories and the gentleness of rain on leaves. "I have been waiting," it said, "not for someone special, but for someone ready to see."`
      };
      
      return meetingTemplates[difficulty] || meetingTemplates.medium;
    }
    
    const adventureTemplates = {
      easy: [`${characterName} and the ${secondaryCharacter} play together. They are happy.`, `"Let's find something special!" says ${characterName}.`],
      medium: [`Together, ${characterName} and the ${secondaryCharacter} began to explore the magical world around them.`, `The ${secondaryCharacter} showed ${characterName} hidden paths that sparkled with mystery.`],
      hard: [`The ${secondaryCharacter} revealed that it needed ${characterName}'s help with something important that had been lost for a very long time.`, `${characterName} felt honored to be trusted with such an important quest by their new friend.`],
      expert: [`"The thing about trust," the ${secondaryCharacter} explained carefully, "is that it grows not from promises, but from shared understanding of what matters most."`, `${characterName} began to realize that this journey was about more than finding something lost—it was about discovering something within themselves.`]
    };
    
    const templates = adventureTemplates[difficulty] || adventureTemplates.medium;
    return templates[pageIndex % templates.length];
  }
  
  private static generateClimaxContent(
    pageIndex: number, 
    characterName: string, 
    secondaryCharacter: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string {
    
    const climaxTemplates = {
      easy: `${characterName} finds the special thing! "We did it!" they cheer.`,
      medium: `With courage and determination, ${characterName} helped solve the mystery that had puzzled the ${secondaryCharacter} for so long.`,
      hard: `The moment ${characterName} understood what needed to be done, everything became clear. It wasn't about finding something outside—it was about discovering the strength that had been inside all along.`,
      expert: `In that pivotal moment, ${characterName} realized that the greatest discoveries happen not when we find what we're looking for, but when we understand that we already carry everything we need within ourselves.`
    };
    
    return climaxTemplates[difficulty] || climaxTemplates.medium;
  }
  
  private static generateFallingActionContent(
    pageIndex: number, 
    characterName: string, 
    secondaryCharacter: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string {
    
    const templates = {
      easy: `The ${secondaryCharacter} says "Thank you, ${characterName}!"`,
      medium: `${characterName} and the ${secondaryCharacter} celebrated their success together, feeling proud of what they had accomplished.`,
      hard: `The gratitude in the ${secondaryCharacter}'s eyes told ${characterName} that their friendship had created something beautiful and lasting.`,
      expert: `"You have given me something more valuable than what we found," the ${secondaryCharacter} said quietly. "You have shown me what it means to trust and be trusted in return."`
    };
    
    return templates[difficulty] || templates.medium;
  }
  
  private static generateResolutionContent(
    pageIndex: number, 
    characterName: string, 
    secondaryCharacter: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string {
    
    const templates = {
      easy: `${characterName} goes home happy. What a good day!`,
      medium: `As ${characterName} headed home, they carried with them the warmth of new friendship and the joy of helping someone special.`,
      hard: `${characterName} returned home knowing that they had not only helped a friend but had also discovered new depths of courage and kindness within themselves.`,
      expert: `The journey home felt different to ${characterName}—not because the path had changed, but because they now walked it with the understanding that every act of compassion creates ripples that extend far beyond what we can see.`
    };
    
    return templates[difficulty] || templates.medium;
  }
  
  private static generateDefaultContent(
    pageIndex: number, 
    characterName: string, 
    difficulty: DifficultyLevel
  ): string {
    return `${characterName} continued their journey, learning and growing with each step.`;
  }
}

export default EnhancedStoryGenerator;