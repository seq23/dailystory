import { describe, expect, it, vi } from "vitest";
import {
  csvRosterAdapter,
  parseRosterCsv,
  providerRosterAdapter,
} from "../../../supabase/functions/_shared/institutionRoster";
import { rosterHandler } from "../../../supabase/functions/institution-roster/handler";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const cleverUser = (id = "fixture-a") => ({
  data: {
    id,
    name: { first: "Reader", last: "A" },
    roles: { student: { grade: "02" } },
  },
});
describe("roster adapters use one validated minimal profile contract", () => {
  it("parses BOM, CRLF, quoted commas and escaped quotes, without invented grades", async () => {
    expect(
      await csvRosterAdapter.read(
        '\uFEFFexternal_id,display_name,school_grade,reading_grade\r\na,"Reader, ""A""",02,\r\n',
      ),
    ).toEqual([
      {
        external_id: "a",
        display_name: 'Reader, "A"',
        school_grade: "2",
        reading_grade: null,
      },
    ]);
    expect(csvRosterAdapter.status()).toBe("configured");
  });
  it.each([
    "external_id,display_name\na,A\na,B",
    'external_id,display_name\na,"A',
    "external_id,display_name,school_grade\na,A,12",
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
  it.each([
    ["clever", {}, {}],
    ["clever", { districtId: "d1", schoolIds: ["s1"] }, {}],
    ["clever", { districtId: "d1" }, CREDS],
    ["classlink", { applicationId: "app", schoolIds: ["s1"] }, {}],
    ["classlink", { schoolIds: ["s1"] }, CREDS],
  ] as const)(
    "%s without app credentials, a link or its schools is explicitly disconnected, with no network call",
    async (provider, link, creds) => {
      const fetcher = vi.fn();
      const adapter = providerRosterAdapter(provider, link as any, creds, fetcher);
      expect(adapter.status()).toBe("not_connected");
      await expect(adapter.read("class")).rejects.toThrow("Not connected");
      await expect(adapter.classes()).rejects.toThrow("Not connected");
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it("gets the district's own token from Clever with the app's client ID and secret, then reads the section", async () => {
    const fetcher = cleverRoutes({
      "/v3.0/sections/section-a/users": [
        json({
          data: [cleverUser()],
          links: [{ rel: "next", uri: "/v3.0/sections/section-a/users?role=student&starting_after=fixture-a" }],
        }),
        json({ data: [cleverUser("fixture-b")] }),
      ],
    });
    const rows = await providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("section-a");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ external_id: "clever:fixture-a", display_name: "Reader A", school_grade: "2", reading_grade: null });
    const [tokenUrl, tokenInit] = fetcher.mock.calls[0];
    expect(tokenUrl).toBe("https://clever.com/oauth/tokens?district=district-1");
    expect((tokenInit as any).headers.Authorization).toBe(`Basic ${btoa("fixture-client:fixture-secret")}`);
    const rosterCall = fetcher.mock.calls.find(([u]: [string]) => u.includes("/users?"));
    expect((rosterCall as any)[0]).toBe("https://api.clever.com/v3.0/sections/section-a/users?role=student&limit=100");
    expect((rosterCall as any)[1]).toMatchObject({ method: "GET", headers: { Authorization: "Bearer district-token" }, redirect: "error" });
    // The token is fetched once per request, not once per page.
    expect(fetcher.mock.calls.filter(([u]: [string]) => u.startsWith("https://clever.com/")).length).toBe(1);
  });
  it("lists this school's Clever classes for the admin to pick from", async () => {
    const fetcher = cleverRoutes({
      "/v3.0/schools/school-1/sections": [json({ data: [{ data: { id: "sec-2", name: "Room 2" } }, { data: { id: "sec-1", name: "Room 1" } }] })],
    });
    expect(await providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).classes()).toEqual([
      { id: "sec-1", name: "Room 1" },
      { id: "sec-2", name: "Room 2" },
    ]);
  });
  // Abuse: a school admin sends the ID of a class in ANOTHER school of the same
  // district. The district token could read it; the link's school list must not.
  it("refuses a Clever class from another school in the same district, before any child is read", async () => {
    const fetcher = cleverRoutes({ "/v3.0/sections/other-sec": [json({ data: { id: "other-sec", school: "school-9" } })] });
    await expect(providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("other-sec")).rejects.toThrow(
      "Roster class is not part of this school.",
    );
    expect(fetcher.mock.calls.some(([u]: [string]) => u.includes("/users"))).toBe(false);
  });
  it("refuses a ClassLink class from another school of the tenant", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(json({ class: { sourcedId: "c9", school: { sourcedId: "school-9" } } }));
    await expect(
      providerRosterAdapter("classlink", CLASSLINK_LINK, CREDS, fetcher).read("c9"),
    ).rejects.toThrow("not part of this school");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  // Abuse: Clever hands back a token, but for a different district.
  it.each([
    [{ data: [{ owner: { id: "district-2", type: "district" }, access_token: "other" }] }],
    [{ data: [] }],
    [{ data: [{ owner: { id: "district-1" }, access_token: "a" }, { owner: { id: "district-1" }, access_token: "b" }] }],
    [{}],
  ])("never uses a Clever token that is not exactly this district's: %j", async (reply) => {
    const fetcher = vi.fn().mockResolvedValueOnce(json(reply));
    await expect(providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("section-a")).rejects.toThrow("not authorized");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("never sends the Clever token to an untrusted pagination destination", async () => {
    const fetcher = cleverRoutes({
      "/v3.0/sections/class/users": [json({ data: [cleverUser()], links: [{ rel: "next", uri: "https://invalid.example/v3.0/sections/class/users" }] })],
    });
    await expect(providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("class")).rejects.toThrow("Invalid roster pagination");
    expect(fetcher.mock.calls.some(([u]: [string]) => u.startsWith("https://invalid.example"))).toBe(false);
  });
  it("uses the documented ClassLink OAuth2 Proxy with the vendor bearer and the tenant application ID", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json({ class: { sourcedId: "fixture-class", school: { sourcedId: "school-1" } } }))
      .mockResolvedValueOnce(
        json({ users: [{ sourcedId: "fixture-a", givenName: "Reader", familyName: "A", grades: ["KG"], email: "unused fixture", status: "active" }] }),
      );
    expect(await providerRosterAdapter("classlink", CLASSLINK_LINK, CREDS, fetcher).read("fixture-class")).toEqual([
      { external_id: "classlink:fixture-a", display_name: "Reader A", school_grade: "K", reading_grade: null },
    ]);
    expect(fetcher.mock.calls[1][0]).toBe(
      "https://oneroster-proxy.apis.classlink.com/fixture-app/ims/oneroster/v1p1/classes/fixture-class/students?limit=100&offset=0",
    );
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe("Bearer fixture-classlink");
  });
  it("pages ClassLink results and excludes tombstones", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json({ class: { school: { sourcedId: "school-1" } } }))
      .mockResolvedValueOnce(json({ users: Array.from({ length: 100 }, (_, i) => ({ sourcedId: `fixture-${i}`, givenName: "Reader", grades: [], status: "active" })) }))
      .mockResolvedValueOnce(json({ users: [{ sourcedId: "removed", status: "tobedeleted" }] }));
    const rows = await providerRosterAdapter("classlink", CLASSLINK_LINK, CREDS, fetcher).read("class");
    expect(rows).toHaveLength(100);
    expect(fetcher.mock.calls[2][0]).toContain("offset=100");
  });
  // Data loss: a class that comes back empty (wrong class, sync not finished) must
  // never look like a valid zero-child roster.
  it("an empty provider class is an error, not an empty roster", async () => {
    const fetcher = cleverRoutes({ "/v3.0/sections/section-a/users": [json({ data: [] })] });
    await expect(providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("section-a")).rejects.toThrow("Import 1–1000");
  });
  // Outage: the provider is down, revoked our app, or answers with garbage.
  it.each([
    [json({ private: "fixture child name" }, 401), "not authorized"],
    [json({ private: "fixture child name" }, 503), "unavailable (HTTP 503)"],
    [new Response("<html>fixture child name</html>", { status: 200 }), "unreadable reply"],
  ])("a provider failure is a controlled message with no response content", async (response, message) => {
    const fetcher = vi.fn().mockResolvedValue(response);
    const failure = providerRosterAdapter("clever", CLEVER_LINK, CREDS, fetcher).read("class");
    await expect(failure).rejects.toThrow(message);
    await expect(failure).rejects.not.toThrow("fixture child name");
  });
});
const CREDS = { cleverClientId: "fixture-client", cleverClientSecret: "fixture-secret", classlinkToken: "fixture-classlink" };
const CLEVER_LINK = { districtId: "district-1", schoolIds: ["school-1"] };
const CLASSLINK_LINK = { applicationId: "fixture-app", schoolIds: ["school-1"] };
/** A Clever double: the token endpoint, the section's school, then queued replies per path. */
function cleverRoutes(routes: Record<string, Response[]>) {
  return vi.fn(async (url: string, _init?: any) => {
    const u = new URL(url);
    if (u.origin === "https://clever.com")
      return json({ data: [{ owner: { id: "district-1", type: "district" }, access_token: "district-token" }] });
    const queued = routes[u.pathname];
    if (queued?.length) return queued.shift()!;
    const section = u.pathname.match(/^\/v3\.0\/sections\/([^/]+)$/);
    if (section) return json({ data: { id: section[1], school: "school-1" } });
    return json({ error: "unrouted fixture" }, 404);
  });
}
function fakeDb(role = "school_admin", signedIn = true) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    maybeSingle: async () => ({ data: { role }, error: null }),
  };
  return {
    auth: {
      getUser: async () => ({
        data: { user: signedIn ? { id: "fixture-user" } : null },
        error: null,
      }),
    },
    from: () => builder,
  };
}
const req = (body: unknown, auth = true) =>
  new Request("https://fixture.example/institution-roster", {
    method: "POST",
    headers: auth ? { Authorization: "Bearer fixture-token" } : {},
    body: JSON.stringify(body),
  });
