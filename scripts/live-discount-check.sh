#!/usr/bin/env bash
# Live discount-code check: one marked TEST redemption through the deployed apply-discount-code
# and activate-discount-code, on production (engineering-check FAIL on #195, 28 Nov 2026).
#
# Why: #195 rewrote the sign-up form's code step (apply-discount-code -> _shared/discountRedeem.ts
# -> public.redeem_discount_code). Tests run that code on stubs; only a call to the live project
# shows the deployed functions, the migration's table and function, and the guess counter work
# together. The deploy workflow runs this after every deploy (job `discount-live-check`), and the
# PR's Outcome reads that job's result on main.
#
# What it touches (everything is marked TEST and removed again, pass or fail):
#   - a TEST account discount-check+<run>@example.test (reserved domain: no mail can reach it),
#     user_metadata.test_account = true; made by the admin API, so no sign-up mail is sent;
#   - a TEST code TESTCHECK<random>, 1 use, 1 day, description "TEST: ...", made for this run only.
#     No real code (SEQUOIA90, BEACON90) is read for a write, used or changed.
#   - Deleting the TEST account removes its subscriber row and redemption row (both
#     ON DELETE CASCADE); then the TEST code is deleted. Either delete failing is a failure.
# No Stripe call is made: a discount code grants Premium with no checkout and no charge.
#
# Needs: SUPABASE_ANON_KEY and SERVICE_KEY (service_role) in the environment.
# Exit 0 only when every answer below was seen; any other answer, a timeout or an outage is exit 1.
set -uo pipefail

BASE="${SUPABASE_BASE:-https://cpzeuogomaixamrtnnmj.supabase.co}"
APPLY_FN="${APPLY_FN:-apply-discount-code}"
ACTIVATE_FN="${ACTIVATE_FN:-activate-discount-code}"
RUN="${GITHUB_RUN_ID:-local$(date +%s)}"
LABEL="${GITHUB_SHA:-local}"
TMP="$(mktemp -d)"

die() { echo "::error::live discount check: $1"; exit 1; }
[ -n "${SUPABASE_ANON_KEY:-}" ] || die "NAMED STOP: SUPABASE_ANON_KEY missing"
[ -n "${SERVICE_KEY:-}" ] || die "NAMED STOP: SERVICE_KEY missing"
command -v jq >/dev/null || die "jq missing"

