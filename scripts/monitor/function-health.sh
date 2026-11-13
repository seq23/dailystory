#!/usr/bin/env bash
# Daily health check for deployed edge functions. One script for every monitor
# workflow (monitor-runware-generate, monitor-template-ab, monitor-template-cd,
# monitor-ai-visual), so a fix lands in all of them at once.
#
# Usage: scripts/monitor/function-health.sh FUNCTION [FUNCTION ...]
#
# Why it is shaped this way (13 Nov 2026):
#  - Each function answers GET /health with JSON {"status":"healthy", ...}. The
#    monitors used to probe with HEAD; since the paid-call guard (#150, 3 Nov)
#    runware-generate-image answers HEAD with 401, so the check went red while the
#    function was fine. A health check now means GET + a body that says healthy.
#  - The monitors skipped when a deploy was running, but asked
#    /actions/runs?workflow_id=..., a parameter that endpoint ignores, so ANY run in
#    progress (often the monitor itself) counted as a deploy and the check was
#    silently skipped on most days. The deploy check now asks the workflow's own
#    runs endpoint.
#
# Exit codes:
#   0  every function healthy, or a NAMED STOP (deploy in progress) was printed
#   1  at least one function unhealthy; failed=a,b goes to $GITHUB_OUTPUT
#   2  no functions given: checking nothing is not a pass
set -uo pipefail

BASE_URL="${BASE_URL:-https://cpzeuogomaixamrtnnmj.supabase.co/functions/v1}"
GITHUB_API="${GITHUB_API:-https://api.github.com}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
RETRY_SLEEP="${RETRY_SLEEP:-20}"

if [ "$#" -eq 0 ]; then
  echo "MONITOR_NO_FUNCTIONS: no function names given, nothing would be checked" >&2
  exit 2
fi

if [ -n "${GITHUB_REPOSITORY:-}" ]; then
  runs_json=$(curl -s --max-time 15 \
    -H "Accept: application/vnd.github+json" \
    ${GITHUB_TOKEN:+-H "Authorization: Bearer $GITHUB_TOKEN"} \
    "$GITHUB_API/repos/$GITHUB_REPOSITORY/actions/workflows/deploy-functions.yml/runs?status=in_progress")
  deploying=$(printf '%s' "$runs_json" | jq -r '.total_count // empty' 2>/dev/null)
  if [ -z "$deploying" ]; then
    echo "Deploy check unreadable; checking health anyway."
  elif [ "$deploying" -gt 0 ]; then
    echo "MONITOR_STOP: deploy-functions.yml has $deploying run(s) in progress; health not checked this time (the next scheduled run checks)."
    exit 0
  fi
fi

checked=0
failed=()
for fn in "$@"; do
  checked=$((checked + 1))
  ok=false
  for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
    body_file=$(mktemp)
    code=$(curl -s -o "$body_file" -w '%{http_code}' --max-time 15 "$BASE_URL/$fn/health")
    [ -n "$code" ] || code=000
    status=$(jq -r '.status // empty' "$body_file" 2>/dev/null)
    rm -f "$body_file"
    if [ "$code" = "200" ] && [ "$status" = "healthy" ]; then
      echo "  ✅ $fn healthy (GET /health 200)"
      ok=true
      break
    fi
    echo "  ⚠️  $fn attempt $attempt/$MAX_ATTEMPTS: HTTP $code, status '${status:-none}'"
    [ "$attempt" -lt "$MAX_ATTEMPTS" ] && sleep "$RETRY_SLEEP"
  done
  $ok || failed+=("$fn")
done

list=$(IFS=,; echo "${failed[*]:-}")
[ -n "${GITHUB_OUTPUT:-}" ] && echo "failed=$list" >> "$GITHUB_OUTPUT"
echo "MONITOR_RESULT: checked $checked, healthy $((checked - ${#failed[@]})), failed: ${list:-none}"
[ "${#failed[@]}" -eq 0 ]
