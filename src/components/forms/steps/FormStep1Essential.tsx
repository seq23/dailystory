import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { MobileTooltip } from "@/components/MobileTooltip";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { rememberReaderName } from "@/lib/readerNames";
import { DebugLogger } from '@/services/DebugLogger';
import { FormProgressIndicator } from "../shared/FormProgressIndicator";
import { useLanguageSync } from "@/hooks/useLanguageSync";
import type { UserInfo, Grade, LanguageCode } from "@/types";
import { AGES, GRADES, gradeLabel } from "@/lib/grades";

// i18n keys under formStep1.grade: preK, k, 1st … 10th
const gradeI18nKey = (g: Grade) => (g === "PreK" ? "preK" : g === "K" ? "k" : gradeLabel(g, "short"));

interface FormStep1EssentialProps {
  formData: UserInfo;
  onUpdate: (data: Partial<UserInfo>) => void;
  onComplete: (data: Partial<UserInfo>) => void;
  validationErrors: string[];
  showValidationErrors: boolean;
  onQuickSubmit: () => void;
  onAdvanceToStep: () => void;
  canSubmit: boolean;
  canAdvance: boolean;
}

export const FormStep1Essential = ({
  formData,
  onUpdate,
  onComplete,
  validationErrors,
  showValidationErrors,
  onQuickSubmit,
  onAdvanceToStep,
  canSubmit,
  canAdvance
}: FormStep1EssentialProps) => {
  const { t, i18n } = useTranslation();
  const { getStoredLanguagePreference, syncLanguages, clearStoredLanguagePreference } = useLanguageSync();

  // Enhanced input handling with real-time COPPA validation
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string[]>>({});

  // Check for language preference from WelcomeHero on mount
  useEffect(() => {
    const storedLanguage = getStoredLanguagePreference();
    if (storedLanguage && storedLanguage !== formData.nativeLanguage) {
      // Auto-populate native language from WelcomeHero selection
      onUpdate({ nativeLanguage: storedLanguage });
      clearStoredLanguagePreference(); // Clean up after use
    }
  }, [getStoredLanguagePreference, clearStoredLanguagePreference, formData.nativeLanguage, onUpdate]);
  
  const handleInputChange = async (field: keyof UserInfo, value: string | number) => {
    if (typeof value === 'string') {
      // Real-time validation with enhanced COPPA compliance
      const context = field === 'name' ? 'name' : 'general';
      const { sanitized, validation } = InputSanitizer.validateFieldRealtime(field as string, value, context);
      
      // Update form data
      onUpdate({ [field]: sanitized });

      // Update validation warnings
      if (!validation.isValid) {
        setValidationWarnings(prev => ({
          ...prev,
          [field]: validation.issues
        }));
      } else {
        setValidationWarnings(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }

      // A name is never spell-checked: it would send the child's name to an AI model, and a
      // name has no "right" spelling (R-KID-01, 22 Nov 2026). It is kept so every AI request
      // from this page masks it (src/lib/readerNames.ts).
      if (field === 'name') rememberReaderName(sanitized);
    } else {
      onUpdate({ [field]: value });
    }
  };

  // Handle language change and update UI language
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    syncLanguages(newLanguage, (language) => {
      onUpdate({ nativeLanguage: language });
    });
  };

  return (
    <div className="space-y-6">
      <FormProgressIndicator 
        currentStep={1}
        completedSteps={[]}
        compact={true}
      />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t("formStep1.title", "Essential Information")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("formStep1.description", "Just a few details to get started with your magical reading adventure!")}
        </p>
      </div>

      {/* Validation Errors */}
      {showValidationErrors && validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            {t("formStep1.name.label", "Child's Name")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t("formStep1.name.placeholder", "Enter your child's name")}
            className="transition-colors focus:border-primary"
            required
          />
          
          {/* Real-time validation warnings */}
          {validationWarnings.name && (
            <div className="space-y-1">
              {validationWarnings.name.map((warning, index) => (
                <div key={index} className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ {warning}
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Age Field */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-sm font-medium text-foreground">
            {t("formStep1.age.label", "Age")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.age.toString()}
            onValueChange={(value) => handleInputChange('age', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("formStep1.age.placeholder", "Select age")} />
            </SelectTrigger>
            <SelectContent>
              {AGES.map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {`${age} ${t("formStep1.age.years", "years old")}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Field */}
        <div className="space-y-2">
          <Label htmlFor="grade" className="text-sm font-medium text-foreground">
            {t("formStep1.grade.label", "Grade Level")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.grade}
            onValueChange={(value) => handleInputChange('grade', value as Grade)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("formStep1.grade.placeholder", "Select grade")} />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  {t(`formStep1.grade.${gradeI18nKey(g)}`, gradeLabel(g))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Native Language Field */}
        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm font-medium text-foreground">
            {t("formStep1.language.label", "Native Language")} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.nativeLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("formStep1.language.placeholder", "Select language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("formStep1.language.english", "English")}</SelectItem>
              <SelectItem value="es">{t("formStep1.language.spanish", "Spanish")}</SelectItem>
              <SelectItem value="fr">{t("formStep1.language.french", "French")}</SelectItem>
              <SelectItem value="ar">{t("formStep1.language.arabic", "Arabic")}</SelectItem>
              <SelectItem value="zh">{t("formStep1.language.chinese", "Chinese")}</SelectItem>
              <SelectItem value="hi">{t("formStep1.language.hindi", "Hindi")}</SelectItem>
              <SelectItem value="pt">{t("formStep1.language.portuguese", "Portuguese")}</SelectItem>
              <SelectItem value="ur">{t("formStep1.language.urdu", "Urdu")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-6">
        <MobileOptimizedButton
          onClick={onAdvanceToStep}
          disabled={!canAdvance}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 transition-all duration-300 disabled:opacity-50"
        >
          {t("formStep1.addReadingPrefs", "Add Reading Preferences")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </MobileOptimizedButton>
        
        <button
          onClick={onQuickSubmit}
          disabled={!canSubmit}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground underline transition-colors disabled:opacity-50"
        >
          {t("formStep1.skipAndCreate", "Skip and create story now")}
        </button>
      </div>

      {/* Encouraging note */}
      <div className="text-center text-xs text-muted-foreground">
        {t("formStep1.encouragement", "Our system adapts to support your child's unique learning journey")}
      </div>
    </div>
  );
};