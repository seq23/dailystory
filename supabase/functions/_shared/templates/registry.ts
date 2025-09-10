/**
 * Template Registry - Metadata Only (No Template Data)
 * Maps template levels to their individual files and counts
 * Used for on-demand dynamic imports to reduce memory footprint
 */

interface TemplateInfo {
  file?: string;
  title: string;
  theme: string;
}

interface RegistryConfig {
  count: number;
  type: 'static' | 'dynamic';
  path: string;
  B?: number; // Arc length (scenes per arc)
  functions?: {
    getter: string;
    counter: string;
  };
  templates: TemplateInfo[];
}

type TemplateRegistry = Record<string, RegistryConfig>;

export const TEMPLATE_REGISTRY: TemplateRegistry = {
  level0: {
    count: 100,
    type: 'static',
    path: 'level0.js',
    functions: {
      getter: 'getLevel0Template',
      counter: 'getLevel0TemplateCount'
    },
    // Note: No B value - Level 0 excluded from arc processing
    templates: [
      { title: 'Morning Routine', theme: 'daily-life' },
      { title: 'Bedtime Story', theme: 'daily-life' },
      { title: 'Meal Time', theme: 'food' },
      { title: 'Getting Dressed', theme: 'daily-life' },
      { title: 'Cleaning Up', theme: 'daily-life' },
      { title: 'Bath Time', theme: 'daily-life' },
      { title: 'Cooking Together', theme: 'food' },
      { title: 'Family Time', theme: 'family' },
      { title: 'Chores', theme: 'daily-life' },
      { title: 'Shopping', theme: 'community' },
      { title: 'Phone Call', theme: 'family' },
      { title: 'Reading Time', theme: 'learning' },
      { title: 'Snack Time', theme: 'food' },
      { title: 'Waking Up', theme: 'daily-life' },
      { title: 'House Work', theme: 'daily-life' },
      { title: 'Visit Doctor', theme: 'healthcare' },
      { title: 'Teeth Cleaning', theme: 'healthcare' },
      { title: 'Medicine Time', theme: 'healthcare' },
      { title: 'Exercise Fun', theme: 'health' },
      { title: 'Washing Hands', theme: 'health' },
      { title: 'Learning New Things', theme: 'learning' },
      { title: 'Classroom Fun', theme: 'school' },
      { title: 'Teacher Helper', theme: 'school' },
      { title: 'Homework Time', theme: 'school' },
      { title: 'Circle Time', theme: 'school' },
      { title: 'Art Class', theme: 'creativity' },
      { title: 'Music Time', theme: 'creativity' },
      { title: 'Dancing Fun', theme: 'creativity' },
      { title: 'Story Reading', theme: 'learning' },
      { title: 'Writing Practice', theme: 'learning' },
      { title: 'Number Fun', theme: 'learning' },
      { title: 'Color Learning', theme: 'learning' },
      { title: 'Drawing Time', theme: 'creativity' },
      { title: 'Craft Making', theme: 'creativity' },
      { title: 'Building Blocks', theme: 'play' },
      { title: 'Memory Game', theme: 'play' },
      { title: 'Singing Songs', theme: 'creativity' },
      { title: 'Show and Tell', theme: 'school' },
      { title: 'Learning to Share', theme: 'friendship' },
      { title: 'Science Fun', theme: 'learning' },
      { title: 'Puzzle Time', theme: 'play' },
      { title: 'Computer Time', theme: 'learning' },
      { title: 'Alphabet', theme: 'learning' },
      { title: 'Math Fun', theme: 'learning' },
      { title: 'Learning Shapes', theme: 'learning' },
      { title: 'Playground Fun', theme: 'play' },
      { title: 'Ball Game', theme: 'play' },
      { title: 'Hide and Seek', theme: 'play' },
      { title: 'Bike Ride', theme: 'adventure' },
      { title: 'Swing Time', theme: 'play' },
      { title: 'Slide Fun', theme: 'play' },
      { title: 'Sandbox Play', theme: 'play' },
      { title: 'Jump Rope', theme: 'play' },
      { title: 'Tag Game', theme: 'play' },
      { title: 'Race Time', theme: 'play' },
      { title: 'Toy Cars', theme: 'play' },
      { title: 'Doll Play', theme: 'play' },
      { title: 'Dress Up', theme: 'play' },
      { title: 'Tea Party', theme: 'play' },
      { title: 'Playing House', theme: 'play' },
      { title: 'Library Visit', theme: 'community' },
      { title: 'Store Trip', theme: 'community' },
      { title: 'Park Day', theme: 'community' },
      { title: 'Post Office', theme: 'community' },
      { title: 'Fire Station', theme: 'community' },
      { title: 'Police Helper', theme: 'community' },
      { title: 'Bus Ride', theme: 'transportation' },
      { title: 'Train Trip', theme: 'transportation' },
      { title: 'Airplane Ride', theme: 'transportation' },
      { title: 'Boat Trip', theme: 'transportation' },
      { title: 'Car Wash', theme: 'transportation' },
      { title: 'Gas Station', theme: 'transportation' },
      { title: 'Traffic Lights', theme: 'transportation' },
      { title: 'Walking Safe', theme: 'safety' },
      { title: 'Crossing Street', theme: 'safety' },
      { title: 'Birthday Party', theme: 'celebration' },
      { title: 'Holiday Fun', theme: 'celebration' },
      { title: 'Gift Giving', theme: 'celebration' },
      { title: 'Thanksgiving', theme: 'celebration' },
      { title: 'Halloween Fun', theme: 'celebration' },
      { title: 'Christmas Joy', theme: 'celebration' },
      { title: 'New Year', theme: 'celebration' },
      { title: 'Valentine Day', theme: 'celebration' },
      { title: 'Easter Hunt', theme: 'celebration' },
      { title: 'Summer Fun', theme: 'seasons' },
      { title: 'Fall Leaves', theme: 'seasons' },
      { title: 'Winter Snow', theme: 'seasons' },
      { title: 'Spring Flowers', theme: 'seasons' },
      { title: 'Winter Fun', theme: 'seasons' },
      { title: 'Spring Time', theme: 'seasons' },
      { title: 'Pet Care', theme: 'animals' },
      { title: 'Garden Time', theme: 'nature' },
      { title: 'Bird Watching', theme: 'animals' },
      { title: 'Nature Walk', theme: 'nature' },
      { title: 'Rain Day', theme: 'weather' },
      { title: 'Sunny Day', theme: 'weather' },
      { title: 'Animal Friends', theme: 'animals' },
      { title: 'Beach Day', theme: 'nature' },
      { title: 'Forest Adventure', theme: 'nature' },
      { title: 'Ocean Waves', theme: 'nature' }
    ]
  },
  level1: {
    count: 5,
    type: 'dynamic',
    path: 'level1/',
    B: 5, // Arc length (scenes per arc)
    templates: [
      { file: 'beautiful-garden.js', title: 'The Beautiful Garden Adventure', theme: 'nature' },
      { file: 'big-bike-adventure.js', title: 'The Big Bike Adventure', theme: 'adventure' },
      { file: 'helping-lost-animal.js', title: 'Helping the Lost Animal', theme: 'kindness' },
      { file: 'magical-garden-discovery.js', title: 'The Magical Garden Discovery', theme: 'magic' },
      { file: 'perfect-beach-day.js', title: 'The Perfect Beach Day', theme: 'nature' }
    ]
  },
  level2: {
    count: 5,
    type: 'dynamic',
    path: 'level2/',
    B: 8, // Arc length (scenes per arc)
    templates: [
      { file: 'drama-club-adventure.js', title: 'Drama Club Adventure', theme: 'creativity' },
      { file: 'library-mystery.js', title: 'The Library Mystery', theme: 'mystery' },
      { file: 'mysterious-treasure-map.js', title: 'The Mysterious Treasure Map', theme: 'adventure' },
      { file: 'neighborhood-mystery.js', title: 'The Neighborhood Mystery', theme: 'mystery' },
      { file: 'science-discovery.js', title: 'The Science Discovery', theme: 'science' }
    ]
  },
  level3: {
    count: 5,
    type: 'dynamic',
    path: 'level3/',
    B: 10, // Arc length (scenes per arc)
    templates: [
      { file: 'magical-treehouse.js', title: 'The Magical Treehouse Adventure', theme: 'magic' },
      { file: 'space-mission.js', title: 'Space Mission Adventure', theme: 'space' },
      { file: 'superhero-academy.js', title: 'Superhero Academy Challenge', theme: 'superhero' },
      { file: 'time-travel-detective.js', title: 'Time Travel Detective Mystery', theme: 'mystery' },
      { file: 'underwater-kingdom.js', title: 'The Underwater Kingdom', theme: 'adventure' }
    ]
  },
  level4: {
    count: 5,
    type: 'dynamic',
    path: 'level4/',
    B: 12, // Arc length (scenes per arc)
    templates: [
      { file: 'ancient-artifact-mystery.js', title: 'Ancient Artifact Mystery', theme: 'mystery' },
      { file: 'climate-change-heroes.js', title: 'Climate Change Heroes', theme: 'environment' },
      { file: 'quantum-physics-discovery.js', title: 'Quantum Physics Discovery', theme: 'science' },
      { file: 'social-media-justice-league.js', title: 'Social Media Justice League', theme: 'technology' },
      { file: 'virtual-reality-escape.js', title: 'Virtual Reality Escape Challenge', theme: 'technology' }
    ]
  },
  grade6: {
    count: 3,
    type: 'dynamic',
    path: 'grade6/',
    B: 15, // Arc length (scenes per arc)
    templates: [
      { file: 'biosphere-project.js', title: 'Biosphere Research Project', theme: 'environment' },
      { file: 'coding-for-change.js', title: 'Coding for Change Project', theme: 'technology' },
      { file: 'urban-farming-lab.js', title: 'Urban Farming Lab Initiative', theme: 'environment' }
    ]
  },
  grade7: {
    count: 3,
    type: 'dynamic',
    path: 'grade7/',
    B: 15, // Arc length (scenes per arc)
    templates: [
      { file: 'cultural-heritage-research.js', title: 'Cultural Heritage Research Project', theme: 'culture' },
      { file: 'digital-citizenship-dilemma.js', title: 'Digital Citizenship Dilemma', theme: 'technology' },
      { file: 'mental-health-awareness.js', title: 'Mental Health Awareness Campaign', theme: 'health' }
    ]
  },
  grade8: {
    count: 3,
    type: 'dynamic',
    path: 'grade8/',
    B: 15, // Arc length (scenes per arc)
    templates: [
      { file: 'digital-privacy-rights.js', title: 'Digital Privacy Rights Campaign', theme: 'technology' },
      { file: 'environmental-justice.js', title: 'Environmental Justice Investigation', theme: 'environment' },
      { file: 'food-justice-research.js', title: 'Food Justice Research Project', theme: 'social justice' }
    ]
  },
  grade9: {
    count: 3,
    type: 'dynamic',
    path: 'grade9/',
    B: 15, // Arc length (scenes per arc)
    templates: [
      { file: 'criminal-justice-reform.js', title: 'Criminal Justice Reform Initiative', theme: 'social justice' },
      { file: 'educational-equity.js', title: 'Educational Equity Research Project', theme: 'education' },
      { file: 'mental-health-advocacy.js', title: 'Mental Health Advocacy Project', theme: 'health' }
    ]
  },
  grade10: {
    count: 3,
    type: 'dynamic',
    path: 'grade10/',
    B: 15, // Arc length (scenes per arc)
    templates: [
      { file: 'democratic-participation.js', title: 'The Democratic Participation Initiative', theme: 'politics' },
      { file: 'global-climate-action.js', title: 'The Global Climate Action Network', theme: 'environment' },
      { file: 'global-health-equity.js', title: 'The Global Health Equity Partnership', theme: 'health' }
    ]
  }
};

/**
 * Get template count for a level
 */
export function getRegistryTemplateCount(level: string): number {
  const config = TEMPLATE_REGISTRY[level];
  return config ? config.count : 0;
}

/**
 * Get template metadata for a level
 */
export function getRegistryConfig(level: string): RegistryConfig | null {
  return TEMPLATE_REGISTRY[level] || null;
}

/**
 * Get B value (arc length) for a template level
 */
export function getBValue(level: string): number {
  const config = TEMPLATE_REGISTRY[level];
  return config ? config.B || 5 : 5; // Default to 5 if not found
}