// Frontend ↔ backend difficulty translation, delegating to ./grades.ts (the one map).
import {
  READING_LEVELS,
  DIFFICULTY_FOR_READING_LEVEL,
  type ReadingLevel,
  type BackendDifficulty,
  isReadingLevel,
  isBackendDifficulty,
  readingLevelForDifficulty,
  frontendLevelToDifficulty,
  backendDifficultyOf,
} from "./grades.ts";

type DifficultyLevel = BackendDifficulty;

export interface DifficultyMapping {
  backend: DifficultyLevel;
  frontend: ReadingLevel;
  displayName: string;
  description: string;
}

// Display text per reading level. The level lists and the frontend ↔ backend pairing
// come from GRADES (grades.ts); this class only delegates. Map: docs/reading-levels.md.
const DISPLAY: Readonly<Record<ReadingLevel, { displayName: string; description: string }>> = {
  "pre-reader": { displayName: "Pre-Reader", description: "Picture-focused with minimal text" },
  beginner: { displayName: "Beginner", description: "Simple sentences and basic vocabulary" },
  developing: { displayName: "Developing", description: "Longer sentences with varied vocabulary" },
  independent: { displayName: "Independent", description: "Complex sentences and rich vocabulary" },
  advanced: { displayName: "Advanced", description: "Sophisticated language and concepts" },
};

export class DifficultyLevelMapper {
  private static readonly DIFFICULTY_MAPPINGS: DifficultyMapping[] = READING_LEVELS.map((frontend) => ({
    backend: DIFFICULTY_FOR_READING_LEVEL[frontend],
    frontend,
    ...DISPLAY[frontend],
  }));

  /** Backend difficulty → frontend reading level. */
  static toFrontend(backendLevel: DifficultyLevel | string): string {
    return readingLevelForDifficulty(backendLevel) ?? String(backendLevel);
  }

  /** A FRONTEND value (UI, profile) → backend. "beginner" here means 1st–2nd → "easy". */
  static toBackend(frontendLevel: string): DifficultyLevel {
    return frontendLevelToDifficulty(frontendLevel) ?? (frontendLevel as DifficultyLevel);
  }

  /** A value a client ALREADY converted → backend. "beginner" stays Pre-K/K. */
  static fromBackendValue(level: string): DifficultyLevel | null {
    return backendDifficultyOf(level);
  }

  static getDisplayName(level: string): string {
    const s = String(level ?? "").toLowerCase();
    if (isReadingLevel(s)) return DISPLAY[s].displayName;
    const fe = readingLevelForDifficulty(s);
    return fe ? DISPLAY[fe].displayName : level;
  }

  static isValidBackendLevel(level: string): level is DifficultyLevel {
    return isBackendDifficulty(level);
  }

  static isValidFrontendLevel(level: string): boolean {
    return isReadingLevel(String(level ?? "").toLowerCase());
  }

  static getAllMappings(): DifficultyMapping[] {
    return [...this.DIFFICULTY_MAPPINGS];
  }

  /** Frontend-first (form data uses frontend values); unknown → "easy". */
  static normalizeLevel(level: string | DifficultyLevel): DifficultyLevel {
    return frontendLevelToDifficulty(level) ?? "easy";
  }

  static getStyleFrameworkKey(level: string | DifficultyLevel): DifficultyLevel {
    return this.normalizeLevel(level);
  }

  // deno-lint-ignore no-explicit-any
  static mapToImageDifficulty(userInfo: any): DifficultyLevel {
    return this.normalizeLevel(userInfo?.difficultyLevel || "easy");
  }
}
