import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormProgressIndicator } from "../shared/FormProgressIndicator";
import { ChevronLeft, ChevronDown, ChevronRight, Palette, User, Heart, Sparkles, CheckCircle, Globe, Loader2 } from "lucide-react";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { validateTheme } from "@/utils/themeValidation";
import { spellcheckService } from "@/services/spellcheckService";
import { supabase } from "@/integrations/supabase/client";
import { DebugLogger } from '@/services/DebugLogger';
import { useValidationOnSubmit } from "@/hooks/useValidationOnSubmit";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import type { UserInfo, Avatar } from "@/types";

interface FormStep3PersonalizationProps {
  formData: UserInfo;
  onUpdate: (data: Partial<UserInfo>) => void;
  onComplete: (data: Partial<UserInfo>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isPremium?: boolean;
}

export const FormStep3Personalization = ({
  formData,
  onUpdate,
  onComplete,
  onBack,
  onSubmit,
  isPremium = false
}: FormStep3PersonalizationProps) => {
  const { t } = useTranslation();
  const [appearanceOpen, setAppearanceOpen] = useState(true);
  const [interestsOpen, setInterestsOpen] = useState(true);
  const { validationState, validateFormOnSubmit, resetValidation } = useValidationOnSubmit();
  
  // Spellcheck and translation states
  const [spellcheckSuggestions, setSpellcheckSuggestions] = useState<{[key: string]: string}>({});
  const [spellcheckLoading, setSpellcheckLoading] = useState<{[key: string]: boolean}>({});
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationLoading, setTranslationLoading] = useState<Record<string, boolean>>({});
  const [spellcheckTimeouts, setSpellcheckTimeouts] = useState<{[key: string]: NodeJS.Timeout}>({});
  
  // Validation states for inappropriate content
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({
    specialRequest: [],
    hobbies: [],
    favoriteAnimal: [],
    favoriteFood: [],
    targetVocabulary: []
  });

