// Hosts no page, script or stylesheet we ship may name (coordinator, 22 Nov 2026, after the #182
// review): Microsoft Clarity is gone and the fonts are self-hosted, because a child's reading
// screen must not hand the child's IP address to Microsoft or Google. Shared by
// check-prerender.mjs (every file in dist) and check-live-readiness.mjs (the live pages and the
// scripts and styles they load) so the two never drift. Unit test: src/test/guards/banned-hosts.test.ts.
export const BANNED_HOSTS = ["clarity.ms", "fonts.googleapis.com", "fonts.gstatic.com"];

const esc = (h) => h.replace(/\./g, "\\.");
// The host itself or any subdomain of it (www.clarity.ms: the dot before it is not a host letter),
// never a longer host that ends or starts the same way (myclarity.ms, clarity.msn.com).
const BANNED = new RegExp(`(?<![a-z0-9-])(${BANNED_HOSTS.map(esc).join("|")})(?![a-z0-9-]|\\.[a-z])`, "gi");

/** Every banned host the text names, once each, lower-case. */
export function bannedHostsIn(text) {
  return [...new Set([...String(text).matchAll(BANNED)].map((m) => m[1].toLowerCase()))];
}

/** True when bannedHostsIn misses a real reference or flags a host that is not banned. */
export const bannedRuleBroken = () =>
  bannedHostsIn('<script async src="https://www.clarity.ms/tag/abc"></script>').join() !== "clarity.ms"
  || bannedHostsIn('t.src="https://"+"www.clarity.ms/tag/"+i').join() !== "clarity.ms"
  || bannedHostsIn('@import url(https://fonts.googleapis.com/css2?family=Inter);').join() !== "fonts.googleapis.com"
  || bannedHostsIn('src:url(//FONTS.GSTATIC.COM/s/inter/v1.woff2)').join() !== "fonts.gstatic.com"
  || bannedHostsIn('firestore.googleapis.com notfonts.gstatic.community clarity.msn.com myclarity.ms').length !== 0;
