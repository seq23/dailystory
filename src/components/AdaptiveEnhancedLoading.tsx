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

  const debugMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";

  const title = userName
    ? (
        isPremium
          ? t("premium.loading.titleWithName", {
              defaultValue: "Summoning your Premium Adventure, {userName}! ✨",
              userName,
            })
          : t("freeReadingSession.loading.titleWithName", {
              defaultValue: "Creating Your Free Story for {userName}…",
              userName,
            })
      )
    : (
        isPremium
          ? t("premium.loading.title", { defaultValue: "Forging your premium reading adventure..." })
          : t("auth.loading.title", { defaultValue: "Getting things ready..." })
      );

  const description = userName
    ? (
        isPremium
          ? t("premium.loading.description", {
              defaultValue: "Tailoring a next‑level story just for {userName}",
              userName,
            })
          : t("freeReadingSession.loading.description", {
              defaultValue: "Generating personalized content for {userName}",
              userName,
            })
      )
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
        data-loader-variant="orbit-v2"
        className={cn(
          "fixed inset-0 z-[9999] bg-gradient-primary flex items-center justify-center p-6 animate-fade-in"
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-full max-w-md md:max-w-xl text-center space-y-6">
          <div className="flex items-center justify-center">
            <OrbitingSparkLoader isPremium={isPremium} className="w-28 h-28 md:w-40 md:h-40" />
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
      {debugMode && (
        <div className="fixed top-2 right-2 z-[10000] text-xs px-2 py-1 rounded bg-primary text-primary-foreground shadow">
          Orbit v2
        </div>
      )}
    </>
  );
}
