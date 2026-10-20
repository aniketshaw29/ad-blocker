# Rules Pipeline

## Run

Requires Node.js 22 or newer. Dependencies are installed locally in `node_modules/`, not globally. `package-lock.json` pins dependency versions and `.nvmrc` records the runtime used for verification.

If you use nvm, activate the project runtime from the project root:

```sh
nvm install
nvm use
```

Then run:

```sh
npm ci
npm run typecheck
npm test
npm run build:rules:offline
npm run build:rules
npm run release:rules:preview
```

The offline build uses committed fixtures and performs no downloads. The live build downloads configured lists. The release preview prints information only; it does not publish anything.

Python virtual environments are not used because the pipeline is TypeScript/Node.js. npm scripts resolve the project's local TypeScript and tsx executables. `node_modules/` and generated output are excluded from Git.

## Supported Syntax

The tested subset is domain-anchored network blocks such as `||ads.example.com^`, optionally with these translated restrictions:

- Resource types: `script`, `image`, `stylesheet`, `font`, `media`, `object`, `subdocument`, `xmlhttprequest`, `ping`, `websocket`, `other`, and their `~` exclusions.
- `third-party` and `~third-party`, mapped to DNR `domainType`.
- `domain=site.test|~excluded.site.test`, mapped to initiator domain conditions.

Resource restrictions are explicit DNR conditions, not URL-filter text. Domain case is normalized, exact duplicate filters removed, and output sorted. Unknown, duplicate/conflicting options, paths, regular expressions, and cosmetic filters are reported as unsupported rather than widened into unrestricted rules. Domain options currently require dotted DNS names.

The runtime updater validates and preserves supported resource, initiator-domain, and party restrictions. Local mocked-runtime tests cover preservation and checksum compatibility; hosted and browser update tests remain pending.

Source exceptions conservatively exclude overlapping domain blocks. An exception that cannot be interpreted suppresses source-derived blocks for the build; explicit curated overrides remain eligible. This intentionally sacrifices coverage until a fuller exception-aware translator exists. `allow` overrides exclude domain blocks during compilation; they are not browser per-site controls. Malformed curated overrides fail the build.

Video path candidates in `config/video-overrides.json` are counted as skipped, pending a tested translator. They are not included in pipeline output. Bundled candidate video rules remain separate and unverified.

`output/build-report.json` records ignored, unsupported, excluded, duplicate, and emitted counts. Packages exceeding 4,999 rules fail rather than silently truncating; one slot is reserved for the current pause override. This is a conservative project budget, not a claim about every browser's API limit.

Live builds also fail before writing artifacts if fewer than 100 rules are emitted. The current exception strategy produces inadequate coverage on real EasyList/EasyPrivacy input; this failure is expected until fuller exception translation is implemented. Existing output may be from an earlier build—always check command success and metadata before using it. Offline builds are fixtures, not production rule packages.

Build flow:

1. Load enabled sources from `config/sources.json`
2. Download source lists
3. Normalize and deduplicate rules
4. Apply domain overrides from `config/overrides.json`
5. Compile to MV3 DNR format
6. Validate compiled output
7. Write artifacts to `output/`

Aggressive profile features:

- Categorizes supported domain rules as general or tracker
- Assigns stronger priorities to tracker rules
- Keeps video path candidates separate until translation is implemented

Artifacts:

- `output/ruleset_main.json`
- `output/metadata.json`

Planned hardening:

- Signature verification support
- Rule budget and performance checks
- Staged release controls
