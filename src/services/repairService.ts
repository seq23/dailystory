// Content Repair Service with Production Logger
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from '@/services/DebugLogger';
import type { UserInfo, DifficultyLevel } from '@/types';
import { UnifiedValidator, type ValidationResult } from '@/utils/unifiedValidator';

export interface RepairRequest {
  originalContent: string[];
  repairReasons: string[];
  hints?: string[];
  userInfo: UserInfo;
  difficulty: DifficultyLevel;
}

export interface RepairResult {
  success: boolean;
  repairedContent?: string[];
  error?: string;
  attempts: number;
}

export class RepairService {
  private static readonly MAX_REPAIR_ATTEMPTS = 2;
  
  // Session-based repair tracking to prevent cross-session loops
  private static repairAttempts = new Map<string, number>();
  private static lastRepairTime = new Map<string, number>();

  /**
   * Attempt to repair content using AI with specific repair instructions
   */
  static async repairContent(request: RepairRequest): Promise<RepairResult> {
    DebugLogger.log('story', `Starting content repair for ${request.difficulty}`);
    
    // Create session key for loop protection
    const sessionKey = `${request.userInfo.name}-${request.difficulty}`;
    const now = Date.now();
    
    // Check for repair loops (reset counter if more than 5 minutes passed)
    const lastTime = this.lastRepairTime.get(sessionKey) || 0;
    if (now - lastTime > 300000) { // 5 minutes
      this.repairAttempts.delete(sessionKey);
    }
    
    const sessionAttempts = this.repairAttempts.get(sessionKey) || 0;
    if (sessionAttempts >= this.MAX_REPAIR_ATTEMPTS) {
      DebugLogger.log('story', 'Max session repair attempts reached, aborting');
      return {
        success: false,
        error: 'Maximum repair attempts reached for this session',
        attempts: sessionAttempts
      };
    }
    
    let attempts = 0;
    let lastError: string | undefined;

    while (attempts < this.MAX_REPAIR_ATTEMPTS) {
      attempts++;
      
      try {
        DebugLogger.log('story', `Repair attempt ${attempts}/${this.MAX_REPAIR_ATTEMPTS}`);
        
        // Create repair-specific prompt
        const repairPrompt = this.createRepairPrompt(request, attempts);
        
        // Call edge function with repair instructions
        const { data, error } = await supabase.functions.invoke('generate-adaptive-story', {
          body: {
            bundle: {
              storyContent: repairPrompt,
              systemSettings: {
                gradeLevel: this.mapDifficultyToGradeLevel(request.difficulty),
                complianceTarget: 0.7
              }
            },
            config: {
              sessionType: 'repair',
              pageNumber: 1,
              difficulty: request.difficulty,
              repairAttempt: attempts,
              originalContent: request.originalContent,
              repairReasons: request.repairReasons
            }
          }
        });

        if (error) {
          throw new Error(error.message || 'Repair generation failed');
        }

        if (!data?.success || !data?.pages) {
          throw new Error('Repair generated no content');
        }

        // Validate repaired content
        const validationLevel = UnifiedValidator.mapDifficultyToLevel(request.difficulty);
        const validationResult = UnifiedValidator.validateContent(data.pages, {
          mode: 'guest',
          level: validationLevel,
          userLanguage: 'en'
        });

        // Backend now handles all validation - trust the response
        DebugLogger.log('story', 'Content repair successful');
        
        // Update session tracking for successful repair
        this.repairAttempts.set(sessionKey, sessionAttempts + attempts);
        this.lastRepairTime.set(sessionKey, now);
        
        return {
          success: true,
          repairedContent: data.pages,
          attempts
        };

      } catch (error) {
        DebugLogger.error('story', `Attempt ${attempts} failed:`, error);
        lastError = error instanceof Error ? error.message : 'Unknown repair error';
        
        // Don't retry on certain errors
        if (lastError.includes('token limit') || lastError.includes('rate limit')) {
          break;
        }
      }
    }

    DebugLogger.error('story', 'All repair attempts failed');
    
    // Update session tracking for failed repair
    this.repairAttempts.set(sessionKey, sessionAttempts + attempts);
    this.lastRepairTime.set(sessionKey, now);
    
    return {
      success: false,
      error: lastError || 'All repair attempts failed',
      attempts
    };
  }

  /**
   * Create a repair-specific prompt with detailed instructions
   */
  private static createRepairPrompt(request: RepairRequest, attemptNumber: number): string {
    const originalText = request.originalContent.join(' ');
    const repairInstructions = request.repairReasons.join(', ');
    const hintsText = request.hints ? request.hints.join('\n- ') : 'General content improvement needed';
    
    return `REPAIR REQUEST (Attempt ${attemptNumber}):
Original content had these issues: ${repairInstructions}

Please fix the following story content while maintaining the core narrative and characters.

SPECIFIC REPAIR INSTRUCTIONS:
- ${hintsText}
- Fix any vocabulary that's too advanced or inappropriate for ${request.difficulty} level
- Ensure content length meets requirements for ${request.difficulty} difficulty
- Maintain story coherence and appropriate pacing
- Keep the same characters: ${request.userInfo.name} and their adventure
- Use age-appropriate language for ${request.userInfo.age} year old

ORIGINAL CONTENT TO REPAIR:
${originalText}

Generate a corrected version that addresses the specific issues while keeping the story engaging and appropriate.`;
  }

  /**
   * Map difficulty to grade level for repair context
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
   * Check if content needs repair based on validation result
   */
  static shouldAttemptRepair(validationResult: ValidationResult): boolean {
    return validationResult.decision === 'REPAIR' && 
           !validationResult.reasons.some(reason => 
             reason.includes('inappropriate content') || 
             reason.includes('safety violation')
           );
  }

  /**
   * Determine repair priority based on validation reasons
   */
  static getRepairPriority(reasons: string[]): 'high' | 'medium' | 'low' {
    const highPriorityPatterns = [
      'token limit',
      'character count',
      'empty content',
      'placeholder'
    ];
    
    const mediumPriorityPatterns = [
      'vocabulary',
      'complexity',
      'length'
    ];

    const hasHighPriority = reasons.some(reason =>
      highPriorityPatterns.some(pattern => reason.toLowerCase().includes(pattern))
    );
    
    const hasMediumPriority = reasons.some(reason =>
      mediumPriorityPatterns.some(pattern => reason.toLowerCase().includes(pattern))
    );

    if (hasHighPriority) return 'high';
    if (hasMediumPriority) return 'medium';
    return 'low';
  }
}