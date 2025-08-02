import type { UserInfo, DifficultyLevel } from "@/types";
import { validateAndFixGrammar } from '@/utils/grammarValidator';
import StoryQualityChecker from '@/utils/storyQualityChecker';

/**
 * Enhanced Story Generator with Level 4 Complexity Variation (6th-12th grade)
 */
export class EnhancedLevel4StoryGenerator {
  
  /**
   * Generate expert level story with mixed 6th-12th grade complexity
   */
  static generateExpertStory(
    userInfo: UserInfo,
    pageCount: number = 10
  ): string[] {
    const name = userInfo.name?.trim() || 'Alex';
    const pronouns = this.getPronounsFromAvatar(userInfo.avatar?.type);
    const favoriteAnimal = userInfo.favoriteAnimal?.toLowerCase() || 'wolf';
    const favoriteColor = userInfo.favoriteColor?.toLowerCase() || 'silver';
    
    // Mix and match different grade-level complexities within expert level
    const pages = [];
    
    for (let i = 0; i < pageCount; i++) {
      // Cycle through different grade-level writing styles
      const gradeLevel = this.getGradeLevelForPage(i);
      const template = this.getTemplateByGradeLevel(gradeLevel, i, pageCount);
      
      const processedPage = template
        .replace(/\{name\}/g, name)
        .replace(/\{subject\}/g, pronouns.subject)
        .replace(/\{subject_cap\}/g, pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1))
        .replace(/\{object\}/g, pronouns.object)
        .replace(/\{possessive\}/g, pronouns.possessive)
        .replace(/\{color\}/g, favoriteColor)
        .replace(/\{animal\}/g, favoriteAnimal);
      
      pages.push(processedPage);
    }
    
