// Level 1 Templates - Enhanced with proper word counts
// 2-3 sentences per page (40-60 words per scene)
// For ages 5-7, 1st-2nd grade reading level

import { StoryTemplate } from '../storyTemplateTypes';

export const LEVEL_1_TEMPLATES: StoryTemplate[] = [
  {
    title: "The Magical Garden Discovery",
    theme: "Magic & Nature",
    level: "Level 1",
    scenes: [
      {
        text: "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
        pause: true,
        hook: "What magical creatures might live in this garden?",
        microVariants: {
          text: "{userName} discovers a magical garden behind their house. The flowers sparkle with rainbow colors in the bright sunlight.",
          alternatives: ["Behind the house, {userName} finds an enchanted garden.", "A secret garden appears to {userName} with glowing flowers."],
          optionalDetails: ["butterflies dance around the flowers", "a gentle breeze carries sweet perfume"]
        }
      },
      {
        text: "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
        pause: true,
        hook: "What will the fairy show {userName} next?",
        microVariants: {
          text: "A tiny fairy appears from behind a rose bush. She waves her wand and makes the butterflies dance around {userName}.",
          alternatives: ["From the roses, a small fairy emerges with a sparkling wand.", "A magical fairy greets {userName} from her flower home."],
          optionalDetails: ["her wings shimmer like diamonds", "she speaks in a musical voice"]
        }
      },
      {
        text: "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
        pause: true,
        hook: "What other magical surprises await in the garden?",
        microVariants: {
          text: "{userName} follows the fairy deeper into the garden. They find a crystal fountain with water that tastes like {favoriteFood}.",
          alternatives: ["The fairy leads {userName} to a magical crystal fountain.", "Together they discover a fountain of sweet, magical water."],
          optionalDetails: ["the fountain sparkles in the sunlight", "rainbow fish swim in the crystal water"]
        }
      },
      {
        text: "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
        pause: true,
        hook: "What special gift will the fairy give {userName}?",
        microVariants: {
          text: "The fairy shows {userName} how to make flower crowns. Together they create beautiful crowns from the magical blooms.",
          alternatives: ["They weave flowers into beautiful, magical crowns.", "The fairy teaches {userName} to craft crowns from enchanted petals."],
          optionalDetails: ["the crowns glow with soft light", "each flower has a different magical power"]
        }
      },
      {
        text: "{userName} promises to visit the fairy garden every day. The fairy gives them a special seed to plant at home.",
        pause: false,
        hook: "What will grow from this magical seed?",
        microVariants: {
          text: "{userName} promises to visit the fairy garden every day. The fairy gives them a special seed to plant at home.",
          alternatives: ["The fairy gifts {userName} a magical seed before they leave.", "With a promise to return, {userName} receives a special growing gift."],
          optionalDetails: ["the seed glows with inner light", "it feels warm and tingly in their hand"]
        }
      }
    ],
    endings: [
      {
        type: 'cozy',
        text: "{userName} plants the magical seed in their own garden and watches it grow into something wonderful.",
        microVariants: ["The seed grows into a bridge between the two gardens.", "A new fairy home sprouts from the magical seed."]
      },
      {
        type: 'triumphant',
        text: "{userName} becomes the garden's official human helper, protecting all the magical creatures.",
        microVariants: ["The fairy declares {userName} the guardian of garden magic.", "{userName} earns their own set of magical gardening tools."]
      }
    ],
    reuse: {
      swappableElements: {
        "fairy": ["pixie", "sprite", "nature spirit", "garden guardian"],
        "fountain": ["pond", "stream", "waterfall", "spring"],
        "crown": ["necklace", "bracelet", "ring", "headband"]
      },
      weatherVariants: ["on a sunny morning", "during a gentle rain", "at golden sunset", "under starlight"],
      settingVariants: ["backyard", "school garden", "park", "grandmother's house"]
    }
  }
];

export function getLevel1Template(templateIndex?: number): StoryTemplate {
  if (templateIndex !== undefined && templateIndex >= 0 && templateIndex < LEVEL_1_TEMPLATES.length) {
    return LEVEL_1_TEMPLATES[templateIndex];
  }
  const randomIndex = Math.floor(Math.random() * LEVEL_1_TEMPLATES.length);
  return LEVEL_1_TEMPLATES[randomIndex];
}

export function getLevel1TemplateCount(): number {
  return LEVEL_1_TEMPLATES.length;
}