describe("roster endpoint verifies the caller before consulting school-scoped secrets", () => {
  it("handles preflight with no auth or provider calls", async () => {
    const create = vi.fn();
    const env = vi.fn();
    const response = await rosterHandler(
      create,
      env,
    )(new Request("https://fixture.example", { method: "OPTIONS" }));
    expect(response.status).toBe(204);
    expect(create).not.toHaveBeenCalled();
    expect(env).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated requests and teachers", async () => {
    const env = vi.fn();
    const handler = rosterHandler(() => fakeDb("teacher"), env);
    expect((await handler(req({}, false))).status).toBe(401);
    expect(
      (await handler(req({ schoolId: "fixture-school", action: "status" })))
        .status,
    ).toBe(403);
    expect(env).not.toHaveBeenCalled();
  });
  it("does not reuse another school connection and shows an explicit not-connected status", async () => {
    const env = () =>
      JSON.stringify({
        "other-school": { clever: CLEVER_LINK },
      });
    const fetcher = vi.fn();
    const handler = rosterHandler(() => fakeDb(), withCreds(env), fetcher);
    const status = await handler(
      req({ schoolId: "fixture-school", action: "status" }),
    );
    expect(await status.json()).toEqual({
      clever: "not_connected",
      classlink: "not_connected",
    });
    const preview = await handler(
      req({
        schoolId: "fixture-school",
        action: "preview",
        provider: "clever",
        providerClassId: "class",
      }),
    );
    expect(preview.status).toBe(409);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("reports configuration separately from a verified provider connection and returns no secrets", async () => {
    const env = () =>
      JSON.stringify({
        "fixture-school": { clever: CLEVER_LINK },
      });
    const handler = rosterHandler(() => fakeDb(), withCreds(env));
    const response = await handler(
      req({ schoolId: "fixture-school", action: "status" }),
    );
    expect(await response.json()).toEqual({
      clever: "configured",
      classlink: "not_connected",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("a link without the app's developer credentials stays not connected", async () => {
    const env = (key: string) =>
      key === "INSTITUTION_ROSTER_CONNECTIONS" ? JSON.stringify({ "fixture-school": { clever: CLEVER_LINK } }) : undefined;
    const response = await rosterHandler(() => fakeDb(), env)(req({ schoolId: "fixture-school", action: "status" }));
    expect(await response.json()).toEqual({ clever: "not_connected", classlink: "not_connected" });
  });
  it("a malformed links secret reads as not connected instead of failing every school", async () => {
    const response = await rosterHandler(() => fakeDb(), withCreds(() => "{not json"))(req({ schoolId: "fixture-school", action: "status" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ clever: "not_connected", classlink: "not_connected" });
  });
  it("lists classes for a school admin and never for a teacher", async () => {
    const env = withCreds(() => JSON.stringify({ "fixture-school": { clever: CLEVER_LINK } }));
    const fetcher = cleverRoutes({ "/v3.0/schools/school-1/sections": [json({ data: [{ data: { id: "sec-1", name: "Room 1" } }] })] });
    const body = { schoolId: "fixture-school", action: "classes", provider: "clever" };
    expect((await rosterHandler(() => fakeDb("teacher"), env, fetcher)(req(body))).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
    const ok = await rosterHandler(() => fakeDb(), env, fetcher)(req(body));
    expect(await ok.json()).toEqual({ classes: [{ id: "sec-1", name: "Room 1" }] });
  });
});
function withCreds(links: (key: string) => string | undefined) {
  const secrets: Record<string, string> = {
    CLEVER_CLIENT_ID: "fixture-client",
    CLEVER_CLIENT_SECRET: "fixture-secret",
    CLASSLINK_ONEROSTER_TOKEN: "fixture-classlink",
  };
  return (key: string) => (key === "INSTITUTION_ROSTER_CONNECTIONS" ? links(key) : secrets[key]);
}
