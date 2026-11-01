#!/usr/bin/env node
// The low-credit alert for .github/workflows/tts-usage-report.yml (owner, 1 Nov 2026).
//
// The report used to run every week and print numbers nobody read: "runs but inert". It now runs
// after each Edge Functions deploy and on dispatch, passes quietly when narration is healthy, and
// FAILS WITH A NAMED REASON when either is true:
//   ELEVENLABS_CREDITS_LOW         the ElevenLabs account has under 20% of its plan's characters left;
//   NARRATION_FELL_BACK            a child was sent to the browser voice by an ElevenLabs refusal in
//                                  the last 7 days (cost_tracking operation_type 'tts_refused');
//   ELEVENLABS_CREDITS_UNREADABLE  the deployed key's account cannot be read, so the credit check
//                                  would otherwise be a silent pass.
//
// Usage: node scripts/tts-usage-alert.mjs '<usage json from /usage>' <refusals in the last 7 days>
// Prints one ::error:: line per reason and exits 1, or one quiet line and exits 0. A named stop only
// the owner can clear (credits unreadable) prints ::warning:: and exits 0 when it is the only reason.

export const LOW_CREDIT_SHARE = 0.2;

/** Exit code for a set of alerts: 1 when anything needs fixing now; 0 when the only reason is a
 *  named stop that the owner alone can clear (shown as a warning, never a red main). Pure. */
export function alertExitCode(alerts) {
  return alerts.some((a) => !a.stop) ? 1 : 0;
}

/** The named reasons narration needs attention. Pure. */
export function ttsAlerts(usage, refusals7d) {
  const out = [];
  const used = Number(usage?.character_count);
  const limit = Number(usage?.character_limit);
  if (!usage || usage.key_present === false || !Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    out.push({ code: "ELEVENLABS_CREDITS_UNREADABLE", text: "the ElevenLabs account behind the deployed key did not report its credits, so a low balance could not be seen (NAMED STOP: only the owner can give that key the User read permission in ElevenLabs; narration itself is unaffected)", stop: true });
  } else {
    const left = Math.max(0, limit - used);
    if (left < limit * LOW_CREDIT_SHARE) {
      out.push({ code: "ELEVENLABS_CREDITS_LOW", text: `${left.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")} characters left (${Math.round((left / limit) * 100)}%, under ${LOW_CREDIT_SHARE * 100}%)${usage.next_reset ? `; the plan resets ${usage.next_reset.slice(0, 10)}` : ""}` });
    }
  }
  const n = Number(refusals7d) || 0;
  if (n > 0) out.push({ code: "NARRATION_FELL_BACK", text: `${n} narration request${n === 1 ? " was" : "s were"} refused by ElevenLabs in the last 7 days, so a child heard the browser voice` });
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let usage = null;
  try { usage = JSON.parse(process.argv[2] || "null"); } catch { usage = null; }
  const alerts = ttsAlerts(usage, process.argv[3]);
  if (!alerts.length) {
    console.log("narration healthy: credits above 20% of the plan and no browser-voice fallback in 7 days");
    process.exit(0);
  }
  for (const a of alerts) console.log(`::${a.stop ? "warning" : "error"} title=${a.code}::${a.code}: ${a.text}`);
  process.exit(alertExitCode(alerts));
}
