const GAME_1_VALUE_TARGET = /^\/(away|home)\/(team\/(record|gameNumber)|lineup|startingPitcher|additionalStarters|bench|bullpen)/;
const STANDINGS_TARGET = /^\/(away|home)\/team\/standings$/;

function sourceById(model, id) {
  return (model?.meta?.sourceResults || []).find((source) => source?.id === id) || null;
}

export function game2CutoffPresentation(model) {
  const hidden = Object.freeze({ visible: false, label: "", heading: "", description: "" });
  if (Number(model?.game?.gameNumber || 0) < 2) return hidden;

  const lineage = Array.isArray(model?.meta?.lineage) ? model.meta.lineage : [];
  const boxscoreSources = (model?.meta?.sourceResults || []).filter((source) => (
    source?.adapter === "boxscore"
    && source?.outcome === "success"
    && source?.effective?.canonicalGameState === "final"
    && source?.scope?.relatedGamePk
  ));
  const selectedGame1Source = boxscoreSources.find((source) => lineage.some((entry) => (
    entry?.selectedSourceResultRef === source.id
    && GAME_1_VALUE_TARGET.test(String(entry?.target || ""))
  )));
  if (!selectedGame1Source) return hidden;

  const priorStandings = lineage.find((entry) => {
    if (!STANDINGS_TARGET.test(String(entry?.target || ""))) return false;
    const source = sourceById(model, entry?.selectedSourceResultRef);
    return source?.adapter === "standings" && source?.effective?.kind === "endOfDay" && Boolean(source?.effective?.cutoffDate);
  });
  if (!priorStandings) return hidden;

  return Object.freeze({
    visible: true,
    label: "Game 2 data",
    heading: "Game 2 pregame cutoff",
    description: "Supported team records, streaks, and player season totals may include the completed Game 1. Division, league, and Wild Card standings—including rank, games back, and Last 10—remain based on the previous-day snapshot."
  });
}
