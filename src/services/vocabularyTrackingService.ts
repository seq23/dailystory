import { supabase } from "@/integrations/supabase/client";

export class VocabularyTrackingService {
  static async logEncounter(word: string, definition: string, complexity?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only track for authenticated users

      // Check if the word already exists for this user
      const { data: existing } = await supabase
        .from('vocabulary_progress')
        .select('id, times_encountered')
        .eq('user_id', user.id)
        .eq('word', word)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('vocabulary_progress')
          .update({
            definition,
            times_encountered: (existing.times_encountered || 1) + 1,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('vocabulary_progress')
          .insert([{ 
            user_id: user.id, 
            word, 
            definition, 
            times_encountered: 1,
            mastery_level: 1,
            first_encountered_at: new Date().toISOString(),
            last_reviewed_at: new Date().toISOString()
          }]);
      }
    } catch (e) {
      console.warn('Failed to log vocabulary encounter', e);
    }
  }
}
