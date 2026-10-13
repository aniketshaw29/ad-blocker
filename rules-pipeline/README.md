# Rules Pipeline

Build flow:

1. Load enabled sources from `config/sources.json`
2. Download source lists
3. Normalize and deduplicate rules
4. Apply overrides from `config/overrides.json`
5. Compile to MV3 DNR format
6. Validate compiled output
7. Write artifacts to `output/`

Artifacts:

- `output/ruleset_main.json`
- `output/metadata.json`

Planned hardening:

- Signature verification support
- Rule budget and performance checks
- Staged release controls
