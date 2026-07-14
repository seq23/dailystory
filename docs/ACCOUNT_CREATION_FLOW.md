# Account Creation Flow (Premium Sign-Up)

_Last updated: June 10, 2026_

> **July 2026 update:** After sign-in, the story-setup screen (Step 3 —
> Personalization) now includes a **Guided Mode** toggle that replaces the
> free-text theme/character/vocabulary inputs with tap-to-pick chips. It
> defaults ON for PreK/K/1st grade and is fully opt-in for older grades.
> See `docs/IMPLEMENTATION_CHANGELOG.md` (2026-07-14 entry) and
> `/mnt/documents/Time2Read_Guided_Mode_OnePager.md` for details.

## Overview
The premium sign-up experience in `src/components/LoginScreen.tsx` uses a **two-step wizard**
to make account creation and discount-code entry intuitive for all users, including
non-native English speakers and international audiences.

## Steps

### Step 1 — Create your account
- Display name, email, password
- COPPA `AgeGate` (under-13 + parent/guardian email)
- "Continue" button runs `validateStep1()` (same required-field + COPPA checks as the
  final `handleSignUp` guard) before advancing.

### Step 2 — Choose how to start
- **Discount code field is always visible** (no longer hidden behind a toggle), with live
  validation via the `validate-discount-code` edge function.
- If a **valid** code is entered:
  - A green "No Payment Required" panel shows.
  - Single CTA: **Create Free Account** → `handleSignUp()` (applies the code via
    `apply-discount-code` on the new session).
- If **no/invalid** code:
  - Monthly/annual plan cards show.
  - Single CTA: **Create Account & Pay** → `handleCreateAndPay()` which calls
    `handleSignUp()` then `handleStartPayment()` (Stripe checkout).
- "Back" returns to Step 1 with all entered data preserved (state is component-level).

## Key implementation notes
- `signupStep` (`1 | 2`) local state drives the wizard.
- `handleSignUp` returns a `boolean` so the paid path can chain into payment in one click.
- The **sign-in tab is unchanged**.
- Props contract (`userInfo`, `onBack`) is unchanged — callers `GuestExperience.tsx` and
  `src/pages/Auth.tsx` are unaffected.
- Backend, edge functions, and the database were **not** modified.

## Why
International users (e.g. from Pakistan) could not find the discount field or understand
the previous single-screen form with two competing primary buttons. The stepped flow plus
always-visible discount code resolves this.
