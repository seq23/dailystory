/**
 * The parent incident notice (supabase/functions/notify-data-breach). Privacy.tsx promises
 * "Personal information incidents are logged and parents are notified"; this proves the
 * owner can keep that promise without the function ever mailing a stranger, telling one
 * family about another's child, claiming a send that failed, or sending twice.
 * Only example.test addresses; nothing here reaches a mailer.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MAX_SENDS_PER_RUN,
  MailRefused,
  NOTICE_FROM,
  PREVIEW_CHILD,
  handleIncidentNotice,
  noticeVersion,
  renderNotice,
  sendViaResend,
  type ChildRow,
  type Claim,
  type Incident,
  type IncidentDeps,
  type NoticeEmail,
} from "../../../supabase/functions/notify-data-breach/handler";

const root = join(__dirname, "../../..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

const ADMIN = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PARENT_A = "a1111111-1111-4111-8111-111111111111";
const PARENT_B = "b2222222-2222-4222-8222-222222222222";
const PARENT_NO_MAIL = "c3333333-3333-4333-8333-333333333333";
const SERVICE_KEY = "service-key-for-tests";
const CHILD = {
  maya: "d0000001-0000-4000-8000-000000000001", // PARENT_A
  leo: "d0000002-0000-4000-8000-000000000002", // PARENT_A
  zoe: "d0000003-0000-4000-8000-000000000003", // PARENT_B
  sam: "d0000004-0000-4000-8000-000000000004", // PARENT_NO_MAIL
};
const TOKENS: Record<string, { id: string; email: string }> = {
  "token-admin": { id: ADMIN, email: "owner@example.test" },
  "token-parent": { id: PARENT_A, email: "parent-a@example.test" },
};

function world(over: Partial<IncidentDeps> = {}) {
  const children: ChildRow[] = [
    { id: CHILD.maya, parent_user_id: PARENT_A, display_name: "Maya" },
    { id: CHILD.leo, parent_user_id: PARENT_A, display_name: "Leo" },
    { id: CHILD.zoe, parent_user_id: PARENT_B, display_name: "Zoe" },
    { id: CHILD.sam, parent_user_id: PARENT_NO_MAIL, display_name: "Sam" },
  ];
  const accounts: Record<string, string | null> = {
    [PARENT_A]: "parent-a@example.test",
    [PARENT_B]: "parent-b@example.test",
    [PARENT_NO_MAIL]: null,
  };
  // The send log, keyed incident|version|parent. The claim mirrors incident_notice_claim; its
  // SQL is proven on a real database by supabase/tests/incident_notices/claim.sql.
  type Row = { status: "sending" | "sent" | "failed" | "unsure"; attempts: number; key: number; keyAgeHours: number; staleMinutes: number; error?: string };
  const rows = new Map<string, Row>();
  const versions = new Map<string, { version: string; versionNo: number; content: Record<string, unknown> }[]>();
  const sent: NoticeEmail[] = [];
  const logged: string[] = [];
  const done = new Map<string, boolean>();
  const deps: IncidentDeps = {
    adminIds: [ADMIN],
    serviceKey: SERVICE_KEY,
    getUser: async (t) => TOKENS[t] ?? null,
    childrenByIds: async (ids) => children.filter((c) => ids.includes(c.id)),
    childrenOfParents: async (ids) => children.filter((c) => ids.includes(c.parent_user_id)),
    accountEmail: async (id) => accounts[id] ?? null,
    noticeVersions: async (incident) => (versions.get(incident) ?? []).map(({ version, versionNo }) => ({ version, versionNo })),
    parentsSentEarlier: async (incident, version, parentIds) =>
      [...rows].filter(([k, r]) => { const [i, v, p] = k.split("|"); return i === incident && v !== version && r.status === "sent" && parentIds.includes(p); })
        .map(([k]) => k.split("|")[2]),
    logIncident: async (i) => { logged.push(i.incidentId); },
    addVersion: async (incident, version, content) => {
      const list = versions.get(incident) ?? versions.set(incident, []).get(incident)!;
      const had = list.find((v) => v.version === version);
      if (had) return had.versionNo;
      list.push({ version, versionNo: list.length + 1, content });
      return list.length;
    },
    claim: async (incident, version, parent, resendUnsure): Promise<Claim> => {
      const k = `${incident}|${version}|${parent}`;
      const r = rows.get(k);
      if (!r) { rows.set(k, { status: "sending", attempts: 1, key: 1, keyAgeHours: 0, staleMinutes: 0 }); return { status: "claimed", key: 1 }; }
      const reclaim = (newKey: boolean): Claim => {
        r.status = "sending"; r.attempts++; r.staleMinutes = 0;
        if (newKey) { r.key++; r.keyAgeHours = 0; }
        return { status: "claimed", key: r.key };
      };
      if (r.status === "failed") return reclaim(true);
      if (r.status === "unsure" || (r.status === "sending" && r.staleMinutes > 10)) {
        if (r.keyAgeHours < 23) return reclaim(false);
        if (resendUnsure) return reclaim(true);
        r.status = "unsure";
        return { status: "unsure", key: r.key };
      }
      return { status: r.status, key: r.key };
    },
    record: async (incident, version, parent, result) => {
      const r = rows.get(`${incident}|${version}|${parent}`)!;
      if (r.status !== "sending") throw new Error("record: the claim was no longer held");
      r.status = result.status;
      r.error = result.status === "sent" ? undefined : result.error;
    },
    setIncidentDone: async (incident, d) => { done.set(incident, d); },
    sendEmail: async (e) => { sent.push(e); return `re_${sent.length}`; },
    mailConfigured: true,
    pause: async () => {},
    ...over,
  };
  /** The row for one parent under the only (or given) version of the default incident. */
  const row = (parent: string, version?: string) => {
    const hits = [...rows].filter(([k]) => k.startsWith("2026-11-test-incident|") && k.endsWith(`|${parent}`) && (!version || k.split("|")[1] === version));
    expect(hits.length, `rows for ${parent}`).toBe(1);
    return hits[0][1];
  };
  return { deps, sent, rows, row, versions, logged, done, children, accounts };
}

