# Phase 6: Initial Implementation Review

Status: **Not ready for store submission**. Documentation is prepared; browser QA and remediation remain pending.

## Checks Performed

- JavaScript syntax checks passed for the service worker and popup using `node --check`.
- Reviewed the manifest, service worker, popup, and current pipeline implementation.
- Parser/runtime regression tests and offline fixture builds pass. Runtime tests use mocked Chrome APIs, not a browser.
- Live EasyList/EasyPrivacy ingestion now succeeds after exception projection fixes: 140,598 records, 97,270 eligible rules, 4,999 emitted, and 92,271 deferred by budget. Broad projections remove image/script/sub-frame matching from source rules in this snapshot; precise exception translation and selected-subset effectiveness remain release blockers.
- No browser compatibility, live video-ad, hosted-update, or performance tests have been executed in this review.

## Findings and Release Blockers

| Finding | Evidence | Required action |
|---|---|---|
| Updates are not configured | `RULE_UPDATE_METADATA_URL` is empty | Configure and test a project-controlled HTTPS endpoint; report unconfigured status accurately. |
| Rule updates are not authenticated | Checksum is supplied by the same source as the payload | Add signature verification with a trusted public key bundled in the extension. A checksum alone does not authenticate the publisher. |
| Checksum and scoped-condition preservation fixed locally | Updater verifies `SHA256(JSON.stringify(downloadedRules))` and preserves validated fields | Browser/hosted-update verification remains pending; signatures are still absent. |
| Priority bounds added | Updater accepts integer block priorities from 1 through 100, below the pause override | Rejection is covered in runtime regression tests; verify in browser. |
| Filter translation is partial | Scoped domain filters and conservative host/resource/initiator exception projection now pass tests and a live build; block paths/cosmetic rules remain unsupported | Review broad exemptions, deferred-rule selection, and real-site effectiveness. Runtime preserves supported scoped conditions. |
| Pipeline tooling and local regressions added | Local TypeScript/tsx tooling, parser/runtime tests, and offline build now pass | Hosted-update and browser integration tests remain pending. |
| Popup countdown fixed locally | Renderer computes remaining time from the expiry timestamp and refreshes state after expiration | Regression test verifies decreasing countdown; browser validation remains pending. |
| Pause alarm recovery fixed locally | Effective-state reconciliation restores future alarms and clears expired pauses | Mocked runtime test passes; verify browser restart during pause. |
| Counter is development-only | Counter uses `onRuleMatchedDebug` | Choose a production-supported count strategy and label count scope accurately. |
| Development counter writes serialized | Counter updates are queued, pause allow matches excluded, session reset on browser startup | Verify in unpacked browser; production counting remains unresolved. |
| Updated rules do not replace bundled rules | Static rules stay enabled alongside downloaded dynamic rules | Define replacement/overlay semantics so a remote fix can remove obsolete bundled blocks. |
| Conservative rule budget aligned | Build and updater accept at most 4,999 package rules, reserving a pause slot | Add boundary/browser tests; keep constants aligned. |
| Package identity improved | Build versions now include an ISO timestamp with milliseconds | Use immutable versioned publication artifacts and verify repeated release behavior. |
| Video coverage is unverified | Current video overrides are candidate URL patterns | Validate playback and actual ad behavior on Chrome and Edge; remove patterns causing legitimate playback failures. |
| Store assets are absent | No icons, screenshots, public support or privacy URLs | Prepare assets and replace placeholder contact information before submission. |

## Privacy Policy Follow-Up

Distinguish local processing from update-host access logs. Download hosts/CDNs can receive IP addresses and request timestamps even when the extension sends no telemetry. Document the selected host's logging and retention practices before publishing the policy. Describe signature checks as planned until implemented.

## Completion Gate

Resolve the findings, run the matrix in `qa-matrix.md`, record evidence for both browsers, and complete the security and release checklists. Initial scaffolding checkmarks in the sprint board are not release approval.
