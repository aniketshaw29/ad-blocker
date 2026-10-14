import type { NormalizedRule, OverridesFile, RawRule } from "../types";

const TRACKER_HINTS = [
  "analytics",
  "tracker",
  "pixel",
  "metrics",
  "beacon",
  "telemetry"
];

const VIDEO_HINTS = [
  "youtube",
  "ytimg",
  "googlevideo",
  "doubleclick",
  "ads",
  "adservice"
];

export function normalizeRules(rawRules: RawRule[], overrides: OverridesFile): NormalizedRule[] {
  const fromSources = rawRules
    .map((raw) => normalizeSingle(raw))
    .filter((rule): rule is NormalizedRule => Boolean(rule));

  const fromOverrides = overrides.block.map((filter) => toNormalizedRule(filter, "override"));

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

  return toNormalizedRule(value, rawRule.sourceId);
}

function toNormalizedRule(filter: string, sourceId: string): NormalizedRule {
  const value = filter.toLowerCase();

  if (includesAny(value, VIDEO_HINTS)) {
    return {
      filter,
      sourceId,
      category: "video",
      priority: 3
    };
  }

  if (includesAny(value, TRACKER_HINTS)) {
    return {
      filter,
      sourceId,
      category: "tracker",
      priority: 2
    };
  }

  return {
    filter,
    sourceId,
    category: "general",
    priority: 1
  };
}

function includesAny(input: string, needles: string[]): boolean {
  return needles.some((needle) => input.includes(needle));
}
