# Security Review Checklist - Phase 6

## Permissions

- [ ] Confirm `declarativeNetRequest` is required
- [ ] Confirm `storage` is required
- [ ] Confirm `alarms` is required
- [ ] Confirm `notifications` is required
- [ ] Confirm `<all_urls>` is justified by global blocking behavior
- [ ] Remove development-only permissions before store submission if possible

## Code and Runtime

- [ ] No remote JavaScript or executable code
- [ ] No `eval`, dynamic script injection, or unsafe HTML rendering
- [ ] Popup uses a strict content security policy
- [ ] Background message types are explicitly allowlisted
- [ ] Message payloads are type-validated
- [ ] No URL-level browsing history is persisted
- [ ] No sensitive values are written to logs

## Rule Updates

- [ ] Metadata is fetched over HTTPS
- [ ] Rule payload schema is validated
- [ ] Rule count and size budgets are enforced
- [ ] SHA-256 checksum is verified
- [ ] Signature verification is implemented before production release
- [ ] Update application is atomic
- [ ] Failed updates preserve last-known-good rules
- [ ] Update endpoint access is restricted for maintainers

## Privacy Verification

- [ ] Search code for analytics and telemetry dependencies
- [ ] Inspect extension network requests
- [ ] Confirm no crash-reporting service is enabled
- [ ] Confirm counters remain local
- [ ] Confirm privacy policy matches actual behavior

## Release Review

- [ ] Review manifest permissions and host permissions
- [ ] Review third-party rule-source licenses and attribution requirements
- [ ] Review dependency lockfile and known vulnerabilities
- [ ] Review generated rules for accidental first-party blocking
- [ ] Record reviewer, date, version, and open risks

## Approval Record

- Reviewer:
- Date:
- Version:
- Result: Pass / Pass with risks / Fail
- Open risks:
