import { describe, it, expect } from 'vitest';
import { withTimeout, NetworkTimeoutError } from '@/utils/networkTimeout';

describe('networkTimeout', () => {
  it('resolves when operation completes before timeout', async () => {
    const result = await withTimeout(() => new Promise<number>(res => setTimeout(() => res(42), 20)), { timeout: 100 });
    expect(result).toBe(42);
  });

  it('rejects with NetworkTimeoutError when operation exceeds timeout', async () => {
    await expect(
      withTimeout(() => new Promise(res => setTimeout(() => res('late'), 200)), { timeout: 30 })
    ).rejects.toBeInstanceOf(NetworkTimeoutError);
  });

  it('retries the operation on failure and eventually succeeds', async () => {
    let attempts = 0;
    const result = await withTimeout(
      () => new Promise<string>((res, rej) => {
        attempts++;
        if (attempts < 2) return rej(new Error('fail'));
        res('ok');
      }),
      { timeout: 100, retries: 1, retryDelay: 1 }
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });
});
