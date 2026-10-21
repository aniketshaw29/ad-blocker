import path from "node:path";
import { readFile } from "node:fs/promises";
import { compileToDnr } from "../rules-pipeline/src/compile";
import { selectRulesWithinBudget } from "../rules-pipeline/src/compile/budget";
import { readJsonFile, writeJsonFile } from "../rules-pipeline/src/fs-utils";
import { ingestSources, loadSourcesConfig } from "../rules-pipeline/src/ingest";
import { normalizeWithReport } from "../rules-pipeline/src/normalize";
import { buildCompiledPackage, checksumOfJson } from "../rules-pipeline/src/package";
import type { OverridesFile, VideoOverridesFile } from "../rules-pipeline/src/types";
import { validateDnrRules } from "../rules-pipeline/src/validate";

async function main() {
  const root = path.resolve(__dirname, "..");
  const sourcesPath = path.join(root, "rules-pipeline/config/sources.json");
  const overridesPath = path.join(root, "rules-pipeline/config/overrides.json");
  const videoOverridesPath = path.join(root, "rules-pipeline/config/video-overrides.json");
  const outputDir = path.join(root, "rules-pipeline/output");

  const version = `rules-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const offline = process.argv.includes("--offline");
  const sources = offline ? [] : await loadSourcesConfig(sourcesPath);
  const overrides = await readJsonFile<OverridesFile>(overridesPath);
  const videoOverrides = await readJsonFile<VideoOverridesFile>(videoOverridesPath);
  const rawRules = offline
    ? (await readFile(path.join(root, "rules-pipeline/tests/fixtures/filters.txt"), "utf8"))
        .split("\n").map((raw) => ({ sourceId: "offline-fixture", raw }))
    : await ingestSources(sources);
  // Video path patterns remain candidates until a path-aware translator is tested.
  const { rules: normalized, report } = normalizeWithReport(rawRules, overrides);
  const { selected, deferred } = selectRulesWithinBudget(normalized);
  const compiled = compileToDnr(selected);

  validateDnrRules(compiled);
  if (!offline && compiled.length < 100) {
    throw new Error(`Live build coverage is too low (${compiled.length} rules). No artifacts written; improve exception translation before publishing.`);
  }

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
  await writeJsonFile(path.join(outputDir, "build-report.json"), {
    offline, ...report, emitted: compiled.length, budgetDeferred: deferred,
    selectionPolicy: "curated-first, priority-descending, filter-ascending",
    videoCandidatesSkipped: videoOverrides.videoBlock.length
  });

  process.stdout.write(
    `Built ${pack.rules.length} rules from ${sources.length} sources (${normalized.length} eligible, ${deferred} deferred by budget). Version: ${pack.version}\n`
  );
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
