import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Generated output must never be tracked: it bloats the repository and can
 * expose stale test artifacts. Playwright reports are uploaded as CI
 * artifacts instead (see `.github/workflows/ci.yml`).
 */

const GENERATED_PATHS = ['playwright-report', 'test-results', 'blob-report', 'dist'];

function insideGitRepo(): boolean {
  try {
    return (
      execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
        encoding: 'utf8',
      }).trim() === 'true'
    );
  } catch {
    return false;
  }
}

function trackedFiles(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
}

describe.skipIf(!insideGitRepo())('repository hygiene', () => {
  it('does not track generated test or build output', () => {
    const tracked = trackedFiles();

    for (const path of GENERATED_PATHS) {
      const leaked = tracked.filter((file) => file === path || file.startsWith(`${path}/`));
      expect(leaked, `${path} must not be tracked — see .gitignore`).toEqual([]);
    }
  });
});
