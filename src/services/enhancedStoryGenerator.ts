import type { UserInfo } from "@/components/UserInfoForm";
import CulturalAdaptationService from "./culturalAdaptationService";

type DifficultyLevel = "easy" | "medium" | "hard" | "expert";

interface StoryArcPoint {
  phase: 'introduction' | 'rising_action' | 'climax' | 'falling_action' | 'resolution';
  focus: string;
  tension: number;
}

export class EnhancedStoryGenerator {
  
  static generateIntelligentStory(
    userInfo: UserInfo, 
    difficulty: DifficultyLevel,
    pageCount: number = 10
  ): string[] {
    
    const characterName = userInfo.name?.trim() || 'child';
    
    // Create an intelligent story planner that prevents repetition
    const storyPlanner = {
      usedConcepts: new Set<string>(),
      usedActions: new Set<string>(),
      usedSettings: new Set<string>(),
      usedObjects: new Set<string>(),
      storyArc: EnhancedStoryGenerator.createStoryArc(pageCount, difficulty),
      characterConsistency: {
        mainCharacter: characterName,
        secondaryCharacter: userInfo.favoriteAnimal?.toLowerCase() || EnhancedStoryGenerator.selectConsistentCharacter(),
        characterTraits: EnhancedStoryGenerator.defineCharacterTraits(userInfo),
        relationshipDevelopment: []
      },
      
      // Intelligent content generation that builds narrative
      generatePageContent(pageIndex: number, section: string, previousPages: string[]): string {
        // Ensure we have a valid arc point for this page index
        const arcPoint = storyPlanner.storyArc[pageIndex] || {
          phase: 'resolution' as const,
          focus: 'default',
          tension: 1
        };
        
        // Analyze previous content to avoid repetition
        const previousContent = previousPages.join(' ').toLowerCase();
        
        // Generate content based on story arc and avoid repetition
        return EnhancedStoryGenerator.createUniquePageContent(
          pageIndex, 
          section, 
          arcPoint, 
          previousContent,
          characterName,
          userInfo,
          difficulty,
          storyPlanner.characterConsistency.secondaryCharacter
        );
      }
    };
    
    // Generate the complete story with intelligent flow
    const storyPages: string[] = [];
    
    for (let i = 0; i < pageCount; i++) {
      const section = EnhancedStoryGenerator.determineSection(i, pageCount);
      const pageContent = storyPlanner.generatePageContent(i, section, storyPages);
      storyPages.push(pageContent);
    }
    
    return storyPages;
  }
  
  private static createUniquePageContent(
    pageIndex: number, 
    section: string, 
    arcPoint: StoryArcPoint, 
    previousContent: string,
    characterName: string,
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    secondaryCharacter: string
  ): string {
    
    // Ensure character name consistency
    
    
    // Generate content based on story arc and user preferences
    const contentGenerators = {
      introduction: () => EnhancedStoryGenerator.generateIntroductionContent(pageIndex, characterName, userInfo, difficulty),
      rising_action: () => EnhancedStoryGenerator.generateRisingActionContent(pageIndex, characterName, secondaryCharacter, userInfo, difficulty, previousContent),
      climax: () => EnhancedStoryGenerator.generateClimaxContent(pageIndex, characterName, secondaryCharacter, userInfo, difficulty),
      falling_action: () => EnhancedStoryGenerator.generateFallingActionContent(pageIndex, characterName, secondaryCharacter, userInfo, difficulty),
      resolution: () => EnhancedStoryGenerator.generateResolutionContent(pageIndex, characterName, secondaryCharacter, userInfo, difficulty)
    };
    
    const generator = contentGenerators[arcPoint.phase];
    return generator ? generator() : EnhancedStoryGenerator.generateDefaultContent(pageIndex, characterName, difficulty);
  }
   
