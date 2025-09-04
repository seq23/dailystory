import type { UserInfo, DifficultyLevel } from '../types';
import { InputEnhancementEngine } from './inputEnhancementEngine';
import { DifficultyLevelMapper } from './DifficultyLevelMapper';

interface RevelationPhase {
  phase: number;
  title: string;
  revealedInputs: string[];
  storyElements: string[];
  characterDevelopment: string[];
  narrativeHooks: string[];
}

interface UserRevelationState {
  currentPhase: number;
  completedPhases: number[];
  revealedElements: Set<string>;
  characterArc: string[];
  storyArc: string[];
}

export class ProgressiveRevelationSystem {
  private static userStates = new Map<string, UserRevelationState>();

  static initializeUserRevelation(userInfo: UserInfo): void {
    const userId = this.getUserId(userInfo);
    
    if (this.userStates.has(userId)) return;

    this.userStates.set(userId, {
      currentPhase: 1,
      completedPhases: [],
      revealedElements: new Set(),
      characterArc: [],
      storyArc: []
    });
  }

  static getNextRevelationPhase(userInfo: UserInfo, storyProgress: number): RevelationPhase {
    const userId = this.getUserId(userInfo);
    this.initializeUserRevelation(userInfo);
    
    const userState = this.userStates.get(userId)!;
    const enhanced = InputEnhancementEngine.enhanceUserInputs(userInfo);
    
    // Determine phase based on story progress
    const phase = this.calculatePhase(storyProgress, DifficultyLevelMapper.toBackend(userInfo.difficultyLevel || 'medium'));
    
    if (phase > userState.currentPhase) {
      userState.currentPhase = phase;
    }

    return this.generateRevelationPhase(phase, userInfo, enhanced, userState);
  }

  private static calculatePhase(storyProgress: number, difficulty: DifficultyLevel): number {
    // Phase calculation based on story progress and difficulty
    if (difficulty === 'hard') {
      // 4 phases for hard difficulty
      if (storyProgress < 25) return 1;
      if (storyProgress < 50) return 2;
      if (storyProgress < 75) return 3;
      return 4;
    } else if (difficulty === 'expert') {
      // 5 phases for expert difficulty
      if (storyProgress < 20) return 1;
      if (storyProgress < 40) return 2;
      if (storyProgress < 60) return 3;
      if (storyProgress < 80) return 4;
      return 5;
    }

    // Default 3 phases
    if (storyProgress < 33) return 1;
    if (storyProgress < 66) return 2;
    return 3;
  }

  private static generateRevelationPhase(
    phase: number,
    userInfo: UserInfo,
    enhanced: any,
    userState: UserRevelationState
  ): RevelationPhase {
    const revelationMap = this.getRevelationMap(userInfo, enhanced);
    const currentRevelation = revelationMap[phase] || revelationMap[1];

    // Track newly revealed elements
    currentRevelation.revealedInputs.forEach(input => {
      userState.revealedElements.add(input);
    });

    // Update character and story arcs
    userState.characterArc.push(...currentRevelation.characterDevelopment);
    userState.storyArc.push(...currentRevelation.storyElements);

    // Mark phase as completed
    if (!userState.completedPhases.includes(phase)) {
      userState.completedPhases.push(phase);
    }

    return currentRevelation;
  }

  private static getRevelationMap(userInfo: UserInfo, enhanced: any): Record<number, RevelationPhase> {
    const difficulty = userInfo.difficultyLevel || 'medium';

    if (difficulty === 'hard') {
      return this.getHardDifficultyRevelationMap(userInfo, enhanced);
    } else if (difficulty === 'expert') {
      return this.getExpertDifficultyRevelationMap(userInfo, enhanced);
    }

    // Default medium difficulty revelation map
    return {
      1: {
        phase: 1,
        title: "The Journey Begins",
        revealedInputs: [userInfo.favoriteColor],
        storyElements: [
          `${userInfo.name} discovers something special about the color ${userInfo.favoriteColor}`,
          `The ${userInfo.favoriteColor} light leads to adventure`
        ],
        characterDevelopment: [
          `${userInfo.name} shows preference for ${userInfo.favoriteColor} things`,
          `Others notice ${userInfo.name}'s unique style`
        ],
        narrativeHooks: [
          `Why does ${userInfo.favoriteColor} seem to call to ${userInfo.name}?`,
          `What secrets does this color hold?`
        ]
      },
      2: {
        phase: 2,
        title: "Unexpected Allies",
        revealedInputs: [userInfo.favoriteAnimal],
        storyElements: [
          `A ${userInfo.favoriteAnimal} appears and seems to understand ${userInfo.name}`,
          `The ${userInfo.favoriteAnimal} becomes ${userInfo.name}'s guide`
        ],
        characterDevelopment: [
          `${userInfo.name} reveals a special connection with ${userInfo.favoriteAnimal}s`,
          `This bond proves stronger than anyone expected`
        ],
        narrativeHooks: [
          `How can ${userInfo.name} communicate with the ${userInfo.favoriteAnimal}?`,
          `What ancient connection do they share?`
        ]
      },
      3: {
        phase: 3,
        title: "Hidden Talents",
        revealedInputs: [userInfo.hobbies, userInfo.favoriteFood],
        storyElements: [
          `${userInfo.name}'s skill in ${userInfo.hobbies} becomes crucial`,
          `Sharing ${userInfo.favoriteFood} creates unexpected friendships`
        ],
        characterDevelopment: [
          `${userInfo.name} discovers hidden depths in familiar interests`,
          `What seemed ordinary becomes extraordinary`
        ],
        narrativeHooks: [
          `How do ${userInfo.name}'s hobbies hold the key to solving the mystery?`,
          `What power lies in simple acts of sharing?`
        ]
      }
    };
  }

