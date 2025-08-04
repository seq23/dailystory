// Story Arc Manager - Provides narrative structure for children's book patterns
import type { DifficultyLevel, UserInfo } from "@/types";

export interface StoryArc {
  setup: string[];
  development: string[];
  resolution: string[];
}

export class StoryArcManager {
  /**
   * Get template based on story position (setup, development, resolution)
   */
  static getTemplateByPosition(
    userInfo: UserInfo,
    difficulty: DifficultyLevel,
    pageIndex: number,
    totalPages: number
  ): string {
    const position = this.getStoryPosition(pageIndex, totalPages);
    const templates = this.getArcTemplates(difficulty);
    
    const positionTemplates = templates[position];
    const selectedTemplate = positionTemplates[Math.floor(Math.random() * positionTemplates.length)];
    
    return this.processTemplate(selectedTemplate, userInfo, difficulty);
  }

  /**
   * Determine story position based on page index
   */
  private static getStoryPosition(pageIndex: number, totalPages: number): keyof StoryArc {
    const progress = pageIndex / totalPages;
    
    if (progress < 0.3) return 'setup';
    if (progress < 0.8) return 'development';
    return 'resolution';
  }

  /**
   * Get story arc templates for each difficulty level
   */
  private static getArcTemplates(difficulty: DifficultyLevel): StoryArc {
    switch (difficulty) {
      case 'easy':
        return {
          setup: [
            "{name} sees a {animal}.",
            "{name} says hello.",
            "The {animal} is {color}.",
            "{name} wants to play.",
            "The sun is hot."
          ],
          development: [
            "{name} and {animal} play.",
            "They run fast.",
            "The {animal} shows {name} fun.",
            "They go to the park.",
            "They play ball."
          ],
          resolution: [
            "{name} feels happy.",
            "They are good friends.",
            "What a fun day.",
            "{name} likes the {animal}.",
            "They will play more."
          ]
        };

      case 'medium':
        return {
          setup: [
            "{name} found something special in the {setting}.",
            "{name} loved exploring near the {setting}.",
            "One day {name} saw something new and exciting.",
            "A {animal} came near {name} with bright eyes.",
            "{name} heard mysterious sounds getting closer."
          ],
          development: [
            "Together they looked for hidden things in the forest.",
            "The {animal} showed {name} how to solve a puzzle.",
            "They worked together to get past each problem.",
            "Each step showed them more wonderful surprises.",
            "The adventure taught them about being good friends."
          ],
          resolution: [
            "{name} learned that friends make everything better.",
            "They promised to meet here every week.",
            "The special day ended with both feeling happy.",
            "From that day they were best friends forever.",
            "{name} went home knowing this was just starting."
          ]
        };

      case 'hard':
        return {
          setup: [
            "{name} had always wondered about the old mysteries in {setting}.",
            "Growing up near the peaceful {setting}, {name} felt ready for adventure.",
            "The day everything changed started like any normal morning.",
            "Local stories told of a {animal} guardian protecting old secrets.",
            "{name} felt pulled toward the unexplored parts of {setting}."
          ],
          development: [
            "The quest needed courage and wisdom that {name} didn't know existed.",
            "Each challenge showed new strengths that surprised {name}.",
            "Working with the wise {animal}, they found hidden knowledge.",
            "The journey tested both physical abilities and moral character.",
            "Through hard times, {name} learned that helping others makes you strong."
          ],
          resolution: [
            "{name} came home changed by experiences that would guide future choices.",
            "The knowledge gained became something {name} would share with others.",
            "From that adventure on, {name} approached life with new wisdom.",
            "The friendship with {animal} became lifelong, based on respect.",
            "{name} understood that every ending starts something even better."
          ]
        };

      case 'expert':
        return {
          setup: [
            "{name} loved learning about how all living things connect in nature.",
            "Since childhood, {name} had always asked deep questions about life and meaning.",
            "The learning journey began when {name} met ideas that changed everything.",
            "Ancient stories told of a wise {animal} who knew special knowledge.",
            "{name} felt drawn to explore these deeper questions about purpose and reality."
          ],
          development: [
            "The exploration showed that real understanding comes from many different viewpoints and experiences.",
            "Each new insight built on earlier discoveries, creating a rich understanding.",
            "Talking with the wise {animal} connected science knowledge with wisdom about life.",
            "The journey needed an open mind and willingness to think in new ways.",
            "Through thinking and talking, {name} gained deep appreciation for life's complexity."
          ],
          resolution: [
            "{name} combined these insights into a life philosophy focused on kindness, wisdom, and helping others.",
            "The change led to {name} becoming a bridge between different ways of thinking.",
            "Understanding that knowledge without kindness is incomplete, {name} committed to serving others.",
            "The relationship with {animal} became a partnership dedicated to sharing wisdom with future generations.",
            "{name} realized that the greatest discoveries involve recognizing the mystery and beauty of life itself."
          ]
        };

      default:
        return this.getArcTemplates('medium');
    }
  }

