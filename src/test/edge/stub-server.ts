// Stands in for https://deno.land/std/http/server.ts: serve() hands the handler to the harness.
import { edgeState } from "./state";
export function serve(handler: (req: Request) => Response | Promise<Response>): void {
  edgeState().handler = handler;
}
