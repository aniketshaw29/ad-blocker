import type { NormalizedRule, OverridesFile, RawRule } from "../types";

export function normalizeRules(rawRules: RawRule[], overrides: OverridesFile): NormalizedRule[] {
  const fromSources = rawRules
    .map((raw) => normalizeSingle(raw))
    .filter((rule): rule is NormalizedRule => Boolean(rule));

  const fromOverrides = overrides.block.map((filter) => ({
    filter,
    sourceId: "override"
  }));

  const removed = new Set(overrides.remove);
  const dedup = new Map<string, NormalizedRule>();

  for (const rule of [...fromSources, ...fromOverrides]) {
    if (removed.has(rule.filter)) {
      continue;
    }

    if (!dedup.has(rule.filter)) {
      dedup.set(rule.filter, rule);
    }
  }

  for (const allowRule of overrides.allow) {
    dedup.delete(allowRule);
  }

  return Array.from(dedup.values());
}

function normalizeSingle(rawRule: RawRule): NormalizedRule | null {
  const value = rawRule.raw.trim();

  if (!value || value.startsWith("[") || value.startsWith("@@")) {
    return null;
  }

  if (!value.startsWith("||")) {
    return null;
  }

  return {
    filter: value,
    sourceId: rawRule.sourceId
  };
}
