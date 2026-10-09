// Pure rules for the free-story paywall (no imports, so vitest can load it).
// Used by _shared/freeStoryAllowance.ts; pinned by src/test/guards/free-story-paywall.test.ts.
export const FREE_STORY_LIMIT = 3;
export const FREE_LIMIT_CODE = "FREE_LIMIT_REACHED";

// Requests that work on an existing story (hints, repairs, rewrites) are never a new story.
const NON_STORY_SESSION_TYPES = new Set(["repair", "live", "netflix", "guest", "rewrite", "hint", "continuation"]);

export function isNewStoryRequest(body: any): boolean {
  const config = body?.config ?? {};
  const pageNumber = Number(config.pageNumber ?? body?.pageNumber ?? 1);
  const sessionType = String(config.sessionType ?? "");
  if (pageNumber !== 1) return false;
  if (config.existingStory) return false;
  return !NON_STORY_SESSION_TYPES.has(sessionType);
}
