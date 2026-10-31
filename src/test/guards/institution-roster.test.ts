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
  it.each(["clever", "classlink"] as const)(
    "missing %s credentials is explicitly disconnected, with no network call",
    async (provider) => {
      const fetcher = vi.fn();
      const adapter = providerRosterAdapter(provider, {}, fetcher);
      expect(adapter.status()).toBe("not_connected");
      await expect(adapter.read("class")).rejects.toThrow("Not connected");
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it("reads paginated Clever v3 section students using an OAuth district bearer; drops extra PII", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        json({
          data: [cleverUser()],
          links: [
            {
              rel: "next",
              uri: "/v3.0/sections/section-a/users?role=student&starting_after=fixture-a",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(json({ data: [cleverUser("fixture-b")] }));
    const rows = await providerRosterAdapter(
      "clever",
      { token: "fixture-token" },
      fetcher,
    ).read("section-a");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      external_id: "clever:fixture-a",
      display_name: "Reader A",
      school_grade: "2",
      reading_grade: null,
    });
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://api.clever.com/v3.0/sections/section-a/users?role=student&limit=100",
    );
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      method: "GET",
      headers: { Authorization: "Bearer fixture-token" },
      redirect: "error",
    });
  });
  it("never sends the Clever token to an untrusted pagination destination", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        json({
          data: [cleverUser()],
          links: [{ rel: "next", uri: "https://invalid.example/v3.0/sections/class/users" }],
        }),
      );
    await expect(
      providerRosterAdapter("clever", { token: "fixture-token" }, fetcher).read(
        "class",
      ),
    ).rejects.toThrow("Invalid roster pagination");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("uses the documented ClassLink OAuth2 Proxy, not a guessed client-credentials endpoint", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        json({
          users: [
            {
              sourcedId: "fixture-a",
              givenName: "Reader",
              familyName: "A",
              grades: ["KG"],
              email: "unused fixture",
              status: "active",
            },
          ],
        }),
      );
    expect(
      await providerRosterAdapter(
        "classlink",
        { token: "fixture-token", applicationId: "fixture-app" },
        fetcher,
      ).read("fixture-class"),
    ).toEqual([
      {
        external_id: "classlink:fixture-a",
        display_name: "Reader A",
        school_grade: "K",
        reading_grade: null,
      },
    ]);
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://oneroster-proxy.apis.classlink.com/fixture-app/ims/oneroster/v1p1/classes/fixture-class/students?limit=100&offset=0",
    );
  });
  it("pages ClassLink results and excludes tombstones", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        json({
          users: Array.from({ length: 100 }, (_, i) => ({
            sourcedId: `fixture-${i}`,
            givenName: "Reader",
            grades: [],
            status: "active",
          })),
        }),
      )
      .mockResolvedValueOnce(
        json({ users: [{ sourcedId: "removed", status: "tobedeleted" }] }),
      );
    const rows = await providerRosterAdapter(
      "classlink",
      { token: "fixture-token", applicationId: "fixture-app" },
      fetcher,
    ).read("class");
    expect(rows).toHaveLength(100);
    expect(fetcher.mock.calls[1][0]).toContain("offset=100");
  });
  it("returns controlled reconnect errors without response content", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(json({ private: "fixture" }, 401));
    await expect(
      providerRosterAdapter("clever", { token: "fixture-token" }, fetcher).read(
        "class",
      ),
    ).rejects.toThrow("not authorized");
  });
});
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
        "other-school": { clever: { token: "fixture-token" } },
      });
    const fetcher = vi.fn();
    const handler = rosterHandler(() => fakeDb(), env, fetcher);
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
        "fixture-school": { clever: { token: "fixture-token" } },
      });
    const handler = rosterHandler(() => fakeDb(), env);
    const response = await handler(
      req({ schoolId: "fixture-school", action: "status" }),
    );
    expect(await response.json()).toEqual({
      clever: "configured",
      classlink: "not_connected",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
