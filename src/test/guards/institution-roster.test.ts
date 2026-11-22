import { describe, expect, it, vi } from "vitest";
import {
  classlinkRosterAdapter,
  csvRosterAdapter,
  parseRosterCsv,
  rosterGrade,
} from "../../../supabase/functions/_shared/institutionRoster";
import { ROSTER_CALLS_PER_HOUR, rosterHandler } from "../../../supabase/functions/institution-roster/handler";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const TOKEN = "fixture-classlink";
const LINK = { applicationId: "fixture-app", schoolIds: ["school-1"] };
const BASE = "https://oneroster-proxy.apis.classlink.com/fixture-app/ims/oneroster/v1p1";
const student = (id: string, grade?: string, extra: Record<string, unknown> = {}) => ({
  sourcedId: id, givenName: "Reader", familyName: "Alvarez", grades: grade ? [grade] : [], status: "active", ...extra,
});
/** A ClassLink double: the class's school, then queued replies per path. */
function classlinkRoutes(routes: Record<string, Response[]>, classSchool = "school-1") {
  return vi.fn(async (url: string, _init?: any) => {
    const u = new URL(url);
    const path = u.pathname.replace("/fixture-app/ims/oneroster/v1p1", "");
    const queued = routes[path];
    if (queued?.length) return queued.shift()!;
    const cls = path.match(/^\/classes\/([^/]+)$/);
    if (cls) return json({ class: { sourcedId: cls[1], school: { sourcedId: classSchool } } });
    return json({ error: "unrouted fixture" }, 404);
  });
}

