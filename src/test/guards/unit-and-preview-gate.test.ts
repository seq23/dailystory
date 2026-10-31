import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
const read = (file: string) => readFileSync(resolve(__dirname, '../../..', file), 'utf8');

describe('unit and preview build gates', () => {
  it('runs all source tests in PRs and main checks with the unit runner', () => {
    const manifest = JSON.parse(read('package.json'));
    expect(manifest.scripts['test:unit']).toBe('vitest run');
    expect(read('.github/workflows/checks.yml')).toContain('run: npm run test:unit');
    expect(read('vitest.config.ts')).toContain("include: ['src/**/*.{test,spec}.{ts,tsx}']");
  });
  it('declares the DOM peer Bun needs and typechecks its frozen install before preview builds', () => {
    expect(JSON.parse(read('package.json')).devDependencies['@testing-library/dom']).toBe('10.4.1');
    const preview = read('.github/workflows/checks.yml').split('  lovable-preview:')[1];
    expect(preview).toContain('bun install --frozen-lockfile');
    expect(preview).toContain('bunx tsc --noEmit -p tsconfig.app.json');
    expect(preview).toContain('bunx tsc --noEmit -p tsconfig.node.json');
    expect(preview).toContain('bun run build:dev');
    expect(read('bun.lock')).toContain('"@testing-library/dom": "10.4.1"');
  });
});
