// verify-parental-consent: a signed-in parent asks for the COPPA consent email for one of
// their own child profiles (23 Nov 2026). The caller names only the profile; who it goes
// to and the child's name come from the database, so the function cannot be used to mail
// anyone else. Pure (deps injected): guard src/test/guards/caller-check.test.ts.
import { escapeHtml, json, rateRefusal, signedInUser, type GetUser, type RateHit } from "../_shared/callerCheck.ts";

/** Consent emails per child profile per day, and per parent account per day. */
export const CONSENT_SENDS_PER_PROFILE_PER_DAY = 3;
export const CONSENT_SENDS_PER_PARENT_PER_DAY = 10;
const DAY = 86400;
const MAX_BODY_BYTES = 4 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ChildProfileRow {
  id: string;
  parent_user_id: string;
  parent_email: string | null;
  display_name: string | null;
}

export interface ConsentEmail {
  to: string;
  subject: string;
  html: string;
}

export interface ConsentDeps {
  getUser: GetUser;
  hit: RateHit;
  /** The profile, or null when there is none. Throws when the database cannot be read. */
  loadChild: (id: string) => Promise<ChildProfileRow | null>;
  /** Stores the pending consent and returns its id. */
  insertConsent: (row: {
    child_profile_id: string;
    parent_email: string;
    consent_token: string;
    token_expires_at: string;
    ip_address: string | null;
    user_agent: string | null;
  }) => Promise<string>;
  /** Sends through Resend; throws on any refusal. */
  sendEmail: (email: ConsentEmail) => Promise<void>;
  audit: (details: Record<string, unknown>) => Promise<void>;
  /** RESEND_API_KEY is set. */
  mailConfigured: boolean;
  siteUrl: string;
  clientIp: string | null;
  newToken?: () => string;
  now?: () => number;
}

export async function handleConsentRequest(req: Request, deps: ConsentDeps, cors: Record<string, string>): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" }, cors);

  // 1. Who is calling: a signed-in account (the anon key is not one).
  const user = await signedInUser(req, deps.getUser, cors);
  if (user instanceof Response) return user;

  // 2. Which profile. Anything else in the body (a recipient, a name) is ignored.
  const raw = await req.text().catch(() => "");
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json(413, { error: "Request too large" }, cors);
  let childId = "";
  try {
    childId = String((JSON.parse(raw) as { child_profile_id?: unknown })?.child_profile_id ?? "");
  } catch { /* falls through to 400 */ }
  if (!UUID.test(childId)) return json(400, { error: "child_profile_id is required" }, cors);

  // 3. The profile must be this account's own child. A missing profile answers the same
  //    as someone else's, so ids cannot be probed.
  let child: ChildProfileRow | null;
  try {
    child = await deps.loadChild(childId);
  } catch (e) {
    console.error(`[verify-parental-consent] PROFILE_READ_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "Please try again shortly." }, cors);
  }
  if (!child || child.parent_user_id !== user.id) return json(403, { error: "forbidden" }, cors);
  if (!child.parent_email) return json(409, { error: "This profile has no parent email to send to.", code: "NO_PARENT_EMAIL" }, cors);
  if (!deps.mailConfigured) {
    const stop = "NAMED STOP RESEND_API_KEY: the email key is not set on the project; nothing is sent.";
    console.error(`[verify-parental-consent] ${stop}`);
    return json(503, { error: "not configured", stop }, cors);
  }

  // 4. At most a few per profile and per account per day (fails closed).
  const limited = await rateRefusal(deps.hit, [
    { bucket: `consent:${child.id}`, window: DAY, max: CONSENT_SENDS_PER_PROFILE_PER_DAY },
    { bucket: `consentparent:${user.id}`, window: DAY, max: CONSENT_SENDS_PER_PARENT_PER_DAY },
  ], "verify-parental-consent", cors);
  if (limited) return limited;

  const now = (deps.now ?? Date.now)();
  const token = (deps.newToken ?? (() => crypto.randomUUID()))();
  const expiresAt = new Date(now + 48 * 3600 * 1000).toISOString();
  let consentId: string;
  try {
    consentId = await deps.insertConsent({
      child_profile_id: child.id,
      parent_email: child.parent_email,
      consent_token: token,
      token_expires_at: expiresAt,
      ip_address: deps.clientIp,
      user_agent: req.headers.get("user-agent"),
    });
  } catch (e) {
    console.error(`[verify-parental-consent] CONSENT_INSERT_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "Please try again shortly." }, cors);
  }

  const name = (child.display_name || "your child").trim();
  const link = `${deps.siteUrl.replace(/\/+$/, "")}/verify-consent?token=${encodeURIComponent(token)}`;
  try {
    await deps.sendEmail({ to: child.parent_email, subject: consentSubject(name), html: consentHtml(name, link) });
  } catch (e) {
    console.error(`[verify-parental-consent] SEND_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(502, { error: "The email could not be sent. Please try again later." }, cors);
  }
  await deps.audit({ requested_by: user.id, child_profile_id: child.id, consent_record_id: consentId, expires_at: expiresAt }).catch((e) =>
    console.error(`[verify-parental-consent] AUDIT_FAILED: ${e instanceof Error ? e.message : e}`)
  );
  return json(200, { success: true, consent_id: consentId }, cors);
}

/** Subjects are plain text: strip line breaks so a name can never add a header. */
export function consentSubject(name: string): string {
  return `Parental consent for ${name.replace(/[\r\n]+/g, " ").slice(0, 60)}'s Time2Read account`;
}

export function consentHtml(name: string, link: string): string {
  const n = escapeHtml(name);
  const href = escapeHtml(link);
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 22px; margin: 0 0 16px;">Time2Read</h1>
  <p>Hello,</p>
  <p>A Time2Read reading profile has been set up for <strong>${n}</strong>.</p>
  <p>Under the Children's Online Privacy Protection Act (COPPA), we need your consent before we collect and use your child's information to provide the reading service.</p>
  <p><strong>What we collect:</strong> a display name (nickname), reading preferences and grade level, reading progress and quiz scores, and an avatar choice (never a photo).</p>
  <p><strong>How we use it:</strong> to fit stories to your child's interests and level, and to track reading progress and vocabulary.</p>
  <p style="text-align: center; margin: 28px 0;">
    <a href="${href}" style="background: #4f46e5; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">I consent</a>
  </p>
  <p style="font-size: 14px;">This link expires in 48 hours. If you did not set up this profile, you can ignore this email.</p>
  <p style="font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 16px;">You can withdraw consent and ask us to delete your child's data at any time in your account settings or at <a href="mailto:privacy@time-2-read.com">privacy@time-2-read.com</a>.<br>
  Time2Read LLC | <a href="https://time-2-read.com/privacy">Privacy Policy</a> | <a href="https://time-2-read.com/terms">Terms of Service</a></p>
</body></html>`;
}
