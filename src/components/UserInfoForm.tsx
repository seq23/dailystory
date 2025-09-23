import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DebugLogger } from '@/services/DebugLogger';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ColorPicker } from "@/components/ui/color-picker";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MobileTooltip } from "@/components/MobileTooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, User, BookOpen, Heart, Palette, Sparkles, AlertCircle, Info, CheckCircle, Loader2, Globe } from "lucide-react";

import { LeanErrorService } from "@/utils/LeanErrorService";
import { useValidationOnSubmit } from "@/hooks/useValidationOnSubmit";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { validateTheme } from "@/utils/themeValidation";
import { spellcheckService } from "@/services/spellcheckService";
import { supabase } from "@/integrations/supabase/client";
import { DifficultyLevelMapper } from "@/services/DifficultyLevelMapper";
import type { UserInfo, Grade, LanguageCode, LearningGoal } from "@/types";

export type { UserInfo } from "@/types";

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
  isPremium?: boolean;
}

export const UserInfoForm = ({ onSubmit, onBack, isPremium = false }: UserInfoFormProps) => {
  // Redirect to new multi-step form
  return <MultiStepUserForm onSubmit={onSubmit} onBack={onBack} isPremium={isPremium} />;
};

// Import the new multi-step form
import { MultiStepUserForm } from "./forms/MultiStepUserForm";

