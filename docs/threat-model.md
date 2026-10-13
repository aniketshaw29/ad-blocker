# Threat Model - Strict Ad Blocker (MV3)

## Scope

This model covers the Chrome/Edge MV3 extension runtime, local storage, bundled rules, and remote rule update channel.

## Security Objectives

- Preserve user privacy (no telemetry, no browsing data exfiltration).
- Maintain integrity of blocking logic and rule updates.
- Keep extension available and stable even during update failures.
- Minimize privilege and attack surface.

## Assets to Protect

- Extension code integrity (`manifest`, service worker, popup scripts)
- Ruleset integrity (bundled and remotely updated packages)
- Local state in `chrome.storage.local`
- User trust (accurate behavior and transparent privacy posture)

## Trust Boundaries

1. Browser runtime boundary
   - Extension context vs web page context
2. Network boundary
   - Remote metadata/package source vs local extension runtime
3. Storage boundary
   - Persistent local storage values used for control flow

## Assumptions

- Browser extension platform enforces MV3 constraints.
- Browser auto-update mechanism for extension package is trusted.
- Update endpoint is under project control with transport security.

## Threat Enumeration

## 1) Malicious or Tampered Rule Update Package

Risk:

- Attacker injects manipulated rules to disable blocking or cause harm.

Mitigations:

- HTTPS-only metadata/package fetch
- Strong checksum and signature verification
- Strict schema validation
- Atomic apply and rollback to last-known-good
- Reject package on any verification failure

Residual risk:

- Compromised signing key or trusted source account.

## 2) Supply Chain Compromise in Public Rule Sources

Risk:

- Public filter source includes bad or overly broad rules.

Mitigations:

- Curated allowlist of sources
- CI rule sanity checks (size thresholds, suspicious pattern checks)
- Internal override layer for emergency fixes
- Staged rollout and quick rollback support

Residual risk:

- Short window of breakage before detection.

## 3) Privilege Misuse Through Over-Broad Permissions

Risk:

- Excess permissions could expand impact if extension logic is abused.

Mitigations:

- Minimize permissions to required set
- Avoid optional capabilities in production when not needed
- Periodic permission audit before releases

Residual risk:

- `host_permissions: <all_urls>` is required for strict global filtering.

## 4) Data Leakage from Local State or Logs

Risk:

- Sensitive browsing information could leak if detailed logs are stored/sent.

Mitigations:

- No remote telemetry or diagnostics upload
- Keep local counters aggregate-only
- No URL-level persistent history
- Avoid debug logging of visited URLs in production

Residual risk:

- Local machine compromise is out of extension control.

## 5) Denial of Service via Rule Explosion / Limits

Risk:

- Excessive rules hit MV3 limits or degrade performance.

Mitigations:

- Rule dedupe/optimization in pipeline
- Enforce package size and rule-count budgets
- Prioritize high-value blocking rules
- Fail safe on invalid oversized updates

Residual risk:

- Temporary drop in blocking coverage until optimized update is released.

## 6) Extension State Manipulation

Risk:

- Malicious interactions attempt to force disabled state or persistent pause.

Mitigations:

- Message handling with explicit command allowlist
- Validate message payloads and types
- Timer-based auto-resume from temporary disable
- Keep minimal exposed surface (no external messaging by default)

Residual risk:

- User-driven disable remains possible by design.

## 7) Notification Abuse / Social Engineering

Risk:

- Misleading notifications could influence user behavior.

Mitigations:

- Keep concise factual notification copy
- Only notify for update status and actionable failures
- No links in notifications

Residual risk:

- User habituation to repetitive notifications.

## Control Checklist

- [ ] Enforce HTTPS and certificate validity for update channel
- [ ] Implement checksum + signature verification
- [ ] Add schema validator for metadata and rules package
- [ ] Implement atomic apply + rollback transaction
- [ ] Add CI sanity checks for source and compiled rules
- [ ] Remove non-essential permissions before store submission
- [ ] Verify no telemetry or URL-level logging remains

## Incident Response Plan (Security/Integrity)

1. Detect issue (user reports, QA, monitoring of update failures)
2. Freeze update rollout
3. Revert to last-known-good rules package
4. Publish incident note and mitigation summary
5. Patch pipeline/control weakness
6. Resume rollout with staged validation

## Review Cadence

- Review this threat model at each major milestone (M1-M5)
- Mandatory review before store submissions and major permission changes
