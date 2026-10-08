import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const sourcePath = path.join(root, "tests", "fixtures", "model-contract", "v030-adapter-registry.json");
const outputPath = path.join(root, "js", "v030-adapter-definitions.js");
const registry = JSON.parse(await readFile(sourcePath, "utf8"));

const banner = `/**\n * Generated from tests/fixtures/model-contract/v030-adapter-registry.json.\n * Run tools/generate-v030-adapter-definitions.mjs to refresh.\n */\n\n`;
const deepFreeze = `function deepFreeze(value) {\n  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;\n  for (const child of Object.values(value)) deepFreeze(child);\n  return Object.freeze(value);\n}\n\n`;
const body = `export const V030_ADAPTER_REGISTRY = deepFreeze(${JSON.stringify(registry, null, 2)});\n\nexport const ADAPTER_DEFINITIONS = V030_ADAPTER_REGISTRY.adapters;\n`;

await writeFile(outputPath, banner + deepFreeze + body, "utf8");
console.log(`Wrote ${registry.adapters.length} adapter declarations to ${outputPath}`);
