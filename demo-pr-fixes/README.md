# Wraith demo — PR 224 and PR 238 fixes

Fixes for the two open pull requests in `wraith-protocol/demo`:

- PR 224 — https://github.com/wraith-protocol/demo/pull/224 (`ci: run full unit test suite in demo workflow`)
- PR 238 — https://github.com/wraith-protocol/demo/pull/238 (`feat(auction): encrypt Wraith Names auction recovery secrets`)

Nothing has been merged. These branches and patches are the finished work, ready
to be pushed to the fork that both PRs point at (`Adedoyinjr/demo`).

## Why the branches live here

The token available in this session is a GitHub App installation limited to
`Adedoyinjr/www`, so pushes to `Adedoyinjr/demo` and `wraith-protocol/demo` are
rejected (`403 Permission to ... denied to kilo-code-bot[bot]`). The fixed
branches were therefore pushed to the writable fork, and the same commits are
also available as patches in this folder.

Branches in `Adedoyinjr/www` (both contain the Wraith demo app tree):

- `kilo/wraith-demo-pr224-fix` — PR 224, fixed
- `kilo/wraith-demo-pr238-cleanup` — PR 238, cleaned up

## PR 224 — CI green

Problems found:

1. The branch (`Adedoyinjr/demo:develop`) was based on a stale commit and
   conflicted with `wraith-protocol/demo:develop` (`mergeable_state: dirty`).
2. The `unit-tests` job added by this PR failed on
   `src/workers/stellar-scanner.worker.test.ts`:
   `TypeError: window.addEventListener is not a function` — the pre-encryption
   `nameWatchlistStore` registered a `storage` listener at module scope while the
   test stubbed `window` without `addEventListener`.

Fixes:

- Merged `wraith-protocol/demo:develop` into the branch. The only conflict was
  `.github/workflows/ci.yml`; the resolution keeps this PR's `unit-tests` job
  *and* the `pnpm build:budget-check` / `pnpm audit:gate` steps that landed on
  develop (see `ci.yml` in this folder).
- The upstream fix for the `window.addEventListener` failure
  (`fix: lifecycle-manage name auction storage sync to prevent test failures`,
  #227) came in with the merge.
- The 1,000-event pagination test is CPU-bound and exceeded Vitest's 5 s
  default when the whole suite ran in parallel (8.4 s observed), so it now gets
  an explicit 30 s timeout.

Branch contents (2 commits on top of `wraith-protocol/demo:develop`):

- `88c3b58` `chore(ci): merge develop into PR branch`
- `dff569a` `test(scanner): raise timeout for 1,000-event pagination test`

The original branch commits (`eea30bb` ci: add unit-test job to CI workflow,
`d15e417` test: remove intentional failing test for CI verification) are kept in
the history — the merge does not rewrite them.

Verified locally against the merged tree: `pnpm install --frozen-lockfile`,
`pnpm format:check`, `pnpm build`, `pnpm build:budget-check`, `pnpm audit:gate`
and `pnpm test:unit` (39 files, 430 tests) all pass.

## PR 238 — cleaned up

Problems found:

1. The branch (`Adedoyinjr/demo:kilo/autumn-tower-oc3`) conflicted with
   develop in six files (`.github/workflows/ci.yml`, `src/App.tsx`,
   `src/lib/stellar/names.ts`, `src/pages/NamesAuctions.tsx`,
   `src/store/nameWatchlistStore.tsx`, `src/store/nameWatchlistStore.test.ts`).
2. Two of its three commits were named `wip`.
3. It carried a copy of the CI workflow change from PR 224 and the
   pre-`#164` versions of `src/App.tsx`, `src/lib/stellar/names.ts` and
   `src/pages/Names.tsx`, so it would have reverted develop's work.
4. It dropped the storage hardening and cross-tab sync that landed on develop
   after the branch was cut (`#193` versioned storage, `#196`/`#227` storage
   sync lifecycle) and used the `NAMES_CONTRACT_ID` constant that `#239`
   replaced.

Clean-up:

- Rebuilt on `wraith-protocol/demo:develop` (`bd32c10`) as a single
  conventional commit, `559d8da`
  `feat(auction): encrypt name auction bid recovery material`.
- Kept upstream's files where the PR did not change anything: `src/App.tsx`
  (the `/names/auctions` route already exists upstream), `src/lib/stellar/names.ts`
  and `src/pages/Names.tsx` (identical to upstream `#164`).
- Re-integrated upstream's storage work into the encrypted store: watched
  auctions are validated and bounded, oversized payloads are discarded, the
  `initNameWatchlistSync` / `cleanupNameWatchlistSync` lifecycle that
  `src/App.tsx` imports is preserved (the storage event now refreshes the
  watchlist and, while unlocked, re-reads the vault), and the legacy plaintext
  formats — the zustand-persist shape *and* the versioned-value shape — are
  detected as legacy and migrated into the encrypted vault.
- Applied upstream's `#239` contract-id lookup to the auctions page
  (`tryGetStellarContractId('names')`).
- Dropped the duplicated CI workflow change (it belongs to PR 224) but kept the
  scanner-test timeout so the branch is green on its own; drop that hunk if
  PR 224 lands first.
- Added regression tests for the recovered upstream behaviour: legacy
  versioned-plaintext detection, corrupt and unknown-version payloads, invalid
  watched-auction entries, and the cross-tab sync.

Verified locally: `pnpm install --frozen-lockfile`, `pnpm format:check`,
`pnpm build`, `pnpm build:budget-check`, `pnpm audit:gate` and `pnpm test:unit`
(40 files, 467 tests) all pass.

## Verification status (re-checked against live GitHub)

Verified facts:

- PR 224 and PR 238 on `wraith-protocol/demo` are **unchanged**. Their head
  commits are still `ce8c961` and `edf94da`, both still `mergeable_state:
  dirty`, PR 224's `unit-tests` check still reports `failure`, and PR 238 has no
  checks at all. Neither PR is fixed on GitHub; the work exists only on the
  branches below.
- Both fix branches were re-verified in clean worktrees checked out at the
  exact commit SHA that is published, running the full CI job sequence from
  `.github/workflows/ci.yml`:
  - `dff569a` (PR 224): `format:check` pass, `test:unit` 39 files / 430 tests
    pass, `build` (tsc + vite) pass, `build:budget-check` pass, `audit:gate`
    pass.
  - `559d8da` (PR 238): `format:check` pass, `test:unit` 40 files / 467 tests
    pass, `build` pass, `build:budget-check` pass, `audit:gate` pass.
- The PR 224 fix branch keeps develop's `pnpm build:budget-check` and
  `pnpm audit:gate` steps in the `build` job and adds the `unit-tests` job
  alongside them.
- The PR 238 fix branch differs from `wraith-protocol/demo:develop`
  (`bd32c10`) in six files only; every other path is byte-identical to
  develop, and develop's storage validation (`MAX_COLLECTION_ITEMS`,
  `isBoundedString`, `isFiniteTimestamp`, `MAX_STORAGE_BYTES`) and cross-tab
  sync (`initNameWatchlistSync` / `cleanupNameWatchlistSync`, which
  `src/App.tsx` imports) are preserved inside the encrypted store.

