/**
 * Centralized Session ID Manager - Eliminates collision risks through UUID v4 generation
 */

/**
 * Generate RFC 4122 compliant UUID v4 session ID
 * Replaces all Date.now() patterns to prevent collisions
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Validate session ID format
 * Ensures compatibility across all services
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  
  // Accept UUID v4 format (new standard)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(sessionId)) return true;
  
  // Accept legacy formats during migration
  const legacyPatterns = [
    /^session_\d+_[a-z0-9]+$/,
    /^netflix-.*-story\d+-\d+$/,
    /^live-(first|next|ending)-.*-\d+$/,
    /^premium_\d+$/,
    /^guest_\d+$/,
    /^story_\d+_[a-z0-9]+$/
  ];
  
  return legacyPatterns.some(pattern => pattern.test(sessionId));
}

/**
 * Generate session ID with prefix for debugging
 * Maintains readability while ensuring uniqueness
 */
export function generateSessionIdWithPrefix(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}