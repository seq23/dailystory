/**
 * Template Registry - Metadata Only (No Template Data)
 * Maps template levels to their individual files and counts
 * Used for on-demand dynamic imports to reduce memory footprint
 */

export const TEMPLATE_REGISTRY = {
  level0: {
    count: 100,
    type: 'static',
    path: 'level0.js'
    // Note: No B value - Level 0 excluded from arc processing
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
export function getRegistryTemplateCount(level) {
  const config = TEMPLATE_REGISTRY[level];
  return config ? config.count : 0;
}

/**
 * Get template metadata for a level
 */
export function getRegistryConfig(level) {
  return TEMPLATE_REGISTRY[level] || null;
}

/**
 * Get B value (arc length) for a template level
 */
export function getBValue(level) {
  const config = TEMPLATE_REGISTRY[level];
  return config ? config.B : 5; // Default to 5 if not found
}