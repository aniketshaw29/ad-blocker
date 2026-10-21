# Verification Status

Audit date: 2026-10-20. Runtime: Node 22.1.0 / npm 10.7.0; dependencies installed locally.

## Verified Locally

- `npm run typecheck`: passes.
- `npm test`: all 18 parser/compiler and mocked runtime regressions pass.
- `npm run build:rules:offline`: emits six fixture/curated rules and metadata.
- `npm run release:rules:preview`: reads generated artifacts; does not sign or publish.
- JavaScript syntax checks for service worker and popup pass.

Regressions cover filter restrictions, conservative exception handling, invalid override rejection, scoped-rule preservation/checksum agreement, priority rejection, pause reconciliation, failed dynamic replacement, and decreasing popup countdown.

## Live Build Finding

The earlier live build emitted only one rule because a single unsupported exception suppressed all source rules. Exception handling now projects host, initiator, and resource scope instead of triggering that global fallback whenever possible.

Verified live build snapshot (lists change over time):

- 140,598 input records from EasyList and EasyPrivacy.
- 97,270 eligible normalized rules; 39,587 unsupported records.
- 1,601 exceptions processed; 9 without a directly anchored host.
- 4,999 rules emitted; 92,271 deferred by the deterministic package-budget selector.

Curated rules are selected first, then priority and stable filter order. Exemption projection is conservative and can remove more blocking coverage than the original exception. A minimum-coverage check still rejects live builds below 100 rules. These build results are not a browser effectiveness measurement or full EasyList compatibility.

In this snapshot generic exception projections remove `image`, `script`, and `sub_frame` matching from source-derived rules and exclude ten initiator domains; curated overrides retain their own resource coverage. This is a material effectiveness limitation despite the restored rule count. The report exposes these projections explicitly. Precise path-aware exception translation is still needed before claiming strong real-site coverage.

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
- Broader filter/exception translation, improved budget selection, and browser effectiveness of the selected subset.
- Replacement of obsolete bundled rules by remote fixes.
- Video-ad effectiveness and legitimate playback compatibility.
- Store assets, published privacy/support details, licensing review, submission, and publishing automation.

Mocked Chrome API tests do not certify browser behavior. Follow the [QA matrix](qa-matrix.md), [Phase 6 findings](phase-6-review.md), and [release checklist](release-checklist.md) before launch.
