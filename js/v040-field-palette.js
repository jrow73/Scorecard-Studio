/**
 * Scorecard Studio v0.4 field-palette symmetry helpers.
 * Counterparts are verified once from the active registry before interaction.
 */

export function buildHomeAwayFieldPairs(definitions) {
  const byId = new Map((definitions || []).map((definition) => [String(definition?.id || ""), definition]));
  const pairs = {};
  for (const definition of byId.values()) {
    const id = String(definition?.id || "");
    if (!id.startsWith("away.")) continue;
    const counterpartId = `home.${id.slice("away.".length)}`;
    const counterpart = byId.get(counterpartId);
    if (!counterpart || !compatibleDefinitions(definition, counterpart)) continue;
    pairs[id] = counterpartId;
    pairs[counterpartId] = id;
  }
  return Object.freeze(pairs);
}

export function updateMirroredFieldSelection(selected, fieldId, checked, pairMap, mirrorEnabled = true) {
  const next = new Set(selected || []);
  const ids = [String(fieldId || "")];
  const counterpart = mirrorEnabled ? pairMap?.[fieldId] : null;
  if (counterpart) ids.push(counterpart);
  for (const id of ids.filter(Boolean)) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return next;
}

export function restoreStandardFieldSelection(selected, groupFieldIds, standardFieldIds) {
  const next = new Set(selected || []);
  const standard = new Set(standardFieldIds || []);
  for (const id of groupFieldIds || []) {
    if (standard.has(id)) next.add(id);
    else next.delete(id);
  }
  return next;
}

export function fieldPairCoverage(definitions, pairMap) {
  const ids = (definitions || []).map((definition) => String(definition?.id || ""));
  const away = ids.filter((id) => id.startsWith("away."));
  const home = ids.filter((id) => id.startsWith("home."));
  const pairedAway = away.filter((id) => Boolean(pairMap?.[id]));
  const pairedHome = home.filter((id) => Boolean(pairMap?.[id]));
  return Object.freeze({
    total: ids.length,
    away: away.length,
    home: home.length,
    pairedAway: pairedAway.length,
    pairedHome: pairedHome.length,
    unpaired: Object.freeze([...away.filter((id) => !pairMap?.[id]), ...home.filter((id) => !pairMap?.[id])])
  });
}

function compatibleDefinitions(left, right) {
  return left?.cardinality === right?.cardinality
    && String(left?.category || "").replace(/^Away\s*\//, "Team /") === String(right?.category || "").replace(/^Home\s*\//, "Team /")
    && String(left?.formatKind || "") === String(right?.formatKind || "");
}
