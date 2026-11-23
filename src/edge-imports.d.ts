// Edge functions (supabase/functions, Deno) import their libraries by URL. Shared modules the
// tests load are typechecked with the app, so the URLs are declared here; vitest.config.ts
// maps them to stubs (src/test/edge/).
declare module "https://esm.sh/*";
declare module "https://deno.land/*";
