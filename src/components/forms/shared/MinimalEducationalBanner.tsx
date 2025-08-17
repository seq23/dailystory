import React from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap } from "lucide-react";
import { EducationalApproachDialog } from "./EducationalApproachDialog";

export const MinimalEducationalBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-primary/5 border-l-2 border-primary/20 px-4 py-2">
      <div className="flex items-center justify-center gap-3 text-xs">
        <GraduationCap className="h-3 w-3 text-primary flex-shrink-0" />
        <span className="text-muted-foreground">
          {t("minimalBanner.text", "Research-based levels using Dolch sight words")}
        </span>
        <EducationalApproachDialog>
          <button className="text-primary hover:text-primary/80 hover:underline transition-colors">
            {t("minimalBanner.learnMore", "Learn About Our Approach")}
          </button>
        </EducationalApproachDialog>
      </div>
    </div>
  );
};