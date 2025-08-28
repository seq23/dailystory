/**
 * Template Registry - Metadata Only (No Template Data)
 * Maps template levels to their individual files and counts
 * Used for on-demand dynamic imports to reduce memory footprint
 */

export const TEMPLATE_REGISTRY = {
  level0: {
    count: 100,
    type: 'static', 
    path: 'level0.js',
    functions: {
      getter: 'getLevel0Template',
      counter: 'getLevel0TemplateCount'
    }
  },
  level1: {
    count: 5,
    type: 'dynamic',
    path: 'level1/',
    templates: [
      { file: 'beautiful-garden.js', title: 'The Beautiful Garden Adventure' },
      { file: 'big-bike-adventure.js', title: 'The Big Bike Adventure' },
      { file: 'helping-lost-animal.js', title: 'Helping the Lost Animal' },
      { file: 'magical-garden-discovery.js', title: 'The Magical Garden Discovery' },
      { file: 'perfect-beach-day.js', title: 'The Perfect Beach Day' }
    ]
  },
  level2: {
    count: 5,
    type: 'dynamic',
    path: 'level2/',
    templates: [
      { file: 'drama-club-adventure.js', title: 'Drama Club Adventure' },
      { file: 'library-mystery.js', title: 'The Library Mystery' },
      { file: 'mysterious-treasure-map.js', title: 'The Mysterious Treasure Map' },
      { file: 'neighborhood-mystery.js', title: 'The Neighborhood Mystery' },
      { file: 'science-discovery.js', title: 'The Science Discovery' }
    ]
  },
  level3: {
    count: 5,
    type: 'dynamic',
    path: 'level3/',
    templates: [
      { file: 'magical-treehouse.js', title: 'The Magical Treehouse Adventure' },
      { file: 'space-mission.js', title: 'Space Mission Adventure' },
      { file: 'superhero-academy.js', title: 'Superhero Academy Challenge' },
      { file: 'time-travel-detective.js', title: 'Time Travel Detective Mystery' },
      { file: 'underwater-kingdom.js', title: 'The Underwater Kingdom' }
    ]
  },
  level4: {
    count: 5,
    type: 'dynamic',
    path: 'level4/',
    templates: [
      { file: 'ancient-artifact-mystery.js', title: 'Ancient Artifact Mystery' },
      { file: 'climate-change-heroes.js', title: 'Climate Change Heroes' },
      { file: 'quantum-physics-discovery.js', title: 'Quantum Physics Discovery' },
      { file: 'social-media-justice-league.js', title: 'Social Media Justice League' },
      { file: 'virtual-reality-escape.js', title: 'Virtual Reality Escape Challenge' }
    ]
  },
  grade6: {
    count: 3,
    type: 'dynamic',
    path: 'grade6/',
    templates: [
      { file: 'biosphere-project.js', title: 'Biosphere Research Project' },
      { file: 'coding-for-change.js', title: 'Coding for Change Project' },
      { file: 'urban-farming-lab.js', title: 'Urban Farming Lab Initiative' }
    ]
  },
  grade7: {
    count: 3,
    type: 'dynamic',
    path: 'grade7/',
    templates: [
      { file: 'cultural-heritage-research.js', title: 'Cultural Heritage Research Project' },
      { file: 'digital-citizenship-dilemma.js', title: 'Digital Citizenship Dilemma' },
      { file: 'mental-health-awareness.js', title: 'Mental Health Awareness Campaign' }
    ]
  },
  grade8: {
    count: 3,
    type: 'dynamic',
    path: 'grade8/',
    templates: [
      { file: 'digital-privacy-rights.js', title: 'Digital Privacy Rights Campaign' },
      { file: 'environmental-justice.js', title: 'Environmental Justice Investigation' },
      { file: 'food-justice-research.js', title: 'Food Justice Research Project' }
    ]
  },
  grade9: {
    count: 3,
    type: 'dynamic',
    path: 'grade9/',
    templates: [
      { file: 'criminal-justice-reform.js', title: 'Criminal Justice Reform Initiative' },
      { file: 'educational-equity.js', title: 'Educational Equity Research Project' },
      { file: 'mental-health-advocacy.js', title: 'Mental Health Advocacy Project' }
    ]
  },
  grade10: {
    count: 3,
    type: 'dynamic',
    path: 'grade10/',
    templates: [
      { file: 'democratic-participation.js', title: 'Democratic Participation Project' },
      { file: 'global-climate-action.js', title: 'Global Climate Action Network' },
      { file: 'global-health-equity.js', title: 'Global Health Equity Initiative' }
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