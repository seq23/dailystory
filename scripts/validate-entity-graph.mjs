/**
 * Search Readiness k1/k4: the site's identity lives in ONE src/seo/entity.json, and
 * everything that ships repeats it exactly.
 *
 * A specification no code reads is a wish, so this validator reads the real files:
 *   - src/seo/entity.json          the one definition (name, logo, sameAs, parentOrganization)
 *   - index.html                   the static shell crawlers see without running JavaScript
 *   - src/seo/schema.ts            the module every rendered and prerendered page builds from
 *
 * It fails by name on drift (ENTITY_DRIFT), on a missing parent (NO_PARENT_ORGANIZATION,
 * the k4 rule that a side business names Spry Labs), on an identity that is not usable
 * (ENTITY_INCOMPLETE), and - Rule 0 - on having checked nothing at all (NOTHING_CHECKED).
 *
 * Run: node scripts/validate-entity-graph.mjs
 */
import { readFileSync } from "node:fs";

/** The Spry Labs entity home every side business points parentOrganization at (owner, 30 Oct 2026). */
const SPRY_LABS_ID = "https://billionairehighperformancecoach.com/spry-labs#organization";
const OWN_HOST = "time-2-read.com";

const fails = [];
let checked = 0;
const check = (ok, code, msg) => { checked += 1; if (!ok) fails.push(`${code} ${msg}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const entity = JSON.parse(readFileSync("src/seo/entity.json", "utf8"));

// ── The one definition is itself complete and honest ────────────────────────────
check(typeof entity.name === "string" && entity.name.length > 0, "ENTITY_INCOMPLETE", "entity.json has no name");
check(Array.isArray(entity.sameAs), "ENTITY_INCOMPLETE", "entity.json has no sameAs list");
check(Array.isArray(entity.profiles_pending), "ENTITY_INCOMPLETE", "entity.json has no profiles_pending list (unclaimed profiles park there, never in sameAs)");
check(String(entity.logo ?? "").startsWith(`https://${OWN_HOST}/`), "ENTITY_INCOMPLETE", `entity.json logo is not on ${OWN_HOST}: ${entity.logo ?? "missing"}`);
// sameAs is other people's hosts: the site itself is not "the same as" itself.
for (const u of entity.sameAs ?? []) {
  let host = "";
  try { host = new URL(u).hostname.replace(/^www\./, ""); } catch { /* reported below */ }
  check(Boolean(host), "ENTITY_INCOMPLETE", `entity.json sameAs is not a URL: ${u}`);
  check(host !== OWN_HOST, "ENTITY_INCOMPLETE", `entity.json sameAs points at this site itself: ${u}`);
}

// ── k4: a side business names Spry Labs as its parent ──────────────────────────
check(entity.parentOrganization?.["@id"] === SPRY_LABS_ID, "NO_PARENT_ORGANIZATION",
  `entity.json parentOrganization must be ${SPRY_LABS_ID} (got ${entity.parentOrganization?.["@id"] ?? "none"})`);

// ── The static shell repeats the one definition, field for field ───────────────
const shell = readFileSync("index.html", "utf8");
const blocks = [...shell.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const nodes = blocks.flatMap((b) => b["@graph"] ?? [b]);
const org = nodes.find((n) => /Organization/.test(String(n["@type"])));
check(Boolean(org), "ENTITY_DRIFT", "index.html has no Organization node in its JSON-LD");
if (org) {
  for (const field of ["@id", "name", "alternateName", "legalName", "url", "logo", "sameAs", "parentOrganization"]) {
    check(same(org[field], entity[field]), "ENTITY_DRIFT",
      `index.html Organization ${field} differs from src/seo/entity.json: ${JSON.stringify(org[field])} vs ${JSON.stringify(entity[field])}`);
  }
}

// ── schema.ts derives from the file rather than restating it ───────────────────
const schema = readFileSync("src/seo/schema.ts", "utf8");
check(/import ENTITY from "\.\/entity\.json"/.test(schema), "ENTITY_DRIFT",
  "src/seo/schema.ts does not import ./entity.json, so a second definition can drift from it");
check(/parentOrganization: PARENT_ORGANIZATION/.test(schema), "NO_PARENT_ORGANIZATION",
  "src/seo/schema.ts ORGANIZATION does not carry parentOrganization, so rendered pages would drop the k4 parent");
for (const [name, literal] of [["name", entity.name], ["logo", entity.logo], ["legalName", entity.legalName]]) {
  check(!schema.includes(`"${literal}"`) || name === "name", "ENTITY_DRIFT",
    `src/seo/schema.ts restates the ${name} literal "${literal}" instead of reading entity.json`);
}

// ── Rule 0: no stage may exit 0 having done nothing ───────────────────────────
if (!checked) { console.error("::error::NOTHING_CHECKED validate-entity-graph asserted nothing"); process.exit(1); }
if (fails.length) {
  for (const f of fails) console.error(`::error::${f}`);
  console.error(`\n${fails.length} entity failure(s) over ${checked} checks. Fix src/seo/entity.json first, then make index.html and src/seo/schema.ts repeat it.`);
  process.exit(1);
}
console.log(`entity: ${checked} checks pass — src/seo/entity.json is the one definition, index.html and src/seo/schema.ts agree, parent is Spry Labs`);
