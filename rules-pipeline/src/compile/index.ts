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

const TRACKER_RESOURCE_TYPES = ["script", "xmlhttprequest", "image", "ping"];
const VIDEO_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "script",
  "xmlhttprequest",
  "media"
];

export function compileToDnr(normalizedRules: NormalizedRule[]): DnrRule[] {
  return normalizedRules.map((rule, index) => ({
    id: index + 1,
    priority: rule.priority,
    action: {
      type: "block"
    },
    condition: {
      urlFilter: rule.filter,
      resourceTypes: toResourceTypes(rule)
    }
  }));
}

function toResourceTypes(rule: NormalizedRule): string[] {
  if (rule.category === "tracker") {
    return TRACKER_RESOURCE_TYPES;
  }

  if (rule.category === "video") {
    return VIDEO_RESOURCE_TYPES;
  }

  return DEFAULT_RESOURCE_TYPES;
}
