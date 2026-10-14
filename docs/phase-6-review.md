# Phase 6: Initial Implementation Review

Status: **Not ready for store submission**. Documentation is prepared; browser QA and remediation remain pending.

## Checks Performed

- JavaScript syntax checks passed for the service worker and popup using `node --check`.
- Reviewed the manifest, service worker, popup, and current pipeline implementation.
- No browser compatibility, live video-ad, hosted-update, or performance tests have been executed in this review.

## Findings and Release Blockers

| Finding | Evidence | Required action |
|---|---|---|
| Updates are not configured | `RULE_UPDATE_METADATA_URL` is empty | Configure and test a project-controlled HTTPS endpoint; report unconfigured status accurately. |
| Rule updates are not authenticated | Checksum is supplied by the same source as the payload | Add signature verification with a trusted public key bundled in the extension. A checksum alone does not authenticate the publisher. |
| Remote rules are transformed before hashing | Updater hashes normalized rules | Verify the downloaded payload using a documented serialization contract before transforming it; reject unsupported rule fields rather than silently dropping them. |
| Remote priorities can override pause | Priority is not bounded below the pause override priority | Enforce a maximum blocking priority and reject invalid priorities. |
| Filter syntax is not translated | Parser accepts `||` lines including Adblock options/cosmetic syntax | Translate supported syntax to DNR conditions and report unsupported syntax; do not pass filter-list options literally to `urlFilter`. |
| Pipeline is not runnable with documented tooling | No TypeScript project configuration or runner is configured | Add build/typecheck commands and meaningful parser/updater tests. |
| Popup countdown is stale | Renderer repeatedly uses cached `pauseRemainingMs` | Compute remaining time from the expiry timestamp and refresh state after expiration. |
| Pause alarm restoration is incomplete | Startup ensures update alarm, but not a future pause alarm | Restore the resume alarm on startup and clear expired pauses. Verify browser restart during pause. |
| Counter is development-only | Counter uses `onRuleMatchedDebug` | Choose a production-supported count strategy and label count scope accurately. |
| Counter writes can race | Concurrent read/increment/write operations | Serialize counter updates; exclude the pause allow rule from blocked counts and define session reset behavior. |
| Updated rules do not replace bundled rules | Static rules stay enabled alongside downloaded dynamic rules | Define replacement/overlay semantics so a remote fix can remove obsolete bundled blocks. |
| Rule budget is not coordinated | Runtime cap is 5,000; build has no matching budget | Enforce a shared budget, reserve space for the pause override, and test boundary packages. |
| Package identity can repeat | Build version uses only the calendar date | Use unique release versions so six-hour updates on the same day are detected. |
| Video coverage is unverified | Current video overrides are candidate URL patterns | Validate playback and actual ad behavior on Chrome and Edge; remove patterns causing legitimate playback failures. |
| Store assets are absent | No icons, screenshots, public support or privacy URLs | Prepare assets and replace placeholder contact information before submission. |

## Privacy Policy Follow-Up

Distinguish local processing from update-host access logs. Download hosts/CDNs can receive IP addresses and request timestamps even when the extension sends no telemetry. Document the selected host's logging and retention practices before publishing the policy. Describe signature checks as planned until implemented.

## Completion Gate

Resolve the findings, run the matrix in `qa-matrix.md`, record evidence for both browsers, and complete the security and release checklists. Initial scaffolding checkmarks in the sprint board are not release approval.
