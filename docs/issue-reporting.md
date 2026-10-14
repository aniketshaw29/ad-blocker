# Reporting Ads or Site Breakage

Use the GitHub issue form once this repository is hosted on GitHub. Until then, use the following template with the project's published support contact.

## Report Template

- Problem: ads remain / tracker remains / site breaks / popup or pause fails / updates fail
- Browser and version:
- Extension version:
- Rules version, if available:
- Public page URL or domain:
- Reproduction steps:
- Expected behavior:
- Actual behavior:
- Does turning blocking off change the result?
- Sanitized screenshot or error text (optional):

Remove account IDs and tokens from URLs. Do not include passwords, cookies, payment information, authentication headers, or complete network captures. A report is voluntary and may be publicly visible; use a sanitized public reproduction where possible.

## Maintainer Workflow

1. Check duplicates and missing reproduction details.
2. Reproduce on Chrome and Edge as relevant.
3. Classify as rule, compiler, runtime, updater, or platform limitation.
4. Assign priority using the [hotfix runbook](hotfix-runbook.md).
5. Link the fix, test evidence, and corrective release version.
6. Close with a concise resolution or documented limitation.
