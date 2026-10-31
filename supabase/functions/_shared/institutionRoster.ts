// Server/browser-shared roster contract. Network adapters are instantiated only
// server-side; credentials never use VITE_* env or travel to the browser.
import { normalizeGrade, type Grade } from "./grades.ts";
export interface RosterRow {
  external_id: string;
  display_name: string;
  school_grade: Grade | null;
  reading_grade: Grade | null;
}
export interface RosterAdapter {
  status(): "configured" | "not_connected";
  read(input: string): Promise<RosterRow[]>;
}
export function validateRoster(rows: RosterRow[]): RosterRow[] {
  if (!rows.length || rows.length > 1000)
    throw new Error("Import 1–1000 students at a time.");
  const seen = new Set<string>();
  return rows.map((r, index) => {
    const id = typeof r.external_id === "string" ? r.external_id.trim() : "";
    const name =
      typeof r.display_name === "string" ? r.display_name.trim() : "";
    if (!id || id.length > 120 || !name || name.length > 100)
      throw new Error(
        `Row ${index + 2}: roster ID and display name are required (120/100 characters maximum).`,
      );
    if (seen.has(id)) throw new Error(`Row ${index + 2}: duplicate roster ID.`);
    seen.add(id);
    function grade(value: unknown) {
      if (value === "" || value == null) return null;
      const g = normalizeGrade(value);
      if (!g)
        throw new Error(
          `Row ${index + 2}: unsupported grade. Use PreK, K or 1–10.`,
        );
      return g;
    }
    return {
      external_id: id,
      display_name: name,
      school_grade: grade(r.school_grade),
      reading_grade: grade(r.reading_grade),
    };
  });
}

/** Strict CSV with escaped quotes, CRLF, embedded commas/newlines and a UTF-8 BOM. */
export function parseRosterCsv(content: string): RosterRow[] {
  if (content.length > 1_000_000) throw new Error("CSV must be at most 1 MB.");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  let closed = false;
  const input = content.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += ch;
    } else if (ch === "," || ch === "\n" || ch === "\r") {
      row.push(cell);
      cell = "";
      closed = false;
      if (ch !== ",") {
        if (row.some((c) => c.trim())) rows.push(row);
        row = [];
        if (ch === "\r" && input[i + 1] === "\n") i++;
      }
    } else if (ch === '"' && !cell && !closed) quoted = true;
    else {
      if (closed || ch === '"') throw new Error("Malformed CSV quoting.");
      cell += ch;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  const header = rows.shift()?.map((c) => c.trim());
  const allowed = [
    "external_id",
    "display_name",
    "school_grade",
    "reading_grade",
  ];
  if (
    !header ||
    !["external_id", "display_name"].every((c) => header.includes(c)) ||
    new Set(header).size !== header.length ||
    header.some((c) => !allowed.includes(c))
  )
    throw new Error(
      "Use external_id,display_name,school_grade,reading_grade columns only; ID and display name are required.",
    );
  return validateRoster(
    rows.map((r, i) => {
      if (r.length !== header.length)
        throw new Error(`Row ${i + 2}: column count differs from the header.`);
      return Object.fromEntries(
        header.map((k, j) => [k, r[j]]),
      ) as unknown as RosterRow;
    }),
  );
}
export const csvRosterAdapter: RosterAdapter = {
  status: () => "configured",
  read: async (input) => parseRosterCsv(input),
};

export interface ProviderConfig {
  token?: string;
  applicationId?: string;
}
/** Config is school-scoped by the caller; never infer identity from provider data. */
export function providerRosterAdapter(
  provider: "clever" | "classlink",
  config: ProviderConfig = {},
  request: typeof fetch = fetch,
): RosterAdapter {
  const configured = Boolean(
    config.token && (provider === "clever" || config.applicationId),
  );
  async function get(url: string) {
    const response = await request(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
      },
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    // Do not include the response body, roster, URL or credential in errors/logs.
    if (!response.ok)
      throw new Error(
        [401, 403].includes(response.status)
          ? "Roster connection not authorized; ask your administrator to reconnect."
          : `Roster provider unavailable (HTTP ${response.status}). Try again later.`,
      );
    return response.json();
  }
  return {
    status: () => (configured ? "configured" : "not_connected"),
    async read(classId) {
      if (!configured)
        throw new Error(
          "Not connected. School administrator configuration is required.",
        );
      if (!classId.trim() || classId.length > 200)
        throw new Error("A provider class ID is required.");
      const rows: RosterRow[] = [];
      if (provider === "clever") {
        const base = "https://api.clever.com/v3.0";
        let next: string | null =
          `${base}/sections/${encodeURIComponent(classId)}/users?role=student&limit=100`;
        const visited = new Set<string>();
        while (next) {
          if (visited.has(next) || visited.size >= 11)
            throw new Error("Roster pagination exceeded the import limit.");
          visited.add(next);
          const page = await get(next);
          if (!Array.isArray(page.data))
            throw new Error("Invalid Clever roster response.");
          for (const entry of page.data) {
            const user = entry.data;
            if (!user?.roles?.student)
              throw new Error("Invalid Clever student record.");
            rows.push({
              external_id: `clever:${user.id ?? ""}`,
              display_name: [user.name?.first, user.name?.last]
                .filter(Boolean)
                .join(" "),
              school_grade: user.roles.student.grade ?? null,
              reading_grade: null,
            });
            if (!user.id || rows.length > 1000)
              throw new Error("Invalid roster or more than 1000 students.");
          }
          const link = page.links?.find(
            (l: { rel: string }) => l.rel === "next",
          )?.uri;
          if (link) {
            const url = new URL(link, base);
            // Only follow the same class endpoint; never forward credentials to another host.
            if (
              url.origin !== new URL(base).origin ||
              url.pathname !== new URL(next).pathname ||
              url.username ||
              url.password
            )
              throw new Error("Invalid roster pagination link.");
            next = url.href;
          } else next = null;
        }
      } else {
        // ClassLink OAuth2 Proxy; its non-expiring Partner Portal bearer is NOT
        // a LaunchPad login token or generic OneRoster client-credentials token.
        const base = `https://oneroster-proxy.apis.classlink.com/${encodeURIComponent(config.applicationId!)}/ims/oneroster/v1p1/classes/${encodeURIComponent(classId)}/students`;
        for (let offset = 0; ; offset += 100) {
          const page = await get(`${base}?limit=100&offset=${offset}`);
          if (!Array.isArray(page.users))
            throw new Error("Invalid ClassLink roster response.");
          for (const user of page.users) {
            if (!user.sourcedId)
              throw new Error("Invalid ClassLink student record.");
            if (user.status === "tobedeleted") continue;
            rows.push({
              external_id: `classlink:${user.sourcedId}`,
              display_name: [user.givenName, user.familyName]
                .filter(Boolean)
                .join(" "),
              school_grade: user.grades?.[0] ?? null,
              reading_grade: null,
            });
          }
          if (rows.length > 1000 || offset > 1000)
            throw new Error("More than 1000 students; split this roster.");
          if (page.users.length < 100) break;
        }
      }
      return validateRoster(rows);
    },
  };
}