const incident = (extra: Record<string, unknown> = {}) => ({
  incidentId: "2026-11-test-incident",
  whenItHappened: "between 2 and 4 November 2026",
  whatHappened: "A settings page showed some reading records to the wrong signed-in account for two days.",
  dataInvolved: ["Your child's first name", "Titles of stories read"],
  whatWeAreDoing: "We fixed the page on 4 November and checked every account that opened it.",
  ...extra,
});

/** The version id the handler computes for incident(extra). */
const versionOf = (extra: Record<string, unknown> = {}) =>
  noticeVersion({ whatYouCanDo: null, severity: "medium", ...incident(extra) } as Incident);

const call = (deps: IncidentDeps, body: unknown, token: string | null = "token-admin") =>
  handleIncidentNotice(new Request("https://fn.example.test/notify-data-breach", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  }), deps, {});

describe("only the owner can trigger it", () => {
  it("no token, the anon key, a forged token or a signed-in parent are refused, and nothing is read or sent", async () => {
    for (const [token, status] of [[null, 401], ["anon-public-key", 401], ["eyJhbGciOiJIUzI1NiJ9.forged.sig", 401], ["token-parent", 403]] as const) {
      let touched = 0;
      const { deps, sent, logged } = world({ childrenByIds: async () => { touched++; return []; }, childrenOfParents: async () => { touched++; return []; } });
      const res = await call(deps, incident({ childIds: [CHILD.maya], mode: "send" }), token);
      expect(res.status, String(token)).toBe(status);
      expect([touched, sent.length, logged.length], String(token)).toEqual([0, 0, 0]);
    }
  });

  it("an empty admin list admits no one; an admin or the service key gets through", async () => {
    expect((await call(world({ adminIds: [] }).deps, incident({ childIds: [CHILD.maya] }))).status).toBe(403);
    expect((await call(world().deps, incident({ childIds: [CHILD.maya] }))).status).toBe(200);
    expect((await call(world().deps, incident({ childIds: [CHILD.maya] }), SERVICE_KEY)).status).toBe(200);
  });
});

