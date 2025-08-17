import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ContentSecurity, SecurityLogger } from "@/utils/security";
import type { UserInfo, DifficultyLevel } from "@/types";

export const useMultiStepForm = () => {
  const { t, i18n } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 7,
    grade: "PreK",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: {
      type: "boy",
      skinTone: "light"
    },
    favoriteColor: "",
    favoriteAnimal: "",
    hobbies: "",
    favoriteFood: "",
    specialRequest: "",
    targetVocabulary: "",
    difficultyLevel: "beginner",
    readingAbility: "beginner"
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Update form data
  const updateFormData = useCallback((updates: Partial<UserInfo>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when data is updated
    setShowValidationErrors(false);
    setValidationErrors([]);
  }, []);

  // Validate Step 1 (Essential fields)
  const validateStep1 = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push(t("userInfoForm.validation.nameRequired", "Please enter a name"));
    }
    
    if (!formData.age || formData.age < 3 || formData.age > 11) {
      errors.push(t("userInfoForm.validation.ageRequired", "Please select an age"));
    }
    
    if (!formData.grade) {
      errors.push(t("userInfoForm.validation.gradeRequired", "Please select a grade level"));
    }
    
    if (!formData.nativeLanguage) {
      errors.push(t("userInfoForm.validation.languageRequired", "Please select a language"));
    }

    return errors;
  }, [formData, t]);

  // Check if can advance to specific step
  const canAdvanceToStep = useCallback((step: 2 | 3): boolean => {
    if (step === 2) {
      return validateStep1().length === 0;
    }
    if (step === 3) {
      return validateStep1().length === 0; // Step 2 is optional
    }
    return false;
  }, [validateStep1]);

  // Check if can submit form (same as step 1 validation)
  const canSubmitForm = useCallback((): boolean => {
    return validateStep1().length === 0;
  }, [validateStep1]);

  // Navigate to specific step
  const advanceToStep = useCallback((step: 2 | 3) => {
    if (canAdvanceToStep(step)) {
      setCurrentStep(step);
    }
  }, [canAdvanceToStep]);

  // Go back to previous step
  const goBackToStep = useCallback((step: 1 | 2) => {
    setCurrentStep(step);
  }, []);

  // Submit form with final validation
  const submitForm = useCallback((): UserInfo | null => {
    const errors = validateStep1();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      return null;
    }

    // Reset validation state
    setShowValidationErrors(false);
    setValidationErrors([]);

    // Rate limiting check
    const userIdentifier = formData.name + Date.now();
    if (!ContentSecurity.checkRateLimit(userIdentifier)) {
      return null;
    }

    // Combine special request and target vocabulary
    const base = (formData.specialRequest || "").trim();
    const vocab = (formData.targetVocabulary || "").trim();
    const combinedSpecialRequest = vocab ? `${base ? base + "\n" : ""}Target vocabulary: ${vocab}` : base;

    // Final content validation
    const allText = `${formData.name} ${formData.favoriteAnimal} ${formData.favoriteFood} ${formData.hobbies} ${combinedSpecialRequest}`;
    const finalValidation = ContentSecurity.isContentAppropriate(allText, formData.grade, formData.nativeLanguage);
    
    if (!finalValidation.appropriate) {
      SecurityLogger.log('form_submission_blocked', {
        reason: finalValidation.reason,
        formData: { ...formData, name: '[REDACTED]' }
      });
      return null;
    }

    // Determine difficulty level
    const difficulty: DifficultyLevel = formData.readingAbility || 
      (formData.age <= 5 ? "beginner" : 
       formData.age <= 8 ? "easy" : 
       formData.age <= 11 ? "medium" : 
       formData.age <= 13 ? "hard" : "expert");
    
    SecurityLogger.log('form_submission_success', {
      difficultyLevel: difficulty,
      age: formData.age,
      grade: formData.grade
    });
    
    return { ...formData, specialRequest: combinedSpecialRequest, difficultyLevel: difficulty };
  }, [formData, validateStep1, t]);

  return {
    currentStep,
    formData,
    validationErrors,
    showValidationErrors,
    canAdvanceToStep,
    canSubmitForm,
    updateFormData,
    advanceToStep,
    goBackToStep,
    submitForm
  };
};