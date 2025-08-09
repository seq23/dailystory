import { useEffect, useMemo, useState } from "react";

export type ReaderLayout = "modern" | "classic" | "split";

interface UseReaderLayoutResult {
  layout: ReaderLayout;
  lowEnd: boolean;
  reason?: string;
  fallbackToClassic: (reason?: string) => void;
}

export function useReaderLayout(): UseReaderLayoutResult {
  const [reason, setReason] = useState<string | undefined>(undefined);

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
    // Minimal telemetry for debugging
    if (why) console.info(`[ReaderLayout] Fallback to classic due to: ${why}`);
  };

  return { layout, lowEnd, reason, fallbackToClassic };
}
