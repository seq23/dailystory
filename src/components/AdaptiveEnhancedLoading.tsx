import { BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/LoadingStates";

interface AdaptiveEnhancedLoadingProps {
  isPremium: boolean;
  userName?: string;
}

export function AdaptiveEnhancedLoading({ isPremium, userName }: AdaptiveEnhancedLoadingProps) {
  const { t } = useTranslation();

  const title = userName
    ? t("freeReadingSession.loading.title", "Creating Your Free Story...")
    : t("auth.loading.title", "Getting things ready...");

  const description = userName
    ? t("freeReadingSession.loading.description", { userName })
    : t("auth.loading.description", "Preparing your reading experience...");

  return (
    <div className={cn("min-h-screen bg-gradient-primary flex items-center justify-center p-6 animate-fade-in")}>
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <BookOpen className="w-14 h-14 text-primary animate-pulse" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
        </div>
        <div className="space-y-3" role="status" aria-live="polite">
          <h2 className="text-2xl font-bold text-primary-foreground">
            {title}
          </h2>
          <p className="text-primary-foreground/80">
            {description}
          </p>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80">
            <LoadingSpinner size="md" />
            <span>{t("common.loading", "Loading...")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
