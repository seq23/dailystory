// Hint Regeneration Service - Handles RETRY_WITH_HINT validation decisions
// Regenerates content completely with specific hints for the AI

import { supabase } from '@/integrations/supabase/client';
import type { UserInfo, DifficultyLevel } from '@/types';
import { UnifiedValidator, type ValidationResult } from '@/utils/unifiedValidator';

export interface HintRegenerationRequest {
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
  hints: string[];
  failureReasons: string[];
  originalAttempt?: string[];
  sessionType: 'guest' | 'live';
  pageNumber?: number;
  existingStory?: string;
}

export interface HintRegenerationResult {
  success: boolean;
  content?: string[];
  error?: string;
  attempts: number;
}

export class HintRegenerationService {
  private static readonly MAX_REGENERATION_ATTEMPTS = 2;

  /**
   * Regenerate content completely using validation hints
   */
  static async regenerateWithHints(request: HintRegenerationRequest): Promise<HintRegenerationResult> {
    console.log('🔄 HintRegeneration: Starting content regeneration with hints for', request.difficulty);
    
    let attempts = 0;
    let lastError: string | undefined;

    while (attempts < this.MAX_REGENERATION_ATTEMPTS) {
      attempts++;
      
      try {
        console.log(`🔄 HintRegeneration: Attempt ${attempts}/${this.MAX_REGENERATION_ATTEMPTS}`);
        
        // Create hint-enhanced prompt
        const hintPrompt = this.createHintPrompt(request, attempts);
        
        // Determine appropriate session type
        const sessionType = request.sessionType === 'guest' ? 'netflix' : 'live';
        
        // Call edge function with hint instructions
        const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
          body: {
            bundle: {
              storyContent: hintPrompt,
              systemSettings: {
                gradeLevel: this.mapDifficultyToGradeLevel(request.difficulty),
                complianceTarget: 0.7
              }
            },
            config: {
              sessionType,
              pageNumber: request.pageNumber || 1,
              difficulty: request.difficulty,
              regenerationAttempt: attempts,
              hints: request.hints,
              failureReasons: request.failureReasons
            }
          }
        });

        if (error) {
          throw new Error(error.message || 'Hint regeneration failed');
        }

        if (!data?.success || !data?.pages) {
          throw new Error('Hint regeneration generated no content');
        }

        // Validate regenerated content
        const validationLevel = UnifiedValidator.mapDifficultyToLevel(request.difficulty);
        const validationResult = UnifiedValidator.validateContent(data.pages, {
          mode: request.sessionType,
          level: validationLevel,
          userLanguage: 'en'
        });

        if (validationResult.decision === 'ACCEPT' || validationResult.decision === 'REPAIR_AND_SPLIT') {
          console.log('✅ HintRegeneration: Content regeneration successful');
          
          return {
            success: true,
            content: validationResult.content || data.pages,
            attempts
          };
        } else if (validationResult.decision === 'RETRY_WITH_HINT' && attempts < this.MAX_REGENERATION_ATTEMPTS) {
          console.log(`🔄 HintRegeneration: Still needs regeneration, trying again (${attempts}/${this.MAX_REGENERATION_ATTEMPTS})`);
          lastError = `Still needs regeneration: ${validationResult.reasons.join(', ')}`;
          
          // Update hints for next attempt
          request.hints = [
            ...request.hints,
            ...(validationResult.hints || [])
          ];
          continue;
        } else {
          lastError = `Regeneration validation failed: ${validationResult.reasons.join(', ')}`;
          break;
        }

      } catch (error) {
        console.error(`❌ HintRegeneration: Attempt ${attempts} failed:`, error);
        lastError = error instanceof Error ? error.message : 'Unknown regeneration error';
        
        // Don't retry on certain errors
        if (lastError.includes('token limit') || lastError.includes('rate limit')) {
          break;
        }
      }
    }

    console.log('❌ HintRegeneration: All regeneration attempts failed');
    return {
      success: false,
      error: lastError || 'All regeneration attempts failed',
      attempts
    };
  }

  /**
   * Create a hint-enhanced prompt for regeneration
   */
  private static createHintPrompt(request: HintRegenerationRequest, attemptNumber: number): string {
    const characterDescription = `${request.userInfo.name} (age ${request.userInfo.age})`;
    const hintsText = request.hints.join('\n- ');
    const failuresText = request.failureReasons.join(', ');
    
    let basePrompt = '';
    
    if (request.sessionType === 'guest') {
      basePrompt = `Generate a complete 6-page story for ${characterDescription}.

IMPORTANT REQUIREMENTS BASED ON PREVIOUS FAILURES:
Previous attempt failed because: ${failuresText}

SPECIFIC GENERATION HINTS (Attempt ${attemptNumber}):
- ${hintsText}

TARGET SPECIFICATIONS:
- Difficulty level: ${request.difficulty}
- Age appropriate for ${request.userInfo.age} year old
- Reading level suitable for ${request.userInfo.grade || 'elementary'} grade
- Include character: ${request.userInfo.name}
- Favorite animal: ${request.userInfo.favoriteAnimal || 'friendly creature'}
- Theme: ${request.userInfo.hobbies || 'adventure'}

CONTENT GUIDELINES:
- Create exactly 6 pages of engaging content
- Each page should advance the story meaningfully
- Include dialogue, action, and description
- Ensure age-appropriate vocabulary and themes
- Build to a satisfying conclusion by page 6`;
    } else {
      // Live mode - single page
      basePrompt = `Generate the ${request.pageNumber === 1 ? 'first' : 'next'} page of a story for ${characterDescription}.

IMPORTANT REQUIREMENTS BASED ON PREVIOUS FAILURES:
Previous attempt failed because: ${failuresText}

SPECIFIC GENERATION HINTS (Attempt ${attemptNumber}):
- ${hintsText}

TARGET SPECIFICATIONS:
- Difficulty level: ${request.difficulty}
- Age appropriate for ${request.userInfo.age} year old
- This is page ${request.pageNumber || 1} of an ongoing story
${request.existingStory ? `\nPREVIOUS STORY CONTEXT:\n${request.existingStory}` : ''}

CONTENT GUIDELINES:
- Create a single engaging page that continues the narrative
- Include rich descriptions and character development
- Maintain story coherence with previous content
- End with momentum for the next page
- Use age-appropriate vocabulary and themes`;
    }

    return basePrompt;
  }

  /**
   * Map difficulty to grade level for regeneration context
   */
  private static mapDifficultyToGradeLevel(difficulty: DifficultyLevel): number {
    const mapping = {
      beginner: 0,
      easy: 1, 
      medium: 2,
      hard: 3,
      expert: 4
    };
    
    return mapping[difficulty] ?? 2;
  }

  /**
   * Check if content should use hint regeneration based on validation result
   */
  static shouldAttemptHintRegeneration(validationResult: ValidationResult): boolean {
    return validationResult.decision === 'RETRY_WITH_HINT' && 
           Array.isArray(validationResult.hints) && 
           validationResult.hints.length > 0;
  }

  /**
   * Determine regeneration priority based on validation hints
   */
  static getRegenerationPriority(hints: string[]): 'high' | 'medium' | 'low' {
    const highPriorityPatterns = [
      'insufficient content',
      'too short',
      'empty',
      'generate content'
    ];
    
    const mediumPriorityPatterns = [
      'more detailed',
      'descriptive',
      'character interactions'
    ];

    const hasHighPriority = hints.some(hint =>
      highPriorityPatterns.some(pattern => hint.toLowerCase().includes(pattern))
    );
    
    const hasMediumPriority = hints.some(hint =>
      mediumPriorityPatterns.some(pattern => hint.toLowerCase().includes(pattern))
    );

    if (hasHighPriority) return 'high';
    if (hasMediumPriority) return 'medium';
    return 'low';
  }
}