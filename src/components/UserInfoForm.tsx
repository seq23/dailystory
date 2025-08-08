import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import { ContentSecurity, SecurityLogger } from "@/utils/security";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SmartInputParser } from "@/services/smartInputParser";
import type { UserInfo, Grade, LanguageCode, LearningGoal } from "@/types";

export type { UserInfo } from "@/types";

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
  isPremium?: boolean;
}

export const UserInfoForm = ({ onSubmit, onBack, isPremium = false }: UserInfoFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { isMobileOrTablet } = useIsMobile();
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 7, // Default age for compatibility
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
    difficultyLevel: "beginner",
    readingAbility: "beginner"
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
  
  // Track optional fields for free users (only 1 allowed)
  const [selectedOptionalField, setSelectedOptionalField] = useState<string | null>(null);
  const [showReadingLevelDetails, setShowReadingLevelDetails] = useState(false);

  // Enhanced content filtering with grade-aware security and multilingual support
  const contentFilter = (text: string): { hasInappropriateContent: boolean; reason?: string } => {
    const validation = ContentSecurity.isContentAppropriate(text, formData.grade, formData.nativeLanguage);
    return {
      hasInappropriateContent: !validation.appropriate,
      reason: validation.reason
    };
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
      
      // Sanitize input with enhanced protection
      const sanitizedValue = InputSanitizer.sanitizeUserInfo(value);
      
      // Only check for inappropriate content on additions, not deletions
      if (!isDeletion) {
        const validation = contentFilter(sanitizedValue);
        if (validation.hasInappropriateContent) {
          SecurityLogger.log('inappropriate_content_attempt', {
            field,
            reason: validation.reason,
            originalValue: value
          });
          
          // Content warning handled silently
          return;
        }
      }
      
      // Update form data immediately
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));

      // Handle real-time translation for specific fields
      if (['favoriteAnimal', 'favoriteFood', 'favoriteColor', 'hobbies', 'specialRequest'].includes(field as string) && sanitizedValue.trim()) {
        // Show loading state for translation
        setTranslationLoading(prev => ({ ...prev, [field as string]: true }));
        
        try {
        console.log(`🔄 Real-time translation triggered for ${field}: "${sanitizedValue}"`);
        console.log(`📋 User info:`, { 
          nativeLanguage: formData.nativeLanguage, 
          grade: formData.grade,
          age: formData.age 
        });
          
          // Use SmartInputParser for processing (includes translation)
          const result = await SmartInputParser.parseTaggedInput(
            [sanitizedValue],
            formData,
            true // mobile optimized
          );

          if (result.parsedTags.length > 0) {
            const processedTag = result.parsedTags[0];
            
            // If translation/correction occurred, show feedback and update form
            if (processedTag.original !== processedTag.corrected) {
              console.log(`✅ Translation completed: "${processedTag.original}" → "${processedTag.corrected}"`);
              setTranslations(prev => ({ 
                ...prev, 
                [field as string]: `${processedTag.original} → ${processedTag.corrected}` 
              }));
              
              // Update the form data with the processed (corrected/translated) value
              setFormData(prev => ({ ...prev, [field]: processedTag.corrected }));
              
              // Clear translation feedback after 3 seconds
              setTimeout(() => {
                setTranslations(prev => ({ ...prev, [field as string]: '' }));
              }, 3000);
            } else {
              console.log(`ℹ️ No translation needed for: "${processedTag.original}"`);
              // Clear any existing translation for this field
              setTranslations(prev => ({ ...prev, [field as string]: '' }));
            }
          }
        } catch (error) {
          console.error(`❌ Translation error for "${sanitizedValue}":`, error);
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
    console.log("Form submitted! Name:", formData.name.trim(), "Complete:", isFormComplete());
    // Check form validation first
    const errors = validateForm();
    
    if (errors.length > 0) {
      console.log("Validation errors:", errors);
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

    // Rate limiting check
    const userIdentifier = formData.name + Date.now(); // Simple identifier
    if (!ContentSecurity.checkRateLimit(userIdentifier)) {
      // Rate limit handled silently
      return;
    }

    // Final validation of all form data with multilingual support
    const allText = `${formData.name} ${formData.favoriteAnimal} ${formData.favoriteFood} ${formData.hobbies} ${formData.specialRequest}`;
    const finalValidation = ContentSecurity.isContentAppropriate(allText, formData.grade, formData.nativeLanguage);
    
    if (!finalValidation.appropriate) {
      SecurityLogger.log('form_submission_blocked', {
        reason: finalValidation.reason,
        formData: { ...formData, name: '[REDACTED]' }
      });
      
      // Content validation handled silently
      return;
    }

    // Use the selected reading ability, or fall back to age-based difficulty
    const difficulty = formData.readingAbility || (formData.age <= 5 ? "beginner" : formData.age <= 8 ? "easy" : formData.age <= 11 ? "medium" : formData.age <= 13 ? "hard" : "expert");
    
    SecurityLogger.log('form_submission_success', {
      difficultyLevel: difficulty,
      age: formData.age,
      grade: formData.grade
    });
    
    onSubmit({ ...formData, difficultyLevel: difficulty } as UserInfo);
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    // Only validate truly essential fields to improve form completion rates
    if (!formData.name.trim()) {
      errors.push("Please enter your child's first name");
    }
    
    // Age defaults to 7, so only validate if it's somehow null/undefined
    if (!formData.age || formData.age < 3 || formData.age > 11) {
      errors.push("Please select a valid age (3-11 years)");
    }
    
    // Grade and language should have defaults, only validate if missing
    if (!formData.grade) {
      errors.push("Please select a grade level");
    }
    
    if (!formData.nativeLanguage) {
      errors.push("Please select a language");
    }
    
    // Avatar validation is less critical - provide defaults if missing
    if (!formData.avatar?.type) {
      formData.avatar = { ...formData.avatar, type: 'boy' };
    }
    
    if (!formData.avatar?.skinTone) {
      formData.avatar = { ...formData.avatar, skinTone: 'light' };
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
    console.log("Form complete check:", { hasName, hasAge, hasGrade, hasLanguage, complete });
    return complete;
  };

  // Handle language change and update UI language
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setFormData(prev => ({ ...prev, nativeLanguage: newLanguage }));
    i18n.changeLanguage(newLanguage);
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
              <div className="font-medium mb-2">Please complete the required fields:</div>
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
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("userInfoForm.fields.name.placeholder")}
                  className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                  autoComplete="given-name"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  {t("userInfoForm.fields.age.label")} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.age?.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.age.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                      <SelectItem key={age} value={age.toString()} className="focus:bg-accent focus:text-accent-foreground">
                        {age} years old
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
                  <SelectTrigger className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.grade.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    <SelectItem value="PreK" className="focus:bg-accent focus:text-accent-foreground">Pre-K</SelectItem>
                    <SelectItem value="Kindergarten" className="focus:bg-accent focus:text-accent-foreground">Kindergarten</SelectItem>
                    <SelectItem value="1st" className="focus:bg-accent focus:text-accent-foreground">1st Grade</SelectItem>
                    <SelectItem value="2nd" className="focus:bg-accent focus:text-accent-foreground">2nd Grade</SelectItem>
                    <SelectItem value="3rd" className="focus:bg-accent focus:text-accent-foreground">3rd Grade</SelectItem>
                    <SelectItem value="4th" className="focus:bg-accent focus:text-accent-foreground">4th Grade</SelectItem>
                    <SelectItem value="5th" className="focus:bg-accent focus:text-accent-foreground">5th Grade</SelectItem>
                    <SelectItem value="6th" className="focus:bg-accent focus:text-accent-foreground">6th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  {t("userInfoForm.fields.nativeLanguage.label")} <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.nativeLanguage} onValueChange={(value) => handleLanguageChange(value as LanguageCode)}>
                  <SelectTrigger className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
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
                <p className="text-sm text-muted-foreground">{t("userInfoForm.fields.readingAbility.description")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="readingAbility" className="text-sm font-medium">
                  {t("userInfoForm.fields.readingAbility.label")}
                </Label>
                <Select value={formData.readingAbility} onValueChange={(value) => handleInputChange("readingAbility", value)}>
                  <SelectTrigger className="h-10 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder={t("userInfoForm.fields.readingAbility.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-soft z-50">
                    <SelectItem value="beginner" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.readingAbility.options.preReader")}
                    </SelectItem>
                    <SelectItem value="easy" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.readingAbility.options.beginner")}
                    </SelectItem>
                    <SelectItem value="medium" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.readingAbility.options.developing")}
                    </SelectItem>
                    <SelectItem value="hard" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.readingAbility.options.independent")}
                    </SelectItem>
                    <SelectItem value="expert" className="focus:bg-accent focus:text-accent-foreground">
                      {t("userInfoForm.fields.readingAbility.options.advanced")}
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
                    <h4 className="font-medium text-foreground">{t("userInfoForm.fields.readingAbility.learnMore.title")}</h4>
                    <p className="text-muted-foreground">{t("userInfoForm.fields.readingAbility.learnMore.description")}</p>
                     {formData.readingAbility && (
                       <div className="p-3 bg-background rounded border border-border/50">
                         <div className="font-medium text-foreground mb-1">
                           {formData.readingAbility === 'beginner' && t("userInfoForm.fields.readingAbility.options.preReader")}
                           {formData.readingAbility === 'easy' && t("userInfoForm.fields.readingAbility.options.beginner")}
                           {formData.readingAbility === 'medium' && t("userInfoForm.fields.readingAbility.options.developing")}
                           {formData.readingAbility === 'hard' && t("userInfoForm.fields.readingAbility.options.independent")}
                           {formData.readingAbility === 'expert' && t("userInfoForm.fields.readingAbility.options.advanced")}
                         </div>
                         <div className="text-muted-foreground">
                           {formData.readingAbility === 'beginner' && t("userInfoForm.fields.readingAbility.details.preReader")}
                           {formData.readingAbility === 'easy' && t("userInfoForm.fields.readingAbility.details.beginner")}
                           {formData.readingAbility === 'medium' && t("userInfoForm.fields.readingAbility.details.developing")}
                           {formData.readingAbility === 'hard' && t("userInfoForm.fields.readingAbility.details.independent")}
                           {formData.readingAbility === 'expert' && t("userInfoForm.fields.readingAbility.details.advanced")}
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
                  <Input
                    value={formData.favoriteAnimal}
                    onChange={(e) => handleInputChange("favoriteAnimal", e.target.value)}
                    placeholder={t("userInfoForm.fields.favoriteAnimal.placeholder")}
                    className="h-12 text-base bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteAnimal'}
                  />
                  {translationLoading.favoriteAnimal && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
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
                  <Input
                    value={formData.favoriteFood}
                    onChange={(e) => handleInputChange("favoriteFood", e.target.value)}
                    placeholder={t("userInfoForm.fields.favoriteFood.placeholder")}
                    className="h-12 text-base bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteFood'}
                  />
                  {translationLoading.favoriteFood && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
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
                  <Input
                    value={formData.hobbies}
                    onChange={(e) => handleInputChange("hobbies", e.target.value)}
                    placeholder={t("userInfoForm.fields.hobbies.placeholder")}
                    className="h-12 text-base bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'hobbies'}
                  />
                  {translationLoading.hobbies && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
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
                  <Textarea
                    value={formData.specialRequest}
                    onChange={(e) => handleInputChange("specialRequest", e.target.value)}
                    placeholder={t("userInfoForm.fields.specialRequest.placeholder")}
                    className="min-h-24 text-base bg-background border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
                    disabled={!isPremium && selectedOptionalField && selectedOptionalField !== 'specialRequest'}
                    rows={3}
                  />
                  {translationLoading.specialRequest && (
                    <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>
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