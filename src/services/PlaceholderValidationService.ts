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

// Enhanced placeholder validation service with real validation logic
export class PlaceholderValidationService {
  static validatePlaceholders(
    text: string,
    userInfo: UserInfo,
    pageText?: string
  ): PlaceholderValidationResult {
    const lines = text.split('\n');
    const placeholderRegex = /\{([^}]+)\}/g;
    const missingPlaceholders: string[] = [];
    const unresolvedPlaceholders: string[] = [];
    
    let resolvedText = text;
    let validationScore = 1.0;
    const recommendations: string[] = [];

    // Find all placeholders
    let match;
    while ((match = placeholderRegex.exec(text)) !== null) {
      const placeholder = match[1];
      unresolvedPlaceholders.push(placeholder);
      
      // Check if we have user data to resolve this placeholder
      const fieldValue = this.getPlaceholderValue(placeholder, userInfo);
      if (fieldValue) {
        resolvedText = resolvedText.replace(match[0], fieldValue);
      } else {
        missingPlaceholders.push(placeholder);
        validationScore -= 0.1;
      }
    }

    // Generate recommendations
    if (missingPlaceholders.length > 0) {
      recommendations.push(`Missing data for placeholders: ${missingPlaceholders.join(', ')}`);
    }
    
    if (validationScore < 0.8) {
      recommendations.push('Consider using more complete user profiles for better personalization');
    }

    return {
      isValid: missingPlaceholders.length === 0,
      missingPlaceholders,
      unresolvedPlaceholders: missingPlaceholders,
      resolvedText,
      validationScore: Math.max(0, validationScore),
      recommendations
    };
  }

  static validateUserDataCompleteness(userInfo: UserInfo): UserDataCompletenessResult {
    const requiredFields = ['name', 'age', 'favoriteColor', 'favoriteAnimal'];
    const optionalFields = ['favoriteFood', 'hobbies', 'specialRequest'];
    const allFields = [...requiredFields, ...optionalFields];
    
    const missingFields: string[] = [];
    let completeness = 0;

    // Check required fields
    requiredFields.forEach(field => {
      const value = (userInfo as any)[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        missingFields.push(field);
      } else {
        completeness += 0.6 / requiredFields.length; // Required fields worth 60%
      }
    });

    // Check optional fields
    optionalFields.forEach(field => {
      const value = (userInfo as any)[field];
      if (value && typeof value === 'string' && value.trim().length > 0) {
        completeness += 0.4 / optionalFields.length; // Optional fields worth 40%
      }
    });

    const recommendations: string[] = [];
    if (missingFields.length > 0) {
      recommendations.push(`Complete these fields for better personalization: ${missingFields.join(', ')}`);
    }
    
    if (completeness >= 0.9) {
      recommendations.push('Excellent profile completeness!');
    } else if (completeness >= 0.7) {
      recommendations.push('Good profile - consider adding more details for better stories');
    } else {
      recommendations.push('Profile needs more information for optimal story personalization');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completeness,
      recommendations
    };
  }

  static analyzePlaceholderCoverage(template: string): PlaceholderCoverage {
    const placeholderRegex = /\{([^}]+)\}/g;
    const found: string[] = [];
    const required = ['name', 'favoriteColor', 'favoriteAnimal'];
    const optional = ['favoriteFood', 'hobbies', 'specialRequest', 'age'];
    
    let match;
    while ((match = placeholderRegex.exec(template)) !== null) {
      const placeholder = match[1];
      if (!found.includes(placeholder)) {
        found.push(placeholder);
      }
    }

    const missing = required.filter(req => !found.includes(req));
    const coverage = found.length / (required.length + optional.length);

    return {
      required,
      optional,
      found,
      missing,
      coverage
    };
  }

  private static getPlaceholderValue(placeholder: string, userInfo: UserInfo): string | null {
    switch (placeholder.toLowerCase()) {
      case 'name':
      case 'username':
        return userInfo.name || null;
      case 'favoritecolor':
        return userInfo.favoriteColor || null;
      case 'favoriteanimal':
        return userInfo.favoriteAnimal || null;
      case 'favoritefood':
        return userInfo.favoriteFood || null;
      case 'hobbies':
        return userInfo.hobbies || null;
      case 'specialrequest':
        return userInfo.specialRequest || null;
      case 'age':
        return userInfo.age ? userInfo.age.toString() : null;
      default:
        return null;
    }
  }
}