import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChildProfiles } from "@/hooks/useChildProfiles";
import { childAvatarUrl, childSummary } from "@/components/children/childInfo";
import { TagInput } from "@/components/ui/tag-input";
import { useValidationOnSubmit } from "@/hooks/useValidationOnSubmit";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { spellcheckService } from "@/services/spellcheckService";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2 } from "lucide-react";
import { DebugLogger } from '@/services/DebugLogger';
const STORY_IDEAS = ["Animals", "Space", "Dinosaurs", "Ocean", "Friendship", "Sports", "Mystery", "Something funny"];

interface SpecialRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string;
  onSubmit: (value: string) => void;
  isGenerating?: boolean;
  mode?: 'new' | 'refresh';
}

export const SpecialRequestDialog: React.FC<SpecialRequestDialogProps> = ({
  open,
  onOpenChange,
  initialValue = "",
  onSubmit,
  isGenerating = false,
  mode = 'refresh',
}) => {
  const [value, setValue] = useState(initialValue);
  const { children, activeChild, setActiveChild } = useChildProfiles();
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
        DebugLogger.warn('ui', 'Tag spellcheck failed for field', { field, error });
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
      DebugLogger.warn('ui', 'Spellcheck failed for field', { field, error });
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
              const { data: translationData, error: translationError } = await supabase.functions.invoke('translate-universal', {
                body: { 
                  text: newValue,
                  sourceLanguage: 'auto',
                  targetLanguage: 'en',
                  mode: 'to-english'
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
            DebugLogger.error('ui', 'Translation API error', { translationError });
          }
        }
      } catch (error) {
        DebugLogger.error('ui', 'Processing error', { error, value: newValue });
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
      <DialogContent className="max-h-[100dvh] overflow-y-auto" aria-label={mode === 'new' ? "Start a new story" : "Change this story"} data-testid="new-story-dialog">
        <DialogHeader>
          <DialogTitle>{mode === 'new' ? "New story" : "Change this story"}</DialogTitle>
          <DialogDescription>Everything here is optional. Tap "{mode === 'new' ? "Write story" : "Refresh story"}" when you're ready.</DialogDescription>
        </DialogHeader>

        {/* Who the story is for */}
        {children.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border p-3" data-testid="story-for">
            {activeChild && <img src={childAvatarUrl(activeChild)} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary" />}
            <label htmlFor="story-for-child" className="text-sm font-medium shrink-0">Story for:</label>
            <select
              id="story-for-child"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-2 text-base"
              value={activeChild?.id ?? ""}
              disabled={isGenerating}
              onChange={(e) => { setActiveChild(e.target.value).catch(() => {}); }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name}{childSummary(c) ? ` (${childSummary(c)})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="special-requests" className="text-sm font-semibold">
            What should it be about? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2" aria-label="Ideas: tap to add">
            {STORY_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                className="rounded-full border px-3 py-1.5 text-sm hover:border-primary"
                onClick={() => handleInputChange('specialRequest', value.trim() ? `${value.trim()}, ${idea.toLowerCase()}` : idea)}
              >
                + {idea}
              </button>
            ))}
          </div>
          <Textarea
            id="special-requests"
            placeholder="For example: a dolphin who is scared of the dark"
            value={value}
            onChange={(e) => handleInputChange('specialRequest', e.target.value)}
            className={`min-h-[90px] text-base ${validationErrors.specialRequest?.length > 0 ? 'border-destructive' : ''}`}
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
          <label htmlFor="target-vocab" className="text-sm font-semibold">
            Any words to practice? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <TagInput
            value={targetVocab}
            onChange={(value) => handleInputChange('targetVocabulary', value)}
            placeholder="Type a word, then press Enter"
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
          
          <p className="text-xs text-muted-foreground">We'll use these words in the story.</p>
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
          <Button onClick={handleSubmit} disabled={isGenerating} className="min-h-11" data-testid="write-story">
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
            {isGenerating 
              ? (mode === 'new' ? "Writing your story…" : "Refreshing…") 
              : (mode === 'new' ? (activeChild ? `Write ${activeChild.display_name}'s story` : "Write story") : "Refresh story")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
