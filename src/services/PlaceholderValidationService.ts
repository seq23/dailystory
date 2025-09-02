// Minimal placeholder validation stub - real validation handled by unified edge function
import type { UserInfo } from '@/types';

export interface PlaceholderValidationResult {
  isValid: boolean;
  missingPlaceholders: string[];
  unresolvedPlaceholders: string[];
  resolvedText: string;
  validationScore: number;
  recommendations: string[];
}

export interface PlaceholderCoverage {
  required: string[];
  optional: string[];
  found: string[];
  missing: string[];
  coverage: number;
}

export interface UserDataCompletenessResult {
  isComplete: boolean;
  missingFields: string[];
  completeness: number;
  recommendations: string[];
}

// Minimal stub class for testing components - real validation handled by edge functions
export class PlaceholderValidationService {
  static validatePlaceholders(
    text: string,
    userInfo: UserInfo,
    pageText?: string
  ): PlaceholderValidationResult {
    return {
      isValid: true,
      missingPlaceholders: [],
      unresolvedPlaceholders: [],
      resolvedText: text,
      validationScore: 1.0,
      recommendations: ['Validation handled by unified edge function']
    };
  }

  static validateUserDataCompleteness(userInfo: UserInfo): UserDataCompletenessResult {
    return {
      isComplete: true,
      missingFields: [],
      completeness: 1.0,
      recommendations: ['User profile is complete!']
    };
  }

  static analyzePlaceholderCoverage(template: string): PlaceholderCoverage {
    return {
      required: [],
      optional: [],
      found: [],
      missing: [],
      coverage: 1.0
    };
  }
}