admin() { curl -sS --max-time 30 -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" "$@"; }

EMAIL="discount-check+${RUN}@example.test"
CODE="TESTCHECK$(od -An -N5 -tx1 /dev/urandom | tr -d ' \n' | tr 'a-f' 'A-F')"
uid=""; code_id=""

cleanup() {
  local rc=$? c
  if [ -n "$uid" ]; then
    c=$(admin -o /dev/null -w "%{http_code}" -X DELETE "$BASE/auth/v1/admin/users/$uid" 2>/dev/null || echo 000)
    if [ "$c" = "200" ]; then echo "TEST account removed"; else echo "::error::the TEST account $EMAIL was not deleted (HTTP $c)"; rc=1; fi
  fi
  if [ -n "$code_id" ]; then
    c=$(admin -o "$TMP/del.json" -w "%{http_code}" -X DELETE -H "Prefer: return=representation" "$BASE/rest/v1/discount_codes?id=eq.$code_id" 2>/dev/null || echo 000)
    if [ "$c" = "200" ] && [ "$(jq 'length' "$TMP/del.json" 2>/dev/null)" = "1" ]; then echo "TEST code removed"; else echo "::error::the TEST code $CODE was not deleted (HTTP $c)"; rc=1; fi
  fi
  rm -rf "$TMP"
  exit "$rc"
}
trap cleanup EXIT

# 1. The TEST code, for this run only.
c=$(admin -o "$TMP/code.json" -w "%{http_code}" -X POST -H "Prefer: return=representation" "$BASE/rest/v1/discount_codes" \
  -d "{\"code\":\"$CODE\",\"description\":\"TEST: automated live check $LABEL, not a real code\",\"duration_days\":1,\"max_uses\":1,\"active\":true}" || echo 000)
code_id=$(jq -r '.[0].id // empty' "$TMP/code.json" 2>/dev/null)
[ "$c" = "201" ] && [ -n "$code_id" ] || die "the TEST code could not be made (HTTP $c): $(head -c 200 "$TMP/code.json")"

# 2. The TEST account and a session for it (admin magic link: no mail is sent).
c=$(admin -o "$TMP/user.json" -w "%{http_code}" -X POST "$BASE/auth/v1/admin/users" \
  -d "{\"email\":\"$EMAIL\",\"email_confirm\":true,\"user_metadata\":{\"test_account\":true,\"display_name\":\"TEST discount check\"}}" || echo 000)
uid=$(jq -r '.id // empty' "$TMP/user.json" 2>/dev/null)
[ "$c" = "200" ] && [ -n "$uid" ] || die "the TEST account could not be made (HTTP $c)"
hash=$(admin -X POST "$BASE/auth/v1/admin/generate_link" -d "{\"type\":\"magiclink\",\"email\":\"$EMAIL\"}" | jq -r '.hashed_token // .properties.hashed_token // empty')
[ -n "$hash" ] || die "no magic link for the TEST account"
TOKEN=$(curl -sS --max-time 30 -X POST "$BASE/auth/v1/verify" -H "apikey: $SUPABASE_ANON_KEY" -H "Content-Type: application/json" \
  -d "{\"type\":\"magiclink\",\"token_hash\":\"$hash\"}" | jq -r '.access_token // empty')
[ -n "$TOKEN" ] || die "no session for the TEST account"
[ -z "${GITHUB_ACTIONS:-}" ] || echo "::add-mask::$TOKEN"

# 3. The calls the sign-up form makes (LoginScreen.tsx: apply-discount-code with the new session).
call() { # function body -> sets status and body file $TMP/r.json
  status=$(curl -sS -o "$TMP/r.json" -w "%{http_code}" --max-time 30 -X POST "$BASE/functions/v1/$1" \
    -H "Origin: https://time-2-read.com" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" -d "$2" 2>/dev/null || echo 000)
}
expect() { # label want-status jq-test
  if [ "$status" = "$2" ] && jq -e "$3" "$TMP/r.json" >/dev/null 2>&1; then echo "ok: $1 ($status)"
  else die "$1: answered $status $(head -c 300 "$TMP/r.json" 2>/dev/null) (want $2 and $3)"; fi
}

call "$APPLY_FN" '{"discountCode":"TESTNOSUCHCODE'"${CODE#TESTCHECK}"'"}'
expect "a wrong code is refused" 400 '.activated == false and .error == "INVALID_DISCOUNT_CODE" and .message == "Invalid discount code"'

call "$APPLY_FN" '{}'
expect "an empty request redeems nothing (no default code)" 400 '.activated == false and .error == "NO_CODE"'

call "$APPLY_FN" "{\"discountCode\":\"$CODE\"}"
expect "the TEST code grants Premium" 200 ".activated == true and .tier == \"Premium\" and .code == \"$CODE\" and .duration_days == 1"

call "$APPLY_FN" "{\"discountCode\":\"$CODE\"}"
expect "the same account cannot redeem again" 200 '.activated == false and .alreadyActivated == true'

call "$ACTIVATE_FN" "{\"discountCode\":\"$CODE\"}"
expect "activate-discount-code shares the once-per-account rule" 200 '.activated == false and .alreadyActivated == true'

# 4. What the migration's table and function wrote, read back with the service role.
c=$(admin -o "$TMP/red.json" -w "%{http_code}" "$BASE/rest/v1/discount_code_redemptions?user_id=eq.$uid&select=code,discount_code_id" || echo 000)
[ "$c" = "200" ] && jq -e --arg code "$CODE" --arg id "$code_id" 'length == 1 and .[0].code == $code and .[0].discount_code_id == $id' "$TMP/red.json" >/dev/null \
  || die "redemption row: HTTP $c $(head -c 200 "$TMP/red.json") (want one row for $CODE)"
echo "ok: one redemption row for the TEST account"
c=$(admin -o "$TMP/sub.json" -w "%{http_code}" "$BASE/rest/v1/subscribers?user_id=eq.$uid&select=subscribed,subscription_tier,discount_activated" || echo 000)
[ "$c" = "200" ] && jq -e 'length == 1 and .[0].subscribed == true and .[0].subscription_tier == "premium" and .[0].discount_activated == true' "$TMP/sub.json" >/dev/null \
  || die "subscriber row: HTTP $c $(head -c 200 "$TMP/sub.json") (want Premium on the TEST account's own row)"
echo "ok: Premium on the TEST account's own subscriber row"
c=$(admin -o "$TMP/uses.json" -w "%{http_code}" "$BASE/rest/v1/discount_codes?id=eq.$code_id&select=current_uses,max_uses" || echo 000)
[ "$c" = "200" ] && jq -e 'length == 1 and .[0].current_uses == 1' "$TMP/uses.json" >/dev/null \
  || die "use count: HTTP $c $(head -c 200 "$TMP/uses.json") (want exactly 1 use taken)"
echo "ok: exactly one use taken from the TEST code"
echo "live discount check: PASS ($CODE on $EMAIL, run $RUN)"
