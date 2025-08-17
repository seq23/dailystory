import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { MobileTooltip } from "@/components/MobileTooltip";
import { FormProgressIndicator } from "../shared/FormProgressIndicator";
import { ChevronLeft, ArrowRight, BookOpen, Info, ChevronDown } from "lucide-react";
import type { UserInfo, DifficultyLevel, LearningGoal } from "@/types";

interface FormStep2ReadingPrefsProps {
  formData: UserInfo;
  onUpdate: (data: Partial<UserInfo>) => void;
  onComplete: (data: Partial<UserInfo>) => void;
  onBack: () => void;
  onAdvanceToStep: () => void;
  onSubmit: () => void;
  canAdvance: boolean;
}

export const FormStep2ReadingPrefs = ({
  formData,
  onUpdate,
  onComplete,
  onBack,
  onAdvanceToStep,
  onSubmit,
  canAdvance
}: FormStep2ReadingPrefsProps) => {
  const { t } = useTranslation();

  // Customer-facing reading level mappings
  const readingLevels = [
    {
      value: "beginner" as DifficultyLevel,
      label: t("readingLevels.preReader.title", "Pre-Reader"),
      description: t("readingLevels.preReader.desc", "Getting ready to read with picture support"),
      educational: t("readingLevels.preReader.educational", "Based on pre-literacy skills and Dolch Pre-Primer words"),
      suggestedAge: "3-4"
    },
    {
      value: "easy" as DifficultyLevel,
      label: t("readingLevels.beginner.title", "Beginner"),
      description: t("readingLevels.beginner.desc", "Learning basic words and simple sentences"),
      educational: t("readingLevels.beginner.educational", "Uses Dolch Primer and Grade 1 sight words (220 most common words)"),
      suggestedAge: "4-6"
    },
    {
      value: "medium" as DifficultyLevel,
      label: t("readingLevels.developing.title", "Developing"),
      description: t("readingLevels.developing.desc", "Building reading confidence and fluency"),
      educational: t("readingLevels.developing.educational", "Incorporates Grade 2-3 vocabulary with reading comprehension focus"),
      suggestedAge: "6-8"
    },
    {
      value: "hard" as DifficultyLevel,
      label: t("readingLevels.independent.title", "Independent"),
      description: t("readingLevels.independent.desc", "Reading chapter books independently"),
      educational: t("readingLevels.independent.educational", "Grade 4-5 level with advanced sentence structures"),
      suggestedAge: "8-10"
    },
    {
      value: "expert" as DifficultyLevel,
      label: t("readingLevels.advanced.title", "Advanced"),
      description: t("readingLevels.advanced.desc", "Mastering complex stories and vocabulary"),
      educational: t("readingLevels.advanced.educational", "Grade 6+ with sophisticated vocabulary and themes"),
      suggestedAge: "10+"
    }
  ];

  // Get age-sensitive suggestion
  const getAgeSuggestion = () => {
    const age = formData.age;
    const suggestedLevel = readingLevels.find(level => {
      const [min, max] = level.suggestedAge.split('-').map(a => parseInt(a.replace('+', '')));
      if (level.suggestedAge.includes('+')) {
        return age >= min;
      }
      return age >= min && age <= max;
    });

    if (suggestedLevel) {
      return t("readingLevels.gentleGuidance", "Many {age} year olds enjoy {level} stories", {
        age: age.toString(),
        level: suggestedLevel.label
      });
    }
    return null;
  };

  const handleInputChange = (field: keyof UserInfo, value: DifficultyLevel | LearningGoal) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <FormProgressIndicator 
        currentStep={2}
        completedSteps={[1]}
        compact={true}
      />
      
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t("formStep2.title", "Reading Preferences")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("formStep2.description", "Help us create the perfect reading experience for your child")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Reading Level Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="readingLevel" className="text-sm font-medium text-foreground">
              {t("formStep2.readingLevel.label", "Reading Level")}
            </Label>
            <MobileTooltip content={t("formStep2.readingLevel.tooltip", "Choose what feels most comfortable and fun")}>
              <Info className="h-4 w-4 text-muted-foreground" />
            </MobileTooltip>
          </div>

          {/* Age-sensitive guidance */}
          {getAgeSuggestion() && (
            <p className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg">
              💡 {getAgeSuggestion()}
            </p>
          )}

          <Select
            value={formData.readingAbility || "beginner"}
            onValueChange={(value) => handleInputChange('readingAbility', value as DifficultyLevel)}
          >
            <SelectTrigger className="h-auto">
              <SelectValue placeholder={t("formStep2.readingLevel.placeholder", "Choose reading level")} />
            </SelectTrigger>
            <SelectContent>
              {readingLevels.map((level) => (
                <SelectItem key={level.value} value={level.value} className="py-3">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">{level.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
                    <p className="text-xs text-primary/70 mt-1">{level.educational}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Gentle choice emphasis */}
          <p className="text-xs text-muted-foreground text-center">
            {t("readingLevels.choiceEmphasis", "Choose what sounds most fun and comfortable")} • {t("readingLevels.noWrongChoice", "There's no wrong choice - we'll make it perfect for you")}
          </p>
        </div>

        {/* Learning Goal Selection */}
        <div className="space-y-3">
          <Label htmlFor="learningGoal" className="text-sm font-medium text-foreground">
            {t("formStep2.learningGoal.label", "Learning Goal")}
          </Label>
          <Select
            value={formData.learningGoal || "improve-english-reading"}
            onValueChange={(value) => handleInputChange('learningGoal', value as LearningGoal)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("formStep2.learningGoal.placeholder", "Select learning goal")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="improve-english-reading">
                {t("formStep2.learningGoal.improveReading", "Improve English Reading Skills")}
              </SelectItem>
              <SelectItem value="learn-english-language">
                {t("formStep2.learningGoal.learnEnglish", "Learn English as New Language")}
              </SelectItem>
              <SelectItem value="both">
                {t("formStep2.learningGoal.both", "Both Reading & Language Development")}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("formStep2.learningGoal.help", "This helps us tailor the vocabulary and complexity of your stories")}
          </p>
        </div>
      </div>

      {/* Trust indicators - collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="w-full">
          <div className="bg-muted/20 rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors">
            <p className="text-xs text-muted-foreground font-medium">
              {t("formStep2.trustIndicators.title", "Why This Matters")}
            </p>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="bg-muted/10 rounded-lg p-3">
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>✓ {t("formStep2.trustIndicators.commonCore", "Aligned with Common Core State Standards")}</li>
              <li>✓ {t("formStep2.trustIndicators.specialists", "Reviewed by certified reading specialists")}</li>
              <li>✓ {t("formStep2.trustIndicators.research", "Research shows matching content to reading level accelerates learning")}</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <MobileOptimizedButton
          onClick={onBack}
          variant="outline"
          className="py-3"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t("formStep2.back", "Back")}
        </MobileOptimizedButton>

        <MobileTooltip content="Story will use your reading level but won't be fully personalized. Complete all steps for maximum personalization.">
          <MobileOptimizedButton
            onClick={onSubmit}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t("formStep2.createStory", "Create Story Now")}
          </MobileOptimizedButton>
        </MobileTooltip>

        <MobileOptimizedButton
          onClick={onAdvanceToStep}
          variant="outline"
          className="py-3"
        >
          {t("formStep2.addPersonalDetails", "Add Personal Details")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </MobileOptimizedButton>
      </div>

      {/* Educational encouragement */}
      <div className="text-center text-xs text-muted-foreground">
        {t("formStep2.encouragement", "Every reader progresses at their own pace - we'll find the perfect stories for you")}
      </div>
    </div>
  );
};