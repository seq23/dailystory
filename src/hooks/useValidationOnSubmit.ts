import { useState, useCallback } from 'react';
import { validateTheme } from '@/utils/themeValidation';
import { InputSanitizer } from '@/utils/inputSanitizer';
import { useCOPPANotification } from './useCOPPANotification';
import { useIncidentLogger } from './useIncidentLogger';
import { useChildProfiles } from './useChildProfiles';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasTriedSubmit: boolean;
  hasCoppaViolation: boolean;
}

export const useValidationOnSubmit = () => {
  const { sendCOPPANotification } = useCOPPANotification();
  const { logIncident } = useIncidentLogger();
  const { activeChild } = useChildProfiles();
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

  const validateFormOnSubmit = useCallback(async (formData: Record<string, any>) => {
    let allErrors: string[] = [];
    let hasCoppaViolation = false;
    const coppaViolationsByField: Record<string, string[]> = {};

    // Validate each field in the form
    for (const [key, value] of Object.entries(formData)) {
      if (value) {
        const context = key === 'displayName' ? 'name' : 
                      key === 'interests' || key === 'hobbies' ? 'interest' :
                      key === 'themes' ? 'theme' : 'general';
        
        const validation = validateField(String(value), key, context);
        if (!validation.isValid) {
          allErrors.push(...validation.errors);
          if (validation.hasCoppaViolation) {
            hasCoppaViolation = true;
            
            // Store violations by field for detailed reporting
            if (!coppaViolationsByField[key]) {
              coppaViolationsByField[key] = [];
            }
            coppaViolationsByField[key].push(...validation.errors.filter(error =>
              error.includes('personal') || 
              error.includes('contact') || 
              error.includes('number') ||
              error.includes('email') ||
              error.includes('address')
            ));
            
            // Log incident for real-time tracking
            await logIncident({
              childProfileId: activeChild?.id,
              violationType: validation.errors.join(', '),
              detectedContent: String(value),
              contextField: key
            });
          }
        }
      }
    }

    setValidationState({
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: [],
      hasTriedSubmit: true,
      hasCoppaViolation
    });

    // Send COPPA notification using real child/parent data
    if (hasCoppaViolation && allErrors.length > 0) {
      const childName = activeChild?.display_name || 'Child';
      const parentEmail = activeChild?.parent_email;
      
      if (parentEmail && parentEmail !== '') {
        const coppaViolations = Object.values(coppaViolationsByField).flat();
        const detectedContent = Object.entries(formData)
          .filter(([key, value]) => 
            coppaViolationsByField[key] && coppaViolationsByField[key].length > 0
          )
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        const notificationResult = await sendCOPPANotification({
          parentEmail,
          childName,
          violations: coppaViolations,
          detectedContent
        });

        console.log('COPPA notification sent:', notificationResult);
      } else {
        console.warn('No parent email available for child profile, skipping COPPA notification');
      }
    }

    return allErrors.length === 0;
  }, [validateField, sendCOPPANotification, logIncident, activeChild]);

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