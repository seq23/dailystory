// One-click unsubscribe from the parent emails (welcome, trial reminder, free stories, come back).
// The link in every email is /unsubscribe?t=<token>; opening it is the click. Sign-in and
// receipt emails are not affected. Backend: supabase/functions/lifecycle-unsubscribe.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { uiText, useUiLanguage } from "@/i18n/uiText";

type State = "working" | "done" | "bad" | "error";

const Unsubscribe = () => {
  useUiLanguage();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("t") ?? "";
  const [state, setState] = useState<State>("working");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!/^[0-9a-f-]{36}$/i.test(token)) { setState("bad"); return; }
      const { data, error } = await supabase.functions.invoke("lifecycle-unsubscribe", { body: { token } });
      if (cancelled) return;
      if (data?.ok) setState("done");
      else if (error && /40[04]/.test(String((error as { context?: { status?: number } }).context?.status ?? error.message))) setState("bad");
      else setState(error ? "error" : "bad");
    })();
    return () => { cancelled = true; };
  }, [token]);

  const text: Record<State, [string, string]> = {
    working: [uiText("Unsubscribing…"), uiText("One moment.")],
    done: [uiText("You're unsubscribed"), uiText("We won't send you any more of these emails. Your account and stories are not affected.")],
    bad: [uiText("This link didn't work"), uiText("It may be incomplete. Reply to any of our emails and we'll take you off the list.")],
    error: [uiText("Something went wrong"), uiText("Please try the link again in a minute.")],
  };
  const [title, line] = text[state];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{line}</p>
        {state !== "working" && (
          <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg">{uiText("Go to Time-2-Read")}</Button>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
