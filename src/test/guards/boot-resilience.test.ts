import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 26 Oct 2026: a family on a Windows PC found every button on time-2-read.com dead. With site
 * storage blocked (cookies blocked, managed PCs, some antivirus) the first localStorage touch threw
 * and the app never started. These pins keep the three defences in index.html, in the right order.
 */
const html = readFileSync(resolve(__dirname, '../../../index.html'), 'utf8');
const at = (needle: string) => html.indexOf(needle);

describe('boot resilience (index.html)', () => {
  it('installs the storage guard before any other script runs', () => {
    const guard = at('__t2r_probe__');
    expect(guard).toBeGreaterThan(-1);
    const firstOtherScript = Math.min(
      ...['clarity', 'type="module"', 'application/ld+json'].map(at).filter((i) => i > -1),
    );
    expect(guard).toBeLessThan(firstOtherScript);
    expect(html).toMatch(/Object\.defineProperty\(window, name, \{ value: memoryStore\(\)/);
  });

  it('shows a reload banner if the app has not started, before the app bundle loads', () => {
    expect(at('id="t2r-boot-banner"')).toBeGreaterThan(-1);
    expect(html).toContain('Something stopped Time-2-Read from loading.');
    expect(html).toMatch(/setTimeout\(function \(\) \{\s*if \(!window\.__t2rBooted\)/);
    expect(at('t2r-boot-banner')).toBeLessThan(at('src="/src/main.tsx"'));
  });

  it('reports start-up failures to client_boot_errors', () => {
    expect(html).toContain('/rest/v1/client_boot_errors');
    expect(html).toMatch(/addEventListener\('unhandledrejection'/);
  });

  it('the app tells the watchdog it started', () => {
    const main = readFileSync(resolve(__dirname, '../../main.tsx'), 'utf8');
    expect(main).toMatch(/__t2rBooted = true/);
  });
});
