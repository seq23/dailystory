// send-feedback-notification: the feedback form's heads-up email to the Time2Read inbox.
// It stays public (signed-out readers can send feedback), so the protection is: one fixed
// recipient, server-side rate limits per network, per account and overall, a byte cap,
// every field escaped, and the sender's identity only from a verified session, never
// the body (23 Nov 2026). Pure (deps injected): guard src/test/guards/caller-check.test.ts.
import { bearerToken, escapeHtml, json, rateRefusal, type GetUser, type RateHit, type RateWindow } from "../_shared/callerCheck.ts";

export const FEEDBACK_TO = "hello@time-2-read.com";
export const FEEDBACK_FROM = "Time2Read Reports <reports@resend.dev>";
export const MAX_FEEDBACK_BODY_BYTES = 16 * 1024;
const TEN_MIN = 600;
const DAY = 86400;
/** Feedback rows ever: 2 (Aug and Dec 2025). These caps are far above real use and far below a flood. */
export const FEEDBACK_LIMITS = {
  perNetwork: [{ window: TEN_MIN, max: 5 }, { window: DAY, max: 20 }],
  perAccount: [{ window: TEN_MIN, max: 5 }, { window: DAY, max: 20 }],
  allPerDay: 100,
} as const;

export interface FeedbackEmail {
  to: string;
  replyTo?: string | undefined;
  subject: string;
  html: string;
}

export interface FeedbackDeps {
  getUser: GetUser;
  hit: RateHit;
  /** sha256Short of the caller's IP (never stored raw). */
  networkKey: string;
  sendEmail: (email: FeedbackEmail) => Promise<void>;
  mailConfigured: boolean;
}

interface Fields {
  rating: number;
  category: string;
  message: string;
  pageUrl: string;
  userAgent: string;
}

function readFields(body: unknown): Fields | null {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  if (!Number.isInteger(b.rating) || (b.rating as number) < 1 || (b.rating as number) > 5) return null;
  if (typeof b.category !== "string" || !b.category.trim() || b.category.length > 64) return null;
  if (typeof b.message !== "string" || !b.message.trim() || b.message.length > 5000) return null;
  return {
    rating: b.rating as number,
    category: b.category.replace(/[\r\n]+/g, " "),
    message: b.message,
    pageUrl: str(b.page_url, 2000),
    userAgent: str(b.user_agent, 500),
  };
}

/** A link only to our own site; anything else is shown as text so the inbox never gets a stranger's link. */
function pageCell(url: string): string {
  try {
    const u = new URL(url);
    const ours = u.protocol === "https:" && (u.hostname === "time-2-read.com" || u.hostname.endsWith(".time-2-read.com"));
    if (ours) return `<a href="${escapeHtml(u.href)}">${escapeHtml(u.href)}</a>`;
  } catch { /* not a URL: text */ }
  return escapeHtml(url);
}

export async function handleFeedback(req: Request, deps: FeedbackDeps, cors: Record<string, string>): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" }, cors);

  // The real bytes, not a claimed Content-Length.
  const raw = await req.text().catch(() => "");
  if (new TextEncoder().encode(raw).byteLength > MAX_FEEDBACK_BODY_BYTES) return json(413, { error: "Request too large" }, cors);
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* 400 below */ }
  const f = readFields(body);
  if (!f) return json(400, { error: "Invalid payload" }, cors);

  // Who sent it: a verified session or nobody. user_email / user_id in the body are ignored.
  const token = bearerToken(req);
  let user: { id: string; email: string | null } | null = null;
  if (token) {
    try { user = await deps.getUser(token); } catch { user = null; }
  }

  if (!deps.mailConfigured) {
    const stop = "NAMED STOP RESEND_API_KEY: the email key is not set on the project; nothing is sent.";
    console.error(`[send-feedback-notification] ${stop}`);
    return json(503, { error: "not configured", stop }, cors);
  }

  const windows: RateWindow[] = FEEDBACK_LIMITS.perNetwork.map((w) => ({ bucket: `feedbackip:${deps.networkKey}`, ...w }));
  if (user) windows.push(...FEEDBACK_LIMITS.perAccount.map((w) => ({ bucket: `feedbackuser:${user!.id}`, ...w })));
  windows.push({ bucket: "feedback:all", window: DAY, max: FEEDBACK_LIMITS.allPerDay });
  const limited = await rateRefusal(deps.hit, windows, "send-feedback-notification", cors);
  if (limited) return limited;

  const stars = "★".repeat(f.rating) + "☆".repeat(5 - f.rating);
  const from = user ? `${escapeHtml(user.email ?? "signed-in account")} (signed in)` : "Signed-out reader";
  const row = (k: string, v: string) =>
    `<tr><td style="padding: 8px; background: #f3f4f6;"><strong>${k}</strong></td><td style="padding: 8px;">${v}</td></tr>`;
  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">New Time2Read feedback</h2>
  <p style="font-size: 18px; margin: 16px 0;">${stars} <strong>(${f.rating}/5)</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    ${row("Category", escapeHtml(f.category))}
    ${row("From", from)}
    ${user ? row("User ID", `<span style="font-family: monospace; font-size: 12px;">${escapeHtml(user.id)}</span>`) : ""}
    ${f.pageUrl ? row("Page", pageCell(f.pageUrl)) : ""}
  </table>
  <h3 style="color: #1f2937;">Message</h3>
  <div style="background: #f9fafb; border-left: 4px solid #6366f1; padding: 12px 16px; white-space: pre-wrap;">${escapeHtml(f.message)}</div>
  ${f.userAgent ? `<p style="color: #9ca3af; font-size: 11px; margin-top: 24px;">UA: ${escapeHtml(f.userAgent)}</p>` : ""}
</div>`;

  try {
    await deps.sendEmail({
      to: FEEDBACK_TO,
      replyTo: user?.email ?? undefined,
      subject: `[Time2Read feedback] ${f.category.slice(0, 64)} (${f.rating}/5)`,
      html,
    });
  } catch (e) {
    console.error(`[send-feedback-notification] SEND_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(502, { error: "Email send failed" }, cors);
  }
  return json(200, { success: true }, cors);
}
