import type { DnrRule } from "../types";

export function validateDnrRules(rules: DnrRule[]): void {
  // Reserve one slot for the runtime pause override in the current 5,000-rule budget.
  if (rules.length > 4999) throw new Error("Rules exceed the current 4,999-rule package budget");
  if (rules.length === 0) {
    throw new Error("Compiled ruleset is empty");
  }

  const ids = new Set<number>();

  for (const rule of rules) {
    if (ids.has(rule.id)) {
      throw new Error(`Duplicate rule id detected: ${rule.id}`);
    }

    ids.add(rule.id);

    if (!rule.condition?.urlFilter) {
      throw new Error(`Rule ${rule.id} missing urlFilter`);
    }
  }
}
