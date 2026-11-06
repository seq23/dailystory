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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
