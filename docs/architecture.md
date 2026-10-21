# Architecture - Strict Ad Blocker (Chrome + Edge)

## Overview

This extension uses Manifest V3 and `declarativeNetRequest` (DNR) as the primary blocking mechanism. The architecture is designed for strict global blocking, minimal UI, local-only state, and no telemetry.

## Runtime Components

### 1) Background Service Worker

Responsibilities:

- Initialize extension state (`enabled`, `pause`, counters, active rules version)
- Apply effective blocking state to DNR rulesets
- Manage alarms:
  - 6-hour rule update checks
  - temporary pause resume (10 minutes)
- Handle popup messages (`getState`, `setEnabled`, `pauseTenMinutes`, `resumeNow`)
- Issue local notifications for rule update events

Design notes:

- Effective blocking state is derived from:
  - global enabled flag
  - temporary pause expiry
- If paused, rulesets are disabled regardless of global enabled state.

### 2) Popup UI

Minimal controls only:

- Global ON/OFF toggle
- Pause for 10 minutes
- Resume now
- Session and total blocked counts

No per-site controls and no advanced rule editing in UI.

### 3) Rulesets

MVP includes static DNR ruleset(s) bundled in extension package.

Implemented development components:

- Hybrid build pipeline (public lists + curated overrides)
- Versioned/checksummed update package (publisher signatures pending)
- Atomic DNR replacement with failed-apply recovery, tested with mocked APIs

Downloaded dynamic rules currently overlay bundled static rules; they do not replace bundled blocks. Production replacement semantics remain open. The update endpoint is unconfigured. Live-list compilation now succeeds with conservative exception projections and explicit selection of up to 4,999 rules, with deferred counts recorded in the build report.

## State Model

Stored in `chrome.storage.local`:

- `extensionEnabled: boolean`
- `temporaryDisableUntil: number | null` (epoch ms)
- `blockedCountSession: number`
- `blockedCountTotal: number`
- `activeRulesVersion: string`
- `lastUpdateCheckAt: number`
- `lastUpdateStatus: "ok" | "failed" | "not-configured"`
- `lastKnownGoodRulesVersion: string`

Notes:

- No user identifiers.
- No remote logging.
- No request history upload.

## Event Flows

### A) Startup

1. Service worker loads
2. Defaults are initialized if missing
3. Expired temporary pause is cleared
4. Effective blocking state is applied to DNR rulesets
5. 6-hour update alarm is ensured

### B) Global Toggle

1. Popup sends `setEnabled`
2. Background stores new value
3. Effective state is applied
4. Popup refreshes state

### C) Pause 10 Minutes

1. Popup sends `pauseTenMinutes`
2. Background sets `temporaryDisableUntil = now + 10m`
3. Rulesets are disabled
4. Resume alarm is scheduled
5. On resume alarm, pause is cleared and rulesets are restored

### D) Rule Update Check (6 Hours)

1. Alarm fires
2. Background requests metadata endpoint
3. If new version exists, package is downloaded and validated
4. Atomic apply
5. On failure, rollback to last-known-good
6. Notification shown for success/failure

## Permissions

Required initial permissions:

- `declarativeNetRequest`
- `storage`
- `alarms`
- `notifications`

Host permissions:

- `<all_urls>` for strict global network filtering behavior

Optional dev-only capability:

- `declarativeNetRequestFeedback` is currently requested in the manifest and used for local matched-rule counting in unpacked builds. A production-supported counter and production manifest still need implementation.

## Security and Privacy Constraints

- No telemetry or diagnostics upload
- No remote executable code
- Strict CSP and minimal script surface
- Validate update package integrity before apply
- Fail safe to last-known-good rules

## Deployment Targets

- Chrome (primary)
- Edge (parallel support)

## Known Constraints (MV3)

- Rule limits and API constraints require optimization and prioritization
- Some video ad evasion patterns can require rapid rule refreshes
- Matched-rule debug APIs have environment restrictions
