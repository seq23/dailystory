// notify-data-breach: the parent incident notice that src/pages/Privacy.tsx promises
// ("Personal information incidents are logged and parents are notified"). Owner only.
//
// The owner names the incident and the affected child profiles and/or accounts. Each parent's
// address is the account's own sign-in email, read from the database (never from the body and
// never child_profiles.parent_email, which the account owner can rewrite). One email per
// parent, naming only that parent's own affected children. Every send is recorded per parent
// and notice version (public.incident_notices); a re-run sends only what has not been sent,
// so a mailer outage is retried by running it again and nobody gets the same notice twice.
// An edited notice under the same incident id is a new version: it is sent only when the owner
// says so (newVersion: true), parents who had the earlier one get it as an update, and the
// record of the earlier one is kept. The incident is marked done in data_breach_log only when
// every affected parent has the latest version.
// dry-run (the default) shows the rendered email and the counts and sends nothing.
// Pure (deps injected): guard src/test/guards/incident-notice.test.ts.
import { adminOrCronRefusal, escapeHtml, json, type GetUser } from "../_shared/callerCheck.ts";

export const NOTICE_FROM = "Time2Read <privacy@time-2-read.com>";
export const PRIVACY_INBOX = "privacy@time-2-read.com";
/** Sends per call (Resend allows about 2 a second); run again to continue. */
export const MAX_SENDS_PER_RUN = 40;
export const SEND_SPACING_MS = 600;
const MAX_IDS = 2000;
const MAX_BODY_BYTES = 256 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INCIDENT_ID = /^[a-z0-9][a-z0-9-]{5,79}$/;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
/** Shown in the dry-run preview in place of a real child's name. */
export const PREVIEW_CHILD = "[your child's first name]";

export interface Incident {
  incidentId: string;
  whenItHappened: string;
  whatHappened: string;
  dataInvolved: string[];
  whatWeAreDoing: string;
  whatYouCanDo: string | null;
  severity: (typeof SEVERITIES)[number];
}

export interface ChildRow {
  id: string;
  parent_user_id: string;
  display_name: string | null;
}

export interface NoticeEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** One key per incident, version, parent and send key, so the mailer also drops a repeat. */
  idempotencyKey: string;
}

/** The mailer refused the email, so it did not go out (safe to send again under a new key).
 *  Any other error from sendEmail means the outcome is unknown. */
export class MailRefused extends Error {}

export type ClaimStatus = "claimed" | "sent" | "sending" | "unsure";
export interface Claim { status: ClaimStatus; key: number }
export interface NoticeVersion { version: string; versionNo: number }
export type SendResult =
  | { status: "sent"; providerId: string | null }
  | { status: "failed"; error: string }
  | { status: "unsure"; error: string };

export interface IncidentDeps {
  adminIds: string[];
  getUser: GetUser;
  serviceKey: string;
  /** Throw when the database cannot be read. */
  childrenByIds: (ids: string[]) => Promise<ChildRow[]>;
  childrenOfParents: (parentIds: string[]) => Promise<ChildRow[]>;
  /** The account's sign-in email, or null when there is no such account or no address. */
  accountEmail: (userId: string) => Promise<string | null>;
  /** The versions already recorded for this incident. */
  noticeVersions: (incidentId: string) => Promise<NoticeVersion[]>;
  /** Which of `parentIds` have a sent notice for this incident under any other version. */
  parentsSentEarlier: (incidentId: string, version: string, parentIds: string[]) => Promise<string[]>;
  /** Records the incident once (data_breach_log, keyed by incident id). */
  logIncident: (incident: Incident, parentsAffected: number) => Promise<void>;
  /** Records a version once (incident_notice_versions) and returns its number. */
  addVersion: (incidentId: string, version: string, content: Record<string, unknown>) => Promise<number>;
  /** Atomically takes the right to send this parent this version (incident_notice_claim). */
  claim: (incidentId: string, version: string, parentId: string, resendUnsure: boolean) => Promise<Claim>;
  record: (incidentId: string, version: string, parentId: string, result: SendResult) => Promise<void>;
  /** data_breach_log: done = every affected parent has the latest version. */
  setIncidentDone: (incidentId: string, done: boolean) => Promise<void>;
  /** Sends one email; throws MailRefused when it surely did not go out, anything else when unknown. */
  sendEmail: (email: NoticeEmail) => Promise<string | null>;
  /** RESEND_API_KEY is set. */
  mailConfigured: boolean;
  pause?: (ms: number) => Promise<void>;
}

/** Resend statuses that mean the email was not accepted. 409 (same key in flight or reused)
 *  and 5xx are not here: the email may have gone. */
