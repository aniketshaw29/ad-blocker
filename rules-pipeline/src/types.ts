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

export interface RawRule {
  sourceId: string;
  raw: string;
}

export interface NormalizedRule {
  filter: string;
  sourceId: string;
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
  };
}

export interface CompiledPackage {
  generatedAt: string;
  version: string;
  rules: DnrRule[];
  sourceIds: string[];
}
