/**
 * Scorecard Studio
 * Shared field formatting
 * Version: 0.2.0-dev
 * Build: 018
 */

export const PLAYER_NAME_FORMATS = Object.freeze([
  { value: "full", label: "Full Name" },
  { value: "first-initial-last", label: "First Initial + Last Name" },
  { value: "last", label: "Last Name" },
  { value: "first", label: "First Name" },
  { value: "use", label: "Use Name + Last Name" },
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
  const full = text(player?.name) || String(fallback);
  if (nameFormat === "last") return text(player?.useLastName) || text(player?.lastName) || full;
  if (nameFormat === "first") return text(player?.useName) || text(player?.firstName) || full;
  if (nameFormat === "boxscore") return text(player?.boxscoreName) || full;
  if (nameFormat === "use") {
    const first = text(player?.useName);
    const last = text(player?.useLastName);
    return first && last ? `${first} ${last}` : full;
  }
  if (nameFormat === "first-initial-last") {
    return text(player?.initLastName) || full;
  }
  return full;
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
