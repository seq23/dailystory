/**
 * Shared rate limiter for edge functions.
 * Uses the api_rate_limits table for persistent, cross-instance limiting.
 */

export async function checkRateLimit(
  supabaseClient: any,
  identifier: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  try {
    // Clean old entries and get current count in one flow
    const { data: existing } = await supabaseClient
      .from('api_rate_limits')
      .select('id, request_count, window_start')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      if (existing.request_count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      // Increment
      await supabaseClient
        .from('api_rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);

      return { allowed: true, remaining: maxRequests - existing.request_count - 1 };
    }

    // No existing record — create one
    await supabaseClient
      .from('api_rate_limits')
      .insert({
        identifier,
        endpoint,
        request_count: 1,
        window_start: now.toISOString(),
      });

    return { allowed: true, remaining: maxRequests - 1 };
  } catch (error) {
    // On rate-limit DB failure, allow request (fail open) but log
    console.warn('Rate limit check failed, allowing request:', error);
    return { allowed: true, remaining: maxRequests };
  }
}

/**
 * Extract a client identifier from the request (IP or auth token hash).
 */
export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  // Fallback: hash of user-agent + origin
  const ua = req.headers.get('user-agent') || '';
  const origin = req.headers.get('origin') || '';
  return `anon-${simpleHash(ua + origin)}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
