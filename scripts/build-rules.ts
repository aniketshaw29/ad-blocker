import path from "node:path";
import { compileToDnr } from "../rules-pipeline/src/compile";
import { readJsonFile, writeJsonFile } from "../rules-pipeline/src/fs-utils";
import { ingestSources, loadSourcesConfig } from "../rules-pipeline/src/ingest";
import { normalizeRules } from "../rules-pipeline/src/normalize";
import { buildCompiledPackage, checksumOfJson } from "../rules-pipeline/src/package";
import type { OverridesFile } from "../rules-pipeline/src/types";
import { validateDnrRules } from "../rules-pipeline/src/validate";

async function main() {
  const root = path.resolve(__dirname, "..");
  const sourcesPath = path.join(root, "rules-pipeline/config/sources.json");
  const overridesPath = path.join(root, "rules-pipeline/config/overrides.json");
  const outputDir = path.join(root, "rules-pipeline/output");

  const version = `rules-${new Date().toISOString().slice(0, 10)}`;
  const sources = await loadSourcesConfig(sourcesPath);
  const overrides = await readJsonFile<OverridesFile>(overridesPath);
  const rawRules = await ingestSources(sources);
  const normalized = normalizeRules(rawRules, overrides);
  const compiled = compileToDnr(normalized);

  validateDnrRules(compiled);

  const pack = buildCompiledPackage({
    version,
    rules: compiled,
    sourceIds: sources.map((s) => s.id)
  });

  const metadata = {
    version: pack.version,
    generatedAt: pack.generatedAt,
    ruleCount: pack.rules.length,
    sourceIds: pack.sourceIds,
    rulesFile: "ruleset_main.json",
    checksumSha256: checksumOfJson(pack.rules)
  };

  await writeJsonFile(path.join(outputDir, "ruleset_main.json"), pack.rules);
  await writeJsonFile(path.join(outputDir, "metadata.json"), metadata);

  process.stdout.write(
    `Built ${pack.rules.length} rules from ${sources.length} sources. Version: ${pack.version}\n`
  );
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