    // Quality check and grammar validation
    return pages.map(page => validateAndFixGrammar(page));
  }
  
  /**
   * Determine grade level complexity for each page (6th, 8th, 10th, 12th)
   */
  private static getGradeLevelForPage(pageIndex: number): 6 | 8 | 10 | 12 {
    const gradeLevels = [6, 8, 10, 12] as const;
    return gradeLevels[pageIndex % 4];
  }
  
  /**
   * Get story templates by specific grade level complexity
   */
  private static getTemplateByGradeLevel(
    gradeLevel: 6 | 8 | 10 | 12, 
    pageIndex: number, 
    totalPages: number
  ): string {
    const position = this.getStoryPosition(pageIndex, totalPages);
    
    const templates = {
      6: { // 6th Grade - Complex sentences, advanced vocabulary
        beginning: [
          "{name} had always questioned the peculiar occurrences that seemed to follow {object} wherever {subject} went.",
          "The mysterious {animal} that appeared during {possessive} dreams was becoming increasingly difficult to ignore.",
          "When the ancient medallion began glowing in {possessive} backpack, {name} realized this was no ordinary day."
        ],
        middle: [
          "The {color} light emanating from the medallion revealed a hidden chamber beneath the old library.",
          "{name} discovered that the {animal} was actually a guardian spirit, bound to protect {object} from an ancient curse.",
          "As {subject} descended into the underground passage, the walls began displaying symbols that pulsed with otherworldly energy.",
          "The {animal} explained that {name} was the chosen descendant of a legendary line of protectors.",
          "Each step forward brought new revelations about {possessive} family's extraordinary history."
        ],
        end: [
          "With the curse finally broken, {name} understood that {possessive} true journey was just beginning.",
          "The {animal} companion would remain by {possessive} side as {subject} learned to master these newfound abilities."
        ]
      },
      
      8: { // 8th Grade - Abstract concepts, complex themes
        beginning: [
          "The concept of destiny had never held much significance for {name} until the morning when reality itself seemed to shift.",
          "Throughout {possessive} life, {name} had struggled with the sensation of being perpetually observed by unseen forces.",
          "The boundary between imagination and reality became increasingly blurred as the {color} {animal} materialized in {possessive} peripheral vision."
        ],
        middle: [
          "What {name} had initially dismissed as coincidence now revealed itself as a carefully orchestrated sequence of events.",
          "The {animal} possessed knowledge that transcended conventional understanding, speaking of realms that existed parallel to their own.",
          "As {name} grappled with these revelations, {subject} began to comprehend the interconnectedness of all living things.",
          "The {color} energy surrounding {object} intensified whenever {subject} approached moments of crucial decision-making.",
          "Each challenge presented an opportunity for {name} to evolve beyond {possessive} current limitations."
        ],
        end: [
          "The transformation within {name} was not merely personal but would ripple through the fabric of both worlds.",
          "Understanding dawned that true power lay not in control, but in harmonious cooperation with the natural order."
        ]
      },
      
      10: { // 10th Grade - Philosophical themes, complex syntax
        beginning: [
          "The existential weight of unanswered questions had been {name}'s constant companion throughout adolescence, until the appearance of the enigmatic {animal} challenged every assumption {subject} held about the nature of reality.",
          "In a world where conformity was considered virtue, {name} found {object}self increasingly alienated by {possessive} ability to perceive the {color} aura that surrounded certain individuals.",
          "The dichotomy between {possessive} rational mind and intuitive understanding created an internal conflict that the mystical {animal} seemed uniquely positioned to resolve."
        ],
        middle: [
          "As {name} delved deeper into the philosophical implications of {possessive} discoveries, {subject} began to question the fundamental assumptions upon which society was built.",
          "The {animal} served as both mentor and mirror, reflecting back to {name} the contradictions inherent in {possessive} worldview.",
          "Through a series of increasingly complex moral dilemmas, {name} learned that wisdom often requires embracing uncertainty rather than seeking absolute answers.",
          "The {color} light that emanated from {possessive} hands during moments of intense concentration suggested abilities that defied scientific explanation.",
          "Each revelation brought with it the recognition that knowledge and responsibility were inextricably linked."
        ],
        end: [
          "The synthesis of logical reasoning and intuitive wisdom transformed {name} into a bridge between two previously incompatible ways of understanding existence.",
          "With the {animal} as guide, {subject} embarked upon a path that would challenge others to reconsider their own limitations."
        ]
      },
      
      12: { // 12th Grade - Advanced literary devices, complex philosophical concepts
        beginning: [
          "The ineffable nature of {name}'s experiences had rendered conventional language inadequate for articulating the profound metamorphosis that {subject} underwent in the presence of the transcendent {animal}, whose very existence challenged the epistemological foundations of {possessive} understanding.",
          "Within the liminal space where consciousness intersects with the collective unconscious, {name} encountered the archetypal {animal}, a manifestation of {possessive} psyche's deepest wisdom and most profound fears.",
          "The phenomenological investigation into {possessive} own subjective experience led {name} to recognize that the {color} luminescence surrounding the {animal} was perhaps less about external reality than about the evolution of {possessive} perceptual apparatus."
        ],
        middle: [
          "As {name} navigated the labyrinthine complexities of {possessive} expanding consciousness, {subject} came to understand that the {animal} represented not merely a guide, but a reflection of {possessive} own potential for transcendence.",
          "The dialectical relationship between {name} and the {animal} created a synthesis that transcended the limitations of either individual perspective, generating new possibilities for understanding the nature of existence itself.",
          "Through the phenomenological reduction of {possessive} experience, {name} began to perceive the essential structures of consciousness that underlie all manifestations of reality.",
          "The hermeneutical circle of interpretation revealed that each encounter with the {animal} simultaneously illuminated and obscured deeper layers of meaning, creating an endless spiral of discovery.",
          "The axiological implications of {name}'s journey extended beyond personal transformation to encompass fundamental questions about the nature of value, meaning, and purpose in human existence."
        ],
        end: [
          "The apotheosis of {name}'s journey was not the attainment of absolute knowledge, but the recognition that wisdom lies in the eternal questioning that drives human consciousness toward ever-greater understanding.",
          "In the final analysis, the {animal} had served as a catalyst for {name}'s recognition that the ultimate truth transcends the dichotomy between subject and object, revealing the fundamental unity that underlies apparent diversity."
        ]
      }
    };
    
    const gradeTemplates = templates[gradeLevel];
    
    if (position === 'beginning') {
      return gradeTemplates.beginning[pageIndex % gradeTemplates.beginning.length];
    } else if (position === 'end') {
      return gradeTemplates.end[pageIndex % gradeTemplates.end.length];
    } else {
      return gradeTemplates.middle[pageIndex % gradeTemplates.middle.length];
    }
  }
  
  /**
   * Determine story position for template selection
   */
  private static getStoryPosition(pageIndex: number, totalPages: number): 'beginning' | 'middle' | 'end' {
    const ratio = pageIndex / totalPages;
    if (ratio < 0.2) return 'beginning';
    if (ratio > 0.8) return 'end';
    return 'middle';
  }
  
  /**
   * Get pronouns based on avatar type
   */
  private static getPronounsFromAvatar(avatarType?: string): {
    subject: string;
    object: string;
    possessive: string;
  } {
    switch (avatarType) {
      case 'boy':
        return { subject: 'he', object: 'him', possessive: 'his' };
      case 'girl':
        return { subject: 'she', object: 'her', possessive: 'her' };
      default:
        return { subject: 'they', object: 'them', possessive: 'their' };
    }
  }
}