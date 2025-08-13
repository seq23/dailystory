import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler, ErrorType, handleErrors } from '@/utils/errorHandling';
import { SecurityLogger } from '@/utils/security';

describe('errorHandling', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    logSpy = vi.spyOn(SecurityLogger, 'log').mockImplementation(() => undefined as any);
  });
  afterEach(() => {
    logSpy.mockRestore();
  });

  it('createError returns standardized AppError', () => {
    const err = ErrorHandler.createError(ErrorType.API, 'oops', { code: 500 }, false);
    expect(err).toMatchObject({ type: ErrorType.API, message: 'oops', recoverable: false });
    expect(typeof err.timestamp).toBe('number');
  });

  it('getUserMessage maps types to friendly text', () => {
    const msg = ErrorHandler.getUserMessage({ type: ErrorType.TTS, message: 'x', timestamp: Date.now(), recoverable: true });
    expect(msg.toLowerCase()).toContain('text-to-speech');
  });

  it('withRetry retries failing operation and then resolves', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    const promise = ErrorHandler.withRetry(
      () => new Promise<string>((res, rej) => {
        attempts++;
        if (attempts < 2) return rej(new Error('nope'));
        res('ok');
      }),
      2,
      10
    );
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
    vi.useRealTimers();
  });

  it('handleError increments error stats and logs', () => {
    ErrorHandler.clearErrorCounts();
    ErrorHandler.handleError(new Error('boom'), 'ctx');
    ErrorHandler.handleError(new Error('boom'), 'ctx');
    const stats = ErrorHandler.getErrorStats();
    expect(stats['unknown_ctx']).toBe(2);
    expect(logSpy).toHaveBeenCalled();
  });

  it('handleErrors decorator wraps and rethrows as AppError', async () => {
    class Demo {
      async run() {
        throw new Error('boom');
      }
    }
    const proto: any = Demo.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, 'run')!;
    const wrappedDesc = handleErrors(proto, 'run', desc);
    Object.defineProperty(proto, 'run', wrappedDesc);

    const d = new Demo();
    await expect(d.run()).rejects.toMatchObject({ type: ErrorType.UNKNOWN, message: 'boom' });
  });
});
