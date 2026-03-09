/**
 * Sanitize error messages before returning to clients.
 * Logs full error server-side, returns safe generic message to client.
 */
export function sanitizeError(error: unknown): string {
  // Log full error server-side for debugging
  console.error('Edge function error (internal):', error);

  const msg = error instanceof Error ? error.message : String(error);

  // Map known internal errors to safe messages
  const patterns: [RegExp, string][] = [
    [/postgres|pg_|relation|column|constraint|violates/i, 'A database error occurred'],
    [/supabase/i, 'A service error occurred'],
    [/openai|anthropic|api[_-]?key/i, 'An AI service error occurred'],
    [/runware|elevenlabs|resend/i, 'An external service error occurred'],
    [/timeout|timed?\s*out|ECONNREFUSED/i, 'The request timed out'],
    [/rate.?limit/i, 'Too many requests, please try again later'],
    [/unauthorized|forbidden|auth/i, 'Authentication error'],
  ];

  for (const [pattern, safeMsg] of patterns) {
    if (pattern.test(msg)) return safeMsg;
  }

  return 'An internal error occurred';
}
