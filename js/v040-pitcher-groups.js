export const PITCHER_GROUP_MODES = Object.freeze({
  CORE: "core",
  COMBINED: "combined",
  ADDITIONAL: "additional"
});

export const PITCHER_GROUP_OPTIONS = Object.freeze([
  Object.freeze({ value: PITCHER_GROUP_MODES.CORE, label: "Core Bullpen" }),
  Object.freeze({ value: PITCHER_GROUP_MODES.COMBINED, label: "Combined Pitchers" }),
  Object.freeze({ value: PITCHER_GROUP_MODES.ADDITIONAL, label: "Additional Starting Pitchers" })
]);

export const PITCHER_HAND_FILTERS = Object.freeze({
  ALL: "all",
  LEFT: "left",
  RIGHT: "right"
});

export const PITCHER_HAND_FILTER_OPTIONS = Object.freeze([
  Object.freeze({ value: PITCHER_HAND_FILTERS.ALL, label: "None" }),
  Object.freeze({ value: PITCHER_HAND_FILTERS.LEFT, label: "LHP" }),
  Object.freeze({ value: PITCHER_HAND_FILTERS.RIGHT, label: "RHP" })
]);

const validModes = new Set(PITCHER_GROUP_OPTIONS.map((entry) => entry.value));
const validHandFilters = new Set(PITCHER_HAND_FILTER_OPTIONS.map((entry) => entry.value));

export function isBullpenCollection(collection) {
  return collection === "away.bullpen" || collection === "home.bullpen";
}

// Missing values are the historical saved-layout contract and must continue to
// mean the person-ID-deduplicated union of bullpen + additional starters.
export function normalizePitcherGroup(value) {
  return validModes.has(value) ? value : PITCHER_GROUP_MODES.COMBINED;
}

export function pitcherGroupLabel(value) {
  const normalized = normalizePitcherGroup(value);
  return PITCHER_GROUP_OPTIONS.find((entry) => entry.value === normalized)?.label || "Combined Pitchers";
}

export function normalizePitcherHandFilter(value) {
  return validHandFilters.has(value) ? value : PITCHER_HAND_FILTERS.ALL;
}

export function pitcherHandFilterLabel(value) {
  const normalized = normalizePitcherHandFilter(value);
  return PITCHER_HAND_FILTER_OPTIONS.find((entry) => entry.value === normalized)?.label || "None";
}

export function pitcherThrowingHand(row) {
  const raw = row?.player?.throws ?? row?.pitchHand?.code ?? row?.player?.pitchHand?.code ?? "";
  const value = String(raw).trim().toUpperCase();
  if (value.startsWith("L")) return "L";
  if (value.startsWith("R")) return "R";
  return "";
}

export function pitcherHandFilteredSlots(rows, value) {
  const filter = normalizePitcherHandFilter(value);
  return (Array.isArray(rows) ? rows : []).map((row, index) => ({ row, slot: index + 1 }))
    .filter(({ row }) => filter === PITCHER_HAND_FILTERS.ALL
      || (filter === PITCHER_HAND_FILTERS.LEFT ? pitcherThrowingHand(row) === "L" : pitcherThrowingHand(row) === "R"));
}

function uniquePeople(rows) {
  const output = [];
  const seen = new Set();
  for (const row of rows) {
    const id = row?.player?.id;
    const key = id == null ? `missing:${output.length}` : `id:${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

export function pitcherGroupRows(snapshot, collection, value) {
  if (!isBullpenCollection(collection)) return null;
  const side = collection.startsWith("away.") ? "away" : "home";
  const bullpen = Array.isArray(snapshot?.[side]?.bullpen) ? snapshot[side].bullpen : [];
  const additional = Array.isArray(snapshot?.[side]?.additionalStarters) ? snapshot[side].additionalStarters : [];
  const mode = normalizePitcherGroup(value);
  if (mode === PITCHER_GROUP_MODES.CORE) return [...bullpen];
  if (mode === PITCHER_GROUP_MODES.ADDITIONAL) return [...additional];
  return uniquePeople([...bullpen, ...additional]);
}
