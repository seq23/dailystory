// Client side of access-code trials. The server (create-checkout) is the authority:
// it normalises and validates the code and sets the trial. The client only sends
// what the parent typed and shows the server's plain message when it is refused.
export {
  ACCESS_CODE_MESSAGES,
  INVALID_ACCESS_CODE,
  normalizeAccessCode,
} from "../../supabase/functions/_shared/accessCodeRules";

/** Body for create-checkout: the code is sent only when the parent typed one. */
export function checkoutBody(plan: "monthly" | "annual", accessCode?: string): { plan: string; accessCode?: string } {
  const typed = (accessCode ?? "").trim();
  return typed ? { plan, accessCode: typed } : { plan };
}

/**
 * The parent-facing message from a failed create-checkout call, or null.
 * supabase.functions.invoke puts a non-2xx body on error.context (a Response).
 */
export async function checkoutErrorMessage(error: unknown, data?: unknown): Promise<string | null> {
  const body = data as { error?: string } | null | undefined;
  if (body?.error) return body.error;
  const ctx = (error as { context?: { clone?: () => { json: () => Promise<unknown> }; json?: () => Promise<unknown> } } | null)
    ?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const parsed = (await (ctx.clone ? ctx.clone().json() : ctx.json())) as { error?: string } | null;
      if (parsed?.error) return parsed.error;
    } catch {
      /* not JSON */
    }
  }
  return null;
}