// Legacy component for backward compatibility
export const LegacyUserInfoForm = ({ onSubmit, onBack, isPremium = false }: UserInfoFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isMobileOrTablet } = useIsMobile();
  const { validationState, validateFormOnSubmit, resetValidation } = useValidationOnSubmit();
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 5, // Default age for compatibility
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
    difficultyLevel: "pre-reader"
  });

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [translationPreviews, setTranslationPreviews] = useState<Record<string, { 
    originalInput: string; 
    processedInput: string; 
    isTranslated: boolean; 
    confidence: number; 
  }>>({});
  const [isProcessingInputs, setIsProcessingInputs] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationLoading, setTranslationLoading] = useState<Record<string, boolean>>({});
  const [spellcheckSuggestions, setSpellcheckSuggestions] = useState<{[key: string]: string}>({});
  const [spellcheckLoading, setSpellcheckLoading] = useState<{[key: string]: boolean}>({});
  const [spellcheckTimeouts, setSpellcheckTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  // Track optional fields for free users (only 1 allowed)
  const [selectedOptionalField, setSelectedOptionalField] = useState<string | null>(null);
  const [showReadingLevelDetails, setShowReadingLevelDetails] = useState(false);

  // Spellcheck function with debouncing
  const performSpellcheck = async (field: string, text: string) => {
    if (!spellcheckService.shouldCheck(text)) {
      return;
    }

    setSpellcheckLoading(prev => ({ ...prev, [field]: true }));

    try {
      const result = await spellcheckService.checkSpelling(
        text,
        formData.grade || 'K',
        'user_form_input'
      );

      if (result.hadErrors && result.correctedText !== text) {
        setSpellcheckSuggestions(prev => ({
          ...prev,
          [field]: result.correctedText
        }));
      } else {
        // Clear suggestion if text is already correct
        setSpellcheckSuggestions(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
    } catch (error) {
      DebugLogger.warn('ui', 'Spellcheck failed for field', { field, error });
    } finally {
      setSpellcheckLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Accept spellcheck suggestion
  const acceptSpellcheckSuggestion = (field: string) => {
    const suggestion = spellcheckSuggestions[field];
    if (suggestion) {
      setFormData(prev => ({ ...prev, [field]: suggestion }));
      setSpellcheckSuggestions(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };


  // Enhanced input handler with intelligent processing and real-time translation
  const handleInputChange = async (field: keyof UserInfo, value: string | number) => {
    if (typeof value === 'string') {
      // Check if this is a deletion (shorter text) - skip security validation for deletions
      const currentValue = formData[field] as string;
      const isDeletion = value.length < currentValue.length;
      
      // Free user optional field restriction - only apply to non-premium users
      const optionalFields = ['favoriteAnimal', 'favoriteFood', 'hobbies', 'specialRequest'];
      if (!isPremium && optionalFields.includes(field as string) && value.trim() && !isDeletion) {
        // Check if user already has a different optional field filled
        const hasOtherOptionalField = optionalFields.some(f => f !== field && formData[f as keyof UserInfo] && String(formData[f as keyof UserInfo]).trim());
        
        if (hasOtherOptionalField && selectedOptionalField && selectedOptionalField !== field) {
          toast({
            title: "Free Version Limit",
            description: "Free users can only fill one optional field. Upgrade to premium for unlimited fields!",
            duration: 3000,
          });
          return;
        }
        
        if (value.trim()) {
          setSelectedOptionalField(field as string);
        }
      } else if (isPremium && optionalFields.includes(field as string) && value.trim()) {
        // Premium users can fill all fields without restriction
        setSelectedOptionalField(null); // Clear any previous restriction tracking
      }
      
      // Clear spellcheck suggestion when user starts typing
      if (spellcheckSuggestions[field]) {
        setSpellcheckSuggestions(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }

      // Setup debounced spellcheck for text fields
      const spellcheckFields = ['name', 'hobbies', 'favoriteAnimal', 'favoriteFood', 'specialRequest'];
      if (spellcheckFields.includes(field) && value.length > 2) {
        // Clear existing timeout
        if (spellcheckTimeouts[field]) {
          clearTimeout(spellcheckTimeouts[field]);
        }

        // Set new timeout for spellcheck
        const timeout = setTimeout(() => {
          performSpellcheck(field, value);
        }, 500);

        setSpellcheckTimeouts(prev => ({ ...prev, [field]: timeout }));
      }
      
      // Sanitize input with enhanced protection
      const sanitizedValue = InputSanitizer.sanitizeUserInfo(value);
      
      
      // Update form data immediately
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

      // Handle real-time translation for specific fields
      if (['favoriteAnimal', 'favoriteFood', 'favoriteColor', 'hobbies', 'specialRequest'].includes(field as string) && sanitizedValue.trim()) {
        // Show loading state for translation
        setTranslationLoading(prev => ({ ...prev, [field as string]: true }));
        
        try {
          DebugLogger.log('ui', `Real-time translation triggered for ${field}: "${sanitizedValue}"`);
          DebugLogger.log('ui', 'User info:', { 
            nativeLanguage: formData.nativeLanguage, 
            grade: formData.grade,
            age: formData.age 
          });
          
          // First translate if needed (non-English user input)
          let processedValue = sanitizedValue;
          if (formData.nativeLanguage !== 'en' && sanitizedValue.trim()) {
            try {
              DebugLogger.log('network', `Translating from ${formData.nativeLanguage} to English:`, sanitizedValue);
              const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-universal', {
                body: { 
                  text: sanitizedValue,
                  sourceLanguage: formData.nativeLanguage,
                  targetLanguage: 'en',
                  mode: 'to-english'
                }
              });
              
              if (!translationError && translationData?.translatedText) {
                processedValue = translationData.translatedText;
                DebugLogger.log('network', `Translation completed: "${sanitizedValue}" → "${processedValue}"`);
                
                // Show translation feedback
                setTranslations(prev => ({ 
                  ...prev, 
                  [field as string]: `${sanitizedValue} → ${processedValue}` 
                }));
                
                // Clear translation feedback after 4 seconds
                setTimeout(() => {
                  setTranslations(prev => ({ ...prev, [field as string]: '' }));
                }, 4000);
              } else {
                DebugLogger.warn('ui', 'Translation failed, using original value', { translationError });
              }
            } catch (translationError) {
              DebugLogger.error('ui', 'Translation API error', { translationError });
              // Continue with original value if translation fails
            }
          }
          
          // Then validate the (possibly translated) value
          const validationResult = validateTheme(processedValue);
          
          if (validationResult.valid) {
            // Update the form data with the processed (translated and validated) value
            setFormData(prev => ({ ...prev, [field]: validationResult.sanitized }));
          } else {
            DebugLogger.log('ui', `Validation failed for: "${processedValue}"`);
            // If validation fails, revert to original sanitized value
            setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
          }
        } catch (error) {
          DebugLogger.error('ui', 'Processing error', { error, value: sanitizedValue });
          // Continue with original value if processing fails
        } finally {
          setTranslationLoading(prev => ({ ...prev, [field as string]: false }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    DebugLogger.log('ui', 'Form submitted!', { name: formData.name.trim(), complete: isFormComplete() });
    // Check form validation first
    const errors = validateForm();
    
    if (errors.length > 0) {
      DebugLogger.log('ui', 'Validation errors:', errors);
      setValidationErrors(errors);
      setShowValidationErrors(true);
      
      // Show helpful, encouraging toast notification
      toast({
        title: "Almost Ready!",
        description: "Just need a few more details to create your perfect story.",
        duration: 4000,
      });
      
      // Scroll to first error field and focus it
      const firstErrorField = errors[0];
      if (firstErrorField.includes("name")) {
        const nameField = document.getElementById('name');
        if (nameField) {
          nameField.focus();
          nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Reset validation state if form is complete
    setShowValidationErrors(false);
    setValidationErrors([]);

    // Validate form content with new COPPA-compliant validation
    const isValid = validateFormOnSubmit(formData);
    
    if (!isValid) {
      // Validation errors will be shown by ValidationFeedback component
      toast({
        title: "Content Review Needed",
        description: "Please review the highlighted issues before continuing.",
        duration: 4000,
      });
      return;
    }

    // Use the selected difficulty level (frontend format), or fall back to age-based frontend difficulty
    const frontendDifficulty = formData.difficultyLevel || (formData.age <= 5 ? "pre-reader" : formData.age <= 8 ? "beginner" : formData.age <= 11 ? "developing" : formData.age <= 13 ? "independent" : "advanced");
    
    // Convert frontend difficulty to backend using DifficultyLevelMapper
    const difficulty = DifficultyLevelMapper.toBackend(frontendDifficulty);
    
    LeanErrorService.logError({
      difficultyLevel: difficulty,
      age: formData.age,
      grade: formData.grade
    }, 'form_submission_success');
    
    onSubmit(formData);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Only validate truly essential fields to improve form completion rates
    if (!formData.name.trim()) {
      errors.push(t("userInfoForm.validation.nameRequired", "Please enter a name"));
    }
    
    // Age defaults to 7, so only validate if it's somehow null/undefined
    if (!formData.age || formData.age < 3 || formData.age > 11) {
      errors.push(t("userInfoForm.validation.ageRequired", "Please select an age"));
    }
    
    // Grade and language should have defaults, only validate if missing
    if (!formData.grade) {
      errors.push(t("userInfoForm.validation.gradeRequired", "Please select a grade level"));
    }
    
    if (!formData.nativeLanguage) {
      errors.push(t("userInfoForm.validation.languageRequired", "Please select a language"));
    }
    
    // Avatar validation is less critical - provide defaults if missing
    if (!formData.avatar?.type) {
      formData.avatar = { ...formData.avatar, type: 'prefer-not-to-answer' };
    }
    
    if (!formData.avatar?.skinTone) {
      formData.avatar = { ...formData.avatar, skinTone: 'medium' };
    }
    
    return errors;
  };

  const isFormComplete = () => {
    // Only require the most essential fields for completion
    const hasName = formData.name.trim().length > 0;
    const hasAge = formData.age && formData.age >= 3 && formData.age <= 11;
    const hasGrade = formData.grade && formData.grade.length > 0;
    const hasLanguage = formData.nativeLanguage && formData.nativeLanguage.length > 0;
    
    const complete = hasName && hasAge && hasGrade && hasLanguage;
    DebugLogger.log('ui', 'Form complete check:', { hasName, hasAge, hasGrade, hasLanguage, complete });
    return complete;
  };

  // Handle language change and update UI language
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setFormData(prev => ({ ...prev, nativeLanguage: newLanguage }));
    i18n.changeLanguage(newLanguage);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(spellcheckTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [spellcheckTimeouts]);

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
              <span>{t('userInfoForm.buttons.back')}</span>
            </MobileOptimizedButton>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-soft">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {t("userInfoForm.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            {t("userInfoForm.subtitle")}
          </p>
        </div>

        {/* Validation Errors */}
        {showValidationErrors && validationErrors.length > 0 && (
          <Alert className="border-destructive/20 bg-destructive/5 mb-6">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <div className="font-medium mb-2">{t("userInfoForm.help.required", "Required to create your story")}</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Essential Information */}
          <Card className="p-6 bg-card border border-border shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("userInfoForm.sections.essentials")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("userInfoForm.help.required")}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t("userInfoForm.fields.name.label")} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={t("userInfoForm.fields.name.placeholder")}
                    className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary pr-8"
                    autoComplete="given-name"
                  />
                  {spellcheckLoading.name && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {spellcheckSuggestions.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Did you mean:</span>
                    <button
                      type="button"
                      onClick={() => acceptSpellcheckSuggestion('name')}
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {spellcheckSuggestions.name}
                    </button>
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  {t("userInfoForm.fields.age.label")} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.age?.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger id="age" className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.age.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                      <SelectItem key={age} value={age.toString()} className="focus:bg-accent focus:text-accent-foreground">
                        {age} {t("userInfoForm.fields.age.yearsOld", "years old")}
                      </SelectItem>
                    ))}
                    <SelectItem key={11} value="11" className="focus:bg-accent focus:text-accent-foreground">
                      11+
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm font-medium">
                  {t("userInfoForm.fields.grade.label")} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger id="grade" className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.grade.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    <SelectItem value="PreK" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.PreK", "Pre-K")}</SelectItem>
                    <SelectItem value="K" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.K", "Kindergarten")}</SelectItem>
                    <SelectItem value="1" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.1st", "1st Grade")}</SelectItem>
                    <SelectItem value="2" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.2nd", "2nd Grade")}</SelectItem>
                    <SelectItem value="3" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.3rd", "3rd Grade")}</SelectItem>
                    <SelectItem value="4" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.4th", "4th Grade")}</SelectItem>
                    <SelectItem value="5" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.5th", "5th Grade")}</SelectItem>
                    <SelectItem value="6" className="focus:bg-accent focus:text-accent-foreground">{t("userInfoForm.grades.6th", "6th Grade")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  {t("userInfoForm.fields.nativeLanguage.label")} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.nativeLanguage} onValueChange={(value) => handleLanguageChange(value as LanguageCode)}>
                  <SelectTrigger id="language" className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.nativeLanguage.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    <SelectItem value="en" className="focus:bg-accent focus:text-accent-foreground">English</SelectItem>
                    <SelectItem value="es" className="focus:bg-accent focus:text-accent-foreground">Español (Spanish)</SelectItem>
                    <SelectItem value="fr" className="focus:bg-accent focus:text-accent-foreground">Français (French)</SelectItem>
                    <SelectItem value="pt" className="focus:bg-accent focus:text-accent-foreground">Português (Portuguese)</SelectItem>
                    <SelectItem value="zh" className="focus:bg-accent focus:text-accent-foreground">中文 (Chinese)</SelectItem>
                    <SelectItem value="ar" className="focus:bg-accent focus:text-accent-foreground">العربية (Arabic)</SelectItem>
                    <SelectItem value="hi" className="focus:bg-accent focus:text-accent-foreground">हिन्दी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Reading Level */}
          <Card className="p-6 bg-card border border-border shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("userInfoForm.sections.readingLevel")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("userInfoForm.fields.difficultyLevel.description")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel" className="text-sm font-medium">
                  {t("userInfoForm.fields.difficultyLevel.label")}
                </Label>
                <Select value={formData.difficultyLevel} onValueChange={(value) => handleInputChange("difficultyLevel", value)}>
                  <SelectTrigger id="difficultyLevel" className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.difficultyLevel.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    <SelectItem value="pre-reader" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.difficultyLevel.options.preReader")}
                    </SelectItem>
                    <SelectItem value="beginner" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.difficultyLevel.options.beginner")}
                    </SelectItem>
                    <SelectItem value="developing" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.difficultyLevel.options.developing")}
                    </SelectItem>
                    <SelectItem value="independent" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.difficultyLevel.options.independent")}
                    </SelectItem>
                    <SelectItem value="advanced" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.difficultyLevel.options.advanced")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expandable Reading Level Details */}
              <Collapsible open={showReadingLevelDetails} onOpenChange={setShowReadingLevelDetails}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  <Info className="w-4 h-4" />
                  {showReadingLevelDetails ? t("userInfoForm.buttons.hideDetails") : t("userInfoForm.buttons.learnMore")}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showReadingLevelDetails ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <div className="space-y-3 text-sm">
                    <h4 className="font-medium text-foreground">{t("userInfoForm.fields.difficultyLevel.learnMore.title")}</h4>
                    <p className="text-muted-foreground">{t("userInfoForm.fields.difficultyLevel.learnMore.description")}</p>
                      {formData.difficultyLevel && (
                        <div className="p-3 bg-background rounded border border-border/50">
                          <div className="font-medium text-foreground mb-1">
                            {formData.difficultyLevel === 'pre-reader' && t("userInfoForm.fields.difficultyLevel.options.preReader")}
                            {formData.difficultyLevel === 'beginner' && t("userInfoForm.fields.difficultyLevel.options.beginner")}
                            {formData.difficultyLevel === 'developing' && t("userInfoForm.fields.difficultyLevel.options.developing")}
                            {formData.difficultyLevel === 'independent' && t("userInfoForm.fields.difficultyLevel.options.independent")}
                            {formData.difficultyLevel === 'advanced' && t("userInfoForm.fields.difficultyLevel.options.advanced")}
                          </div>
                          <div className="text-muted-foreground">
                            {formData.difficultyLevel === 'pre-reader' && t("userInfoForm.fields.difficultyLevel.details.preReader")}
                            {formData.difficultyLevel === 'beginner' && t("userInfoForm.fields.difficultyLevel.details.beginner")}
                            {formData.difficultyLevel === 'developing' && t("userInfoForm.fields.difficultyLevel.details.developing")}
                            {formData.difficultyLevel === 'independent' && t("userInfoForm.fields.difficultyLevel.details.independent")}
                            {formData.difficultyLevel === 'advanced' && t("userInfoForm.fields.difficultyLevel.details.advanced")}
                         </div>
                       </div>
                     )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>

          {/* Personalization */}
          <Card className="p-6 bg-card border border-border shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {t("userInfoForm.sections.personalization")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isPremium ? t("userInfoForm.help.optional") : t("userInfoForm.restrictions.freeUserLimit")}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Favorite Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.favoriteColor.label")}
                </Label>
                <ColorPicker
                  value={formData.favoriteColor}
                  onChange={(color) => handleInputChange("favoriteColor", color)}
                />
              </div>

              {/* Favorite Animal */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.favoriteAnimal.label")}
                  {!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteAnimal' && (
                    <span className="text-xs text-muted-foreground ml-2">(Premium)</span>
                  )}
                </Label>
                <div className="relative">
                  <TagInput
                    value={formData.favoriteAnimal}
                    onChange={(val) => handleInputChange("favoriteAnimal", val)}
                    onBlur={(val) => handleInputChange("favoriteAnimal", val)}
                    placeholder={t("userInfoForm.fields.favoriteAnimal.placeholder")}
                    className="bg-background"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteAnimal'}
                  />
                  {spellcheckLoading.favoriteAnimal && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {spellcheckSuggestions.favoriteAnimal && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Did you mean:</span>
                    <button
                      type="button"
                      onClick={() => acceptSpellcheckSuggestion('favoriteAnimal')}
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {spellcheckSuggestions.favoriteAnimal}
                    </button>
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                )}
                {translations.favoriteAnimal && (
                  <div className="text-xs text-primary">{translations.favoriteAnimal}</div>
                )}
              </div>

              {/* Favorite Food */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.favoriteFood.label")}
                  {!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteFood' && (
                    <span className="text-xs text-muted-foreground ml-2">(Premium)</span>
                  )}
                </Label>
                <div className="relative">
                  <TagInput
                    value={formData.favoriteFood}
                    onChange={(val) => handleInputChange("favoriteFood", val)}
                    onBlur={(val) => handleInputChange("favoriteFood", val)}
                    placeholder={t("userInfoForm.fields.favoriteFood.placeholder")}
                    className="bg-background"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteFood'}
                  />
                  {spellcheckLoading.favoriteFood && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {spellcheckSuggestions.favoriteFood && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Did you mean:</span>
                    <button
                      type="button"
                      onClick={() => acceptSpellcheckSuggestion('favoriteFood')}
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {spellcheckSuggestions.favoriteFood}
                    </button>
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                )}
                {translations.favoriteFood && (
                  <div className="text-xs text-primary">{translations.favoriteFood}</div>
                )}
              </div>

              {/* Hobbies */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.hobbies.label")}
                  {!isPremium && selectedOptionalField && selectedOptionalField !== 'hobbies' && (
                    <span className="text-xs text-muted-foreground ml-2">(Premium)</span>
                  )}
                </Label>
                <div className="relative">
                  <TagInput
                    value={formData.hobbies}
                    onChange={(val) => handleInputChange("hobbies", val)}
                    onBlur={(val) => handleInputChange("hobbies", val)}
                    placeholder={t("userInfoForm.fields.hobbies.placeholder")}
                    className="bg-background"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'hobbies'}
                  />
                  {spellcheckLoading.hobbies && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                {spellcheckSuggestions.hobbies && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Did you mean:</span>
                    <button
                      type="button"
                      onClick={() => acceptSpellcheckSuggestion('hobbies')}
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {spellcheckSuggestions.hobbies}
                    </button>
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                )}
                {translations.hobbies && (
                  <div className="text-xs text-primary">{translations.hobbies}</div>
                )}
              </div>

              {/* Special Request */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.specialRequest.label")}
                  {!isPremium && selectedOptionalField && selectedOptionalField !== 'specialRequest' && (
                    <span className="text-xs text-muted-foreground ml-2">(Premium)</span>
                  )}
                </Label>
                <div className="relative">
                  <TagInput
                    value={formData.specialRequest}
                    onChange={(val) => handleInputChange("specialRequest", val)}
                    onBlur={(val) => handleInputChange("specialRequest", val)}
                    placeholder={t("userInfoForm.fields.specialRequest.placeholder")}
                    className="bg-background pr-8"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'specialRequest'}
                  />
                  {(translationLoading.specialRequest || spellcheckLoading.specialRequest) && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
                {spellcheckSuggestions.specialRequest && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Did you mean:</span>
                    <button
                      type="button"
                      onClick={() => acceptSpellcheckSuggestion('specialRequest')}
                      className="text-primary hover:text-primary/80 underline font-medium"
                    >
                      {spellcheckSuggestions.specialRequest}
                    </button>
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                )}
                {translations.specialRequest && (
                  <div className="text-xs text-primary">{translations.specialRequest}</div>
                )}
              </div>
            </div>
          </Card>

          {/* Character Selection - Moved to Last */}
          <Card className="p-6 bg-card border border-border shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("userInfoForm.sections.character")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("userInfoForm.help.optional")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("userInfoForm.fields.avatar.label")}
                </Label>
                <AvatarPicker
                  value={formData.avatar}
                  onChange={(avatar) => setFormData(prev => ({ ...prev, avatar }))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <ValidationFeedback
          hasErrors={!validationState.isValid}
          errors={validationState.errors}
          hasCoppaViolation={validationState.hasCoppaViolation}
          onSubmissionAttempt={validationState.hasTriedSubmit}
        />
        
        <div className="mt-8 text-center">
          <MobileOptimizedButton
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            className="w-full sm:w-auto min-w-48 h-12 bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 font-semibold text-base shadow-soft hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t("userInfoForm.buttons.createStory")}
            </div>
          </MobileOptimizedButton>
        </div>
      </div>
    </div>
  );
};