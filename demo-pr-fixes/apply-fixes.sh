#!/usr/bin/env bash
# Apply the prepared Wraith demo PR #224 / PR #238 fixes with your own
# GitHub account. Nothing is merged, no branch is overwritten, and upstream
# develop is never touched.
#
# Usage:  ./apply-fixes.sh [--retarget]
#         ./apply-fixes.sh --retarget   # also re-point PR 238 at the new branch
#
# Requires: an account with push access to Adedoyinjr/demo
#           (and, for --retarget, write access to the wraith-protocol/demo PRs)
set -euo pipefail

REPO_FORK="Adedoyinjr/demo"
REPO_UPSTREAM="wraith-protocol/demo"
PR224_HEAD_EXPECTED="ce8c961b3917b2f1718b485eb28ecf7d8f8787fc"
PR224_FIX="dff569a2a168919e64d74985f48311a1e4c8dfa0"
PR238_HEAD_EXPECTED="edf94da9ed6a871719b6e53df482d8efe3b7f8bb"
PR238_FIX="559d8da5ec611c71edd9cafb54ca6e40dbebf5ca"
PR238_NEW_BRANCH="kilo/autumn-tower-oc3-clean"
DO_RETARGET=0
[ "${1:-}" = "--retarget" ] && DO_RETARGET=1

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

say "0. Authentication"
if [ -n "${GH_TOKEN:-}" ]; then
  echo "   using GH_TOKEN from the environment"
else
  gh auth status || die "not authenticated - run: gh auth login && gh auth setup-git"
fi
echo "   account: $(gh api user -q .login 2>/dev/null || echo 'unknown')"

WORK="${WORK:-$(mktemp -d)}"
say "1. Staging clone of $REPO_FORK (clean remote URL, no token in it)"
git clone --quiet "https://github.com/$REPO_FORK.git" "$WORK/demo"
cd "$WORK/demo"
git fetch --quiet https://github.com/Adedoyinjr/www.git \
  "refs/heads/kilo/wraith-demo-pr224-fix:refs/handoff/pr224-fix" \
  "refs/heads/kilo/wraith-demo-pr238-cleanup:refs/handoff/pr238-cleanup" \
  "refs/heads/kilo/wraith-demo-pr238-cleanup-minimal:refs/handoff/pr238-cleanup-minimal"

say "2. Pre-flight checks"
cur224=$(git rev-parse origin/develop)
cur238=$(git rev-parse "origin/kilo/autumn-tower-oc3")
echo "   PR 224 head now : $cur224   (expected $PR224_HEAD_EXPECTED)"
echo "   PR 238 head now : $cur238   (expected $PR238_HEAD_EXPECTED)"
[ "$cur224" = "$PR224_HEAD_EXPECTED" ] || die "PR 224 head moved since preparation - re-check before pushing"
[ "$cur238" = "$PR238_HEAD_EXPECTED" ] || die "PR 238 head moved since preparation - re-check before pushing"
git merge-base --is-ancestor "$cur224" "$PR224_FIX" || die "PR 224 update is not a fast-forward - refusing"
[ "$(git ls-remote --heads origin "refs/heads/$PR238_NEW_BRANCH" | wc -l)" = "0" ] \
  || die "$PR238_NEW_BRANCH already exists - refusing to overwrite it"
git cat-file -e "$PR224_FIX^{commit}" && git cat-file -e "$PR238_FIX^{commit}"
echo "   PR 224 update is a FAST-FORWARD (no --force, no history rewrite)"
echo "   PR 238 update creates a NEW branch; $PR238_NEW_BRANCH does not exist yet"
echo "   dry runs:"
git push --dry-run origin "$PR224_FIX:refs/heads/develop" 2>&1 | sed 's/^/     /'
git push --dry-run origin "$PR238_FIX:refs/heads/$PR238_NEW_BRANCH" 2>&1 | sed 's/^/     /'

say "3. Push PR 224 head (fast-forward of the fork's develop = the PR head branch)"
git push origin "$PR224_FIX:refs/heads/develop"

say "4. Push PR 238 cleaned commit to a new branch (old branch left intact)"
git push origin "$PR238_FIX:refs/heads/$PR238_NEW_BRANCH"

if [ "$DO_RETARGET" = "1" ]; then
  say "5. Re-point PR 238 at the new branch (no branch is deleted, no new PR)"
  gh api -X PATCH "repos/$REPO_UPSTREAM/pulls/238" -f "head=$PR238_NEW_BRANCH" \
    -q '"   PR 238 head is now \(.head.sha) on \(.head.ref)"'
else
  say "5. Skipped: re-point PR 238 manually when you have write access to the PR"
  echo "   gh api -X PATCH repos/$REPO_UPSTREAM/pulls/238 -f head=$PR238_NEW_BRANCH"
fi

say "6. Verification (live GitHub state)"
for n in 224 238; do
  gh api "repos/$REPO_UPSTREAM/pulls/$n" \
    -q '"   PR#\(.number)  head=\(.head.sha[0:7]) (\(.head.ref))  mergeable=\(.mergeable)/\(.mergeable_state)  files=\(.changed_files) +/\(.additions)/-\(.deletions)"'
  sha=$(gh api "repos/$REPO_UPSTREAM/pulls/$n" -q .head.sha)
  gh api "repos/$REPO_UPSTREAM/commits/$sha/check-runs" \
    -q '.check_runs[] | "        check: \(.name) = \(.conclusion // .status)"' 2>/dev/null || true
  gh api "repos/$REPO_UPSTREAM/pulls/$n/reviews" \
    -q '.[] | "        review: \(.user.login) \(.state) \(.submitted_at)"' 2>/dev/null || true
done
echo
echo "Local results (not GitHub CI): PR 224 -> 39 files / 430 tests green;"
echo "PR 238 -> 40 files / 467 tests green. GitHub checks re-run only after the pushes above."
