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
import { spellcheckService } from "@/services/spellcheckService";
import { DebugLogger } from '@/services/DebugLogger';
import { FormProgressIndicator } from "../shared/FormProgressIndicator";
import { useLanguageSync } from "@/hooks/useLanguageSync";
import type { UserInfo, Grade, LanguageCode } from "@/types";

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
  const [spellcheckSuggestion, setSpellcheckSuggestion] = useState<string>("");
  const [spellcheckLoading, setSpellcheckLoading] = useState(false);
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

      // Spellcheck for name field
      if (field === 'name' && sanitized.length > 2 && validation.isValid) {
        setSpellcheckLoading(true);
        try {
          const result = await spellcheckService.checkSpelling(
            sanitized,
            formData.grade || 'K',
            'user_form_input'
          );
          
          if (result.hadErrors && result.correctedText !== sanitized) {
            setSpellcheckSuggestion(result.correctedText);
          } else {
            setSpellcheckSuggestion("");
          }
        } catch (error) {
          DebugLogger.warn('ui', 'Spellcheck failed', { error });
        } finally {
          setSpellcheckLoading(false);
        }
      }
    } else {
      onUpdate({ [field]: value });
    }
  };

  // Accept spellcheck suggestion
  const acceptSpellcheckSuggestion = () => {
    if (spellcheckSuggestion) {
      onUpdate({ name: spellcheckSuggestion });
      setSpellcheckSuggestion("");
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

          {/* Spellcheck suggestion */}
          {spellcheckSuggestion && !validationWarnings.name && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("formStep1.spellcheck.suggestion", "Did you mean:")}</span>
              <button
                onClick={acceptSpellcheckSuggestion}
                className="text-primary hover:text-primary/80 underline"
              >
                {spellcheckSuggestion}
              </button>
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
              {[3, 4, 5, 6, 7, 8, 9, 10, 11].map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age === 11 ? `11+ ${t("formStep1.age.years", "years old")}` : `${age} ${t("formStep1.age.years", "years old")}`}
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
              <SelectItem value="PreK">{t("formStep1.grade.preK", "Pre-K")}</SelectItem>
              <SelectItem value="K">{t("formStep1.grade.k", "Kindergarten")}</SelectItem>
              <SelectItem value="1">{t("formStep1.grade.1st", "1st Grade")}</SelectItem>
              <SelectItem value="2">{t("formStep1.grade.2nd", "2nd Grade")}</SelectItem>
              <SelectItem value="3">{t("formStep1.grade.3rd", "3rd Grade")}</SelectItem>
              <SelectItem value="4">{t("formStep1.grade.4th", "4th Grade")}</SelectItem>
              <SelectItem value="5">{t("formStep1.grade.5th", "5th Grade")}</SelectItem>
              <SelectItem value="6">{t("formStep1.grade.6thPlus", "6th Grade & Up")}</SelectItem>
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