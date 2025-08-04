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
            "{name} discovered something magical in the {setting} today.",
            "Every morning {name} loved exploring the beautiful {setting} nearby.",
            "One special day {name} noticed something different and exciting.",
            "The {animal} appeared suddenly near {name} with bright eyes.",
            "{name} felt curious about the mysterious sounds coming closer."
          ],
          development: [
            "Together they explored the hidden secrets of the forest.",
            "The {animal} showed {name} how to solve this puzzle.",
            "They worked together to overcome each challenging obstacle ahead.",
            "Each step revealed more wonderful surprises than before.",
            "The adventure taught them important lessons about friendship."
          ],
          resolution: [
            "{name} learned that friendship makes everything better in life.",
            "They promised to meet here every week for adventures.",
            "The magical day ended with both feeling grateful.",
            "From that day forward they were inseparable best friends.",
            "{name} went home knowing this was just the beginning."
          ]
        };

      case 'hard':
        return {
          setup: [
            "{name} had always wondered about the ancient mysteries hidden in {setting}.",
            "Growing up in the peaceful {setting}, {name} felt ready for adventure.",
            "The day everything changed began like any other ordinary morning for {name}.",
            "Local legends spoke of a {animal} guardian who protected ancient secrets.",
            "{name} felt an inexplicable pull toward the unexplored regions of {setting}."
          ],
          development: [
            "The quest required courage, wisdom, and determination that {name} didn't know existed.",
            "Each challenge revealed new strengths and abilities that surprised even {name}.",
            "Working alongside the wise {animal}, they uncovered layers of hidden knowledge.",
            "The journey tested not just physical abilities but character and moral convictions.",
            "Through adversity, {name} discovered that true strength comes from helping others."
          ],
          resolution: [
            "{name} returned home transformed by experiences that would guide future decisions.",
            "The knowledge gained became a gift that {name} would share with others.",
            "From that adventure forward, {name} approached life with newfound wisdom and purpose.",
            "The bond formed with {animal} created a lifelong friendship based on mutual respect.",
            "{name} understood that every ending becomes the beginning of something even greater."
          ]
        };

      case 'expert':
        return {
          setup: [
            "{name} contemplated the profound interconnectedness of all living things in the vast universe.",
            "Throughout childhood, {name} had always questioned fundamental principles governing existence and meaning.",
            "The philosophical journey began when {name} encountered ideas that challenged conventional understanding.",
            "Ancient wisdom traditions spoke of a enlightened {animal} who possessed transcendent knowledge.",
            "{name} felt compelled to explore these deeper questions about purpose, consciousness, and reality."
          ],
          development: [
            "The exploration revealed that true understanding emerges through synthesis of diverse perspectives and experiences.",
            "Each philosophical insight built upon previous discoveries, creating an integrated worldview of remarkable depth.",
            "Dialogue with the wise {animal} illuminated connections between scientific knowledge and spiritual wisdom.",
            "The journey required intellectual humility and openness to paradigms that transcended linear thinking.",
            "Through contemplation and dialogue, {name} developed profound appreciation for the complexity of existence."
          ],
          resolution: [
            "{name} integrated these insights into a coherent philosophy emphasizing compassion, wisdom, and service to others.",
            "The transformation culminated in {name} becoming a bridge between different traditions and ways of knowing.",
            "Understanding that knowledge without compassion remains incomplete, {name} committed to serving the greater good.",
            "The relationship with {animal} evolved into a partnership dedicated to sharing wisdom with future generations.",
            "{name} realized that the greatest discoveries involve recognizing the profound mystery and beauty of existence itself."
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
    
    // Replace story elements with variety - use Level 1 vocabulary for easy difficulty
    const animals = difficulty === 'easy' 
      ? ['cat', 'dog', 'bird', 'fish', 'cow', 'pig', 'duck', 'hen', 'bee', 'bear', 'fox', 'frog']
      : ['cat', 'rabbit', 'owl', 'deer', 'fox', 'turtle', 'butterfly', 'bird'];
    const settings = difficulty === 'easy'
      ? ['home', 'park', 'yard', 'farm', 'zoo', 'garden']
      : ['forest', 'garden', 'meadow', 'library', 'park', 'village'];
    const objects = difficulty === 'easy'
      ? ['ball', 'book', 'toy', 'cake', 'hat', 'cup']
      : ['key', 'book', 'gem', 'flower', 'stone', 'shell'];
    const colors = difficulty === 'easy'
      ? ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'brown']
      : ['golden', 'silver', 'emerald', 'azure', 'crimson', 'violet'];
    
    processed = processed.replace(/{animal}/g, animals[Math.floor(Math.random() * animals.length)]);
    processed = processed.replace(/{setting}/g, settings[Math.floor(Math.random() * settings.length)]);
    processed = processed.replace(/{object}/g, objects[Math.floor(Math.random() * objects.length)]);
    processed = processed.replace(/{color}/g, colors[Math.floor(Math.random() * colors.length)]);
    
    return processed;
  }
}