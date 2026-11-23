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
  NOTICE_FROM,
  PREVIEW_CHILD,
  handleIncidentNotice,
  renderNotice,
  type ChildRow,
  type ClaimResult,
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
  const rows = new Map<string, { status: "sending" | "sent" | "failed"; attempts: number; error?: string }>();
  const sent: NoticeEmail[] = [];
  const logged: string[] = [];
  const deps: IncidentDeps = {
    adminIds: [ADMIN],
    serviceKey: SERVICE_KEY,
    getUser: async (t) => TOKENS[t] ?? null,
    childrenByIds: async (ids) => children.filter((c) => ids.includes(c.id)),
    childrenOfParents: async (ids) => children.filter((c) => ids.includes(c.parent_user_id)),
    accountEmail: async (id) => accounts[id] ?? null,
    logIncident: async (i) => { logged.push(i.incidentId); },
    claim: async (incident, parent): Promise<ClaimResult> => {
      const k = `${incident}|${parent}`;
      const r = rows.get(k);
      if (!r) { rows.set(k, { status: "sending", attempts: 1 }); return "claimed"; }
      if (r.status === "failed") { r.status = "sending"; r.attempts++; return "claimed"; }
      return r.status;
    },
    record: async (incident, parent, result) => {
      const r = rows.get(`${incident}|${parent}`)!;
      r.status = result.status;
      r.error = result.status === "failed" ? result.error : undefined;
    },
    sendEmail: async (e) => { sent.push(e); return `re_${sent.length}`; },
    mailConfigured: true,
    pause: async () => {},
    ...over,
  };
  return { deps, sent, rows, logged, children, accounts };
}

const incident = (extra: Record<string, unknown> = {}) => ({
  incidentId: "2026-11-test-incident",
  whenItHappened: "between 2 and 4 November 2026",
  whatHappened: "A settings page showed some reading records to the wrong signed-in account for two days.",
  dataInvolved: ["Your child's first name", "Titles of stories read"],
  whatWeAreDoing: "We fixed the page on 4 November and checked every account that opened it.",
  ...extra,
});

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
    w.deps.sendEmail = async (e) => { if (down && e.to === "parent-b@example.test") throw new Error("Resend 403: cannot send to parent-b@example.test"); return sendEmail(e); };
    const first = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(first.status).toBe(502);
    expect(await first.json()).toMatchObject({ sent: 1, failed: 1, complete: false });
    expect(w.sent.map((e) => e.to)).toEqual(["parent-a@example.test"]);
    const failedRow = w.rows.get(`2026-11-test-incident|${PARENT_B}`)!;
    expect(failedRow.status).toBe("failed");
    expect(failedRow.error).not.toContain("@"); // no address in the log

    down = false;
    const second = await call(w.deps, incident({ childIds: [CHILD.maya, CHILD.zoe], mode: "send" }));
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ sent: 1, alreadySent: 1, failed: 0, complete: true });
    expect(w.sent.map((e) => e.to)).toEqual(["parent-a@example.test", "parent-b@example.test"]);
    expect(w.rows.get(`2026-11-test-incident|${PARENT_B}`)!.attempts).toBe(2);
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
    stuck.rows.set(`2026-11-test-incident|${PARENT_A}`, { status: "sending", attempts: 1 });
    const r = await call(stuck.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(r.status).toBe(202);
    expect(await r.json()).toMatchObject({ sent: 0, inProgress: 1, complete: false });
    expect(stuck.sent).toHaveLength(0);
  });

  it("the mailer gets the same idempotency key for the same incident and parent", async () => {
    const w = world();
    await call(w.deps, incident({ childIds: [CHILD.maya], mode: "send" }));
    expect(w.sent[0].idempotencyKey).toBe(`incident-2026-11-test-incident-${PARENT_A}`);
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

describe("the real function uses this handler and its records", () => {
  const index = read("supabase/functions/notify-data-breach/index.ts");
  const migration = "supabase/migrations/20261123180000_incident_notices.sql";

  it("index.ts wires the handler with the service key, the claim function and an idempotency key; no other mail path", () => {
    expect(index).toContain("return handleIncidentNotice(req, {");
    expect(index).toContain('db.rpc("incident_notice_claim"');
    expect(index).toContain('"Idempotency-Key": idempotencyKey');
    expect(index).toContain("from: NOTICE_FROM, to: [to]");
    expect(index.match(/api\.resend\.com/g)).toHaveLength(1);
    expect(index).not.toMatch(/from\(["']subscribers["']\)/);
  });

  it("the migration is additive and keeps the send log away from app roles", () => {
    expect(existsSync(join(root, migration))).toBe(true);
    const sql = read(migration);
    expect(sql).not.toMatch(/\bDROP\s+(TABLE|COLUMN)|\bDELETE\s+FROM|\bTRUNCATE\b/i);
    expect(sql).toContain("REVOKE ALL ON public.incident_notices FROM anon, authenticated;");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.incident_notice_claim(text, uuid) FROM PUBLIC, anon, authenticated;");
    expect(read("scripts/test-institutions-db.sh")).toContain("supabase/tests/incident_notices/claim.sql");
  });
});
