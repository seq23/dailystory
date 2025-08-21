import { useState, useCallback } from 'react';
import { validateTheme } from '@/utils/themeValidation';
import { InputSanitizer } from '@/utils/inputSanitizer';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasTriedSubmit: boolean;
  hasCoppaViolation: boolean;
}

export const useValidationOnSubmit = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    hasTriedSubmit: false,
    hasCoppaViolation: false
  });

  const validateField = useCallback((value: string, field: string, context: 'name' | 'interest' | 'theme' | 'general' = 'general') => {
    let errors: string[] = [];
    let hasCoppaViolation = false;

    if (field === 'theme' && value) {
      // Use theme validation for themes
      const result = validateTheme(value);
      if (!result.valid) {
        errors = result.errors;
        hasCoppaViolation = result.coppaViolation;
      }
    } else if (value) {
      // Use input sanitizer for other fields
      const validation = InputSanitizer.validateChildSafeInput(value, context);
      if (!validation.isValid) {
        errors = validation.issues;
        // Check if it's a COPPA violation based on issue content
        hasCoppaViolation = validation.issues.some(issue => 
          issue.includes('personal') || 
          issue.includes('contact') || 
          issue.includes('number') ||
          issue.includes('email') ||
          issue.includes('address')
        );
      }
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      hasCoppaViolation 
    };
  }, []);

  const validateFormOnSubmit = useCallback((formData: Record<string, any>) => {
    let allErrors: string[] = [];
    let hasCoppaViolation = false;

    // Validate each field in the form
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        const context = key === 'displayName' ? 'name' : 
                      key === 'interests' || key === 'hobbies' ? 'interest' :
                      key === 'themes' ? 'theme' : 'general';
        
        const validation = validateField(String(value), key, context);
        if (!validation.isValid) {
          allErrors.push(...validation.errors);
          if (validation.hasCoppaViolation) {
            hasCoppaViolation = true;
          }
        }
      }
    });

    setValidationState({
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: [],
      hasTriedSubmit: true,
      hasCoppaViolation
    });

    return allErrors.length === 0;
  }, [validateField]);

  const resetValidation = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      hasTriedSubmit: false,
      hasCoppaViolation: false
    });
  }, []);

  return {
    validationState,
    validateFormOnSubmit,
    resetValidation,
    validateField
  };
};