// The one way a function starts (replaces std's serve and a bare Deno.serve): every response
// leaves through withAllowedOrigin, so only our own sites may call a function from a browser.
// Kept apart from ./allowedOrigin.ts so the rules stay pure and the app's tests can import them.
import { type Handler, withAllowedOrigin } from "./allowedOrigin.ts";

export function serve(handler: Handler<Deno.ServeHandlerInfo>): void {
  Deno.serve(withAllowedOrigin(handler));
}