  private static createStoryArc(pageCount: number, difficulty: DifficultyLevel): StoryArcPoint[] {
    const arc: StoryArcPoint[] = [];
    
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
      // Pre-K to 1st Grade: 3-8 words max, simple sight words only
      easy: [
        `This is ${characterName}.`,
        `${characterName} is happy today.`,
        `Look! ${characterName} sees something fun.`
      ],
      // 2nd-3rd Grade: 15-25 words, simple sentences, basic vocabulary
      medium: [
        `${characterName} woke up on a bright sunny morning. Today felt like a special day for a new adventure.`,
        `The birds were singing as ${characterName} stepped outside. Something exciting was waiting to be discovered.`,
        `${characterName} loved to explore new places. This morning seemed perfect for finding something wonderful.`
      ],
      // 4th-5th Grade: 25-40 words, compound sentences, richer vocabulary
      hard: [
        `${characterName} stood at the bedroom window, watching the golden sunlight dance across the garden below. Something about this particular morning whispered promises of adventure and discovery.`,
        `As ${characterName} laced up their favorite shoes, anticipation bubbled in their chest like a fizzy drink. The familiar neighborhood suddenly seemed full of unexplored mysteries.`,
        `The world outside looked different today, though ${characterName} could not quite explain why. Perhaps it was the way the shadows fell, or how the breeze carried hints of magic.`
      ],
      // 6th-12th Grade: 40+ words, complex sentences, sophisticated themes
      expert: [
        `${characterName} understood that certain mornings arrive carrying the weight of transformation, and as they gazed through the frost-touched window, they sensed that today would challenge everything they believed about courage, friendship, and the delicate boundary between the ordinary and extraordinary.`,
        `There exists a particular quality of light that appears just before important events unfold, and ${characterName} recognized it immediately as they stepped into the crisp morning air, feeling both the familiar comfort of home and the electric anticipation of change.`,
        `The threshold between childhood and whatever comes next had always seemed distant to ${characterName}, but this morning brought with it an awareness that some journeys begin not with dramatic fanfare, but with the simple decision to step forward into the unknown.`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates.medium;
    return difficultyTemplates[Math.min(pageIndex, difficultyTemplates.length - 1)];
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
        // Pre-K to 1st Grade: Very simple dialogue, basic emotions
        easy: `${characterName} sees a nice ${secondaryCharacter}. "Hi!" says the ${secondaryCharacter}.`,
        // 2nd-3rd Grade: Simple conversation, clear emotions
        medium: `A friendly ${secondaryCharacter} came out from behind a big tree. "Hello, ${characterName}!" it said with a warm smile. "I have been waiting to meet you."`,
        // 4th-5th Grade: More descriptive language, character development
        hard: `Through the dappled sunlight emerged a wise-looking ${secondaryCharacter}, its gentle eyes sparkling with intelligence and kindness. "I have been watching you, ${characterName}," it said softly, "and I believe you might be exactly the friend I have been hoping to find."`,
        // 6th-12th Grade: Complex characterization, deeper themes
        expert: `The ${secondaryCharacter} that materialized from the shadows moved with an otherworldly grace, as if it existed simultaneously in this world and another. When it spoke, its voice carried centuries of wisdom: "Every soul calls out for connection, ${characterName}, and yours has been singing a song that resonates with mine across the vast loneliness of existence."`
      };
      
      return meetingTemplates[difficulty] || meetingTemplates.medium;
    }
    
    const adventureTemplates = {
      // Pre-K to 1st Grade: Simple actions, basic concepts
      easy: [
        `${characterName} and the ${secondaryCharacter} walk together.`, 
        `"Let us find something good!" says ${characterName}.`
      ],
      // 2nd-3rd Grade: Clear plot development, simple adventures
      medium: [
        `${characterName} and the ${secondaryCharacter} began exploring the magical forest together, looking for hidden treasures.`, 
        `The ${secondaryCharacter} showed ${characterName} secret paths where flowers glowed softly in the shade.`
      ],
      // 4th-5th Grade: Complex plots, character relationships
      hard: [
        `As they ventured deeper into the enchanted woodland, the ${secondaryCharacter} confided in ${characterName} about an ancient mystery that had puzzled forest creatures for generations.`, 
        `${characterName} listened carefully as their new companion explained how the delicate balance of their magical world depended on finding something precious that had been lost long ago.`
      ],
      // 6th-12th Grade: Sophisticated themes, psychological depth
      expert: [
        `"Understanding," the ${secondaryCharacter} mused as they walked, "is not simply about solving puzzles or finding lost objects—it is about recognizing the interconnectedness of all living things and accepting responsibility for the role we play in the larger tapestry of existence."`, 
        `${characterName} began to comprehend that this journey would demand more than physical courage; it would require the emotional maturity to confront uncomfortable truths about the nature of sacrifice, loyalty, and the sometimes painful necessity of personal growth.`
      ]
    };
    
