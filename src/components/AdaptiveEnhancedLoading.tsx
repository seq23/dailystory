import { BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AdaptiveEnhancedLoadingProps {
  isPremium: boolean;
  userName?: string;
}

export function AdaptiveEnhancedLoading({ isPremium, userName }: AdaptiveEnhancedLoadingProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("min-h-screen bg-gradient-primary flex items-center justify-center p-6")}> 
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <BookOpen className="w-14 h-14 text-primary animate-pulse" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary-foreground">
            {isPremium
              ? t("freeReadingSession.loading.title", "Creating Your Free Story...")
              : t("freeReadingSession.loading.title", "Creating Your Free Story...")}
          </h2>
          <p className="text-primary-foreground/80">
            {isPremium
              ? t("freeReadingSession.loading.description", { userName })
              : t("freeReadingSession.loading.description", { userName })}
          </p>
        </div>
      </div>
    </div>
  );
}
