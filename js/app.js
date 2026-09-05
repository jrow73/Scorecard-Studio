/**
 * Scorecard Studio
 * Application coordinator
 * Version: 0.1.0-web-dev
 * Build: 001
 */

import { fetchMlbSchedule } from "./api.js";

const elements = {
  refreshButton: document.querySelector("#refresh-games-btn"),
  gamesDate: document.querySelector("#games-date"),
  gamesCount: document.querySelector("#games-count"),
  gamesMessage: document.querySelector("#games-message"),
  gamesList: document.querySelector("#games-list"),
  appStatusText: document.querySelector("#app-status-text"),
  appStatusDot: document.querySelector("#app-status-dot")
};

initialize();

function initialize() {
  const today = getLocalDateString();
  elements.gamesDate.textContent = formatDisplayDate(today);
  elements.refreshButton.addEventListener("click", () => loadGames(today));
  loadGames(today);
}

async function loadGames(date) {
  setLoadingState(true);

  try {
    const games = await fetchMlbSchedule(date);
    renderGames(games);
    setAppStatus("Connected to MLB Stats API", "ready");
  } catch (error) {
    renderError(error);
    setAppStatus("MLB API unavailable", "error");
  } finally {
    setLoadingState(false);
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

function setLoadingState(isLoading) {
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

function setAppStatus(text, state) {
  elements.appStatusText.textContent = text;
  elements.appStatusDot.classList.remove("loading", "error");

  if (state === "loading") {
    elements.appStatusDot.classList.add("loading");
  } else if (state === "error") {
    elements.appStatusDot.classList.add("error");
  }
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
