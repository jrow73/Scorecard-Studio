/**
 * Scorecard Studio
 * Application coordinator
 * Version: 0.1.0-web-dev
 * Build: 002
 */

import { fetchMlbSchedule } from "./api.js";
import { getSetting, initializeStorage, setSetting } from "./storage.js";

const DEFAULT_FAVORITE_TEAM = {
  id: 136,
  name: "Seattle Mariners"
};

const elements = {
  refreshButton: document.querySelector("#refresh-games-btn"),
  gamesDate: document.querySelector("#games-date"),
  gamesCount: document.querySelector("#games-count"),
  gamesMessage: document.querySelector("#games-message"),
  gamesList: document.querySelector("#games-list"),
  appStatusText: document.querySelector("#app-status-text"),
  appStatusDot: document.querySelector("#app-status-dot"),
  favoriteTeamForm: document.querySelector("#favorite-team-form"),
  favoriteTeamSelect: document.querySelector("#favorite-team-select"),
  saveFavoriteTeamButton: document.querySelector("#save-favorite-team-btn"),
  storageStatus: document.querySelector("#storage-status"),
  storageMessage: document.querySelector("#storage-message")
};

initialize();

async function initialize() {
  const today = getLocalDateString();
  elements.gamesDate.textContent = formatDisplayDate(today);
  elements.refreshButton.addEventListener("click", () => loadGames(today));
  elements.favoriteTeamForm.addEventListener("submit", saveFavoriteTeam);

  await initializeFavoriteTeamSetting();
  await loadGames(today);
}

async function initializeFavoriteTeamSetting() {
  try {
    await initializeStorage();

    const savedTeam = await getSetting("favoriteTeam", null);
    const favoriteTeam = isValidFavoriteTeam(savedTeam)
      ? savedTeam
      : DEFAULT_FAVORITE_TEAM;

    if (!isValidFavoriteTeam(savedTeam)) {
      await setSetting("favoriteTeam", favoriteTeam);
    }

    elements.favoriteTeamSelect.value = String(favoriteTeam.id);
    setStorageStatus("IndexedDB ready", "ready");
    elements.storageMessage.textContent = `Saved favorite: ${favoriteTeam.name}`;
    setAppStatus("Browser storage ready", "ready");
  } catch (error) {
    console.error("Unable to initialize favorite-team setting:", error);
    setStorageStatus("Storage unavailable", "error");
    elements.storageMessage.textContent =
      error instanceof Error ? error.message : "Browser storage is unavailable.";
    elements.saveFavoriteTeamButton.disabled = true;
    elements.favoriteTeamSelect.disabled = true;
    setAppStatus("Browser storage unavailable", "error");
  }
}

async function saveFavoriteTeam(event) {
  event.preventDefault();

  const selectedOption = elements.favoriteTeamSelect.selectedOptions[0];
  if (!selectedOption) {
    return;
  }

  const favoriteTeam = {
    id: Number(selectedOption.value),
    name: selectedOption.textContent.trim()
  };

  elements.saveFavoriteTeamButton.disabled = true;
  elements.saveFavoriteTeamButton.textContent = "Saving…";
  elements.storageMessage.textContent = "Saving favorite team to this browser…";

  try {
    await setSetting("favoriteTeam", favoriteTeam);
    setStorageStatus("IndexedDB ready", "ready");
    elements.storageMessage.textContent =
      `Saved favorite: ${favoriteTeam.name}. Refresh the page to verify persistence.`;
    setAppStatus("Browser storage ready", "ready");
  } catch (error) {
    console.error("Unable to save favorite team:", error);
    setStorageStatus("Save failed", "error");
    elements.storageMessage.textContent =
      error instanceof Error ? error.message : "Could not save the favorite team.";
    setAppStatus("Browser storage error", "error");
  } finally {
    elements.saveFavoriteTeamButton.disabled = false;
    elements.saveFavoriteTeamButton.textContent = "Save Favorite Team";
  }
}

async function loadGames(date) {
  setGamesLoadingState(true);

  try {
    const games = await fetchMlbSchedule(date);
    renderGames(games);

    if (!elements.storageStatus.classList.contains("error")) {
      setAppStatus("Browser storage + MLB API ready", "ready");
    }
  } catch (error) {
    renderError(error);
    setAppStatus("MLB API unavailable", "error");
  } finally {
    setGamesLoadingState(false);
  }
}

function renderGames(games) {
  elements.gamesCount.textContent = `${games.length} ${games.length === 1 ? "game" : "games"}`;
  elements.gamesList.replaceChildren();

  if (games.length === 0) {
    elements.gamesMessage.textContent = "No MLB games are scheduled for today.";
    elements.gamesMessage.classList.remove("error");
    elements.gamesMessage.hidden = false;
    elements.gamesList.hidden = true;
    return;
  }

  for (const game of games) {
    const row = document.createElement("article");
    row.className = "game-row";

    const details = document.createElement("div");

    const matchup = document.createElement("div");
    matchup.className = "matchup";
    matchup.textContent = `${game.awayTeam} at ${game.homeTeam}`;

    const meta = document.createElement("div");
    meta.className = "game-meta";
    meta.textContent = `${game.venue} • ${game.status}`;

    const time = document.createElement("div");
    time.className = "game-time";
    time.textContent = formatGameTime(game.gameDate);

    details.append(matchup, meta);
    row.append(details, time);
    elements.gamesList.append(row);
  }

  elements.gamesMessage.hidden = true;
  elements.gamesMessage.classList.remove("error");
  elements.gamesList.hidden = false;
}

function renderError(error) {
  elements.gamesCount.textContent = "— games";
  elements.gamesList.hidden = true;
  elements.gamesMessage.hidden = false;
  elements.gamesMessage.classList.add("error");
  elements.gamesMessage.textContent =
    `Could not load today's MLB schedule. ${error instanceof Error ? error.message : "Unknown error."}`;
}

function setGamesLoadingState(isLoading) {
  elements.refreshButton.disabled = isLoading;
  elements.refreshButton.textContent = isLoading ? "Loading…" : "Refresh Games";

  if (isLoading) {
    elements.gamesMessage.hidden = false;
    elements.gamesMessage.classList.remove("error");
    elements.gamesMessage.textContent = "Loading today's MLB schedule…";
    elements.gamesList.hidden = true;
    setAppStatus("Contacting MLB Stats API…", "loading");
  }
}

function setStorageStatus(text, state) {
  elements.storageStatus.textContent = text;
  elements.storageStatus.classList.remove("ready", "error");

  if (state === "ready") {
    elements.storageStatus.classList.add("ready");
  } else if (state === "error") {
    elements.storageStatus.classList.add("error");
  }
}

function setAppStatus(text, state) {
  elements.appStatusText.textContent = text;
  elements.appStatusDot.classList.remove("loading", "error");

  if (state === "loading") {
    elements.appStatusDot.classList.add("loading");
  } else if (state === "error") {
    elements.appStatusDot.classList.add("error");
  }
}

function isValidFavoriteTeam(value) {
  return Boolean(
    value &&
    Number.isInteger(Number(value.id)) &&
    typeof value.name === "string" &&
    value.name.trim()
  );
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

function formatGameTime(value) {
  if (!value) return "Time TBD";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time TBD";

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}
