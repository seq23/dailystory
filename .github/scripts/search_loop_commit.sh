#!/usr/bin/env bash
# Commit step for the shared search engine on the default branch.
#
# LIVE  (guides.time-2-read.com answers our IndexNow key file): commit the pages
#       and ledger to main, then start guides-deploy.yml (a GITHUB_TOKEN push does
#       not trigger other workflows, so it is dispatched by name).
# PROOF (the guides host is not live yet): nothing claims to be published. The
#       full run (pages + ledger) is force-pushed to the branch search-loop/proof
#       for review; main keeps only what the finder learned (targets + receipt +
#       weekly report). Prints NAMED STOP [GUIDES_HOST_NOT_LIVE].
# The probe flips this automatically the day the host goes live; no variable to set.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

node scripts/search-loop/claims-gate.mjs

cfg=search-loop.config.json
base_url="$(node -p "require('./$cfg').base_url")"
key="$(node -p "require('./$cfg').indexnow.key")"
ledger="$(node -p "require('./$cfg').ledger_dir || 'data/search-loop'")"
branch="${DEFAULT_BRANCH:-main}"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

push_main() {
  for i in 1 2 3 4 5; do
    git push origin "HEAD:${branch}" && return 0
    git pull --rebase origin "${branch}" || { echo "NAMED STOP [PUSH_CONFLICT] rebase onto ${branch} failed; the next run redoes today's work" >&2; return 9; }
  done
  echo "NAMED STOP [PUSH_FAILED] five push attempts failed" >&2; return 9
}

served="$(curl -fsS --max-time 15 "${base_url}/${key}.txt" 2>/dev/null | tr -d '[:space:]' || true)"
start="$(git rev-parse HEAD)"
git add -A
if git diff --cached --quiet; then echo "search-loop: nothing to commit"; exit 0; fi

if [ "$served" = "$key" ]; then
  git commit -q -m "search-loop: $(date -u +%F) pages and ledger"
  push_main
  gh workflow run guides-deploy.yml --ref "${branch}" || echo "NAMED NOTE [GUIDES_DEPLOY_NOT_DISPATCHED] dispatch failed; guides-deploy.yml also runs on its daily schedule"
  echo "search-loop: LIVE — committed to ${branch}, guides deploy started"
  exit 0
fi

msg="NAMED STOP [GUIDES_HOST_NOT_LIVE] ${base_url}/${key}.txt does not answer the IndexNow key, so nothing is published. Proof run: pages + ledger on branch search-loop/proof; ${branch} keeps the finder's targets only. Needs one DNS record at the registrar (see docs/search/search-loop.md)."
echo "$msg"
[ -n "${GITHUB_STEP_SUMMARY:-}" ] && echo "$msg" >> "$GITHUB_STEP_SUMMARY"
git commit -q -m "search-loop proof: $(date -u +%F) (guides host not live)"
proof="$(git rev-parse HEAD)"
git push -f origin "HEAD:refs/heads/search-loop/proof"
git reset -q --hard "$start"
for f in targets.json discovery-receipt.json search-loop-week.json; do
  git checkout "$proof" -- "${ledger}/${f}" 2>/dev/null || true
done
git add -A "${ledger}" 2>/dev/null || true
if git diff --cached --quiet; then echo "search-loop: proof only, finder ledger unchanged"; exit 0; fi
git commit -q -m "search-loop: $(date -u +%F) finder targets (proof mode)"
push_main
