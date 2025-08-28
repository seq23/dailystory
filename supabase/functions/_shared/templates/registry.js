/**
 * Template Registry - Metadata Only (No Template Data)
 * Maps template levels to their individual files and counts
 * Used for on-demand dynamic imports to reduce memory footprint
 */

export const TEMPLATE_REGISTRY = {
  level0: {
    count: 40,
    type: 'static', 
    path: './level0.js',
    functions: {
      getter: 'getLevel0Template',
      counter: 'getLevel0TemplateCount'
    }
  },
  level1: {
    count: 5,
    type: 'dynamic',
    path: './level1/',
    templates: [
      { file: 'magical-garden-discovery.js', title: 'The Magical Garden Discovery' },
      { file: 'lost-puppy-adventure.js', title: 'The Lost Puppy Adventure' },
      { file: 'magic-art-set.js', title: 'The Magic Art Set' },
      { file: 'friendship-garden.js', title: 'The Friendship Garden' },
      { file: 'brave-little-explorer.js', title: 'The Brave Little Explorer' }
    ]
  },
  level2: {
    count: 5,
    type: 'dynamic',
    path: './level2/',
    templates: [
      { file: 'school-science-fair-champion.js', title: 'School Science Fair Champion' },
      { file: 'mystery-missing-library-books.js', title: 'Mystery of the Missing Library Books' },
      { file: 'neighborhood-mystery-club.js', title: 'The Neighborhood Mystery Club' },
      { file: 'invention-fair-champion.js', title: 'Invention Fair Champion' },
      { file: 'animal-rescue-team.js', title: 'Animal Rescue Team Adventure' }
    ]
  },
  level3: {
    count: 5,
    type: 'dynamic',
    path: './level3/',
    templates: [
      { file: 'magical-treehouse-adventure.js', title: 'The Magical Treehouse Adventure' },
      { file: 'time-travel-detective.js', title: 'Time Travel Detective Mystery' },
      { file: 'dragon-academy-challenge.js', title: 'Dragon Academy Challenge' },
      { file: 'robot-best-friend.js', title: 'My Robot Best Friend' },
      { file: 'secret-underground-city.js', title: 'The Secret Underground City' }
    ]
  },
  level4: {
    count: 5,
    type: 'dynamic',
    path: './level4/',
    templates: [
      { file: 'ancient-artifact-mystery.js', title: 'Ancient Artifact Mystery' },
      { file: 'virtual-reality-escape.js', title: 'Virtual Reality Escape Challenge' },
      { file: 'climate-change-heroes.js', title: 'Climate Change Heroes' },
      { file: 'quantum-physics-discovery.js', title: 'Quantum Physics Discovery' },
      { file: 'social-media-justice-league.js', title: 'Social Media Justice League' }
    ]
  },
  grade6: {
    count: 3,
    type: 'dynamic',
    path: './grade6/',
    templates: [
      { file: 'biosphere-project.js', title: 'Biosphere Research Project' },
      { file: 'time-capsule-mystery.js', title: 'Time Capsule Mystery Investigation' },
      { file: 'coding-club-championship.js', title: 'Coding Club Championship Challenge' }
    ]
  },
  grade7: {
    count: 3,
    type: 'dynamic',
    path: './grade7/',
    templates: [
      { file: 'cultural-heritage-research.js', title: 'Cultural Heritage Research Project' },
      { file: 'digital-citizenship-dilemma.js', title: 'Digital Citizenship Dilemma' },
      { file: 'mental-health-awareness.js', title: 'Mental Health Awareness Campaign' }
    ]
  },
  grade8: {
    count: 3,
    type: 'dynamic',
    path: './grade8/',
    templates: [
      { file: 'environmental-justice-investigation.js', title: 'Environmental Justice Investigation' },
      { file: 'food-justice-research.js', title: 'Food Justice Research Project' },
      { file: 'digital-privacy-rights.js', title: 'Digital Privacy Rights Campaign' }
    ]
  },
  grade9: {
    count: 3,
    type: 'dynamic',
    path: './grade9/',
    templates: [
      { file: 'mental-health-advocacy.js', title: 'Mental Health Advocacy Project' },
      { file: 'youth-criminal-justice-reform.js', title: 'Youth Criminal Justice Reform Initiative' },
      { file: 'educational-equity-research.js', title: 'Educational Equity Research Project' }
    ]
  },
  grade10: {
    count: 3,
    type: 'dynamic',
    path: './grade10/',
    templates: [
      { file: 'global-climate-action-network.js', title: 'Global Climate Action Network' },
      { file: 'global-health-equity-initiative.js', title: 'Global Health Equity Initiative' },
      { file: 'democratic-participation-project.js', title: 'Democratic Participation Project' }
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