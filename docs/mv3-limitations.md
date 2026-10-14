# MV3 Limitations and Aggressive Profile Notes

## Key MV3 Constraints

- Declarative rules are subject to browser limits (static and dynamic budgets).
- Some ad delivery logic is tightly coupled with first-party video traffic and can bypass simple URL blocking patterns.
- Rule match debug APIs are restricted and may behave differently in production/store contexts.
- Cosmetic filtering and scriptlet-style interventions are constrained compared to legacy extension models.

## Impact on This Project

- Aggressive mode can increase site breakage risk.
- Video platform ad behavior may change quickly and require frequent rule updates.
- Dynamic rule updates must stay within configured limits and be validated before apply.

## Current Mitigations

- Hybrid rules strategy (public lists + curated overrides)
- Priority-based compilation (`video` and `tracker` categories favored)
- 6-hour auto update cycle with checksum validation
- Atomic update + rollback in runtime updater
- Bundled fallback ruleset for startup resilience

## Planned Mitigations

- Add signature verification for update artifacts
- Introduce CI gates for rule-count/perf budgets
- Maintain known-breakage regression set and fast hotfix loop
