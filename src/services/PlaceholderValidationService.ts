// Placeholder Validation Service
// Comprehensive validation and audit of placeholder usage

import { UserInfo } from "@/types";
import { resolveAllPlaceholders, resolveCanonicalPlaceholders, resolveMicroPlaceholders } from "@/utils/placeholderResolver";

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

export class PlaceholderValidationService {
  // Core placeholders that should be supported everywhere
  private static readonly CORE_PLACEHOLDERS = [
    'userName', 'favoriteColor', 'favoriteAnimal', 
    'favoriteFood', 'hobbies', 'specialRequest'
  ];

  // Micro placeholders for advanced features
  private static readonly MICRO_PLACEHOLDERS = [
    'animal', 'friend', 'setting', 'adjective', 
    'object', 'action', 'pronoun', 'food', 'color'
  ];

  /**
   * Validate placeholder resolution in text
   */
  static validatePlaceholders(
    text: string, 
    userInfo: UserInfo,
    pageText?: string
  ): PlaceholderValidationResult {
    const originalPlaceholders = this.extractPlaceholders(text);
    
    try {
      const resolvedText = resolveAllPlaceholders(text, { 
        userInfo, 
        pageText 
      });
      
      const remainingPlaceholders = this.extractPlaceholders(resolvedText);
      const missingRequired = this.getMissingRequiredData(userInfo);
      
      const validationScore = this.calculateValidationScore(
        originalPlaceholders,
        remainingPlaceholders,
        missingRequired
      );

      const recommendations = this.generateRecommendations(
        originalPlaceholders,
        remainingPlaceholders,
        missingRequired
      );

      return {
        isValid: remainingPlaceholders.length === 0 && missingRequired.length === 0,
        missingPlaceholders: missingRequired,
        unresolvedPlaceholders: remainingPlaceholders,
        resolvedText,
        validationScore,
        recommendations
      };

    } catch (error) {
      console.error('❌ Placeholder validation error:', error);
      
      return {
        isValid: false,
        missingPlaceholders: [],
        unresolvedPlaceholders: originalPlaceholders,
        resolvedText: text,
        validationScore: 0,
        recommendations: ['Error occurred during placeholder resolution']
      };
    }
  }

  /**
   * Audit placeholder coverage across templates
   */
  static auditPlaceholderCoverage(templates: string[]): PlaceholderCoverage {
    const allPlaceholders = [...this.CORE_PLACEHOLDERS, ...this.MICRO_PLACEHOLDERS];
    const foundPlaceholders = new Set<string>();

    templates.forEach(template => {
      this.extractPlaceholders(template).forEach(ph => {
        foundPlaceholders.add(ph);
      });
    });

    const found = Array.from(foundPlaceholders);
    const missing = allPlaceholders.filter(ph => !found.includes(ph));
    const coverage = found.length / allPlaceholders.length;

    return {
      required: this.CORE_PLACEHOLDERS,
      optional: this.MICRO_PLACEHOLDERS,
      found,
      missing,
      coverage
    };
  }

  /**
   * Validate user data completeness for placeholder resolution
   */
  static validateUserDataCompleteness(userInfo: UserInfo): {
    isComplete: boolean;
    missingFields: string[];
    completeness: number;
    recommendations: string[];
  } {
    const requiredFields = [
      { key: 'name', label: 'Child name' },
      { key: 'favoriteColor', label: 'Favorite color' },
      { key: 'favoriteAnimal', label: 'Favorite animal' },
      { key: 'favoriteFood', label: 'Favorite food' },
      { key: 'hobbies', label: 'Hobbies' },
      { key: 'specialRequest', label: 'Special request/theme' }
    ];

    const missingFields: string[] = [];
    let completeness = 0;

    requiredFields.forEach(field => {
      const value = userInfo[field.key as keyof UserInfo];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        missingFields.push(field.label);
      } else {
        completeness++;
      }
    });

    completeness = completeness / requiredFields.length;

