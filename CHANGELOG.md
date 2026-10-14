# Changelog

## Unreleased

Development build `0.1.0`; no store release or hosted rule release has been published by this workflow.

### Added

- Chrome/Edge Manifest V3 extension scaffold with bundled candidate ad/tracker rules.
- Global toggle, 10-minute pause, local development counters, and six-hour update alarm scaffolding.
- Hybrid rule-pipeline modules and candidate video overrides.
- Development, architecture, QA, store-readiness, and operations documentation.
- Voluntary issue-reporting template and emergency hotfix procedure.

### Known gaps

- Browser QA, production counting, TypeScript tooling, authenticated rule updates, update hosting, and store assets remain pending.
- See [Phase 6 review](docs/phase-6-review.md) for implementation findings. Video ad blocking is not verified.

## Entry Format for Future Releases

Replace this example when publishing a real release:

```text
## [extension-version or rules-version] - YYYY-MM-DD
Type: extension / rules
Browsers: Chrome / Edge
Sources: source revisions or hashes (for rule releases)
Added:
Changed:
Fixed:
Known issues:
Test evidence: browser versions and QA/issue references
```

Keep extension and rule-release entries distinct. Include rule changes and breakage fixes without personal browsing data. Record immutable artifact identifiers and signatures in release metadata; do not put signing secrets in release notes.
