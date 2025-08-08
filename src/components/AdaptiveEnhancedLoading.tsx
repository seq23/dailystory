import { BookOpen, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
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
    ? t("freeReadingSession.loading.title", `Creating Your Free Story for ${userName}…`)
    : t("auth.loading.title", "Getting things ready...");

  const description = userName
    ? t("freeReadingSession.loading.description", `Generating personalized content for ${userName}`)
    : t("auth.loading.description", "Preparing your reading experience...");

  const containerRef = useRef<HTMLDivElement>(null);
  const debugMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  useEffect(() => {
    console.log("🌀 AdaptiveEnhancedLoading mounted", { isPremium, userName });
    requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && rect.height > 0 && rect.width > 0) {
        console.log("✅ Enhanced loader visible", { width: rect.width, height: rect.height });
      }
    });
    return () => console.log("🌀 AdaptiveEnhancedLoading unmounted");
  }, [isPremium, userName]);

  return (
    <>
      <div
        ref={containerRef}
        data-testid="adaptive-loading"
        className={cn(
          "fixed inset-0 z-[9999] bg-gradient-primary flex items-center justify-center p-6 animate-fade-in"
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-full max-w-md md:max-w-lg">
          <div className="relative rounded-3xl bg-card/90 text-card-foreground backdrop-blur-md shadow-2xl border border-border p-6 md:p-8 text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-primary animate-pulse" />
              <Sparkles className="w-7 h-7 text-accent absolute -top-3 -right-3 animate-bounce" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <LoadingSpinner size="md" />
                <span>{t("common.loading", "Loading...")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {debugMode && (
        <div className="fixed top-2 right-2 z-[10000] text-xs px-2 py-1 rounded bg-primary text-primary-foreground shadow">
          Enhanced loader active
        </div>
      )}
    </>
  );
}
