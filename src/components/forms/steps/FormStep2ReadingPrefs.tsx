import { uiGradeLabel } from "@/i18n/gradeLabel";
import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileOptimizedButton } from "@/components/MobileOptimizedButton";
import { MobileTooltip } from "@/components/MobileTooltip";
import { FormProgressIndicator } from "../shared/FormProgressIndicator";
import { ChevronLeft, ArrowRight, BookOpen, Info, ChevronDown } from "lucide-react";
import { GRADES, gradeLabel, normalizeGrade, readingLevelForGrade } from "@/lib/grades";
import type { UserInfo, LearningGoal } from "@/types";

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

  // "Reads at" (owner, 26 Oct 2026): one grade for how hard the words are, starting at the
  // school grade. The old five level names stay internal (docs/reading-levels.md).
  const schoolGrade = normalizeGrade(formData.grade ?? formData.gradeLevel);
  const readsAt = normalizeGrade((formData as UserInfo & { readingGrade?: string }).readingGrade) ?? schoolGrade ?? "";
  const chooseReadsAt = (g: string) => {
    const grade = normalizeGrade(g);
    if (!grade) return;
    onUpdate({ readingGrade: grade, difficultyLevel: readingLevelForGrade(grade) ?? undefined } as Partial<UserInfo>);
  };

  const handleInputChange = (field: keyof UserInfo, value: string | LearningGoal) => {
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
        {/* Reads at */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="readsAt" className="text-sm font-medium text-foreground">
              {t("formStep2.readsAt.label", "Reads at")}
            </Label>
            <MobileTooltip content={t("formStep2.readsAt.tooltip", "How hard the words are. It starts at their school grade; you can change it any time.")}>
              <Info className="h-4 w-4 text-muted-foreground" />
            </MobileTooltip>
          </div>
          <Select value={readsAt} onValueChange={chooseReadsAt}>
            <SelectTrigger id="readsAt" data-testid="form-reads-at">
              <SelectValue placeholder={t("formStep2.readsAt.placeholder", "Choose a grade")} />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g}>
                  <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{uiGradeLabel(g)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("formStep2.readsAt.help", "Story topics stay right for their age; this only sets how hard the words are.")}
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
            <SelectTrigger id="learningGoal">
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
      <div className="space-y-3 pt-6">
        <div className="flex gap-4">
          <MobileOptimizedButton
            onClick={onBack}
            variant="outline"
            className="py-3"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("formStep2.back", "Back")}
          </MobileOptimizedButton>

          <MobileOptimizedButton
            onClick={onAdvanceToStep}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
          >
            {t("formStep2.addPersonalDetails", "Add Personal Details")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </MobileOptimizedButton>
        </div>
        
        <button
          onClick={onSubmit}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          {t("formStep2.skipAndCreate", "Skip and create story now")}
        </button>
      </div>

      {/* Educational encouragement */}
      <div className="text-center text-xs text-muted-foreground">
        {t("formStep2.encouragement", "Every reader progresses at their own pace - we'll find the perfect stories for you")}
      </div>
    </div>
  );
};