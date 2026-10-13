import type { DnrRule, NormalizedRule } from "../types";

const DEFAULT_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "script",
  "xmlhttprequest",
  "image",
  "media",
  "ping"
];

export function compileToDnr(normalizedRules: NormalizedRule[]): DnrRule[] {
  return normalizedRules.map((rule, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "block"
    },
    condition: {
      urlFilter: rule.filter,
      resourceTypes: DEFAULT_RESOURCE_TYPES
    }
  }));
}
