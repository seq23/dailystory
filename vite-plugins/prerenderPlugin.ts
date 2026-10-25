import { spawnSync } from "node:child_process";
import path from "node:path";
import { build, type Plugin, type ResolvedConfig } from "vite";

/**
 * Static HTML for every public marketing page, generated at the end of
 * `vite build`, so it runs inside Lovable's own build/publish (which calls the
 * build, not a custom script). Search and AI crawlers that do not run JavaScript
 * otherwise see an empty <div id="root">. Steps: SSR-build src/prerender/entry.tsx,
 * then run scripts/prerender-run.mjs (jsdom) in a child process that writes
 * dist/index.html and dist/<page>/index.html. Any failure fails the build with a
 * PRERENDER_* error rather than publishing empty pages.
 */
export function prerenderPlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "time2read-prerender",
    apply: "build",
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      if (config.build.ssr || process.env.TIME2READ_PRERENDER_SSR) return;
      const root = config.root;
      const outDir = path.resolve(root, config.build.outDir);
      const ssrOut = path.resolve(root, "node_modules/.cache/time2read-prerender");
      process.env.TIME2READ_PRERENDER_SSR = "1";
      try {
        await build({
          configFile: path.resolve(root, "vite.config.ts"),
          mode: config.mode,
          logLevel: "warn",
          ssr: { noExternal: true },
          build: {
            ssr: path.resolve(root, "src/prerender/entry.tsx"),
            outDir: ssrOut,
            emptyOutDir: true,
            copyPublicDir: false,
            rollupOptions: { output: { entryFileNames: "entry.mjs", inlineDynamicImports: true } },
          },
        });
      } finally {
        delete process.env.TIME2READ_PRERENDER_SSR;
      }
      const res = spawnSync(
        process.execPath,
        [path.resolve(root, "scripts/prerender-run.mjs"), outDir, path.join(ssrOut, "entry.mjs")],
        { cwd: root, stdio: "inherit", timeout: 120_000 },
      );
      if (res.status !== 0) throw new Error(`PRERENDER_FAILED exit=${res.status} signal=${res.signal ?? "none"}`);
    },
  };
}
