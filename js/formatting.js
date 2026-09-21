/**
 * Scorecard Studio formatting defaults and inheritance helpers
 * Version: 0.2.0-dev
 * Build: 019.1
 */

export const FORMAT_GROUPS = [
  { id: "game", label: "Game Information", kind: "base" },
  { id: "away-team", label: "Away Team Information", kind: "base" },
  { id: "away-players", label: "Away Player Information", kind: "base" },
  { id: "home-team", label: "Home Team Information", kind: "base" },
  { id: "home-players", label: "Home Player Information", kind: "base" },
  { id: "bats-left", label: "Bats Left", kind: "hitter" },
  { id: "bats-right", label: "Bats Right", kind: "hitter" },
  { id: "bats-switch", label: "Bats Switch", kind: "hitter" },
  { id: "throws-left", label: "Throws Left", kind: "pitcher" },
  { id: "throws-right", label: "Throws Right", kind: "pitcher" },
  { id: "throws-switch", label: "Throws Switch", kind: "pitcher" }
];

export const FONT_FACES = ["Helvetica", "Times", "Courier"];

export const COLOR_SWATCHES = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#444444" },
  { name: "Medium Gray", value: "#777777" },
  { name: "Red", value: "#d32f2f" },
  { name: "Blue", value: "#1565c0" },
  { name: "Green", value: "#2e7d32" },
  { name: "Orange", value: "#c45100" },
  { name: "Purple", value: "#7b1fa2" },
  { name: "Teal", value: "#00796b" }
];

const DEFAULT_FORMAT = { fontFace: "Helvetica", fontSize: 10, color: "#000000", bold: false, italic: false };
const DEFAULTS = Object.fromEntries(FORMAT_GROUPS.map((group) => [group.id, { ...DEFAULT_FORMAT }]));
const CONDITIONAL_DEFAULTS = { hitters: false, pitchers: false };

export function appFormattingDefaults() {
  return structuredClone(DEFAULTS);
}

export function appConditionalFormattingDefaults() {
  return { ...CONDITIONAL_DEFAULTS };
}

export function ensureLayoutFormattingDefaults(layout) {
  const current = layout?.formattingDefaults || {};
  const merged = {};
  for (const group of FORMAT_GROUPS) merged[group.id] = normalizeFormat({ ...DEFAULTS[group.id], ...(current[group.id] || {}) });
  return merged;
}

export function ensureLayoutConditionalFormatting(layout) {
  const current = layout?.conditionalFormatting || {};
  return {
    hitters: current.hitters === true,
    pitchers: current.pitchers === true
  };
}

export function conditionalFormattingEnabled(layout, groupId) {
  const settings = ensureLayoutConditionalFormatting(layout);
  if (String(groupId || "").startsWith("bats-")) return settings.hitters;
  if (String(groupId || "").startsWith("throws-")) return settings.pitchers;
  return false;
}

export function normalizeFormat(format = {}) {
  const fontFace = FONT_FACES.includes(format.fontFace) ? format.fontFace : "Helvetica";
  const fontSize = Number(format.fontSize);
  return {
    fontFace,
    fontSize: Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 10,
    color: normalizeColor(format.color),
    bold: Boolean(format.bold),
    italic: Boolean(format.italic)
  };
}

export function mergeFormat(base, override = {}) {
  const result = { ...normalizeFormat(base) };
  for (const key of ["fontFace", "fontSize", "color", "bold", "italic"]) {
    if (Object.prototype.hasOwnProperty.call(override || {}, key) && override[key] !== null && override[key] !== "") result[key] = override[key];
  }
  return normalizeFormat(result);
}

export function normalizeColor(value) {
  const text = String(value || "#000000").trim();
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
  return "#000000";
}

export function colorDisplayName(value) {
  const normalized = normalizeColor(value);
  const swatch = COLOR_SWATCHES.find((entry) => entry.value === normalized);
  return swatch ? swatch.name : `Custom (${normalized.toUpperCase()})`;
}

export function hexToRgb01(hex) {
  const value = normalizeColor(hex).slice(1);
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
}

export function formattingGroupForFieldId(fieldId = "") {
  const id = String(fieldId || "");
  if (id.startsWith("away.startingPitcher") || id.startsWith("away.lineup") || id.startsWith("away.bench") || id.startsWith("away.bullpen")) return "away-players";
  if (id.startsWith("home.startingPitcher") || id.startsWith("home.lineup") || id.startsWith("home.bench") || id.startsWith("home.bullpen")) return "home-players";
  if (id.startsWith("away.")) return "away-team";
  if (id.startsWith("home.")) return "home-team";
  return "game";
}

export function formattingGroupForContext(context = "") {
  if (String(context).startsWith("away.")) return "away-players";
  if (String(context).startsWith("home.")) return "home-players";
  return "game";
}

export function handednessGroup(context, hand) {
  const normalized = String(hand || "").trim().toUpperCase();
  if (!normalized) return null;
  const isPitcher = String(context || "").includes("bullpen") || String(context || "").includes("startingPitcher");
  const prefix = isPitcher ? "throws" : "bats";
  if (normalized === "L") return `${prefix}-left`;
  if (normalized === "R") return `${prefix}-right`;
  if (normalized === "S") return `${prefix}-switch`;
  return null;
}
