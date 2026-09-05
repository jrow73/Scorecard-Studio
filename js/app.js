/**
 * Scorecard Studio
 * Application coordinator
 * Version: 0.1.0-web-dev
 * Build: 003
 */

import { fetchFavoriteTeamSchedule, fetchGameFeed } from "./api.js?v=003";
import { getSetting, initializeStorage, setSetting } from "./storage.js?v=003";

const DEFAULT_FAVORITE_TEAM = { id: 136, name: "Seattle Mariners" };

const state = {
  favoriteTeam: DEFAULT_FAVORITE_TEAM,
  schedule: [],
  selectedGamePk: null,
  selectedFeed: null
};

const elements = {
  refreshButton: document.querySelector("#refresh-pregame-btn"),
  favoriteTeamForm: document.querySelector("#favorite-team-form"),
  favoriteTeamSelect: document.querySelector("#favorite-team-select"),
  saveFavoriteTeamButton: document.querySelector("#save-favorite-team-btn"),
  storageStatus: document.querySelector("#storage-status"),
  storageMessage: document.querySelector("#storage-message"),
  todayDate: document.querySelector("#today-date"),
  lineupStatus: document.querySelector("#lineup-status"),
  pregameMessage: document.querySelector("#pregame-message"),
  pregameContent: document.querySelector("#pregame-content"),
  gameChoiceList: document.querySelector("#game-choice-list"),
  matchupHeading: document.querySelector("#matchup-heading"),
  gameStatusText: document.querySelector("#game-status-text"),
  firstPitch: document.querySelector("#first-pitch"),
  venue: document.querySelector("#venue"),
  weather: document.querySelector("#weather"),
  awayPitchersHeading: document.querySelector("#away-pitchers-heading"),
  homePitchersHeading: document.querySelector("#home-pitchers-heading"),
  awayPitchers: document.querySelector("#away-pitchers"),
  homePitchers: document.querySelector("#home-pitchers"),
  awayLineupHeading: document.querySelector("#away-lineup-heading"),
  homeLineupHeading: document.querySelector("#home-lineup-heading"),
  awayLineup: document.querySelector("#away-lineup"),
  homeLineup: document.querySelector("#home-lineup"),
  appStatusText: document.querySelector("#app-status-text"),
  appStatusDot: document.querySelector("#app-status-dot")
};

initialize();

async function initialize() {
  const today = getLocalDateString();
  elements.todayDate.textContent = formatDisplayDate(today);
  elements.saveFavoriteTeamButton.addEventListener("click", saveFavoriteTeam);
  elements.refreshButton.addEventListener("click", () => loadFavoriteTeamPregame(today));

  await initializeFavoriteTeamSetting();
  await loadFavoriteTeamPregame(today);
}

async function initializeFavoriteTeamSetting() {
  try {
    await initializeStorage();
    const savedTeam = await getSetting("favoriteTeam", null);
    state.favoriteTeam = isValidFavoriteTeam(savedTeam) ? savedTeam : DEFAULT_FAVORITE_TEAM;

    if (!isValidFavoriteTeam(savedTeam)) {
      await setSetting("favoriteTeam", state.favoriteTeam);
    }

    elements.favoriteTeamSelect.value = String(state.favoriteTeam.id);
    setStorageStatus("IndexedDB ready", "ready");
    elements.storageMessage.textContent = `Saved favorite: ${state.favoriteTeam.name}`;
    setAppStatus("Browser storage ready", "ready");
  } catch (error) {
    console.error("Unable to initialize browser storage:", error);
    setStorageStatus("Storage unavailable", "error");
    elements.storageMessage.textContent = errorMessage(error, "Browser storage is unavailable.");
    elements.favoriteTeamSelect.disabled = true;
    elements.saveFavoriteTeamButton.disabled = true;
    setAppStatus("Browser storage unavailable", "error");
  }
}

