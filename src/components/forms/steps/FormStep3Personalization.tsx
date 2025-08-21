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
        console.warn('Tag spellcheck failed for field:', field, error);
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
      console.warn('Spellcheck failed for field:', field, error);
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
              const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-to-english', {
                body: { 
                  text: sanitizedValue,
                  sourceLanguage: formData.nativeLanguage
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
              console.error('Translation API error:', translationError);
            }
          }
          
          const validationResult = validateTheme(processedValue);
          
          if (validationResult.valid) {
            onUpdate({ [field]: validationResult.sanitized });
          } else {
            onUpdate({ [field]: sanitizedValue });
          }
        } catch (error) {
          console.error(`Processing error for "${sanitizedValue}":`, error);
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
...
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