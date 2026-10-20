export type SourceFormat = "adblock";

export interface SourceConfig {
  id: string;
  enabled: boolean;
  format: SourceFormat;
  url: string;
}

export interface SourcesFile {
  sources: SourceConfig[];
}

export interface OverridesFile {
  allow: string[];
  block: string[];
  remove: string[];
}

export interface VideoOverridesFile {
  videoBlock: string[];
}

export interface RawRule {
  sourceId: string;
  raw: string;
}

export interface NormalizedRule {
  filter: string;
  sourceId: string;
  category: "general" | "tracker" | "video";
  priority: number;
  condition?: DnrRule["condition"];
}

export interface DnrRule {
  id: number;
  priority: number;
  action: {
    type: "block";
  };
  condition: {
    urlFilter: string;
    resourceTypes: string[];
    excludedResourceTypes?: string[];
    domainType?: "thirdParty" | "firstParty";
    initiatorDomains?: string[];
    excludedInitiatorDomains?: string[];
  };
}

export interface CompiledPackage {
  generatedAt: string;
  version: string;
  rules: DnrRule[];
  sourceIds: string[];
}
