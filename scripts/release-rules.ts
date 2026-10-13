import path from "node:path";
import { readFile } from "node:fs/promises";

async function main() {
  const root = path.resolve(__dirname, "..");
  const metadataPath = path.join(root, "rules-pipeline/output/metadata.json");

  const metadataRaw = await readFile(metadataPath, "utf8");
  const metadata = JSON.parse(metadataRaw) as {
    version: string;
    ruleCount: number;
    checksumSha256: string;
  };

  process.stdout.write(
    `Release stub: publish version ${metadata.version} with ${metadata.ruleCount} rules (${metadata.checksumSha256}).\n`
  );
  process.stdout.write("Next: upload metadata.json and ruleset_main.json to your update endpoint.\n");
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
