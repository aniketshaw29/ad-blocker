# Phase 7 — Launch and Operations

Status: operations procedures prepared; launch pending the [release checklist](release-checklist.md) and [Phase 6 findings](phase-6-review.md).

## Ownership

For the initial solo-maintainer release, the maintainer owns source review, builds, browser QA, publishing, issue triage, and incident response. Record the responsible person in each release record; add a second reviewer when another contributor joins.

## Cadence

| Activity | Schedule | Result |
|---|---|---|
| Extension rule-update check | Every 6 hours while the browser runs | Download a newly published version, if available |
| Public source refresh/build | Every 6 hours once build automation is ready | Candidate artifacts; publish only changed, validated packages |
| Manual rule-quality review | Weekly | Review source changes, breakage reports, video coverage, and rule budgets |
| Issue triage | Daily when maintainer is available | Reproduction, severity, and next action |
| Emergency hotfix | As needed | Validated corrective rule or extension release |
| Extension release | When runtime fixes/features are ready | Tested Chrome and Edge packages |

The client check interval and the publishing schedule are separate. Sleeping/offline browsers may check later; reconcile overdue checks at startup when implemented. A weekly review does not mean clients wait a week for fixes.

## Routine Rule Refresh

1. Fetch the configured sources and retain source timestamps/hashes and license references.
2. Review upstream changes and curated general/video overrides.
3. Build with a unique version; record supported and skipped filter counts.
4. Enforce runtime-compatible rule budgets and validate compiler output.
5. Run parser/compiler checks and breakage regressions; test relevant sites in Chrome and Edge.
6. Produce immutable rules artifacts, metadata, checksums, and signatures.
7. Test a candidate update on a maintainer profile, including off/pause behavior and invalid-package rejection.
8. Publish immutable artifacts first. Publish the metadata pointer only after artifacts are available and verified.
9. Record the release in [CHANGELOG.md](../CHANGELOG.md) and retain the previous working artifacts.

Current build/release scripts are scaffolding. The release script prints a proposed release; it does not upload or sign artifacts. Do not treat these procedures as deployed automation.

## Launch Sequence

1. Resolve Phase 6 blockers and complete the release checklist.
2. Test the exact production archive in both browsers.
3. Publish the privacy policy, support contact, attribution, and listing assets.
4. Submit separately to Chrome Web Store and Edge Add-ons; record each review outcome.
5. Begin a small, volunteer soft launch after acceptance.
6. Review voluntarily submitted issues and retest reported failures locally.
7. Expand availability after launch-critical failures are resolved.

Store approval and release timing can differ between browsers. Record each browser's published version independently.

## Privacy-Preserving Quality Review

- Use maintainer QA, build results, and voluntary reports; no extension telemetry or automatic browsing-data uploads.
- Track issue counts, resolution times, failed builds, and rule counts from project records.
- Do not infer user-wide blocking rates or site reliability from these limited records.
- Request minimal reproducible details; never require cookies, authentication headers, account data, or full browsing histories.
- Document update-host access-log handling in the privacy policy before launch.

## Weekly Review Record

- Week/date and maintainer:
- Current Chrome/Edge extension versions:
- Current rules version and source hashes:
- Rule counts and unsupported-filter counts:
- New/resolved issues by severity:
- Video playback/ad observations:
- Outstanding release blockers:
- Next actions:

## Launch Completion

Launch is complete only when both stores publish tested packages, the rule update channel works end to end, and the support/release procedures have been exercised. Documentation completion alone does not complete Phase 7.
