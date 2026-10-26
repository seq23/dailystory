// Sign-up and sign-in errors in plain words. Supabase's own texts are close but
// not always parent-friendly, and anything unknown must never print as-is.
export function parentAuthMessage(raw: string | null | undefined): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Try again, or tap \"Forgot your password?\".";
  if (m.includes("already registered") || m.includes("already been registered")) return "There's already an account with that email. Tap \"Sign in\" instead.";
  if (m.includes("password") && (m.includes("at least") || m.includes("characters") || m.includes("weak"))) return "Please choose a longer password (at least 8 characters, with a number).";
  if (m.includes("email not confirmed")) return "Please open the email we sent you and tap the link, then sign in.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many tries. Please wait a minute and try again.";
  if (m.includes("invalid") && m.includes("email")) return "Please check the email address.";
  return "Something went wrong. Please try again.";
}