async function saveFavoriteTeam() {
  const option = elements.favoriteTeamSelect.selectedOptions[0];
  if (!option) return;

  const favoriteTeam = {
    id: Number(option.value),
    name: option.textContent.trim()
  };

  elements.saveFavoriteTeamButton.disabled = true;
  elements.saveFavoriteTeamButton.textContent = "Saving…";
  elements.storageMessage.textContent = "Saving favorite team…";

  try {
    await setSetting("favoriteTeam", favoriteTeam);
    state.favoriteTeam = favoriteTeam;
    elements.storageMessage.textContent = `Saved favorite: ${favoriteTeam.name}`;
    setStorageStatus("IndexedDB ready", "ready");
    await loadFavoriteTeamPregame(getLocalDateString());
  } catch (error) {
    console.error("Unable to save favorite team:", error);
    setStorageStatus("Save failed", "error");
    elements.storageMessage.textContent = errorMessage(error, "Could not save favorite team.");
    setAppStatus("Browser storage error", "error");
  } finally {
    elements.saveFavoriteTeamButton.disabled = false;
    elements.saveFavoriteTeamButton.textContent = "Save & Load Team";
  }
}

async function loadFavoriteTeamPregame(date) {
  setPregameLoading(true, `Finding today's ${state.favoriteTeam.name} game…`);

  try {
    const schedule = await fetchFavoriteTeamSchedule(date, state.favoriteTeam.id);
    state.schedule = schedule;

    if (schedule.length === 0) {
      state.selectedGamePk = null;
      state.selectedFeed = null;
      renderNoGame();
      setAppStatus("MLB API ready", "ready");
      return;
    }

    renderGameChoices(schedule);

    const preferredGame = chooseInitialGame(schedule);
    await selectGame(preferredGame.gamePk);
    setAppStatus("Pregame data ready", "ready");
  } catch (error) {
    console.error("Unable to load pregame data:", error);
    renderPregameError(error);
    setAppStatus("Pregame data unavailable", "error");
  } finally {
    setPregameLoading(false);
  }
}

function chooseInitialGame(games) {
  if (state.selectedGamePk) {
    const current = games.find((game) => game.gamePk === state.selectedGamePk);
    if (current) return current;
  }
  return games[0];
}

async function selectGame(gamePk) {
  const selected = state.schedule.find((game) => game.gamePk === String(gamePk));
  if (!selected) return;

  state.selectedGamePk = selected.gamePk;
  highlightSelectedGame();
  setPregameLoading(true, `Loading pregame data for ${selected.awayTeam} at ${selected.homeTeam}…`);

  try {
    const feed = await fetchGameFeed(selected.gamePk);
    state.selectedFeed = feed;
    renderSelectedGame(selected, feed);
  } catch (error) {
    console.error(`Unable to load selected game ${selected.gamePk}:`, error);
    renderPregameError(error);
  } finally {
    setPregameLoading(false);
  }
}

function renderGameChoices(games) {
  elements.gameChoiceList.replaceChildren();
  const shouldShow = games.length > 1;
  elements.gameChoiceList.hidden = !shouldShow;

  if (!shouldShow) return;

  for (const game of games) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "game-choice-button";
    button.dataset.gamePk = game.gamePk;
    button.innerHTML = `<strong>${escapeHtml(game.awayTeam)} at ${escapeHtml(game.homeTeam)}</strong><span>${escapeHtml(formatGameTime(game.gameDate))}</span>`;
    button.addEventListener("click", () => selectGame(game.gamePk));
    elements.gameChoiceList.append(button);
  }
}

function highlightSelectedGame() {
  elements.gameChoiceList.querySelectorAll(".game-choice-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.gamePk === state.selectedGamePk);
  });
}

function renderNoGame() {
  elements.pregameContent.hidden = true;
  elements.pregameMessage.hidden = false;
  elements.pregameMessage.classList.remove("error");
  elements.pregameMessage.textContent = `No ${state.favoriteTeam.name} game is scheduled for today.`;
  setLineupStatus("No game", "neutral");
}

