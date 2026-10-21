# Wraith demo — PR #224 handoff

Fix for [PR #224](https://github.com/wraith-protocol/demo/pull/224)
(`ci: run full unit test suite in demo workflow (Closes #209)`) against
[issue #209](https://github.com/wraith-protocol/demo/issues/209).

## State

- PR #224 head branch: `Adedoyinjr/demo:develop` (was `ce8c961`).
- Fixed head: **`5deb332`** on `Adedoyinjr/www:kilo/wraith-demo-pr224-fix-v2`.
  It is a descendant of `ce8c961`, so it can be pushed to the PR head branch
  as a fast-forward — no force-push, no rewritten history.

```
git fetch https://github.com/Adedoyinjr/www.git kilo/wraith-demo-pr224-fix-v2
git push https://github.com/Adedoyinjr/demo.git \
  kilo/wraith-demo-pr224-fix-v2:refs/heads/develop
```

The GitHub App installation in this session is scoped to `Adedoyinjr/www`
only, so the push to `Adedoyinjr/demo` is refused with
`403 Permission to Adedoyinjr/demo.git denied to kilo-code-bot[bot]`.
`pr-224-vs-develop.diff` holds the complete intended change (3 files, 73
lines) if it has to be applied by hand on top of `wraith-protocol/demo:develop`.

## What the fix does

1. `chore(ci): merge upstream develop into the unit-test CI branch` (`e92daec`)
   — merges `wraith-protocol/demo:develop` (`727ed64`) into the PR branch and
   resolves the only conflict, `.github/workflows/ci.yml`: the PR's `unit-tests`
   job is kept and develop's `pnpm build:budget-check` / `pnpm audit:gate`
   steps are kept.
2. `test(scanner): raise the timeout for the 1,000-event pagination test`
   (`af783bd`) — the scanner test decodes a full 1,000-event page, which takes
   about 7s when the whole suite runs in parallel and trips Vitest's default
   5s timeout. The assertions are unchanged; only the per-test budget is
   raised to 30s. The same test fails on `wraith-protocol/demo:develop`
   without this change (4 out of 4 full-suite runs).
3. `ci: upload the unit test report as a run artifact` (`5deb332`) — the
   `unit-tests` job writes a JUnit report and uploads it with
   `actions/upload-artifact`, so a failing assertion can be inspected after the
   run. `reports/` is git-ignored, so no report is committed.

The `nameWatchlistStore` failure the maintainer referred to was the
pre-`#227` storage-sync bug; the upstream fix
(`fix: lifecycle-manage name auction storage sync to prevent test failures`,
#227) arrives with the merge, and `src/store/nameWatchlistStore.test.ts` now
passes.

## Verification (run locally on `5deb332`)

| Check                       | Result                                                         |
| --------------------------- | -------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | PASS                                                     |
| `pnpm format:check`         | PASS                                                          |
| `pnpm build`                | PASS                                                          |
| `pnpm build:budget-check`   | PASS                                                          |
| `pnpm test:unit`            | PASS — 48 files, 477 tests                                     |
| `pnpm audit:gate`           | FAIL — pre-existing, also fails on upstream `develop` (see below) |

`pnpm audit:gate` fails because the npm advisory database now reports three
high findings while `scripts/audit-gate.mjs` allows one. The identical failure
reproduces in a clean worktree of `wraith-protocol/demo:develop` (`727ed64`),
and upstream's own CI run on `develop` (run 39534036176) fails on exactly that
step. It is unrelated to PR #224 and needs a separate dependency-baseline
change on `develop`.

## CI failure detection

The `unit-tests` job runs the suite with a JUnit reporter and attaches the
report to the run. With a deliberate `expect(1 + 1).toBe(3)` added in a
throwaway worktree, the job command exited with code 1 and the report
recorded `tests="478" failures="1"`. The temporary change was removed and was
never pushed.
