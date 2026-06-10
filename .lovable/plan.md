## Goal

International users (e.g. Pakistan) cannot figure out how to create an account or where to enter a discount code. Fix by:
1. **Unhiding the discount code field** (no longer collapsed behind a "Have a discount code?" toggle).
2. **Overhauling account creation into an explicit Step 1 / Step 2 wizard** that is dead-simple and intuitive.

Scope is confined to the existing `LoginScreen.tsx` (frontend/presentation only). No backend, edge function, or database changes.

---

## Current State (verified)

`src/components/LoginScreen.tsx` (638 lines) renders a single dense "Create Account" tab containing, top to bottom:
- Two plan cards (monthly/annual)
- Name / email / password fields
- COPPA AgeGate
- A **collapsed** "Have a discount code? ▶" toggle hiding the discount input
- Two separate action buttons: "Create Account" (form submit) **and** a green "Start Payment" button

Problems:
- The discount field is hidden — users never find it.
- Everything is on one screen with two competing primary buttons → confusion about the path to take.
- No guidance about the two distinct journeys: (A) paid signup, (B) discount-code signup.

Discount logic itself works: `validateDiscountCode()` → `validate-discount-code` edge fn; on signup a valid code is applied via `apply-discount-code`. When a code is valid, plan cards + payment button already auto-hide. **This logic stays exactly as-is** — we only restructure presentation around it.

---

## Proposed Design

Convert the **signup tab** into a 2-step wizard (local `signupStep` state, values 1 and 2). The **sign-in tab stays unchanged**.

```text
STEP 1 — "Your details"
  [ Step 1 of 2 ]  progress indicator
  • Display name
  • Email
  • Password
  • COPPA AgeGate (under-13 + parent email)
  → [ Continue ]  (validates required fields before advancing)

STEP 2 — "Choose how to start"
  [ Step 2 of 2 ]  + Back link
  • Discount code field — VISIBLE BY DEFAULT (no toggle), with
    clear label "Have a discount code? Enter it here" + live
    validation tick/spinner/message (reuse existing handler)
  • If code valid → green "No payment required" panel + [ Create Free Account ]
  • If no/!valid code → plan cards (monthly/annual) + [ Create Account & Pay ]
  → on success: existing handleSignUp / handleStartPayment logic
```

Key UX rules:
- Only **one** primary button visible at a time on step 2 (removes the two-competing-buttons problem).
- Progress indicator ("Step 1 of 2") so users know where they are.
- Discount field always rendered on step 2 — fully discoverable.
- "Back" returns to step 1 preserving entered data (state is already lifted to `signUpData`).

---

## Technical Details

- All changes inside `src/components/LoginScreen.tsx`. Add `const [signupStep, setSignupStep] = useState<1|2>(1)`.
- Add a `validateStep1()` guard (name, email, password present; if under-13, valid parent email) before allowing Continue — reuses the same checks currently inside `handleSignUp`, so no logic divergence.
- Remove the `showDiscountSection` collapse behavior; render the discount input unconditionally on step 2. Keep `discountValidation` state and `validateDiscountCode()` untouched.
- Keep `handleSignUp`, `handleSignIn`, `handleStartPayment`, COPPA AgeGate, discount activation, and i18n keys intact.
- Reset `signupStep` to 1 when switching tabs is not required but harmless; will keep it simple.
- Use existing shadcn components and semantic tokens already in the file. No new colors.

### Dependency / downstream check (forward + backward)
- **Callers of LoginScreen**: `GuestExperience.tsx` (login state) and `src/pages/Auth.tsx`. Both only pass `userInfo`/`onBack` props — the public props interface is **unchanged**, so no caller breaks.
- **userInfo pre-fill** (display name) still applies on step 1 — preserved.
- **Discount edge functions** (`validate-discount-code`, `apply-discount-code`): calls unchanged.
- **i18n**: existing keys reused; a few new English-fallback strings added inline via `t(key, "fallback")` so missing translations degrade gracefully (consistent with existing code, e.g. line 333, 504).
- **Tests**: no existing test imports LoginScreen internals (search showed none); props contract preserved.
- **Pricing page / PricingSection**: untouched.

---

## Hostile Review — 15-yr Senior Architect POV

1. **"You're splitting one form into two — does signup state survive navigation?"** Yes. `signUpData`, `isUnder13`, `parentEmail`, and `discountValidation` are component-level state, not per-step. Going Back/Continue does not unmount inputs, so nothing is lost. ✅
2. **"Two competing primary buttons was the real bug. Did you actually fix it or just move it?"** Step 2 renders exactly one primary CTA based on `discountValidation.isValid`. The old simultaneous "Create Account" + "Start Payment" pair is eliminated. ✅
3. **"COPPA gate must not be bypassable by the new step flow."** The under-13 + parent-email validation runs both in `validateStep1()` (to advance) and remains in `handleSignUp()` (final guard). Defense in depth; cannot skip. ✅
4. **"Discount code applied at signup depends on an authenticated session — unchanged?"** Correct, `handleSignUp` still calls `apply-discount-code` with the post-signUp access token. Pure presentation change. ✅
5. **"Does hiding plan cards on step 1 break the `selectedPlan` default?"** `selectedPlan` defaults to `"monthly"` in initial state; cards live on step 2; checkout reads `signUpData.selectedPlan`. No regression. ✅
6. **"RTL / i18n for international users — this is literally the complaint."** Flow uses existing `t()` keys; new strings use inline English fallbacks. The app already supports RTL globally (per project memory); no hardcoded LTR-only layout introduced. ✅
7. **"Accessibility — multiple h1s / focus management."** Existing `sr-only` h1 stays; on step change we keep a single h1. Labels remain associated with inputs via `htmlFor`. ✅
8. **"Could a user reach Stripe checkout without an account?"** No — `handleStartPayment` already requires an active session and errors otherwise; flow unchanged. ✅
9. **"Edge case: valid discount entered, then user clears it on step 2."** `validateDiscountCode("")` resets `isValid=false`, which re-shows plan cards + pay button. Already handled by existing logic. ✅

No backend or schema risk. Blast radius limited to one presentation component with a stable props contract.

---

## New things I plan to ADD (need your permission)
1. Local `signupStep` state + a "Step 1 of 2 / Step 2 of 2" progress indicator UI inside `LoginScreen.tsx`.
2. A "Continue" and "Back" button to move between the two steps.
3. A `validateStep1()` helper (reuses existing field checks; no new validation rules).
4. A small set of inline English fallback strings for the new step labels (e.g. "Step 1 of 2", "Continue", "Choose how to start").

## Things I plan to REMOVE / CHANGE (need your permission)
1. Remove the collapsible "Have a discount code? ▶" toggle and its `showDiscountSection` show/hide behavior — the discount input becomes always-visible on step 2. (The `showDiscountSection` field in `discountValidation` state would become unused and be deleted.)
2. Remove the side-by-side placement of the two action buttons; replace with a single context-aware CTA per step.

## Final step
- Update documentation (`docs/` — likely a short note in the auth/onboarding doc or a new `docs/ACCOUNT_CREATION_FLOW.md`) describing the new 2-step flow, as the last step of implementation.

No backend, edge function, or DB changes. Awaiting your approval on the ADD and REMOVE lists before I implement.