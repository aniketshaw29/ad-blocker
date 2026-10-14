# QA Matrix - Phase 6

## Test Matrix

Run the matrix on the latest stable Chrome and Edge using a clean browser profile and the unpacked `extension/` directory.

| Area | Scenario | Expected result | Chrome | Edge | Notes |
|---|---|---|---|---|---|
| Installation | Load unpacked extension | No manifest or service-worker error | [ ] | [ ] | |
| Startup | Restart browser | Extension state and rules restore | [ ] | [ ] | |
| Toggle | Turn blocking off | All blocking rules become inactive | [ ] | [ ] | |
| Toggle | Turn blocking on | Aggressive rules become active | [ ] | [ ] | |
| Pause | Pause for 10 minutes | Blocking pauses and countdown appears | [ ] | [ ] | |
| Pause | Resume immediately | Blocking resumes without browser restart | [ ] | [ ] | |
| Pause | Let pause expire | Blocking resumes automatically | [ ] | [ ] | |
| Persistence | Close and reopen popup | Current state is displayed correctly | [ ] | [ ] | |
| Rules | Known ad-domain request | Request is blocked | [ ] | [ ] | |
| Rules | Tracker request | Request is blocked | [ ] | [ ] | |
| Video | Video ad request pattern | Request is blocked where rule applies | [ ] | [ ] | Platform behavior may change |
| Updates | 6-hour alarm exists | Alarm period is 360 minutes | [ ] | [ ] | |
| Updates | New valid rule package | Checksum passes and rules apply | [ ] | [ ] | Requires test endpoint |
| Updates | Invalid checksum | Package rejected; old rules remain | [ ] | [ ] | |
| Updates | Failed apply | Rollback restores previous rules | [ ] | [ ] | |
| Privacy | Inspect network activity | No telemetry or diagnostics upload | [ ] | [ ] | |
| Permissions | Review extension permissions | Only documented permissions requested | [ ] | [ ] | |
| Performance | Browse common sites | No severe browser slowdown | [ ] | [ ] | |

## Site Categories

Test at least three sites per category and record breakage separately.

- News and publishing
- Search and portals
- Social media
- Video and streaming
- Shopping and marketplaces
- Banking and payments
- Productivity and developer tools
- Email and communications

## Breakage Record

For every failure, record:

- Browser and version
- URL and reproducible steps
- Expected behavior
- Actual behavior
- Relevant console/service-worker error
- Whether the issue is caused by a rule, UI, update, or platform limitation
- Proposed rule change and regression test

## Release Gate

- No extension load errors
- Toggle and 10-minute pause pass in both browsers
- Invalid update packages never replace active rules
- No telemetry requests observed
- Critical banking, login, and payment flows remain usable
- Known breakages documented before release
