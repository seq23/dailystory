import { describe, it, expect, afterEach } from 'vitest';
import { getSecurityConfig, RECOMMENDED_SECURITY_HEADERS, VALIDATION_RULES } from '@/utils/securityConfig';

const originalEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalEnv;
});

describe('securityConfig', () => {
  it('includes conservative security headers (CSP baseline)', () => {
    const csp = RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(RECOMMENDED_SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
  });

  it('adjusts settings by environment', () => {
    process.env.NODE_ENV = 'development';
    let cfg = getSecurityConfig();
    expect(cfg.API.TIMEOUT).toBe(60000);
    expect(cfg.CONTENT.MAX_INPUT_LENGTH).toBeGreaterThan(5000);

    process.env.NODE_ENV = 'production';
    cfg = getSecurityConfig();
    expect(cfg.API.TIMEOUT).toBe(30000);
    expect(cfg.FEATURES.STRICT_CSP).toBe(true);
  });

  it('validates name pattern from VALIDATION_RULES', () => {
    const nameRule = VALIDATION_RULES.USER_INPUT.NAME;
    expect(nameRule.pattern.test('Avery Jr.')).toBe(true);
    expect(nameRule.pattern.test('Avery123')).toBe(false);
  });
});