describe("recipients come only from the database", () => {
  it("a recipient or name in the body is ignored; the address is the account's own email", async () => {
    const { deps, sent } = world();
    const res = await call(deps, incident({
      childIds: [CHILD.zoe], mode: "send",
      to: "attacker@example.test", email: "attacker@example.test", recipients: ["attacker@example.test"], childName: "Injected",
    }));
    expect(res.status).toBe(200);
    expect(sent.map((e) => e.to)).toEqual(["parent-b@example.test"]);
    expect(sent[0].html).toContain("Zoe");
    expect(sent[0].html + sent[0].text).not.toMatch(/attacker|Injected/);
  });
});

describe("each parent hears only about their own children, once", () => {
  it("two families: one email each, and neither names the other family's child", async () => {
    const { deps, sent } = world();
    const res = await call(deps, incident({ childIds: [CHILD.maya, CHILD.leo, CHILD.zoe], mode: "send" }));
    expect(res.status).toBe(200);
    expect(sent.map((e) => e.to).sort()).toEqual(["parent-a@example.test", "parent-b@example.test"]);
    const a = sent.find((e) => e.to === "parent-a@example.test")!;
    const b = sent.find((e) => e.to === "parent-b@example.test")!;
    expect(a.text).toContain("your children Leo and Maya");
    expect(a.html + a.text).not.toContain("Zoe");
    expect(b.text).toContain("your child Zoe");
    expect(b.html + b.text).not.toMatch(/Maya|Leo/);
  });

  it("an affected child names only that child, not the parent's other children", async () => {
    const { deps, sent } = world();
    await call(deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(sent).toHaveLength(1);
    expect(sent[0].text).toContain("your child Maya.");
    expect(sent[0].html + sent[0].text).not.toContain("Leo");
  });

  it("a parent named by account and by child id still gets one email", async () => {
    const { deps, sent } = world();
    const body = await (await call(deps, incident({ childIds: [CHILD.maya], accountIds: [PARENT_A], mode: "send" }))).json();
    expect(sent).toHaveLength(1);
    expect(body).toMatchObject({ recipients: 1, sent: 1 });
    expect(sent[0].text).toContain("your children Leo and Maya");
  });

  it("an account with no child profiles is told about its account", async () => {
    const lone = "e5555555-5555-4555-8555-555555555555";
    const { deps, sent } = world({ accountEmail: async (id) => (id === lone ? "lone@example.test" : null) });
    await call(deps, incident({ accountIds: [lone], mode: "send" }));
    expect(sent.map((e) => e.to)).toEqual(["lone@example.test"]);
    expect(sent[0].text).toContain("information about your Time2Read account.");
  });
});

describe("a mailer outage is recorded and retried, never reported as sent", () => {
  it("a failed send is 502, recorded as failed, and the next run resends only that one", async () => {
    const w = world();
    let down = true;
    const sendEmail = w.deps.sendEmail;
    w.deps.sendEmail = async (e) => { if (down && e.to === "parent-b@example.test") throw new MailRefused("Resend 403: cannot send to parent-b@example.test"); return sendEmail(e); };
    const first = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(first.status).toBe(502);
    expect(await first.json()).toMatchObject({ sent: 1, failed: 1, complete: false });
    expect(w.sent.map((e) => e.to)).toEqual(["parent-a@example.test"]);
    const failedRow = w.row(PARENT_B);
    expect(failedRow.status).toBe("failed");
    expect(failedRow.error).not.toContain("@"); // no address in the log

    down = false;
    const second = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ sent: 1, alreadySent: 1, failed: 0, complete: true });
    expect(w.sent.map((e) => e.to)).toEqual(["parent-a@example.test", "parent-b@example.test"]);
    expect(w.row(PARENT_B).attempts).toBe(2);
    // Nothing went out the first time, so the retry is under a fresh mailer key.
    expect(w.sent[1].idempotencyKey).toMatch(/-2$/);
  });

  it("outages before sending end refused with nothing sent: database read, incident log, mail key, claim", async () => {
    const boom = async () => { throw new Error("down"); };
    for (const over of [{ childrenByIds: boom }, { accountEmail: boom }, { logIncident: boom }] as Partial<IncidentDeps>[]) {
      const w = world(over);
      expect((await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }))).status).toBe(503);
      expect(w.sent).toHaveLength(0);
    }
    const noKey = world({ mailConfigured: false });
    const res = await call(noKey.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain("NAMED STOP RESEND_API_KEY");
    expect([noKey.sent.length, noKey.logged.length]).toEqual([0, 0]);

    const noClaim = world({ claim: boom });
    const r2 = await call(noClaim.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(r2.status).toBe(502);
    expect(noClaim.sent).toHaveLength(0);
  });

  it("zero recipients is a named stop, in dry run and send, with nothing logged", async () => {
    for (const body of [
      incident({ childIds: ["f0000000-0000-4000-8000-000000000000"], mode: "send" }),
      incident({ childIds: [CHILD.sam], mode: "send" }), // the only parent has no address
      incident({ mode: "send" }),
      incident({ childIds: [CHILD.sam] }),
    ]) {
      const w = world();
      const res = await call(w.deps, body);
      expect(res.status).toBe(422);
      const j = await res.json();
      expect(j.code).toBe("NO_RECIPIENTS");
      expect(j.error).toContain("NAMED STOP");
      expect([w.sent.length, w.logged.length]).toEqual([0, 0]);
    }
  });

  it("a parent with no address is counted, not silently dropped", async () => {
    const w = world();
    const j = await (await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.sam], mode: "send" }))).json();
    expect(j).toMatchObject({ parents: 2, recipients: 1, noAddress: 1, sent: 1 });
  });
});

