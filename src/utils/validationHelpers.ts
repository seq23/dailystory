// Frontend validation helpers that re-export from shared utilities
// This bridges the gap between frontend code and shared backend utilities

import type { DifficultyLevel, ExpertGradeLevel } from '@/types';
import { 
  mapDifficultyToLevel as sharedMapDifficultyToLevel, 
  getExpectedPagesForService as sharedGetExpectedPagesForService,
  type ValidationLevel 
} from '../../supabase/functions/_shared/validation-utils';

/**
 * Map difficulty level to validation level - Frontend wrapper
 */
export function mapDifficultyToLevel(difficulty: DifficultyLevel | ExpertGradeLevel): ValidationLevel {
  return sharedMapDifficultyToLevel(difficulty);
}

/**
 * Get expected pages for service and level - Frontend wrapper  
 */
export function getExpectedPagesForService(service: 'netflix' | 'live', level: ValidationLevel): number | null {
  return sharedGetExpectedPagesForService(service, level);
}

// Re-export ValidationLevel type for frontend use
export type { ValidationLevel };