import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, BookOpen, Brain, TrendingUp, Heart } from "lucide-react";

interface EducationalApproachDialogProps {
  children: React.ReactNode;
}

export const EducationalApproachDialog = ({ children }: EducationalApproachDialogProps) => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: GraduationCap,
      heading: t("educationalApproach.foundation.title", "Educational Foundation"),
      content: t("educationalApproach.foundation.content", 
        "Our reading levels are built on proven literacy research and align with Common Core State Standards, ensuring your child receives age-appropriate content that supports natural reading development."
      )
    },
    {
      icon: BookOpen,
      heading: t("educationalApproach.dolch.title", "Dolch Sight Word Integration"),
      content: t("educationalApproach.dolch.content",
        "We use the Dolch sight word lists - the 220 most frequently used words that make up 50-75% of all reading material. By mastering these words, children can focus on comprehension rather than decoding."
      )
    },
    {
      icon: TrendingUp,
      heading: t("educationalApproach.progression.title", "Level Progression"),
      content: t("educationalApproach.progression.content",
        "Each level builds systematically: Pre-Reader (pre-literacy skills) → Beginner (Dolch Primer + Grade 1) → Developing (Grade 2-3 vocabulary) → Independent (Grade 4-5 complexity) → Advanced (Grade 6+ sophistication)."
      )
    },
    {
      icon: Brain,
      heading: t("educationalApproach.validation.title", "Research-Based Framework"),
      content: t("educationalApproach.validation.content",
        "Our content framework aligns with current literacy research showing that personalized, level-appropriate content increases reading engagement by up to 60%."
      )
    },
    {
      icon: Heart,
      heading: t("educationalApproach.individual.title", "Individual Pace Recognition"),
      content: t("educationalApproach.individual.content",
        "We understand every child progresses differently. Our system adapts to support your child's unique learning journey without pressure or judgment, focusing on building confidence and joy in reading."
      )
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="h-5 w-5 text-primary" />
            {t("educationalApproach.title", "Our Research-Based Approach")}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                    <section.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">
                    {section.heading}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                  {section.content}
                </p>
              </div>
            ))}
            
            {/* Additional encouragement */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-center text-muted-foreground">
                {t("educationalApproach.encouragement", 
                  "Every story is crafted to meet your child exactly where they are in their reading journey, making learning both effective and joyful."
                )}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};