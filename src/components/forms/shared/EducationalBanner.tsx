import React from "react";
import { useTranslation } from "react-i18next";
import { GraduationCap, Award, BookOpen, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EducationalBannerProps {
  variant?: "research" | "trust" | "progress";
  className?: string;
}

export const EducationalBanner = ({ variant = "research", className }: EducationalBannerProps) => {
  const { t } = useTranslation();

  const variants = {
    research: {
      icon: GraduationCap,
      title: t("educationalBanner.research.title", "Research-Based Reading Levels"),
      content: t("educationalBanner.research.content", "Our levels are based on proven educational research and Dolch sight word lists, ensuring age-appropriate content that supports reading development."),
      linkText: t("educationalBanner.research.link", "Learn About Our Approach"),
    },
    trust: {
      icon: Award,
      title: t("educationalBanner.trust.title", "Expert Validated"),
      content: t("educationalBanner.trust.content", "Aligned with Common Core State Standards and reviewed by certified reading specialists."),
      linkText: t("educationalBanner.trust.link", "Our Educational Standards"),
    },
    progress: {
      icon: BookOpen,
      title: t("educationalBanner.progress.title", "Personalized Learning"),
      content: t("educationalBanner.progress.content", "Research shows that personalized content increases engagement and reading comprehension by up to 60%."),
      linkText: t("educationalBanner.progress.link", "How It Works"),
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <Alert className={`mb-6 border-primary/20 bg-primary/5 ${className}`}>
      <IconComponent className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-primary mb-1">
            {config.title}
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {config.content}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-4 text-primary hover:text-primary/80 flex-shrink-0"
        >
          <Info className="h-3 w-3 mr-1" />
          {config.linkText}
        </Button>
      </AlertDescription>
    </Alert>
  );
};