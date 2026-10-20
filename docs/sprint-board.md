# Sprint Board - Strict Ad Blocker

## Current Sprint Goal

Phase 7 operations preparation: define refresh, hotfix, reporting, and changelog workflows. Phase 6 verification remains a launch prerequisite.

- MV3 extension loads in Chrome and Edge
- Global ON/OFF works
- 10-minute global pause works
- 6-hour update alarm is scheduled

## Backlog by Phase

## Phase 1 - Specification and Foundation

- [x] Lock product decisions
- [x] Write development plan
- [x] Write architecture document
- [x] Create threat model document
- [x] Create privacy policy draft

## Phase 2 - MVP Runtime and Minimal UI

- [x] Add MV3 manifest
- [x] Add background service worker
- [x] Add popup UI
- [x] Add global ON/OFF toggle flow
- [x] Add 10-minute temporary disable flow
- [x] Add 6-hour update check alarm
- [ ] Validate behavior in Chrome manually (checklist ready)
- [ ] Validate behavior in Edge manually (checklist ready)

## Phase 3 - Hybrid Rules Pipeline

- [x] Create `rules-pipeline/` skeleton
- [x] Define source list config
- [x] Build normalize/dedupe pass (initial)
- [x] Build DNR compile output (initial)
- [x] Add package metadata generation (initial)
- [x] Configure local Node dependencies, lockfile, TypeScript tooling, and runtime version file
- [x] Verify parser/compiler and mocked runtime regressions with an offline fixture build
- [x] Exercise live-list ingestion and reject inadequate live-build coverage
- [ ] Implement broader exception-aware filter translation and test live-list coverage

## Phase 4 - Update and Rollback

- [x] Finalize remote metadata schema (initial)
- [x] Implement package download and checksum verify (initial)
- [x] Implement atomic apply (initial)
- [x] Implement rollback to last-known-good (initial)
- [x] Add update notifications with version details (initial)

## Phase 5 - Aggressive Hardening

- [x] Expand strict rules coverage (initial fallback ruleset)
- [x] Add video-platform-focused rule module (initial overrides)
- [x] Tune priorities and conflict resolution (pipeline categories)
- [x] Capture known MV3 limitations

## Phase 6 - QA and Store Readiness

- [x] Build QA matrix
- [x] Prepare security review checklist and initial findings (`docs/phase-6-review.md`)
- [x] Prepare store listing draft and release checklist
- [ ] Resolve release blockers recorded in the initial review
- [ ] Execute breakage regression pass
- [ ] Final permissions/security review
- [ ] Prepare Chrome Web Store listing assets
- [ ] Prepare Edge Add-ons listing assets

## Phase 7 - Launch and Operations

- [x] Document six-hour source refresh and weekly rule-quality review (`docs/operations.md`)
- [x] Document emergency hotfix and corrective-release process (`docs/hotfix-runbook.md`)
- [x] Create changelog and release-entry format (`CHANGELOG.md`)
- [x] Prepare voluntary issue-reporting template and triage workflow
- [ ] Automate and exercise rule refresh/publishing after build and updater fixes
- [ ] Complete Phase 6 release gates and submit tested packages to both stores
- [ ] Conduct soft launch and verify the support/hotfix workflow
- [ ] Establish verified operational release cadence

## Immediate Task Order

1. Improve exception translation to restore useful live-list coverage; see `docs/verification-status.md`.
2. Implement production-supported counters; browser-verify countdown and pause recovery fixes.
3. Harden updater validation, priority limits, signatures, and rule replacement semantics.
4. Configure the HTTPS update endpoint and run update integration tests.
5. Run Chrome/Edge smoke tests and the aggressive compatibility sweep.
6. Finalize icons, screenshots, listing copy, privacy policy, and release package.
