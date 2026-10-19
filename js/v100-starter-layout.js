/**
 * Scorecard Studio
 * v1 bundled starter-layout validation and install planning
 */

import { BACKUP_SCOPES } from "./v040-backup-export.js?v=110r004";
import { preflightBackupImport } from "./v040-backup-import.js?v=110r004";
import { RESTORE_POLICIES, createRestoreCommitPlan } from "./v040-backup-restore.js?v=110r004";

export const STARTER_LAYOUT_ID = "ca4bbef0-5e0e-4aca-bc5b-6961469c537f";
export const STARTER_PDF_TEMPLATE_ID = "ca4bbef0-5e0e-4aca-bc5b-6961469c537f";
export const STARTER_LAYOUT_NAME = "Scorecard Studio Starter Layout";
export const STARTER_LAYOUT_ASSET_URL = "./assets/starter-layout/Scorecard-Studio-Starter-Layout.json?v=110r004";

export function starterLayoutInstalled(layouts = []) {
  return layouts.some((layout) => String(layout?.id || "") === STARTER_LAYOUT_ID);
}

export async function prepareStarterLayoutInstall(jsonText, currentStorage = {}) {
  const storage = normalizeCurrentStorage(currentStorage);
  const preflight = await preflightBackupImport(jsonText, storage);
  if (!preflight.valid) {
    const detail = preflight.diagnostics?.find((item) => item.severity === "error")?.message;
    throw new Error(detail || "The bundled starter layout did not pass validation.");
  }
  validateStarterIdentity(preflight.envelope);

  if (starterLayoutInstalled(storage.layouts)) {
    return Object.freeze({ status: "installed", preflight, commitPlan: null });
  }

  const item = preflight.plan.layouts[0];
  if (item.foreignPdfOwners?.length) {
    throw new Error("The starter PDF identifier is already used by another layout. No changes were made.");
  }
  const decisions = item.requiresChoice
    ? { layouts: { [STARTER_LAYOUT_ID]: RESTORE_POLICIES.REPLACE } }
    : { layouts: {} };
  const commitPlan = createRestoreCommitPlan(preflight, decisions, { currentStorage: storage });
  const layout = commitPlan.operations.layouts[0];
  const pdf = commitPlan.operations.pdfTemplates[0];
  if (layout?.id !== STARTER_LAYOUT_ID || layout?.pdfTemplateId !== STARTER_PDF_TEMPLATE_ID || pdf?.key !== STARTER_PDF_TEMPLATE_ID) {
    throw new Error("The starter layout install plan changed its stable identity. No changes were made.");
  }
  return Object.freeze({ status: "ready", preflight, commitPlan });
}

function validateStarterIdentity(envelope) {
  if (envelope?.scope !== BACKUP_SCOPES.SINGLE_LAYOUT
    || envelope.layouts?.length !== 1
    || envelope.pdfTemplates?.length !== 1
    || envelope.settings?.length !== 0) {
    throw new Error("The bundled starter asset must contain exactly one layout and one PDF with no settings.");
  }
  const layout = envelope.layouts[0];
  const pdf = envelope.pdfTemplates[0];
  if (layout.id !== STARTER_LAYOUT_ID
    || layout.pdfTemplateId !== STARTER_PDF_TEMPLATE_ID
    || pdf.key !== STARTER_PDF_TEMPLATE_ID
    || layout.name !== STARTER_LAYOUT_NAME) {
    throw new Error("The bundled starter asset has an unexpected identity.");
  }
}

function normalizeCurrentStorage(value) {
  return Object.freeze({
    settings: Array.isArray(value?.settings) ? value.settings : [],
    layouts: Array.isArray(value?.layouts) ? value.layouts : [],
    pdfTemplates: Array.isArray(value?.pdfTemplates) ? value.pdfTemplates : []
  });
}
