/**
 * Smart Template Selector
 * Intelligent template selection based on user requests and themes
 */

/**
 * Select template based on special request with timeout protection
 * @param {string} specialRequest - User's special request
 * @param {string} templateLevel - Template level (level0, level1, etc.)
 * @param {number} templateCount - Total number of templates available
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<number|null>} Template index or null if no match
 */
export async function selectWithTimeout(specialRequest, templateLevel, templateCount, timeoutMs = 100) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('⏰ Smart selection timeout, using fallback');
      resolve(null);
    }, timeoutMs);

    try {
      const result = selectBestTemplate(specialRequest, templateLevel, templateCount);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      console.error('❌ Smart selection error:', error);
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

/**
 * Select best template based on special request
 * @param {string} specialRequest - User's special request
 * @param {string} templateLevel - Template level
 * @param {number} templateCount - Total number of templates
 * @returns {number|null} Template index or null if no strong match
 */
function selectBestTemplate(specialRequest, templateLevel, templateCount) {
  if (!specialRequest || typeof specialRequest !== 'string') {
    return null;
  }

  const request = specialRequest.toLowerCase().trim();
  
  // Level 0 specific selection
  if (templateLevel === 'level0') {
    return selectLevel0Template(request);
  }

  // Fallback for other levels - random selection for now
  console.log(`⚠️ Smart selection not implemented for ${templateLevel}, using random`);
  return Math.floor(Math.random() * templateCount);
}

/**
 * Select Level 0 template based on request themes
 * @param {string} request - Lowercase special request
 * @returns {number|null} Template index or null if no match
 */
function selectLevel0Template(request) {
  // Import Level 0 metadata dynamically
  const level0Metadata = [
    // Daily Life Templates (0-19)
    { title: "Morning Routine", theme: "daily life", index: 0 },
    { title: "Bedtime Story", theme: "daily life", index: 1 },
    { title: "Meal Time", theme: "daily life", index: 2 },
    { title: "Getting Dressed", theme: "daily life", index: 3 },
    { title: "Cleaning Up", theme: "daily life", index: 4 },
    { title: "Bath Time", theme: "daily life", index: 5 },
    { title: "Cooking Together", theme: "daily life", index: 6 },
    { title: "Family Time", theme: "daily life", index: 7 },
    { title: "Chores", theme: "daily life", index: 8 },
    { title: "Shopping", theme: "daily life", index: 9 },
    { title: "Phone Call", theme: "daily life", index: 10 },
    { title: "Reading Time", theme: "daily life", index: 11 },
    { title: "Snack Time", theme: "daily life", index: 12 },
    { title: "Waking Up", theme: "daily life", index: 13 },
    { title: "House Work", theme: "daily life", index: 14 },
    { title: "Getting Ready", theme: "daily life", index: 15 },
    { title: "Dinner Time", theme: "daily life", index: 16 },
    { title: "Quiet Time", theme: "daily life", index: 17 },
    { title: "Helper", theme: "daily life", index: 18 },
    { title: "Going to Bed", theme: "daily life", index: 19 },
    
    // Healthcare Templates (20-29)
    { title: "Doctor Visit", theme: "health", index: 20 },
    { title: "Dentist Visit", theme: "health", index: 21 },
    { title: "Feeling Sick", theme: "health", index: 22 },
    { title: "Taking Medicine", theme: "health", index: 23 },
    { title: "Checkup", theme: "health", index: 24 },
    { title: "Washing Hands", theme: "health", index: 25 },
    { title: "Eating Healthy", theme: "health", index: 26 },
    { title: "Exercise", theme: "health", index: 27 },
    { title: "Bandage", theme: "health", index: 28 },
    { title: "Sleep Well", theme: "health", index: 29 },
    
    // Educational Templates (30-44)
    { title: "School Day", theme: "learning", index: 30 },
    { title: "Reading Book", theme: "learning", index: 31 },
    { title: "Writing", theme: "learning", index: 32 },
    { title: "Counting", theme: "learning", index: 33 },
    { title: "Library Visit", theme: "learning", index: 34 },
    { title: "Art Time", theme: "learning", index: 35 },
    { title: "Music Class", theme: "learning", index: 36 },
    { title: "Learning Colors", theme: "learning", index: 37 },
    { title: "Show and Tell", theme: "learning", index: 38 },
    { title: "Science Fun", theme: "learning", index: 39 },
    { title: "Puzzle Time", theme: "learning", index: 40 },
    { title: "Computer Time", theme: "learning", index: 41 },
    { title: "Alphabet", theme: "learning", index: 42 },
    { title: "Math Fun", theme: "learning", index: 43 },
    { title: "Learning Shapes", theme: "learning", index: 44 },
    
    // Play & Recreation Templates (45-59)
    { title: "Playground Fun", theme: "play", index: 45 },
    { title: "Ball Game", theme: "play", index: 46 },
    { title: "Hide and Seek", theme: "play", index: 47 },
    { title: "Bike Ride", theme: "play", index: 48 },
    { title: "Swimming", theme: "play", index: 49 },
    { title: "Tag Game", theme: "play", index: 50 },
    { title: "Toy Cars", theme: "play", index: 51 },
    { title: "Building Blocks", theme: "play", index: 52 },
    { title: "Dancing", theme: "play", index: 53 },
    { title: "Jump Rope", theme: "play", index: 54 },
    { title: "Sandbox", theme: "play", index: 55 },
    { title: "Slide Fun", theme: "play", index: 56 },
    { title: "Tricycle", theme: "play", index: 57 },
    { title: "Hopscotch", theme: "play", index: 58 },
    { title: "Seesaw", theme: "play", index: 59 },
    
    // Community Templates (60-69)
    { title: "Store Visit", theme: "community", index: 60 },
    { title: "Fire Station", theme: "community", index: 61 },
    { title: "Police Officer", theme: "community", index: 62 },
    { title: "Post Office", theme: "community", index: 63 },
    { title: "Library Visit", theme: "community", index: 64 },
    { title: "Park Day", theme: "community", index: 65 },
    { title: "Bus Ride", theme: "community", index: 66 },
    { title: "Restaurant", theme: "community", index: 67 },
    { title: "Zoo Trip", theme: "community", index: 68 },
    { title: "Museum", theme: "community", index: 69 },
    
    // Transportation Templates (70-79)
    { title: "Car Ride", theme: "transportation", index: 70 },
    { title: "Train Journey", theme: "transportation", index: 71 },
    { title: "Airplane", theme: "transportation", index: 72 },
    { title: "Boat Trip", theme: "transportation", index: 73 },
    { title: "Walking", theme: "transportation", index: 74 },
    { title: "School Bus", theme: "transportation", index: 75 },
    { title: "Skateboard", theme: "transportation", index: 76 },
    { title: "Scooter", theme: "transportation", index: 77 },
    { title: "Taxi Ride", theme: "transportation", index: 78 },
    { title: "Subway", theme: "transportation", index: 79 },
    
    // Animals & Pets Templates (80-89)
    { title: "Pet Dog", theme: "animals", index: 80 },
    { title: "Pet Cat", theme: "animals", index: 81 },
    { title: "Fish Tank", theme: "animals", index: 82 },
    { title: "Bird Watching", theme: "animals", index: 83 },
    { title: "Farm Animals", theme: "animals", index: 84 },
    { title: "Pet Rabbit", theme: "animals", index: 85 },
    { title: "Hamster", theme: "animals", index: 86 },
    { title: "Horse Riding", theme: "animals", index: 87 },
    { title: "Butterfly", theme: "animals", index: 88 },
    { title: "Ant Farm", theme: "animals", index: 89 },
    
    // Nature & Weather Templates (90-99)
    { title: "Sunny Day", theme: "nature", index: 90 },
    { title: "Rainy Day", theme: "nature", index: 91 },
    { title: "Snow Day", theme: "nature", index: 92 },
    { title: "Garden", theme: "nature", index: 93 },
    { title: "Flowers", theme: "nature", index: 94 },
    { title: "Rainbow", theme: "nature", index: 95 },
    { title: "Windy Day", theme: "nature", index: 96 },
    { title: "Beach Day", theme: "nature", index: 97 },
    { title: "Forest Walk", theme: "nature", index: 98 },
    { title: "Star Night", theme: "nature", index: 99 }
  ];

  // Define keyword mappings for themes
  const themeKeywords = {
    'daily life': ['morning', 'bedtime', 'meal', 'eat', 'dress', 'clean', 'bath', 'cook', 'family', 'chore', 'shop', 'phone', 'read', 'snack', 'wake', 'work', 'ready', 'dinner', 'quiet', 'help', 'bed'],
    'health': ['doctor', 'dentist', 'sick', 'medicine', 'checkup', 'wash', 'hand', 'healthy', 'exercise', 'bandage', 'sleep'],
    'learning': ['school', 'read', 'write', 'count', 'library', 'art', 'music', 'color', 'show', 'tell', 'science', 'puzzle', 'computer', 'alphabet', 'math', 'shape'],
    'play': ['playground', 'ball', 'hide', 'seek', 'bike', 'swim', 'tag', 'car', 'toy', 'block', 'dance', 'jump', 'rope', 'sand', 'slide', 'tricycle', 'hopscotch', 'seesaw'],
    'community': ['store', 'fire', 'police', 'post', 'office', 'library', 'park', 'bus', 'restaurant', 'zoo', 'museum'],
    'transportation': ['car', 'train', 'airplane', 'boat', 'walk', 'bus', 'skateboard', 'scooter', 'taxi', 'subway'],
    'animals': ['dog', 'cat', 'fish', 'bird', 'farm', 'rabbit', 'hamster', 'horse', 'butterfly', 'ant', 'pet'],
    'nature': ['sun', 'rain', 'snow', 'garden', 'flower', 'rainbow', 'wind', 'beach', 'forest', 'star', 'weather']
  };

  // Score templates based on keyword matches
  let bestScore = 0;
  let bestTemplate = null;

  for (const template of level0Metadata) {
    let score = 0;
    
    // Check theme keywords
    const keywords = themeKeywords[template.theme] || [];
    for (const keyword of keywords) {
      if (request.includes(keyword)) {
        score += 2; // Theme keyword match
      }
    }
    
    // Check title words
    const titleWords = template.title.toLowerCase().split(' ');
    for (const word of titleWords) {
      if (request.includes(word)) {
        score += 3; // Title word match (higher priority)
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template.index;
    }
  }

  // Only return template if we found a good match (score > 1)
  if (bestScore > 1) {
    console.log(`🎯 Level 0 smart selection: "${request}" → Template ${bestTemplate} (score: ${bestScore})`);
    return bestTemplate;
  }

  console.log(`📍 Level 0: No strong match for "${request}", using fallback`);
  return null;
}