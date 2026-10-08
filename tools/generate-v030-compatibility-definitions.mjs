import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "tests/fixtures/model-contract/v030-compatibility-map.json");
const outputPath = resolve(root, "js/v030-compatibility-definitions.js");
const map = JSON.parse(await readFile(sourcePath, "utf8"));

const payload = {
  schemaId: map.schemaId,
  schemaVersion: map.schemaVersion,
  contractRevision: map.contractRevision,
  sourceModel: map.sourceModel,
  targetModel: map.targetModel,
  capabilityVocabulary: map.capabilityVocabulary,
  aliases: map.aliases,
  fields: map.fields,
  unknownFieldPolicy: map.unknownFieldPolicy,
  persistencePolicy: map.persistencePolicy
};

const source = `/**\n * Generated Scorecard Studio v0.3.0 compatibility declarations.\n * Source: tests/fixtures/model-contract/v030-compatibility-map.json\n * Regenerate with tools/generate-v030-compatibility-definitions.mjs.\n */\n\nfunction deepFreeze(value) {\n  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;\n  Object.freeze(value);\n  for (const child of Object.values(value)) deepFreeze(child);\n  return value;\n}\n\nexport const V030_COMPATIBILITY_DEFINITIONS = deepFreeze(${JSON.stringify(payload, null, 2)});\nexport const COMPATIBILITY_FIELDS = V030_COMPATIBILITY_DEFINITIONS.fields;\nexport const COMPATIBILITY_ALIASES = V030_COMPATIBILITY_DEFINITIONS.aliases;\n`;

await writeFile(outputPath, source);
console.log(`Generated ${map.fields.length} compatibility field declarations.`);