describe("re-running the same incident never sends twice", () => {
  it("a second run sends nothing new; a send still in flight is not repeated", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    const again = await (await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }))).json();
    expect(w.sent).toHaveLength(2);
    expect(again).toMatchObject({ sent: 0, alreadySent: 2, complete: true });

    const stuck = world();
    stuck.rows.set(`2026-11-test-incident|${await versionOf()}|${PARENT_A}`, { status: "sending", attempts: 1, key: 1, keyAgeHours: 0, staleMinutes: 2 });
    const r = await call(stuck.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(r.status).toBe(202);
    expect(await r.json()).toMatchObject({ sent: 0, inProgress: 1, complete: false });
    expect(stuck.sent).toHaveLength(0);
  });

  it("the mailer gets one idempotency key per incident, version, parent and send key", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(w.sent[0].idempotencyKey).toBe(`incident-2026-11-test-incident-${await versionOf()}-${PARENT_A}-1`);
  });

  it("a big incident goes out in runs of MAX_SENDS_PER_RUN; the next run finishes it", async () => {
    const many = Array.from({ length: MAX_SENDS_PER_RUN + 1 }, (_, i) => `f${String(i).padStart(7, "0")}-0000-4000-8000-000000000000`);
    const w = world({ accountEmail: async (id) => `p-${id.slice(0, 8)}@example.test`, childrenOfParents: async () => [] });
    const first = await call(w.deps, incident({ accountIds: many, mode: "send" }));
    expect(first.status).toBe(202);
    expect(await first.json()).toMatchObject({ sent: MAX_SENDS_PER_RUN, remaining: 1, complete: false });
    const second = await call(w.deps, incident({ accountIds: many, mode: "send" }));
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ sent: 1, alreadySent: MAX_SENDS_PER_RUN, remaining: 0, complete: true });
    expect(new Set(w.sent.map((e) => e.to)).size).toBe(MAX_SENDS_PER_RUN + 1);
  });
});

describe("dry run", () => {
  it("is the default: shows the rendered email and counts, sends and logs nothing, and names no real child", async () => {
    const w = world();
    const res = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.leo, CHILD.zoe, CHILD.sam] }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j).toMatchObject({ mode: "dry-run", parents: 3, recipients: 2, noAddress: 1, sent: 0 });
    expect(j.preview.from).toBe(NOTICE_FROM);
    expect(j.preview.text).toContain(PREVIEW_CHILD);
    expect(JSON.stringify(j)).not.toMatch(/Maya|Leo|Zoe|Sam|parent-a@|parent-b@/);
    expect([w.sent.length, w.logged.length, w.rows.size]).toEqual([0, 0, 0]);
  });

  it("an unknown mode or a malformed incident is 400, never a send", async () => {
    for (const bad of [incident({ mode: "sned", childIds: [CHILD.maya] }), incident({ incidentId: "x", childIds: [CHILD.maya] }),
      incident({ childIds: ["not-a-uuid"] }), incident({ dataInvolved: [], childIds: [CHILD.maya] }), incident({ whatHappened: "short", childIds: [CHILD.maya] })]) {
      const w = world();
      expect((await call(w.deps, { ...bad, mode: (bad as { mode?: string }).mode ?? "send" })).status).toBe(400);
      expect(w.sent).toHaveLength(0);
    }
  });
});

