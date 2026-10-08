import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSemanticRequestKey } from "../js/v030-adapters.js";
import {
  V030_PERSISTENCE_NAMESPACES,
  V030_PERSISTENCE_STORES,
  buildAdapterResultStorageKey,
  buildNormalizedSnapshotStorageKey
} from "../js/v030-persistence.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adapterContractRevision = "0.3.0-draft.1";
const snapshots = [
  { id: "current", schemaVersion: 2, contractRevision: "0.3.0-draft.1", gamePk: "800047", selectedViewKey: "800047:2025-07-03:1" },
  { id: "schema-v1", schemaVersion: 1, contractRevision: "0.2.0", gamePk: "800047", selectedViewKey: "800047:2025-07-03:1" },
  { id: "other-view", schemaVersion: 2, contractRevision: "0.3.0-draft.1", gamePk: "800047", selectedViewKey: "800047:2025-07-04:1" }
].map((entry) => ({ ...entry, key: buildNormalizedSnapshotStorageKey(entry) }));

const adapterInputs = [
  { id: "roster-date-a", adapter: "roster", input: { teamId: 147, date: "2025-07-03" } },
  { id: "roster-date-b", adapter: "roster", input: { teamId: 147, date: "2025-07-04" } },
  { id: "people-regular", adapter: "people", input: { personIds: [1, 2], sportId: 1, gameTypes: ["R"], statGroups: ["hitting"], startDate: "2025-01-01", endDate: "2025-07-03" } },
  { id: "people-spring", adapter: "people", input: { personIds: [1, 2], sportId: 1, gameTypes: ["S"], statGroups: ["hitting"], startDate: "2025-01-01", endDate: "2025-07-03" } }
].map((entry) => {
  const requestKey = buildSemanticRequestKey(entry.adapter, entry.input);
  return { ...entry, requestKey, storageKey: buildAdapterResultStorageKey({ adapterContractRevision, requestKey }) };
});

const output = {
  fixtureVersion: 1,
  description: "Build 004.7 persistence namespace, version, and semantic-scope collision controls.",
  stores: V030_PERSISTENCE_STORES,
  namespaces: V030_PERSISTENCE_NAMESPACES,
  snapshots,
  adapterInputs,
  refreshPolicy: {
    lookupOnly: ["selection", "consumer-demand"],
    retryFailedOnly: "retry-failed-units",
    invalidatingExamples: ["status-transition", "cutoff-change", "manual"],
    logoTtlSeconds: 1209600
  }
};

const outputPath = path.join(root, "tests", "fixtures", "model-contract", "v030-persistence-cases.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${snapshots.length} snapshot keys and ${adapterInputs.length} adapter keys.`);