    const templates = adventureTemplates[difficulty] || adventureTemplates.medium;
    return templates[Math.min(pageIndex, templates.length - 1)];
  }
  
  private static generateClimaxContent(
    pageIndex: number, 
    characterName: string, 
    secondaryCharacter: string, 
    userInfo: UserInfo, 
    difficulty: DifficultyLevel
  ): string {
    
    const climaxTemplates = {
      // Pre-K to 1st Grade: Simple resolution, clear success
      easy: `${characterName} finds it! "We did it!" they say happily.`,
      // 2nd-3rd Grade: Clear problem-solving, teamwork
      medium: `Working together with great teamwork, ${characterName} and the ${secondaryCharacter} finally solved the mystery that had been puzzling everyone for so long.`,
      // 4th-5th Grade: Internal growth, complex problem-solving
      hard: `In a moment of brilliant insight, ${characterName} realized that the solution had been within their reach all along—it just required looking at the problem from a completely different perspective and trusting in their own abilities.`,
      // 6th-12th Grade: Philosophical resolution, character transformation
      expert: `The epiphany arrived not as a sudden flash of understanding, but as a gradual awakening to the profound truth that ${characterName} had been seeking external validation for internal wisdom they already possessed, and that true discovery lies not in finding what is lost, but in recognizing what was never missing.`
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
      // Pre-K to 1st Grade: Simple gratitude, basic emotions
      easy: `"Thank you, ${characterName}!" says the happy ${secondaryCharacter}.`,
      // 2nd-3rd Grade: Friendship celebration, shared joy
      medium: `${characterName} and the ${secondaryCharacter} hugged and danced around with joy, celebrating their amazing adventure and new friendship together.`,
      // 4th-5th Grade: Meaningful bonds, personal growth
      hard: `As they shared this moment of triumph, ${characterName} understood that they had gained something far more valuable than solving a mystery—they had discovered the deep satisfaction that comes from using your talents to help others and formed a friendship that would last forever.`,
      // 6th-12th Grade: Complex emotional resolution, life lessons
      expert: `"You have given me something far more precious than what we sought," the ${secondaryCharacter} reflected with profound gratitude. "You have demonstrated that true courage lies not in the absence of fear, but in choosing compassion despite uncertainty, and in doing so, you have taught me that healing occurs not through solitary strength, but through the vulnerable act of accepting and offering help."`
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
      // Pre-K to 1st Grade: Simple ending, basic emotions
      easy: `${characterName} goes home happy. What a fun day!`,
      // 2nd-3rd Grade: Warm conclusion, lasting friendship
      medium: `As ${characterName} walked home, their heart felt warm and full of happiness from making such a wonderful new friend and having such an amazing adventure.`,
      // 4th-5th Grade: Personal reflection, growth awareness
      hard: `Walking home through the familiar neighborhood that now seemed somehow brighter and more full of possibilities, ${characterName} reflected on how this incredible day had taught them about the power of kindness, the value of helping others, and the joy that comes from stepping outside your comfort zone to make new friends.`,
      // 6th-12th Grade: Deep philosophical reflection, life perspective
      expert: `The journey home felt fundamentally different to ${characterName}—not because the physical landscape had changed, but because they now carried within themselves an expanded understanding of their place in the intricate web of relationships that bind all living beings together, and with this awareness came both the responsibility and the profound privilege of being someone capable of making a meaningful difference in the world.`
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