  // Individual tag spellcheck for TagInput fields
  const performTagInputSpellcheck = async (field: string, text: string) => {
    if (!text.trim()) return;

    const tagInputFields = ['hobbies', 'favoriteAnimal', 'favoriteFood'];
    
    if (tagInputFields.includes(field)) {
      // Split into individual tags and spellcheck each separately
      const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const correctedTags: string[] = [];
      let hasChanges = false;

      setSpellcheckLoading(prev => ({ ...prev, [field]: true }));

      try {
        for (const tag of tags) {
          if (spellcheckService.shouldCheck(tag)) {
            const result = await spellcheckService.checkSpelling(
              tag,
              formData.grade || 'K',
              'user_form_input'
            );
            
            if (result.hadErrors && result.correctedText !== tag) {
              correctedTags.push(result.correctedText);
              hasChanges = true;
            } else {
              correctedTags.push(tag);
            }
          } else {
            correctedTags.push(tag);
          }
        }

        // Only suggest if there were actual changes
        if (hasChanges) {
          const correctedText = correctedTags.join(', ');
          setSpellcheckSuggestions(prev => ({
            ...prev,
            [field]: correctedText
          }));
        } else {
          setSpellcheckSuggestions(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
          });
        }
      } catch (error) {
        DebugLogger.warn('ui', 'Tag spellcheck failed for field', { field, error });
      } finally {
        setSpellcheckLoading(prev => ({ ...prev, [field]: false }));
      }
    } else {
      // Fall back to regular spellcheck for non-TagInput fields
      performRegularSpellcheck(field, text);
    }
  };

  // Regular spellcheck function for non-TagInput fields
  const performRegularSpellcheck = async (field: string, text: string) => {
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
      onUpdate({ [field]: suggestion });
      setSpellcheckSuggestions(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Handle input changes with processing
  const handleInputChange = async (field: keyof UserInfo, value: string | Avatar) => {
    if (typeof value === 'string') {
      // Clear spellcheck suggestion when user starts typing
      if (spellcheckSuggestions[field]) {
        setSpellcheckSuggestions(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }

      // Clear validation errors when user starts typing
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }

      // Real-time validation for all fields that need content validation
      const validatedFields = ['specialRequest', 'hobbies', 'favoriteAnimal', 'favoriteFood', 'targetVocabulary'];
      if (validatedFields.includes(field) && value.trim()) {
        const contextMap: Record<string, 'name' | 'interest' | 'theme' | 'general'> = {
          'specialRequest': 'theme',
          'hobbies': 'interest',
          'favoriteAnimal': 'interest',
          'favoriteFood': 'interest',
          'targetVocabulary': 'general'
        };
        
        const context = contextMap[field] || 'general';
        const validation = InputSanitizer.validateChildSafeInput(value, context);
        if (!validation.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: validation.issues
          }));
        } else {
          setValidationErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
          });
        }
      }

      // Setup debounced spellcheck for text fields
      const spellcheckFields = ['hobbies', 'favoriteAnimal', 'favoriteFood', 'specialRequest', 'targetVocabulary'];
      if (spellcheckFields.includes(field) && value.length > 2) {
        if (spellcheckTimeouts[field]) {
          clearTimeout(spellcheckTimeouts[field]);
        }

        const timeout = setTimeout(() => {
          performTagInputSpellcheck(field, value);
        }, 500);

        setSpellcheckTimeouts(prev => ({ ...prev, [field]: timeout }));
      }
      
      const sanitizedValue = InputSanitizer.sanitizeUserInfo(value);
      onUpdate({ [field]: sanitizedValue });

      // Handle real-time translation for specific fields
      if (['favoriteAnimal', 'favoriteFood', 'favoriteColor', 'hobbies', 'specialRequest', 'targetVocabulary'].includes(field as string) && sanitizedValue.trim()) {
        setTranslationLoading(prev => ({ ...prev, [field as string]: true }));
        
        try {
          let processedValue = sanitizedValue;
          if (formData.nativeLanguage !== 'en' && sanitizedValue.trim()) {
            try {
              const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-universal', {
                body: { 
                  text: sanitizedValue,
                  sourceLanguage: 'auto',
                  targetLanguage: 'en',
                  mode: 'to-english'
                }
              });
              
              if (!translationError && translationData?.translatedText) {
                processedValue = translationData.translatedText;
                
                setTranslations(prev => ({ 
                  ...prev, 
                  [field as string]: `${sanitizedValue} → ${processedValue}` 
                }));
                
                setTimeout(() => {
                  setTranslations(prev => ({ ...prev, [field as string]: '' }));
                }, 4000);
              }
            } catch (translationError) {
              DebugLogger.error('ui', 'Translation API error', { translationError });
            }
          }
          
          const validationResult = validateTheme(processedValue);
          
          if (validationResult.valid) {
            onUpdate({ [field]: validationResult.sanitized });
          } else {
            onUpdate({ [field]: sanitizedValue });
          }
        } catch (error) {
          DebugLogger.error('ui', 'Processing error', { error, value: sanitizedValue });
        } finally {
          setTranslationLoading(prev => ({ ...prev, [field as string]: false }));
        }
      }
    } else {
      onUpdate({ [field]: value });
    }
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
    <div className="space-y-6">
      <FormProgressIndicator 
        currentStep={3}
        completedSteps={[1, 2]}
        compact={true}
      />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t("formStep3.title", "Make It Yours!")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("formStep3.description", "The more you tell us, the more magical your stories become")}
        </p>
      </div>

      <p className="text-xs text-center text-muted-foreground mb-4">
        ✨ {t("formStep3.researchBenefit", "Personalized stories increase engagement and reading comprehension by up to 60%")}
      </p>

      <div className="space-y-6">
        {/* Appearance Section */}
        <Collapsible open={appearanceOpen} onOpenChange={setAppearanceOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">
                {t("formStep3.appearanceTitle", "How You Look")}
              </h3>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${appearanceOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4 mt-4">
              {/* Avatar Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.avatar", "Choose Your Avatar")}
                </Label>
                <AvatarPicker
                  value={formData.avatar || { type: 'prefer-not-to-answer', skinTone: 'medium' }}
                  onChange={(avatar) => handleInputChange('avatar', avatar)}
                  className="w-full"
                />
              </div>

            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Interests Section */}
        <Collapsible open={interestsOpen} onOpenChange={setInterestsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">
                {t("formStep3.interestsTitle", "What You Love")}
              </h3>
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${interestsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-4 mt-4">
              {/* Favorite Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.favoriteColor", "Favorite Color")}
                </Label>
                <ColorPicker
                  value={formData.favoriteColor || ''}
                  onChange={(color) => handleInputChange('favoriteColor', color)}
                  className="w-full"
                />
                
                {/* Translation preview */}
                {translations.favoriteColor && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.favoriteColor}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.favoriteColor && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.favoriteColor}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('favoriteColor')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>

              {/* Favorite Animal */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.favoriteAnimal", "Favorite Animal")}
                </Label>
                <TagInput
                  value={formData.favoriteAnimal || ''}
                  onChange={(value) => handleInputChange('favoriteAnimal', value)}
                  placeholder={t("formStep3.favoriteAnimalPlaceholder", "dog, elephant, dolphin...")}
                  className="w-full"
                  validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'interest')}
                  validationError={validationErrors.favoriteAnimal}
                />
                
                {/* Loading indicator */}
                {spellcheckLoading.favoriteAnimal && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking spelling...</span>
                  </div>
                )}
                
                {/* Translation preview */}
                {translations.favoriteAnimal && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.favoriteAnimal}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.favoriteAnimal && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.favoriteAnimal}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('favoriteAnimal')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
                
                {/* Validation errors */}
                {validationErrors.favoriteAnimal && validationErrors.favoriteAnimal.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    {validationErrors.favoriteAnimal.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <span className="font-medium">⚠️</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Try child-friendly animals like "dog," "elephant," or "butterfly"
                    </div>
                  </div>
                )}
              </div>

              {/* Favorite Food */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.favoriteFood", "Favorite Food")}
                </Label>
                <TagInput
                  value={formData.favoriteFood || ''}
                  onChange={(value) => handleInputChange('favoriteFood', value)}
                  placeholder={t("formStep3.favoriteFoodPlaceholder", "pizza, ice cream, fruit...")}
                  className="w-full"
                  validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'interest')}
                  validationError={validationErrors.favoriteFood}
                />
                
                {/* Loading indicator */}
                {spellcheckLoading.favoriteFood && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking spelling...</span>
                  </div>
                )}
                
                {/* Translation preview */}
                {translations.favoriteFood && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.favoriteFood}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.favoriteFood && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.favoriteFood}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('favoriteFood')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
                
                {/* Validation errors */}
                {validationErrors.favoriteFood && validationErrors.favoriteFood.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    {validationErrors.favoriteFood.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <span className="font-medium">⚠️</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Try child-friendly foods like "pizza," "fruit," or "cookies"
                    </div>
                  </div>
                )}
              </div>

              {/* Hobbies */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.hobbies", "Hobbies & Activities")}
                </Label>
                <TagInput
                  value={formData.hobbies || ''}
                  onChange={(value) => handleInputChange('hobbies', value)}
                  placeholder={t("formStep3.hobbiesPlaceholder", "soccer, drawing, music...")}
                  className="w-full"
                  validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'interest')}
                  validationError={validationErrors.hobbies}
                />
                
                {/* Loading indicator */}
                {spellcheckLoading.hobbies && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking spelling...</span>
                  </div>
                )}
                
                {/* Translation preview */}
                {translations.hobbies && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.hobbies}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.hobbies && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.hobbies}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('hobbies')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
                
                {/* Validation errors */}
                {validationErrors.hobbies && validationErrors.hobbies.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    {validationErrors.hobbies.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <span className="font-medium">⚠️</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Try child-friendly activities like "reading," "sports," or "art"
                    </div>
                  </div>
                )}
              </div>

              {/* Special Request */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.specialRequest", "Special Request")} 
                  <span className="text-muted-foreground font-normal">({t("formStep3.optional", "Optional")})</span>
                </Label>
                <TagInput
                  value={formData.specialRequest || ''}
                  onChange={(value) => handleInputChange('specialRequest', value)}
                  placeholder={`Theme: underwater adventure AND friendship → Enter
Characters: brave princess AND talking dragon → Enter
Setting: magical forest AND cozy cottage → Enter`}
                  className="w-full"
                  supportStructured={true}
                  validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'theme')}
                  validationError={validationErrors.specialRequest}
                />
                
                {/* Loading indicator */}
                {spellcheckLoading.specialRequest && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking spelling...</span>
                  </div>
                )}
                
                {/* Translation preview */}
                {translations.specialRequest && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.specialRequest}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.specialRequest && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.specialRequest}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('specialRequest')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
                
                {/* Validation errors for inappropriate content */}
                {validationErrors.specialRequest && validationErrors.specialRequest.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    {validationErrors.specialRequest.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <span className="font-medium">⚠️</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Please use child-friendly themes like "adventure," "friendship," or "magic"
                    </div>
                  </div>
                )}
              </div>

              {/* Target Vocabulary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  {t("formStep3.targetVocabulary", "Target Vocabulary")} 
                  <span className="text-muted-foreground font-normal">({t("formStep3.optional", "Optional")})</span>
                </Label>
                <TagInput
                  value={formData.targetVocabulary || ''}
                  onChange={(value) => handleInputChange('targetVocabulary', value)}
                  placeholder="ocean, brave, explore"
                  className="w-full"
                  validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'general')}
                  validationError={validationErrors.targetVocabulary}
                />
                <p className="text-xs text-muted-foreground">
                  {t("formStep3.targetVocabularyHelp", "Words here will guide the AI to include them in future stories.")}
                </p>
                
                {/* Loading indicator */}
                {spellcheckLoading.targetVocabulary && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking spelling...</span>
                  </div>
                )}
                
                {/* Translation preview */}
                {translations.targetVocabulary && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
                    <Globe className="h-3 w-3" />
                    <span>{translations.targetVocabulary}</span>
                  </div>
                )}
                
                {/* Spellcheck suggestion */}
                {spellcheckSuggestions.targetVocabulary && (
                  <div className="flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-2">
                    <span className="text-xs text-warning">
                      Did you mean: {spellcheckSuggestions.targetVocabulary}?
                    </span>
                    <button
                      onClick={() => acceptSpellcheckSuggestion('targetVocabulary')}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
                
                {/* Validation errors */}
                {validationErrors.targetVocabulary && validationErrors.targetVocabulary.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                    {validationErrors.targetVocabulary.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                        <span className="font-medium">⚠️</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Use educational words like "ocean," "explore," or "friendship"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <ValidationFeedback
        hasErrors={!validationState.isValid}
        errors={validationState.errors}
        hasCoppaViolation={validationState.hasCoppaViolation}
        onSubmissionAttempt={validationState.hasTriedSubmit}
      />

      {/* Completion encouragement */}
      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <p className="text-sm text-success font-medium">
            {t("formStep3.completionMessage", "Perfect! Your personalized reading adventure is ready to begin!")}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <MobileOptimizedButton
          onClick={onBack}
          variant="outline"
          className="py-3"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t("formStep3.back", "Back")}
        </MobileOptimizedButton>

        <MobileOptimizedButton
          onClick={() => {
            const isValid = validateFormOnSubmit({
              specialRequest: formData.specialRequest || "",
              hobbies: formData.hobbies || "",
              favoriteAnimal: formData.favoriteAnimal || "",
              favoriteFood: formData.favoriteFood || ""
            });
            
            if (isValid) {
              onSubmit();
            }
          }}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
        >
          <Heart className="w-4 h-4 mr-2" />
          {t("formStep3.createPerfectStory", "Create My Perfect Story")}
        </MobileOptimizedButton>
      </div>

      {/* Final encouragement */}
      <div className="text-center text-xs text-muted-foreground">
        {t("formStep3.finalEncouragement", "Based on educational research showing connection between personal interests and learning outcomes")}
      </div>
    </div>
  );
};