function renderPregameError(error) {
  elements.pregameContent.hidden = true;
  elements.pregameMessage.hidden = false;
  elements.pregameMessage.classList.add("error");
  elements.pregameMessage.textContent = `Could not load pregame data. ${errorMessage(error, "Unknown error.")}`;
  setLineupStatus("Unavailable", "error");
}

function renderSelectedGame(selected, feed) {
  const gameData = feed?.gameData ?? {};
  const awayTeam = gameData.teams?.away?.name ?? selected.awayTeam;
  const homeTeam = gameData.teams?.home?.name ?? selected.homeTeam;
  const venue = gameData.venue ?? {};
  const datetime = gameData.datetime ?? {};
  const weather = gameData.weather ?? {};

  const awayLineup = lineupPlayers(feed, "away");
  const homeLineup = lineupPlayers(feed, "home");
  const awayBench = benchPlayers(feed, "away");
  const homeBench = benchPlayers(feed, "home");
  const awayStarter = startingPitcher(feed, "away");
  const homeStarter = startingPitcher(feed, "home");
  const awayBullpen = bullpenPitchers(feed, "away");
  const homeBullpen = bullpenPitchers(feed, "home");

  elements.matchupHeading.textContent = `${awayTeam} at ${homeTeam}`;
  elements.gameStatusText.textContent = selected.status || "Scheduled";
  elements.firstPitch.textContent = formatFirstPitch(datetime, venue, selected.gameDate);
  elements.venue.textContent = venue.name || selected.venue || "Not listed";
  elements.weather.textContent = weatherSummary(weather);

  elements.awayPitchersHeading.textContent = awayTeam;
  elements.homePitchersHeading.textContent = homeTeam;
  elements.awayLineupHeading.textContent = awayTeam;
  elements.homeLineupHeading.textContent = homeTeam;

  renderPitchers(elements.awayPitchers, awayStarter, awayBullpen);
  renderPitchers(elements.homePitchers, homeStarter, homeBullpen);
  renderLineup(elements.awayLineup, awayLineup, awayBench);
  renderLineup(elements.homeLineup, homeLineup, homeBench);

  const status = lineupState(awayLineup.length, homeLineup.length);
  if (status === "posted") setLineupStatus("Lineups Posted", "ready");
  else if (status === "partial") setLineupStatus("Partial Lineups", "warning");
  else setLineupStatus("No Lineups", "error");

  elements.pregameMessage.hidden = true;
  elements.pregameMessage.classList.remove("error");
  elements.pregameContent.hidden = false;
}

function lineupState(awayCount, homeCount) {
  if (awayCount >= 9 && homeCount >= 9) return "posted";
  if (awayCount > 0 || homeCount > 0) return "partial";
  return "none";
}

function renderPitchers(container, starter, bullpen) {
  container.replaceChildren();
  container.append(sectionLabel("Starting Pitcher"));
  container.append(starter ? playerRow(starter, "pitcher") : emptyRow("Starting pitcher not listed."));
  container.append(sectionLabel("Bullpen", true));

  if (bullpen.length === 0) {
    container.append(emptyRow("Bullpen not listed."));
    return;
  }

  bullpen.forEach((player) => container.append(playerRow(player, "pitcher")));
}

function renderLineup(container, starters, bench) {
  container.replaceChildren();
  container.append(sectionLabel("Starting Lineup"));

  if (starters.length === 0) {
    container.append(emptyRow("Lineup not posted."));
  } else {
    starters.forEach((player, index) => container.append(playerRow(player, "position", index + 1)));
  }

  container.append(sectionLabel("Bench", true));
  if (bench.length === 0) {
    container.append(emptyRow("Bench not listed."));
  } else {
    bench.forEach((player) => container.append(playerRow(player, "position")));
  }
}

function sectionLabel(text, spaced = false) {
  const div = document.createElement("div");
  div.className = `subsection-label${spaced ? " spaced" : ""}`;
  div.textContent = text;
  return div;
}

function emptyRow(text) {
  const div = document.createElement("div");
  div.className = "empty-note compact";
  div.textContent = text;
  return div;
}

