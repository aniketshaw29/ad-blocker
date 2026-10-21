import type { NormalizedRule } from "../types";

export const PACKAGE_RULE_BUDGET = 4999;

export function selectRulesWithinBudget(rules: NormalizedRule[], budget = PACKAGE_RULE_BUDGET) {
  if (!Number.isInteger(budget) || budget < 1 || budget > PACKAGE_RULE_BUDGET) {
    throw new Error("Invalid package rule budget");
  }
  // Curated rules first, then tracker-priority rules, then stable filter order.
  // This is a deterministic subset, not full EasyList/EasyPrivacy coverage.
  const ranked = [...rules].sort((a, b) =>
    Number(b.sourceId === "override") - Number(a.sourceId === "override") ||
    b.priority - a.priority || a.filter.localeCompare(b.filter, "en"));
  return { selected: ranked.slice(0, budget), deferred: Math.max(0, rules.length - budget) };
}
