# Strict Ad Blocker for Chrome + Edge

## 1) Product Vision

Build a privacy-first browser extension that blocks all ads and trackers by default with an aggressive posture, minimal UI, and no telemetry.

### Product Decisions (Locked)

- Blocking policy: Block all ads (no acceptable ads)
- Mode: Aggressive by default (higher breakage tolerated)
- Privacy: Block trackers by default
- Video platforms: Must block ads where technically possible
- Scope: Global blocking only (no per-site controls)
- UI: Minimal (global on/off + blocked count)
- Rule strategy: Hybrid (public lists + curated internal rules)
- Rule updates: Every 6 hours, auto update with user notification
- Telemetry: No telemetry, no diagnostics, no analytics
- Platforms: Chrome + Edge first
- Safety switch: Global temporary disable for 10 minutes

## 2) Goals and Non-Goals

### Goals

- Deliver reliable aggressive blocking with low runtime overhead
- Keep implementation compatible with Manifest V3 constraints
- Provide transparent local behavior without collecting user data
- Ship fast update cycles to handle breakage and ad evasions

### Non-Goals

- No per-site allowlist or per-site custom rule UI
- No remote logging, cloud account, or sync backend
- No acceptable ads program
- No cross-browser support beyond Chrome + Edge in initial release

## 3) High-Level Architecture

### [A] Extension Runtime (Client)

- `manifest.json` (MV3)
- Service worker background process
- Rulesets (static + dynamic via Declarative Net Request)
- Action popup UI (minimal)
- Optional options page (only essential controls)
- Storage: `chrome.storage.local` only

### [B] Rules Pipeline (Build + Update)

- Source ingestion from public filter lists
- Internal curated rule overlays
- Rule normalization, deduplication, and conflict resolution
- Compiler to MV3-compatible DNR rulesets
- Signed/versioned rules package generation

### [C] Update Delivery

- Hosted version metadata + package files (CDN/GitHub release artifact)
- Runtime updater checks every 6 hours
- Validation before apply
- Atomic swap with rollback to last-known-good package

## 4) Suggested Folder Structure

```text
ad-blocker/
  extension/
    src/
      background/
      popup/
      options/
      common/
    public/
      manifest.json
    dist/

  rules-pipeline/
    src/
      ingest/
      normalize/
      compile/
      validate/
      package/
    config/
      sources.json
      overrides.json
    output/

  docs/
    architecture.md
    qa-matrix.md
    release-checklist.md
    privacy-policy.md

  scripts/
    build-rules.ts
    release-rules.ts

  AD_BLOCKER_DEVELOPMENT_PLAN.md
```

## 5) Core Components

### 5.1 Service Worker (Background)

Responsibilities:

- Initialize extension state on startup/install
- Load active ruleset metadata
- Schedule update checks (6-hour interval)
- Manage global on/off toggle
- Manage 10-minute temporary disable timer
- Maintain local blocked count (aggregated)
- Trigger notifications for successful update/failures

Key behaviors:

- If temporary disable is active, skip blocking activation until timer expires
- On timer expiry, re-enable strict rules automatically
- On rules update failure, continue using existing active ruleset

### 5.2 Popup UI (Minimal)

Controls:

- Global toggle: ON/OFF
- Blocked requests count (session and total)
- Temporary disable button: "Pause 10 min"

Constraints:

- No site-specific controls
- No advanced logs in popup

### 5.3 Rules Engine (MV3 DNR)

Layers:

- Public base lists (EasyList/EasyPrivacy + selected sources)
- Internal curated overrides (additions/fixes)
- Priority handling to ensure deterministic outcomes

Output:

- One or more DNR static rulesets + optional dynamic rule updates
- Metadata file with version, checksum, generation timestamp, source versions

### 5.4 Rule Updater

Flow:

1. Fetch remote metadata every 6 hours
2. Compare with local active version
3. Download package if newer
4. Verify checksum/signature + schema validity
5. Apply atomically
6. Notify user on success
7. Roll back automatically on apply failure

### 5.5 Local Data Model

Stored in `chrome.storage.local`:

- `extensionEnabled: boolean`
- `temporaryDisableUntil: epoch_ms | null`
- `blockedCountTotal: number`
- `blockedCountSession: number`
- `activeRulesVersion: string`
- `lastUpdateCheckAt: epoch_ms`
- `lastUpdateStatus: "ok" | "failed"`
- `lastKnownGoodRulesVersion: string`

No user identifiers. No browsing history upload. No telemetry keys.

## 6) Security and Privacy Design

### Permissions Strategy

- Request minimum required permissions only
- Avoid broad permissions not needed for DNR and storage
- Review host permissions and keep tight scope when possible

### Security Controls

- No remote executable code
- Content Security Policy locked down
- Validate all downloaded rule packages
- Reject unsigned/invalid packages
- Fail safely to last-known-good state

