import React from "react";
import { useTranslation } from "react-i18next";
import { Check, User, BookOpen, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProgressIndicatorProps {
  currentStep: 1 | 2 | 3;
  completedSteps: number[];
  compact?: boolean;
}

export const FormProgressIndicator = ({ currentStep, completedSteps, compact = false }: FormProgressIndicatorProps) => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      name: t("formProgress.step1", "Essential"),
      description: t("formProgress.step1Desc", "Basic information"),
      icon: User,
    },
    {
      number: 2,
      name: t("formProgress.step2", "Reading"),
      description: t("formProgress.step2Desc", "Reading preferences"),
      icon: BookOpen,
    },
    {
      number: 3,
      name: t("formProgress.step3", "Personal"),
      description: t("formProgress.step3Desc", "Make it yours"),
      icon: Heart,
    },
  ];

  return (
    <div className={cn("mb-8", compact && "mb-0")}>
      <div className="flex justify-center">
        <nav aria-label="Progress" className={cn("w-full max-w-md", compact && "max-w-lg")}>
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const isCompleted = completedSteps.includes(step.number);
              const isCurrent = currentStep === step.number;
              const isClickable = step.number <= currentStep || isCompleted;

              return (
                <li key={step.number} className="flex-1">
                  <div className="flex flex-col items-center group">
                    {/* Step circle */}
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                          compact ? "h-8 w-8" : "h-10 w-10",
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground shadow-glow"
                            : isCurrent
                            ? "border-primary bg-primary/10 text-primary shadow-soft"
                            : "border-muted-foreground/30 bg-background text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
                        ) : (
                          <step.icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
                        )}
                      </div>
                      
                      {/* Connector line */}
                      {stepIdx < steps.length - 1 && (
                        <div
                          className={cn(
                            "ml-4 h-0.5 transition-all duration-300",
                            compact ? "w-8 sm:w-12" : "w-12 sm:w-16",
                            isCompleted
                              ? "bg-primary"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      )}
                    </div>

                    {/* Step label */}
                    <div className={cn("mt-3 text-center", compact && "mt-2")}>
                      <p
                        className={cn(
                          "font-medium transition-colors duration-300",
                          compact ? "text-xs" : "text-sm",
                          isCurrent
                            ? "text-primary"
                            : isCompleted
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.name}
                      </p>
                      {!compact && (
                        <p
                          className={cn(
                            "text-xs transition-colors duration-300",
                            isCurrent || isCompleted
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60"
                          )}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Educational context tooltip - only show in non-compact mode */}
      {!compact && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {currentStep === 1 && t("formProgress.step1Context", "We use your child's age and grade to recommend the most effective reading level")}
            {currentStep === 2 && t("formProgress.step2Context", "Research shows that matching content to reading level accelerates learning")}
            {currentStep === 3 && t("formProgress.step3Context", "Personalized stories increase engagement and reading comprehension")}
          </p>
        </div>
      )}
    </div>
  );
};