/**
 * Scorecard Studio
 * Shared field formatting
 * Version: 0.2.0-dev
 * Build: 026.1
 */

export const PLAYER_NAME_FORMATS = Object.freeze([
  { value: "full", label: "Full Name" },
  { value: "first-initial-last", label: "First Initial + Last Name" },
  { value: "last", label: "Last Name" },
  { value: "first", label: "First Name" },
  { value: "use", label: "Use Name" },
  { value: "boxscore", label: "Boxscore Name" }
]);

export function formatFieldValue(definition, resolution, model, format = {}) {
  if (!definition || !resolution || !["available", "partial"].includes(resolution.state)) return "";
  const value = resolution.value;
  if (value === null || value === undefined || value === "") return "";

  if (definition.formatKind === "playerName") return formatPlayerName(resolution.formatSource, value, format.nameFormat);

  switch (definition.valueType) {
    case "integer":
      return Number.isFinite(Number(value)) ? String(Math.trunc(Number(value))) : String(value);
    case "decimal":
      return formatDecimal(value, definition.defaultFormat?.precision);
    case "date":
      return formatDateOnly(value);
    case "instant":
      return formatInstant(value, model?.game?.venue?.timeZone);
    default:
      return String(value);
  }
}

function formatPlayerName(player, fallback, nameFormat = "full") {
  const formatKey = canonicalPlayerNameFormat(nameFormat);
  const full = text(player?.name) || text(fallback);
  if (formatKey === "last") return text(player?.lastName);
  if (formatKey === "first") return text(player?.firstName);
  if (formatKey === "boxscore") return text(player?.boxscoreName);
  if (formatKey === "use") return text(player?.useName);
  if (formatKey === "first-initial-last") {
    const first = text(player?.firstName) || text(player?.useName);
    const last = text(player?.lastName) || text(player?.useLastName);
    return first && last ? `${first.charAt(0)} ${last}` : text(player?.initLastName).replace(/^(\p{L})\.\s+/u, "$1 ");
  }
  return full;
}

function canonicalPlayerNameFormat(value) {
  const raw = String(value ?? "").trim();
  const compact = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (["last", "lastname"].includes(compact)) return "last";
  if (["first", "firstname"].includes(compact)) return "first";
  if (["use", "usename", "usenamelastname"].includes(compact)) return "use";
  if (["boxscore", "boxscorename"].includes(compact)) return "boxscore";
  if (["firstinitiallast", "firstinitiallastname", "initlastname"].includes(compact)) return "first-initial-last";
  return "full";
}

function text(value) {
  const result = String(value ?? "").trim();
  return result || "";
}

function formatDecimal(value, precision) {
  if (typeof value === "string" && /^\.?\d+$/.test(value.trim()) && precision == null) return value.trim();
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (!Number.isInteger(precision)) return String(value);
  let text = number.toFixed(precision);
  if (definitionUsesLeadingDot(precision, number)) text = text.replace(/^0(?=\.)/, "");
  return text;
}

function definitionUsesLeadingDot(precision, value) {
  return precision === 3 && Math.abs(value) < 1;
}

function formatDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return String(value);
  return `${Number(match[2])}/${Number(match[3])}/${match[1]}`;
}

function formatInstant(value, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const options = { hour: "numeric", minute: "2-digit" };
  if (timeZone) options.timeZone = timeZone;
  try { return new Intl.DateTimeFormat(undefined, options).format(date); }
  catch { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date); }
}
