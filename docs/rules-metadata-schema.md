# Rules Metadata Schema

This document defines the initial metadata payload used by the extension updater.

## File: `metadata.json`

```json
{
  "version": "rules-2026-10-13",
  "generatedAt": "2026-10-13T10:00:00.000Z",
  "ruleCount": 12345,
  "sourceIds": ["easylist", "easyprivacy"],
  "rulesFile": "ruleset_main.json",
  "checksumSha256": "<sha256 of ruleset_main.json JSON payload>"
}
```

## Field Definitions

- `version`: string identifier for release
- `generatedAt`: ISO timestamp of package generation
- `ruleCount`: total number of DNR rules in package
- `sourceIds`: list of active source ids used in build
- `rulesFile`: relative file name for rules payload (resolved from metadata URL)
- `checksumSha256`: lowercase hex SHA-256 of UTF-8 `JSON.stringify(rulesArray)` after parsing the JSON payload. It is not the hash of the pretty-printed file bytes. The updater verifies this before preserving the validated rules unchanged.

## Runtime Contract

- Metadata and rules URLs must use HTTPS; rules must resolve to the metadata origin.
- `ruleCount` is required and must match a nonempty payload of at most 4,999 rules.
- Unique positive rule IDs and block actions only; priorities must be integers from 1 through 100.
- Supported conditions: `urlFilter`, nonempty `resourceTypes`, optional `domainType`, `initiatorDomains`, and `excludedInitiatorDomains`.
- Unknown rule/condition fields are rejected instead of silently discarded.
- The endpoint is currently unconfigured. Checksums detect corruption; publisher signatures and end-to-end hosted tests remain pending.

## Planned Extensions

- Add `signature` for offline signature verification
- Add optional absolute `rulesUrl` override
- Add `minExtensionVersion` for compatibility gating
- Add `releaseNotes` for user-facing update summaries
