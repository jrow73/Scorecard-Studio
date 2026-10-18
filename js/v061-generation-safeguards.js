/**
 * Scorecard Studio
 * v0.6.1 fresh-data and scorecard-generation safeguards
 */

const LINEUP_SIZE = 9;

export function replaceMatchingScheduleGame(schedule, refreshedGame, expectedGamePk) {
  const expected = String(expectedGamePk || "");
  if (!expected || String(refreshedGame?.gamePk || "") !== expected) {
    return Object.freeze({ schedule: [...(schedule || [])], replaced: false });
  }
  let replaced = false;
  const next = (schedule || []).map((game) => {
    if (String(game?.gamePk || "") !== expected) return game;
    replaced = true;
    return refreshedGame;
  });
  return Object.freeze({ schedule: replaced ? next : [...next, refreshedGame], replaced: true });
}

export function assessLineupGeneration(fieldIds, game, minimumSize = LINEUP_SIZE) {
  const requiredSides = new Set();
  for (const rawId of fieldIds || []) {
    const id = String(rawId || "");
    if (/^away\.lineup(?:\[\])?(?:\.|$)/.test(id)) requiredSides.add("away");
    if (/^home\.lineup(?:\[\])?(?:\.|$)/.test(id)) requiredSides.add("home");
  }

  const affected = [...requiredSides].flatMap((side) => {
    const players = Array.isArray(game?.[`${side}Lineup`]) ? game[`${side}Lineup`] : [];
    if (players.length >= minimumSize) return [];
    const fallback = side === "away" ? "Away team" : "Home team";
    return [{
      side,
      teamName: String(game?.[`${side}Team`] || fallback),
      count: players.length,
      state: players.length ? "partial" : "missing"
    }];
  });

  return Object.freeze({
    usesLineups: requiredSides.size > 0,
    complete: affected.length === 0,
    requiredSides: Object.freeze([...requiredSides]),
    affected: Object.freeze(affected.map((item) => Object.freeze(item)))
  });
}

export function lineupWarningMessage(assessment) {
  const affected = assessment?.affected || [];
  if (!affected.length) return "";
  const details = affected.map((item) => item.state === "missing"
    ? `${item.teamName}: lineup not posted`
    : `${item.teamName}: ${item.count} of 9 lineup spots posted`);
  return `This layout uses lineup fields, but ${details.join("; ")}. The generated scorecard will leave unavailable lineup fields blank.`;
}