  /**
   * Process template with user information
   */
  private static processTemplate(template: string, userInfo: UserInfo, difficulty: DifficultyLevel): string {
    let processed = template;
    
    // Replace user placeholders
    processed = processed.replace(/{name}/g, userInfo.name || 'Alex');
    processed = processed.replace(/{pronoun}/g, 'they');
    processed = processed.replace(/{pronoun_possessive}/g, 'their');
    
    // Replace story elements with vocabulary appropriate for each difficulty level
    const animals = difficulty === 'easy' 
      ? ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bear', 'fox', 'frog']
      : difficulty === 'medium'
      ? ['cat', 'rabbit', 'owl', 'deer', 'fox', 'turtle', 'butterfly', 'bird', 'squirrel', 'mouse']
      : difficulty === 'hard'
      ? ['wolf', 'eagle', 'panther', 'raven', 'falcon', 'lynx', 'phoenix', 'dragon', 'griffin', 'sphinx']
      : ['phoenix', 'dragon', 'sphinx', 'leviathan', 'chimera', 'pegasus', 'unicorn', 'basilisk'];
      
    const settings = difficulty === 'easy'
      ? ['home', 'park', 'yard', 'farm', 'zoo', 'garden']
      : difficulty === 'medium'
      ? ['forest', 'garden', 'meadow', 'library', 'park', 'village', 'castle', 'tower']
      : difficulty === 'hard'
      ? ['ancient forest', 'mystical realm', 'forgotten kingdom', 'sacred temple', 'crystal cavern', 'enchanted valley']
      : ['interdimensional nexus', 'cosmic observatory', 'ethereal plane', 'quantum realm', 'astral dimension'];
      
    const objects = difficulty === 'easy'
      ? ['ball', 'book', 'toy', 'cake', 'hat', 'cup']
      : difficulty === 'medium'
      ? ['key', 'book', 'gem', 'flower', 'stone', 'shell', 'treasure', 'crown']
      : difficulty === 'hard'
      ? ['ancient relic', 'mystical artifact', 'enchanted scroll', 'crystal orb', 'magic amulet', 'sacred tome']
      : ['philosophical codex', 'temporal device', 'consciousness matrix', 'wisdom catalyst', 'enlightenment key'];
      
    const colors = difficulty === 'easy'
      ? ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown']
      : difficulty === 'medium'
      ? ['golden', 'silver', 'emerald', 'sapphire', 'crimson', 'violet', 'amber', 'turquoise']
      : difficulty === 'hard'
      ? ['iridescent', 'luminescent', 'opalescent', 'prismatic', 'chromatic', 'incandescent']
      : ['transcendent', 'ethereal', 'celestial', 'cosmic', 'infinite', 'multidimensional'];
    
    processed = processed.replace(/{animal}/g, animals[Math.floor(Math.random() * animals.length)]);
    processed = processed.replace(/{setting}/g, settings[Math.floor(Math.random() * settings.length)]);
    processed = processed.replace(/{object}/g, objects[Math.floor(Math.random() * objects.length)]);
    processed = processed.replace(/{color}/g, colors[Math.floor(Math.random() * colors.length)]);
    
    return processed;
  }
}