Unverified / open points:

- No GitHub check has ever run on the fix commits, because they are not on a
  branch of `wraith-protocol/demo`. The results above are local runs only.
- The reviewer's request for PR 238 was to "drop the inherited #224 commits".
  `kilo/wraith-demo-pr238-cleanup` drops the inherited CI change but keeps the
  scanner-test timeout so the branch is green on its own;
  `kilo/wraith-demo-pr238-cleanup-minimal` (`11f55bd`) drops it as well and
  contains only the auction feature (5 files). On the minimal variant
  `pnpm test:unit` reports 1 failure — the pre-existing
  `stellar-scanner.worker.test.ts` 5 s timeout, which also fails on
  `wraith-protocol/demo:develop` itself (1 failed / 429 passed of 430) and is
  fixed by the PR 224 branch.

## How to land them

Fetch the fixed branches from the writable fork and push them to the demo fork:

```bash
# PR 224 — updates the existing PR head branch (Adedoyinjr/demo:develop)
git clone https://github.com/Adedoyinjr/demo.git demo
cd demo
git remote add fixes https://github.com/Adedoyinjr/www.git
git fetch fixes kilo/wraith-demo-pr224-fix
git push origin fixes/kilo/wraith-demo-pr224-fix:develop
```

```bash
# PR 238 — replaces the PR head branch (Adedoyinjr/demo:kilo/autumn-tower-oc3)
git fetch fixes kilo/wraith-demo-pr238-cleanup
git push --force-with-lease origin \
  fixes/kilo/wraith-demo-pr238-cleanup:kilo/autumn-tower-oc3
```

`--force-with-lease` is required for PR 238 because the branch history was
rebuilt (the `wip` commits were replaced by one conventional commit). If the old
history must be kept, apply `pr-238.patch` to the existing branch instead and
commit it there.

Applying the patches by hand instead:

```bash
git apply pr-224.patch    # on top of wraith-protocol/demo:develop
git apply pr-238.patch    # on top of wraith-protocol/demo:develop
```

`pr-238-commit.patch` is the same change as a ready-to-apply `git am` patch.
