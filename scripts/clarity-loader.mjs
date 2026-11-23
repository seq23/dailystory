// e9 (Clarity only on the parent sign-in form), shared by check-prerender.mjs (dist) and
// check-live-readiness.mjs (production) so the two never drift. What LOADS Clarity is a
// script (inline or src) or a src/href; the vendor's name in page text (/subprocessors lists
// "Microsoft Clarity") loads nothing. Probed by clarityRuleBroken so either half is held.
export const loadsClarity = (html) => {
  const code = [...html.matchAll(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>|<[a-z]+\b[^>]*\b(?:src|href)=["'][^"']*["'][^>]*>/gi)];
  return code.some((m) => /clarity\.ms|clarity\.js|\/clarity[-.]|microsoft clarity/i.test(m[0]));
};

/** True when loadsClarity misses a real loader or flags the vendor's name in plain text. */
export const clarityRuleBroken = () =>
  !loadsClarity('<script async src="https://www.clarity.ms/tag/abc"></script>')
  || !loadsClarity('<script>(function(c,l,a,r,i,t,y){t=l.createElement(r);t.src="https://www.clarity.ms/tag/"+i})(window,document,"clarity","script","abc")</script>')
  || !loadsClarity('<link rel="modulepreload" href="/assets/clarity-abc.js">')
  || loadsClarity('<h3>Microsoft Clarity</h3><p>Microsoft Clarity records clicks on clarity.ms</p><a href="https://www.microsoft.com/privacy/privacystatement">Privacy Policy</a>');