### Privacy Controls

- No analytics SDK
- No crash/usage telemetry
- No request log upload
- All counters and state remain local

## 7) Phase-Wise Development Plan

### Phase 1: Specification and Foundation (Week 1)

- Finalize product spec and acceptance criteria
- Create architecture doc and threat model
- Setup monorepo/project skeleton
- Implement base MV3 extension scaffold

Exit criteria:

- Extension loads in Chrome and Edge dev mode
- Product rules and constraints documented

### Phase 2: MVP Runtime and UI (Weeks 2-3)

- Build background worker state machine
- Implement global ON/OFF toggle
- Implement blocked counter tracking
- Implement popup minimal UI
- Implement 10-minute global temporary disable

Exit criteria:

- User can toggle extension globally
- "Pause 10 min" disables and auto re-enables correctly

### Phase 3: Hybrid Rules Pipeline (Weeks 4-5)

- Build ingestion from public lists
- Add curated override layer
- Implement normalize/dedupe/compile pipeline
- Generate MV3-compatible output + metadata

Exit criteria:

- Rules package generation reproducible
- Generated rules apply successfully in extension

### Phase 4: Update and Rollback System (Week 6)

- Implement 6-hour scheduled update checks
- Build package fetch/verify/apply flow
- Add rollback to last-known-good rules
- Add user notifications for update status

Exit criteria:

- Extension updates rules automatically on schedule
- Failed updates do not break active blocking

### Phase 5: Aggressive Policy Hardening (Weeks 7-8)

- Expand high-impact ad/tracker patterns
- Add video-platform-specific strategies
- Tune rule priorities for strict behavior
- Document known unavoidable platform limitations

Exit criteria:

- Strong blocking on target test sites
- YouTube/video behavior validated against acceptance criteria

### Phase 6: QA, Security Review, Store Readiness (Week 9)

- Run compatibility tests across top site categories
- Perform false-positive and breakage assessment
- Complete permissions/security review
- Prepare store listing + privacy policy docs

Exit criteria:

- QA matrix complete
- Store submission artifacts ready for Chrome + Edge

### Phase 7: Launch and Operations (Week 10+)

- Soft launch and monitor user-reported breakages
- Weekly rule refresh cadence with emergency hotfix path
- Maintain transparent changelog and incident notes

Exit criteria:

- Stable release cycle established
- Fast turnaround for rule break/fix updates

## 8) Engineering Backlog (Initial)

### Must-Have

- MV3 extension skeleton (Chrome + Edge)
- Global toggle + blocked count
- 10-minute temporary disable
- Hybrid rules compiler
- 6-hour update scheduler
- Rule package validation + rollback
- Local-only storage model
- Notification on rule update

### Should-Have

- Rule package signature verification
- Lightweight local diagnostics page (no remote upload)
- Build pipeline CI checks for rules correctness

### Nice-to-Have

- Optional advanced debug mode (still local only)
- Rule diff viewer in developer build

## 9) Testing Strategy

### Unit Tests

- Rule parser/normalizer/compiler correctness
- Update flow state transitions
- Temporary disable timer logic

### Integration Tests

- Rules apply and remove correctly
- Toggle behavior under active browsing session
- Update apply and rollback behavior

### Manual/E2E Validation

- Top websites: news, social, ecommerce, streaming
- Video ad scenarios (especially YouTube)
- Extension restart/browser restart persistence

### Regression Suite

- Maintain known breakage cases as test fixtures
- Re-run suite before every release

## 10) Risk Register and Mitigation

1. High website breakage due to aggressive blocking
   - Mitigation: fast update cadence, curated fix rules, quick hotfix pipeline

2. Video platform ad techniques evolve quickly
   - Mitigation: dedicated video rule module, frequent updates, fallback strategy

3. MV3 rule limits and API constraints
   - Mitigation: optimize and prioritize rule sets, split strategically

4. Corrupt or invalid update package
   - Mitigation: checksum/signature validation, atomic apply, rollback

5. Store review friction due to permissions/claims
   - Mitigation: minimal permissions, clear privacy policy, accurate listing copy

## 11) Delivery Milestones

- M1 (End Week 3): Usable MVP extension with global toggle and pause 10 min
- M2 (End Week 6): Automated rules update pipeline with rollback
- M3 (End Week 8): Aggressive blocking profile and video strategy hardened
- M4 (End Week 9): QA complete and store package ready
- M5 (Week 10+): Launch and operational cadence established

## 12) Immediate Next Steps (Execution Order)

1. Create extension scaffold (`manifest.json`, service worker, popup UI)
2. Implement local state model and global toggle flow
3. Implement 10-minute temporary disable end-to-end
4. Build initial rules pipeline with hybrid sources
5. Integrate 6-hour auto update mechanism
6. Add validation, rollback, and update notifications
7. Build QA matrix and run first aggressive compatibility sweep
