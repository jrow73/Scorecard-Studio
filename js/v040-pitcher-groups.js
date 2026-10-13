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

const validModes = new Set(PITCHER_GROUP_OPTIONS.map((entry) => entry.value));

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
