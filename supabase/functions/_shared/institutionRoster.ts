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

/**
 * A school's link to its rostering provider. The IDs are not secrets, but only an
 * operator sets them (INSTITUTION_ROSTER_CONNECTIONS, keyed by our school UUID):
 * a school admin who could type them in could read another school's children.
 * - Clever: the district that authorized Time2Read, and the Clever school IDs
 *   that belong to this school (a district token reaches every school in it).
 * - ClassLink: the tenant's OneRoster application ID, and its school sourcedIds.
 */
export interface ProviderLink {
  districtId?: string;
  applicationId?: string;
  schoolIds?: string[];
}
/** App-level credentials from the developer accounts (edge secrets, never VITE_*). */
export interface ProviderCredentials {
  cleverClientId?: string;
  cleverClientSecret?: string;
  classlinkToken?: string;
}
export interface ProviderClass {
  id: string;
  name: string;
}
export interface ProviderRosterAdapter extends RosterAdapter {
  classes(): Promise<ProviderClass[]>;
}

const CLEVER_API = "https://api.clever.com/v3.0";
const CLEVER_TOKENS = "https://clever.com/oauth/tokens";
const CLASSLINK_PROXY = "https://oneroster-proxy.apis.classlink.com";
const MAX_PAGES = 11;

/** Link is school-scoped by the caller; never infer identity from provider data. */
export function providerRosterAdapter(
  provider: "clever" | "classlink",
  link: ProviderLink = {},
  credentials: ProviderCredentials = {},
  request: typeof fetch = fetch,
): ProviderRosterAdapter {
  const schoolIds = Array.isArray(link.schoolIds)
    ? link.schoolIds.filter((id) => typeof id === "string" && id.trim())
    : [];
  const configured = Boolean(
    schoolIds.length &&
      (provider === "clever"
        ? link.districtId &&
          credentials.cleverClientId &&
          credentials.cleverClientSecret
        : link.applicationId && credentials.classlinkToken),
  );
  async function get(url: string, authorization: string) {
    const response = await request(url, {
      method: "GET",
      headers: { Authorization: authorization, Accept: "application/json" },
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
    try {
      return await response.json();
    } catch {
      throw new Error("Roster provider unavailable (unreadable reply). Try again later.");
    }
  }
  let cleverBearer: Promise<string> | null = null;
  /** The district's current token from Clever (it survives token rotation). */
  function cleverToken() {
    cleverBearer ??= (async () => {
      const basic = btoa(
        `${credentials.cleverClientId}:${credentials.cleverClientSecret}`,
      );
      const reply = await get(
        `${CLEVER_TOKENS}?district=${encodeURIComponent(link.districtId!)}`,
        `Basic ${basic}`,
      );
      const tokens = Array.isArray(reply?.data) ? reply.data : [];
      // Only a token Clever says belongs to THIS district; never the first one listed.
      const mine = tokens.filter(
        (t: { owner?: { id?: string }; access_token?: unknown }) =>
          t?.owner?.id === link.districtId &&
          typeof t.access_token === "string" &&
          t.access_token,
      );
      if (mine.length !== 1)
        throw new Error(
          "Roster connection not authorized; ask your administrator to reconnect.",
        );
      return `Bearer ${mine[0].access_token}`;
    })();
    return cleverBearer;
  }
  const classlinkBase = () =>
    `${CLASSLINK_PROXY}/${encodeURIComponent(link.applicationId!)}/ims/oneroster/v1p1`;
  const classlinkAuth = () => `Bearer ${credentials.classlinkToken}`;

  /** Follow Clever "next" links on the same endpoint only; credentials never leave api.clever.com. */
  async function cleverPages(first: string, each: (entry: any) => void) {
    let next: string | null = first;
    const visited = new Set<string>();
    while (next) {
      if (visited.has(next) || visited.size >= MAX_PAGES)
        throw new Error("Roster pagination exceeded the import limit.");
      visited.add(next);
      const page = await get(next, await cleverToken());
      if (!Array.isArray(page?.data))
        throw new Error("Invalid Clever roster response.");
      for (const entry of page.data) each(entry?.data);
      const nextLink = Array.isArray(page.links)
        ? page.links.find((l: { rel: string }) => l?.rel === "next")?.uri
        : undefined;
      if (nextLink) {
        const url = new URL(nextLink, CLEVER_API);
        if (
          url.origin !== new URL(CLEVER_API).origin ||
          url.pathname !== new URL(next).pathname ||
          url.username ||
          url.password
        )
          throw new Error("Invalid roster pagination link.");
        next = url.href;
      } else next = null;
    }
  }
  function requireConnected(classId?: string) {
    if (!configured)
      throw new Error(
        "Not connected. School administrator configuration is required.",
      );
    if (classId !== undefined && (!classId.trim() || classId.length > 200))
      throw new Error("A provider class ID is required.");
  }
  /** The class must belong to one of THIS school's provider schools. */
  async function assertClassInSchool(classId: string) {
    let school: unknown;
    if (provider === "clever") {
      const reply = await get(
        `${CLEVER_API}/sections/${encodeURIComponent(classId)}`,
        await cleverToken(),
      );
      school = reply?.data?.school;
    } else {
      const reply = await get(
        `${classlinkBase()}/classes/${encodeURIComponent(classId)}`,
        classlinkAuth(),
      );
      school = reply?.class?.school?.sourcedId;
    }
    if (typeof school !== "string" || !schoolIds.includes(school))
      throw new Error("Roster class is not part of this school.");
  }

  return {
    status: () => (configured ? "configured" : "not_connected"),
    async classes() {
      requireConnected();
      const found: ProviderClass[] = [];
      const add = (id: unknown, name: unknown) => {
        if (typeof id !== "string" || !id) return;
        found.push({ id, name: typeof name === "string" && name.trim() ? name.trim().slice(0, 120) : id });
        if (found.length > 1000)
          throw new Error("More than 1000 classes; ask your administrator to narrow the school link.");
      };
      for (const school of schoolIds) {
        if (provider === "clever") {
          await cleverPages(
            `${CLEVER_API}/schools/${encodeURIComponent(school)}/sections?limit=100`,
            (section) => add(section?.id, section?.name),
          );
        } else {
          for (let offset = 0, pages = 0; ; offset += 100, pages++) {
            if (pages >= MAX_PAGES)
              throw new Error("Roster pagination exceeded the import limit.");
            const page = await get(
              `${classlinkBase()}/schools/${encodeURIComponent(school)}/classes?limit=100&offset=${offset}`,
              classlinkAuth(),
            );
            if (!Array.isArray(page?.classes))
              throw new Error("Invalid ClassLink roster response.");
            for (const c of page.classes)
              if (c?.status !== "tobedeleted") add(c?.sourcedId, c?.title);
            if (page.classes.length < 100) break;
          }
        }
      }
      return found.sort((a, b) => a.name.localeCompare(b.name));
    },
    async read(classId) {
      requireConnected(classId);
      await assertClassInSchool(classId);
      const rows: RosterRow[] = [];
      if (provider === "clever") {
        await cleverPages(
          `${CLEVER_API}/sections/${encodeURIComponent(classId)}/users?role=student&limit=100`,
          (user) => {
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
          },
        );
      } else {
        // ClassLink OAuth2 Proxy: the vendor's Partner Portal bearer and the tenant's
        // application ID; not a LaunchPad login token or generic client-credentials token.
        const base = `${classlinkBase()}/classes/${encodeURIComponent(classId)}/students`;
        for (let offset = 0; ; offset += 100) {
          const page = await get(`${base}?limit=100&offset=${offset}`, classlinkAuth());
          if (!Array.isArray(page?.users))
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
