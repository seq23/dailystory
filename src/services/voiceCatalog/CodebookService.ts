/**
 * Codebook Service
 * Manages the global AVC codebook v1.1.0 with indexed references
 */

import type { GlobalCodebook } from './types';

export class CodebookService {
  private static codebook: GlobalCodebook | null = null;
  private static isLoading = false;

  // Global codebook data (embedded for immediate availability)
  private static readonly CODEBOOK_DATA: GlobalCodebook = {
    "schema": "avc.cb.v1",
    "v": "1.1.0",
    "tones": ["playful", "cozy", "soothing", "rhythmic", "warm", "wry", "adventurous", "mischievous", "reflective", "wondrous", "family", "bouncy", "tender", "hopeful", "philosophical", "suspenseful", "eerie", "heroic", "quippy", "epic", "bittersweet"],
    "narr": ["intimate", "storybook", "observer"],
    "wordplay": ["none", "rhyme", "alliteration", "repetition", "invented_words"],
    "hooks": ["tiny_time", "quiet_room", "ordinary_until", "bright_dot", "first_snow", "big_plan", "uh_oh", "peek_find", "lost_missing", "if_you_give", "family_plan", "door_not_there", "by_midnight_trouble", "map_found", "letter_arrived"],
    "trans": ["and_then_softly", "one_by_one", "meanwhile", "next", "beyond_woods", "but_then", "later", "soon", "across_street", "down_hall", "meanwhile_back_at", "after_training", "across_the_sea"],
    "pauses": ["hush", "breath_hold", "wait_for_it", "thinking_pause", "quiet_for_a_moment", "no_one_breathed", "heartbeat_pause"],
    "conts": ["not_done", "only_beginning", "keep_watching", "one_more_try", "next_clue", "new_rule"],
    "twists": ["ordinary_to_magical", "helper_reveals", "misunderstanding_to_friend", "chain_loops_back", "lost_found", "mistake_becomes_fun", "kindness_returns", "pattern_becomes_object", "worry_to_plan", "ally_is_opponent", "home_is_key", "power_has_cost", "mentor_falls", "red_herring", "ordinary_is_special"],
    "ends": ["bedtime_close", "full_circle", "group_celebration", "calm_return", "open_invite", "lesson_light", "quiet_pride", "hearth_warm", "return_home_door_remains", "open_series_hook", "bittersweet_end", "celebration_with_shadow"],
    "helpers": ["animal_guide", "talkative_toy", "kind_neighbor", "mentor", "best_friend", "caregiver", "teacher", "elder", "parent", "strange_but_kind", "squad", "rival_friend", "mysterious_guide"],
    "dialog": ["simple", "warm", "playful", "snappy", "realistic", "wry", "minimal", "chorus", "banter", "lyrical"],
    "emote": ["shy→brave", "worried→safe", "restless→calm", "confusion→clarity", "oops→okay", "alone→together", "sad→relieved", "curious→delighted", "impulse→learning", "self_doubt→agency", "lonely→connected", "scared→capable", "anger→understanding"],
    "setting": ["bedroom", "meadow", "garden", "city", "school", "home", "woods", "village", "hidden_world", "page_world", "farm", "apartment", "zoo", "worktable", "boarding_school", "mythic_city", "wilderness", "small_town", "museum", "camp", "castle", "hidden_library", "island"],
    "scale": ["tiny", "everyday", "grand"],
    "moral": ["overt", "implied", "humor_hidden", "symbolic"],
    "leaps": ["object_transforms", "imagination_real", "portal", "cartoon_logic", "shape_story", "folk_magic", "lullaby_imagery", "legend_bleeds_present", "artifact_awakens"],
    "repeat": ["refrain", "three_tries", "running_gag", "loop", "counting", "sequencing", "search_beats", "observational_motif", "rites_of_season", "checklist_beats", "chorus_refrain", "clue_trial_reveal", "three_trials", "campfire_chapter", "series_button"],
    "snd": ["whoosh", "boing", "pop", "shhh", "crunch", "zap", "clang", "plink", "swish", "mmm", "thrum", "click", "snap", "moo", "bam", "clack", "ding", "hm", "mm", "thud", "whoom", "whizz", "splash"],
    "themes": ["bedtime", "cozy", "animal", "toy", "tiny_world", "friendship", "mischief", "retry", "colors", "counting", "city", "season", "lost_found", "music", "family", "school", "portal_fantasy", "art", "pattern", "kindness", "farm", "chorus", "comfort", "feelings", "mentor", "winter", "quest", "identity", "found_family", "responsibility", "courage", "mystery", "survival", "magic_school", "sports", "horror_safe", "myth_adventure", "coming_of_age", "dragon", "ghosts", "detective"]
  };

  /**
   * Get the global codebook (synchronous - data is embedded)
   */
  static getCodebook(): GlobalCodebook {
    if (!this.codebook) {
      this.codebook = { ...this.CODEBOOK_DATA };
    }
    return this.codebook;
  }

  /**
   * Resolve indexed references to actual values
   */
  static resolveIndexes<T extends string | number>(
    arrayName: keyof GlobalCodebook,
    indexes: (number | string)[]
  ): string[] {
    const codebook = this.getCodebook();
    const sourceArray = codebook[arrayName] as string[];
    
    if (!Array.isArray(sourceArray)) {
      console.warn(`⚠️ Invalid codebook array: ${String(arrayName)}`);
      return [];
    }

    return indexes.map(index => {
      if (typeof index === 'string') {
        return index; // Direct string values
      }
      
      if (typeof index === 'number' && index >= 0 && index < sourceArray.length) {
        return sourceArray[index];
      }
      
      console.warn(`⚠️ Invalid index ${index} for ${String(arrayName)}`);
      return `unknown_${index}`;
    }).filter(Boolean);
  }

  /**
   * Get a specific array from the codebook
   */
  static getArray(arrayName: keyof GlobalCodebook): string[] {
    const codebook = this.getCodebook();
    return (codebook[arrayName] as string[]) || [];
  }

  /**
   * Find index of a value in a codebook array
   */
  static findIndex(arrayName: keyof GlobalCodebook, value: string): number {
    const array = this.getArray(arrayName);
    return array.indexOf(value);
  }

  /**
   * Get codebook metadata
   */
  static getMetadata() {
    const codebook = this.getCodebook();
    return {
      schema: codebook.schema,
      version: codebook.v,
      totalElements: Object.keys(codebook).filter(k => Array.isArray(codebook[k as keyof GlobalCodebook])).length,
      arrays: Object.keys(codebook).filter(k => Array.isArray(codebook[k as keyof GlobalCodebook]))
    };
  }
}