describe("the email a parent reads", () => {
  const inc = { incidentId: "x-incident", whenItHappened: "on 3 November 2026", whatHappened: "First paragraph.\n\nSecond <script>alert(1)</script> paragraph.",
    dataInvolved: ["First name", "<b>Stories</b>"], whatWeAreDoing: "We fixed it.", whatYouCanDo: null, severity: "medium" as const };

  it("says what happened, when, what data, what we are doing, what to do and who to contact", () => {
    const { subject, html, text } = renderNotice(inc, ["Maya"]);
    expect(subject).toBe("A privacy notice from Time2Read");
    for (const part of ["What happened", "What information was involved", "What we are doing", "What you can do", "Questions"]) expect(html).toContain(part);
    for (const part of ["WHAT HAPPENED", "When: on 3 November 2026", "- First name", "privacy@time-2-read.com"]) expect(text).toContain(part);
    // Privacy.tsx: parents can review or delete their child's data. The standard steps offer both.
    expect(text).toMatch(/show you, or delete, the information we hold about your child,/);
    expect(renderNotice(inc, ["Leo", "Maya"]).text).toMatch(/hold about your children,/);
    expect(renderNotice(inc, []).text).toMatch(/hold about your account,/);
    expect(html).toContain('name="viewport"');
    expect(html).toMatch(/max-width:560px/);
  });

  it("escapes everything the owner typed", () => {
    const { html } = renderNotice(inc, ["<img src=x>"]);
    // Plain substring checks: a regex over tags is what CodeQL's bad-tag-filter flags.
    for (const raw of ["<script>", "<b>Stories", "<img src=x>"]) expect(html).not.toContain(raw);
    expect(html).toContain("&lt;script&gt;");
  });

  it("names one, two or three children in plain English", () => {
    expect(renderNotice(inc, ["Maya"]).text).toContain("your child Maya.");
    expect(renderNotice(inc, ["Leo", "Maya"]).text).toContain("your children Leo and Maya.");
    expect(renderNotice(inc, ["Ana", "Leo", "Maya"]).text).toContain("your children Ana, Leo and Maya.");
    expect(renderNotice(inc, []).text).toContain("your Time2Read account.");
  });
});

describe("the real mailer call: refused means not sent, anything else means unknown", () => {
  const email: NoticeEmail = { to: "parent-a@example.test", subject: "s", html: "<p>h</p>", text: "t", idempotencyKey: "incident-x-v-p-1" };
  const fakeFetch = (status: number, body = "{}") => {
    const calls: { url: string; init: RequestInit }[] = [];
    const f = (async (url: string, init: RequestInit) => { calls.push({ url, init }); return new Response(body, { status }); }) as unknown as typeof fetch;
    return { f, calls };
  };

  it("a 200 returns the provider id and sends the key, sender and reply-to", async () => {
    const { f, calls } = fakeFetch(200, JSON.stringify({ id: "re_123" }));
    expect(await sendViaResend(f, "key")(email)).toBe("re_123");
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("incident-x-v-p-1");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ from: NOTICE_FROM, to: ["parent-a@example.test"], reply_to: "privacy@time-2-read.com" });
  });

  it("400, 403, 422 and 429 are refusals; 409, 500, 503 and a network error are unknown", async () => {
    for (const status of [400, 403, 422, 429]) {
      await expect(sendViaResend(fakeFetch(status).f, "key")(email), String(status)).rejects.toBeInstanceOf(MailRefused);
    }
    for (const status of [409, 500, 503]) {
      const err = await sendViaResend(fakeFetch(status).f, "key")(email).catch((e) => e);
      expect(err, String(status)).toBeInstanceOf(Error);
      expect(err, String(status)).not.toBeInstanceOf(MailRefused);
    }
    const down = (async () => { throw new TypeError("network down"); }) as unknown as typeof fetch;
    const err = await sendViaResend(down, "key")(email).catch((e) => e);
    expect(err).not.toBeInstanceOf(MailRefused);
  });
});

