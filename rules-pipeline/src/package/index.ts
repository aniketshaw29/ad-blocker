import { createHash } from "node:crypto";
import type { CompiledPackage, DnrRule } from "../types";

export function buildCompiledPackage(params: {
  version: string;
  rules: DnrRule[];
  sourceIds: string[];
}): CompiledPackage {
  return {
    generatedAt: new Date().toISOString(),
    version: params.version,
    rules: params.rules,
    sourceIds: params.sourceIds
  };
}

export function checksumOfJson(value: unknown): string {
  const json = JSON.stringify(value);
  return createHash("sha256").update(json).digest("hex");
}