function playerRow(player, type, index = null) {
  const row = document.createElement("div");
  row.className = "detail-row";
  const jersey = playerJersey(player);
  const name = playerName(player);

  if (type === "pitcher") {
    const hand = playerThrows(player);
    row.textContent = [jersey ? `#${jersey}` : "", hand ? `${hand}HP` : "", name].filter(Boolean).join(" ");
    return row;
  }

  const bats = playerBats(player);
  const position = playerPosition(player);
  row.textContent = [
    index !== null ? `${index}.` : "",
    jersey ? `#${jersey}` : "",
    name,
    bats ? `(${bats})` : "",
    position ? `• ${position}` : ""
  ].filter(Boolean).join(" ");
  return row;
}

function battingOrderIds(box) {
  return Array.isArray(box?.battingOrder) ? box.battingOrder.map(String) : [];
}

function mergePlayerData(boxPlayer, gamePlayer) {
  if (!boxPlayer && !gamePlayer) return null;
  if (!gamePlayer) return boxPlayer;
  if (!boxPlayer) return { person: gamePlayer, ...gamePlayer };
  return {
    ...gamePlayer,
    ...boxPlayer,
    person: { ...(gamePlayer.person || gamePlayer), ...(boxPlayer.person || {}) },
    batSide: boxPlayer.batSide || gamePlayer.batSide || gamePlayer.person?.batSide,
    pitchHand: boxPlayer.pitchHand || gamePlayer.pitchHand || gamePlayer.person?.pitchHand
  };
}

function playerById(players, id, allPlayers = {}) {
  return mergePlayerData(players?.[`ID${id}`] || players?.[id] || null, allPlayers?.[`ID${id}`] || allPlayers?.[id] || null);
}

function sortedRosterPlayers(ids, players, allPlayers = {}) {
  if (!Array.isArray(ids)) return [];
  return ids.map((id) => playerById(players, id, allPlayers)).filter(Boolean);
}

function lineupPlayers(feed, side) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  return sortedRosterPlayers(box.battingOrder || [], box.players || {}, feed?.gameData?.players || {});
}

function benchPlayers(feed, side) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  const players = box.players || {};
  const allPlayers = feed?.gameData?.players || {};
  const starters = new Set(battingOrderIds(box));
  const pitcherIds = new Set((box.pitchers || []).map(String));
  const benchIds = Array.isArray(box.bench) ? box.bench.map(String) : [];
  const explicit = sortedRosterPlayers(benchIds, players, allPlayers).filter((player) => !starters.has(playerId(player)));
  if (explicit.length) return explicit;

  return Object.values(players)
    .map((player) => mergePlayerData(player, allPlayers[`ID${player?.person?.id || player?.id}`]))
    .filter((player) => {
      const id = playerId(player);
      return id && !starters.has(id) && !pitcherIds.has(id) && playerPosition(player) !== "P";
    })
    .sort((a, b) => playerName(a).localeCompare(playerName(b)));
}

function startingPitcher(feed, side) {
  const gameData = feed?.gameData || {};
  const probable = gameData.probablePitchers?.[side];
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  const allPlayers = gameData.players || {};

  if (probable?.id || probable?.fullName) {
    const match = Object.values(box.players || {}).find((player) => String(player?.person?.id || "") === String(probable.id || "") || playerName(player) === probable.fullName);
    return mergePlayerData(match, allPlayers[`ID${probable.id}`]) || { person: probable, ...probable };
  }

  return sortedRosterPlayers(box.pitchers || [], box.players || {}, allPlayers)[0] || null;
}