  private static getHardDifficultyRevelationMap(userInfo: UserInfo, enhanced: any): Record<number, RevelationPhase> {
    return {
      1: {
        phase: 1,
        title: "The Awakening",
        revealedInputs: [userInfo.favoriteColor],
        storyElements: [
          `${userInfo.name} perceives ${userInfo.favoriteColor} differently than others`,
          `This unique perception hints at a deeper connection to the world`
        ],
        characterDevelopment: [
          `${userInfo.name} begins to question ordinary assumptions`,
          `A sense of being different, but not understanding why`
        ],
        narrativeHooks: [
          `What does it mean to see ${userInfo.favoriteColor} as ${userInfo.name} does?`,
          `Is this gift or burden?`
        ]
      },
      2: {
        phase: 2,
        title: "The Catalyst",
        revealedInputs: [userInfo.favoriteAnimal],
        storyElements: [
          `The ${userInfo.favoriteAnimal} appears not as pet, but as messenger`,
          `Ancient wisdom flows through the connection with ${userInfo.favoriteAnimal}s`
        ],
        characterDevelopment: [
          `${userInfo.name} accepts responsibility for this unique gift`,
          `Understanding that some abilities come with obligations`
        ],
        narrativeHooks: [
          `What message does the ${userInfo.favoriteAnimal} bring?`,
          `How far back does this connection extend?`
        ]
      },
      3: {
        phase: 3,
        title: "The Test",
        revealedInputs: [userInfo.hobbies],
        storyElements: [
          `${userInfo.name}'s passion for ${userInfo.hobbies} reveals its true purpose`,
          `Skills developed for joy become tools for greater good`
        ],
        characterDevelopment: [
          `${userInfo.name} faces moral complexity in using abilities`,
          `Learning that power requires wisdom and restraint`
        ],
        narrativeHooks: [
          `When does talent become responsibility?`,
          `How does ${userInfo.name} balance personal desire with duty?`
        ]
      },
      4: {
        phase: 4,
        title: "The Integration",
        revealedInputs: [userInfo.favoriteFood, userInfo.specialRequest],
        storyElements: [
          `The simple act of sharing ${userInfo.favoriteFood} becomes profound ritual`,
          `${userInfo.name}'s special interests reveal their ultimate significance`
        ],
        characterDevelopment: [
          `${userInfo.name} integrates all aspects of identity into unified purpose`,
          `Understanding that every preference and passion has meaning`
        ],
        narrativeHooks: [
          `How do all the pieces of ${userInfo.name}'s identity connect?`,
          `What is the greater pattern being revealed?`
        ]
      }
    };
  }

  private static getExpertDifficultyRevelationMap(userInfo: UserInfo, enhanced: any): Record<number, RevelationPhase> {
    return {
      1: {
        phase: 1,
        title: "Paradigm Recognition",
        revealedInputs: [userInfo.favoriteColor],
        storyElements: [
          `${userInfo.name} discovers that ${userInfo.favoriteColor} represents a fundamental force`,
          `Color becomes metaphor for understanding reality's deeper layers`
        ],
        characterDevelopment: [
          `${userInfo.name} develops meta-cognitive awareness`,
          `Questioning the nature of perception itself`
        ],
        narrativeHooks: [
          `If color is subjective, what other 'truths' might be illusions?`,
          `How does ${userInfo.name}'s perception shape reality?`
        ]
      },
      2: {
        phase: 2,
        title: "Systemic Understanding",
        revealedInputs: [userInfo.favoriteAnimal],
        storyElements: [
          `The ${userInfo.favoriteAnimal} represents an entire ecosystem of relationships`,
          `${userInfo.name} learns about interconnectedness and emergent properties`
        ],
        characterDevelopment: [
          `${userInfo.name} develops systems thinking`,
          `Understanding how individual actions ripple through networks`
        ],
        narrativeHooks: [
          `How does caring for one ${userInfo.favoriteAnimal} affect the whole web of life?`,
          `What responsibilities come with understanding interconnection?`
        ]
      },
      3: {
        phase: 3,
        title: "Skill as Philosophy",
        revealedInputs: [userInfo.hobbies],
        storyElements: [
          `${userInfo.name}'s practice of ${userInfo.hobbies} becomes a way of understanding existence`,
          `Technical skill transforms into philosophical insight`
        ],
        characterDevelopment: [
          `${userInfo.name} embodies the principle that mastery is a form of wisdom`,
          `Learning to see universal patterns through specific practice`
        ],
        narrativeHooks: [
          `How does mastery of ${userInfo.hobbies} reveal universal truths?`,
          `What can dedication to craft teach about life itself?`
        ]
      },
      4: {
        phase: 4,
        title: "Cultural Synthesis",
        revealedInputs: [userInfo.favoriteFood],
        storyElements: [
          `${userInfo.favoriteFood} becomes a bridge between cultures and perspectives`,
          `${userInfo.name} learns that nourishment connects all beings across differences`
        ],
        characterDevelopment: [
          `${userInfo.name} develops cultural competency and empathy`,
          `Understanding diversity as strength rather than division`
        ],
        narrativeHooks: [
          `How does sharing food create understanding across differences?`,
          `What does it mean to truly nourish another being?`
        ]
      },
      5: {
        phase: 5,
        title: "Purposeful Integration",
        revealedInputs: [userInfo.specialRequest],
        storyElements: [
          `${userInfo.name}'s unique interests and special requests reveal their role in a larger purpose`,
          `Individual passion becomes service to community and world`
        ],
        characterDevelopment: [
          `${userInfo.name} integrates personal fulfillment with social contribution`,
          `Finding meaning through the synthesis of self-actualization and service`
        ],
        narrativeHooks: [
          `How does following your passion serve the greater good?`,
          `What is the relationship between individual growth and collective flourishing?`
        ]
      }
    };
  }

