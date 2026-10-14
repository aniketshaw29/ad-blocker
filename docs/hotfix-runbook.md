# Emergency Hotfix Runbook

## Triage

| Severity | Examples | Action |
|---|---|---|
| Critical | Tampered update, widespread loss of blocking, unrecoverable runtime state | Stop publishing candidates and investigate immediately when available |
| High | Login/payment failures, playback broken across major platforms, pause does not work | Prioritize reproducible fix and focused browser regression |
| Normal | Ads return on one site, cosmetic gap, noncritical breakage | Add to normal rule review backlog |

These are priorities, not guaranteed response times. Users can turn blocking off or pause it globally while a fix is investigated.

## Investigate and Fix

1. Record affected extension/rules versions, browsers, timestamp, and sanitized reproduction steps.
2. Reproduce in a clean maintainer profile; distinguish rule failures from runtime/updater failures.
3. Pause candidate publication. Retain previous artifacts and incident evidence.
4. Prepare the smallest corrective change and add a meaningful regression case.
5. Test the affected flow, global toggle, pause/resume, and update behavior in both browsers.
6. Publish a new uniquely versioned rule package for rule-only fixes. Runtime, bundled static-rule, or executable-code fixes require a store extension release.
7. Update the changelog and incident record, then confirm the published artifacts install correctly.

## Revert a Bad Rule Release

The current updater only compares version equality. Republishing old metadata is not a defined downgrade protocol.

- Package the last-known-good rules as a **new version**, sign them, and verify the corrected package.
- Upload immutable artifacts before switching the current metadata pointer.
- Keep the bad release out of the current pointer and record its affected versions.
- Test that a client on the bad version receives the corrective version.
- Fixing a bad dynamic package does not automatically remove a bad bundled static rule; account for replacement semantics recorded in the Phase 6 review.

Do not bypass validation or signatures for an emergency release. If the signing key is compromised, stop using it and distribute a trusted-key change through a reviewed extension release.

## Incident Record

- Incident ID/date and owner:
- Severity and impact:
- Affected extension/rule versions:
- Reproduction and root cause:
- Corrective release/version:
- Chrome and Edge verification results:
- Publication/confirmation timestamps:
- Follow-up regression or pipeline improvements:

## Close the Incident

Close after the corrective release is verified, user-facing notes are published, and follow-up work has an owner. No automatic diagnostics or browsing-data collection is added during incident response.
