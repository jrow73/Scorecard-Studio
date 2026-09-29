/**
 * Scorecard Studio
 * Shared field formatting
 * Version: 0.2.0-dev
 * Build: 028
 */

export const DEFAULT_DATE_FORMAT = "M/D/YYYY";

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
      return formatDateOnly(value, format.dateFormat || DEFAULT_DATE_FORMAT);
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
    const first = text(player?.useName) || text(player?.firstName);
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

export function isValidDateFormatPattern(pattern) {
  const value = String(pattern ?? "").trim();
  if (!value) return false;
  if (!/^[DMY,\/\- ]+$/.test(value)) return false;
  const tokens = value.match(/[DMY]+/g) || [];
  return tokens.every((token) => {
    if (token[0] === "D") return token.length <= 2;
    if (token[0] === "M") return token.length <= 4;
    if (token[0] === "Y") return [1, 2, 4].includes(token.length);
    return false;
  });
}

export function formatDateOnly(value, pattern = DEFAULT_DATE_FORMAT) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return String(value);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const format = isValidDateFormatPattern(pattern) ? String(pattern).trim() : DEFAULT_DATE_FORMAT;
  const monthShort = new Intl.DateTimeFormat(undefined, { month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  const monthLong = new Intl.DateTimeFormat(undefined, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  return format.replace(/Y{4}|Y{2}|Y|M{4}|M{3}|M{2}|M|D{2}|D/g, (token) => {
    if (token === "D") return String(day);
    if (token === "DD") return String(day).padStart(2, "0");
    if (token === "M") return String(month);
    if (token === "MM") return String(month).padStart(2, "0");
    if (token === "MMM") return monthShort;
    if (token === "MMMM") return monthLong;
    if (token === "YY") return String(year).slice(-2);
    return String(year);
  });
}

function formatInstant(value, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const options = { hour: "numeric", minute: "2-digit" };
  if (timeZone) options.timeZone = timeZone;
  try { return new Intl.DateTimeFormat(undefined, options).format(date); }
  catch { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date); }
}