  static getUserRevelationState(userInfo: UserInfo): UserRevelationState | null {
    const userId = this.getUserId(userInfo);
    return this.userStates.get(userId) || null;
  }

  static getRevealedElements(userInfo: UserInfo): string[] {
    const userId = this.getUserId(userInfo);
    const state = this.userStates.get(userId);
    return state ? Array.from(state.revealedElements) : [];
  }

  static getCharacterArc(userInfo: UserInfo): string[] {
    const userId = this.getUserId(userInfo);
    const state = this.userStates.get(userId);
    return state ? [...state.characterArc] : [];
  }

  static getStoryArc(userInfo: UserInfo): string[] {
    const userId = this.getUserId(userInfo);
    const state = this.userStates.get(userId);
    return state ? [...state.storyArc] : [];
  }

  static resetUserProgress(userInfo: UserInfo): void {
    const userId = this.getUserId(userInfo);
    this.userStates.delete(userId);
  }

  private static getUserId(userInfo: UserInfo): string {
    return `${userInfo.name}-${userInfo.age}-${userInfo.nativeLanguage}`.toLowerCase();
  }

  static getProgressiveStoryTemplate(userInfo: UserInfo, phase: RevelationPhase, storyProgress: number): string {
    const difficulty = userInfo.difficultyLevel || 'medium';
    
    if (difficulty === 'expert') {
      return this.getExpertStoryTemplate(userInfo, phase, storyProgress);
    } else if (difficulty === 'hard') {
      return this.getHardStoryTemplate(userInfo, phase, storyProgress);
    }

    // Default template
    return this.getMediumStoryTemplate(userInfo, phase, storyProgress);
  }

  private static getMediumStoryTemplate(userInfo: UserInfo, phase: RevelationPhase, storyProgress: number): string {
    const templates = [
      `As ${userInfo.name} continues the journey, ${phase.storyElements[0]}. ${phase.characterDevelopment[0]}. This discovery raises the question: ${phase.narrativeHooks[0]}`,
      `${userInfo.name} learns that ${phase.storyElements[1] || phase.storyElements[0]}. ${phase.characterDevelopment[1] || phase.characterDevelopment[0]}. ${phase.narrativeHooks[1] || phase.narrativeHooks[0]}`,
      `In this part of the adventure, ${userInfo.name} must face the truth about ${phase.revealedInputs.join(' and ')}. ${phase.storyElements[0]} The journey is far from over.`
    ];

    return templates[Math.floor(storyProgress / 33) % templates.length];
  }

  private static getHardStoryTemplate(userInfo: UserInfo, phase: RevelationPhase, storyProgress: number): string {
    return `${userInfo.name} stands at a crossroads where ${phase.storyElements[0]}. The revelation about ${phase.revealedInputs.join(' and ')} forces a deeper examination of ${phase.characterDevelopment[0]}. ${phase.narrativeHooks[0]} The answer will determine not just ${userInfo.name}'s path, but the fate of all who depend on this choice.`;
  }

  private static getExpertStoryTemplate(userInfo: UserInfo, phase: RevelationPhase, storyProgress: number): string {
    return `In a moment of profound realization, ${userInfo.name} understands that ${phase.storyElements[0]}. This understanding transforms the meaning of ${phase.revealedInputs.join(', ')}, revealing that ${phase.characterDevelopment[0]}. The central question—${phase.narrativeHooks[0]}—becomes not just a puzzle to solve, but a fundamental inquiry into the nature of existence itself. ${userInfo.name}'s response will echo through dimensions of meaning yet unexplored.`;
  }
}