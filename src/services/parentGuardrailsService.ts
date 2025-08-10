import { supabase } from "@/integrations/supabase/client";
import type { DifficultyLevel, ExpertGradeLevel } from "@/types";

export type ParentGuardrails = {
  lockDifficulty: boolean;
  minDifficulty: DifficultyLevel;
  minExpertGrade: ExpertGradeLevel;
  allowDecreaseBelowMin?: boolean;
};

const DEFAULTS: ParentGuardrails = {
  lockDifficulty: false,
  minDifficulty: "beginner",
  minExpertGrade: "6th",
  allowDecreaseBelowMin: false,
};

export class ParentGuardrailsService {
  static async getGuardrails(): Promise<ParentGuardrails> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULTS;

    const { data, error } = await supabase
      .from("user_preferences")
      .select("reading_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Failed to fetch guardrails; using defaults", error);
      return DEFAULTS;
    }

    const prefs = (data?.reading_preferences as any) || {};
    return {
      lockDifficulty: !!prefs.lockDifficulty,
      minDifficulty: (prefs.minDifficulty as DifficultyLevel) || DEFAULTS.minDifficulty,
      minExpertGrade: (prefs.minExpertGrade as ExpertGradeLevel) || DEFAULTS.minExpertGrade,
      allowDecreaseBelowMin: !!prefs.allowDecreaseBelowMin,
    };
  }

  static async saveGuardrails(guardrails: ParentGuardrails): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if preferences row exists
    const { data: existing, error: fetchErr } = await supabase
      .from("user_preferences")
      .select("id, reading_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    const basePrefs = (existing && typeof existing.reading_preferences === 'object' && existing.reading_preferences)
      ? (existing.reading_preferences as Record<string, any>)
      : {};

    const reading_preferences = {
      ...basePrefs,
      lockDifficulty: !!guardrails.lockDifficulty,
      minDifficulty: guardrails.minDifficulty,
      minExpertGrade: guardrails.minExpertGrade,
      allowDecreaseBelowMin: !!guardrails.allowDecreaseBelowMin,
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("user_preferences")
        .update({ reading_preferences })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_preferences")
        .insert([{ user_id: user.id, reading_preferences }]);
      if (error) throw error;
    }
  }
}
