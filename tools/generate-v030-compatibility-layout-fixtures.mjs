import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveLayoutBindings } from "../js/v030-layout-compatibility.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const fixtureDirectory = path.join(root, "tests", "fixtures", "model-contract");
const snapshot = JSON.parse(fs.readFileSync(path.join(fixtureDirectory, "v030-variable-officials-feed-venue-normalized.json"), "utf8"));

const layout = {
  schemaVersion: 7,
  name: "Build 004.6 representative legacy layout",
  mappings: [
    { slot: "title", field: "away.teamName" },
    { slot: "date", field: "game.date" },
    { slot: "official", field: "game.umpires.home.name" },
    { slot: "unknown-one", field: "extension.futureField" },
    { slot: "unknown-two", field: "extension.futureField" }
  ],
  repeatedBlocks: [
    {
      collection: "away.lineup",
      columns: [{ field: "away.lineup[].player.name", slot: 1 }]
    },
    {
      collection: "away.bullpen",
      columns: [
        { field: "away.bullpen[].player.name", slot: 1 },
        { field: "away.bullpen[].player.name", slot: 2 }
      ]
    }
  ],
  individualMappings: [
    { field: "away.startingPitcher.name" },
    { field: "away.startingPitcher.stats.record" }
  ],
  metadata: { customPayload: { field: "extension.preservedMetadataField" } }
};

const resolved = resolveLayoutBindings(snapshot, layout);
const output = {
  fixtureVersion: 1,
  description: "Representative saved-layout compatibility cases for Build 004.6.",
  layout,
  expected: {
    aliasesCanonicalized: resolved.aliasesCanonicalized,
    diagnostics: resolved.diagnostics,
    bindings: resolved.bindings.map(({ path: bindingPath, requestedFieldId, fieldId, supported, displayValue, resolution }) => ({
      path: bindingPath,
      requestedFieldId,
      fieldId,
      supported,
      displayValue,
      state: resolution.state,
      disposition: resolution.disposition
    }))
  }
};

fs.writeFileSync(path.join(fixtureDirectory, "v030-compatibility-layout-cases.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${output.expected.bindings.length} layout compatibility bindings.`);

