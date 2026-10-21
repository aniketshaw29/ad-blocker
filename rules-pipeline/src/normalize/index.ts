import type { NormalizedRule, OverridesFile, RawRule } from "../types";

export interface ParseReport {
  input: number;
  ignored: number;
  unsupported: number;
  excluded: number;
  duplicates: number;
  output: number;
  exceptionCount: number;
  unsupportedExceptions: number;
  projectedExceptionResourceTypes: string[];
  projectedExceptionInitiators: string[];
}

// Domain anchors plus explicitly translated options only.
const DOMAIN_BLOCK = /^\|\|([a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)\^$/i;

function domainOf(filter: string): string | null {
  const domain = DOMAIN_BLOCK.exec(filter)?.[1]?.toLowerCase();
  if (!domain || !domain.includes(".") || domain.split(".").some((label) =>
    !label || label.startsWith("-") || label.endsWith("-"))) return null;
  return domain;
}

const RESOURCE_OPTIONS: Record<string, string> = {
  script: "script", image: "image", stylesheet: "stylesheet", font: "font",
  media: "media", object: "object", subdocument: "sub_frame",
  xmlhttprequest: "xmlhttprequest", ping: "ping", websocket: "websocket",
  other: "other"
};
const ALL_RESOURCE_TYPES = ["main_frame", "sub_frame", "script", "image", "stylesheet",
  "font", "media", "object", "xmlhttprequest", "ping", "websocket", "csp_report", "other"];

function parseBlock(value: string): { domain: string; filter: string; condition: NormalizedRule["condition"] } | null {
  const [anchor, options, extra] = value.split("$");
  const domain = domainOf(anchor);
  if (!domain || extra !== undefined || options === "") return null;
  const condition: NonNullable<NormalizedRule["condition"]> = {
    urlFilter: `||${domain}^`, resourceTypes: [...ALL_RESOURCE_TYPES]
  };
  const included = new Set<string>();
  const excluded = new Set<string>();
  const seen = new Set<string>();
  for (const option of options?.split(",") ?? []) {
    const key = option.replace(/^~/, "").split("=")[0];
    if (seen.has(key)) return null;
    seen.add(key);
    if (RESOURCE_OPTIONS[key] && !option.includes("=")) {
      (option.startsWith("~") ? excluded : included).add(RESOURCE_OPTIONS[key]);
    } else if (option === "third-party" || option === "~third-party") {
      condition.domainType = option.startsWith("~") ? "firstParty" : "thirdParty";
    } else if (option.startsWith("domain=")) {
      const domains: string[] = [];
      const excludedDomains: string[] = [];
      for (const entry of option.slice(7).split("|")) {
        const parsed = domainOf(`||${entry.replace(/^~/, "")}^`);
        if (!parsed) return null;
        (entry.startsWith("~") ? excludedDomains : domains).push(parsed);
      }
      if (domains.length) condition.initiatorDomains = domains.sort();
      if (excludedDomains.length) condition.excludedInitiatorDomains = excludedDomains.sort();
    } else return null;
  }
  condition.resourceTypes = (included.size ? [...included] : ALL_RESOURCE_TYPES)
    .filter((type) => !excluded.has(type)).sort();
  if (!condition.resourceTypes.length) return null;
  const filter = `${condition.urlFilter}${options ? `$${options}` : ""}`;
  return { domain, filter, condition };
}

export function normalizeWithReport(rawRules: RawRule[], overrides: OverridesFile): {
  rules: NormalizedRule[]; report: ParseReport;
} {
  const report: ParseReport = { input: rawRules.length, ignored: 0, unsupported: 0,
    excluded: 0, duplicates: 0, output: 0, exceptionCount: 0, unsupportedExceptions: 0,
    projectedExceptionResourceTypes: [], projectedExceptionInitiators: [] };
  const excludedDomains = new Set<string>();
  const removed = new Set(overrides.remove.map((value) => value.trim().toLowerCase()));
  for (const filter of overrides.allow) {
    const domain = domainOf(filter.trim());
    if (!domain) throw new Error(`Unsupported allow override: ${filter}`);
    excludedDomains.add(domain);
  }
  // Project exceptions conservatively: exclude target domains, initiators or
  // resource types rather than broadening a block across an exception.
  const exceptionHosts: string[] = [];
  const exceptionInitiators = new Set<string>();
  const exceptionTypes = new Set<string>();
  let excludeAllSourceRules = false;
  for (const { raw } of rawRules) {
    const value = raw.trim();
    if (!value.startsWith("@@")) continue;
    report.exceptionCount++;
    const body = value.slice(2);
    const options = body.split("$")[1]?.split(",") ?? [];
    // Cosmetic-only exceptions cannot conflict with network blocks.
    if (options.some((option) => ["generichide", "elemhide", "specifichide"].includes(option)) && options.every((option) =>
      ["generichide", "elemhide", "specifichide"].includes(option) || option.startsWith("domain="))) {
      continue;
    }
    const host = /^(?:\|\||\|?https?:\/\/)([^/^$?:]+)/i.exec(body)?.[1]?.toLowerCase();
    if (host && /^[a-z0-9.*-]+$/.test(host)) {
      if (host.includes("*")) exceptionHosts.push(host);
      else excludedDomains.add(host);
      continue;
    }
    report.unsupportedExceptions++;
    const initiators = options.find((option) => option.startsWith("domain="))?.slice(7).split("|");
    if (initiators?.length && initiators.every((entry) => !entry.startsWith("~") && domainOf(`||${entry}^`))) {
      for (const domain of initiators) exceptionInitiators.add(domain.toLowerCase());
      continue;
    }
    const types = options.filter((option) => RESOURCE_OPTIONS[option]).map((option) => RESOURCE_OPTIONS[option]);
    if (types.length) for (const type of types) exceptionTypes.add(type);
    else excludeAllSourceRules = true;
  }
  const dedup = new Map<string, NormalizedRule>();
  const candidates = [...rawRules, ...overrides.block.map((raw) => ({ raw, sourceId: "override" }))];
  for (const { raw, sourceId } of candidates) {
    const value = raw.trim();
    if (!value || value.startsWith("!") || value.startsWith("[")) { report.ignored++; continue; }
    if (value.startsWith("@@")) { report.excluded++; continue; }
    const parsed = parseBlock(value);
    if (!parsed) {
      if (sourceId === "override") throw new Error(`Unsupported block override: ${value}`);
      report.unsupported++; continue;
    }
    const { domain, filter, condition } = parsed;
    const overlapsException = [...excludedDomains].some((excluded) =>
      domain === excluded || domain.endsWith(`.${excluded}`) || excluded.endsWith(`.${domain}`));
    const wildcardOverlap = exceptionHosts.some((host) => {
      // A wildcard host's fixed prefix/suffix conservatively identifies domains
      // potentially covered by the exception, including ancestor block rules.
      const fixed = host.split("*").filter(Boolean);
      return fixed.some((part) => domain.includes(part.replace(/^\.|\.$/g, ""))) ||
        fixed.length === 0;
    });
    if (removed.has(filter.toLowerCase()) || overlapsException || wildcardOverlap ||
        (excludeAllSourceRules && sourceId !== "override")) {
      report.excluded++; continue;
    }
    if (sourceId !== "override" && condition) {
      condition.resourceTypes = condition.resourceTypes.filter((type) => !exceptionTypes.has(type));
      if (!condition.resourceTypes.length) { report.excluded++; continue; }
      const domains = [...new Set([...(condition.excludedInitiatorDomains ?? []), ...exceptionInitiators])].sort();
      if (domains.length) condition.excludedInitiatorDomains = domains;
    }
    if (dedup.has(filter)) {
      report.duplicates++;
      if (sourceId !== "override") continue;
    }
    const tracker = /analytics|tracker|metrics|telemetry/.test(domain);
    dedup.set(filter, { filter, sourceId, category: tracker ? "tracker" : "general",
      priority: tracker ? 2 : 1, condition });
  }
  const rules = [...dedup.values()].sort((a, b) => a.filter.localeCompare(b.filter, "en"));
  report.output = rules.length;
  report.projectedExceptionResourceTypes = [...exceptionTypes].sort();
  report.projectedExceptionInitiators = [...exceptionInitiators].sort();
  return { rules, report };
}

export function normalizeRules(rawRules: RawRule[], overrides: OverridesFile): NormalizedRule[] {
  return normalizeWithReport(rawRules, overrides).rules;
}
