import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { ColorPicker } from "@/components/ui/color-picker";
import { AvatarPicker } from "@/components/ui/avatar-picker";
import { ChevronRight, User, GraduationCap, Heart, Star } from "lucide-react";
import { ContentSecurity, SecurityLogger } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";

export interface UserInfo {
  name: string;
  age: number;
  grade: string;
  avatar: {
    type: "boy" | "girl";
    skinTone: "pale" | "light" | "medium" | "olive" | "dark";
  };
  favoriteColor: string;
  favoriteAnimal: string;
  hobbies: string;
  favoriteFood: string;
  specialRequest: string;
  difficultyLevel?: "easy" | "medium" | "hard" | "expert";
  readingAbility?: "easy" | "medium" | "hard" | "expert";
  // New optional language preferences - defaults to English if not specified
  nativeLanguage?: string;
  storyLanguage?: string;
  isLearningMode?: boolean;
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
}

export const UserInfoForm = ({ onSubmit, onBack }: UserInfoFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 6,
    grade: "",
    avatar: {
      type: "boy",
      skinTone: "light"
    },
    favoriteColor: "",
    favoriteAnimal: "",
    hobbies: "",
    favoriteFood: "",
    specialRequest: "",
    difficultyLevel: "easy",
    readingAbility: "easy",
    // Default language preferences (preserves existing behavior)
    nativeLanguage: "English",
    storyLanguage: "English", 
    isLearningMode: false
  });

  // Enhanced content filtering with grade-aware security
  const contentFilter = (text: string): { hasInappropriateContent: boolean; reason?: string } => {
    const validation = ContentSecurity.isContentAppropriate(text, formData.grade);
    return {
      hasInappropriateContent: !validation.appropriate,
      reason: validation.reason
    };
  };

  const handleInputChange = (field: keyof UserInfo, value: string | number | boolean) => {
    if (typeof value === 'string') {
      // Check if this is a deletion (shorter text) - skip security validation for deletions
      const currentValue = formData[field] as string;
      const isDeletion = value.length < currentValue.length;
      
      // Sanitize input
      const sanitizedValue = ContentSecurity.sanitizeInput(value);
      
      // Only check for inappropriate content on additions, not deletions
      if (!isDeletion) {
        const validation = contentFilter(sanitizedValue);
        if (validation.hasInappropriateContent) {
          SecurityLogger.log('inappropriate_content_attempt', {
            field,
            reason: validation.reason,
            originalValue: value
          });
          
          toast({
            title: "Content Warning",
            description: "Please use appropriate language for children's stories!",
            variant: "destructive"
          });
          return;
        }
      }
      
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    // Rate limiting check
    const userIdentifier = formData.name + Date.now(); // Simple identifier
    if (!ContentSecurity.checkRateLimit(userIdentifier)) {
      toast({
        title: "Too Many Requests",
        description: "Please wait a moment before submitting again.",
        variant: "destructive"
      });
      return;
    }

    // Final validation of all form data
    const allText = `${formData.name} ${formData.favoriteAnimal} ${formData.favoriteFood} ${formData.hobbies} ${formData.specialRequest}`;
    const finalValidation = ContentSecurity.isContentAppropriate(allText, formData.grade);
    
    if (!finalValidation.appropriate) {
      SecurityLogger.log('form_submission_blocked', {
        reason: finalValidation.reason,
        formData: { ...formData, name: '[REDACTED]' }
      });
      
      toast({
        title: "Content Issue",
        description: "Please review your inputs for appropriate content.",
        variant: "destructive"
      });
      return;
    }

    // Use the selected reading ability, or fall back to age-based difficulty
    const difficulty = formData.readingAbility || (formData.age <= 6 ? "easy" : formData.age <= 9 ? "medium" : formData.age <= 12 ? "hard" : "expert");
    
    SecurityLogger.log('form_submission_success', {
      difficultyLevel: difficulty,
      age: formData.age,
      grade: formData.grade
    });
    
    onSubmit({ ...formData, difficultyLevel: difficulty });
  };

  const isFormComplete = () => {
    return formData.name && 
           formData.age && 
           formData.grade && 
           formData.avatar.type &&
           formData.avatar.skinTone;
    // favoriteColor, favoriteAnimal, hobbies, favoriteFood, and specialRequest are now optional
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-2 md:p-4">
      <Card className="w-full max-w-4xl bg-gradient-card shadow-card border-0 rounded-2xl md:rounded-3xl p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-gradient-primary rounded-full text-white shadow-soft">
              <User className="w-8 h-8 md:w-12 md:h-12" />
            </div>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
            {t('form.title')}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg px-2">
            {t('form.subtitle')}
          </p>
        </div>

        {/* All Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Basic Info Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t('form.sections.aboutYou')}
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('form.fields.namePlaceholder')}
                  className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.age')}
                </Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder={t('form.fields.agePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(age => (
                      <SelectItem key={age} value={age.toString()}>{t('form.ages.years', { count: age })}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.grade')}
                </Label>
                <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder={t('form.fields.gradePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PreK">{t('form.grades.preK')}</SelectItem>
                    <SelectItem value="K">{t('form.grades.k')}</SelectItem>
                    <SelectItem value="1st">{t('form.grades.1st')}</SelectItem>
                    <SelectItem value="2nd">{t('form.grades.2nd')}</SelectItem>
                    <SelectItem value="3rd">{t('form.grades.3rd')}</SelectItem>
                    <SelectItem value="4th">{t('form.grades.4th')}</SelectItem>
                    <SelectItem value="5th">{t('form.grades.5th')}</SelectItem>
                    <SelectItem value="6th">{t('form.grades.6th')}</SelectItem>
                    <SelectItem value="7th">{t('form.grades.7th')}</SelectItem>
                    <SelectItem value="8th">{t('form.grades.8th')}</SelectItem>
                    <SelectItem value="9th">{t('form.grades.9th')}</SelectItem>
                    <SelectItem value="10th">{t('form.grades.10th')}</SelectItem>
                    <SelectItem value="11th">{t('form.grades.11th')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="readingAbility" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.readingLevel')}
                </Label>
                <Select value={formData.readingAbility} onValueChange={(value) => handleInputChange("readingAbility", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-background z-50">
                    <SelectValue placeholder={t('form.fields.readingPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 border-primary/20 rounded-xl md:rounded-2xl shadow-lg z-50">
                    <SelectItem value="easy" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-green-600">{t('form.readingLevels.easy')}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t('form.readingLevels.easyDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-yellow-600">{t('form.readingLevels.medium')}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t('form.readingLevels.mediumDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-orange-600">{t('form.readingLevels.hard')}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t('form.readingLevels.hardDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-red-600">{t('form.readingLevels.expert')}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t('form.readingLevels.expertDesc')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.avatar')}
                </Label>
                <AvatarPicker
                  value={formData.avatar}
                  onChange={(avatar) => setFormData(prev => ({ ...prev, avatar }))}
                />
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t('form.sections.favorites')}
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favoriteColor" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.favoriteColor')}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                </Label>
                <ColorPicker
                  value={formData.favoriteColor}
                  onChange={(color) => handleInputChange("favoriteColor", color)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteAnimal" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.favoriteAnimal')}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                </Label>
                <TagInput
                  value={formData.favoriteAnimal}
                  onChange={(value) => handleInputChange("favoriteAnimal", value)}
                  placeholder={t('form.fields.animalPlaceholder')}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteFood" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.favoriteFood')}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                </Label>
                <TagInput
                  value={formData.favoriteFood}
                  onChange={(value) => handleInputChange("favoriteFood", value)}
                  placeholder={t('form.fields.foodPlaceholder')}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.hobbies')}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                </Label>
                <TagInput
                  value={formData.hobbies}
                  onChange={(value) => handleInputChange("hobbies", value)}
                  placeholder={t('form.fields.hobbiesPlaceholder')}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t('form.sections.additional')}
            </h3>
            
              <div className="space-y-2">
                <Label htmlFor="specialRequest" className="text-base md:text-lg font-semibold text-foreground">
                  {t('form.fields.specialRequest')}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                </Label>
                <TagInput
                  value={formData.specialRequest}
                  onChange={(value) => handleInputChange("specialRequest", value)}
                  placeholder={t('form.fields.specialPlaceholder')}
                  className="text-base md:text-lg min-h-[80px] md:min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storyLanguage" className="text-base md:text-lg font-semibold text-foreground">
                    {t('form.fields.storyLanguage')}
                    <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                  </Label>
                  <Select value={formData.storyLanguage} onValueChange={(value) => handleInputChange("storyLanguage", value)}>
                    <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                      <SelectValue placeholder={t('form.fields.storyLanguagePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 border-primary/20 rounded-xl shadow-lg z-50">
                      <SelectItem value="English">{t('languages.English')}</SelectItem>
                      <SelectItem value="Spanish">{t('languages.Spanish')}</SelectItem>
                      <SelectItem value="French">{t('languages.French')}</SelectItem>
                      <SelectItem value="German">{t('languages.German')}</SelectItem>
                      <SelectItem value="Italian">{t('languages.Italian')}</SelectItem>
                      <SelectItem value="Portuguese">{t('languages.Portuguese')}</SelectItem>
                      <SelectItem value="Chinese">{t('languages.Chinese')}</SelectItem>
                      <SelectItem value="Japanese">{t('languages.Japanese')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isLearningMode" className="text-base md:text-lg font-semibold text-foreground">
                    {t('form.fields.learningMode')}
                    <span className="text-xs md:text-sm text-muted-foreground ml-2">{t('form.optional')}</span>
                  </Label>
                  <Select 
                    value={formData.isLearningMode ? "yes" : "no"} 
                    onValueChange={(value) => handleInputChange("isLearningMode", value === "yes")}
                  >
                    <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                      <SelectValue placeholder={t('form.fields.learningModePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 border-primary/20 rounded-xl shadow-lg z-50">
                      <SelectItem value="no">{t('form.learningOptions.no')}</SelectItem>
                      <SelectItem value="yes">{t('form.learningOptions.yes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between">
          <Button
            variant="playful"
            size="lg"
            onClick={onBack}
            className="flex-1 sm:max-w-xs order-2 sm:order-1"
          >
            {t('form.buttons.back')}
          </Button>
          <Button
            variant="fun"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            className="flex-1 sm:max-w-xs order-1 sm:order-2"
          >
            {t('form.buttons.create')}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};