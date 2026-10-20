# Strict Ad Blocker

Development-stage Chrome/Edge Manifest V3 extension with aggressive global ad/tracker filtering. See the [development plan](AD_BLOCKER_DEVELOPMENT_PLAN.md), [architecture](docs/architecture.md), and [verification status](docs/verification-status.md).

## Local Setup

Node dependencies are local to this project; no Python virtual environment or global npm package installation is needed.

```sh
# With nvm installed:
nvm install
nvm use
npm ci
npm run typecheck
npm test
npm run build:rules:offline
```

Load `extension/` as an unpacked extension from `chrome://extensions` or `edge://extensions`. See the [manual test checklist](docs/manual-smoke-test.md). Generated pipeline output does not automatically replace the bundled extension rules.

## Current Limitations

- Public list ingestion works, but conservative exception handling currently yields inadequate coverage; live builds reject near-empty packages.
- Offline output is a test fixture, not a production release.
- Update endpoint and publisher signatures are not configured.
- Counters use a development-only API; browser tests and video effectiveness are not verified.

See [pipeline commands and syntax](rules-pipeline/README.md) and [release blockers](docs/phase-6-review.md).
