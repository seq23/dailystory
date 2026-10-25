# Time2Read pricing

Decided by Sequoia, 25 Oct 2026. This file is read by code:
`src/test/guards/pricing-doc.test.ts` parses the block below and fails if
`supabase/functions/create-checkout/index.ts`, `src/lib/freeStoryAllowance.ts`
(`PLAN_PRICES`, used by PricingSection and StoryPaywall), PremiumUpgrade,
SubscriptionManager, the locale files or `public/llms.txt` say anything else,
or if `src/config/ttsConfig.ts` gives a tier a different voice than `free_voice` /
`premium_voice` below. Change the price here and in those places in the same PR.

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
free_voice: browser
premium_voice: elevenlabs
premium_fallback: browser
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

## Narration: who hears which voice

- **Free and guest readers hear the browser voice** (the device's own speechSynthesis): **$0**,
  for story pages, word help and coaching alike. `GUEST_TTS_PROVIDER: 'browser'`.
- **Premium readers hear Charlotte** (ElevenLabs Flash v2.5). "Premium" here is the paid
  status (a subscription or an active override, from `subscribers`), set in
  `AuthenticatedApp`; a signed-in account on its 3 free stories is not premium for the voice.
- **Premium narration is capped by her ElevenLabs credit balance.** The account is on the
  Free plan with pay-as-you-go credits (23,736 credits, 0 used this cycle on 25 Oct 2026).
  When the credits run out, ElevenLabs refuses (out of credits or quota, 401/402/429), and so
  does a slow answer (the function gives up after 12s). **The page is then read once in the
  browser voice**, after Charlotte is silenced: never silence, never two voices at once.
  One code path does this for every voice entry point: `src/services/narrationRouter.ts`.
- **Each fallback is counted.** The function writes a zero-cost `cost_tracking` row
  (`operation_type 'tts_refused'`, reason in `api_endpoint`); the browser keeps
  `t2r_narration_fallbacks` and fires `audio:fallback`. The weekly
  `.github/workflows/tts-usage-report.yml` prints the refusal count, the characters
  generated, and the credits the deployed key's account reports.
- **Caches still apply first:** a persistent `tts-cache` in Supabase storage, then an
  in-memory last-known-good cache; at most 4,000 characters per request.

## What a story costs us

**The real narration cost is the ElevenLabs credits she buys, not a per-story list price.**
Spend cannot run past the balance: when it is used up, premium readers get the browser
voice until she adds credits.

Measured from `cost_tracking` on 25 Oct 2026 (all time, the numbers `get-cost-analytics`
reads):

| | Measured |
|---|---|
| Stories generated | 307 |
| All logged AI cost, every provider (at list rates) | $14.20, so **about $0.05 a story** |
| ElevenLabs calls / characters | 1,652 calls, 57,334 characters (about 35 characters a call: mostly words and short lines) |
| Sessions that used ElevenLabs | 18, so **about 3,200 characters a narrated session** |
| Last ElevenLabs generation | 22 Jun 2026; **0 characters this month** |
| ElevenLabs refusals logged | 0 (counted from 25 Oct 2026) |

- **Without narration a story costs about $0.02** (gpt-4o-mini text about $0.005,
  Runware illustrations at $0.0013 an image about $0.016 for 12 pages).
- **What the credits buy:** at the measured ~3,200 characters a narrated session, 23,736
  credits cover about 7 narrated sessions at 1 credit a character, or about 15 if Flash v2.5
  bills half a credit a character. SUSPECTED: the per-character credit rate of her plan is
  not measured; the usage report's `character_count` against `character_limit` settles it.
- The logged `cost` for ElevenLabs uses a list rate ($0.11 per 1K characters now, higher in
  older rows). It is a ceiling for comparison, not what she paid.
- Before the next price change, re-read the usage report. If narrated premium use grows
  past the credits she wants to buy, the levers are a monthly narration allowance or a
  larger credit purchase; free readers already cost nothing to narrate.