describe("roster adapters use one validated minimal profile contract", () => {
  it("parses BOM, CRLF, quoted commas and escaped quotes, without invented grades", async () => {
    expect(
      await csvRosterAdapter.read(
        '﻿external_id,display_name,school_grade,reading_grade\r\na,"Reader, ""A""",02,\r\n',
      ),
    ).toEqual([{ external_id: "a", display_name: 'Reader, "A"', school_grade: "2", reading_grade: null }]);
    expect(csvRosterAdapter.status()).toBe("configured");
  });
  it.each([
    "external_id,display_name\na,A\na,B",
    'external_id,display_name\na,"A',
    "external_id,display_name,email\na,A,fixture",
    "external_id,display_name\na,A,unexpected",
    'external_id,display_name\na,"A"tail',
    "external_id,display_name\n,A",
    "external_id,display_name,display_name\na,A,B",
  ])("rejects malformed, duplicate, excessive or nonminimal CSV: %s", (csv) => {
    expect(() => parseRosterCsv(csv)).toThrow();
  });
  it("rejects an oversized CSV before parsing", () =>
    expect(() => parseRosterCsv("x".repeat(1_000_001))).toThrow("1 MB"));
  // Data loss: one TK or 11th-grade child must never block (or vanish from) a class.
  it("keeps every child when a grade is TK, 11, 12 or ungraded: TK is PreK, the rest are not recorded", () => {
    const rows = parseRosterCsv(
      "external_id,display_name,school_grade\na,A,TK\nb,B,11\nc,C,12\nd,D,Ungraded\ne,E,3",
    );
    expect(rows.map((r) => [r.external_id, r.school_grade])).toEqual([
      ["a", "PreK"], ["b", null], ["c", null], ["d", null], ["e", "3"],
    ]);
    expect(["PR", "PK", "KG", "UG", "Other", "PS", "13"].map(rosterGrade)).toEqual(["PreK", "PreK", "K", null, null, null, null]);
  });
  it.each([
    [{}, TOKEN],
    [{ applicationId: "app", schoolIds: ["s1"] }, undefined],
    [{ schoolIds: ["s1"] }, TOKEN],
    [{ applicationId: "app", schoolIds: [] }, TOKEN],
  ] as const)("without the app token, a link or its schools it is explicitly disconnected, with no network call: %j", async (link, token) => {
    const fetcher = vi.fn();
    const adapter = classlinkRosterAdapter(link as any, token, fetcher);
    expect(adapter.status()).toBe("not_connected");
    await expect(adapter.read("class")).rejects.toThrow("Not connected");
    await expect(adapter.classes()).rejects.toThrow("Not connected");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses the ClassLink OAuth2 Proxy with the vendor bearer, and keeps first name and last initial only", async () => {
    const fetcher = classlinkRoutes({
      "/classes/fixture-class/students": [json({ users: [student("fixture-a", "KG", { email: "unused fixture" })] })],
    });
    expect(await classlinkRosterAdapter(LINK, TOKEN, fetcher).read("fixture-class")).toEqual([
      { external_id: "classlink:fixture-a", display_name: "Reader A.", school_grade: "K", reading_grade: null },
    ]);
    expect(fetcher.mock.calls[1][0]).toBe(`${BASE}/classes/fixture-class/students?limit=100&offset=0`);
    expect(fetcher.mock.calls[1][1]).toMatchObject({ method: "GET", headers: { Authorization: "Bearer fixture-classlink" }, redirect: "error" });
  });
  it("imports a ClassLink class with TK and 11th-grade children instead of refusing it", async () => {
    const fetcher = classlinkRoutes({
      "/classes/mixed/students": [json({ users: [student("tk", "TK"), student("eleven", "11"), student("ug", "UG"), student("two", "02")] })],
    });
    const rows = await classlinkRosterAdapter(LINK, TOKEN, fetcher).read("mixed");
    expect(rows.map((r) => [r.external_id, r.school_grade])).toEqual([
      ["classlink:tk", "PreK"], ["classlink:eleven", null], ["classlink:ug", null], ["classlink:two", "2"],
    ]);
  });
  it("lists this school's ClassLink classes for the admin to pick from, without tombstones", async () => {
    const fetcher = classlinkRoutes({
      "/schools/school-1/classes": [json({ classes: [
        { sourcedId: "c2", title: "Room 2", status: "active" },
        { sourcedId: "c1", title: "Room 1", status: "active" },
        { sourcedId: "gone", title: "Old", status: "tobedeleted" },
      ] })],
    });
    expect(await classlinkRosterAdapter(LINK, TOKEN, fetcher).classes()).toEqual([
      { id: "c1", name: "Room 1" },
      { id: "c2", name: "Room 2" },
    ]);
    expect(fetcher.mock.calls[0][0]).toBe(`${BASE}/schools/school-1/classes?limit=100&offset=0`);
  });
  // Abuse: a school admin sends the ID of a class in ANOTHER school of the tenant.
  it("refuses a ClassLink class from another school of the tenant, before any child is read", async () => {
    const fetcher = classlinkRoutes({}, "school-9");
    await expect(classlinkRosterAdapter(LINK, TOKEN, fetcher).read("c9")).rejects.toThrow("Roster class is not part of this school.");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls.some(([u]: [string]) => u.includes("/students"))).toBe(false);
  });
  it("pages ClassLink results and excludes tombstones", async () => {
    const fetcher = classlinkRoutes({
      "/classes/class/students": [
        json({ users: Array.from({ length: 100 }, (_, i) => student(`fixture-${i}`)) }),
        json({ users: [{ sourcedId: "removed", status: "tobedeleted" }] }),
      ],
    });
    const rows = await classlinkRosterAdapter(LINK, TOKEN, fetcher).read("class");
    expect(rows).toHaveLength(100);
    expect(fetcher.mock.calls[2][0]).toContain("offset=100");
  });
  // Data loss: a class that comes back empty (wrong class, sync not finished) must
  // never look like a valid zero-child roster.
  it("an empty ClassLink class is an error, not an empty roster", async () => {
    const fetcher = classlinkRoutes({ "/classes/empty/students": [json({ users: [] })] });
    await expect(classlinkRosterAdapter(LINK, TOKEN, fetcher).read("empty")).rejects.toThrow("Import 1–1000");
  });
  it("a class of only tombstones is also an error, not an empty roster", async () => {
    const fetcher = classlinkRoutes({ "/classes/gone/students": [json({ users: [{ sourcedId: "x", status: "tobedeleted" }] })] });
    await expect(classlinkRosterAdapter(LINK, TOKEN, fetcher).read("gone")).rejects.toThrow("Import 1–1000");
  });
  // Outage: the provider is down, revoked our app, or answers with garbage.
  it.each([
    [() => json({ private: "fixture child name" }, 401), "not authorized"],
    [() => json({ private: "fixture child name" }, 503), "unavailable (HTTP 503)"],
    [() => new Response("<html>fixture child name</html>", { status: 200 }), "unreadable reply"],
    [() => json({ users: "fixture child name" }), "Invalid ClassLink"],
  ])("a provider failure is a controlled message with no response content", async (response, message) => {
    const fetcher = vi.fn(async (url: string) => (/\/classes\/[^/]+$/.test(new URL(url).pathname) ? json({ class: { school: { sourcedId: "school-1" } } }) : response()));
    const failure = classlinkRosterAdapter(LINK, TOKEN, fetcher).read("class");
    await expect(failure).rejects.toThrow(message);
    await expect(failure).rejects.not.toThrow("fixture child name");
  });
});

