import type { Plugin } from "vite";

/**
 * Preloads the main self-hosted face (src/fonts.ts): Inter 400 latin, the body copy on every page
 * (index.css sets body to font-body). Without a preload the browser finds the font only after the
 * CSS is parsed, so text paints in the fallback first and then shifts. Headings (Fredoka) come in
 * several weights, so none is preloaded: a preload for a weight a page never uses is wasted.
 * Fails the build if a face is not in the bundle, so a renamed file cannot silently drop it.
 */
export const PRELOADED_FONTS = ["inter-latin-400-normal"];

export function fontPreloadPlugin(): Plugin {
  return {
    name: "t2r-font-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {});
        return PRELOADED_FONTS.map((face) => {
          const file = files.find((f) => f.includes(`${face}-`) && f.endsWith(".woff2")) ?? files.find((f) => f.endsWith(`${face}.woff2`));
          if (!file) throw new Error(`fontPreloadPlugin: ${face}.woff2 is not in the bundle (src/fonts.ts)`);
          return { tag: "link", attrs: { rel: "preload", href: `/${file}`, as: "font", type: "font/woff2", crossorigin: "" }, injectTo: "head-prepend" as const };
        });
      },
    },
  };
}
