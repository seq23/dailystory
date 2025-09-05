/**
 * STORY GENERATION SYSTEM - Voice Catalog Types
 * Based on Advanced Voice Catalog (AVC) schema v1.1.0
 * Purpose: Type definitions for narrative style selection system
 * NOT RELATED TO: User voice commands, audio playback, or microphone input
 */

// Global Codebook Schema
export interface GlobalCodebook {
  schema: string;
  v: string;
  tones: string[];
  narr: string[];
  wordplay: string[];
  hooks: string[];
  trans: string[];
  pauses: string[];
  conts: string[];
  twists: string[];
  ends: string[];
  helpers: string[];
  dialog: string[];
  emote: string[];
  setting: string[];
  scale: string[];
  moral: string[];
  leaps: string[];
  repeat: string[];
  snd: string[];
  themes: string[];
}

// Voice Format Settings
export interface VoiceFormat {
  tone: number[];
  cad: number;
  var: number;
  wp: number[];
  fig: number;
  hum: number;
  warm: number;
  nar: number;
}

// Story Structure Settings
export interface StoryStructure {
  hk: number[];
  tr: number[];
  pz: number[];
  ct: number[];
  tw: number[];
  en: number[];
}

// Character Settings
export interface CharacterSettings {
  hp: number[];
  pov: string;
  dlg: number[];
  arc: number[];
}

// World Details
export interface WorldDetails {
  set: number[];
  sc: string;
  mor: string;
  lp: (string | number)[];
  rp: (string | number)[];
}

// Reading Specifications
export interface ReadingSpecs {
  rh: string;
  aa: number;
  rf?: string;
  ono: (string | number)[];
  sl: number;
}

// Engagement Guidelines
export interface EngagementGuidelines {
  dir: number;
  lst: number;
  ip: (string | number)[];
  contr: number;
  exag: number;
}

// User Input Guidelines
export interface UserInputGuidelines {
  aff: {
    u: number;
    c: number;
    a: number;
    f: number;
    h: number;
  };
  rules: {
    u: { m: string; max: number; gap?: number };
    c: { m: string; max: number; gap?: number };
    a: { m: string; max: number };
    f: { m: string; max: number };
    h: { m: string; max: number };
  };
}

// Complete Voice Definition
export interface VoiceDefinition {
  id: string;
  pn: string; // Pretty name
  vf: VoiceFormat;
  st: StoryStructure;
  ch: CharacterSettings;
  wd: WorldDetails;
  rd: ReadingSpecs;
  eg: EngagementGuidelines;
  th: string[];
  tg: number[];
  uig: UserInputGuidelines;
  src: string[];
}

// Level File Schema
export interface LevelFile {
  schema: string;
  v: string;
  level: string;
  voices: VoiceDefinition[];
}

// Delta Override Schema (for easy level)
export interface VoiceOverride {
  ref: string;
  id: string;
  vf?: Partial<VoiceFormat>;
  st?: Partial<StoryStructure>;
  ch?: Partial<CharacterSettings>;
  wd?: Partial<WorldDetails>;
  rd?: Partial<ReadingSpecs>;
  eg?: Partial<EngagementGuidelines>;
  th?: string[];
  tg?: number[];
  uig?: Partial<UserInputGuidelines>;
}

export interface DeltaLevelFile {
  schema: string;
  v: string;
  level: string;
  overrides: VoiceOverride[];
}

// Processed Voice (after codebook resolution)
export interface ProcessedVoice extends VoiceDefinition {
  resolvedElements: {
    tones: string[];
    hooks: string[];
    transitions: string[];
    pauses: string[];
    continuations: string[];
    twists: string[];
    endings: string[];
    helpers: string[];
    dialogStyles: string[];
    emotions: string[];
    settings: string[];
    themes: string[];
    sounds: string[];
  };
}

// Voice Selection Result
export interface VoiceSelectionResult {
  voice: ProcessedVoice;
  selectionReasoning: string;
  compatibilityScore: number;
}