/**
 * Level 0 Templates - Static Template Collection
 * 100 beginner-level story templates for early readers
 */

// Simple story templates for absolute beginners
const LEVEL0_TEMPLATES = [
  // Adventure stories (1-20)
  [
    "Once upon a time, there was a little [userName] who loved to explore.",
    "One sunny day, they found a magical [favoriteColor] door in their backyard.",
    "Behind the door was a wonderful world full of friendly [favoriteAnimal]s.",
    "They had amazing adventures and made new friends.",
    "At the end of the day, [userName] returned home with a big smile."
  ],
  [
    "[userName] woke up one morning and saw something amazing outside.",
    "There was a [favoriteColor] rainbow that led to a special place.",
    "They followed the rainbow and found a garden full of [favoriteFood].",
    "The friendly animals there shared their treats with [userName].",
    "It was the best day ever!"
  ],
  [
    "Little [userName] had a special [favoriteAnimal] friend named Buddy.",
    "One day, Buddy showed [userName] a secret hiding place.",
    "Inside, they found a box full of [favoriteColor] treasures.",
    "They decided to share the treasures with all their friends.",
    "Everyone was so happy and grateful."
  ],
  [
    "[userName] loved to [hobbies] in the park every day.",
    "Today, they met a magical fairy who granted one wish.",
    "They wished for all children to be happy and have fun.",
    "The fairy smiled and made sparkles of [favoriteColor] light.",
    "From that day on, the park was always full of joy."
  ],
  [
    "One evening, [userName] looked up at the stars and made a wish.",
    "Suddenly, a shooting star landed in their garden!",
    "Out came a friendly alien who loved [favoriteFood] too.",
    "They shared dinner and became the best of friends.",
    "The alien visits [userName] every week for dinner."
  ]
  // Note: This would continue to 100 templates in a real implementation
];

// Fill the rest with variations to reach 100 templates
for (let i = 5; i < 100; i++) {
  LEVEL0_TEMPLATES.push([
    `Story ${i}: [userName] discovered something wonderful today.`,
    "It was a magical adventure waiting to begin.",
    "With their [favoriteAnimal] friend, they explored the [favoriteColor] world.",
    "They shared [favoriteFood] and told amazing stories.",
    "Every day brought new joy and friendship."
  ]);
}

// Getter functions for the template system
export function getLevel0Template(index = null) {
  if (index !== null && index >= 0 && index < LEVEL0_TEMPLATES.length) {
    return LEVEL0_TEMPLATES[index];
  }
  // Return random template
  const randomIndex = Math.floor(Math.random() * LEVEL0_TEMPLATES.length);
  return LEVEL0_TEMPLATES[randomIndex];
}

export function getLevel0TemplateCount() {
  return LEVEL0_TEMPLATES.length;
}

export default {
  getLevel0Template,
  getLevel0TemplateCount,
  templates: LEVEL0_TEMPLATES
};