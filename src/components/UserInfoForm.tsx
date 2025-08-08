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
import { ChevronRight, User, GraduationCap, Heart, Star, Globe, Sparkles, AlertCircle, ArrowRightLeft, CheckCircle, Loader2 } from "lucide-react";

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
    age: 6,
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

  // This function is no longer needed - replaced by real-time translation
  // Keeping for now in case of rollback needed
  const handleTranslationProcessing = async () => {
    // Real-time translation is now handled in handleInputChange
    console.log('📝 Legacy batch processing - now handled in real-time');
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
        title: "🌟 Almost Ready!",
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
    
    // Age defaults to 6, so only validate if it's somehow null/undefined
    if (!formData.age || formData.age < 3 || formData.age > 12) {
      errors.push("Please select a valid age (3-12 years)");
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
    const hasAge = formData.age && formData.age >= 3 && formData.age <= 12;
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
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-3 sm:p-6 md:p-8 pb-safe relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-accent/5 rounded-full blur-xl"></div>
        </div>

        <Card className="relative z-10 w-full max-w-4xl bg-card/80 backdrop-blur-md shadow-elegant border border-border/50 rounded-3xl p-6 sm:p-8 md:p-12 transition-all duration-300 hover:shadow-glow">
          {/* Modern Header */}
          <div className="text-center mb-10 md:mb-12" id="welcome-title">
            <div className="flex items-center justify-between mb-6">
              <MobileOptimizedButton
                variant="ghost"
                size="sm"
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                className="flex items-center gap-2 min-h-[48px] min-w-[48px] touch-target hover-scale transition-smooth"
                type="button"
              >
                <ChevronRight className={`w-5 h-5 ${i18n.language === 'ar' ? '' : 'rotate-180'}`} />
                <span className="hidden sm:inline">{t('userInfoForm.buttons.back', 'Back')}</span>
              </MobileOptimizedButton>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-6 bg-gradient-primary rounded-2xl text-white shadow-glow">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16" />
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 tracking-tight">
              {t("userInfoForm.title")}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {t("userInfoForm.subtitle")}
            </p>
          </div>

          {/* Progressive Form Layout */}
          <div className="space-y-8 md:space-y-12 mb-10 md:mb-12">
            {/* Essential Information Section */}
            <div className="space-y-6" id="essential-info-section">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("userInfoForm.sections.aboutYou")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Essential details to get started</p>
                </div>
              </div>
            
            {/* Friendly Validation Error Alert */}
            {showValidationErrors && validationErrors.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50 mb-6">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <div className="font-semibold mb-2">Let's finish setting up your story! 🌟</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                  <div className="text-xs mt-2 opacity-75">All other fields are optional and help make your story even better!</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.name.label")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("userInfoForm.fields.name.placeholder")}
                  className="w-full text-base md:text-lg py-3 md:py-4 min-h-[44px] md:min-h-[48px] rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white mobile-input"
                  autoComplete="given-name"
                  inputMode="text"
                  autoFocus
                  aria-describedby="name-description"
                  aria-required="true"
                />
                <div className="text-xs text-muted-foreground" id="name-description">
                  {t("userInfoForm.fields.name.help", "Your child's first name helps create personalized stories")}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.age.label")}
                </Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className={`text-base md:text-lg p-3 md:p-4 min-h-[44px] md:min-h-[48px] rounded-xl md:rounded-2xl border-2 touch-target ${
                    showValidationErrors && !formData.age ? 'border-red-300 bg-red-50' : 'border-primary/20'
                  }`} aria-label="Select your child's age">
                    <SelectValue placeholder={t("userInfoForm.fields.age.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10].map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} {t("userInfoForm.fields.age.yearsOld")}</SelectItem>
                    ))}
                    <SelectItem value="11">11+ {t("userInfoForm.fields.age.yearsOld")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.grade.label")}
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder={t("userInfoForm.fields.grade.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PreK">{t("userInfoForm.grades.PreK")}</SelectItem>
                    <SelectItem value="K">{t("userInfoForm.grades.K")}</SelectItem>
                    <SelectItem value="1st">{t("userInfoForm.grades.1st")}</SelectItem>
                    <SelectItem value="2nd">{t("userInfoForm.grades.2nd")}</SelectItem>
                    <SelectItem value="3rd">{t("userInfoForm.grades.3rd")}</SelectItem>
                    <SelectItem value="4th">{t("userInfoForm.grades.4th")}</SelectItem>
                    <SelectItem value="5th">{t("userInfoForm.grades.5th")}</SelectItem>
                    <SelectItem value="6th+">{t("userInfoForm.grades.6th")} or Higher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nativeLanguage" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.nativeLanguage.label")} <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.nativeLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className={`text-base md:text-lg p-3 md:p-4 min-h-[44px] md:min-h-[48px] rounded-xl md:rounded-2xl border-2 ${showValidationErrors && !formData.nativeLanguage ? 'border-red-300 bg-red-50' : 'border-primary/20'}`}
                                aria-label="Select your child's native language" aria-required="true">
                    <SelectValue placeholder={t("userInfoForm.fields.nativeLanguage.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("userInfoForm.languages.en")}</SelectItem>
                    <SelectItem value="ar" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.ar")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                    <SelectItem value="es" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.es")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                    <SelectItem value="zh" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.zh")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                    <SelectItem value="hi" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.hi")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                    <SelectItem value="pt" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.pt")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                    <SelectItem value="fr" className="relative">
                      <div className="flex items-center justify-between w-full">
                        <span>{t("userInfoForm.languages.fr")}</span>
                        <Globe className="w-4 h-4 text-blue-500 ml-2" />
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.nativeLanguage && formData.nativeLanguage !== 'en' && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {t("userInfoForm.fields.nativeLanguage.translationInfo")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningGoal" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.learningGoal.label")}
                </Label>
                <Select value={formData.learningGoal} onValueChange={(value) => handleInputChange("learningGoal", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder={t("userInfoForm.fields.learningGoal.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improve-english-reading">{t("userInfoForm.fields.learningGoal.options.improve-english-reading")}</SelectItem>
                    <SelectItem value="learn-english-language">{t("userInfoForm.fields.learningGoal.options.learn-english-language")}</SelectItem>
                    <SelectItem value="both">{t("userInfoForm.fields.learningGoal.options.both")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingAbility" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.readingAbility.label")} <span className="text-red-500">*</span>
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Research-Based Dolch Sight Words)
                  </span>
                </Label>
                 <Select value={formData.readingAbility} onValueChange={(value) => handleInputChange("readingAbility", value)}>
                   <SelectTrigger className="text-base md:text-lg p-4 md:p-5 rounded-2xl border-2 border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white hover:border-primary/40 transition-all duration-200 min-h-[60px]">
                     <SelectValue placeholder={t("userInfoForm.fields.readingAbility.placeholder")} />
                   </SelectTrigger>
                   <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-elegant p-2 max-w-md">
                     <SelectItem value="beginner" className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer">
                       <div className="flex items-start gap-3">
                         <span className="text-2xl">{t("userInfoForm.fields.readingAbility.levels.beginner.icon")}</span>
                         <div className="flex-1">
                           <div className="font-bold text-lg text-primary mb-1">
                             {t("userInfoForm.fields.readingAbility.levels.beginner.title")}
                           </div>
                           <div className="text-sm text-foreground/80 mb-2">
                             {t("userInfoForm.fields.readingAbility.levels.beginner.description")}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium bg-primary/10 px-2 py-1 rounded-full inline-block">
                             {t("userInfoForm.fields.readingAbility.levels.beginner.details")}
                           </div>
                         </div>
                       </div>
                     </SelectItem>
                     <SelectItem value="easy" className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer">
                       <div className="flex items-start gap-3">
                         <span className="text-2xl">{t("userInfoForm.fields.readingAbility.levels.easy.icon")}</span>
                         <div className="flex-1">
                           <div className="font-bold text-lg text-emerald-600 mb-1">
                             {t("userInfoForm.fields.readingAbility.levels.easy.title")}
                           </div>
                           <div className="text-sm text-foreground/80 mb-2">
                             {t("userInfoForm.fields.readingAbility.levels.easy.description")}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium bg-emerald-100 px-2 py-1 rounded-full inline-block">
                             {t("userInfoForm.fields.readingAbility.levels.easy.details")}
                           </div>
                         </div>
                       </div>
                     </SelectItem>
                     <SelectItem value="medium" className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer">
                       <div className="flex items-start gap-3">
                         <span className="text-2xl">{t("userInfoForm.fields.readingAbility.levels.medium.icon")}</span>
                         <div className="flex-1">
                           <div className="font-bold text-lg text-blue-600 mb-1">
                             {t("userInfoForm.fields.readingAbility.levels.medium.title")}
                           </div>
                           <div className="text-sm text-foreground/80 mb-2">
                             {t("userInfoForm.fields.readingAbility.levels.medium.description")}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium bg-blue-100 px-2 py-1 rounded-full inline-block">
                             {t("userInfoForm.fields.readingAbility.levels.medium.details")}
                           </div>
                         </div>
                       </div>
                     </SelectItem>
                     <SelectItem value="hard" className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer">
                       <div className="flex items-start gap-3">
                         <span className="text-2xl">{t("userInfoForm.fields.readingAbility.levels.hard.icon")}</span>
                         <div className="flex-1">
                           <div className="font-bold text-lg text-orange-600 mb-1">
                             {t("userInfoForm.fields.readingAbility.levels.hard.title")}
                           </div>
                           <div className="text-sm text-foreground/80 mb-2">
                             {t("userInfoForm.fields.readingAbility.levels.hard.description")}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium bg-orange-100 px-2 py-1 rounded-full inline-block">
                             {t("userInfoForm.fields.readingAbility.levels.hard.details")}
                           </div>
                         </div>
                       </div>
                     </SelectItem>
                     <SelectItem value="expert" className="p-4 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer">
                       <div className="flex items-start gap-3">
                         <span className="text-2xl">{t("userInfoForm.fields.readingAbility.levels.expert.icon")}</span>
                         <div className="flex-1">
                           <div className="font-bold text-lg text-purple-600 mb-1">
                             {t("userInfoForm.fields.readingAbility.levels.expert.title")}
                           </div>
                           <div className="text-sm text-foreground/80 mb-2">
                             {t("userInfoForm.fields.readingAbility.levels.expert.description")}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium bg-purple-100 px-2 py-1 rounded-full inline-block">
                             {t("userInfoForm.fields.readingAbility.levels.expert.details")}
                           </div>
                         </div>
                       </div>
                     </SelectItem>
                   </SelectContent>
                 </Select>
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                   <div className="flex items-start gap-2">
                     <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                     <div className="space-y-2">
                       <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                         {t("userInfoForm.fields.readingAbility.helpText")}
                       </p>
                       <p className="text-xs text-blue-700 dark:text-blue-300">
                         {t("userInfoForm.fields.readingAbility.researchDetails")}
                       </p>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.avatar.label")}
                </Label>
                <AvatarPicker
                  value={formData.avatar}
                  onChange={(avatar) => setFormData(prev => ({ ...prev, avatar }))}
                />
              </div>
            </div>
          </div>

            {/* Personalization Section */}
            <div className="space-y-6" id="personalization-section">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("userInfoForm.sections.yourFavorites")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {isPremium ? "Add as many favorites as you'd like!" : "Choose one favorite to personalize your story"}
                  </p>
                </div>
                {!isPremium && (
                  <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium border border-orange-200">
                    Free: Pick 1
                  </div>
                )}
              </div>
              
              {!isPremium && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-orange-100 rounded-full">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-orange-800 font-medium text-sm">Free Version Limit</p>
                      <p className="text-orange-700 text-sm mt-1">
                        Choose one favorite below to personalize your story. Upgrade for unlimited customization!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`space-y-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                (!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteColor') 
                  ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                  : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/70'
              }`}>
                <Label htmlFor="favoriteColor" className="text-base font-semibold text-foreground flex items-center gap-2">
                  🎨 {t("userInfoForm.fields.favoriteColor.label")}
                  <span className="text-xs text-muted-foreground">{t("userInfoForm.fields.favoriteColor.optional")}</span>
                </Label>
                <div className="relative">
                  <ColorPicker
                    value={formData.favoriteColor}
                    onChange={(color) => handleInputChange("favoriteColor", color)}
                  />
                  {translationLoading.favoriteColor && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                {translationLoading.favoriteColor && (
                  <div className="translation-feedback">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    {t('userForm.translating', 'Translating...')}
                  </div>
                )}
                {translations.favoriteColor && !translationLoading.favoriteColor && (
                  <div className="translation-feedback">
                    <Globe className="w-3 h-3 inline mr-1" />
                    {translations.favoriteColor}
                  </div>
                )}
              </div>

              <div className={`space-y-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                (!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteAnimal') 
                  ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                  : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/70'
              }`}>
                <Label htmlFor="favoriteAnimal" className="text-base font-semibold text-foreground flex items-center gap-2">
                  🐾 {t("userInfoForm.fields.favoriteAnimal.label")}
                  <span className="text-xs text-muted-foreground">{t("userInfoForm.fields.favoriteAnimal.optional")}</span>
                </Label>
                <MobileTooltip
                  content={t("userInfoForm.fields.favoriteAnimal.tooltip", "Enter animals as simple words - singular or plural doesn't matter!")}
                  side="top"
                >
                  <div className="relative">
                     <TagInput
                       value={formData.favoriteAnimal}
                       onChange={(value) => handleInputChange("favoriteAnimal", value)}
                       placeholder={t("userInfoForm.fields.favoriteAnimal.placeholder", "dog, cat, lion, dolphin...")}
                       className="multilingual-input"
                     />
                    {translationLoading.favoriteAnimal && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                </MobileTooltip>
                {translationLoading.favoriteAnimal && (
                  <div className="translation-feedback">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    {t('userForm.translating', 'Translating...')}
                  </div>
                )}
                {translations.favoriteAnimal && !translationLoading.favoriteAnimal && (
                  <div className="translation-feedback">
                    <Globe className="w-3 h-3 inline mr-1" />
                    {translations.favoriteAnimal}
                  </div>
                )}
              </div>

              <div className={`space-y-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                (!isPremium && selectedOptionalField && selectedOptionalField !== 'favoriteFood') 
                  ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                  : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/70'
              }`}>
                <Label htmlFor="favoriteFood" className="text-base font-semibold text-foreground flex items-center gap-2">
                  🍕 {t("userInfoForm.fields.favoriteFood.label")}
                  <span className="text-xs text-muted-foreground">{t("userInfoForm.fields.favoriteFood.optional")}</span>
                </Label>
                <MobileTooltip
                  content={t("userInfoForm.fields.favoriteFood.tooltip", "Enter foods as simple words - plural or singular works!")}
                  side="top"
                >
                  <div className="relative">
                     <TagInput
                       value={formData.favoriteFood}
                       onChange={(value) => handleInputChange("favoriteFood", value)}
                       placeholder={t("userInfoForm.fields.favoriteFood.placeholder", "pizza, ice cream, apples, cookies...")}
                       className="multilingual-input"
                     />
                    {translationLoading.favoriteFood && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                </MobileTooltip>
                {translationLoading.favoriteFood && (
                  <div className="translation-feedback">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    {t('userForm.translating', 'Translating...')}
                  </div>
                )}
                {translations.favoriteFood && !translationLoading.favoriteFood && (
                  <div className="translation-feedback">
                    <Globe className="w-3 h-3 inline mr-1" />
                    {translations.favoriteFood}
                  </div>
                )}
              </div>

              <div className={`space-y-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                (!isPremium && selectedOptionalField && selectedOptionalField !== 'hobbies') 
                  ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                  : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/70'
              }`}>
                <Label htmlFor="hobbies" className="text-base font-semibold text-foreground flex items-center gap-2">
                  ⚽ {t("userInfoForm.fields.hobbies.label")}
                  <span className="text-xs text-muted-foreground">{t("userInfoForm.fields.hobbies.optional")}</span>
                </Label>
                <MobileTooltip
                  content={t("userInfoForm.fields.hobbies.tooltip", "Enter activities your child enjoys - any way you like!")}
                  side="top"
                >
                  <div className="relative">
                     <TagInput
                       value={formData.hobbies}
                       onChange={(value) => handleInputChange("hobbies", value)}
                       placeholder={t("userInfoForm.fields.hobbies.placeholder", "soccer, drawing, dancing, video games...")}
                       className="multilingual-input"
                     />
                    {translationLoading.hobbies && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    )}
                  </div>
                </MobileTooltip>
                {translationLoading.hobbies && (
                  <div className="translation-feedback">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    {t('userForm.translating', 'Translating...')}
                  </div>
                )}
                {translations.hobbies && !translationLoading.hobbies && (
                  <div className="translation-feedback">
                    <Globe className="w-3 h-3 inline mr-1" />
                    {translations.hobbies}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Special Requests Section */}
            <div className="space-y-6" id="special-request-section">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("userInfoForm.sections.additionalInfo")}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">Any special themes or ideas for your story</p>
                </div>
              </div>
            
            <div className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
              (!isPremium && selectedOptionalField && selectedOptionalField !== 'specialRequest') 
                ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                : 'border-primary/20 bg-white/50 hover:border-primary/40 hover:bg-white/70'
            }`}>
              <Label htmlFor="specialRequest" className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                ✨ {t("userInfoForm.fields.specialRequest.label")}
                <span className="text-xs text-muted-foreground">{t("userInfoForm.fields.specialRequest.optional")}</span>
              </Label>
              <div className="relative">
                 <TagInput
                   value={formData.specialRequest}
                   onChange={(value) => handleInputChange("specialRequest", value)}
                   placeholder={t("userInfoForm.fields.specialRequest.placeholder")}
                   className="multilingual-input min-h-[60px]"
                 />
                {translationLoading.specialRequest && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  </div>
                )}
              </div>
              {translationLoading.specialRequest && (
                <div className="translation-feedback mt-2">
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  {t('userForm.translating', 'Translating...')}
                </div>
              )}
              {translations.specialRequest && !translationLoading.specialRequest && (
                <div className="translation-feedback mt-2">
                  <Globe className="w-3 h-3 inline mr-1" />
                  {translations.specialRequest}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-between pt-8 border-t border-primary/20">
            <div className="flex-1 sm:max-w-xs order-2 sm:order-1">
              <MobileOptimizedButton
                variant="outline"
                size="lg"
                onClick={onBack}
                className="w-full text-lg py-6 rounded-xl hover:scale-105 transition-all duration-200"
              >
                {t("userInfoForm.buttons.backToHome")}
              </MobileOptimizedButton>
            </div>
            <MobileTooltip
              content={!isFormComplete() ? t("userInfoForm.tooltips.nameRequired", "Please enter your child's name first") : ""}
              side="top"
              disabled={isFormComplete()}
            >
              <div className="flex-1 sm:max-w-xs order-1 sm:order-2">
                <MobileOptimizedButton
                  id="create-story-button"
                  variant="default"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isFormComplete()}
                  aria-label={isFormComplete() ? "Create personalized story" : "Complete required fields to create story"}
                  className={`w-full transition-all duration-300 text-lg py-6 rounded-xl shadow-glow ${
                    isFormComplete() 
                      ? 'bg-gradient-primary hover:scale-105 text-white font-semibold focus:ring-4 focus:ring-primary/30' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  {t("userInfoForm.buttons.createStory")}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </MobileOptimizedButton>
              </div>
            </MobileTooltip>
          </div>
        </Card>
      </div>
    );
  };