function fakeDb(role = "school_admin", signedIn = true, id = "fixture-user") {
  const builder = { select: () => builder, eq: () => builder, maybeSingle: async () => ({ data: { role }, error: null }) };
  return {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id } : null }, error: null }) },
    from: () => builder,
  };
}
const req = (body: unknown, auth = true) =>
  new Request("https://fixture.example/institution-roster", {
    method: "POST",
    headers: auth ? { Authorization: "Bearer fixture-token" } : {},
    body: JSON.stringify(body),
  });
function withToken(links: string | undefined) {
  return (key: string) =>
    key === "INSTITUTION_ROSTER_CONNECTIONS" ? links : key === "CLASSLINK_ONEROSTER_TOKEN" ? TOKEN : undefined;
}
const LINKED = withToken(JSON.stringify({ "fixture-school": { classlink: LINK } }));
/** An in-memory paid_call_hit: counts per bucket, refuses (uncounted) over the limit. */
function memoryCounter() {
  const counts = new Map<string, number>();
  return vi.fn(async (buckets: string[], _w: number[], limits: number[]) => {
    for (let i = 0; i < buckets.length; i++) if ((counts.get(buckets[i]) ?? 0) + 1 > limits[i]) return buckets[i];
    buckets.forEach((b) => counts.set(b, (counts.get(b) ?? 0) + 1));
    return null;
  });
}
const allow = async () => null;

