/**
 * Scorecard Studio v0.4 restore conflict resolution and atomic commit orchestration.
 * Product UI is intentionally deferred; callers must supply explicit decisions.
 */

import { commitBackupRestoreOperations } from "./storage.js";

export const RESTORE_POLICIES = Object.freeze({
  REPLACE: "replace",
  KEEP_BOTH: "keepBoth",
  SKIP: "skip"
});

const COMMIT_PLAN_KIND = "scorecard-studio-restore-commit-plan-v1";

export function createRestoreCommitPlan(preflight, decisions = {}, options = {}) {
  if (!preflight?.valid || !preflight?.plan || !preflight?.prepared) throw new Error("A valid backup preflight result is required.");
  if (preflight.writesPerformed !== 0) throw new Error("Preflight result is not read-only.");
  if (!options.currentStorage || typeof options.currentStorage !== "object") throw new Error("The current storage snapshot used for conflict planning is required.");
  const committedAtUtc = options.committedAtUtc || new Date().toISOString();
  if (!validDateTime(committedAtUtc)) throw new Error("Restore commit time must be an ISO date-time.");

  const current = options.currentStorage || {};
  const reservedLayoutIds = new Set((current.layouts || []).map((row) => String(row?.id)));
  const reservedPdfIds = new Set((current.pdfTemplates || []).map((row) => String(row?.key)));
  const reservedNames = new Set((current.layouts || []).map((row) => normalizedName(row?.name)));
  const rawLayouts = new Map(preflight.prepared.layouts.map((layout) => [String(layout.id), layout]));
  const sourceTemplates = new Map(preflight.prepared.pdfTemplates.map((entry) => [String(entry.record.key), entry]));
  const layoutDecisions = decisionMap(decisions.layouts);
  const importedLayoutIds = new Set(preflight.plan.layouts.map((item) => item.id));
  for (const layoutId of layoutDecisions.keys()) {
    if (!importedLayoutIds.has(String(layoutId))) throw new Error(`Restore decision references unknown layout '${layoutId}'.`);
  }
  const defaultPolicy = decisions.defaultPolicy == null ? null : normalizePolicy(decisions.defaultPolicy);
  const idFactory = options.idFactory || defaultIdFactory;
  const layoutOperations = [];
  const pdfOperations = new Map();
  const selected = new Map();
  const diagnostics = [];

  for (const item of preflight.plan.layouts) {
    const raw = rawLayouts.get(item.id);
    if (!raw) throw new Error(`Prepared layout '${item.id}' is missing.`);
    const sourceTemplate = sourceTemplates.get(item.pdfTemplateId);
    if (!sourceTemplate) throw new Error(`Prepared PDF '${item.pdfTemplateId}' is missing.`);
    const policy = item.requiresChoice
      ? normalizePolicy(layoutDecisions.get(item.id) ?? defaultPolicy, `Layout '${item.name}' requires Replace, Keep Both, or Skip.`)
      : "add";

    if (policy === RESTORE_POLICIES.SKIP) {
      selected.set(item.id, Object.freeze({ policy, skipped: true, sourceLayoutId: item.id, sourcePdfTemplateId: item.pdfTemplateId }));
      continue;
    }
    if (policy === RESTORE_POLICIES.REPLACE && item.foreignPdfOwners?.length) {
      throw new Error(`Layout '${item.name}' cannot replace PDF '${item.pdfTemplateId}' because it is used by: ${item.foreignPdfOwners.join(", ")}. Choose Keep Both or Skip.`);
    }

    const keepBoth = policy === RESTORE_POLICIES.KEEP_BOTH;
    const targetLayoutId = keepBoth ? allocateId("layout", item.id, reservedLayoutIds, idFactory) : item.id;
    const targetPdfTemplateId = keepBoth ? allocateId("pdfTemplate", item.pdfTemplateId, reservedPdfIds, idFactory) : item.pdfTemplateId;
    const targetName = keepBoth ? allocateName(item.name, reservedNames) : item.name;
    reservedLayoutIds.add(targetLayoutId);
    reservedPdfIds.add(targetPdfTemplateId);
    reservedNames.add(normalizedName(targetName));

    const layout = jsonClone(raw);
    if (keepBoth) {
      layout.id = targetLayoutId;
      layout.pdfTemplateId = targetPdfTemplateId;
      layout.name = targetName;
      layout.createdAt = committedAtUtc;
      layout.updatedAt = committedAtUtc;
    }
    layoutOperations.push(layout);
    addPdfOperation(pdfOperations, targetPdfTemplateId, sourceTemplate, committedAtUtc, keepBoth);
    selected.set(item.id, Object.freeze({
      policy,
      skipped: false,
      sourceLayoutId: item.id,
      targetLayoutId,
      sourcePdfTemplateId: item.pdfTemplateId,
      targetPdfTemplateId,
      targetName
    }));
  }

  const settingOperations = [];
  for (const source of preflight.prepared.settings) {
    let value = jsonClone(source.value);
    if (source.key === "favoriteLayoutId") {
      const target = selected.get(String(value));
      if (!target || target.skipped) {
        diagnostics.push(Object.freeze({ code: "SETTING_REFERENCE_SKIPPED", severity: "warning", key: source.key, message: "Favorite layout was skipped because its imported layout unit was not restored." }));
        continue;
      }
      value = target.targetLayoutId;
    }
    settingOperations.push(Object.freeze({ key: source.key, value, updatedAt: source.updatedAt || committedAtUtc }));
  }

  layoutOperations.sort(compareBy("id"));
  settingOperations.sort(compareBy("key"));
  const pdfTemplateOperations = [...pdfOperations.values()].sort(compareBy("key"));
  const remaps = Object.freeze([...selected.values()].filter((entry) => !entry.skipped).map((entry) => Object.freeze({
    layoutId: Object.freeze({ from: entry.sourceLayoutId, to: entry.targetLayoutId }),
    pdfTemplateId: Object.freeze({ from: entry.sourcePdfTemplateId, to: entry.targetPdfTemplateId }),
    policy: entry.policy
  })));

  return Object.freeze({
    kind: COMMIT_PLAN_KIND,
    backupId: preflight.plan.backup.id,
    committedAtUtc,
    readyToCommit: true,
    decisions: Object.freeze([...selected.values()]),
    remaps,
    operations: Object.freeze({
      settings: Object.freeze(settingOperations),
      layouts: Object.freeze(layoutOperations),
      pdfTemplates: Object.freeze(pdfTemplateOperations)
    }),
    summary: Object.freeze({
      layouts: layoutOperations.length,
      pdfTemplates: pdfTemplateOperations.length,
      settings: settingOperations.length,
      replaced: [...selected.values()].filter((entry) => entry.policy === RESTORE_POLICIES.REPLACE).length,
      keptBoth: [...selected.values()].filter((entry) => entry.policy === RESTORE_POLICIES.KEEP_BOTH).length,
      skipped: [...selected.values()].filter((entry) => entry.skipped).length
    }),
    diagnostics: Object.freeze(diagnostics)
  });
}