/** A mailer that, like Resend, drops a second request under a key it still remembers. */
function resendLike(w: ReturnType<typeof world>) {
  const delivered: string[] = []; // one entry per email a parent actually receives
  const seen = new Set<string>();
  let timeoutFor: string | null = null; // this address: delivered, but the answer never comes back
  w.deps.sendEmail = async (e) => {
    if (!seen.has(e.idempotencyKey)) { seen.add(e.idempotencyKey); delivered.push(e.to); w.sent.push(e); }
    if (e.to === timeoutFor) throw new Error("The signal has been aborted (timeout)");
    return `re_${seen.size}`;
  };
  return { delivered, timeout: (to: string | null) => { timeoutFor = to; }, forgetKeys: () => seen.clear() };
}

describe("retries never send a parent the same notice twice (N1, N3)", () => {
  const body = () => incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" });

  it("a mailer timeout is 'unsure', not failed or sent; a retry inside 23 hours reuses the key and the mailer drops the copy", async () => {
    const w = world();
    const mail = resendLike(w);
    mail.timeout("parent-b@example.test");
    const first = await call(w.deps, body());
    expect(first.status).toBe(502);
    expect(await first.json()).toMatchObject({ sent: 1, unconfirmed: 1, failed: 0, complete: false });
    expect(w.row(PARENT_B).status).toBe("unsure");
    expect(w.done.get("2026-11-test-incident")).toBe(false);

    mail.timeout(null);
    w.row(PARENT_B).keyAgeHours = 22;
    const second = await call(w.deps, body());
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ sent: 1, alreadySent: 1, complete: true });
    expect(mail.delivered.filter((to) => to === "parent-b@example.test")).toHaveLength(1);
  });

  it("a retry at 25 hours, when the mailer has forgotten the key, sends nothing and holds the parent for the owner", async () => {
    const w = world();
    const mail = resendLike(w);
    mail.timeout("parent-b@example.test");
    await call(w.deps, body());
    mail.timeout(null);
    mail.forgetKeys(); // past Resend's 24 hours: a resend under the old key would go out again
    w.row(PARENT_B).keyAgeHours = 25;
    const res = await call(w.deps, body());
    expect(res.status).toBe(409);
    const j = await res.json();
    expect(j).toMatchObject({ sent: 0, alreadySent: 1, held: 1, complete: false });
    expect(j.next).toContain('"resendUnsure": true');
    expect(mail.delivered.filter((to) => to === "parent-b@example.test")).toHaveLength(1);
    expect(w.row(PARENT_B).status).toBe("unsure");
    // Asked again it is still held: never "in progress forever", never sent by itself.
    expect(await (await call(w.deps, body())).json()).toMatchObject({ held: 1, inProgress: 0, sent: 0 });
    expect(mail.delivered).toHaveLength(2);
  });

  it("a run that crashed after the mailer accepted, before the log was written, is never sent again", async () => {
    const w = world();
    const mail = resendLike(w);
    const record = w.deps.record;
    w.deps.record = async (i, v, p, r) => { if (p === PARENT_A) throw new Error("connection reset"); return record(i, v, p, r); };
    const first = await call(w.deps, body());
    expect(first.status).toBe(502);
    expect(await first.json()).toMatchObject({ sent: 1, errors: 1, complete: false }); // B counted; A not claimed as sent
    expect(w.row(PARENT_A).status).toBe("sending");
    w.deps.record = record;

    // 30 minutes later, inside the key's 23 hours: re-sent under the same key, dropped by the mailer.
    w.row(PARENT_A).staleMinutes = 30;
    w.row(PARENT_A).keyAgeHours = 0.5;
    expect(await (await call(w.deps, body())).json()).toMatchObject({ sent: 1, alreadySent: 1, complete: true });
    // The same crash found 25 hours later, after the mailer forgot the key: held, not re-sent.
    const late = world();
    const lateMail = resendLike(late);
    const lateRecord = late.deps.record;
    late.deps.record = async () => { throw new Error("connection reset"); };
    await call(late.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    late.deps.record = lateRecord;
    late.row(PARENT_A).staleMinutes = 25 * 60;
    late.row(PARENT_A).keyAgeHours = 25;
    lateMail.forgetKeys();
    expect(await (await call(late.deps, incident({ childIds: [CHILD.maya], mode: "send" }))).json()).toMatchObject({ sent: 0, held: 1 });
    for (const m of [mail, lateMail]) expect(m.delivered.filter((to) => to === "parent-a@example.test")).toHaveLength(1);
  });

  it("only the owner's resendUnsure sends a held parent again, under a fresh key", async () => {
    const w = world();
    const mail = resendLike(w);
    mail.timeout("parent-b@example.test");
    await call(w.deps, body());
    mail.timeout(null);
    w.row(PARENT_B).keyAgeHours = 25;
    await call(w.deps, body());
    const res = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send", resendUnsure: true }));
    expect(await res.json()).toMatchObject({ sent: 1, held: 0, complete: true });
    expect(w.sent[w.sent.length - 1].idempotencyKey).toMatch(/-2$/);
    // A string, a number or a stranger never counts as the owner saying so.
    for (const v of ["true", 1, "yes"]) expect((await call(w.deps, incident({ childIds: [CHILD.zoe], mode: "send", resendUnsure: v }))).status).toBe(400);
  });
});

