import type { UserInfo, DifficultyLevel } from "@/types";
import CulturalAdaptationService from "./culturalAdaptationService";

interface StoryTemplate {
  introduction: string;
  adventure: string[];
  resolution: string;
}

export class ImprovedStoryGenerator {
  
  static generateStory(userInfo: UserInfo, difficulty: DifficultyLevel, pageCount: number = 10): string[] {
    const characterName = userInfo.name?.trim() || 'Alex';
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase()?.trim() || 'cat';
    
    // Determine correct pronouns based on avatar selection
    const pronouns = this.getPronounsFromAvatar(userInfo.avatar?.type);
    
    // Get cultural context for appropriate content
    const culturalContext = CulturalAdaptationService.getCulturalContext(userInfo.nativeLanguage || 'en');
    
    // Create story template based on difficulty
    const template = this.createStoryTemplate(characterName, favoriteAnimal, difficulty, culturalContext, pronouns);
    
    // Generate pages ensuring no repetition
    const pages = this.generateUniquePages(template, pageCount, difficulty, pronouns);
    
    return pages;
  }

  // Get correct pronouns based on avatar type
  private static getPronounsFromAvatar(avatarType?: string): { subject: string, object: string, possessive: string } {
    switch (avatarType) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }
  
  private static createStoryTemplate(
    characterName: string, 
    favoriteAnimal: string, 
    difficulty: DifficultyLevel,
    culturalContext: any,
    pronouns: { subject: string, object: string, possessive: string }
  ): StoryTemplate {
    
    // Simple, clear story structures by difficulty
    switch (difficulty) {
      case 'easy':
        return {
          introduction: `${characterName} was playing in the garden when ${pronouns.subject} heard a sound.`,
          adventure: [
            `${characterName} looked around and saw a ${favoriteAnimal}.`,
            `The ${favoriteAnimal} looked friendly and came closer.`,
            `${characterName} and the ${favoriteAnimal} became friends.`,
            `${pronouns.subject} played together in the sunshine.`,
            `The ${favoriteAnimal} showed ${characterName} a special place.`,
            `${pronouns.subject} found beautiful flowers there.`,
            `${characterName} picked some flowers to take home.`,
            `The ${favoriteAnimal} helped carry them.`
          ],
          resolution: `${characterName} thanked ${pronouns.possessive} new friend and went home happy.`
        };
        
      case 'medium':
        return {
          introduction: `${characterName} was exploring the forest when ${pronouns.subject} discovered something amazing.`,
          adventure: [
            `A wise ${favoriteAnimal} appeared from behind a tree.`,
            `The ${favoriteAnimal} had a special message for ${characterName}.`,
            `"Follow me," said the ${favoriteAnimal} with a gentle voice.`,
            `${pronouns.subject} walked through a path covered with golden leaves.`,
            `Soon ${pronouns.subject} reached a crystal-clear stream.`,
            `The ${favoriteAnimal} showed ${characterName} how the water sparkled.`,
            `${characterName} learned about the magic of nature.`,
            `Together ${pronouns.subject} watched the sunset paint the sky.`
          ],
          resolution: `${characterName} promised to visit ${pronouns.possessive} wise friend again soon.`
        };
        
      case 'hard':
        return {
          introduction: `${characterName} had always wondered about the mysterious sounds coming from the old forest.`,
          adventure: [
            `One morning, ${characterName} decided to investigate the strange noises.`,
            `Deep in the forest, ${pronouns.subject} encountered a magnificent ${favoriteAnimal}.`,
            `The ${favoriteAnimal} explained that the forest was in danger.`,
            `"The ancient crystal that protects our home is missing," it said sadly.`,
            `${characterName} volunteered to help search for the crystal.`,
            `${pronouns.subject} followed clues through winding forest paths.`,
            `Together ${pronouns.subject} solved riddles left by forest spirits.`,
            `Finally, ${pronouns.subject} discovered the crystal hidden in a secret cave.`
          ],
          resolution: `${characterName} and the ${favoriteAnimal} restored the crystal, saving the forest forever.`
        };
        
      case 'expert':
        return {
          introduction: `${characterName} had spent months studying the ancient legends of ${pronouns.possessive} homeland.`,
          adventure: [
            `According to the stories, a legendary ${favoriteAnimal} guardian protected the realm.`,
            `${characterName} embarked on a quest to find this mythical creature.`,
            `The journey led through challenging terrain and mysterious landscapes.`,
            `After many days, ${characterName} finally encountered the guardian ${favoriteAnimal}.`,
            `The creature tested ${characterName}'s courage and wisdom.`,
            `${characterName} proved worthy by showing kindness and respect.`,
            `The guardian revealed ancient secrets about the balance of nature.`,
            `Together ${pronouns.subject} worked to restore harmony to the troubled land.`
          ],
          resolution: `${characterName} returned home as a true guardian, carrying the wisdom of ages.`
        };
        
      default:
        return this.createStoryTemplate(characterName, favoriteAnimal, 'easy', culturalContext, pronouns);
    }
  }
  
  private static generateUniquePages(template: StoryTemplate, pageCount: number, difficulty: DifficultyLevel, pronouns: { subject: string, object: string, possessive: string }): string[] {
    const pages: string[] = [];
    
    // Always start with introduction
    pages.push(template.introduction);
    
    // Calculate how many adventure pages we need
    const adventurePageCount = Math.max(1, pageCount - 2); // Leave room for intro and resolution
    
    // Use adventure content, ensuring no repetition
    let adventureIndex = 0;
    for (let i = 1; i < pageCount - 1; i++) {
      if (adventureIndex < template.adventure.length) {
        pages.push(template.adventure[adventureIndex]);
        adventureIndex++;
      } else {
        // If we run out of adventure content, create a transition
        pages.push(this.createTransitionPage(pages[pages.length - 1], difficulty, pronouns));
      }
    }
    
    // Always end with resolution
    if (pageCount > 1) {
      pages.push(template.resolution);
    }
    
    return pages;
  }
  
  private static createTransitionPage(previousPage: string, difficulty: DifficultyLevel, pronouns: { subject: string, object: string, possessive: string }): string {
    // Extract character name from previous page
    const words = previousPage.split(' ');
    const characterName = words.find(word => word.charAt(0) === word.charAt(0).toUpperCase() && word.length > 2) || 'they';
    
    const transitions = {
      easy: [
        `${characterName} smiled and looked around.`,
        `The sun was shining brightly.`,
        `${characterName} felt very happy.`,
        `Everything seemed peaceful and good.`
      ],
      medium: [
        `${characterName} paused to think about what to do next.`,
        `The gentle breeze carried the scent of flowers.`,
        `${characterName} felt grateful for this special moment.`,
        `The adventure was becoming more wonderful.`
      ],
      hard: [
        `${characterName} considered the significance of what had happened.`,
        `The experience had taught ${pronouns.object} something valuable.`,
        `With newfound confidence, ${characterName} prepared for what came next.`,
        `The journey was revealing its deeper purpose.`
      ],
      expert: [
        `${characterName} reflected on the profound nature of ${pronouns.possessive} discovery.`,
        `This moment would be remembered for years to come.`,
        `The wisdom gained would guide ${characterName} in future challenges.`,
        `Understanding began to illuminate the path forward.`
      ]
    };
    
    const options = transitions[difficulty] || transitions.easy;
    return options[Math.floor(Math.random() * options.length)];
  }
}