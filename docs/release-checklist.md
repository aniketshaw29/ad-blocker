# Release Checklist

## Build and Rules

- [ ] TypeScript tooling and build commands work from a clean checkout.
- [ ] Parser, compiler, and updater tests pass.
- [ ] Rule packages have unique versions, verified signatures, and enforced budgets.
- [ ] Update endpoint is configured and a valid update works end to end.
- [ ] Invalid packages preserve working rules.
- [ ] Global off/pause works with both bundled and downloaded rules.

## QA

- [ ] Address findings in `phase-6-review.md`.
- [ ] Complete `manual-smoke-test.md` in Chrome and Edge.
- [ ] Execute `qa-matrix.md` and attach browser versions and results.
- [ ] Verify video playback and document actual ad-blocking coverage.
- [ ] Record expected aggressive-mode breakages.
- [ ] Verify production counter behavior and restart/pause recovery.

## Store Package

- [ ] Complete `security-review-checklist.md`.
- [ ] Publish accurate privacy policy with real contact information.
- [ ] Include required rule-source attribution and license notices.
- [ ] Finalize `store-listing-draft.md` and capture real screenshots.
- [ ] Add extension icons and prepare store-specific assets.
- [ ] Package only extension runtime files; exclude development/debug-only configuration.
- [ ] Install and test the exact package being submitted.
- [ ] Complete `store-readiness.md` for both stores.

## Release Record

- Version:
- Rule package version:
- Tested Chrome/Edge versions:
- Date:
- Known issues:
- Submission IDs/URLs:

Do not mark the release complete until the tested package is accepted and published.
