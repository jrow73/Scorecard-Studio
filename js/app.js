/**
 * Scorecard Studio
 * Application coordinator
 * Version: 0.2.0-dev
 * Build: 014
 */

import { fetchFavoriteTeamSchedule, fetchGameFeed, fetchTeamCoaches, fetchLeagueStandings } from "./api.js?v=014";
import { normalizePregameData } from "./normalize.js?v=014";
import { canonicalFieldId, collectionHasOverflow, getFieldDefinition, getFieldLabel, getSupportedFields, resolveField, sourceRequirementsForFields } from "./field-registry.js?v=014";
import { formatFieldValue } from "./formatter.js?v=014";
import {
  deleteLayout, deletePdfTemplate, getPdfTemplate, getSetting, initializeStorage,
  listLayouts, saveLayout, savePdfTemplate, setSetting
} from "./storage.js?v=014";

const DEFAULT_FAVORITE_TEAM = { id: 136, name: "Seattle Mariners" };

const state = {
  favoriteTeam: DEFAULT_FAVORITE_TEAM,
  selectedDate: null,
  schedule: [],
  selectedGamePk: null,
  selectedFeed: null,
  pdfDocument: null,
  pdfPageNumber: 1,
  pdfRecord: null,
  layouts: [],
  selectedLayoutId: null,
  pendingLayoutPdf: null,
  designerPdfDocument: null,
  designerPageNumber: 1,
  designerPlacing: false,
  designerPlacement: null,
  designerRenderToken: 0,
  designerRenderScale: 1,
  designerZoom: 1,
  normalizedPregame: null,
  gameDayLoadToken: 0
};

const elements = {
  refreshButton: document.querySelector("#refresh-pregame-btn"),
  favoriteTeamForm: document.querySelector("#favorite-team-form"),
  favoriteTeamSelect: document.querySelector("#favorite-team-select"),
  saveFavoriteTeamButton: document.querySelector("#save-favorite-team-btn"),
  storageStatus: document.querySelector("#storage-status"),
  storageMessage: document.querySelector("#storage-message"),
  todayDate: document.querySelector("#today-date"),
  gameDateInput: document.querySelector("#game-date-input"),
  gameDateTodayButton: document.querySelector("#game-date-today-btn"),
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
  navHome: document.querySelector("#nav-home"),
  navGameDay: document.querySelector("#nav-gameday"),
  refreshGameDayButton: document.querySelector("#refresh-gameday-btn"),
  gameDaySubtitle: document.querySelector("#gameday-subtitle"),
  gameDayMessage: document.querySelector("#gameday-message"),
  gameDayContent: document.querySelector("#gameday-content"),
  gameDaySources: document.querySelector("#gameday-sources"),
  coachesSourcePill: document.querySelector("#coaches-source-pill"),
  standingsSourcePill: document.querySelector("#standings-source-pill"),
  gameDayTeamGrid: document.querySelector("#gameday-team-grid"),
  gameDayAwayLineupHeading: document.querySelector("#gameday-away-lineup-heading"),
  gameDayHomeLineupHeading: document.querySelector("#gameday-home-lineup-heading"),
  gameDayAwayLineup: document.querySelector("#gameday-away-lineup"),
  gameDayHomeLineup: document.querySelector("#gameday-home-lineup"),
  gameDayAwayPitchingHeading: document.querySelector("#gameday-away-pitching-heading"),
  gameDayHomePitchingHeading: document.querySelector("#gameday-home-pitching-heading"),
  gameDayAwayPitching: document.querySelector("#gameday-away-pitching"),
  gameDayHomePitching: document.querySelector("#gameday-home-pitching"),
  gameDayAwayBenchHeading: document.querySelector("#gameday-away-bench-heading"),
  gameDayHomeBenchHeading: document.querySelector("#gameday-home-bench-heading"),
  gameDayAwayBench: document.querySelector("#gameday-away-bench"),
  gameDayHomeBench: document.querySelector("#gameday-home-bench"),
  gameDayUmpires: document.querySelector("#gameday-umpires"),
  gameDayVenue: document.querySelector("#gameday-venue"),
  navLayouts: document.querySelector("#nav-layouts"),
  pageTitle: document.querySelector("#page-title"),
  pageEyebrow: document.querySelector("#page-eyebrow"),
  layoutStorageStatus: document.querySelector("#layout-storage-status"),
  layoutNameInput: document.querySelector("#layout-name-input"),
  layoutDescriptionInput: document.querySelector("#layout-description-input"),
  layoutPdfInput: document.querySelector("#layout-pdf-input"),
  layoutPdfSummary: document.querySelector("#layout-pdf-summary"),
  createLayoutButton: document.querySelector("#create-layout-btn"),
  layoutMessage: document.querySelector("#layout-message"),
  layoutList: document.querySelector("#layout-list"),
  layoutCount: document.querySelector("#layout-count"),
  layoutDetailCard: document.querySelector("#layout-detail-card"),
  selectedLayoutHeading: document.querySelector("#selected-layout-heading"),
  selectedLayoutMeta: document.querySelector("#selected-layout-meta"),
  editLayoutName: document.querySelector("#edit-layout-name"),
  editLayoutDescription: document.querySelector("#edit-layout-description"),
  saveLayoutMetadataButton: document.querySelector("#save-layout-metadata-btn"),
  duplicateLayoutButton: document.querySelector("#duplicate-layout-btn"),
  deleteLayoutButton: document.querySelector("#delete-layout-btn"),
  pdfViewer: document.querySelector("#pdf-viewer"),
  pdfCanvas: document.querySelector("#pdf-canvas"),
  pdfPageLabel: document.querySelector("#pdf-page-label"),
  pdfPrevButton: document.querySelector("#pdf-prev-btn"),
  pdfNextButton: document.querySelector("#pdf-next-btn"),
  navDesigner: document.querySelector("#nav-designer"),
  openDesignerButton: document.querySelector("#open-designer-btn"),
  designerBackButton: document.querySelector("#designer-back-btn"),
  designerLayoutMeta: document.querySelector("#designer-layout-meta"),
  designerFieldSelect: document.querySelector("#designer-field-select"),
  designerFontSize: document.querySelector("#designer-font-size"),
  designerPlaceButton: document.querySelector("#designer-place-btn"),
  designerTemplateText: document.querySelector("#designer-template-text"),
  designerTemplateField: document.querySelector("#designer-template-field"),
  designerTemplateInsertButton: document.querySelector("#designer-template-insert-btn"),
  designerTemplateAlignment: document.querySelector("#designer-template-alignment"),
  designerTemplateFontSize: document.querySelector("#designer-template-font-size"),
  designerTemplatePreview: document.querySelector("#designer-template-preview"),
  designerTemplatePlaceButton: document.querySelector("#designer-template-place-btn"),
  designerBlockCount: document.querySelector("#designer-block-count"),
  designerLineupSide: document.querySelector("#designer-lineup-side"),
  designerLineupCapacity: document.querySelector("#designer-lineup-capacity"),
  designerBlockArrangement: document.querySelector("#designer-block-arrangement"),
  designerCapacityWrap: document.querySelector("#designer-capacity-wrap"),
  designerGridDimensions: document.querySelector("#designer-grid-dimensions"),
  designerGridRows: document.querySelector("#designer-grid-rows"),
  designerGridColumns: document.querySelector("#designer-grid-columns"),
  designerCreateBlockButton: document.querySelector("#designer-create-block-btn"),
  designerBlockSelect: document.querySelector("#designer-block-select"),
  designerPlaceRowsButton: document.querySelector("#designer-place-rows-btn"),
  designerColumnField: document.querySelector("#designer-column-field"),
  designerColumnAlignment: document.querySelector("#designer-column-alignment"),
  designerColumnFontSize: document.querySelector("#designer-column-font-size"),
  designerPlaceColumnButton: document.querySelector("#designer-place-column-btn"),
  designerDeleteBlockButton: document.querySelector("#designer-delete-block-btn"),
  designerBlockList: document.querySelector("#designer-block-list"),
  designerIndividualCount: document.querySelector("#designer-individual-count"),
  designerIndividualCollection: document.querySelector("#designer-individual-collection"),
  designerIndividualStrategy: document.querySelector("#designer-individual-strategy"),
  designerIndividualSlotWrap: document.querySelector("#designer-individual-slot-wrap"),
  designerIndividualSlot: document.querySelector("#designer-individual-slot"),
  designerIndividualRoleWrap: document.querySelector("#designer-individual-role-wrap"),
  designerIndividualRole: document.querySelector("#designer-individual-role"),
  designerIndividualField: document.querySelector("#designer-individual-field"),
  designerIndividualAlignment: document.querySelector("#designer-individual-alignment"),
  designerIndividualFontSize: document.querySelector("#designer-individual-font-size"),
  designerIndividualPlaceButton: document.querySelector("#designer-individual-place-btn"),
  designerIndividualList: document.querySelector("#designer-individual-list"),
  designerGenerateButton: document.querySelector("#designer-generate-btn"),
  generateMessage: document.querySelector("#generate-message"),
  designerMessage: document.querySelector("#designer-message"),
  designerMappingCount: document.querySelector("#designer-mapping-count"),
  designerMappingList: document.querySelector("#designer-mapping-list"),
  designerPrevButton: document.querySelector("#designer-prev-btn"),
  designerNextButton: document.querySelector("#designer-next-btn"),
  designerPageLabel: document.querySelector("#designer-page-label"),
  designerZoomOutButton: document.querySelector("#designer-zoom-out-btn"),
  designerZoomInButton: document.querySelector("#designer-zoom-in-btn"),
  designerZoomSelect: document.querySelector("#designer-zoom-select"),
  designerStageScroll: document.querySelector("#designer-stage-scroll"),
  designerStage: document.querySelector("#designer-stage"),
  designerPdfCanvas: document.querySelector("#designer-pdf-canvas"),
  designerOverlay: document.querySelector("#designer-overlay"),
  appStatusText: document.querySelector("#app-status-text"),
  appStatusDot: document.querySelector("#app-status-dot")
};

