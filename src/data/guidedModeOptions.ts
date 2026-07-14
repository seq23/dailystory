// Guided Mode preset options for young/ESL learners.
// Chips populate `specialRequest` and `targetVocabulary` in the same free-text
// format the story generator already expects — no backend changes required.

export interface GuidedChip {
  id: string;
  label: string;
  emoji: string;
  value: string;
}

export interface VocabPack {
  id: string;
  label: string;
  emoji: string;
  words: string[];
}

export const GUIDED_THEMES: GuidedChip[] = [
  { id: "friendship", label: "Friendship", emoji: "🤝", value: "friendship" },
  { id: "kindness", label: "Kindness", emoji: "💗", value: "kindness" },
  { id: "adventure", label: "Adventure", emoji: "🗺️", value: "adventure" },
  { id: "bedtime", label: "Bedtime & Calm", emoji: "🌙", value: "calm bedtime" },
  { id: "sharing", label: "Sharing", emoji: "🎁", value: "sharing" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", value: "family love" },
  { id: "school", label: "First Day of School", emoji: "🎒", value: "first day of school" },
  { id: "helping", label: "Helping Others", emoji: "🫶", value: "helping others" },
];

export const GUIDED_CHARACTERS: GuidedChip[] = [
  { id: "puppy", label: "Puppy", emoji: "🐶", value: "a friendly puppy" },
  { id: "kitten", label: "Kitten", emoji: "🐱", value: "a curious kitten" },
  { id: "bunny", label: "Bunny", emoji: "🐰", value: "a gentle bunny" },
  { id: "bear", label: "Little Bear", emoji: "🐻", value: "a little bear" },
  { id: "dragon", label: "Kind Dragon", emoji: "🐲", value: "a kind dragon" },
  { id: "unicorn", label: "Unicorn", emoji: "🦄", value: "a magical unicorn" },
  { id: "robot", label: "Friendly Robot", emoji: "🤖", value: "a friendly robot" },
  { id: "fish", label: "Little Fish", emoji: "🐟", value: "a little fish" },
];

export const GUIDED_SETTINGS: GuidedChip[] = [
  { id: "forest", label: "Magical Forest", emoji: "🌳", value: "a magical forest" },
  { id: "ocean", label: "Under the Sea", emoji: "🌊", value: "under the sea" },
  { id: "cottage", label: "Cozy Cottage", emoji: "🏡", value: "a cozy cottage" },
  { id: "park", label: "The Park", emoji: "🌷", value: "the neighborhood park" },
  { id: "farm", label: "Farm", emoji: "🚜", value: "a friendly farm" },
  { id: "space", label: "Space", emoji: "🚀", value: "outer space" },
  { id: "garden", label: "Garden", emoji: "🌻", value: "a sunny garden" },
  { id: "school", label: "School", emoji: "🏫", value: "a cheerful school" },
];

export const GUIDED_VOCAB_PACKS: VocabPack[] = [
  {
    id: "sight-words-k",
    label: "Kindergarten Sight Words",
    emoji: "🔤",
    words: ["the", "and", "is", "it", "you", "see", "go", "we", "like", "my"],
  },
  {
    id: "feelings",
    label: "Feelings",
    emoji: "😊",
    words: ["happy", "kind", "brave", "calm", "safe", "proud"],
  },
  {
    id: "colors-shapes",
    label: "Colors & Shapes",
    emoji: "🎨",
    words: ["red", "blue", "green", "yellow", "circle", "square"],
  },
  {
    id: "family-home",
    label: "Family & Home",
    emoji: "🏠",
    words: ["mom", "dad", "home", "bed", "food", "love"],
  },
  {
    id: "nature",
    label: "Nature",
    emoji: "🌿",
    words: ["sun", "tree", "flower", "rain", "star", "moon"],
  },
];

// Grades where Guided Mode is on by default.
export const GUIDED_DEFAULT_GRADES = new Set(["PreK", "K", "1"]);
