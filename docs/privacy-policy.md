# Privacy Policy - Strict Ad Blocker (Draft)

Last updated: 2026-10-20

## Overview

Strict Ad Blocker is built to block ads and trackers while protecting your privacy. We do not collect, sell, or share your personal data.

## Data We Collect

We do not collect personal data.

We do not collect:

- Browsing history
- Page content
- Search queries
- Account identifiers
- IP addresses for analytics purposes

## Data Processed Locally on Your Device

The extension stores limited operational data in local browser storage to function correctly:

- Global enabled/disabled state
- Temporary pause timer state
- Local blocked request counters (session and total)
- Local rule version and update status metadata

This data remains on your device and is not transmitted to us.

## Network Requests

The extension may make network requests for rule updates (for example, metadata and rule package files). These requests are used only to download blocking rules.

We do not attach user profiling identifiers to update requests.

The update endpoint is not yet configured in this development build. Once configured, the selected hosting provider may receive network metadata such as your IP address and request time. Its identity, access-log practices, and retention must be documented here before publication.

## Telemetry and Analytics

Strict Ad Blocker does not include telemetry, analytics, usage tracking, or crash-reporting uploads.

## Data Sharing and Sale

We do not sell, rent, or share your personal data with third parties.

## Permissions Use

The extension requests permissions required for core functionality, such as:

- Network request filtering via MV3 declarativeNetRequest
- Local storage for extension settings/state
- Alarms for periodic rule updates and pause timers
- Notifications for update status

These permissions are used only for extension behavior described in this policy.

## Data Retention

Local extension state remains in your browser profile until you clear extension data or uninstall the extension.

## Security

We apply integrity checks and safe update practices for rule updates (such as validation and rollback strategy) to reduce risk from malformed or tampered updates.

The development updater includes checksum/schema validation and a failed-apply recovery path. Publisher signature verification and hosted/browser validation are still pending; checksum validation alone does not authenticate a publisher.

## Children

Strict Ad Blocker is not directed to children and does not knowingly collect personal information from children.

## Changes to This Policy

If we change this policy, we will update the "Last updated" date and publish the revised text.

## Contact

For privacy questions, contact: `privacy@your-domain.example`

Replace the contact with your real address before publishing.
