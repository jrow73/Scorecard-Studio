/**
 * Scorecard Studio
 * Layout-name and generated-filename safeguards
 */

export const LAYOUT_NAME_MAX_LENGTH = 80;
export const GENERATED_PDF_FILENAME_MAX_LENGTH = 180;

const WINDOWS_RESERVED_BASENAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

export function validateLayoutName(value) {
  const name = String(value ?? "").trim();
  if (!name) return { valid: false, name, message: "Layout name cannot be blank." };
  if (name.length > LAYOUT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      name,
      message: `Layout name must be ${LAYOUT_NAME_MAX_LENGTH} characters or fewer.`
    };
  }
  return { valid: true, name, message: "" };
}

export function duplicateLayoutName(value) {
  const suffix = " Copy";
  const source = String(value ?? "Layout").trim() || "Layout";
  return `${source.slice(0, LAYOUT_NAME_MAX_LENGTH - suffix.length).trimEnd()}${suffix}`;
}

export function safeFilenamePart(value, { fallback = "Scorecard", maxLength = 80 } = {}) {
  let result = String(value ?? "")
    .replace(/[<>:"/\\|?*\u0000-\u001f\u0080-\u009f]+/g, " ")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[. ]+|[. ]+$/g, "")
    .slice(0, Math.max(1, maxLength))
    .replace(/[. ]+$/g, "");
  if (!result) result = fallback;
  if (WINDOWS_RESERVED_BASENAME.test(result)) result = `_${result}`;
  return result.slice(0, Math.max(1, maxLength)).replace(/[. ]+$/g, "") || fallback;
}

export function buildScorecardPdfFilename({
  date,
  away,
  home,
  layoutName,
  test = false,
  doubleheader = false,
  gameNumber = null
} = {}) {
  if (test) {
    const prefix = "ScorecardStudio_";
    const suffix = "_TEST.pdf";
    const layoutBudget = Math.max(1, GENERATED_PDF_FILENAME_MAX_LENGTH - prefix.length - suffix.length);
    const safeLayout = safeFilenamePart(layoutName, { fallback: "Scorecard", maxLength: layoutBudget });
    return `${prefix}${safeLayout}${suffix}`;
  }

  const safeDate = safeFilenamePart(date, { fallback: "Game", maxLength: 20 });
  const safeAway = safeFilenamePart(away, { fallback: "AWAY", maxLength: 12 }).toUpperCase();
  const safeHome = safeFilenamePart(home, { fallback: "HOME", maxLength: 12 }).toUpperCase();
  const numericGameNumber = Number(gameNumber);
  const gameSegment = doubleheader && Number.isInteger(numericGameNumber) && numericGameNumber > 0
    ? `_G${numericGameNumber}`
    : "";
  const prefix = `${safeDate}_${safeAway}_at_${safeHome}${gameSegment}_`;
  const suffix = ".pdf";
  const layoutBudget = Math.max(1, GENERATED_PDF_FILENAME_MAX_LENGTH - prefix.length - suffix.length);
  const safeLayout = safeFilenamePart(layoutName, { fallback: "Scorecard", maxLength: layoutBudget });
  return `${prefix}${safeLayout}${suffix}`;
}
