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
- `checksumSha256`: SHA-256 checksum used to verify package integrity

## Planned Extensions

- Add `signature` for offline signature verification
- Add optional absolute `rulesUrl` override
- Add `minExtensionVersion` for compatibility gating
- Add `releaseNotes` for user-facing update summaries
