// Network Timeout Utility for API Calls
export class NetworkTimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'NetworkTimeoutError';
  }
}

export interface TimeoutConfig {
  timeout: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Wraps any async function with timeout and retry logic
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  config: TimeoutConfig
): Promise<T> {
  const { timeout, retries = 0, retryDelay = 1000 } = config;
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new NetworkTimeoutError(
              `Operation timed out after ${timeout}ms (attempt ${attempt + 1}/${retries + 1})`,
              timeout
            ));
          }, timeout);
        })
      ]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === retries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError!;
}

/**
 * Creates an AbortController that automatically aborts after timeout
 */
export function createTimeoutController(timeout: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
}

/**
 * Standard timeout configurations for different operation types
 */
export const TIMEOUT_CONFIGS = {
  STORY_GENERATION: { timeout: 60000, retries: 2, retryDelay: 2000 },
  IMAGE_GENERATION: { timeout: 15000, retries: 1, retryDelay: 1000 },
  TTS_REQUEST: { timeout: 10000, retries: 1, retryDelay: 500 },
  API_CALL: { timeout: 8000, retries: 1, retryDelay: 1000 },
  AI_ENHANCEMENT: { timeout: 8000, retries: 1, retryDelay: 1000 }
} as const;