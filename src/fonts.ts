// The site's fonts, self-hosted (22 Nov 2026): the same families and weights Google Fonts served,
// bundled by Vite from @fontsource, so no page hands a visitor's IP address to Google.
// Each file sets font-display: swap and splits by unicode-range (a script's file loads only
// when a page uses it). vite-plugins/fontPreloadPlugin.ts preloads Inter 400 latin, the body
// face on every page. Guard: src/test/guards/banned-hosts.test.ts; scripts/banned-hosts.mjs.
// (Schoolbell was also requested from Google but no style uses it, so it is not bundled.)
import "@fontsource/fredoka/300.css";
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "@fontsource/comic-neue/300.css";
import "@fontsource/comic-neue/400.css";
import "@fontsource/comic-neue/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/tajawal/300.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/ma-shan-zheng/400.css";
import "@fontsource/noto-sans-devanagari/300.css";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/500.css";
import "@fontsource/noto-sans-devanagari/700.css";
import "@fontsource/kalam/300.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
