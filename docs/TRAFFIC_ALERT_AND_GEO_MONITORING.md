# Traffic Alert & Geo Monitoring System

**Last Updated:** 2026-04-10  
**Status:** ✅ Fully Operational

## Overview

Automated monthly traffic monitoring that detects anomalies and sends email alerts with cost breakdowns and anonymous geographic data. Designed to be zero-noise: **only sends when something is unusual**.

## Components

### 1. Traffic Alert Edge Function (`traffic-alert`)

**Schedule:** 1st of every month at 9:00 AM UTC via `pg_cron`  
**Email:** `privacy@time2read.com`

#### Alert Triggers (any one triggers an email)
| Trigger | Threshold |
|---------|-----------|
| Daily session average | ≥ 50 |
| Traffic spike | ≥ 3× baseline (prior 30-day window) |
| Traffic drop | ≥ 80% below baseline |
| Estimated AI costs | ≥ $100 cumulative |

#### Email Contents
- **Alert summary** — which triggers fired
- **Session comparison** — current vs baseline 30-day windows with daily averages
- **AI cost breakdown** — by provider (OpenAI, Runware, ElevenLabs, Resend) and by call type (story_generation, image_generation, email_send, etc.)
- **Top 15 locations** — city, state/region, country detail from anonymous geo tracking

### 2. Anonymous Geo Tracking (Zero-PII)

**Table:** `daily_country_stats`  
**Source:** Cloudflare CDN headers (`cf-ipcountry`, `cf-ipregion`, `cf-ipcity`)

- **No IPs stored** — only country, region, city as text
- **Aggregated daily** — e.g., "5 requests from US, California, Los Angeles on Apr 10"
- **Fire-and-forget** — logged non-blocking on every AI story generation call
- **Logged from:** `generate-adaptive-story` edge function

#### Table Schema
| Column | Type | Description |
|--------|------|-------------|
| stat_date | date | Day of the aggregation |
| country | text | Country name from Cloudflare |
| region | text | State/region from Cloudflare |
| city | text | City from Cloudflare |
| request_count | integer | Number of requests for this combo on this day |

### 3. Daily Usage Stats

**Table:** `daily_usage_stats`

Tracks AI call volume by operation type for cost estimation.

| Column | Type | Description |
|--------|------|-------------|
| stat_date | date | Day of the aggregation |
| operation_type | text | e.g., story_generation, image_generation, tts |
| call_count | integer | Number of calls |
| total_input_tokens | integer | Input tokens used |
| total_output_tokens | integer | Output tokens used |
| estimated_cost | numeric | Estimated cost in USD |
| provider | text | e.g., openai, runware, elevenlabs |

### 4. pg_cron Schedule

```sql
-- Runs 1st of every month at 9:00 AM UTC
SELECT cron.schedule(
  'monthly-traffic-alert',
  '0 9 1 * *',
  $$ SELECT net.http_post(...) $$
);
```

## Security & Privacy

- **RLS:** Both tables are service-role-only (no client access)
- **Zero PII:** No IPs, user IDs, or personal data in geo stats
- **Cloudflare headers:** Provided by CDN infrastructure, not collected from users
- **Data retention:** Follow standard cleanup policies

## Testing

Invoke manually to test:
```bash
curl -X POST https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1/traffic-alert \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"time": "manual-test"}'
```

If no thresholds are exceeded, returns `alert_sent: false` with current stats.

## File References

- `supabase/functions/traffic-alert/index.ts` — Alert logic & email builder
- `supabase/functions/generate-adaptive-story/index.ts` — Geo logging (fire-and-forget)
- `supabase/migrations/*_enable_pg_cron.sql` — Extension enablement
- `supabase/migrations/*_schedule_monthly_traffic_alert.sql` — Cron job
