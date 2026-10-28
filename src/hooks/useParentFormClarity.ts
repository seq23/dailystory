import { useLayoutEffect } from "react";

type Clarity = ((command: "start" | "stop") => void) & { q?: IArguments[] };
declare global {
  interface Window { clarity?: Clarity }
}

// Only LoginScreen mounts this hook: the grown-up's account/checkout form.
// Public guides, the welcome screen and children's forms/readers never load the tag.
export function useParentFormClarity(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return;
    // Confirmation links can hold a session before Supabase stores it.
    if (/access_token=|type=(magiclink|signup|recovery|invite)/.test(location.hash + location.search)) return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        if (/^sb-.*-auth-token$/.test(localStorage.key(i) ?? "")) return;
      }
    } catch {
      return; // Storage unavailable: we cannot establish that this visitor is signed out.
    }

    if (!window.clarity) {
      window.clarity = function () {
        (window.clarity!.q ??= []).push(arguments);
      } as Clarity;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.clarity.ms/tag/z3erswoh8e";
      document.head.appendChild(script);
    } else {
      window.clarity("start");
    }

    // Layout cleanup stops recording on leaving the parent form, before the next
    // screen paints. Queued too if the tag is still downloading. Sign-in also
    // stops it immediately through main.tsx's auth listener.
    return () => window.clarity?.("stop");
  }, [enabled]);
}