describe("an edited notice is a new version, sent only when the owner says so (N2)", () => {
  const edited = { whatWeAreDoing: "We fixed the page on 4 November, checked every account that opened it, and reset their sessions." };

  it("a changed text without newVersion is refused with nothing sent or recorded; with it, each parent gets the update once", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(w.sent).toHaveLength(2);
    const v1 = await versionOf();

    const refused = await call(w.deps, incident({ ...edited, childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(refused.status).toBe(409);
    expect((await refused.json()).code).toBe("NEW_VERSION_NOT_CONFIRMED");
    expect([w.sent.length, w.versions.get("2026-11-test-incident")!.length]).toEqual([2, 1]);

    const ok = await call(w.deps, incident({ ...edited, childIds: [CHILD.maya, CHILD.zoe], mode: "send", newVersion: true }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ sent: 2, complete: true, notice: { versionNo: 2, isNew: true, hadEarlierVersion: 2 } });
    const updates = w.sent.slice(2);
    expect(updates.map((e) => e.subject)).toEqual(["An update to our privacy notice from Time2Read", "An update to our privacy notice from Time2Read"]);
    expect(updates[0].text).toContain("This notice replaces that one");
    // The edit keeps who got version 1.
    expect([w.row(PARENT_A, v1).status, w.row(PARENT_B, v1).status]).toEqual(["sent", "sent"]);
    // Running version 2 again sends nothing; sending the old text again is refused.
    await call(w.deps, incident({ ...edited, childIds: [CHILD.maya, CHILD.zoe], mode: "send", newVersion: true }));
    const old = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(old.status).toBe(409);
    expect((await old.json()).code).toBe("OLDER_VERSION");
    expect(w.sent).toHaveLength(4);
  });

  it("a parent who never got version 1 gets version 2 as a first notice, not an update", async () => {
    const w = world();
    const sendEmail = w.deps.sendEmail;
    w.deps.sendEmail = async (e) => { if (e.to === "parent-b@example.test") throw new MailRefused("Resend 422"); return sendEmail(e); };
    await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    w.deps.sendEmail = sendEmail;
    await call(w.deps, incident({ ...edited, childIds: [CHILD.maya, CHILD.zoe], mode: "send", newVersion: true }));
    const toB = w.sent.filter((e) => e.to === "parent-b@example.test");
    expect(toB.map((e) => e.subject)).toEqual(["A privacy notice from Time2Read"]);
    expect(toB[0].text).not.toContain("replaces");
  });

  it("dry run of an edit shows the update and what to do, and records nothing", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    const j = await (await call(w.deps, incident({ ...edited, childIds: [CHILD.maya] }))).json();
    expect(j).toMatchObject({ mode: "dry-run", sent: 0, notice: { versionNo: 2, isNew: true, hadEarlierVersion: 1 } });
    expect(j.next).toContain('"newVersion": true');
    expect(j.updatePreview.subject).toBe("An update to our privacy notice from Time2Read");
    expect([w.sent.length, w.versions.get("2026-11-test-incident")!.length]).toEqual([1, 1]);
  });

  it("a parent, a forged token or no token can never send, edit or resend, even with the flags set", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    for (const [token, status] of [["token-parent", 403], ["eyJhbGciOiJIUzI1NiJ9.forged.sig", 401], [null, 401]] as const) {
      const res = await call(w.deps, incident({ ...edited, childIds: [CHILD.maya], mode: "send", newVersion: true, resendUnsure: true }), token);
      expect(res.status, String(token)).toBe(status);
    }
    expect([w.sent.length, w.versions.get("2026-11-test-incident")!.length]).toEqual([1, 1]);
  });

  it("severity alone is not a new version (it is not in the email)", async () => {
    expect(await versionOf({ severity: "high" })).toBe(await versionOf());
    expect(await versionOf(edited)).not.toBe(await versionOf());
  });
});