describe("roster endpoint verifies the caller before consulting school-scoped secrets", () => {
  it("handles preflight with no auth or provider calls", async () => {
    const create = vi.fn();
    const env = vi.fn();
    const response = await rosterHandler(create, env, allow)(new Request("https://fixture.example", { method: "OPTIONS" }));
    expect(response.status).toBe(204);
    expect(create).not.toHaveBeenCalled();
    expect(env).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated requests and teachers", async () => {
    const env = vi.fn();
    const handler = rosterHandler(() => fakeDb("teacher"), env, allow);
    expect((await handler(req({}, false))).status).toBe(401);
    expect((await handler(req({ schoolId: "fixture-school", action: "status" }))).status).toBe(403);
    expect(env).not.toHaveBeenCalled();
  });
  it("does not reuse another school's connection and shows an explicit not-connected status", async () => {
    const fetcher = vi.fn();
    const handler = rosterHandler(() => fakeDb(), withToken(JSON.stringify({ "other-school": { classlink: LINK } })), allow, fetcher);
    const status = await handler(req({ schoolId: "fixture-school", action: "status" }));
    expect(await status.json()).toEqual({ classlink: "not_connected" });
    const preview = await handler(req({ schoolId: "fixture-school", action: "preview", providerClassId: "class" }));
    expect(preview.status).toBe(409);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reports configuration and returns no secrets", async () => {
    const response = await rosterHandler(() => fakeDb(), LINKED, allow)(req({ schoolId: "fixture-school", action: "status" }));
    expect(await response.json()).toEqual({ classlink: "configured" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("a link without the app's developer token stays not connected", async () => {
    const env = (key: string) => (key === "INSTITUTION_ROSTER_CONNECTIONS" ? JSON.stringify({ "fixture-school": { classlink: LINK } }) : undefined);
    const response = await rosterHandler(() => fakeDb(), env, allow)(req({ schoolId: "fixture-school", action: "status" }));
    expect(await response.json()).toEqual({ classlink: "not_connected" });
  });
  it("a malformed links secret reads as not connected instead of failing every school", async () => {
    const response = await rosterHandler(() => fakeDb(), withToken("{not json"), allow)(req({ schoolId: "fixture-school", action: "status" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ classlink: "not_connected" });
  });
  it("lists classes for a school admin and never for a teacher", async () => {
    const fetcher = classlinkRoutes({ "/schools/school-1/classes": [json({ classes: [{ sourcedId: "c1", title: "Room 1" }] })] });
    const body = { schoolId: "fixture-school", action: "classes" };
    expect((await rosterHandler(() => fakeDb("teacher"), LINKED, allow, fetcher)(req(body))).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
    const ok = await rosterHandler(() => fakeDb(), LINKED, allow, fetcher)(req(body));
    expect(await ok.json()).toEqual({ classes: [{ id: "c1", name: "Room 1" }] });
  });
  // Abuse: one admin hammering the endpoint would burn the shared ClassLink app quota.
  it("limits each admin to ROSTER_CALLS_PER_HOUR provider calls, without limiting another admin", async () => {
    const counter = memoryCounter();
    const fetcher = classlinkRoutes({});
    fetcher.mockImplementation(async () => json({ classes: [{ sourcedId: "c1", title: "Room 1" }] }));
    const body = { schoolId: "fixture-school", action: "classes" };
    const mine = rosterHandler(() => fakeDb(), LINKED, counter, fetcher);
    for (let i = 0; i < ROSTER_CALLS_PER_HOUR; i++) expect((await mine(req(body))).status).toBe(200);
    const calls = fetcher.mock.calls.length;
    const limited = await mine(req(body));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("3600");
    expect(fetcher.mock.calls.length).toBe(calls); // refused before ClassLink is called
    expect(counter.mock.calls[0][0]).toEqual(["roster:fixture-user|3600"]);
    const other = rosterHandler(() => fakeDb("school_admin", true, "other-admin"), LINKED, counter, fetcher);
    expect((await other(req(body))).status).toBe(200);
  });
  it("still refuses another school's class through the endpoint", async () => {
    const fetcher = classlinkRoutes({}, "school-9");
    const res = await rosterHandler(() => fakeDb(), LINKED, allow, fetcher)(req({ schoolId: "fixture-school", action: "preview", providerClassId: "c9" }));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("Roster class is not part of this school.");
  });
  // Outage: a provider down or a counter down is never a 400 and never an empty roster.
  it.each([
    ["ClassLink 503", () => json({ private: "fixture child name" }, 503), 502, "not_connected"],
    ["ClassLink 401", () => json({}, 401), 502, "not_connected"],
    ["no reply", () => { throw new TypeError("network down"); }, 502, "not_connected"],
    ["garbage", () => new Response("<html>fixture child name</html>"), 502, "not_connected"],
  ])("a provider outage (%s) answers %s with status not_connected and no rows", async (_name, reply, code, status) => {
    const fetcher = vi.fn(async () => reply());
    const res = await rosterHandler(() => fakeDb(), LINKED, allow, fetcher as any)(req({ schoolId: "fixture-school", action: "preview", providerClassId: "class" }));
    expect(res.status).toBe(code);
    const body = await res.json();
    expect(body.status).toBe(status);
    expect(body.rows).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("fixture child name");
  });
  it("a rate-counter outage answers 503 'unknown' and never calls ClassLink", async () => {
    const fetcher = vi.fn();
    const down = vi.fn(async () => { throw new Error("db down"); });
    const res = await rosterHandler(() => fakeDb(), LINKED, down, fetcher)(req({ schoolId: "fixture-school", action: "classes" }));
    expect(res.status).toBe(503);
    expect((await res.json()).status).toBe("unknown");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
