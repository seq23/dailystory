import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DebugLogger } from "@/services/DebugLogger";
import { useValidationOnSubmit } from "@/hooks/useValidationOnSubmit";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import type { UserInfo, DifficultyLevel } from "@/types";

export const useMultiStepForm = () => {
  const { t, i18n } = useTranslation();
  const { validateFormOnSubmit } = useValidationOnSubmit();
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 5,
    grade: "PreK",
    nativeLanguage: "en",
    learningGoal: "improve-english-reading",
    avatar: {
      type: "prefer-not-to-answer",
      skinTone: "medium"
    },
    favoriteColor: "",
    favoriteAnimal: "",
    hobbies: "",
    favoriteFood: "",
    specialRequest: "",
    targetVocabulary: "",
    difficultyLevel: "pre-reader"
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

    // Combine special request and target vocabulary
    const base = (formData.specialRequest || "").trim();
    const vocab = (formData.targetVocabulary || "").trim();
    const combinedSpecialRequest = vocab ? `${base ? base + "\n" : ""}Target vocabulary: ${vocab}` : base;

    // Validate form content with new COPPA-compliant validation
    const isValid = validateFormOnSubmit({
      ...formData,
      specialRequest: combinedSpecialRequest
    });
    
    if (!isValid) {
      // Validation errors handled by ValidationFeedback component
      return null;
    }

    // Determine difficulty level - KEEP frontend difficulty in userInfo
    const frontendDifficultyLevel = formData.difficultyLevel || 
      (formData.age <= 5 ? "pre-reader" : 
       formData.age <= 8 ? "beginner" : 
       formData.age <= 11 ? "developing" : 
       formData.age <= 13 ? "independent" : "advanced");
    
    // For analytics/logging only, derive backend difficulty
    const backendDifficulty: DifficultyLevel = DifficultyLevelMapper.toBackend(frontendDifficultyLevel);
    
    DebugLogger.log('story', 'Form submission success', {
      frontendDifficultyLevel,
      backendDifficulty,
      age: formData.age,
      grade: formData.grade
    });
    
    // Return userInfo with FRONTEND difficulty value
    return { ...formData, specialRequest: combinedSpecialRequest, difficultyLevel: frontendDifficultyLevel };
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