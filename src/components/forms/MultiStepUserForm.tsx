import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Sparkles } from "lucide-react";

import { FormStep1Essential } from "./steps/FormStep1Essential";
import { FormStep2ReadingPrefs } from "./steps/FormStep2ReadingPrefs";
import { FormStep3Personalization } from "./steps/FormStep3Personalization";
import { FormProgressIndicator } from "./shared/FormProgressIndicator";
import { useMultiStepForm } from "./hooks/useMultiStepForm";

import type { UserInfo } from "@/types";

export type { UserInfo } from "@/types";

interface MultiStepUserFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
  isPremium?: boolean;
}

export const MultiStepUserForm = ({ onSubmit, onBack, isPremium = false }: MultiStepUserFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  const {
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
  } = useMultiStepForm();

  const handleStepComplete = (stepData: Partial<UserInfo>) => {
    updateFormData(stepData);
    
    // Show encouraging feedback
    if (currentStep === 1) {
      toast({
        title: t("multiStepForm.step1Complete", "Great start!"),
        description: t("multiStepForm.step1CompleteDesc", "Ready to create your first story or add reading preferences?"),
        duration: 3000,
      });
    }
  };

  const handleQuickSubmit = () => {
    if (canSubmitForm) {
      const finalData = submitForm();
      onSubmit(finalData);
    }
  };

  const handleAdvanceToStep = (stepNumber: 2 | 3) => {
    if (canAdvanceToStep(stepNumber)) {
      advanceToStep(stepNumber);
    } else {
      toast({
        title: t("multiStepForm.completeRequired", "Almost there!"),
        description: t("multiStepForm.completeRequiredDesc", "Please complete the required fields first."),
        duration: 3000,
      });
    }
  };

  const handleFinalSubmit = () => {
    const finalData = submitForm();
    if (finalData) {
      onSubmit(finalData);
    } else {
      toast({
        title: t("multiStepForm.validationError", "Please check your information"),
        description: t("multiStepForm.validationErrorDesc", "Some required fields need your attention."),
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-secondary/3 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <MobileOptimizedButton
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className={`w-4 h-4 ${i18n.language === 'ar' ? '' : 'rotate-180'}`} />
              <span>{t('userInfoForm.buttons.back', 'Back')}</span>
            </MobileOptimizedButton>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-soft">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {t("multiStepForm.title", "Let's Create Your Perfect Story!")}
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            {t("multiStepForm.description", "Tell us about yourself to create magical, personalized reading adventures!")}
          </p>
        </div>

        {/* Progress Indicator */}
        <FormProgressIndicator 
          currentStep={currentStep}
          completedSteps={[
            ...(canAdvanceToStep(2) ? [1] : []),
            ...(canAdvanceToStep(3) ? [2] : []),
          ]}
        />

        {/* Form Content */}
        <Card className="p-6 sm:p-8 shadow-card bg-gradient-card border-border/50">
          {currentStep === 1 && (
            <FormStep1Essential
              formData={formData}
              onUpdate={updateFormData}
              onComplete={handleStepComplete}
              validationErrors={validationErrors}
              showValidationErrors={showValidationErrors}
              onQuickSubmit={handleQuickSubmit}
              onAdvanceToStep={() => handleAdvanceToStep(2)}
              canSubmit={canSubmitForm()}
              canAdvance={canAdvanceToStep(2)}
            />
          )}

          {currentStep === 2 && (
            <FormStep2ReadingPrefs
              formData={formData}
              onUpdate={updateFormData}
              onComplete={handleStepComplete}
              onBack={() => goBackToStep(1)}
              onAdvanceToStep={() => handleAdvanceToStep(3)}
              onSubmit={handleFinalSubmit}
              canAdvance={canAdvanceToStep(3)}
            />
          )}

          {currentStep === 3 && (
            <FormStep3Personalization
              formData={formData}
              onUpdate={updateFormData}
              onComplete={handleStepComplete}
              onBack={() => goBackToStep(2)}
              onSubmit={handleFinalSubmit}
              isPremium={isPremium}
            />
          )}
        </Card>
      </div>
    </div>
  );
};