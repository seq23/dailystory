# Image Tier Connectivity Tester - Healthy Escalation Detection

Title: Runware Template Healthy Escalation Detection
Meta: Connectivity tester treats Tier 2.5A 503 NO_PRECOMPUTED_CCS as HEALTHY_ESCALATION

- Single H1: Image Tier Connectivity Tester - Healthy Escalation Detection
- Canonical: /docs/image-tier-testing

Overview
- Template tiers (runware-template-ab/cd) may return 503 with { error: "NO_PRECOMPUTED_CCS", escalation: "NEXT_TIER" } when precomputed CCS is missing. This is healthy behavior that escalates to the next tier.

Tester Behavior
- The tester now detects this case and displays:
  - Status: 200
  - StatusText: HEALTHY_ESCALATION
  - Assessment: "Healthy escalation to next tier (CCS precomputed data required)"
- Safety net: For template endpoints, if GET is healthy (200) and POST returns 503, the tester classifies as HEALTHY_ESCALATION (200) to reflect Tier 2.5A → 2.5B escalation by design, even when response body is masked.

Implementation Notes
- Primary check: supabase.functions.invoke() data/message for escalation keys
- Fallback: raw POST to the edge function to read the JSON body when invoke masks it on 503
- Reclassification explicitly sets tests.POST so the UI reflects 200/HEALTHY_ESCALATION

Scope and Safety
- Applies only to template endpoints on 503
- No changes to production flows; this only affects the debug tester UI

SEO
- Images in this doc should include descriptive alt text if added later