export async function commitBackupRestore(commitPlan, options = {}) {
  if (commitPlan?.kind !== COMMIT_PLAN_KIND || commitPlan?.readyToCommit !== true) throw new Error("A confirmed restore commit plan is required.");
  const writer = options.storageCommit || commitBackupRestoreOperations;
  if (typeof writer !== "function") throw new Error("Restore storage commit function is unavailable.");
  const result = await writer(commitPlan.operations);
  return Object.freeze({
    backupId: commitPlan.backupId,
    committedAtUtc: commitPlan.committedAtUtc,
    ...result
  });
}

function addPdfOperation(targets, targetKey, source, committedAtUtc, keepBoth) {
  if (targets.has(targetKey)) return;
  const record = source.record;
  targets.set(targetKey, Object.freeze({
    key: targetKey,
    name: record.name,
    type: "application/pdf",
    size: source.bytes.byteLength,
    blob: new Blob([source.bytes], { type: "application/pdf" }),
    updatedAt: keepBoth ? committedAtUtc : record.updatedAt || committedAtUtc
  }));
}

function allocateId(kind, sourceId, reserved, factory) {
  for (let attempt = 1; attempt <= 1000; attempt += 1) {
    const candidate = String(factory(kind, sourceId, attempt) || "").trim();
    if (candidate && !reserved.has(candidate)) return candidate;
  }
  throw new Error(`Unable to allocate a collision-free ${kind} ID.`);
}

function allocateName(sourceName, reserved) {
  const base = `${String(sourceName || "Imported Layout").trim() || "Imported Layout"} (Imported)`;
  if (!reserved.has(normalizedName(base))) return base;
  for (let index = 2; index <= 1000; index += 1) {
    const candidate = `${base} ${index}`;
    if (!reserved.has(normalizedName(candidate))) return candidate;
  }
  throw new Error("Unable to allocate a collision-free imported layout name.");
}

function defaultIdFactory(kind, sourceId) {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${sourceId}-${kind === "layout" ? "layout" : "pdf"}-import-${suffix}`;
}

function decisionMap(value) {
  if (value instanceof Map) return value;
  return new Map(Object.entries(value || {}));
}

function normalizePolicy(value, missingMessage = "Unsupported restore conflict policy.") {
  if (!Object.values(RESTORE_POLICIES).includes(value)) throw new Error(missingMessage);
  return value;
}

function normalizedName(value) {
  return String(value || "").trim().toLocaleLowerCase();
}

function compareBy(key) {
  return (left, right) => String(left?.[key] || "").localeCompare(String(right?.[key] || ""));
}

function validDateTime(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}
