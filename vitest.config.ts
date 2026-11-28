import path from 'path';
import { defineConfig } from 'vitest/config';

// Node 25+ ships its own global localStorage (Web Storage on by default). In the
// test workers it shadows jsdom's storage with an undefined object, so storage-backed
// tests (reader-transitions) fail locally while CI on Node 20 passes. Turning Node's
// own Web Storage off in the workers makes local runs match CI. Node 20 does not know
// the flag, so it is only passed where Web Storage exists (22+, default-on from 25).
const nodeMajor = Number(process.versions.node.split('.')[0]);
export const workerExecArgv = nodeMajor >= 22 ? ['--no-experimental-webstorage'] : [];

export default defineConfig({
  test: {
    execArgv: workerExecArgv,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 80,
      },
    },
  },
  // Edge functions import their libraries by URL; these map them to the stubs the real-path
  // tests drive (src/test/edge/harness.ts). Only URL imports match, so app code is untouched.
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^https:\/\/esm\.sh\/@supabase\/supabase-js@[^?]*(\?.*)?$/, replacement: path.resolve(__dirname, './src/test/edge/stub-supabase.ts') },
      { find: /^https:\/\/esm\.sh\/stripe@[^?]*(\?.*)?$/, replacement: path.resolve(__dirname, './src/test/edge/stub-stripe.ts') },
      { find: /^https:\/\/deno\.land\/std@[^/]+\/http\/server\.ts$/, replacement: path.resolve(__dirname, './src/test/edge/stub-server.ts') },
      { find: /^https:\/\/deno\.land\/x\/xhr@[^/]+\/mod\.ts$/, replacement: path.resolve(__dirname, './src/test/edge/stub-empty.ts') },
      { find: /^https:\/\/deno\.land\/x\/zod@[^/]+\/mod\.ts$/, replacement: 'zod' },
    ],
  },
});
