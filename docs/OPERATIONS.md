# Operations notes

Settled facts about how Time2Read runs, moved here from assistant memory on 31 Oct 2026. The long
guide is [`OPERATIONS_GUIDE.md`](OPERATIONS_GUIDE.md).

## Email
- Time2Read has **its own Google Workspace mailbox** on time-2-read.com (the other side businesses
  use shared Cloudflare aliases; this one does not). Every Time2Read contact, support and sender
  address, and any outreach for the brand, goes through that mailbox — never a shared personal
  mailbox and never a Cloudflare alias.
- `privacy@time-2-read.com` on heygetonmylevel's privacy and terms pages is correct; leave it.

## Analytics
- No Cloudflare Web Analytics for time-2-read.com (owner decision, 9 Oct 2026). Search Console is the
  measurement (see CLAUDE.md "Search Console is the truth"); do not add or propose another tracker.

## Parent lifecycle emails
Four emails to the account holder, approved by Sequoia on 1 Nov 2026 (copy word for word in
`supabase/functions/_shared/lifecycleEmail/templates.ts`):

| Email | When | Sent by |
|---|---|---|
| Welcome | A Stripe trial starts | `stripe-webhook` at once; the hourly sweep catches a miss |
| Trial ending | 12–48 h before the trial ends, unless a cancel is scheduled | hourly sweep |
| 3 free stories used | A free account's 3rd finished story (within 3 days) | hourly sweep |
| Come back | 14–21 days after a subscription ends | hourly sweep |

- **Never sent to** a school account or anyone linked to a school child (`institution_ai_lane`,
  fail closed), a test account (flag, reserved domain, `+test`, Stripe test mode), an account that
  unsubscribed, or twice to one account (`lifecycle_email_log`, key `(user_id, email_kind)`).
- **Sweep:** `.github/workflows/lifecycle-emails.yml`, hourly at :23, calls the `lifecycle-emails`
  function with the `LIFECYCLE_CRON_SECRET` header.
- **Kill switch:** `gh workflow run lifecycle-emails.yml -R seq23/dailystory -f action=pause`
  (`-f action=resume` to restart; `-f action=status` to read it). Stored in
  `lifecycle_email_settings`; the webhook's welcome honours it too.
- **Unsubscribe:** `/unsubscribe?t=<token>` (one click) and the `List-Unsubscribe` one-click header,
  both setting `lifecycle_email_prefs.opted_out_at` through the `lifecycle-unsubscribe` function.
- **Secrets:** `LIFECYCLE_MAILING_ADDRESS` (the CAN-SPAM postal address, copied from Boss OS's outreach
  setting; never committed) and `LIFECYCLE_CRON_SECRET` are GitHub repo secrets, copied to the
  project by `sync-edge-secrets.yml`. A missing address is a named stop: nothing is sent.
- **Sender:** `Time-2-Read <hello@time-2-read.com>`, Reply-To `st@time-2-read.com`. Resend refuses
  it until time-2-read.com is verified in the app's Resend team; the sweep reports that as the
  named stop `SENDER_DOMAIN_UNVERIFIED` and retries every hour.
- **Billing links** in the trial-ending email open My Account (`/?billing=keep|yearly|cancel`);
  `customer-portal` takes `{flow: "yearly"}` (switch on the same product, no proration) or
  `{flow: "cancel"}` (Stripe's cancel page).
- **Local test:** the local copy honours `LIFECYCLE_RESEND_BASE` (a capture endpoint) and
  `LIFECYCLE_LOCAL_RECIPIENT` (the only address it will send to); the hosted project ignores both.

## Who can make the site send email
- Every edge function that sends email or spends paid quota checks its caller first; the
  table is in [`supabase/functions/README.md`](../supabase/functions/README.md#caller-checks).
- **Ops reports:** `.github/workflows/ops-reports.yml` runs `traffic-alert` (monthly) and
  `cost-report` (quarterly) with the `OPS_CRON_SECRET` header. The cost report goes to the
  address in the `COST_REPORT_EMAIL` secret (never committed). Both secrets are GitHub repo
  secrets copied to the project by `sync-edge-secrets.yml`. Run one now:
  `gh workflow run ops-reports.yml -R seq23/dailystory -f report=cost-report`.

## Parent incident notice
Privacy.tsx promises "Personal information incidents are logged and parents are notified".
`notify-data-breach` keeps that promise. Owner only (an `ADMIN_USER_IDS` account token or the
service key); anyone else gets 401/403 before the body is read.

- **Who gets it:** the parents of the affected children (`childIds`) and any named accounts
  (`accountIds`), looked up in the database. The address is the account's own sign-in email,
  never a field the request or the account can rewrite. One email per parent, naming only that
  parent's affected children.
- **Dry run first (the default):** returns the counts (`parents`, `recipients`, `noAddress`) and
  the rendered email with a placeholder name. Nothing is sent or logged.
- **Send:** `"mode": "send"`. The incident is logged in `data_breach_log` first (two-year COPPA
  record) and the text is stored as a numbered version in `incident_notice_versions`; each
  parent is claimed in `incident_notices` (per incident, version and parent) before sending.
  At most 40 sends per run: a `202` with `remaining` means run it again.
- **Retries never send twice.** A send the mailer refused (4xx) is `failed`: nothing went out,
  and the next run retries it under a fresh mailer key. A send with no answer (timeout, 5xx, a
  run that died mid-send) is `unsure`: the next run retries it under the same key, so the
  mailer drops a copy that did go out, but only within 23 hours of that key's first use (the
  mailer forgets keys after 24). Past that it is held (`409`, `held`) and never sent by
  itself: look up `incident-<incidentId>` in the Resend log and, for any that did not go out,
  run again with `"resendUnsure": true`.
- **An edited notice is a new version.** Changing the text under the same `incidentId` is
  refused (`409 NEW_VERSION_NOT_CONFIRMED`, nothing sent) until you send it with
  `"newVersion": true`. Parents who had an earlier version get it as "An update to our privacy
  notice"; the record of who got the earlier one is kept. An older text is refused
  (`409 OLDER_VERSION`). The dry run shows the version number, how many get it as an update,
  and the update email. Severity alone is not a new version.
- **Done:** the incident moves to `parents_notified` (and `users_notified_at` is set once) only
  when every affected parent has the latest version. A parent with no address on file keeps it
  `notifying_parents` until reached another way.
- **Stops:** zero reachable parents is `422 NO_RECIPIENTS`; no `RESEND_API_KEY` is a `503`; a
  database read or the incident log failing is a `503` with nothing sent.
  Until time-2-read.com is verified in Resend, every send records `failed` and can be re-run
  once the domain is verified.

```bash
# from a shell where FN_TOKEN holds an admin's access token (never paste it into a file)
curl -sS -X POST "https://<project>.supabase.co/functions/v1/notify-data-breach" \
  -H "Authorization: Bearer $FN_TOKEN" -H "Content-Type: application/json" -d @incident.json
```

`incident.json`: `incidentId` (lowercase, e.g. `2026-11-story-history`), `whenItHappened`,
`whatHappened`, `dataInvolved` (list), `whatWeAreDoing`, optional `whatYouCanDo` and `severity`,
`childIds` and/or `accountIds`, `mode`, and only when needed `newVersion` / `resendUnsure`
(`true`, nothing else).

## Schedule
- Every scheduled job, in Central time, is listed in `docs/SCHEDULE.md` (rebalanced 1 Nov 2026).
