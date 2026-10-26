import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { codeFromUrl, premiumUntilLabel, redeemAccessCode } from "@/lib/accessCode";

interface RedeemCodeCardProps {
  className?: string;
  /** Called after the server turned Premium on. */
  onRedeemed?: (premiumUntil: string | null) => void;
}

/**
 * "Have a code?" for a signed-in parent: type it, tap "Use code", Premium turns on
 * at once (no card). Always says what happened: a spinner, then a green
 * "Premium active until …", or the server's plain reason with "Try again".
 */
export function RedeemCodeCard({ className, onRedeemed }: RedeemCodeCardProps) {
  const [code, setCode] = useState(() => codeFromUrl());
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [until, setUntil] = useState<string | null>(null);

  const submit = async () => {
    if (!code.trim()) {
      setState("error");
      setMessage("Type your code first.");
      return;
    }
    setState("working");
    setMessage(null);
    const r = await redeemAccessCode(code);
    if (r.ok) {
      setState("done");
      setUntil(r.premiumUntil);
      setMessage(r.message);
      onRedeemed?.(r.premiumUntil);
    } else {
      setState("error");
      setMessage(r.message);
    }
  };

  if (state === "done") {
    return (
      <div className={`rounded-lg border border-green-300 bg-green-50 p-4 text-green-900 ${className ?? ""}`} role="status" data-testid="redeem-code-done">
        <p className="font-semibold flex items-center gap-2">
          <Check className="w-5 h-5" aria-hidden /> {premiumUntilLabel(until) ?? "Premium is on"}
        </p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    );
  }

  return (
    <form
      className={`rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2 ${className ?? ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      data-testid="redeem-code-card"
    >
      <Label htmlFor="redeem-code" className="font-medium">Have a code?</Label>
      <p className="text-sm text-muted-foreground">Type it here. Premium starts right away, no card needed.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="redeem-code"
          data-testid="redeem-code-input"
          value={code}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="Your code"
          disabled={state === "working"}
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? "redeem-code-error" : undefined}
          onChange={(e) => {
            setCode(e.target.value);
            if (state === "error") setState("idle");
          }}
        />
        <Button type="submit" disabled={state === "working"} className="sm:w-auto min-h-11">
          {state === "working" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden /> Checking…
            </>
          ) : state === "error" ? (
            "Try again"
          ) : (
            "Use code"
          )}
        </Button>
      </div>
      {state === "error" && message && (
        <p id="redeem-code-error" role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
    </form>
  );
}

export default RedeemCodeCard;
