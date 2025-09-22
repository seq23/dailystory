import { useEffect, useMemo, useState } from "react";
import { DebugLogger } from "@/services/DebugLogger";

export type ReaderLayout = "modern" | "classic" | "split";

interface UseReaderLayoutResult {
  layout: ReaderLayout;
  lowEnd: boolean;
  reason?: string;
  fallbackToClassic: (reason?: string) => void;
  overrideLayout: (layout: ReaderLayout | null) => void;
  isDevelopment: boolean;
}

export function useReaderLayout(): UseReaderLayoutResult {
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [overrideActive, setOverrideActive] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  const initial = useMemo<ReaderLayout>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const forcedParam = params.get("layout") as ReaderLayout | null;
      const forcedLocal = (localStorage.getItem("reader:layout") as ReaderLayout | null) || null;
      const runtime = (localStorage.getItem("reader:layout:runtime") as ReaderLayout | null) || null;

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const isWide = window.matchMedia?.("(min-width: 1280px)").matches ?? false;
      const deviceMemory = (navigator as any).deviceMemory ?? 4; // heuristic, may be undefined
      const cores = navigator.hardwareConcurrency ?? 4;

      const lowEnd = reduceMotion || deviceMemory < 2 || cores <= 2;

      // DEBUG: Layout detection logging
      DebugLogger.log('ui', 'Layout Detection Debug', {
        windowWidth: window.innerWidth,
        isWide,
        reduceMotion,
        deviceMemory,
        cores,
        lowEnd,
        forcedParam,
        forcedLocal,
        runtime
      });

      if (runtime) return runtime;
      if (forcedParam === "modern" || forcedParam === "classic" || forcedParam === "split") return forcedParam;
      if (forcedLocal === "modern" || forcedLocal === "classic" || forcedLocal === "split") return forcedLocal;

      if (isWide && !reduceMotion) return "split";
      if (lowEnd) return "classic";
      return "modern";
    } catch {
      return "modern";
    }
  }, []);

  const [layout, setLayout] = useState<ReaderLayout>(initial);

  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const deviceMemory = (navigator as any).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const lowEnd = !!reduceMotion || deviceMemory < 2 || cores <= 2;

  useEffect(() => {
    // Keep split for wide screens when not explicitly forced to something else
    const onResize = () => {
      try {
        const isWide = window.matchMedia?.("(min-width: 1280px)").matches ?? false;
        const params = new URLSearchParams(window.location.search);
        const forced = params.get("layout") || localStorage.getItem("reader:layout") || localStorage.getItem("reader:layout:runtime");
        if (!forced) {
          setLayout((prev) => {
            if (isWide && prev !== "split" && !lowEnd) return "split";
            if (!isWide && prev === "split") return lowEnd ? "classic" : "modern";
            return prev;
          });
        }
      } catch {}
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [lowEnd]);

  const fallbackToClassic = (why?: string) => {
    try {
      localStorage.setItem("reader:layout:runtime", "classic");
    } catch {}
    setReason(why);
    setLayout("classic");
    setOverrideActive(true);
    // Minimal telemetry for debugging
    if (why) console.info(`[ReaderLayout] Fallback to classic due to: ${why}`);
  };

  const overrideLayout = (newLayout: ReaderLayout | null) => {
    try {
      if (newLayout) {
        localStorage.setItem("reader:layout:runtime", newLayout);
        setLayout(newLayout);
        setOverrideActive(true);
        setReason(`Developer override: ${newLayout}`);
        console.info(`[ReaderLayout] Developer override to: ${newLayout}`);
      } else {
        // Clear override and recalculate
        localStorage.removeItem("reader:layout:runtime");
        localStorage.removeItem("reader:layout");
        setOverrideActive(false);
        setReason(undefined);
        
        // Recalculate layout
        const isWide = window.matchMedia?.("(min-width: 1280px)").matches ?? false;
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        const deviceMemory = (navigator as any).deviceMemory ?? 4;
        const cores = navigator.hardwareConcurrency ?? 4;
        const lowEndDevice = reduceMotion || deviceMemory < 2 || cores <= 2;
        
        let autoLayout: ReaderLayout;
        if (isWide && !reduceMotion) {
          autoLayout = "split";
        } else if (lowEndDevice) {
          autoLayout = "classic";
        } else {
          autoLayout = "modern";
        }
        
        setLayout(autoLayout);
        console.info(`[ReaderLayout] Reset to auto-detected: ${autoLayout}`);
      }
    } catch (error) {
      console.warn('[ReaderLayout] Override failed:', error);
    }
  };

  return { layout, lowEnd, reason, fallbackToClassic, overrideLayout, isDevelopment };
}
