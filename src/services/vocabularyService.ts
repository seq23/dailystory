import { supabase } from "@/integrations/supabase/client";
import type { UserInfo, DifficultyLevel } from "@/types";
import { 
  getVocabularySet, 
  validateSentence,
  difficultyToGradeLevel,
  type GradeLevel
} from "@/constants/gradeBased";

export interface VocabularyIntegration {
  userSpecified: {
    formWords: string[];          // Priority 1: Direct form input (targetVocabulary)
    specialRequestWords: string[]; // Priority 1: Parsed from special request
    teacherWords: string[];       // Priority 1: From parent dashboard
  };
  systemVocabulary: {
    level: GradeLevel;           // Priority 2: Grade-appropriate validation
    complianceTarget: number;    // Priority 2: Compliance percentage (50% for Level 0, etc.)
  };
  metadata: {
    totalUserWords: number;
    priorityInstructions: string;
    sources: string[];
  };
}

export class VocabularyService {
  /**
   * Fetches all vocabulary from all 4 sources with proper prioritization
   * Priority Order: User Inputs (HIGHEST) → System Vocabulary (validation only)
   */
  static async fetchAllVocabulary(userInfo: UserInfo): Promise<VocabularyIntegration> {
    try {
      const sources: string[] = [];
      const formWords: string[] = [];
      const specialRequestWords: string[] = [];
      const teacherWords: string[] = [];

    // SOURCE 1: Direct form input (targetVocabulary) - HIGHEST PRIORITY
    if (userInfo.targetVocabulary) {
      const words = userInfo.targetVocabulary
        .split(/[,\s]+/)
        .map(word => word.trim().toLowerCase())
        .filter(Boolean);
      
      formWords.push(...words);
      sources.push('User Form Input');
    }

    // SOURCE 2: Special request parsing ("target vocabulary: word1, word2") - HIGHEST PRIORITY
    if (userInfo.specialRequest) {
      const vocabMatch = userInfo.specialRequest.toLowerCase().match(/target vocabulary\s*:\s*([^\n;]+)/);
      if (vocabMatch) {
        const words = vocabMatch[1]
          .split(/[,/]/)
          .map(word => word.trim().toLowerCase())
          .filter(Boolean);
        
        specialRequestWords.push(...words);
        sources.push('Special Request Dialog');
      }
    }

    // SOURCE 3: Database teacher words (async fetch) - HIGHEST PRIORITY
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('story_preferences, active_child_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          const storyPrefs = data.story_preferences as any || {};
          const activeChildId = data.active_child_id || 'default';
          const lists = storyPrefs.teacherWordLists || {};
          let teacherWordsArray = lists[activeChildId];
          
          if (!Array.isArray(teacherWordsArray) || teacherWordsArray.length === 0) {
            teacherWordsArray = lists['default'];
          }
          
          if (Array.isArray(teacherWordsArray) && teacherWordsArray.length > 0) {
            const words = teacherWordsArray
              .map(w => typeof w === 'string' ? w.trim().toLowerCase() : '')
              .filter(Boolean)
              .slice(0, 20);
            
            teacherWords.push(...words);
            sources.push('Parent Dashboard');
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch teacher words:', error);
    }

    // SOURCE 4: System vocabulary (backend validation only - NOT sent to edge function)
    const gradeLevel: GradeLevel = this.mapDifficultyToGrade(userInfo.difficultyLevel || 'beginner');
    const complianceTarget = gradeLevel === 0 ? 0.5 : 0.6; // 50% for Level 0, 60% for others

    const totalUserWords = formWords.length + specialRequestWords.length + teacherWords.length;
    const priorityInstructions = this.generatePriorityInstructions(totalUserWords, sources);

      return {
        userSpecified: {
          formWords: Array.from(new Set(formWords)).slice(0, 10),
          specialRequestWords: Array.from(new Set(specialRequestWords)).slice(0, 10),
          teacherWords: Array.from(new Set(teacherWords)).slice(0, 20)
        },
        systemVocabulary: {
          level: gradeLevel,
          complianceTarget
        },
        metadata: {
          totalUserWords,
          priorityInstructions,
          sources
        }
      };
    } catch (error) {
      console.warn('⚠️ VocabularyService failed silently:', error);
      return {
        userSpecified: { formWords: [], specialRequestWords: [], teacherWords: [] },
        systemVocabulary: { level: 2, complianceTarget: 0.7 },
        metadata: { totalUserWords: 0, priorityInstructions: 'Safe defaults due to error', sources: [] }
      };
    }
  }

  private static mapDifficultyToGrade(difficulty: DifficultyLevel): GradeLevel {
    return difficultyToGradeLevel(difficulty);
  }

  private static generatePriorityInstructions(totalUserWords: number, sources: string[]): string {
    if (totalUserWords === 0) {
      return "No user-specified vocabulary. Use grade-appropriate system vocabulary.";
    }
    return `PRIORITY VOCABULARY: ${totalUserWords} user-specified words from ${sources.join(', ')}. These words MUST be included and take precedence over all system vocabulary.`;
  }

  /**
   * Enhanced validation that always allows user-specified words
   */
  static validateSentenceWithPriority(
    sentence: string, 
    vocabularyIntegration: VocabularyIntegration,
    userName?: string
  ): { isValid: boolean; invalidWords: string[]; compliancePercentage: number } {
    const allUserWords = [
      ...vocabularyIntegration.userSpecified.formWords,
      ...vocabularyIntegration.userSpecified.specialRequestWords,
      ...vocabularyIntegration.userSpecified.teacherWords
    ];

    // First validate using system vocabulary
    const systemValidation = validateSentence(
      sentence, 
      vocabularyIntegration.systemVocabulary.level, 
      userName
    );

    // Remove user-specified words from invalid list (they're always allowed)
    const filteredInvalidWords = systemValidation.invalidWords.filter(word => 
      !allUserWords.includes(word.toLowerCase())
    );

    // Recalculate compliance with user words allowed
    const tokens = sentence.toLowerCase().split(/\s+/).filter(Boolean);
    const validTokens = tokens.filter(token => 
      allUserWords.includes(token) || !filteredInvalidWords.includes(token)
    );
    
    const compliancePercentage = tokens.length > 0 ? validTokens.length / tokens.length : 1;
    const isValid = compliancePercentage >= vocabularyIntegration.systemVocabulary.complianceTarget;

    return {
      isValid,
      invalidWords: filteredInvalidWords,
      compliancePercentage
    };
  }

  /**
   * Get consolidated user vocabulary for edge function
   */
  static getUserVocabulary(vocabularyIntegration: VocabularyIntegration): string[] {
    return [
      ...vocabularyIntegration.userSpecified.formWords,
      ...vocabularyIntegration.userSpecified.specialRequestWords,
      ...vocabularyIntegration.userSpecified.teacherWords
    ];
  }

  /**
   * Get system settings for edge function
   */
  static getSystemSettings(vocabularyIntegration: VocabularyIntegration) {
    return {
      gradeLevel: vocabularyIntegration.systemVocabulary.level,
      complianceTarget: vocabularyIntegration.systemVocabulary.complianceTarget
    };
  }
}