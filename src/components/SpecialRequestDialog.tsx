import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { useValidationOnSubmit } from "@/hooks/useValidationOnSubmit";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { spellcheckService } from "@/services/spellcheckService";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2 } from "lucide-react";
interface SpecialRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSubmit: (value: string) => void;
  isGenerating?: boolean;
}

export const SpecialRequestDialog: React.FC<SpecialRequestDialogProps> = ({
  open,
  onOpenChange,
  initialValue = "",
  onSubmit,
  isGenerating = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [targetVocab, setTargetVocab] = useState<string>("");
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
    targetVocabulary: []
  });

  useEffect(() => {
    setValue(initialValue || "");
    setTargetVocab("");
    resetValidation();
    // Clear all states when dialog opens/closes
    setSpellcheckSuggestions({});
    setSpellcheckLoading({});
    setTranslations({});
    setTranslationLoading({});
    setValidationErrors({ specialRequest: [], targetVocabulary: [] });
  }, [initialValue, open, resetValidation]);

  // Spellcheck function for TagInput fields
  const performTagInputSpellcheck = async (field: string, text: string) => {
    if (!text.trim()) return;

    if (field === 'targetVocabulary') {
      // Split into individual tags and spellcheck each separately
      const tags = text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const correctedTags: string[] = [];
      let hasChanges = false;

      setSpellcheckLoading(prev => ({ ...prev, [field]: true }));

      try {
        for (const tag of tags) {
          if (spellcheckService.shouldCheck(tag)) {
            const result = await spellcheckService.checkSpelling(tag, 'K', 'user_form_input');
            
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
      // Fall back to regular spellcheck for textarea
      performRegularSpellcheck(field, text);
    }
  };

  // Regular spellcheck function for textarea
  const performRegularSpellcheck = async (field: string, text: string) => {
    if (!spellcheckService.shouldCheck(text)) {
      return;
    }

    setSpellcheckLoading(prev => ({ ...prev, [field]: true }));

    try {
      const result = await spellcheckService.checkSpelling(text, 'K', 'user_form_input');

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
      if (field === 'specialRequest') {
        setValue(suggestion);
      } else if (field === 'targetVocabulary') {
        setTargetVocab(suggestion);
      }
      setSpellcheckSuggestions(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Handle input changes with processing
  const handleInputChange = async (field: 'specialRequest' | 'targetVocabulary', newValue: string) => {
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

    // Real-time validation
    if (newValue.trim()) {
      const context = field === 'specialRequest' ? 'theme' : 'general';
      const validation = InputSanitizer.validateChildSafeInput(newValue, context);
      if (!validation.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: validation.issues
        }));
      }
    }

    // Setup debounced spellcheck
    if (newValue.length > 2) {
      if (spellcheckTimeouts[field]) {
        clearTimeout(spellcheckTimeouts[field]);
      }

      const timeout = setTimeout(() => {
        performTagInputSpellcheck(field, newValue);
      }, 500);

      setSpellcheckTimeouts(prev => ({ ...prev, [field]: timeout }));
    }
    
    // Update the field value
    if (field === 'specialRequest') {
      setValue(newValue);
    } else {
      setTargetVocab(newValue);
    }

    // Handle translation preview (for non-English input)
    if (newValue.trim()) {
      setTranslationLoading(prev => ({ ...prev, [field]: true }));
      
      try {
        // Simple check for non-English characters to trigger translation
        const hasNonEnglish = /[^\x00-\x7F]/.test(newValue);
        if (hasNonEnglish) {
          try {
              const { data: translationData, error: translationError } = await supabase.functions.invoke('translation-service', {
                body: { 
                  operation: 'translate-to-english',
                  text: newValue,
                  fromLanguage: 'auto'
                }
              });
            
            if (!translationError && translationData?.translatedText) {
              setTranslations(prev => ({ 
                ...prev, 
                [field]: `${newValue} → ${translationData.translatedText}` 
              }));
              
              setTimeout(() => {
                setTranslations(prev => ({ ...prev, [field]: '' }));
              }, 4000);
            }
          } catch (translationError) {
            console.error('Translation API error:', translationError);
          }
        }
      } catch (error) {
        console.error(`Processing error for "${newValue}":`, error);
      } finally {
        setTranslationLoading(prev => ({ ...prev, [field]: false }));
      }
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

  const handleSubmit = () => {
    const base = (value || "").trim();
    const vocab = (targetVocab || "").trim();
    const composed = vocab ? `${base ? base + "\n" : ""}Target vocabulary: ${vocab}` : base;
    
    // Validate the composed content before submission
    const isValid = validateFormOnSubmit({
      specialRequest: base,
      targetVocabulary: vocab,
      composed: composed
    });
    
    if (isValid) {
      onSubmit(composed);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-label="Update special requests before generating a new story">
        <DialogHeader>
          <DialogTitle>Add your magic!</DialogTitle>
          <DialogDescription>
            Update any special requests. These guide the AI when creating your next page-by-page story.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="special-requests" className="text-sm font-medium text-muted-foreground">
            Special requests (optional)
          </label>
          <Textarea
            id="special-requests"
            placeholder={`Themes: underwater adventure AND friendship --> Enter
Characters: brave princess AND talking dragon --> Enter
Setting: magical forest AND cozy cottage --> Enter`}
            value={value}
            onChange={(e) => handleInputChange('specialRequest', e.target.value)}
            className={`min-h-[120px] ${validationErrors.specialRequest?.length > 0 ? 'border-destructive' : ''}`}
            spellCheck="true"
          />
          
          {/* Loading indicator for special requests */}
          {spellcheckLoading.specialRequest && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking spelling...</span>
            </div>
          )}
          
          {/* Translation preview for special requests */}
          {translations.specialRequest && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
              <Globe className="h-3 w-3" />
              <span>{translations.specialRequest}</span>
            </div>
          )}
          
          {/* Spellcheck suggestion for special requests */}
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
          
          {/* Validation errors for special requests */}
          {validationErrors.specialRequest && validationErrors.specialRequest.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
              {validationErrors.specialRequest.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                  <span className="font-medium">⚠️</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2 mt-4">
          <label htmlFor="target-vocab" className="text-sm font-medium text-muted-foreground">
            Target vocabulary (optional)
          </label>
          <TagInput
            value={targetVocab}
            onChange={(value) => handleInputChange('targetVocabulary', value)}
            placeholder="ocean, brave, explore"
            validateInput={(text) => InputSanitizer.validateChildSafeInput(text, 'general')}
            validationError={validationErrors.targetVocabulary}
          />
          
          {/* Loading indicator for target vocabulary */}
          {spellcheckLoading.targetVocabulary && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking spelling...</span>
            </div>
          )}
          
          {/* Translation preview for target vocabulary */}
          {translations.targetVocabulary && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded">
              <Globe className="h-3 w-3" />
              <span>{translations.targetVocabulary}</span>
            </div>
          )}
          
          {/* Spellcheck suggestion for target vocabulary */}
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
          
          {/* Validation errors for target vocabulary */}
          {validationErrors.targetVocabulary && validationErrors.targetVocabulary.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
              {validationErrors.targetVocabulary.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-destructive">
                  <span className="font-medium">⚠️</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">Words here will guide the AI to include them in the next story.</p>
        </div>
        
        <ValidationFeedback
          hasErrors={!validationState.isValid}
          errors={validationState.errors}
          hasCoppaViolation={validationState.hasCoppaViolation}
          onSubmissionAttempt={validationState.hasTriedSubmit}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGenerating}>
            {isGenerating ? "Refreshing..." : "Refresh story"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
