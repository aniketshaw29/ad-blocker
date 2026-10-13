# Sprint Board - Strict Ad Blocker

## Current Sprint Goal

Deliver Phase 1 foundation and a working Phase 2 baseline:

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

## Phase 4 - Update and Rollback

- [x] Finalize remote metadata schema (initial)
- [x] Implement package download and checksum verify (initial)
- [x] Implement atomic apply (initial)
- [x] Implement rollback to last-known-good (initial)
- [x] Add update notifications with version details (initial)

## Phase 5 - Aggressive Hardening

- [ ] Expand strict rules coverage
- [ ] Add video-platform-focused rule module
- [ ] Tune priorities and conflict resolution
- [ ] Capture known MV3 limitations

## Phase 6 - QA and Store Readiness

- [ ] Build QA matrix
- [ ] Execute breakage regression pass
- [ ] Final permissions/security review
- [ ] Prepare Chrome Web Store listing assets
- [ ] Prepare Edge Add-ons listing assets

## Phase 7 - Launch and Operations

- [ ] Setup weekly rules refresh process
- [ ] Setup emergency hotfix process
- [ ] Publish changelog process

## Immediate Task Order

1. Run manual smoke tests in Chrome and Edge (`docs/manual-smoke-test.md`)
2. Run first aggressive compatibility sweep
3. Add signature verification to metadata/update flow
4. Add CI checks for metadata and rules correctness
