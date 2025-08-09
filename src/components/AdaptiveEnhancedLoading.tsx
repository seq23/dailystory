import { OrbitingSparkLoader } from "@/components/OrbitingSparkLoader";
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
    ? t("freeReadingSession.loading.titleWithName", {
        defaultValue: "Creating Your Free Story for {userName}…",
        userName,
      })
    : t("auth.loading.title", { defaultValue: "Getting things ready..." });

  const description = userName
    ? t("freeReadingSession.loading.description", {
        defaultValue: "Generating personalized content for {userName}",
        userName,
      })
    : t("auth.loading.description", { defaultValue: "Preparing your reading experience..." });

  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1") {
    console.log("🔤 AdaptiveEnhancedLoading text", { title, description, userName });
  }

  const containerRef = useRef<HTMLDivElement>(null);
  

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
        <div className="w-full max-w-md md:max-w-xl text-center space-y-6">
          <div className="flex items-center justify-center">
            <OrbitingSparkLoader isPremium={isPremium} />
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
    </>
  );
}
