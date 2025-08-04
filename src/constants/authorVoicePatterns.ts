// Author Voice Patterns - Natural language patterns inspired by children's literature masters
import type { DifficultyLevel } from "@/types";

export interface AuthorVoice {
  name: string;
  description: string;
  patterns: {
    openings: string[];
    transitions: string[];
    closings: string[];
  };
  characteristics: string[];
}

export const AUTHOR_VOICES: Record<string, AuthorVoice> = {
  ericCarle: {
    name: "Eric Carle Style",
    description: "Simple, rhythmic, nature-focused with repetitive patterns",
    patterns: {
      openings: [
        "In the light of the moon, {name} saw...",
        "On a sunny morning, {name} found...",
        "One day, {name} was very...",
        "The little {animal} was..."
      ],
      transitions: [
        "But {pronoun} was still...",
        "Then {pronoun} ate...",
        "The next day...",
        "On and on {pronoun} went..."
      ],
      closings: [
        "And {name} felt much better.",
        "What a beautiful {animal}!",
        "Now {pronoun} was no longer hungry.",
        "The end of a perfect day."
      ]
    },
    characteristics: ["simple vocabulary", "nature themes", "repetitive structure", "satisfying conclusions"]
  },

  lauraNumeroff: {
    name: "Laura Numeroff Style", 
    description: "Cause-and-effect chains with circular storytelling",
    patterns: {
      openings: [
        "If you give {name} a {object}...",
        "When {name} sees a {animal}...",
        "If {name} goes to the {setting}...",
        "One thing always leads to another when..."
      ],
      transitions: [
        "That will remind {pronoun} of...",
        "So {pronoun} will want to...",
        "Which means {pronoun} will need...",
        "Then {pronoun} will probably..."
      ],
      closings: [
        "And chances are, {pronoun} will want another {object}.",
        "Which will remind {pronoun} how this all started.",
        "And the whole thing will begin again.",
        "And you know what that means..."
      ]
    },
    characteristics: ["cause and effect", "circular narratives", "predictable patterns", "humor"]
  },

  margaretWiseBrown: {
    name: "Margaret Wise Brown Style",
    description: "Gentle, soothing rhythms with everyday magic",
    patterns: {
      openings: [
        "In the great green {setting}...",
        "Goodnight {object}, goodnight {animal}...",
        "Once upon a time in a little {setting}...",
        "There was a little {animal} who..."
      ],
      transitions: [
        "And in the {setting} there was...",
        "Quietly, softly, {name} whispered...",
        "The moon rose higher and...",
        "All around the {setting}..."
      ],
      closings: [
        "And they all lived quietly ever after.",
        "Goodnight stars, goodnight air, goodnight noises everywhere.",
        "And {name} fell fast asleep.",
        "Peace filled the {setting} as night came."
      ]
    },
    characteristics: ["quiet rhythm", "bedtime comfort", "simple beauty", "peaceful endings"]
  },

  moWillems: {
    name: "Mo Willems Style",
    description: "Conversational, emotional, friendship-focused",
    patterns: {
      openings: [
        "{name} was having a really bad day.",
        "'I do NOT want to!' said {name}.",
        "{name} and {animal} were best friends.",
        "There was a big problem today."
      ],
      transitions: [
        "But then {animal} said...",
        "'Wait!' shouted {name}.",
        "That was not what {pronoun} expected.",
        "Friends don't let friends..."
      ],
      closings: [
        "And they both laughed and laughed.",
        "That is what friends are for.",
        "Tomorrow would be even better.",
        "Being different makes friendship special."
      ]
    },
    characteristics: ["emotional honesty", "friendship themes", "conversational tone", "problem solving"]
  }
};

export const DIFFICULTY_VOICE_MAPPING: Record<DifficultyLevel, string[]> = {
  easy: ["ericCarle", "margaretWiseBrown"],
  medium: ["lauraNumeroff", "moWillems"],
  hard: ["moWillems", "lauraNumeroff"],
  expert: ["margaretWiseBrown", "moWillems"]
};

/**
 * Get appropriate author voice for difficulty level
 */
export function getAuthorVoiceForDifficulty(difficulty: DifficultyLevel): AuthorVoice {
  const availableVoices = DIFFICULTY_VOICE_MAPPING[difficulty];
  const selectedVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
  return AUTHOR_VOICES[selectedVoice];
}

/**
 * Apply author voice pattern to content
 */
export function applyAuthorVoice(
  content: string,
  voice: AuthorVoice,
  position: 'opening' | 'transition' | 'closing'
): string {
  const patterns = voice.patterns[position + 's' as keyof typeof voice.patterns];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Blend pattern with content while maintaining natural flow
  if (position === 'opening') {
    return pattern + " " + content;
  } else if (position === 'closing') {
    return content + " " + pattern;
  } else {
    // For transitions, weave pattern into content
    return content.replace(/\. /, '. ' + pattern + ' ');
  }
}