const REFUSED_STATUSES = new Set([400, 401, 403, 404, 405, 413, 422, 429]);

/** The real mailer. A timeout or network error is thrown as is: the outcome is unknown. */
export function sendViaResend(fetchImpl: typeof fetch, apiKey: string): IncidentDeps["sendEmail"] {
  return async ({ to, subject, html, text, idempotencyKey }) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ from: NOTICE_FROM, to: [to], reply_to: PRIVACY_INBOX, subject, html, text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const detail = `Resend ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`;
      throw REFUSED_STATUSES.has(res.status) ? new MailRefused(detail) : new Error(detail);
    }
    return ((await res.json().catch(() => ({}))) as { id?: string }).id ?? null;
  };
}

type Parsed = { incident: Incident; childIds: string[]; accountIds: string[]; mode: "dry-run" | "send"; newVersion: boolean; resendUnsure: boolean };

function text(v: unknown, min: number, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}

function ids(v: unknown): string[] | null {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string" && UUID.test(x))) return null;
  return [...new Set(v.map((x: string) => x.toLowerCase()))];
}

export function parseIncident(body: unknown): Parsed | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const incidentId = typeof b.incidentId === "string" && INCIDENT_ID.test(b.incidentId) ? b.incidentId : null;
  if (!incidentId) return "incidentId: 6-80 lowercase letters, digits and dashes (it keeps re-runs from sending twice)";
  const whenItHappened = text(b.whenItHappened, 4, 200);
  if (!whenItHappened) return "whenItHappened is required (for example: between 2 and 4 November 2026)";
  const whatHappened = text(b.whatHappened, 20, 4000);
  if (!whatHappened) return "whatHappened is required (20-4000 characters)";
  const data = Array.isArray(b.dataInvolved) ? b.dataInvolved.map((d) => text(d, 1, 200)) : [];
  if (data.length < 1 || data.length > 12 || data.some((d) => !d)) return "dataInvolved: 1-12 short items";
  const whatWeAreDoing = text(b.whatWeAreDoing, 20, 4000);
  if (!whatWeAreDoing) return "whatWeAreDoing is required (20-4000 characters)";
  let whatYouCanDo: string | null = null;
  if (b.whatYouCanDo !== undefined && b.whatYouCanDo !== null && b.whatYouCanDo !== "") {
    whatYouCanDo = text(b.whatYouCanDo, 10, 4000);
    if (!whatYouCanDo) return "whatYouCanDo: 10-4000 characters, or leave it out for the standard steps";
  }
  const severity = (b.severity ?? "medium") as Incident["severity"];
  if (!SEVERITIES.includes(severity)) return `severity: one of ${SEVERITIES.join(", ")}`;
  const childIds = ids(b.childIds);
  const accountIds = ids(b.accountIds);
  if (!childIds || !accountIds) return "childIds and accountIds are lists of ids";
  if (childIds.length + accountIds.length > MAX_IDS) return `at most ${MAX_IDS} ids per incident call`;
  const mode = b.mode ?? "dry-run";
  if (mode !== "dry-run" && mode !== "send") return 'mode is "dry-run" (default) or "send"';
  // Only a literal true counts: "yes", 1 or "true" is not the owner saying so.
  for (const flag of ["newVersion", "resendUnsure"] as const) {
    if (b[flag] !== undefined && typeof b[flag] !== "boolean") return `${flag} is true or false`;
  }
  return {
    incident: { incidentId, whenItHappened, whatHappened, dataInvolved: data as string[], whatWeAreDoing, whatYouCanDo, severity },
    childIds, accountIds, mode, newVersion: b.newVersion === true, resendUnsure: b.resendUnsure === true,
  };
}

/** What the parent reads (severity is not in the email, so it is not part of the version). */
export function noticeContent(incident: Incident): Record<string, unknown> {
  const { whenItHappened, whatHappened, dataInvolved, whatWeAreDoing, whatYouCanDo } = incident;
  return { whenItHappened, whatHappened, dataInvolved, whatWeAreDoing, whatYouCanDo };
}

