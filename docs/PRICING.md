# Time2Read pricing

Decided by Sequoia, 25 Oct 2026. This file is read by code:
`src/test/guards/pricing-doc.test.ts` parses the block below and fails if
`supabase/functions/create-checkout/index.ts`, `src/lib/freeStoryAllowance.ts`
(`PLAN_PRICES`, used by PricingSection and StoryPaywall), PremiumUpgrade,
SubscriptionManager, the locale files or `public/llms.txt` say anything else.
Change the price here and in those places in the same PR.

```pricing
monthly_cents: 1299
annual_cents: 9900
monthly_label: $12.99
annual_label: $99
annual_savings: $57 (36%)
free_stories: 3
trial_days: 7
code_HOMESCHOOL15_days: 15
previous_monthly_cents: 999
previous_annual_cents: 7900
```

## What a family pays

| | |
|---|---|
| Free | 3 stories in total, no card |
| Premium monthly | **$12.99/month** |
| Premium yearly | **$99/year**: saves $57 (36%) against 12 x $12.99 = $155.88 |
| Trial | 7 days free, card taken up front, one trial per customer (a returning customer pays from day one) |
| Access codes | A code's own trial length replaces the 7 days. `HOMESCHOOL15` = 15 days. Codes live in `public.access_codes`; rules in `supabase/functions/_shared/accessCodeRules.ts` |

- **The amounts are sent inline** from create-checkout (`price_data`, 1299 / 9900 cents).
  Stripe price-id env overrides (`STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`) are not
  read any more, so no stored Stripe Price can quietly win over this file.
  `STRIPE_PRODUCT_ID`, when set, only names the product the inline price hangs off.
- **Existing subscribers keep their price.** Stripe bills a subscription on the Price it was
  created with; nobody was migrated. Before 25 Oct 2026 the price was $9.99/month or $79/year.
  `sync-subscription-status` names the tier by billing interval, so old and new prices both
  show as Monthly/Annual Premium.

## Why $12.99 / $99

Market as of Oct 2026, from comparison sites (re-check before the next change):

| Learn-to-read apps | Monthly | Yearly |
|---|---|---|
| Reading Eggs (reading only) | $9.99 | $69.99 |
| Reading Eggs (reading + math) | $13.99 | $99.99 |
| Homer | – | about $79.99 |
| Hooked on Phonics | – | about $109.99–129.99 |
| Epic! | $13.99 | $84.99 |
| ABCmouse | $14.99 | $45–59.99 |
| Raz-Kids family licence | – | about $120–130 (no official public price) |

| Personalized AI story apps | Yearly |
|---|---|
| Oscar Stories | $39.99 |
| Scarlett Panda | $49 |
| Lullaby.ink | $59.99 |
| BedtimeStory.ai | about $99 |

- **Time2Read is both kinds of product.** It is a leveled learn-to-read tool (Dolch/Fry
  words, quizzes, the 20-minute reading timer, a parent dashboard) and a personalized AI
  story app. So it prices at the top of the learn-to-read band (Reading Eggs reading+math,
  Epic!), not with the cheaper bedtime-story apps.
- **The yearly plan stays about 36% off** (was 34%), so the annual pitch stays strong and
  sits right at the $99.99 of the closest comparable.

## What a story costs us (estimate)

Every story is AI-written, illustrated and can be narrated, so daily use has a real cost.
Unit costs are the ones the code logs to `cost_tracking`:

| Part | Unit cost (source) | Per page (assumed) | Per 12-page story |
|---|---|---|---|
| Text, gpt-4o-mini | $0.15 / $0.60 per 1M tokens in/out (`_shared/costLogger.ts`) | ~1,500 in + 350 out = $0.0004 | ~$0.005 |
| Illustration, Runware | $0.0013 per image (`runware-generate-image`) | 1 image = $0.0013 | ~$0.016 |
| Narration, ElevenLabs Flash v2.5 | $0.11 per 1K characters (`elevenlabs-tts-smart`) | ~330 characters = $0.036 | ~$0.44 |

- **Without narration: about $0.02 a story, about $8 a year** for a child reading one
  story every day. $99 covers it many times over.
- **With every page narrated: about $0.46 a story, about $168 a year** for daily use.
  **That is more than $99/year** (about $95.80 after Stripe's 2.9% + 30c) and more than
  12 months at $12.99 (about $147.80 after fees). Narration is the whole gap; the audio
  cache rarely hits because personalized text seldom repeats.
- The yearly plan breaks even at roughly 7 narrated pages a day on top of the text and
  pictures.
- **Status: SUSPECTED, not measured.** The page count, words per page and the ElevenLabs
  rate (list rate; the plan's real per-character rate may be lower) are assumptions. The
  measured figure is `costPerStory` from the `get-cost-analytics` function (all-time cost
  divided by stories), and `MAINTENANCE_CADENCE.md` alerts above $0.03/$0.05 per call.
  Re-check that number before the next price change; if narrated daily users are common,
  the levers are a narration allowance, the cheaper OpenAI TTS path ($15 per 1M characters,
  about $0.005 a page) as the default voice, or a higher yearly price.
