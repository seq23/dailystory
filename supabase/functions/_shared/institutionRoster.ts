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
    // A grade we do not offer (TK maps to PreK; 11, 12, ungraded…) is "not
    // recorded": the child is still imported and the preview shows it.
    return {
      external_id: id,
      display_name: name,
      school_grade: rosterGrade(r.school_grade),
      reading_grade: rosterGrade(r.reading_grade),
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

/**
 * A school's ClassLink link. The IDs are not secrets, but only an operator sets them
 * (INSTITUTION_ROSTER_CONNECTIONS, keyed by our school UUID): a school admin who could
 * type them in could read another school's children. applicationId is the tenant's
 * OneRoster application ID; schoolIds are that tenant's school sourcedIds for THIS school.
 * (Clever was removed 22 Nov 2026: paid rostering is out, her ruling.)
 */
export interface ProviderLink {
  applicationId?: string;
  schoolIds?: string[];
}
export interface ProviderClass {
  id: string;
  name: string;
}
export interface ProviderRosterAdapter extends RosterAdapter {
  classes(): Promise<ProviderClass[]>;
}

/** A provider reply we cannot use (down, revoked, garbage). The endpoint answers 502. */
export class RosterProviderError extends Error {}

const CLASSLINK_PROXY = "https://oneroster-proxy.apis.classlink.com";
const MAX_PAGES = 11;

/**
 * A provider's grade (OneRoster codes IT, PR, PK, TK, KG, 01-13, PS, UG, Other) as a
 * Time2Read grade. TK and preschool read as PreK; a grade we do not offer (11, 12,
 * ungraded, post-secondary) is "not recorded", so one child never blocks a class.
 */
export function rosterGrade(raw: unknown): Grade | null {
  const g = normalizeGrade(raw);
  if (g) return g;
  if (typeof raw === "string" && /^(tk|pr|transitional ?k(indergarten)?)$/i.test(raw.trim())) return "PreK";
  return null;
}

/** First name and last initial: the least a teacher needs to tell two children apart. */
function minimalName(given: unknown, family: unknown): string {
  const first = typeof given === "string" ? given.trim() : "";
  const last = typeof family === "string" ? family.trim() : "";
  return [first, last ? `${[...last][0]}.` : ""].filter(Boolean).join(" ");
}

/**
 * ClassLink OAuth2 Proxy: the vendor's Partner Portal bearer and the tenant's
 * application ID; not a LaunchPad login token. The link is school-scoped by the
 * caller; never infer identity from provider data.
 */
export function classlinkRosterAdapter(
  link: ProviderLink = {},
  token: string | undefined,
  request: typeof fetch = fetch,
): ProviderRosterAdapter {
  const schoolIds = Array.isArray(link.schoolIds)
    ? link.schoolIds.filter((id) => typeof id === "string" && id.trim())
    : [];
  const configured = Boolean(schoolIds.length && link.applicationId && token);
  const base = () =>
    `${CLASSLINK_PROXY}/${encodeURIComponent(link.applicationId!)}/ims/oneroster/v1p1`;
  async function get(path: string) {
    let response: Response;
    try {
      response = await request(`${base()}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new RosterProviderError("Roster provider unavailable (no reply). Try again later.");
    }
    // Do not include the response body, roster, URL or credential in errors/logs.
    if (!response.ok)
      throw new RosterProviderError(
        [401, 403].includes(response.status)
          ? "Roster connection not authorized; ask your administrator to reconnect."
          : `Roster provider unavailable (HTTP ${response.status}). Try again later.`,
      );
    try {
      return await response.json();
    } catch {
      throw new RosterProviderError("Roster provider unavailable (unreadable reply). Try again later.");
    }
  }
  function requireConnected(classId?: string) {
    if (!configured)
      throw new Error("Not connected. School administrator configuration is required.");
    if (classId !== undefined && (!classId.trim() || classId.length > 200))
      throw new Error("A provider class ID is required.");
  }

  return {
    status: () => (configured ? "configured" : "not_connected"),
    async classes() {
      requireConnected();
      const found: ProviderClass[] = [];
      for (const school of schoolIds) {
        for (let offset = 0, pages = 0; ; offset += 100, pages++) {
          if (pages >= MAX_PAGES)
            throw new Error("Roster pagination exceeded the import limit.");
          const page = await get(
            `/schools/${encodeURIComponent(school)}/classes?limit=100&offset=${offset}`,
          );
          if (!Array.isArray(page?.classes))
            throw new RosterProviderError("Invalid ClassLink roster response.");
          for (const c of page.classes) {
            if (c?.status === "tobedeleted" || typeof c?.sourcedId !== "string" || !c.sourcedId) continue;
            const name = typeof c.title === "string" && c.title.trim() ? c.title.trim().slice(0, 120) : c.sourcedId;
            found.push({ id: c.sourcedId, name });
            if (found.length > 1000)
              throw new Error("More than 1000 classes; ask your administrator to narrow the school link.");
          }
          if (page.classes.length < 100) break;
        }
      }
      return found.sort((a, b) => a.name.localeCompare(b.name));
    },
    async read(classId) {
      requireConnected(classId);
      // The class must belong to one of THIS school's ClassLink schools.
      const owner = await get(`/classes/${encodeURIComponent(classId)}`);
      const school = owner?.class?.school?.sourcedId;
      if (typeof school !== "string" || !schoolIds.includes(school))
        throw new Error("Roster class is not part of this school.");
      const rows: RosterRow[] = [];
      for (let offset = 0, pages = 0; ; offset += 100, pages++) {
        if (pages >= MAX_PAGES)
          throw new Error("More than 1000 students; split this roster.");
        const page = await get(
          `/classes/${encodeURIComponent(classId)}/students?limit=100&offset=${offset}`,
        );
        if (!Array.isArray(page?.users))
          throw new RosterProviderError("Invalid ClassLink roster response.");
        for (const user of page.users) {
          if (!user?.sourcedId)
            throw new RosterProviderError("Invalid ClassLink student record.");
          if (user.status === "tobedeleted") continue;
          rows.push({
            external_id: `classlink:${user.sourcedId}`,
            display_name: minimalName(user.givenName, user.familyName),
            school_grade: rosterGrade(Array.isArray(user.grades) ? user.grades[0] : null),
            reading_grade: null,
          });
        }
        if (rows.length > 1000)
          throw new Error("More than 1000 students; split this roster.");
        if (page.users.length < 100) break;
      }
      return validateRoster(rows);
    },
  };
}