async function initialize() {
  const today = getLocalDateString();
  state.selectedDate = today;
  elements.gameDateInput.value = today;
  updateSelectedDateUi(today);
  populateDesignerFieldSelect();
  populateDesignerTemplateFieldSelect();
  updateDesignerTemplatePreview();
  elements.saveFavoriteTeamButton.addEventListener("click", saveFavoriteTeam);
  elements.refreshButton.addEventListener("click", () => loadFavoriteTeamPregame(state.selectedDate || today));
  elements.gameDateInput.addEventListener("change", handleGameDateChange);
  elements.gameDateTodayButton.addEventListener("click", () => setSelectedGameDate(getLocalDateString()));
  elements.navHome.addEventListener("click", () => showView("home"));
  elements.navGameDay.addEventListener("click", openGameDay);
  elements.refreshGameDayButton.addEventListener("click", () => loadGameDay(true));
  elements.navLayouts.addEventListener("click", () => showView("layouts"));
  elements.navDesigner.addEventListener("click", () => {
    if (selectedLayout()) openDesigner();
    else { showView("layouts"); setLayoutMessage("Open a layout before using the Designer.", true); }
  });
  elements.layoutPdfInput.addEventListener("change", handleLayoutPdfSelection);
  elements.createLayoutButton.addEventListener("click", createLayout);
  elements.saveLayoutMetadataButton.addEventListener("click", saveSelectedLayoutMetadata);
  elements.duplicateLayoutButton.addEventListener("click", duplicateSelectedLayout);
  elements.deleteLayoutButton.addEventListener("click", deleteSelectedLayout);
  elements.pdfPrevButton.addEventListener("click", () => changePdfPage(-1));
  elements.pdfNextButton.addEventListener("click", () => changePdfPage(1));
  elements.openDesignerButton.addEventListener("click", openDesigner);
  elements.designerBackButton.addEventListener("click", () => showView("layouts"));
  elements.designerPlaceButton.addEventListener("click", beginDesignerPlacement);
  elements.designerTemplateInsertButton.addEventListener("click", insertDesignerTemplateField);
  elements.designerTemplateText.addEventListener("input", updateDesignerTemplatePreview);
  elements.designerTemplatePlaceButton.addEventListener("click", beginDesignerTemplatePlacement);
  elements.designerCreateBlockButton.addEventListener("click", createDesignerRepeatedBlock);
  elements.designerBlockSelect.addEventListener("change", syncDesignerBlockControls);
  elements.designerLineupSide.addEventListener("change", populateDesignerColumnFieldSelect);
  elements.designerBlockArrangement.addEventListener("change", syncDesignerArrangementInputs);
  elements.designerPlaceRowsButton.addEventListener("click", beginDesignerBlockGeometryPlacement);
  elements.designerPlaceColumnButton.addEventListener("click", beginDesignerBlockColumnPlacement);
  elements.designerDeleteBlockButton.addEventListener("click", deleteSelectedDesignerBlock);
  elements.designerIndividualCollection.addEventListener("change", syncDesignerIndividualControls);
  elements.designerIndividualStrategy.addEventListener("change", syncDesignerIndividualControls);
  elements.designerIndividualPlaceButton.addEventListener("click", beginDesignerIndividualPlacement);
  elements.designerGenerateButton.addEventListener("click", generateTestPdf);
  elements.designerPrevButton.addEventListener("click", () => changeDesignerPage(-1));
  elements.designerNextButton.addEventListener("click", () => changeDesignerPage(1));
  elements.designerZoomOutButton.addEventListener("click", () => changeDesignerZoom(-1));
  elements.designerZoomInButton.addEventListener("click", () => changeDesignerZoom(1));
  elements.designerZoomSelect.addEventListener("change", () => setDesignerZoom(Number(elements.designerZoomSelect.value)));
  elements.designerStage.addEventListener("click", handleDesignerStageClick);
  window.addEventListener("resize", debounce(() => {
    if (!document.querySelector('[data-view="designer"]').hidden && state.designerPdfDocument) renderDesignerPage();
  }, 150));

  await initializeFavoriteTeamSetting();
  await refreshLayouts();
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
    await loadFavoriteTeamPregame(state.selectedDate || getLocalDateString());
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
  const requestedDate = date || getLocalDateString();
  const dateChanged = state.selectedDate !== requestedDate;
  state.selectedDate = requestedDate;
  elements.gameDateInput.value = requestedDate;
  updateSelectedDateUi(requestedDate);
  if (dateChanged) {
    state.selectedGamePk = null;
    state.selectedFeed = null;
  }

  setPregameLoading(true, `Finding ${state.favoriteTeam.name} game for ${formatDisplayDate(requestedDate)}…`);

  try {
    const schedule = await fetchFavoriteTeamSchedule(requestedDate, state.favoriteTeam.id);
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

async function handleGameDateChange() {
  const value = elements.gameDateInput.value;
  if (!value) return;
  await setSelectedGameDate(value);
}

async function setSelectedGameDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return;
  await loadFavoriteTeamPregame(date);
}

function updateSelectedDateUi(date) {
  const today = getLocalDateString();
  const isToday = date === today;
  elements.todayDate.textContent = formatDisplayDate(date);
  const heading = document.querySelector("#today-heading");
  if (heading) heading.textContent = isToday ? "Today's Game" : "Selected Game";
  elements.gameDateTodayButton.disabled = isToday;
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
    if (String(state.selectedGamePk) !== String(selected.gamePk)) return;
    state.selectedFeed = feed;
    state.normalizedPregame = normalizePregameData(feed, {}, selected);
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
  const selectedDate = state.selectedDate || getLocalDateString();
  const when = selectedDate === getLocalDateString() ? "today" : `on ${formatDisplayDate(selectedDate)}`;
  elements.pregameMessage.textContent = `No ${state.favoriteTeam.name} game is scheduled ${when}.`;
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


async function openGameDay() {
  showView("gameday");
  await loadGameDay(false);
}

async function loadGameDay(forceSupplemental = false) {
  const feed = state.selectedFeed;
  const game = currentScheduleGame();
  if (!feed || !game) {
    elements.gameDayContent.hidden = true;
    elements.gameDaySources.hidden = true;
    elements.gameDayMessage.hidden = false;
    elements.gameDayMessage.classList.remove("error");
    elements.gameDayMessage.textContent = "No game is selected. Return Home and select a game first.";
    return;
  }

  const token = ++state.gameDayLoadToken;
  const gd = feed.gameData || {};
  const officialDate = gd.datetime?.officialDate || game.officialDate || getLocalDateString();
  const season = Number(gd.game?.season || officialDate.slice(0, 4));
  const away = gd.teams?.away || {};
  const home = gd.teams?.home || {};
  elements.gameDaySubtitle.textContent = `${away.name || game.awayTeam} at ${home.name || game.homeTeam} • ${formatDisplayDate(officialDate)}`;
  elements.gameDayMessage.hidden = false;
  elements.gameDayMessage.classList.remove("error");
  elements.gameDayMessage.textContent = "Game Pack loaded. Checking supplemental manager and standings data…";
  elements.gameDayContent.hidden = false;
  elements.gameDaySources.hidden = false;

  const baseModel = normalizePregameData(feed, {}, game);
  state.normalizedPregame = baseModel;
  renderGameDay(baseModel);

  elements.refreshGameDayButton.disabled = true;
  elements.coachesSourcePill.textContent = "Coaches API: loading…";
  elements.standingsSourcePill.textContent = "Standings API: loading…";

  const awayId = away.id || game.awayTeamId;
  const homeId = home.id || game.homeTeamId;
  const leagueIds = [...new Set([away.league?.id, home.league?.id].filter(Boolean))];

  try {
    const [coachResults, standingsResults] = await Promise.all([
      Promise.allSettled([
        awayId ? fetchTeamCoaches(awayId, officialDate, season) : Promise.resolve(null),
        homeId ? fetchTeamCoaches(homeId, officialDate, season) : Promise.resolve(null)
      ]),
      Promise.allSettled(leagueIds.map((id) => fetchLeagueStandings(id, officialDate, season)))
    ]);
    if (token !== state.gameDayLoadToken || String(state.selectedGamePk) !== String(game.gamePk)) return;

    const coaches = {
      away: coachResults[0]?.status === "fulfilled" ? coachResults[0].value : null,
      home: coachResults[1]?.status === "fulfilled" ? coachResults[1].value : null
    };
    const standingsPayloads = standingsResults.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const model = normalizePregameData(feed, { coaches, standingsPayloads }, game);
    state.normalizedPregame = model;

    const coachOk = Boolean(coaches.away || coaches.home);
    const standingsOk = standingsPayloads.length > 0;
    elements.coachesSourcePill.textContent = coachOk ? "Coaches API: loaded" : "Coaches API: unavailable";
    elements.coachesSourcePill.className = `pill ${coachOk ? "ready" : "error"}`;
    elements.standingsSourcePill.textContent = standingsOk ? "Standings API: loaded" : "Standings API: unavailable";
    elements.standingsSourcePill.className = `pill ${standingsOk ? "ready" : "error"}`;
    renderGameDay(model);
    elements.gameDayMessage.textContent = coachOk && standingsOk
      ? "Game Pack + supplemental data loaded successfully."
      : "Game Pack is available. One or more supplemental requests did not return data; the page shows everything that loaded.";
  } catch (error) {
    if (token !== state.gameDayLoadToken) return;
    console.error("Game Day supplemental hydration failed:", error);
    elements.gameDayMessage.classList.add("error");
    elements.gameDayMessage.textContent = `Game Pack loaded, but supplemental hydration failed. ${errorMessage(error, "Unknown error.")}`;
  } finally {
    if (token === state.gameDayLoadToken) elements.refreshGameDayButton.disabled = false;
  }
}

function renderGameDay(model) {
  if (!model) return;
  renderGameDayTeamCards(model.away, model.home);

  elements.gameDayAwayLineupHeading.textContent = model.away?.team?.name || "Away";
  elements.gameDayHomeLineupHeading.textContent = model.home?.team?.name || "Home";
  renderGameDayLineup(elements.gameDayAwayLineup, model.away?.lineup || []);
  renderGameDayLineup(elements.gameDayHomeLineup, model.home?.lineup || []);

  elements.gameDayAwayPitchingHeading.textContent = model.away?.team?.name || "Away";
  elements.gameDayHomePitchingHeading.textContent = model.home?.team?.name || "Home";
  renderGameDayPitching(elements.gameDayAwayPitching, model.away?.startingPitcher, model.away?.bullpen || []);
  renderGameDayPitching(elements.gameDayHomePitching, model.home?.startingPitcher, model.home?.bullpen || []);

  elements.gameDayAwayBenchHeading.textContent = model.away?.team?.name || "Away";
  elements.gameDayHomeBenchHeading.textContent = model.home?.team?.name || "Home";
  renderGameDayBench(elements.gameDayAwayBench, model.away?.bench || []);
  renderGameDayBench(elements.gameDayHomeBench, model.home?.bench || []);
  renderGameDayUmpires(model.game?.umpires);
  renderGameDayVenue(model.game);
}

function renderGameDayTeamCards(away, home) {
  elements.gameDayTeamGrid.replaceChildren();
  [["away", away], ["home", home]].forEach(([side, data]) => {
    const card = document.createElement("section");
    card.className = "card gameday-team-card";
    const team = data?.team || {};
    const record = team.record || {};
    const standings = team.standings || {};
    card.innerHTML = `<p class="section-label">${side === "away" ? "Away" : "Home"}</p><h3>${escapeHtml(team.name || "Team")}</h3>
      <div class="gameday-stat-grid">
        ${gameDayStat("Record", record.wins != null && record.losses != null ? `${record.wins}-${record.losses}` : "—")}
        ${gameDayStat("PCT", record.pct != null ? formatRate(record.pct, 3) : "—")}
        ${gameDayStat("Division", team.division?.name || "—")}
        ${gameDayStat("Manager", data?.manager?.name || "Not loaded")}
        ${gameDayStat("Division Rank", standings.divisionRank ?? "—")}
        ${gameDayStat("Games Back", standings.divisionGamesBack ?? "—")}
        ${gameDayStat("Streak", standings.streak || "—")}
        ${gameDayStat("Last 10", standings.last10?.display || "—")}
      </div>`;
    elements.gameDayTeamGrid.append(card);
  });
}

function gameDayStat(label, value) {
  return `<div class="gameday-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value ?? "—"))}</strong></div>`;
}

function renderGameDayLineup(tbody, slots) {
  tbody.replaceChildren();
  const players = slots.filter((slot) => slot?.player?.name);
  if (!players.length) {
    const tr = document.createElement("tr"); tr.innerHTML = '<td colspan="10" class="gameday-empty">Lineup not posted.</td>'; tbody.append(tr); return;
  }
  slots.forEach((slot, index) => {
    if (!slot?.player?.name) return;
    const stats = slot.stats || {};
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${slot.battingOrder || index + 1}</td><td><strong>${escapeHtml(slot.player.name)}</strong><span class="gameday-number">${slot.player.number ? `#${escapeHtml(slot.player.number)}` : ""}</span></td><td>${escapeHtml(slot.position?.abbreviation || "—")}</td><td>${escapeHtml(slot.player.bats || "—")}</td><td>${escapeHtml(formatRate(stats.avg, 3) || "—")}</td><td>${escapeHtml(formatRate(stats.obp, 3) || "—")}</td><td>${escapeHtml(formatRate(stats.slg, 3) || "—")}</td><td>${escapeHtml(formatRate(stats.ops, 3) || "—")}</td><td>${escapeHtml(String(stats.homeRuns ?? "—"))}</td><td>${escapeHtml(String(stats.rbi ?? "—"))}</td>`;
    tbody.append(tr);
  });
}

function renderGameDayPitching(container, starter, bullpen) {
  container.replaceChildren();
  if (starter?.player?.name) container.append(gameDayPitcherRow(starter, "SP"));
  bullpen.filter((player) => player?.player?.name).forEach((player) => container.append(gameDayPitcherRow(player, "RP")));
  if (!starter?.player?.name && !bullpen.length) container.append(emptyRow("Pitchers not listed."));
}

function gameDayPitcherRow(item, role) {
  const stats = item?.stats || {};
  const row = document.createElement("div"); row.className = "gameday-person-row";
  const record = stats.wins != null && stats.losses != null ? `${stats.wins}-${stats.losses}` : "—";
  row.innerHTML = `<div><strong>${escapeHtml(role)} ${escapeHtml(item?.player?.name || "Player")}</strong><span>${item?.player?.number ? `#${escapeHtml(item.player.number)} • ` : ""}${escapeHtml(item?.player?.throws || "—")}HP</span></div><div class="gameday-person-stats"><span>${escapeHtml(record)} W-L</span><span>${escapeHtml(formatRate(stats.era, 2) || "—")} ERA</span><span>${escapeHtml(formatRate(stats.whip, 2) || "—")} WHIP</span><span>${escapeHtml(String(stats.strikeouts ?? "—"))} K</span></div>`;
  return row;
}

function renderGameDayBench(container, players) {
  container.replaceChildren();
  const known = players.filter((item) => item?.player?.name);
  if (!known.length) { container.append(emptyRow("Bench not listed.")); return; }
  known.forEach((item) => {
    const stats = item.stats || {};
    const row = document.createElement("div"); row.className = "gameday-person-row";
    row.innerHTML = `<div><strong>${escapeHtml(item.player.name)}</strong><span>${item.player.number ? `#${escapeHtml(item.player.number)} • ` : ""}${escapeHtml(item.position?.abbreviation || item.player.primaryPosition?.abbreviation || "—")} • Bats ${escapeHtml(item.player.bats || "—")}</span></div><div class="gameday-person-stats"><span>${escapeHtml(formatRate(stats.avg, 3) || "—")} AVG</span><span>${escapeHtml(formatRate(stats.ops, 3) || "—")} OPS</span><span>${escapeHtml(String(stats.homeRuns ?? "—"))} HR</span></div>`;
    container.append(row);
  });
}

function renderGameDayUmpires(umpires) {
  elements.gameDayUmpires.replaceChildren();
  const rows = [
    ["Home Plate", umpires?.home], ["First Base", umpires?.first], ["Second Base", umpires?.second], ["Third Base", umpires?.third],
    ...(umpires?.additional || []).map((item) => [item.role || "Official", item])
  ].filter(([, item]) => item?.name);
  if (!rows.length) { elements.gameDayUmpires.append(emptyRow("Umpire crew not listed yet.")); return; }
  rows.forEach(([role, item]) => {
    const row = document.createElement("div"); row.className = "gameday-person-row simple";
    row.innerHTML = `<strong>${escapeHtml(role)}</strong><span>${escapeHtml(item.name)}</span>`;
    elements.gameDayUmpires.append(row);
  });
}

function renderGameDayVenue(game) {
  const venue = game?.venue || {}; const weather = game?.weather || {};
  const weatherParts = [weather.condition, weather.temperature != null ? `${weather.temperature}°` : "", weather.wind].filter(Boolean);
  const values = [
    ["Venue", venue.name || "—"], ["Capacity", venue.capacity != null ? Number(venue.capacity).toLocaleString() : "—"], ["Surface", venue.turfType || "—"], ["Roof", venue.roofType || "—"],
    ["Weather", weatherParts.join(" • ") || "—"], ["Location", [venue.city, venue.state].filter(Boolean).join(", ") || "—"]
  ];
  elements.gameDayVenue.innerHTML = `<div class="gameday-stat-grid">${values.map(([a,b]) => gameDayStat(a,b)).join("")}</div>`;
}

function formatRate(value, precision) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  const text = number.toFixed(precision);
  return precision === 3 && Math.abs(number) < 1 ? text.replace(/^0(?=\.)/, "") : text;
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


function showView(view) {
  document.querySelectorAll("[data-view]").forEach((node) => {
    node.hidden = node.dataset.view !== view;
  });
  elements.navHome.classList.toggle("active", view === "home");
  elements.navGameDay.classList.toggle("active", view === "gameday");
  elements.navLayouts.classList.toggle("active", view === "layouts");
  elements.navDesigner.classList.toggle("active", view === "designer");
  elements.navHome.toggleAttribute("aria-current", view === "home");
  elements.navLayouts.toggleAttribute("aria-current", view === "layouts");
  elements.navDesigner.toggleAttribute("aria-current", view === "designer");
  elements.pageTitle.textContent = view === "home" ? "Home" : view === "gameday" ? "Game Day" : view === "layouts" ? "Layouts" : "Layout Designer";
  elements.pageEyebrow.textContent = view === "home" ? "Scorecard Studio • Pregame" : view === "layouts" ? "Scorecard Studio • Layout Management" : "Scorecard Studio • Field Mapping";
  elements.refreshButton.hidden = view !== "home";
}

function handleLayoutPdfSelection(event) {
  const file = event.target.files?.[0] ?? null;
  state.pendingLayoutPdf = file;
  elements.layoutPdfSummary.textContent = file ? `${file.name} • ${formatFileSize(file.size)}` : "No PDF selected.";
}

async function createLayout() {
  const name = elements.layoutNameInput.value.trim();
  const description = elements.layoutDescriptionInput.value.trim();
  const file = state.pendingLayoutPdf;
  if (!name) return setLayoutMessage("Enter a layout name.", true);
  if (!file) return setLayoutMessage("Choose a PDF template.", true);
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setLayoutMessage("Please choose a PDF file.", true);

  setLayoutBusy(true, "Reading PDF…");
  try {
    const pdf = await loadPdfDocument(file);
    const id = createId();
    const now = new Date().toISOString();
    await savePdfTemplate(id, file);
    const layout = {
      id,
      schemaVersion: 2,
      mappings: [],
      name,
      description,
      pdfTemplateId: id,
      pdfFileName: file.name,
      pageCount: pdf.numPages,
      createdAt: now,
      updatedAt: now
    };
    await saveLayout(layout);
    elements.layoutNameInput.value = "";
    elements.layoutDescriptionInput.value = "";
    elements.layoutPdfInput.value = "";
    elements.layoutPdfSummary.textContent = "No PDF selected.";
    state.pendingLayoutPdf = null;
    await refreshLayouts();
    await openLayout(id);
    setLayoutMessage(`Created ${layout.name}.`);
  } catch (error) {
    console.error("Unable to create layout:", error);
    setLayoutMessage(errorMessage(error, "The layout could not be created."), true);
  } finally {
    setLayoutBusy(false);
  }
}

async function refreshLayouts() {
  try {
    state.layouts = await listLayouts();
    renderLayoutList();
    elements.layoutStorageStatus.textContent = "IndexedDB Ready";
    elements.layoutStorageStatus.className = "pill ready";
  } catch (error) {
    console.error("Unable to load layouts:", error);
    elements.layoutStorageStatus.textContent = "Layout Error";
    elements.layoutStorageStatus.className = "pill error";
    setLayoutMessage(errorMessage(error, "Layouts could not be loaded."), true);
  }
}

function renderLayoutList() {
  elements.layoutList.replaceChildren();
  const count = state.layouts.length;
  elements.layoutCount.textContent = `${count} layout${count === 1 ? "" : "s"}`;
  if (!count) {
    const empty = document.createElement("div");
    empty.className = "empty-note";
    empty.textContent = "No layouts saved yet.";
    elements.layoutList.append(empty);
    return;
  }
  state.layouts.forEach((layout) => {
    const card = document.createElement("article");
    card.className = `layout-list-item${layout.id === state.selectedLayoutId ? " selected" : ""}`;
    const copy = document.createElement("div");
    copy.className = "layout-list-copy";
    const title = document.createElement("strong");
    title.textContent = layout.name;
    const desc = document.createElement("span");
    desc.textContent = layout.description || layout.pdfFileName || "PDF layout";
    const meta = document.createElement("small");
    meta.textContent = `${layout.pageCount} page${layout.pageCount === 1 ? "" : "s"} • Schema ${layout.schemaVersion}`;
    copy.append(title, desc, meta);
    const open = document.createElement("button");
    open.type = "button";
    open.className = "secondary-button";
    open.textContent = "Open";
    open.addEventListener("click", () => openLayout(layout.id));
    card.append(copy, open);
    elements.layoutList.append(card);
  });
}

async function openLayout(id) {
  const layout = state.layouts.find((item) => item.id === id);
  if (layout && !Array.isArray(layout.mappings)) layout.mappings = [];
  if (!layout) return;
  const mappingIdsAdded = ensureMappingIds(layout);
  if (mappingIdsAdded) {
    layout.updatedAt = new Date().toISOString();
    try { await saveLayout(layout); }
    catch (error) { console.warn("Unable to persist legacy mapping IDs:", error); }
  }
  state.selectedLayoutId = id;
  renderLayoutList();
  elements.layoutDetailCard.hidden = false;
  elements.selectedLayoutHeading.textContent = layout.name;
  elements.selectedLayoutMeta.textContent = `${layout.pdfFileName} • ${layout.pageCount} page${layout.pageCount === 1 ? "" : "s"}`;
  elements.editLayoutName.value = layout.name;
  elements.editLayoutDescription.value = layout.description || "";
  try {
    const record = await getPdfTemplate(layout.pdfTemplateId);
    if (!record?.blob) throw new Error("This layout's PDF template is missing.");
    setLayoutBusy(true, "Opening layout PDF…");
    const pdf = await loadPdfDocument(record.blob);
    await showPdfDocument(pdf, record, 1);
  } catch (error) {
    console.error("Unable to open layout PDF:", error);
    state.pdfDocument = null;
    elements.pdfViewer.hidden = true;
    setLayoutMessage(errorMessage(error, "The layout PDF could not be opened."), true);
  } finally {
    setLayoutBusy(false);
  }
}

async function saveSelectedLayoutMetadata() {
  const layout = selectedLayout();
  if (!layout) return;
  const name = elements.editLayoutName.value.trim();
  if (!name) return setLayoutMessage("Layout name cannot be blank.", true);
  try {
    const updated = { ...layout, name, description: elements.editLayoutDescription.value.trim(), updatedAt: new Date().toISOString() };
    await saveLayout(updated);
    await refreshLayouts();
    state.selectedLayoutId = updated.id;
    elements.selectedLayoutHeading.textContent = updated.name;
    setLayoutMessage(`Saved changes to ${updated.name}.`);
  } catch (error) {
    setLayoutMessage(errorMessage(error, "Layout changes could not be saved."), true);
  }
}

async function duplicateSelectedLayout() {
  const layout = selectedLayout();
  if (!layout) return;
  setLayoutBusy(true, "Duplicating layout…");
  try {
    const sourcePdf = await getPdfTemplate(layout.pdfTemplateId);
    if (!sourcePdf?.blob) throw new Error("The source PDF is missing.");
    const id = createId();
    const now = new Date().toISOString();
    const blobAsFile = new File([sourcePdf.blob], sourcePdf.name, { type: sourcePdf.type || "application/pdf" });
    await savePdfTemplate(id, blobAsFile);
    const duplicate = { ...layout, id, pdfTemplateId: id, name: `${layout.name} Copy`, createdAt: now, updatedAt: now };
    await saveLayout(duplicate);
    await refreshLayouts();
    await openLayout(id);
    setLayoutMessage(`Duplicated ${layout.name}.`);
  } catch (error) {
    console.error("Unable to duplicate layout:", error);
    setLayoutMessage(errorMessage(error, "The layout could not be duplicated."), true);
  } finally {
    setLayoutBusy(false);
  }
}

async function deleteSelectedLayout() {
  const layout = selectedLayout();
  if (!layout) return;
  if (!window.confirm(`Delete layout "${layout.name}" and its stored PDF?`)) return;
  setLayoutBusy(true, "Deleting layout…");
  try {
    await deleteLayout(layout.id);
    await deletePdfTemplate(layout.pdfTemplateId);
    state.selectedLayoutId = null;
    state.pdfDocument = null;
    state.pdfRecord = null;
    elements.pdfViewer.hidden = true;
    elements.layoutDetailCard.hidden = true;
    await refreshLayouts();
    setLayoutMessage(`Deleted ${layout.name}.`);
  } catch (error) {
    console.error("Unable to delete layout:", error);
    setLayoutMessage(errorMessage(error, "The layout could not be deleted."), true);
  } finally {
    setLayoutBusy(false);
  }
}


async function openDesigner() {
  const layout = selectedLayout();
  if (!layout) return;
  showView("designer");
  elements.designerLayoutMeta.textContent = `${layout.name} • ${layout.pdfFileName} • ${layout.pageCount} page${layout.pageCount === 1 ? "" : "s"}`;
  setDesignerMessage("Loading layout PDF…");
  try {
    const record = await getPdfTemplate(layout.pdfTemplateId);
    if (!record?.blob) throw new Error("This layout's PDF template is missing.");
    state.designerPdfDocument = await loadPdfDocument(record.blob);
    state.designerPageNumber = 1;
    cancelDesignerPlacement();
    ensureRepeatedBlockIds(layout);
    populateDesignerBlockSelect();
    populateDesignerColumnFieldSelect();
    syncDesignerIndividualControls();
    await renderDesignerPage();
    renderDesignerMappingList();
    renderDesignerBlockList();
    renderDesignerIndividualList();
    setDesignerMessage("Place scalar fields, composite text, repeated blocks, or individual collection items.");
  } catch (error) {
    console.error("Unable to open Designer:", error);
    setDesignerMessage(errorMessage(error, "The Designer could not open this layout."), true);
  }
}

function beginDesignerPlacement() {
  if (!state.designerPdfDocument) return setDesignerMessage("Open a layout PDF first.", true);
  const size = Number(elements.designerFontSize.value);
  if (!Number.isFinite(size) || size < 1 || size > 144) return setDesignerMessage("Font size must be between 1 and 144 points.", true);
  setDesignerPlacement({ mode: "scalar" });
  setDesignerMessage(`Click where the baseline for ${designerFieldLabel(elements.designerFieldSelect.value)} should begin.`);
}

function populateDesignerTemplateFieldSelect() {
  if (!elements.designerTemplateField) return;
  elements.designerTemplateField.replaceChildren();
  const groups = new Map();
  for (const definition of getSupportedFields({ cardinality: "single" })) {
    if (!groups.has(definition.category)) groups.set(definition.category, []);
    groups.get(definition.category).push(definition);
  }
  for (const [category, definitions] of groups) {
    const group = document.createElement("optgroup");
    group.label = category;
    for (const definition of definitions) {
      const option = document.createElement("option");
      option.value = definition.id;
      option.textContent = definition.label;
      group.append(option);
    }
    elements.designerTemplateField.append(group);
  }
}

function templateTokenForField(fieldId) {
  const definition = getFieldDefinition(fieldId);
  return definition ? `[${definition.label}]` : "";
}

function templateFieldIdByToken(tokenText) {
  const token = String(tokenText || "").trim();
  const direct = getFieldDefinition(token);
  if (direct?.cardinality === "single") return direct.id;
  const definition = getSupportedFields({ cardinality: "single" }).find((entry) => entry.label === token);
  return definition?.id || null;
}

function templateFieldIds(template) {
  const ids = [];
  const seen = new Set();
  const regex = /\[([^\[\]]+)\]/g;
  let match;
  while ((match = regex.exec(String(template || ""))) !== null) {
    const id = templateFieldIdByToken(match[1]);
    if (id && !seen.has(id)) { seen.add(id); ids.push(id); }
  }
  return ids;
}

function resolveTemplateText(template, model) {
  return String(template || "").replace(/\[([^\[\]]+)\]/g, (_whole, token) => {
    const fieldId = templateFieldIdByToken(token);
    if (!fieldId) return "";
    const definition = getFieldDefinition(fieldId);
    const resolution = resolveField(model, fieldId);
    return formatFieldValue(definition, resolution, model) || "";
  });
}

function insertDesignerTemplateField() {
  const fieldId = elements.designerTemplateField.value;
  const token = templateTokenForField(fieldId);
  if (!token) return;
  const textarea = elements.designerTemplateText;
  const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
  const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : textarea.value.length;
  textarea.value = textarea.value.slice(0, start) + token + textarea.value.slice(end);
  const caret = start + token.length;
  textarea.focus();
  textarea.setSelectionRange(caret, caret);
  updateDesignerTemplatePreview();
}

function updateDesignerTemplatePreview() {
  if (!elements.designerTemplatePreview) return;
  const template = elements.designerTemplateText.value;
  const preview = resolveTemplateText(template, DESIGNER_SAMPLE_MODEL);
  elements.designerTemplatePreview.textContent = preview || "Enter text or insert a field.";
}

function beginDesignerTemplatePlacement() {
  if (!state.designerPdfDocument) return setDesignerMessage("Open a layout PDF first.", true);
  const template = elements.designerTemplateText.value;
  if (!template.trim()) return setDesignerMessage("Enter composite text before placing it.", true);
  const size = Number(elements.designerTemplateFontSize.value);
  if (!Number.isFinite(size) || size < 1 || size > 144) return setDesignerMessage("Composite font size must be between 1 and 144 points.", true);
  const alignment = ["left", "center", "right"].includes(elements.designerTemplateAlignment.value) ? elements.designerTemplateAlignment.value : "left";
  setDesignerPlacement({ mode: "template", template, fontSize: size, alignment });
  setDesignerMessage(`Click the ${alignment}-alignment baseline anchor for the composite text.`);
}

async function createDesignerRepeatedBlock() {
  const layout = selectedLayout();
  if (!layout) return setDesignerMessage("Open a layout first.", true);
  const arrangement = ["vertical", "horizontal", "grid"].includes(elements.designerBlockArrangement.value)
    ? elements.designerBlockArrangement.value : "vertical";
  let rows;
  let columns;
  if (arrangement === "grid") {
    rows = Number(elements.designerGridRows.value);
    columns = Number(elements.designerGridColumns.value);
    if (!Number.isInteger(rows) || rows < 1 || rows > 30 || !Number.isInteger(columns) || columns < 1 || columns > 30) {
      return setDesignerMessage("Grid rows and columns must each be whole numbers from 1 through 30.", true);
    }
    if (rows * columns > 30) return setDesignerMessage("A repeated block may contain at most 30 slots.", true);
  } else {
    const slotCount = Number(elements.designerLineupCapacity.value);
    if (!Number.isInteger(slotCount) || slotCount < 1 || slotCount > 30) {
      return setDesignerMessage("Number of slots must be a whole number from 1 through 30.", true);
    }
    rows = arrangement === "vertical" ? slotCount : 1;
    columns = arrangement === "horizontal" ? slotCount : 1;
  }
  const capacity = rows * columns;
  const requestedCollection = String(elements.designerLineupSide.value || "away.lineup");
  const supportedCollections = new Set(["away.lineup", "home.lineup", "away.bench", "home.bench", "away.bullpen", "home.bullpen"]);
  const collection = supportedCollections.has(requestedCollection) ? requestedCollection : "away.lineup";
  const block = {
    id: makeMappingId(),
    type: "repeated",
    collection,
    capacity,
    arrangement,
    slotRows: rows,
    slotColumns: columns,
    pageIndex: null,
    geometry: null,
    columns: []
  };
  layout.repeatedBlocks = Array.isArray(layout.repeatedBlocks) ? layout.repeatedBlocks : [];
  layout.repeatedBlocks.push(block);
  layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 4);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    populateDesignerBlockSelect(block.id);
    syncDesignerBlockControls();
    renderDesignerBlockList();
    setDesignerMessage(`Created ${blockLabel(block)} with ${capacity} slots in a ${blockArrangementLabel(block)}. Place its outer slot anchors next.`);
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The repeated block could not be saved."), true);
  }
}

function beginDesignerBlockGeometryPlacement() {
  const block = selectedDesignerBlock();
  if (!block) return setDesignerMessage("Create or select a repeated block first.", true);
  if (block.capacity < 2) return setDesignerMessage("A repeated block needs at least two slots to infer spacing from its outer anchors.", true);
  const { rows, columns } = blockDimensions(block);
  setDesignerPlacement({ mode: "blockGeometryFirst", blockId: block.id });
  if (rows > 1 && columns > 1) setDesignerMessage(`Click the baseline origin for slot 1 (top-left) of the ${blockLabel(block)} grid.`);
  else setDesignerMessage(`Click the baseline origin for slot 1 of the ${blockLabel(block)}.`);
}

function beginDesignerBlockColumnPlacement() {
  const block = selectedDesignerBlock();
  if (!block) return setDesignerMessage("Create or select a repeated block first.", true);
  if (!block.geometry || !Number.isInteger(block.pageIndex)) return setDesignerMessage("Place the block geometry before adding slot fields.", true);
  if (state.designerPageNumber - 1 !== block.pageIndex) {
    state.designerPageNumber = block.pageIndex + 1;
    renderDesignerPage().catch(() => setDesignerMessage("The repeated block page could not be rendered.", true));
  }
  const size = Number(elements.designerColumnFontSize.value);
  if (!Number.isFinite(size) || size < 1 || size > 144) return setDesignerMessage("Column font size must be between 1 and 144 points.", true);
  const field = elements.designerColumnField.value;
  const definition = getFieldDefinition(field);
  if (!definition || definition.cardinality !== "repeated" || definition.collection !== block.collection) return setDesignerMessage("Choose a field that belongs to the selected block.", true);
  const alignment = ["left", "center", "right"].includes(elements.designerColumnAlignment.value) ? elements.designerColumnAlignment.value : "left";
  setDesignerPlacement({ mode: "blockColumn", blockId: block.id, field, fontSize: size, alignment });
  setDesignerMessage(`Click the ${alignment}-alignment anchor for ${designerFieldLabel(field)} in slot 1. Scorecard Studio will repeat that offset through the block.`);
}

const INDIVIDUAL_ROLE_OPTIONS = {
  "away.lineup": [["C", "Catcher"], ["1B", "First Base"], ["2B", "Second Base"], ["3B", "Third Base"], ["SS", "Shortstop"], ["LF", "Left Field"], ["CF", "Center Field"], ["RF", "Right Field"], ["DH", "Designated Hitter"], ["P", "Pitcher"]],
  "home.lineup": [["C", "Catcher"], ["1B", "First Base"], ["2B", "Second Base"], ["3B", "Third Base"], ["SS", "Shortstop"], ["LF", "Left Field"], ["CF", "Center Field"], ["RF", "Right Field"], ["DH", "Designated Hitter"], ["P", "Pitcher"]],
  "game.umpires.crew": [["HP", "Home Plate"], ["1B", "First Base"], ["2B", "Second Base"], ["3B", "Third Base"], ["LF", "Left Field"], ["RF", "Right Field"], ["REPLAY", "Replay Official"]]
};

function syncDesignerIndividualControls() {
  if (!elements.designerIndividualCollection) return;
  const collection = elements.designerIndividualCollection.value || "away.lineup";
  const supportsRole = Boolean(INDIVIDUAL_ROLE_OPTIONS[collection]);
  if (!supportsRole && elements.designerIndividualStrategy.value === "role") elements.designerIndividualStrategy.value = "slot";
  const byRole = elements.designerIndividualStrategy.value === "role" && supportsRole;
  elements.designerIndividualSlotWrap.hidden = byRole;
  elements.designerIndividualRoleWrap.hidden = !byRole;
  const roleOption = Array.from(elements.designerIndividualStrategy.options).find((option) => option.value === "role");
  if (roleOption) roleOption.disabled = !supportsRole;
  elements.designerIndividualRole.replaceChildren();
  for (const [value, label] of INDIVIDUAL_ROLE_OPTIONS[collection] || []) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    elements.designerIndividualRole.append(option);
  }
  populateDesignerIndividualFieldSelect();
}

function populateDesignerIndividualFieldSelect() {
  if (!elements.designerIndividualField) return;
  const collection = elements.designerIndividualCollection.value || "away.lineup";
  elements.designerIndividualField.replaceChildren();
  for (const definition of getSupportedFields({ cardinality: "repeated", collection })) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = definition.label.replace(/^(Away|Home) (Lineup|Bench|Bullpen) — /, "").replace(/^Umpire Crew — /, "");
    elements.designerIndividualField.append(option);
  }
}

function individualSelectorLabel(mapping) {
  if (mapping?.strategy === "role") {
    const option = (INDIVIDUAL_ROLE_OPTIONS[mapping.collection] || []).find(([value]) => value === mapping.selector?.role);
    return option?.[1] || mapping.selector?.role || "Role";
  }
  return `Slot ${mapping?.selector?.slot || 1}`;
}

function beginDesignerIndividualPlacement() {
  if (!state.designerPdfDocument) return setDesignerMessage("Open a layout PDF first.", true);
  const collection = elements.designerIndividualCollection.value || "away.lineup";
  let strategy = elements.designerIndividualStrategy.value === "role" ? "role" : "slot";
  if (strategy === "role" && !INDIVIDUAL_ROLE_OPTIONS[collection]) return setDesignerMessage("That collection does not provide stable roles. Use slot/order placement instead.", true);
  const selector = strategy === "role"
    ? { role: elements.designerIndividualRole.value }
    : { slot: Number(elements.designerIndividualSlot.value) };
  if (strategy === "slot" && (!Number.isInteger(selector.slot) || selector.slot < 1 || selector.slot > 30)) return setDesignerMessage("Individual slot must be a whole number from 1 through 30.", true);
  if (strategy === "role" && !selector.role) return setDesignerMessage("Choose a role to place.", true);
  const field = elements.designerIndividualField.value;
  const definition = getFieldDefinition(field);
  if (!definition || definition.cardinality !== "repeated" || definition.collection !== collection) return setDesignerMessage("Choose a field that belongs to the selected collection.", true);
  const fontSize = Number(elements.designerIndividualFontSize.value);
  if (!Number.isFinite(fontSize) || fontSize < 1 || fontSize > 144) return setDesignerMessage("Individual field font size must be between 1 and 144 points.", true);
  const alignment = ["left", "center", "right"].includes(elements.designerIndividualAlignment.value) ? elements.designerIndividualAlignment.value : "left";
  setDesignerPlacement({ mode: "individual", collection, strategy, selector, field, fontSize, alignment });
  setDesignerMessage(`Click the ${alignment}-alignment anchor for ${designerFieldLabel(field)} • ${individualSelectorLabel({ collection, strategy, selector })}.`);
}

async function handleDesignerStageClick(event) {
  if (!state.designerPlacing || !state.designerPdfDocument || !state.designerPlacement) return;
  const canvasRect = elements.designerPdfCanvas.getBoundingClientRect();
  if (event.clientX < canvasRect.left || event.clientX > canvasRect.right || event.clientY < canvasRect.top || event.clientY > canvasRect.bottom) return;
  const xPercent = clamp((event.clientX - canvasRect.left) / canvasRect.width, 0, 1);
  const yPercent = clamp((event.clientY - canvasRect.top) / canvasRect.height, 0, 1);
  const layout = selectedLayout();
  if (!layout) return;
  const placement = state.designerPlacement;

  if (placement.mode === "scalar") {
    const field = elements.designerFieldSelect.value;
    const mapping = {
      id: makeMappingId(),
      field,
      content: { type: "field", field },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      fontSize: Number(elements.designerFontSize.value),
      alignment: "left",
      anchor: "baseline-left"
    };
    layout.mappings = Array.isArray(layout.mappings) ? layout.mappings : [];
    layout.mappings.push(mapping);
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 3);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerMappingList();
      setDesignerMessage(`Placed ${designerFieldLabel(field)} on page ${state.designerPageNumber}.`);
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The mapping could not be saved."), true);
    }
    return;
  }

  if (placement.mode === "template") {
    const mapping = {
      id: makeMappingId(),
      field: null,
      content: { type: "template", template: placement.template },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      fontSize: placement.fontSize,
      alignment: placement.alignment,
      anchor: `baseline-${placement.alignment}`
    };
    layout.mappings = Array.isArray(layout.mappings) ? layout.mappings : [];
    layout.mappings.push(mapping);
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 5);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerMappingList();
      setDesignerMessage("Placed composite text.");
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The composite text mapping could not be saved."), true);
    }
    return;
  }

  if (placement.mode === "individual") {
    const mapping = {
      id: makeMappingId(),
      type: "individual",
      collection: placement.collection,
      strategy: placement.strategy,
      selector: { ...placement.selector },
      field: placement.field,
      content: { type: "field", field: placement.field },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      fontSize: placement.fontSize,
      alignment: placement.alignment,
      anchor: `baseline-${placement.alignment}`
    };
    layout.individualMappings = Array.isArray(layout.individualMappings) ? layout.individualMappings : [];
    layout.individualMappings.push(mapping);
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 6);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerIndividualList();
      setDesignerMessage(`Placed ${designerFieldLabel(mapping.field)} for ${individualSelectorLabel(mapping)}.`);
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The individual mapping could not be saved."), true);
    }
    return;
  }

  const block = findDesignerBlock(placement.blockId);
  if (!block) return cancelDesignerPlacement();

  if (placement.mode === "blockGeometryFirst") {
    const { rows, columns } = blockDimensions(block);
    state.designerPlacement = {
      mode: "blockGeometryLast",
      blockId: block.id,
      pageIndex: state.designerPageNumber - 1,
      firstXPercent: xPercent,
      firstYPercent: yPercent
    };
    if (rows > 1 && columns > 1) setDesignerMessage(`First slot set. Click the baseline origin for slot ${block.capacity} (bottom-right) on the same PDF page.`);
    else setDesignerMessage(`First slot set. Click the baseline origin for slot ${block.capacity} on the same PDF page.`);
    return;
  }

  if (placement.mode === "blockGeometryLast") {
    if (state.designerPageNumber - 1 !== placement.pageIndex) return setDesignerMessage("The outer slot anchors must be placed on the same PDF page.", true);
    const { rows, columns } = blockDimensions(block);
    if (rows > 1 && yPercent <= placement.firstYPercent) return setDesignerMessage("Place the final slot below the first slot.", true);
    if (columns > 1 && xPercent <= placement.firstXPercent) return setDesignerMessage("Place the final slot to the right of the first slot.", true);
    const page = await state.designerPdfDocument.getPage(state.designerPageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const lastXPercent = columns > 1 ? xPercent : placement.firstXPercent;
    const lastYPercent = rows > 1 ? yPercent : placement.firstYPercent;
    block.pageIndex = placement.pageIndex;
    const priorColumns = Array.isArray(block.columns) ? block.columns : [];
    block.geometry = {
      mode: "slot-grid-v1",
      firstXPercent: placement.firstXPercent,
      firstYPercent: placement.firstYPercent,
      lastXPercent,
      lastYPercent,
      rowSpacingPoints: rows > 1 ? ((lastYPercent - placement.firstYPercent) * viewport.height) / (rows - 1) : 0,
      columnSpacingPoints: columns > 1 ? ((lastXPercent - placement.firstXPercent) * viewport.width) / (columns - 1) : 0
    };
    // If a legacy vertical block is re-geometrized in Build 012, preserve its
    // existing absolute column anchors by converting them to slot-relative offsets.
    for (const column of priorColumns) {
      if (!Number.isFinite(Number(column.xOffsetPoints)) && Number.isFinite(Number(column.xPercent))) {
        column.xOffsetPoints = (Number(column.xPercent) - placement.firstXPercent) * viewport.width;
      }
    }
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 4);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerBlockList();
      setDesignerMessage(`Placed ${block.capacity} ${blockLabel(block)} slots as a ${blockArrangementLabel(block)}.`);
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The repeated-block geometry could not be saved."), true);
    }
    return;
  }

  if (placement.mode === "blockColumn") {
    if (state.designerPageNumber - 1 !== block.pageIndex) return setDesignerMessage("Place slot fields on the block's PDF page.", true);
    const field = placement.field;
    const alignment = placement.alignment;
    const column = {
      id: makeMappingId(),
      field,
      content: { type: "field", field },
      xPercent,
      fontSize: placement.fontSize,
      alignment,
      anchor: `baseline-${alignment}`
    };
    if (isSlotGridGeometry(block)) {
      const page = await state.designerPdfDocument.getPage(state.designerPageNumber);
      const pageWidth = page.getViewport({ scale: 1 }).width;
      column.xOffsetPoints = (xPercent - Number(block.geometry.firstXPercent || 0)) * pageWidth;
    }
    block.columns = Array.isArray(block.columns) ? block.columns : [];
    block.columns.push(column);
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, isSlotGridGeometry(block) ? 4 : 3);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerBlockList();
      setDesignerMessage(`Placed ${designerFieldLabel(field)} as a ${alignment}-aligned repeated slot field.`);
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The repeated slot field could not be saved."), true);
    }
  }
}

async function renderDesignerPage() {
  if (!state.designerPdfDocument) return;
  const token = ++state.designerRenderToken;
  const page = await state.designerPdfDocument.getPage(state.designerPageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(260, Math.min(elements.designerStageScroll.clientWidth - 8, 1100));
  const fitScale = availableWidth / baseViewport.width;
  const scale = fitScale * state.designerZoom;
  state.designerRenderScale = scale;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const canvas = elements.designerPdfCanvas;
  const context = canvas.getContext("2d");
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  elements.designerStage.style.width = `${viewport.width}px`;
  elements.designerStage.style.height = `${viewport.height}px`;
  await page.render({ canvasContext: context, viewport, transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0] }).promise;
  if (token !== state.designerRenderToken) return;
  elements.designerPageLabel.textContent = `Page ${state.designerPageNumber} of ${state.designerPdfDocument.numPages}`;
  updateDesignerNavButtons();
  renderDesignerOverlay();
}

function renderDesignerOverlay() {
  elements.designerOverlay.replaceChildren();
  const layout = selectedLayout();
  if (!layout) return;
  const mappings = (layout.mappings || []).filter((mapping) => mapping.pageIndex === state.designerPageNumber - 1);
  mappings.forEach((mapping) => {
    const marker = document.createElement("button");
    marker.type = "button";
    const isTemplate = mapping.content?.type === "template";
    const alignment = isTemplate && ["left", "center", "right"].includes(mapping.alignment) ? mapping.alignment : "left";
    marker.className = `mapping-marker${isTemplate ? ` template-marker align-${alignment}` : ""}${!isTemplate && !getFieldDefinition(mapping.field) ? " unsupported" : ""}`;
    marker.dataset.mappingId = mapping.id || "";
    marker.style.left = `${mapping.xPercent * 100}%`;
    marker.style.top = `${mapping.yPercent * 100}%`;
    const previewFontPx = Math.max(1, mapping.fontSize * state.designerRenderScale);
    marker.style.fontSize = `${previewFontPx}px`;
    marker.style.setProperty("--preview-font-px", `${previewFontPx}px`);
    marker.textContent = isTemplate ? (resolveTemplateText(mapping.content.template, DESIGNER_SAMPLE_MODEL) || "[blank composite]") : designerFieldPreview(mapping.field);
    marker.title = `${isTemplate ? "Composite text" : designerFieldLabel(mapping.field)} • click to delete`;
    marker.addEventListener("click", async (event) => {
      event.stopPropagation();
      const label = mapping.content?.type === "template" ? "Composite text" : designerFieldLabel(mapping.field);
      if (!window.confirm(`Delete mapping "${label}"?`)) return;
      await deleteDesignerMapping(mapping.id);
    });
    elements.designerOverlay.append(marker);
  });

  const canvasRect = elements.designerPdfCanvas.getBoundingClientRect();
  const pageWidthPoints = canvasRect.width / Math.max(state.designerRenderScale, .0001);
  const pageHeightPoints = canvasRect.height / Math.max(state.designerRenderScale, .0001);
  for (const block of layout.repeatedBlocks || []) {
    if (block.pageIndex !== state.designerPageNumber - 1 || !block.geometry) continue;
    if (isSlotGridGeometry(block)) {
      for (let slotIndex = 0; slotIndex < block.capacity; slotIndex += 1) {
        const slot = repeatedSlotPosition(block, slotIndex, pageWidthPoints, pageHeightPoints);
        const guide = document.createElement("div");
        guide.className = "repeated-slot-guide";
        guide.style.left = `${slot.xPercent * 100}%`;
        guide.style.top = `${slot.yPercent * 100}%`;
        guide.title = `${blockLabel(block)} slot ${slotIndex + 1}`;
        elements.designerOverlay.append(guide);
        for (const column of block.columns || []) {
          const marker = document.createElement("span");
          const alignment = ["left", "center", "right"].includes(column.alignment) ? column.alignment : "left";
          marker.className = `mapping-marker repeated-marker align-${alignment}${getFieldDefinition(column.field) ? "" : " unsupported"}`;
          const anchorXPercent = slot.xPercent + ((Number(column.xOffsetPoints) || 0) / pageWidthPoints);
          marker.style.left = `${anchorXPercent * 100}%`;
          marker.style.top = `${slot.yPercent * 100}%`;
          const previewFontPx = Math.max(1, column.fontSize * state.designerRenderScale);
          marker.style.fontSize = `${previewFontPx}px`;
          marker.style.setProperty("--preview-font-px", `${previewFontPx}px`);
          marker.textContent = designerFieldPreview(column.field, { slot: slotIndex + 1 });
          marker.title = `${designerFieldLabel(column.field)} • slot ${slotIndex + 1} • ${alignment}`;
          elements.designerOverlay.append(marker);
        }
      }
    } else {
      for (let rowIndex = 0; rowIndex < block.capacity; rowIndex += 1) {
        const yPercent = repeatedRowYPercent(block, rowIndex, pageHeightPoints);
        const guide = document.createElement("div");
        guide.className = "repeated-row-guide";
        guide.style.top = `${yPercent * 100}%`;
        elements.designerOverlay.append(guide);
        for (const column of block.columns || []) {
          const marker = document.createElement("span");
          const alignment = ["left", "center", "right"].includes(column.alignment) ? column.alignment : "left";
          marker.className = `mapping-marker repeated-marker align-${alignment}${getFieldDefinition(column.field) ? "" : " unsupported"}`;
          marker.style.left = `${column.xPercent * 100}%`;
          marker.style.top = `${yPercent * 100}%`;
          const previewFontPx = Math.max(1, column.fontSize * state.designerRenderScale);
          marker.style.fontSize = `${previewFontPx}px`;
          marker.style.setProperty("--preview-font-px", `${previewFontPx}px`);
          marker.textContent = designerFieldPreview(column.field, { slot: rowIndex + 1 });
          marker.title = `${designerFieldLabel(column.field)} • row ${rowIndex + 1} • ${alignment}`;
          elements.designerOverlay.append(marker);
        }
      }
    }
  }

  for (const mapping of layout.individualMappings || []) {
    if (mapping.pageIndex !== state.designerPageNumber - 1) continue;
    const marker = document.createElement("button");
    marker.type = "button";
    const alignment = ["left", "center", "right"].includes(mapping.alignment) ? mapping.alignment : "left";
    marker.className = `mapping-marker repeated-marker align-${alignment}${getFieldDefinition(mapping.field) ? "" : " unsupported"}`;
    marker.dataset.individualId = mapping.id || "";
    marker.style.left = `${mapping.xPercent * 100}%`;
    marker.style.top = `${mapping.yPercent * 100}%`;
    const previewFontPx = Math.max(1, mapping.fontSize * state.designerRenderScale);
    marker.style.fontSize = `${previewFontPx}px`;
    marker.style.setProperty("--preview-font-px", `${previewFontPx}px`);
    marker.textContent = designerFieldPreview(mapping.field, mapping.selector) || `[${individualSelectorLabel(mapping)}]`;
    marker.title = `${designerFieldLabel(mapping.field)} • ${individualSelectorLabel(mapping)} • ${alignment} • click to delete`;
    marker.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!window.confirm(`Delete individual mapping "${designerFieldLabel(mapping.field)} • ${individualSelectorLabel(mapping)}"?`)) return;
      await deleteDesignerIndividualMapping(mapping.id);
    });
    elements.designerOverlay.append(marker);
  }
}

function renderDesignerIndividualList() {
  const layout = selectedLayout();
  const mappings = layout?.individualMappings || [];
  if (!elements.designerIndividualList) return;
  elements.designerIndividualCount.textContent = String(mappings.length);
  elements.designerIndividualList.replaceChildren();
  if (!mappings.length) {
    const empty = document.createElement("p");
    empty.className = "subtle";
    empty.textContent = "No individual collection placements yet.";
    elements.designerIndividualList.append(empty);
    return;
  }
  for (const mapping of mappings) {
    const row = document.createElement("div");
    row.className = "designer-block-column-row";
    const text = document.createElement("span");
    text.textContent = `${individualCollectionLabel(mapping.collection)} • ${individualSelectorLabel(mapping)} • ${designerFieldLabel(mapping.field)} • ${mapping.fontSize} pt • ${mapping.alignment || "left"}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary-button compact-button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteDesignerIndividualMapping(mapping.id));
    row.append(text, remove);
    elements.designerIndividualList.append(row);
  }
}

async function deleteDesignerIndividualMapping(id) {
  const layout = selectedLayout();
  if (!layout) return;
  layout.individualMappings = (layout.individualMappings || []).filter((item) => item.id !== id);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    renderDesignerOverlay();
    renderDesignerIndividualList();
    setDesignerMessage("Individual collection mapping deleted.");
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The individual mapping could not be deleted."), true);
  }
}

function individualCollectionLabel(collection) {
  if (collection === "game.umpires.crew") return "Umpire crew";
  return blockLabel({ collection });
}

function renderDesignerMappingList() {
  const layout = selectedLayout();
  const mappings = layout?.mappings || [];
  elements.designerMappingCount.textContent = String(mappings.length);
  elements.designerMappingList.replaceChildren();
  if (!mappings.length) {
    const empty = document.createElement("p");
    empty.className = "subtle";
    empty.textContent = "No scalar or composite mappings yet.";
    elements.designerMappingList.append(empty);
    return;
  }
  mappings.forEach((mapping) => {
    const row = document.createElement("div");
    row.className = "designer-mapping-row";
    const copy = document.createElement("div");
    const strong = document.createElement("strong");
    const isTemplate = mapping.content?.type === "template";
    strong.textContent = isTemplate ? `Composite: ${mapping.content.template}` : designerFieldLabel(mapping.field);
    const meta = document.createElement("span");
    meta.textContent = `Page ${mapping.pageIndex + 1} • ${(mapping.xPercent * 100).toFixed(1)}%, ${(mapping.yPercent * 100).toFixed(1)}% • ${mapping.fontSize} pt • ${mapping.anchor || "legacy"}`;
    copy.append(strong, meta);
    const go = document.createElement("button");
    go.type = "button";
    go.className = "secondary-button compact-button";
    go.textContent = "Show";
    go.addEventListener("click", async () => { await showDesignerMapping(mapping); });
    row.append(copy, go);
    elements.designerMappingList.append(row);
  });
}

function renderDesignerBlockList() {
  const layout = selectedLayout();
  const blocks = layout?.repeatedBlocks || [];
  elements.designerBlockCount.textContent = String(blocks.length);
  elements.designerBlockList.replaceChildren();
  if (!blocks.length) {
    const empty = document.createElement("p");
    empty.className = "subtle";
    empty.textContent = "No repeated blocks yet.";
    elements.designerBlockList.append(empty);
    return;
  }
  for (const block of blocks) {
    const card = document.createElement("div");
    card.className = "designer-block-card";
    const strong = document.createElement("strong");
    strong.textContent = `${blockLabel(block)} • ${block.capacity} slots • ${blockArrangementLabel(block)}`;
    const meta = document.createElement("span");
    if (block.geometry && Number.isInteger(block.pageIndex)) {
      if (isSlotGridGeometry(block)) {
        const rowText = Number(block.geometry.rowSpacingPoints || 0).toFixed(2);
        const columnText = Number(block.geometry.columnSpacingPoints || 0).toFixed(2);
        meta.textContent = `Page ${block.pageIndex + 1} • row ${rowText} pt • column ${columnText} pt spacing • ${(block.columns || []).length} field(s)`;
      } else {
        meta.textContent = `Page ${block.pageIndex + 1} • ${Number(block.geometry.rowSpacingPoints || 0).toFixed(2)} pt row spacing • ${(block.columns || []).length} field(s) • legacy vertical`;
      }
    } else meta.textContent = `Geometry not placed • ${(block.columns || []).length} field(s)`;
    card.append(strong, meta);
    for (const column of block.columns || []) {
      const row = document.createElement("div");
      row.className = "designer-block-column-row";
      const text = document.createElement("span");
      text.textContent = `${designerFieldLabel(column.field)} • ${column.fontSize} pt • ${column.alignment || "left"}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary-button compact-button";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => deleteDesignerBlockColumn(block.id, column.id));
      row.append(text, remove);
      card.append(row);
    }
    elements.designerBlockList.append(card);
  }
}

async function showDesignerMapping(mapping) {
  state.designerPageNumber = mapping.pageIndex + 1;
  cancelDesignerPlacement();
  try {
    await renderDesignerPage();
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    const marker = Array.from(elements.designerOverlay.querySelectorAll(".mapping-marker"))
      .find((candidate) => candidate.dataset.mappingId === String(mapping.id || ""));
    if (!marker) {
      setDesignerMessage(`${mapping.content?.type === "template" ? "Composite text" : `Mapped field “${designerFieldLabel(mapping.field)}”`} could not be located on the rendered page.`, true);
      return;
    }
    marker.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    marker.classList.remove("show-target");
    void marker.offsetWidth;
    marker.classList.add("show-target");
    marker.focus({ preventScroll: true });
    window.setTimeout(() => marker.classList.remove("show-target"), 1800);
    setDesignerMessage(`Showing ${mapping.content?.type === "template" ? "composite text" : designerFieldLabel(mapping.field)} on page ${mapping.pageIndex + 1}.`);
  } catch (error) {
    setDesignerMessage(errorMessage(error, "That mapped field could not be shown."), true);
  }
}

async function deleteDesignerMapping(id) {
  const layout = selectedLayout();
  if (!layout) return;
  layout.mappings = (layout.mappings || []).filter((mapping) => mapping.id !== id);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    renderDesignerOverlay();
    renderDesignerMappingList();
    setDesignerMessage("Mapping deleted.");
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The mapping could not be deleted."), true);
  }
}

async function deleteDesignerBlockColumn(blockId, columnId) {
  const layout = selectedLayout();
  const block = findDesignerBlock(blockId);
  if (!layout || !block) return;
  block.columns = (block.columns || []).filter((column) => column.id !== columnId);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    renderDesignerOverlay();
    renderDesignerBlockList();
    setDesignerMessage("Collection column deleted.");
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The collection column could not be deleted."), true);
  }
}

async function deleteSelectedDesignerBlock() {
  const layout = selectedLayout();
  const block = selectedDesignerBlock();
  if (!layout || !block) return setDesignerMessage("Select a repeated block first.", true);
  if (!window.confirm(`Delete the ${blockLabel(block)} and all of its columns?`)) return;
  layout.repeatedBlocks = (layout.repeatedBlocks || []).filter((item) => item.id !== block.id);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    cancelDesignerPlacement();
    populateDesignerBlockSelect();
    syncDesignerBlockControls();
    renderDesignerOverlay();
    renderDesignerBlockList();
    setDesignerMessage("Repeated block deleted.");
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The repeated block could not be deleted."), true);
  }
}

function populateDesignerBlockSelect(preferredId = null) {
  const layout = selectedLayout();
  const blocks = layout?.repeatedBlocks || [];
  const prior = preferredId || elements.designerBlockSelect.value;
  elements.designerBlockSelect.replaceChildren();
  if (!blocks.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No repeated blocks";
    elements.designerBlockSelect.append(option);
    elements.designerBlockSelect.disabled = true;
    return;
  }
  elements.designerBlockSelect.disabled = false;
  blocks.forEach((block, index) => {
    const option = document.createElement("option");
    option.value = block.id;
    option.textContent = `${blockLabel(block)} ${index + 1} • ${block.capacity} slots • ${blockArrangementLabel(block)}`;
    elements.designerBlockSelect.append(option);
  });
  if (blocks.some((block) => block.id === prior)) elements.designerBlockSelect.value = prior;
}

function populateDesignerColumnFieldSelect() {
  const block = selectedDesignerBlock();
  const collection = block?.collection || String(elements.designerLineupSide.value || "away.lineup");
  elements.designerColumnField.replaceChildren();
  for (const definition of getSupportedFields({ cardinality: "repeated", collection })) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = definition.label.replace(/^(Away|Home) (Lineup|Bench|Bullpen) — /, "");
    elements.designerColumnField.append(option);
  }
}

function syncDesignerBlockControls() {
  const block = selectedDesignerBlock();
  const disabled = !block;
  elements.designerPlaceRowsButton.disabled = disabled;
  elements.designerPlaceColumnButton.disabled = disabled;
  elements.designerDeleteBlockButton.disabled = disabled;
  if (block) {
    const { rows, columns } = blockDimensions(block);
    elements.designerLineupSide.value = block.collection;
    elements.designerBlockArrangement.value = blockArrangement(block);
    elements.designerLineupCapacity.value = block.capacity;
    elements.designerGridRows.value = rows;
    elements.designerGridColumns.value = columns;
    elements.designerPlaceRowsButton.textContent = rows > 1 && columns > 1 ? "Place Top-Left & Bottom-Right Slots" : "Place First & Last Slots";
  } else elements.designerPlaceRowsButton.textContent = "Place First & Last Slots";
  syncDesignerArrangementInputs();
  populateDesignerColumnFieldSelect();
}

function syncDesignerArrangementInputs() {
  const arrangement = elements.designerBlockArrangement.value || "vertical";
  const isGrid = arrangement === "grid";
  elements.designerCapacityWrap.hidden = isGrid;
  elements.designerGridDimensions.hidden = !isGrid;
}

function selectedDesignerBlock() {
  return findDesignerBlock(elements.designerBlockSelect.value);
}

function findDesignerBlock(id) {
  const layout = selectedLayout();
  return (layout?.repeatedBlocks || []).find((block) => String(block.id) === String(id)) || null;
}

function blockLabel(block) {
  const labels = {
    "away.lineup": "Away starting lineup",
    "home.lineup": "Home starting lineup",
    "away.bench": "Away bench",
    "home.bench": "Home bench",
    "away.bullpen": "Away bullpen",
    "home.bullpen": "Home bullpen"
  };
  return labels[block?.collection] || String(block?.collection || "Repeated block");
}

function blockArrangement(block) {
  if (["vertical", "horizontal", "grid"].includes(block?.arrangement)) return block.arrangement;
  return "vertical";
}

function blockDimensions(block) {
  const arrangement = blockArrangement(block);
  const capacity = Math.max(1, Number(block?.capacity) || 1);
  if (arrangement === "grid") {
    const rows = Math.max(1, Number(block?.slotRows) || 1);
    const columns = Math.max(1, Number(block?.slotColumns) || 1);
    return { rows, columns };
  }
  if (arrangement === "horizontal") return { rows: 1, columns: capacity };
  return { rows: capacity, columns: 1 };
}

function blockArrangementLabel(block) {
  const { rows, columns } = blockDimensions(block);
  if (rows === 1 && columns > 1) return `horizontal ${columns}-slot list`;
  if (columns === 1 && rows > 1) return `vertical ${rows}-slot list`;
  if (rows === 1 && columns === 1) return "single slot";
  return `${rows} × ${columns} grid`;
}

function isSlotGridGeometry(block) {
  return block?.geometry?.mode === "slot-grid-v1";
}

function repeatedSlotPosition(block, slotIndex, pageWidthPoints, pageHeightPoints) {
  const { columns } = blockDimensions(block);
  const rowIndex = Math.floor(slotIndex / columns);
  const columnIndex = slotIndex % columns;
  return {
    xPercent: clamp(Number(block.geometry.firstXPercent || 0) + ((Number(block.geometry.columnSpacingPoints) || 0) * columnIndex / pageWidthPoints), 0, 1),
    yPercent: clamp(Number(block.geometry.firstYPercent || 0) + ((Number(block.geometry.rowSpacingPoints) || 0) * rowIndex / pageHeightPoints), 0, 1)
  };
}

function ensureRepeatedBlockIds(layout) {
  let changed = false;
  layout.repeatedBlocks = Array.isArray(layout.repeatedBlocks) ? layout.repeatedBlocks : [];
  for (const block of layout.repeatedBlocks) {
    if (!block.id) { block.id = makeMappingId(); changed = true; }
    block.columns = Array.isArray(block.columns) ? block.columns : [];
    for (const column of block.columns) {
      if (!column.id) { column.id = makeMappingId(); changed = true; }
      if (!column.content && column.field) { column.content = { type: "field", field: column.field }; changed = true; }
    }
  }
  return changed;
}

function repeatedRowYPercent(block, rowIndex, pageHeightPoints) {
  if (!block?.geometry) return 0;
  return clamp(Number(block.geometry.firstYPercent) + ((Number(block.geometry.rowSpacingPoints) || 0) * rowIndex / pageHeightPoints), 0, 1);
}

function setDesignerPlacement(placement) {
  state.designerPlacement = placement;
  state.designerPlacing = Boolean(placement);
  elements.designerStage.classList.toggle("placing", Boolean(placement));
}

function cancelDesignerPlacement() {
  setDesignerPlacement(null);
}

const DESIGNER_ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function setDesignerZoom(zoom) {
  const next = DESIGNER_ZOOM_LEVELS.includes(zoom) ? zoom : 1;
  state.designerZoom = next;
  elements.designerZoomSelect.value = String(next);
  elements.designerZoomOutButton.disabled = next <= DESIGNER_ZOOM_LEVELS[0];
  elements.designerZoomInButton.disabled = next >= DESIGNER_ZOOM_LEVELS[DESIGNER_ZOOM_LEVELS.length - 1];
  renderDesignerPage().catch(() => setDesignerMessage("The PDF could not be rendered at that zoom level.", true));
}

function changeDesignerZoom(direction) {
  const currentIndex = Math.max(0, DESIGNER_ZOOM_LEVELS.indexOf(state.designerZoom));
  const nextIndex = clamp(currentIndex + direction, 0, DESIGNER_ZOOM_LEVELS.length - 1);
  if (nextIndex === currentIndex) return;
  setDesignerZoom(DESIGNER_ZOOM_LEVELS[nextIndex]);
}

async function changeDesignerPage(delta) {
  if (!state.designerPdfDocument) return;
  const next = state.designerPageNumber + delta;
  if (next < 1 || next > state.designerPdfDocument.numPages) return;
  state.designerPageNumber = next;
  cancelDesignerPlacement();
  try { await renderDesignerPage(); }
  catch (error) { setDesignerMessage("That PDF page could not be rendered.", true); }
}

function updateDesignerNavButtons() {
  elements.designerPrevButton.disabled = !state.designerPdfDocument || state.designerPageNumber <= 1;
  elements.designerNextButton.disabled = !state.designerPdfDocument || state.designerPageNumber >= state.designerPdfDocument.numPages;
}

function setDesignerMessage(message, isError = false) {
  elements.designerMessage.textContent = message;
  elements.designerMessage.classList.toggle("error", isError);
}

function designerFieldLabel(field) {
  const definition = getFieldDefinition(field);
  return definition?.label || `Unsupported: ${field}`;
}

function designerFieldPreview(field, selector = null) {
  const definition = getFieldDefinition(field);
  if (!definition) return `[Unsupported: ${field}]`;
  const resolution = resolveField(DESIGNER_SAMPLE_MODEL, field, selector);
  return formatFieldValue(definition, resolution, DESIGNER_SAMPLE_MODEL) || (definition.cardinality === "repeated" ? "" : definition.label);
}

function populateDesignerFieldSelect() {
  elements.designerFieldSelect.replaceChildren();
  const groups = new Map();
  for (const definition of getSupportedFields({ cardinality: "single" })) {
    if (!groups.has(definition.category)) groups.set(definition.category, []);
    groups.get(definition.category).push(definition);
  }
  for (const [category, definitions] of groups) {
    const group = document.createElement("optgroup");
    group.label = category;
    for (const definition of definitions) {
      const option = document.createElement("option");
      option.value = definition.id;
      option.textContent = definition.label.replace(/^(Away|Home)\s+/, "");
      group.append(option);
    }
    elements.designerFieldSelect.append(group);
  }
}

function ensureMappingIds(layout) {
  let changed = false;
  for (const mapping of layout?.mappings || []) {
    if (!mapping.id) { mapping.id = makeMappingId(); changed = true; }
    if (!mapping.content && mapping.field) { mapping.content = { type: "field", field: mapping.field }; changed = true; }
  }
  if (ensureRepeatedBlockIds(layout)) changed = true;
  layout.individualMappings = Array.isArray(layout.individualMappings) ? layout.individualMappings : [];
  for (const mapping of layout.individualMappings) {
    if (!mapping.id) { mapping.id = makeMappingId(); changed = true; }
    if (!mapping.content && mapping.field) { mapping.content = { type: "field", field: mapping.field }; changed = true; }
  }
  return changed;
}

const DESIGNER_SAMPLE_MODEL = {
  schemaVersion: 1,
  game: {
    date: "2026-09-08", startTime: "2026-09-08T23:10:00Z",
    venue: { name: "T-Mobile Park", timeZone: "America/Los_Angeles" },
    weather: { temperature: 72, condition: "Partly Cloudy", wind: "7 mph, Out To RF" },
    umpires: {
      home: { id: 4001, name: "Sample Umpire", role: "Home Plate" },
      first: { id: 4002, name: "Sample Umpire", role: "First Base" },
      second: { id: 4003, name: "Sample Umpire", role: "Second Base" },
      third: { id: 4004, name: "Sample Umpire", role: "Third Base" },
      additional: [],
      crew: [
        { id: 4001, name: "Sample Umpire", role: "Home Plate" },
        { id: 4002, name: "Sample Umpire", role: "First Base" },
        { id: 4003, name: "Sample Umpire", role: "Second Base" },
        { id: 4004, name: "Sample Umpire", role: "Third Base" }
      ]
    }
  },
  away: {
    team: { name: "Tampa Bay Devil Rays", locationName: "St. Petersburg", shortName: "Tampa Bay", clubName: "Rays", abbreviation: "TB", record: { wins: 78, losses: 64, pct: 0.549 } },
    manager: { name: "Kevin Cash" }, startingPitcher: { player: { name: "Shane Baz" } },
    lineup: sampleLineup(["Yandy Díaz", "Brandon Lowe", "Junior Caminero", "Jonathan Aranda", "Josh Lowe", "Christopher Morel", "Jake Mangum", "Nick Fortes", "Taylor Walls"], ["1B", "2B", "3B", "DH", "RF", "LF", "CF", "C", "SS"], ["R", "L", "R", "L", "L", "R", "S", "R", "S"]),
    bench: sampleBench(["Kameron Misner", "José Caballero", "Ben Rortvedt", "Curtis Mead"], ["OF", "IF", "C", "IF"], ["L", "R", "L", "R"]),
    bullpen: sampleBullpen(["Pete Fairbanks", "Garrett Cleavinger", "Mason Montgomery", "Edwin Uceta", "Kevin Kelly", "Manuel Rodríguez"], ["R", "L", "L", "R", "R", "R"])
  },
  home: {
    team: { name: "Seattle Mariners", locationName: "Seattle", shortName: "Seattle", clubName: "Mariners", abbreviation: "SEA", record: { wins: 81, losses: 61, pct: 0.570 } },
    manager: { name: "Dan Wilson" }, startingPitcher: { player: { name: "Logan Gilbert" } },
    lineup: sampleLineup(["J.P. Crawford", "Julio Rodríguez", "Cal Raleigh", "Josh Naylor", "Randy Arozarena", "Jorge Polanco", "Dominic Canzone", "Cole Young", "Victor Robles"], ["SS", "CF", "C", "1B", "LF", "DH", "RF", "2B", "3B"], ["L", "R", "S", "L", "R", "S", "L", "L", "R"]),
    bench: sampleBench(["Mitch Garver", "Leo Rivas", "Luke Raley", "Austin Shenton"], ["C", "IF", "OF", "IF"], ["R", "S", "L", "L"]),
    bullpen: sampleBullpen(["Andrés Muñoz", "Matt Brash", "Gabe Speier", "Eduard Bazardo", "Carlos Vargas", "Casey Legumina"], ["R", "R", "L", "R", "R", "R"])
  }
};

function sampleLineup(names, positions, bats) {
  return names.map((name, index) => ({
    battingOrder: index + 1,
    player: { id: 1000 + index, name, number: String(index + 1), bats: bats[index] },
    position: { abbreviation: positions[index] },
    stats: { avg: .250 + index / 1000, obp: .325 + index / 1000, slg: .410 + index / 1000, ops: .735 + index / 1000, homeRuns: 8 + index, rbi: 40 + index * 3 }
  }));
}

function sampleBench(names, positions, bats) {
  return names.map((name, index) => ({
    player: { id: 2000 + index, name, number: String(20 + index), bats: bats[index] },
    position: { abbreviation: positions[index] },
    stats: { avg: .238 + index / 1000, obp: .310 + index / 1000, slg: .390 + index / 1000, ops: .700 + index / 1000, homeRuns: 4 + index, rbi: 18 + index * 4 }
  }));
}

function sampleBullpen(names, throws) {
  return names.map((name, index) => ({
    player: { id: 3000 + index, name, number: String(30 + index), throws: throws[index] },
    position: { abbreviation: "P" },
    stats: { wins: 2 + index, losses: 1 + (index % 3), era: 2.35 + index / 10, whip: 1.02 + index / 100, inningsPitched: `${42 + index}.1`, strikeouts: 48 + index * 5, saves: index === 0 ? 31 : 0, holds: index === 0 ? 0 : 6 + index }
  }));
}

function makeMappingId() {
  return globalThis.crypto?.randomUUID?.() || `mapping-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}


async function generateTestPdf() {
  const layout = selectedLayout();
  if (!layout) return setGenerateMessage("Open a layout before generating a PDF.", true);
  const mappings = Array.isArray(layout.mappings) ? layout.mappings : [];
  const repeatedBlocks = Array.isArray(layout.repeatedBlocks) ? layout.repeatedBlocks : [];
  const individualMappings = Array.isArray(layout.individualMappings) ? layout.individualMappings : [];
  if (!mappings.length && !individualMappings.length && !repeatedBlocks.some((block) => (block.columns || []).length)) return setGenerateMessage("Map at least one scalar, composite, repeated-block, or individual collection field before generating a PDF.", true);
  if (!state.selectedFeed) return setGenerateMessage("No game is loaded. Return Home and load a game first.", true);
  if (!globalThis.PDFLib) return setGenerateMessage("pdf-lib did not load. Check the browser network connection.", true);

  elements.designerGenerateButton.disabled = true;
  setGenerateMessage("Loading required pregame data…");
  const gameKey = String(state.selectedGamePk || "");

  try {
    const fieldIds = collectLayoutFieldIds(layout);
    const model = await buildModelForMappings(fieldIds, gameKey);
    if (String(state.selectedGamePk || "") !== gameKey) throw new Error("Game selection changed while pregame data was loading. Generate again for the selected game.");

    const record = await getPdfTemplate(layout.pdfTemplateId);
    if (!record?.blob) throw new Error("The layout's source PDF is missing.");
    setGenerateMessage("Generating PDF…");

    const sourceBytes = await record.blob.arrayBuffer();
    const pdfDoc = await globalThis.PDFLib.PDFDocument.load(sourceBytes);
    const font = await pdfDoc.embedFont(globalThis.PDFLib.StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const skipped = [];
    const overflowBlocks = [];
    let missingCount = 0;

    for (const mapping of mappings) {
      const page = pages[mapping.pageIndex];
      if (!page) { skipped.push(mapping.content?.type === "template" ? "composite text" : mapping.field); continue; }
      if (mapping.content?.type === "template") {
        const text = resolveTemplateText(mapping.content.template, model);
        if (!text) continue;
        drawAlignedPdfText(page, font, text, mapping.fontSize, mapping.xPercent, mapping.yPercent, mapping.alignment || "left");
        continue;
      }
      const definition = getFieldDefinition(mapping.field);
      if (!definition) { skipped.push(mapping.field); continue; }
      const resolution = resolveField(model, mapping.field);
      const text = formatFieldValue(definition, resolution, model);
      if (!text) {
        if (["unsupported", "error"].includes(resolution.state)) skipped.push(mapping.field);
        else if (["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
        continue;
      }
      drawAlignedPdfText(page, font, text, mapping.fontSize, mapping.xPercent, mapping.yPercent, "left");
    }

    for (const block of repeatedBlocks) {
      if (!block.geometry || !Number.isInteger(block.pageIndex)) { skipped.push(`${block.collection} block geometry`); continue; }
      const page = pages[block.pageIndex];
      if (!page) { skipped.push(`${block.collection} block page`); continue; }
      if (collectionHasOverflow(model, block.collection, block.capacity)) overflowBlocks.push(blockLabel(block));
      const { width, height } = page.getSize();
      for (let slotIndex = 0; slotIndex < block.capacity; slotIndex += 1) {
        const slot = isSlotGridGeometry(block)
          ? repeatedSlotPosition(block, slotIndex, width, height)
          : { xPercent: null, yPercent: repeatedRowYPercent(block, slotIndex, height) };
        for (const column of block.columns || []) {
          const definition = getFieldDefinition(column.field);
          if (!definition || definition.collection !== block.collection) { skipped.push(column.field || "repeated field"); continue; }
          const resolution = resolveField(model, column.field, { slot: slotIndex + 1 });
          const text = formatFieldValue(definition, resolution, model);
          if (!text) {
            if (["unsupported", "error"].includes(resolution.state)) skipped.push(column.field);
            else if (["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
            continue;
          }
          const xPercent = isSlotGridGeometry(block)
            ? slot.xPercent + ((Number(column.xOffsetPoints) || 0) / width)
            : column.xPercent;
          drawAlignedPdfText(page, font, text, column.fontSize, xPercent, slot.yPercent, column.alignment || "left");
        }
      }
    }

    for (const mapping of individualMappings) {
      const page = pages[mapping.pageIndex];
      if (!page) { skipped.push(`${mapping.collection} individual mapping page`); continue; }
      const definition = getFieldDefinition(mapping.field);
      if (!definition || definition.cardinality !== "repeated" || definition.collection !== mapping.collection) { skipped.push(mapping.field || "individual field"); continue; }
      const resolution = resolveField(model, mapping.field, mapping.selector);
      const text = formatFieldValue(definition, resolution, model);
      if (!text) {
        if (["unsupported", "error"].includes(resolution.state)) skipped.push(mapping.field);
        else if (["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
        continue;
      }
      drawAlignedPdfText(page, font, text, mapping.fontSize, mapping.xPercent, mapping.yPercent, mapping.alignment || "left");
    }

    const outputBytes = await pdfDoc.save();
    const blob = new Blob([outputBytes], { type: "application/pdf" });
    const selected = state.schedule.find((game) => game.gamePk === state.selectedGamePk);
    const filename = buildGeneratedFilename(layout, selected);
    downloadBlob(blob, filename);
    const notices = [];
    if (missingCount) notices.push(`${missingCount} mapped value(s) were unavailable and left blank.`);
    if (overflowBlocks.length) notices.push(`Overflow: ${[...new Set(overflowBlocks)].join(", ")} contains player(s) beyond the layout capacity.`);
    if (skipped.length) notices.push(`${skipped.length} unsupported/error mapping(s) were skipped.`);
    setGenerateMessage(`Generated ${filename}.${notices.length ? ` ${notices.join(" ")}` : ""}`, skipped.length > 0 || overflowBlocks.length > 0);
  } catch (error) {
    console.error("Unable to generate PDF:", error);
    setGenerateMessage(errorMessage(error, "The PDF could not be generated."), true);
  } finally {
    elements.designerGenerateButton.disabled = false;
  }
}

function drawAlignedPdfText(page, font, text, fontSize, xPercent, yPercent, alignment = "left") {
  const size = Number(fontSize) || 10;
  const { width, height } = page.getSize();
  const anchorX = width * clamp(Number(xPercent) || 0, 0, 1);
  const anchorY = height * (1 - clamp(Number(yPercent) || 0, 0, 1));
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  const lineHeight = size * 1.2;

  lines.forEach((line, lineIndex) => {
    // pdf-lib StandardFonts use WinAnsi encoding and cannot encode newline
    // characters directly. Draw each template line independently instead.
    if (!line) return;
    const textWidth = font.widthOfTextAtSize(line, size);
    const x = alignment === "right" ? anchorX - textWidth : alignment === "center" ? anchorX - textWidth / 2 : anchorX;
    const y = anchorY - lineIndex * lineHeight;
    page.drawText(line, { x, y, size, font, color: globalThis.PDFLib.rgb(0, 0, 0) });
  });
}

function collectLayoutFieldIds(layout) {
  const ids = [];
  for (const mapping of layout?.mappings || []) {
    if (mapping.content?.type === "template") ids.push(...templateFieldIds(mapping.content.template));
    else if (mapping.field) ids.push(canonicalFieldId(mapping.field));
  }
  for (const block of layout?.repeatedBlocks || []) for (const column of block.columns || []) if (column.field) ids.push(canonicalFieldId(column.field));
  for (const mapping of layout?.individualMappings || []) if (mapping.field) ids.push(canonicalFieldId(mapping.field));
  return ids;
}

async function buildModelForMappings(fieldIds, expectedGameKey) {
  const requirements = sourceRequirementsForFields(fieldIds);
  const game = currentScheduleGame();
  const feed = state.selectedFeed;
  if (!feed || !game) throw new Error("No selected game data is available.");
  if (!requirements.has("coaches")) {
    const model = normalizePregameData(feed, {}, game);
    state.normalizedPregame = model;
    return model;
  }

  const gd = feed.gameData || {};
  const officialDate = gd.datetime?.officialDate || game.officialDate || state.selectedDate || getLocalDateString();
  const season = Number(gd.game?.season || officialDate.slice(0, 4));
  const neededSides = new Set(fieldIds.filter((id) => id.endsWith(".manager.name")).map((id) => id.split(".")[0]));
  const coaches = {};
  await Promise.all([...neededSides].map(async (side) => {
    const teamId = gd.teams?.[side]?.id || game?.[`${side}TeamId`];
    if (!teamId) return;
    try { coaches[side] = await fetchTeamCoaches(teamId, officialDate, season); }
    catch (error) { console.warn(`Manager hydration failed for ${side}:`, error); coaches[side] = null; }
  }));
  if (String(state.selectedGamePk || "") !== expectedGameKey) throw new Error("Game selection changed during supplemental hydration.");
  const model = normalizePregameData(feed, { coaches }, game);
  state.normalizedPregame = model;
  return model;
}

function currentScheduleGame() {
  return state.schedule.find((game) => game.gamePk === state.selectedGamePk) ?? null;
}

function buildGeneratedFilename(layout, game) {
  const date = game?.officialDate || state.selectedFeed?.gameData?.datetime?.officialDate || state.selectedDate || getLocalDateString();
  const away = safeFilenamePart(game?.awayTeam || "Away");
  const home = safeFilenamePart(game?.homeTeam || "Home");
  const layoutName = safeFilenamePart(layout.name || "Scorecard");
  return `${date}_${away}_at_${home}_${layoutName}.pdf`;
}

function safeFilenamePart(value) {
  return String(value)
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_") || "Scorecard";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setGenerateMessage(message, isError = false) {
  elements.generateMessage.textContent = message;
  elements.generateMessage.classList.toggle("error", isError);
}

function selectedLayout() {
  return state.layouts.find((item) => item.id === state.selectedLayoutId) ?? null;
}

async function loadPdfDocument(blob) {
  if (!globalThis.pdfjsLib) throw new Error("PDF.js did not load. Check the browser network connection.");
  globalThis.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return globalThis.pdfjsLib.getDocument({ data: bytes }).promise;
}

async function showPdfDocument(document, record, pageNumber) {
  state.pdfDocument = document;
  state.pdfRecord = record;
  state.pdfPageNumber = Math.min(Math.max(pageNumber, 1), document.numPages);
  elements.pdfViewer.hidden = false;
  await renderPdfPage();
}

async function renderPdfPage() {
  if (!state.pdfDocument) return;
  const page = await state.pdfDocument.getPage(state.pdfPageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.min(elements.pdfCanvas.parentElement.clientWidth - 32, 1100);
  const scale = Math.max(0.25, availableWidth / baseViewport.width);
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const canvas = elements.pdfCanvas;
  const context = canvas.getContext("2d");
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;
  await page.render({ canvasContext: context, viewport, transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0] }).promise;
  elements.pdfPageLabel.textContent = `Page ${state.pdfPageNumber} of ${state.pdfDocument.numPages}`;
  updatePdfNavButtons();
}

async function changePdfPage(delta) {
  if (!state.pdfDocument) return;
  const next = state.pdfPageNumber + delta;
  if (next < 1 || next > state.pdfDocument.numPages) return;
  state.pdfPageNumber = next;
  try { setLayoutBusy(true, `Rendering page ${next}…`); await renderPdfPage(); }
  catch (error) { setLayoutMessage("That PDF page could not be rendered.", true); }
  finally { setLayoutBusy(false); }
}

function updatePdfNavButtons() {
  elements.pdfPrevButton.disabled = !state.pdfDocument || state.pdfPageNumber <= 1;
  elements.pdfNextButton.disabled = !state.pdfDocument || state.pdfPageNumber >= state.pdfDocument.numPages;
}

function setLayoutBusy(isBusy, message = "") {
  elements.createLayoutButton.disabled = isBusy;
  elements.layoutPdfInput.disabled = isBusy;
  elements.saveLayoutMetadataButton.disabled = isBusy;
  elements.duplicateLayoutButton.disabled = isBusy;
  elements.deleteLayoutButton.disabled = isBusy;
  if (isBusy && message) setLayoutMessage(message);
  updatePdfNavButtons();
}

function setLayoutMessage(message, isError = false) {
  elements.layoutMessage.textContent = message;
  elements.layoutMessage.classList.toggle("error", isError);
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `layout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

// Start only after module-level constants (including Designer sample data) are initialized.
initialize();