describe("the incident is marked done only when every parent has it (N4)", () => {
  it("done after the last parent; not done while any are refused, unknown, left for the next run or without an address", async () => {
    const w = world();
    const sendEmail = w.deps.sendEmail;
    w.deps.sendEmail = async (e) => { if (e.to === "parent-b@example.test") throw new MailRefused("Resend 422"); return sendEmail(e); };
    await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(w.done.get("2026-11-test-incident")).toBe(false);
    w.deps.sendEmail = sendEmail;
    await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(w.done.get("2026-11-test-incident")).toBe(true);

    const noAddr = world();
    const j = await (await call(noAddr.deps, incident({ childIds: [CHILD.maya, CHILD.sam], mode: "send" }))).json();
    expect(j).toMatchObject({ sent: 1, noAddress: 1, complete: false });
    expect(noAddr.done.get("2026-11-test-incident")).toBe(false);

    const many = Array.from({ length: MAX_SENDS_PER_RUN + 1 }, (_, i) => `f${String(i).padStart(7, "0")}-0000-4000-8000-000000000000`);
    const big = world({ accountEmail: async (id) => `p-${id.slice(0, 8)}@example.test`, childrenOfParents: async () => [] });
    await call(big.deps, incident({ accountIds: many, mode: "send" }));
    expect(big.done.get("2026-11-test-incident")).toBe(false);
  });

  it("a database failure writing the incident status is 502 and never reported done", async () => {
    const w = world({ setIncidentDone: async () => { throw new Error("db down"); } });
    const res = await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ sent: 1, complete: false });
  });

  it("dry run never touches the incident record", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya] }));
    expect([w.done.size, w.logged.length]).toEqual([0, 0]);
  });
});

describe("the real function uses this handler and its records", () => {
  const index = read("supabase/functions/notify-data-breach/index.ts");
  const migrations = ["supabase/migrations/20261123180000_incident_notices.sql", "supabase/migrations/20261123200000_incident_notice_versions.sql"];
  const sql = migrations.map(read).join("\n");

  it("index.ts sends only through sendViaResend, and every function it calls exists in a migration", () => {
    expect(index).toContain("sendEmail: sendViaResend(fetch, resendKey)");
    expect(index).not.toContain("api.resend.com");
    for (const [, fn] of index.matchAll(/db\.rpc\("([a-z_]+)"/g)) expect(sql, fn).toContain(`FUNCTION public.${fn}(`);
    expect([...index.matchAll(/db\.rpc\(/g)]).toHaveLength(2);
  });

  it("the migrations delete no data, and the database checks run in CI", () => {
    for (const m of migrations) {
      expect(existsSync(join(root, m)), m).toBe(true);
      expect(read(m), m).not.toMatch(/\bDROP\s+(TABLE|COLUMN)|\bDELETE\s+FROM|\bTRUNCATE\b|\bUPDATE\s+public\.(incident_notices|data_breach_log)\s+SET(?![\s\S]*WHERE)/i);
    }
    expect(read("scripts/test-institutions-db.sh")).toContain("supabase/tests/incident_notices/claim.sql");
  });
});
