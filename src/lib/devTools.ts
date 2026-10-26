// Developer widgets (system status, test mode, debug monitors) are for us, not for
// families. One rule, read everywhere: they show in a dev build, on localhost, or to
// an account the server marked admin (auth app_metadata.role = "admin", which the
// user cannot set). Pinned by src/test/guards/no-debug-for-families.test.ts.

interface MaybeUser {
  app_metadata?: Record<string, unknown> | null;
}

export function isAdminUser(user: MaybeUser | null | undefined): boolean {
  return user?.app_metadata?.role === "admin";
}

export function devToolsAllowed(user?: MaybeUser | null): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window !== "undefined" && window.location.hostname === "localhost" && import.meta.env.MODE !== "production") return true;
  return isAdminUser(user);
}