    const recommendations = this.generateUserDataRecommendations(missingFields);

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completeness,
      recommendations
    };
  }

  /**
   * Test placeholder resolution with mock data
   */
  static testPlaceholderResolution(
    template: string,
    scenarios: Array<{ name: string; userInfo: Partial<UserInfo>; pageText?: string }>
  ): Array<{
    scenario: string;
    result: PlaceholderValidationResult;
  }> {
    return scenarios.map(scenario => ({
      scenario: scenario.name,
      result: this.validatePlaceholders(
        template,
        this.createMockUserInfo(scenario.userInfo),
        scenario.pageText
      )
    }));
  }

  // Private helper methods

  private static extractPlaceholders(text: string): string[] {
    const matches = text.match(/\{([^}]+)\}/g) || [];
    return matches.map(match => match.slice(1, -1));
  }

  private static getMissingRequiredData(userInfo: UserInfo): string[] {
    const missing: string[] = [];
    
    if (!userInfo.name?.trim()) missing.push('userName');
    if (!userInfo.favoriteColor?.trim()) missing.push('favoriteColor');
    if (!userInfo.favoriteAnimal?.trim()) missing.push('favoriteAnimal');
    if (!userInfo.favoriteFood?.trim()) missing.push('favoriteFood');
    if (!userInfo.hobbies?.trim()) missing.push('hobbies');
    if (!userInfo.specialRequest?.trim()) missing.push('specialRequest');

    return missing;
  }

  private static calculateValidationScore(
    originalPlaceholders: string[],
    unresolvedPlaceholders: string[],
    missingRequired: string[]
  ): number {
    if (originalPlaceholders.length === 0) return 1;

    const resolved = originalPlaceholders.length - unresolvedPlaceholders.length;
    const resolutionScore = resolved / originalPlaceholders.length;
    
    // Penalty for missing required data
    const requiredPenalty = missingRequired.length * 0.1;
    
    return Math.max(0, resolutionScore - requiredPenalty);
  }

  private static generateRecommendations(
    originalPlaceholders: string[],
    unresolvedPlaceholders: string[],
    missingRequired: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (unresolvedPlaceholders.length > 0) {
      recommendations.push(
        `Unresolved placeholders found: ${unresolvedPlaceholders.join(', ')}. Check spelling and ensure they are supported.`
      );
    }

    if (missingRequired.length > 0) {
      recommendations.push(
        `Missing required user data for: ${missingRequired.join(', ')}. Collect this information for better personalization.`
      );
    }

    if (originalPlaceholders.length === 0) {
      recommendations.push(
        'No placeholders found in template. Consider adding personalization elements.'
      );
    }

    return recommendations;
  }

  private static generateUserDataRecommendations(missingFields: string[]): string[] {
    const recommendations: string[] = [];

    if (missingFields.length === 0) {
      recommendations.push('User profile is complete! All placeholders can be properly resolved.');
      return recommendations;
    }

    recommendations.push(
      `Complete the following fields for better story personalization: ${missingFields.join(', ')}`
    );

    if (missingFields.includes('Child name')) {
      recommendations.push('Child name is essential for character detection and story personalization.');
    }

    if (missingFields.includes('Favorite animal')) {
      recommendations.push('Favorite animal helps create engaging secondary characters and story themes.');
    }

    if (missingFields.includes('Special request/theme')) {
      recommendations.push('Special requests allow for themed stories (courage, friendship, adventure, etc.).');
    }

    return recommendations;
  }

  private static createMockUserInfo(partial: Partial<UserInfo>): UserInfo {
    return {
      name: 'Test Child',
      age: 7,
      grade: '2nd',
      nativeLanguage: 'en',
      learningGoal: 'improve-english-reading',
      avatar: { type: 'prefer-not-to-answer', skinTone: 'medium' },
      favoriteColor: 'blue',
      favoriteAnimal: 'cat',
      hobbies: 'drawing',
      favoriteFood: 'pizza',
      specialRequest: 'adventure',
      ...partial
    };
  }
}