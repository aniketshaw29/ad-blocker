# Verification Status

Audit date: 2026-10-20. Runtime: Node 22.1.0 / npm 10.7.0; dependencies installed locally.

## Verified Locally

- `npm run typecheck`: passes.
- `npm test`: all 12 parser/compiler and mocked runtime regressions pass.
- `npm run build:rules:offline`: emits six fixture/curated rules and metadata.
- `npm run release:rules:preview`: reads generated artifacts; does not sign or publish.
- JavaScript syntax checks for service worker and popup pass.

Regressions cover filter restrictions, conservative exception handling, invalid override rejection, scoped-rule preservation/checksum agreement, priority rejection, pause reconciliation, failed dynamic replacement, and decreasing popup countdown.

## Live Build Finding

The live EasyList/EasyPrivacy build downloaded 140,587 records but emitted only one rule. The conservative exception strategy suppresses source blocks when an exception cannot be interpreted. A new minimum-coverage check now rejects live builds below 100 rules before writing new artifacts. This is a known coverage failure, not a successful production build.

## Fixed During Audit

- Countdown now uses the actual expiry timestamp and refreshes state after expiration.
- Pause reconciliation restores future resume alarms and clears expired pause state.
- Development counter writes are queued, pause allow matches excluded, session reset on browser startup.
- Update metadata has required counts/checksum format and HTTPS URL constraints.
- Downloaded rules retain validated scoped conditions; unknown fields and priorities above 100 are rejected.
- Checksums use parsed downloaded JSON before any transformation; notification failure does not turn a successful apply into a failed update.
- Unconfigured update checks report `not-configured` rather than success.

## Still Unverified or Incomplete

- Chrome/Edge extension loading and real DNR matching, pause/restart, and performance tests.
- Hosted end-to-end update tests, signatures, redirect handling, response-size/time limits, and downgrade/version policy.
- Production counter strategy and production manifest.
- Broader filter/exception translation and useful live-list coverage.
- Replacement of obsolete bundled rules by remote fixes.
- Video-ad effectiveness and legitimate playback compatibility.
- Store assets, published privacy/support details, licensing review, submission, and publishing automation.

Mocked Chrome API tests do not certify browser behavior. Follow the [QA matrix](qa-matrix.md), [Phase 6 findings](phase-6-review.md), and [release checklist](release-checklist.md) before launch.