/** The version id: the first 16 hex characters of SHA-256 over the notice's text. */
export async function noticeVersion(incident: Incident): Promise<string> {
  const c = noticeContent(incident);
  const canonical = JSON.stringify([c.whenItHappened, c.whatHappened, c.dataInvolved, c.whatWeAreDoing, c.whatYouCanDo]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

function nameList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

const standardSteps = (about: string) =>
  `You don't need to do anything to keep using Time2Read. If you would like us to show you, or delete, the information we hold about ${about}, reply to this email and we will do it.`;

/** One parent's notice. `children` are that parent's own affected children, by first name.
 *  `update`: this parent already had an earlier version of this notice. */
export function renderNotice(incident: Incident, children: string[], opts: { update?: boolean } = {}): { subject: string; html: string; text: string } {
  const named = children.map((c) => c.trim()).filter(Boolean);
  const who = named.length === 0
    ? "your Time2Read account"
    : `your ${named.length === 1 ? "child" : "children"} ${nameList(named)}`;
  const subject = opts.update ? "An update to our privacy notice from Time2Read" : "A privacy notice from Time2Read";
  const opening = opts.update
    ? `We wrote to you earlier about a privacy incident at Time2Read that involved information about ${who}. This notice replaces that one with what we know now.`
    : `We are writing to tell you about a privacy incident at Time2Read that involved information about ${who}.`;
  const footer = opts.update
    ? "This update is about your account, not marketing."
    : "This is a one-time notice about your account, not marketing.";
  const steps = incident.whatYouCanDo ??
    standardSteps(named.length === 0 ? "your account" : named.length === 1 ? "your child" : "your children");
  const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const lines = [
    "Hello,",
    "",
    opening,
    "",
    "WHAT HAPPENED",
    `When: ${incident.whenItHappened}`,
    ...paras(incident.whatHappened).flatMap((p) => [p, ""]),
    "WHAT INFORMATION WAS INVOLVED",
    ...incident.dataInvolved.map((d) => `- ${d}`),
    "",
    "WHAT WE ARE DOING",
    ...paras(incident.whatWeAreDoing).flatMap((p) => [p, ""]),
    "WHAT YOU CAN DO",
    ...paras(steps).flatMap((p) => [p, ""]),
    "QUESTIONS",
    `Reply to this email or write to ${PRIVACY_INBOX}.`,
    "",
    "Time2Read (Spry VSL LLC)",
    footer,
  ];

  const h = (t: string) =>
    `<h2 style="font-size:17px;line-height:1.3;margin:28px 0 8px;color:#1f2937;">${escapeHtml(t)}</h2>`;
  const p = (t: string) => `<p style="margin:0 0 14px;">${escapeHtml(t)}</p>`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#1f2937;overflow-wrap:anywhere;">
${p("Hello,")}
${p(opening)}
${h("What happened")}
${p(`When: ${incident.whenItHappened}`)}
${paras(incident.whatHappened).map(p).join("\n")}
${h("What information was involved")}
<ul style="margin:0 0 14px;padding-left:22px;">${incident.dataInvolved.map((d) => `<li style="margin:0 0 6px;">${escapeHtml(d)}</li>`).join("")}</ul>
${h("What we are doing")}
${paras(incident.whatWeAreDoing).map(p).join("\n")}
${h("What you can do")}
${paras(steps).map(p).join("\n")}
${h("Questions")}
<p style="margin:0 0 14px;">Reply to this email or write to <a href="mailto:${PRIVACY_INBOX}" style="color:#1f2937;">${PRIVACY_INBOX}</a>.</p>
<p style="margin:28px 0 4px;">Time2Read (Spry VSL LLC)</p>
<p style="margin:0;font-size:13px;color:#6b7280;">${escapeHtml(footer)}</p>
</div></body></html>`;
  return { subject, html, text: lines.join("\n").replace(/\n{3,}/g, "\n\n") };
}

const scrub = (e: unknown) =>
  (e instanceof Error ? e.message : String(e)).replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[address]").slice(0, 300);

export async function handleIncidentNotice(req: Request, deps: IncidentDeps, cors: Record<string, string>): Promise<Response> {
  if (req.method !== "POST") return json(405, { error: "POST only" }, cors);

  // 1. Owner only: an ADMIN_USER_IDS account, or the project's service key. Checked before
  //    the body is read.
  const auth = await adminOrCronRefusal(req, { adminIds: deps.adminIds, getUser: deps.getUser, serviceKey: deps.serviceKey, cors });
  if (auth.refused) return auth.refused;

  const raw = await req.text().catch(() => "");
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json(413, { error: "Request too large" }, cors);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json(400, { error: "JSON body required" }, cors); }
  const parsed = parseIncident(body);
  if (typeof parsed === "string") return json(400, { error: parsed }, cors);
  const { incident, childIds, accountIds, mode, newVersion, resendUnsure } = parsed;
  if (mode === "send" && !deps.mailConfigured) {
    return json(503, { error: "NAMED STOP RESEND_API_KEY: the mail key is not set; nothing was sent." }, cors);
  }

  // 2. Who is affected, from the database only. A parent is notified about their own
  //    affected children; an account named directly covers all of its child profiles.
  //    Which version this text is, and who had an earlier one, from the database too.
  const version = await noticeVersion(incident);
  const byParent = new Map<string, Map<string, string>>();
  const add = (parent: string) => byParent.get(parent) ?? byParent.set(parent, new Map()).get(parent)!;
  let unmatchedChildIds: string[] = [];
  const emails = new Map<string, string | null>();
  let versions: NoticeVersion[] = [];
  let hadEarlier = new Set<string>();
  try {
    if (childIds.length) {
      const rows = await deps.childrenByIds(childIds);
      const found = new Set(rows.map((r) => r.id.toLowerCase()));
      unmatchedChildIds = childIds.filter((id) => !found.has(id));
      for (const r of rows) if (childIds.includes(r.id.toLowerCase())) add(r.parent_user_id).set(r.id, (r.display_name ?? "").trim());
    }
    if (accountIds.length) {
      for (const a of accountIds) add(a);
      for (const r of await deps.childrenOfParents(accountIds)) {
        if (accountIds.includes(r.parent_user_id.toLowerCase())) add(r.parent_user_id).set(r.id, (r.display_name ?? "").trim());
      }
    }
    const parents = [...byParent.keys()].sort();
    for (let i = 0; i < parents.length; i += 20) {
      const chunk = parents.slice(i, i + 20);
      const got = await Promise.all(chunk.map((id) => deps.accountEmail(id)));
      chunk.forEach((id, k) => emails.set(id, got[k]?.trim() || null));
    }
    versions = await deps.noticeVersions(incident.incidentId);
    const withAddress = [...emails.keys()].filter((id) => emails.get(id));
    hadEarlier = new Set(versions.length && withAddress.length ? await deps.parentsSentEarlier(incident.incidentId, version, withAddress) : []);
  } catch (e) {
    console.error(`[notify-data-breach] READ_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { error: "The database could not be read; nothing was sent. Try again." }, cors);
  }

  const parents = [...byParent.keys()].sort();
  const reachable = parents.filter((id) => emails.get(id));
  const noAddress = parents.length - reachable.length;
  const latest = versions.reduce<NoticeVersion | null>((a, v) => (!a || v.versionNo > a.versionNo ? v : a), null);
  const known = versions.find((v) => v.version === version) ?? null;
  const versionInfo = {
    version,
    versionNo: known?.versionNo ?? (latest?.versionNo ?? 0) + 1,
    isNew: !known,
    hadEarlierVersion: reachable.filter((id) => hadEarlier.has(id)).length,
  };
  const summary = { incidentId: incident.incidentId, parents: parents.length, recipients: reachable.length, noAddress, unmatchedChildIds, notice: versionInfo };

  // 3. Zero recipients is a named stop, never a quiet "done".
  if (reachable.length === 0) {
    return json(422, { ...summary, error: "NAMED STOP NO_RECIPIENTS: no affected parent with an email address was found; nothing was sent.", code: "NO_RECIPIENTS" }, cors);
  }
  // 4. Only the latest version, or a new one the owner asked for, is ever sent.
  if (known && latest && known.versionNo !== latest.versionNo) {
    return json(409, { ...summary, code: "OLDER_VERSION", error: `This is version ${known.versionNo} of the notice; version ${latest.versionNo} has replaced it. Nothing was sent. Send the latest text instead.` }, cors);
  }
  const editNeedsConfirm = !known && versions.length > 0;
  if (mode === "dry-run") {
    const preview = renderNotice(incident, [PREVIEW_CHILD]);
    const update = versionInfo.hadEarlierVersion > 0 ? renderNotice(incident, [PREVIEW_CHILD], { update: true }) : null;
    return json(200, {
      mode, ...summary, sent: 0,
      ...(editNeedsConfirm ? { next: `This text differs from version ${latest!.versionNo}. To send it as version ${versionInfo.versionNo}, run with "mode": "send" and "newVersion": true. ${versionInfo.hadEarlierVersion} parents who had an earlier version will get it as an update.` } : {}),
      preview: { from: NOTICE_FROM, subject: preview.subject, text: preview.text, html: preview.html },
      ...(update ? { updatePreview: { subject: update.subject, text: update.text, html: update.html } } : {}),
    }, cors);
  }
  if (editNeedsConfirm && !newVersion) {
    return json(409, { ...summary, code: "NEW_VERSION_NOT_CONFIRMED", error: `This text differs from version ${latest!.versionNo} of the notice for this incident. Nothing was sent. To send it as version ${versionInfo.versionNo}, run again with "newVersion": true (${versionInfo.hadEarlierVersion} parents who had an earlier version will get it as an update).` }, cors);
  }

  // 5. Send. The incident and this version are recorded first: if that fails, nothing is sent.
  try {
    await deps.logIncident(incident, parents.length);
    await deps.addVersion(incident.incidentId, version, noticeContent(incident));
  } catch (e) {
    console.error(`[notify-data-breach] LOG_FAILED: ${e instanceof Error ? e.message : e}`);
    return json(503, { ...summary, error: "The incident could not be recorded; nothing was sent. Try again." }, cors);
  }
  const pause = deps.pause ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let sent = 0, alreadySent = 0, inProgress = 0, failed = 0, unconfirmed = 0, held = 0, errors = 0, attempted = 0;
  let remaining = 0;
  for (const parentId of reachable) {
    if (attempted >= MAX_SENDS_PER_RUN) { remaining++; continue; }
    let claim: Claim;
    try {
      claim = await deps.claim(incident.incidentId, version, parentId, resendUnsure);
    } catch (e) {
      console.error(`[notify-data-breach] CLAIM_FAILED: ${e instanceof Error ? e.message : e}`);
      errors++;
      continue;
    }
    if (claim.status === "sent") { alreadySent++; continue; }
    if (claim.status === "sending") { inProgress++; continue; }
    if (claim.status === "unsure") { held++; continue; }
    if (attempted > 0) await pause(SEND_SPACING_MS);
    attempted++;
    const names = [...byParent.get(parentId)!.values()].filter(Boolean).sort((a, b) => a.localeCompare(b));
    const email = renderNotice(incident, names, { update: hadEarlier.has(parentId) });
    let result: SendResult;
    try {
      const providerId = await deps.sendEmail({
        to: emails.get(parentId)!, ...email,
        idempotencyKey: `incident-${incident.incidentId}-${version}-${parentId}-${claim.key}`,
      });
      result = { status: "sent", providerId };
    } catch (e) {
      result = e instanceof MailRefused ? { status: "failed", error: scrub(e) } : { status: "unsure", error: scrub(e) };
    }
    try {
      await deps.record(incident.incidentId, version, parentId, result);
      if (result.status === "sent") sent++;
      else if (result.status === "failed") failed++;
      else unconfirmed++;
    } catch (e) {
      // The row stays 'sending': the next run retries it under the same key (the mailer drops a
      // copy that went out) inside 23 hours, or holds it after that. Never counted as sent here.
      console.error(`[notify-data-breach] RECORD_FAILED ${parentId}: ${e instanceof Error ? e.message : e}`);
      errors++;
    }
  }

  // 6. The incident is done only when every affected parent has the latest version.
  let complete = noAddress === 0 && sent + alreadySent === reachable.length;
  let incidentRecorded = true;
  try {
    await deps.setIncidentDone(incident.incidentId, complete);
  } catch (e) {
    console.error(`[notify-data-breach] INCIDENT_STATUS_FAILED: ${e instanceof Error ? e.message : e}`);
    incidentRecorded = false;
    complete = false;
    errors++;
  }

  const problem = failed + unconfirmed + errors > 0;
  const status = problem ? 502 : held > 0 ? 409 : remaining > 0 || inProgress > 0 ? 202 : 200;
  const next = [
    failed > 0 ? `${failed} notices were refused by the mailer and did not go out. Run the same incident again to retry only those.` : "",
    unconfirmed > 0 ? `${unconfirmed} notices got no answer from the mailer. Run the same incident again within 23 hours: a copy that did go out is not sent twice.` : "",
    errors > 0 ? (incidentRecorded ? "The database could not record some sends. Run the same incident again; nothing already sent is sent twice." : "The incident record could not be updated. Run the same incident again.") : "",
    held > 0 ? `${held} notices were never confirmed and are more than 23 hours old, so they are not sent again by themselves. Look up incident-${incident.incidentId} in the Resend log; for any that did not go out, run again with "resendUnsure": true.` : "",
    remaining > 0 ? `Sent at most ${MAX_SENDS_PER_RUN} this run. Run the same incident again to continue.` : "",
    inProgress > 0 ? "Some notices are mid-send in another run. Run the same incident again in 10 minutes." : "",
    noAddress > 0 ? `${noAddress} affected parents have no email address on file, so the incident stays open until they are reached another way.` : "",
    complete ? "Every affected parent has this notice; the incident is marked parents_notified." : "",
  ].filter(Boolean).join(" ");
  return json(status, { mode, ...summary, sent, alreadySent, inProgress, failed, unconfirmed, held, errors, remaining, complete, next }, cors);
}