function bullpenPitchers(feed, side) {
  const box = feed?.liveData?.boxscore?.teams?.[side] || {};
  const players = box.players || {};
  const allPlayers = feed?.gameData?.players || {};
  const starterId = playerId(startingPitcher(feed, side));
  const bullpenIds = Array.isArray(box.bullpen) ? box.bullpen.map(String) : [];
  const explicit = sortedRosterPlayers(bullpenIds, players, allPlayers).filter((player) => playerId(player) !== starterId);
  if (explicit.length) return explicit;

  return Object.values(players)
    .map((player) => mergePlayerData(player, allPlayers[`ID${player?.person?.id || player?.id}`]))
    .filter((player) => {
      const id = playerId(player);
      return id && id !== starterId && playerPosition(player) === "P";
    })
    .sort((a, b) => playerName(a).localeCompare(playerName(b)));
}

function playerId(player) {
  return String(player?.person?.id || player?.id || "");
}

function playerName(player) {
  return player?.person?.fullName || player?.fullName || player?.name || "Player";
}

function playerJersey(player) {
  return player?.jerseyNumber || player?.jersey || "";
}

function playerPosition(player) {
  const value = player?.position?.abbreviation || player?.position?.code || player?.position || "";
  return typeof value === "string" ? value : "";
}

function playerBats(player) {
  return player?.batSide?.code || player?.person?.batSide?.code || player?.bats || "";
}

function playerThrows(player) {
  const raw = player?.pitchHand?.code || player?.person?.pitchHand?.code || player?.pitchHand?.description || player?.person?.pitchHand?.description || player?.throws || "";
  const value = String(raw).toUpperCase();
  if (value.startsWith("R")) return "R";
  if (value.startsWith("L")) return "L";
  return value;
}

function weatherSummary(weather) {
  const parts = [
    weather?.condition,
    weather?.temp !== undefined && weather?.temp !== null ? `${weather.temp}°` : "",
    weather?.wind
  ].filter(Boolean);
  return parts.join(" • ") || "Weather not listed";
}

function formatFirstPitch(datetime, venue, fallback) {
  const value = datetime?.dateTime || fallback || "";
  if (!value) return "Not listed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not listed";

  const venueZone = venue?.timeZone?.id || venue?.timeZone?.tz || "";
  const userText = formatTimeOnly(date);
  if (!venueZone) return userText;

  try {
    const ballparkText = formatTimeOnly(date, venueZone);
    return ballparkText === userText ? ballparkText : `${ballparkText} Ballpark • ${userText} Local`;
  } catch (error) {
    console.warn("Could not format venue timezone:", error);
    return userText;
  }
}

function formatTimeOnly(date, timeZone) {
  const options = { hour: "numeric", minute: "2-digit", timeZoneName: "short" };
  if (timeZone) options.timeZone = timeZone;
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function formatGameTime(value) {
  if (!value) return "Time TBD";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Time TBD" : formatTimeOnly(date);
}

function setPregameLoading(isLoading, message = "Loading pregame data…") {
  elements.refreshButton.disabled = isLoading;
  elements.refreshButton.textContent = isLoading ? "Loading…" : "Refresh Pregame Data";
  if (isLoading) {
    elements.pregameMessage.hidden = false;
    elements.pregameMessage.classList.remove("error");
    elements.pregameMessage.textContent = message;
    setAppStatus("Contacting MLB Stats API…", "loading");
  }
}

function setStorageStatus(text, state) {
  elements.storageStatus.textContent = text;
  elements.storageStatus.className = `pill ${state === "ready" ? "ready" : state === "error" ? "error" : "neutral"}`;
}

function setLineupStatus(text, state) {
  elements.lineupStatus.textContent = text;
  const className = state === "ready" ? "ready" : state === "warning" ? "warning" : state === "error" ? "error" : "neutral";
  elements.lineupStatus.className = `pill ${className}`;
}

function setAppStatus(text, state) {
  elements.appStatusText.textContent = text;
  elements.appStatusDot.classList.remove("loading", "error");
  if (state === "loading") elements.appStatusDot.classList.add("loading");
  if (state === "error") elements.appStatusDot.classList.add("error");
}

function isValidFavoriteTeam(value) {
  return Boolean(value && Number.isInteger(Number(value.id)) && typeof value.name === "string" && value.name.trim());
}

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(year, month - 1, day));
}

function errorMessage(error, fallback) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
