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
## Schedule
- Every scheduled job, in Central time, is listed in `docs/SCHEDULE.md` (rebalanced 1 Nov 2026).
