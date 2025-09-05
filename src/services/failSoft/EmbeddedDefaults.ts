// Embedded Defaults for Fail-Soft Operation
// Minimal fallback data when caches/CDN fail

export const RENDER_PROFILES = {
  beginner: { max_clause: 1, avg_wps: [8, 10], fig: 0.35, twists: 1, peril: "none", inputs: "direct" },
  easy: { max_clause: 2, avg_wps: [9, 11], fig: 0.40, twists: 1, peril: "none", inputs: "direct" },
  medium: { max_clause: 2, avg_wps: [11, 12], fig: 0.45, twists: 1, peril: "illusory_ok", inputs: "subtle" },
  hard: { max_clause: 3, avg_wps: [12, 13], fig: 0.60, twists: 2, peril: "spooky_safe", inputs: "subtle" },
  expert: { max_clause: 4, avg_wps: [13, 14], fig: 0.60, twists: 3, peril: "moderate_implied", inputs: "subtle" }
} as const;

// DEPRECATED: Reference only - AI handles theme generation/adaptation
export const THEMES_FALLBACK = [
  "friendship", "school", "portal_fantasy", "quest", "mystery", "cozy", "survival", "magic_school"
] as const;

export const NEUTRAL_VOICE = {
  id: "neutral_v0",
  pn: "Gentle Narrator",
  vf: {
    tone: ["warm", "playful"],
    cad: 12,
    var: 3,
    fig: 0.45,
    hum: 0.5,
    warm: 0.85,
    nar: "storybook"
  },
  levers: {
    hooks: ["ordinary_until", "quiet_room", "map_found"],
    transitions: ["and_then_softly", "meanwhile"],
    pauses: ["thinking_pause"],
    continuations: ["only_beginning"],
    twists: ["ordinary_to_magical", "kindness_returns", "red_herring"],
    endings: ["calm_return", "quiet_pride", "open_invite"]
  },
  uig: {
    aff: { u: 0.9, c: 0.6, a: 0.6, f: 0.4, h: 0.5 },
    rules: {} // Set by level profile at runtime
  }
} as const;

export function getRenderProfile(level: string) {
  const normalizedLevel = level.toLowerCase() as keyof typeof RENDER_PROFILES;
  return RENDER_PROFILES[normalizedLevel] || RENDER_PROFILES.medium;
}

// AI-driven theme generation - no hardcoded fallbacks
export function getSafeTheme(requestedThemes?: string[]): string {
  if (!requestedThemes || requestedThemes.length === 0) {
    return "AI_GENERATE_THEMES";
  }
  
  // If themes provided but none match catalog, let AI adapt
  return "AI_ADAPT_THEMES";
}

export function getNeutralVoiceForLevel(level: string, age?: number): any {
  const profile = getRenderProfile(level);
  
  // Create a basic voice structure compatible with ProcessedVoice
  return {
    id: "neutral_v0",
    pn: "Gentle Narrator",
    resolvedElements: {
      tones: ["warm", "playful"],
      themes: ["AI_GENERATE_THEMES"],
      cadence: profile.avg_wps[0],
      figurative: Math.min(0.45, profile.fig)
    },
    vf: {
      tone: ["warm", "playful"],
      cad: profile.avg_wps[0],
      var: 3,
      fig: Math.min(0.45, profile.fig),
      hum: 0.5,
      warm: 0.85,
      nar: "storybook"
    },
    levers: {
      hooks: ["ordinary_until", "quiet_room", "map_found"],
      transitions: ["and_then_softly", "meanwhile"],
      pauses: ["thinking_pause"],
      continuations: ["only_beginning"],
      twists: ["ordinary_to_magical", "kindness_returns", "red_herring"],
      endings: ["calm_return", "quiet_pride", "open_invite"]
    },
    uig: {
      aff: { u: 0.9, c: 0.6, a: 0.6, f: 0.4, h: 0.5 },
      rules: {
        u: { max: profile.inputs === "direct" ? 4 : 2 },
        c: { max: profile.inputs === "direct" ? 3 : 2 },
        a: { max: 2 },
        f: { max: 1 },
        h: { max: 1 }
      }
    },
    st: "neutral",
    ch: "gentle",
    wd: "simple",
    failSoftFallback: true
  };
}