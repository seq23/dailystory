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
//   READ_ALOUD_CHECK_FAILED        voice-to-text could not read a free account's practice count in
//                                  the last 7 days, so a child was told "try again" (cost_tracking
//                                  operation_type 'read_aloud_count_failed');
//   READ_ALOUD_PLAN_UNREADABLE     voice-to-text could not read an account's plan, so a paying family
//                                  may have been held to the free 5 ('read_aloud_plan_unknown').
//
// Usage: node scripts/tts-usage-alert.mjs '<usage json from /usage>' <refusals in the last 7 days> \
//          [<read-aloud count failures, 7 days>] [<read-aloud plan read failures, 7 days>]
// Prints one ::error:: line per reason and exits 1, or one quiet line and exits 0. A named stop only
// the owner can clear (credits unreadable) prints ::warning:: and exits 0 when it is the only reason.

export const LOW_CREDIT_SHARE = 0.2;

/** Exit code for a set of alerts: 1 when anything needs fixing now; 0 when the only reason is a
 *  named stop that the owner alone can clear (shown as a warning, never a red main). Pure. */
export function alertExitCode(alerts) {
  return alerts.some((a) => !a.stop) ? 1 : 0;
}

/** The named reasons narration needs attention. Pure. */
export function ttsAlerts(usage, refusals7d, readAloudCountFailed7d = 0, readAloudPlanUnknown7d = 0) {
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
  const failed = Number(readAloudCountFailed7d) || 0;
  if (failed > 0) out.push({ code: "READ_ALOUD_CHECK_FAILED", text: `${failed} read-aloud practice clip${failed === 1 ? "" : "s"} could not be counted in the last 7 days (read_aloud_practice_hit failed), so a child was told to try again; see the voice-to-text function logs` });
  const unknown = Number(readAloudPlanUnknown7d) || 0;
  if (unknown > 0) out.push({ code: "READ_ALOUD_PLAN_UNREADABLE", text: `${unknown} read-aloud clip${unknown === 1 ? "" : "s"} in the last 7 days came from an account whose plan could not be read, so a paying family may have been held to the free daily number; see the voice-to-text function logs` });
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let usage = null;
  try { usage = JSON.parse(process.argv[2] || "null"); } catch { usage = null; }
  const alerts = ttsAlerts(usage, process.argv[3], process.argv[4], process.argv[5]);
  if (!alerts.length) {
    console.log("narration healthy: credits above 20% of the plan, no browser-voice fallback and no read-aloud count failure in 7 days");
    process.exit(0);
  }
  for (const a of alerts) console.log(`::${a.stop ? "warning" : "error"} title=${a.code}::${a.code}: ${a.text}`);
  process.exit(alertExitCode(alerts));
}
