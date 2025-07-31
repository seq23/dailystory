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
import { ChevronRight, User, GraduationCap, Heart, Star, Globe } from "lucide-react";
import { ContentSecurity, SecurityLogger } from "@/utils/security";
import { useToast } from "@/hooks/use-toast";

export interface UserInfo {
  name: string;
  age: number;
  grade: string;
  nativeLanguage: string;
  learningGoal: "improve-english-reading" | "learn-english-language" | "both";
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
}

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  onBack: () => void;
}

export const UserInfoForm = ({ onSubmit, onBack }: UserInfoFormProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    age: 6,
    grade: "",
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
    difficultyLevel: "easy",
    readingAbility: "easy"
  });

  // Enhanced content filtering with grade-aware security
  const contentFilter = (text: string): { hasInappropriateContent: boolean; reason?: string } => {
    const validation = ContentSecurity.isContentAppropriate(text, formData.grade);
    return {
      hasInappropriateContent: !validation.appropriate,
      reason: validation.reason
    };
  };

  const handleInputChange = (field: keyof UserInfo, value: string | number) => {
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
            title: t("userInfoForm.validation.contentWarning"),
            description: t("userInfoForm.validation.inappropriateContent"),
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
        title: t("userInfoForm.validation.tooManyRequests"),
        description: t("userInfoForm.validation.waitToSubmit"),
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
        title: t("userInfoForm.validation.contentIssue"),
        description: t("userInfoForm.validation.reviewInputs"),
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
           formData.nativeLanguage &&
           formData.learningGoal &&
           formData.avatar.type &&
           formData.avatar.skinTone;
    // favoriteColor, favoriteAnimal, hobbies, favoriteFood, and specialRequest are now optional
  };

  // Handle language change and update UI language
  const handleLanguageChange = (newLanguage: string) => {
    setFormData(prev => ({ ...prev, nativeLanguage: newLanguage }));
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-2 sm:p-4 md:p-6">
      <Card className="w-full max-w-4xl bg-gradient-card shadow-card border-0 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="p-3 md:p-4 bg-gradient-primary rounded-full text-white shadow-soft">
              <User className="w-8 h-8 md:w-12 md:h-12" />
            </div>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
            {t("userInfoForm.title")}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg px-2">
            {t("userInfoForm.subtitle")}
          </p>
        </div>

        {/* All Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Basic Info Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t("userInfoForm.sections.aboutYou")}
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.name.label")}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("userInfoForm.fields.name.placeholder")}
                  className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.age.label")}
                </Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", parseInt(value))}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
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
                  {t("userInfoForm.fields.nativeLanguage.label")}
                </Label>
                <Select value={formData.nativeLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20">
                    <SelectValue placeholder={t("userInfoForm.fields.nativeLanguage.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t("userInfoForm.languages.en")}</SelectItem>
                    <SelectItem value="ar">{t("userInfoForm.languages.ar")}</SelectItem>
                    <SelectItem value="es">{t("userInfoForm.languages.es")}</SelectItem>
                    <SelectItem value="zh">{t("userInfoForm.languages.zh")}</SelectItem>
                    <SelectItem value="hi">{t("userInfoForm.languages.hi")}</SelectItem>
                    <SelectItem value="pt">{t("userInfoForm.languages.pt")}</SelectItem>
                    <SelectItem value="fr">{t("userInfoForm.languages.fr")}</SelectItem>
                  </SelectContent>
                </Select>
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
                  {t("userInfoForm.fields.readingAbility.label")}
                </Label>
                <Select value={formData.readingAbility} onValueChange={(value) => handleInputChange("readingAbility", value)}>
                  <SelectTrigger className="text-base md:text-lg p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-white dark:bg-gray-800 z-50">
                    <SelectValue placeholder={t("userInfoForm.fields.readingAbility.placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-xl md:rounded-2xl shadow-lg z-50">
                    <SelectItem value="easy" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-green-600">{t("userInfoForm.fields.readingAbility.levels.easy.title")}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t("userInfoForm.fields.readingAbility.levels.easy.description")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-yellow-600">{t("userInfoForm.fields.readingAbility.levels.medium.title")}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t("userInfoForm.fields.readingAbility.levels.medium.description")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-orange-600">{t("userInfoForm.fields.readingAbility.levels.hard.title")}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t("userInfoForm.fields.readingAbility.levels.hard.description")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert" className="text-sm md:text-lg p-2 md:p-3 hover:bg-primary/10">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-red-600">{t("userInfoForm.fields.readingAbility.levels.expert.title")}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{t("userInfoForm.fields.readingAbility.levels.expert.description")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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

          {/* Favorites Section */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t("userInfoForm.sections.yourFavorites")}
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favoriteColor" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.favoriteColor.label")}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t("userInfoForm.fields.favoriteColor.optional")}</span>
                </Label>
                <ColorPicker
                  value={formData.favoriteColor}
                  onChange={(color) => handleInputChange("favoriteColor", color)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteAnimal" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.favoriteAnimal.label")}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t("userInfoForm.fields.favoriteAnimal.optional")}</span>
                </Label>
                <TagInput
                  value={formData.favoriteAnimal}
                  onChange={(value) => handleInputChange("favoriteAnimal", value)}
                  placeholder={t("userInfoForm.fields.favoriteAnimal.placeholder")}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favoriteFood" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.favoriteFood.label")}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t("userInfoForm.fields.favoriteFood.optional")}</span>
                </Label>
                <TagInput
                  value={formData.favoriteFood}
                  onChange={(value) => handleInputChange("favoriteFood", value)}
                  placeholder={t("userInfoForm.fields.favoriteFood.placeholder")}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies" className="text-base md:text-lg font-semibold text-foreground">
                  {t("userInfoForm.fields.hobbies.label")}
                  <span className="text-xs md:text-sm text-muted-foreground ml-2">{t("userInfoForm.fields.hobbies.optional")}</span>
                </Label>
                <TagInput
                  value={formData.hobbies}
                  onChange={(value) => handleInputChange("hobbies", value)}
                  placeholder={t("userInfoForm.fields.hobbies.placeholder")}
                  className="text-base md:text-lg min-h-[50px] md:min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="space-y-4 md:space-y-6 lg:col-span-2">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t("userInfoForm.sections.additionalInfo")}
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="specialRequest" className="text-base md:text-lg font-semibold text-foreground">
                {t("userInfoForm.fields.specialRequest.label")}
                <span className="text-xs md:text-sm text-muted-foreground ml-2">{t("userInfoForm.fields.specialRequest.optional")}</span>
              </Label>
              <TagInput
                value={formData.specialRequest}
                onChange={(value) => handleInputChange("specialRequest", value)}
                placeholder={t("userInfoForm.fields.specialRequest.placeholder")}
                className="text-base md:text-lg min-h-[80px] md:min-h-[100px]"
              />
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
            {t("userInfoForm.buttons.backToHome")}
          </Button>
          <Button
            variant="fun"
            size="lg"
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            className="flex-1 sm:max-w-xs order-1 sm:order-2"
          >
            {t("userInfoForm.buttons.createStory")}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};