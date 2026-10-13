import { readJsonFile } from "../fs-utils";
import type { RawRule, SourceConfig, SourcesFile } from "../types";

export async function loadSourcesConfig(filePath: string): Promise<SourceConfig[]> {
  const config = await readJsonFile<SourcesFile>(filePath);
  return config.sources.filter((source) => source.enabled);
}

export async function ingestSources(sources: SourceConfig[]): Promise<RawRule[]> {
  const allRules: RawRule[] = [];

  for (const source of sources) {
    const rules = await ingestAdblockSource(source);
    allRules.push(...rules);
  }

  return allRules;
}

async function ingestAdblockSource(source: SourceConfig): Promise<RawRule[]> {
  if (source.format !== "adblock") {
    return [];
  }

  const response = await fetch(source.url);
  if (!response.ok) {
    throw new Error(`Failed to download source ${source.id}: ${response.status}`);
  }

  const text = await response.text();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("!"))
    .map((raw) => ({ sourceId: source.id, raw }));
}
