/**
 * Scorecard Studio
 * Application coordinator
 * Version: 0.2.0-dev
 * Build: 019.2
 */

import { fetchFavoriteTeamSchedule, fetchGameFeed, fetchTeamCoaches, fetchLeagueStandings } from "./api.js?v=018";
import { normalizePregameData } from "./normalize.js?v=0183";
import { canonicalFieldId, collectionHasOverflow, getFieldDefinition, getFieldLabel, getCatalogFields, getSupportedFields, resolveField, sourceRequirementsForFields } from "./field-registry.js?v=0183";
import { formatFieldValue, PLAYER_NAME_FORMATS } from "./formatter.js?v=018";
import { DESIGNER_SAMPLE_MODEL } from "./sample-data.js?v=018305";
import { buildFieldDiagnosticRows, summarizeDiagnosticRows } from "./field-diagnostic.js?v=0183";
import { fieldsForRecordContext, resolveSlotContent, slotContentFieldIds, templateTokenForContextField } from "./slot-content.js?v=018";
import { FORMAT_GROUPS, FONT_FACES, COLOR_SWATCHES, appFormattingDefaults, appConditionalFormattingDefaults, ensureLayoutFormattingDefaults, ensureLayoutConditionalFormatting, conditionalFormattingEnabled, mergeFormat, normalizeColor, colorDisplayName, hexToRgb01, formattingGroupForFieldId, formattingGroupForContext, handednessGroup } from "./formatting.js?v=0192";
import {
  deleteLayout, deletePdfTemplate, getPdfTemplate, getSetting, initializeStorage,
  listLayouts, saveLayout, savePdfTemplate, setSetting
} from "./storage.js?v=018";

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
  designerHistory: [],
  designerFuture: [],
  designerHistoryApplying: false,
  designerSelection: null,
  designerPaletteSelection: null,
  designerPendingMode: null,
  designerCollectionInspectorMode: null,
  designerPaletteExpanded: new Set(),
  designerDrag: null,
  designerSaveTimer: null,
  designerPageWidthPoints: 0,
  designerPageHeightPoints: 0,
  normalizedPregame: null,
  fieldDiagnosticRows: [],
  fieldDiagnosticLoadToken: 0,
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
  navFieldDiagnostic: document.querySelector("#nav-field-diagnostic"),
  refreshFieldDiagnosticButton: document.querySelector("#refresh-field-diagnostic-btn"),
  fieldDiagnosticSubtitle: document.querySelector("#field-diagnostic-subtitle"),
  fieldDiagnosticMessage: document.querySelector("#field-diagnostic-message"),
  fieldDiagnosticSources: document.querySelector("#field-diagnostic-sources"),
  diagnosticGamePackSourcePill: document.querySelector("#diagnostic-gamepack-source-pill"),
  diagnosticCoachesSourcePill: document.querySelector("#diagnostic-coaches-source-pill"),
  diagnosticStandingsSourcePill: document.querySelector("#diagnostic-standings-source-pill"),
  fieldDiagnosticContent: document.querySelector("#field-diagnostic-content"),
  fieldDiagnosticSummary: document.querySelector("#field-diagnostic-summary"),
  fieldDiagnosticSearch: document.querySelector("#field-diagnostic-search"),
  fieldDiagnosticTierFilter: document.querySelector("#field-diagnostic-tier-filter"),
  fieldDiagnosticStatusFilter: document.querySelector("#field-diagnostic-status-filter"),
  fieldDiagnosticTableBody: document.querySelector("#field-diagnostic-table-body"),
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
  layoutFormattingButton: document.querySelector("#layout-formatting-btn"),
  designerLayoutSettingsButton: document.querySelector("#designer-layout-settings-btn"),
  designerBackButton: document.querySelector("#designer-back-btn"),
  designerLayoutMeta: document.querySelector("#designer-layout-meta"),
  designerFieldSelect: document.querySelector("#designer-field-select"),
  designerFontSize: document.querySelector("#designer-font-size"),
  designerFieldAlignment: document.querySelector("#designer-field-alignment"),
  designerFieldNameFormatWrap: document.querySelector("#designer-field-name-format-wrap"),
  designerFieldNameFormat: document.querySelector("#designer-field-name-format"),
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
  designerColumnContentType: document.querySelector("#designer-column-content-type"),
  designerColumnFieldWrap: document.querySelector("#designer-column-field-wrap"),
  designerColumnAlignment: document.querySelector("#designer-column-alignment"),
  designerColumnFontSize: document.querySelector("#designer-column-font-size"),
  designerColumnNameFormatWrap: document.querySelector("#designer-column-name-format-wrap"),
  designerColumnNameFormat: document.querySelector("#designer-column-name-format"),
  designerColumnTemplateWrap: document.querySelector("#designer-column-template-wrap"),
  designerColumnTemplate: document.querySelector("#designer-column-template"),
  designerColumnTemplatePreview: document.querySelector("#designer-column-template-preview"),
  designerColumnTemplateField: document.querySelector("#designer-column-template-field"),
  designerColumnTemplateInsertButton: document.querySelector("#designer-column-template-insert-btn"),
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
  designerIndividualNameFormatWrap: document.querySelector("#designer-individual-name-format-wrap"),
  designerIndividualNameFormat: document.querySelector("#designer-individual-name-format"),
  designerIndividualPlaceButton: document.querySelector("#designer-individual-place-btn"),
  designerIndividualList: document.querySelector("#designer-individual-list"),
  designerGenerateButton: document.querySelector("#designer-generate-btn"),
  generateMessage: document.querySelector("#generate-message"),
  designerMessage: document.querySelector("#designer-message"),
  designerMappingCount: null,
  designerMappingList: null,
  designerPrevButton: document.querySelector("#designer-prev-btn"),
  designerNextButton: document.querySelector("#designer-next-btn"),
  designerPageLabel: document.querySelector("#designer-page-label"),
  designerZoomStatus: document.querySelector("#designer-zoom-status"),
  designerZoomResetButton: document.querySelector("#designer-zoom-reset-btn"),
  designerStageScroll: document.querySelector("#designer-stage-scroll"),
  designerStage: document.querySelector("#designer-stage"),
  designerPdfCanvas: document.querySelector("#designer-pdf-canvas"),
  designerOverlay: document.querySelector("#designer-overlay"),
  designerPaletteEditButton: document.querySelector("#designer-palette-edit-btn"),
  designerPaletteChooser: document.querySelector("#designer-palette-chooser"),
  designerPaletteSearch: document.querySelector("#designer-palette-search"),
  designerPaletteFilter: document.querySelector("#designer-palette-filter"),
  designerUnplacedCount: document.querySelector("#designer-unplaced-count"),
  designerPlacedCount: document.querySelector("#designer-placed-count"),
  designerUnplacedList: document.querySelector("#designer-unplaced-list"),
  designerPlacedList: document.querySelector("#designer-placed-list"),
  designerSelectionTitle: document.querySelector("#designer-selection-title"),
  designerSelectionHelp: document.querySelector("#designer-selection-help"),
  designerSelectionControls: document.querySelector("#designer-selection-controls"),
  designerSelectionClearButton: document.querySelector("#designer-selection-clear-btn"),
  designerSelectionPositionControls: document.querySelector("#designer-selection-position-controls"),
  designerSelectionFormatControls: document.querySelector("#designer-selection-format-controls"),
  designerSelectionX: document.querySelector("#designer-selection-x"),
  designerSelectionY: document.querySelector("#designer-selection-y"),
  designerSelectionFontFace: document.querySelector("#designer-selection-font-face"),
  designerSelectionFontSize: document.querySelector("#designer-selection-font-size"),
  designerSelectionBold: document.querySelector("#designer-selection-bold"),
  designerSelectionItalic: document.querySelector("#designer-selection-italic"),
  designerSelectionColorPicker: document.querySelector("#designer-selection-color-picker"),
  designerSelectionFormatRestore: document.querySelector("#designer-selection-format-restore"),
  designerSelectionFormatSummary: document.querySelector("#designer-selection-format-summary"),
  designerSelectionAlignment: document.querySelector("#designer-selection-alignment"),
  layoutFormattingDialog: document.querySelector("#layout-formatting-dialog"),
  layoutFormattingGrid: document.querySelector("#layout-formatting-grid"),
  layoutFormattingSaveButton: document.querySelector("#layout-formatting-save-btn"),
  layoutFormattingResetButton: document.querySelector("#layout-formatting-reset-btn"),
  designerSelectionNameFormatWrap: document.querySelector("#designer-selection-name-format-wrap"),
  designerSelectionNameFormat: document.querySelector("#designer-selection-name-format"),
  designerSelectionTemplateWrap: document.querySelector("#designer-selection-template-wrap"),
  designerSelectionTemplate: document.querySelector("#designer-selection-template"),
  designerSelectionTemplatePreview: document.querySelector("#designer-selection-template-preview"),
  designerSelectionTemplateField: document.querySelector("#designer-selection-template-field"),
  designerSelectionTemplateInsertButton: document.querySelector("#designer-selection-template-insert-btn"),
  designerSelectionDeleteButton: document.querySelector("#designer-selection-delete-btn"),
  designerSelectionNewInstanceButton: document.querySelector("#designer-selection-new-instance-btn"),
  designerSelectionRemoveItemButton: document.querySelector("#designer-selection-remove-item-btn"),
  designerSubordinateWorkspace: document.querySelector("#designer-subordinate-workspace"),
  designerWorkspaceLabel: document.querySelector("#designer-workspace-label"),
  designerWorkspaceTitle: document.querySelector("#designer-workspace-title"),
  designerWorkspaceLayoutButton: document.querySelector("#designer-workspace-layout-btn"),
  designerWorkspaceNewButton: document.querySelector("#designer-workspace-new-btn"),
  designerChildWorkspaceActions: document.querySelector("#designer-child-workspace-actions"),
  designerBlockLayoutControls: document.querySelector("#designer-block-layout-controls"),
  designerNewItemPanel: document.querySelector("#designer-new-item-panel"),
  designerContextTools: document.querySelector("#designer-context-tools"),
  designerSingleItemTool: document.querySelector("#designer-single-item-tool"),
  designerTextTemplateTool: document.querySelector("#designer-text-template-tool"),
  designerRepeatedTool: document.querySelector("#designer-repeated-tool"),
  designerIndividualTool: document.querySelector("#designer-individual-tool"),
  designerPlacementBanner: document.querySelector("#designer-placement-banner"),
  designerSlotFieldsPanel: document.querySelector("#designer-slot-fields-panel"),
  designerBlockToolTitle: document.querySelector("#designer-block-tool-title"),
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
  populateNameFormatSelects();
  updateDesignerTemplatePreview();
  elements.saveFavoriteTeamButton.addEventListener("click", saveFavoriteTeam);
  elements.refreshButton.addEventListener("click", () => loadFavoriteTeamPregame(state.selectedDate || today));
  elements.gameDateInput.addEventListener("change", handleGameDateChange);
  elements.gameDateTodayButton.addEventListener("click", () => setSelectedGameDate(getLocalDateString()));
  elements.navHome.addEventListener("click", () => showView("home"));
  elements.navGameDay.addEventListener("click", openGameDay);
  elements.navFieldDiagnostic.addEventListener("click", openFieldDiagnostic);
  elements.refreshFieldDiagnosticButton.addEventListener("click", () => loadFieldDiagnostic(true));
  elements.fieldDiagnosticSearch.addEventListener("input", renderFieldDiagnosticTable);
  elements.fieldDiagnosticTierFilter.addEventListener("change", renderFieldDiagnosticTable);
  elements.fieldDiagnosticStatusFilter.addEventListener("change", renderFieldDiagnosticTable);
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
  elements.layoutFormattingButton?.addEventListener("click", openLayoutFormattingDialog);
  elements.designerLayoutSettingsButton?.addEventListener("click", openLayoutFormattingDialog);
  elements.designerBackButton.addEventListener("click", () => showView("layouts"));
  elements.designerPlaceButton.addEventListener("click", beginDesignerPlacement);
  elements.designerTemplateInsertButton.addEventListener("click", insertDesignerTemplateField);
  elements.designerTemplateText.addEventListener("input", updateDesignerTemplatePreview);
  elements.designerTemplatePlaceButton.addEventListener("click", beginDesignerTemplatePlacement);
  elements.designerCreateBlockButton.addEventListener("click", createDesignerRepeatedBlock);
  elements.designerBlockSelect.addEventListener("change", syncDesignerBlockControls);
  elements.designerLineupSide.addEventListener("change", () => { syncDesignerArrangementInputs(); populateDesignerColumnFieldSelect(); syncDesignerSlotContentControls(); });
  elements.designerBlockArrangement.addEventListener("change", syncDesignerArrangementInputs);
  elements.designerPlaceRowsButton.addEventListener("click", beginDesignerBlockGeometryPlacement);
  elements.designerPlaceColumnButton.addEventListener("click", beginDesignerBlockColumnPlacement);
  elements.designerColumnContentType.addEventListener("change", () => { resetDesignerSlotBranchForType(); syncDesignerSlotContentControls(); });
  elements.designerColumnField.addEventListener("change", syncDesignerSlotContentControls);
  elements.designerColumnAlignment.addEventListener("change", syncDesignerSlotContentControls);
  elements.designerColumnNameFormat.addEventListener("change", syncDesignerSlotContentControls);
  elements.designerColumnTemplate.addEventListener("input", () => { updateDesignerSlotTemplatePreview(); syncDesignerSlotContentControls(); });
  elements.designerColumnTemplateInsertButton.addEventListener("click", insertDesignerSlotTemplateField);
  elements.designerFieldSelect.addEventListener("change", syncDesignerSingleNameFormatControl);
  elements.designerDeleteBlockButton.addEventListener("click", deleteSelectedDesignerBlock);
  elements.designerIndividualCollection.addEventListener("change", syncDesignerIndividualControls);
  elements.designerIndividualStrategy.addEventListener("change", syncDesignerIndividualControls);
  elements.designerIndividualField.addEventListener("change", syncDesignerIndividualNameFormatControl);
  elements.designerIndividualPlaceButton.addEventListener("click", beginDesignerIndividualPlacement);
  elements.designerGenerateButton.addEventListener("click", generateTestPdf);
  elements.designerPrevButton.addEventListener("click", () => changeDesignerPage(-1));
  elements.designerNextButton.addEventListener("click", () => changeDesignerPage(1));
  elements.designerZoomResetButton?.addEventListener("click", () => setDesignerZoom(1));
  elements.designerStageScroll?.addEventListener("wheel", handleDesignerZoomWheel, { passive: false });
  elements.designerStage.addEventListener("click", handleDesignerStageClick);
  if (elements.designerPaletteEditButton) elements.designerPaletteEditButton.addEventListener("click", toggleDesignerPaletteChooser);
  elements.designerPaletteSearch?.addEventListener("input", renderDesignerPalette);
  elements.designerPaletteFilter?.addEventListener("change", renderDesignerPalette);
  elements.designerSelectionClearButton.addEventListener("click", clearDesignerSelection);
  elements.designerSelectionDeleteButton.addEventListener("click", deleteSelectedDesignerObject);
  elements.designerSelectionNewInstanceButton.addEventListener("click", beginNewInstanceFromSelection);
  elements.designerSelectionRemoveItemButton?.addEventListener("click", removeSelectedDesignerChild);
  elements.designerWorkspaceLayoutButton?.addEventListener("click", () => setCollectionInspectorMode("layout"));
  elements.designerWorkspaceNewButton?.addEventListener("click", () => setCollectionInspectorMode("new"));
  wireCommittedInspectorInput(elements.designerSelectionX, applyDesignerInspectorPosition);
  wireCommittedInspectorInput(elements.designerSelectionY, applyDesignerInspectorPosition);
  elements.designerSelectionAlignment.addEventListener("change", applyDesignerInspectorFormatting);
  elements.designerSelectionNameFormat.addEventListener("change", applyDesignerInspectorFormatting);
  elements.designerSelectionFontFace?.addEventListener("change", () => applyInlineFormattingProperty("fontFace", elements.designerSelectionFontFace.value));
  elements.designerSelectionBold?.addEventListener("click", () => toggleInlineFormattingProperty("bold"));
  elements.designerSelectionItalic?.addEventListener("click", () => toggleInlineFormattingProperty("italic"));
  elements.designerSelectionFormatRestore?.addEventListener("click", restoreInlineFormattingDefaults);
  wireFormattingFontSizeInput();
  elements.layoutFormattingSaveButton?.addEventListener("click", saveLayoutFormattingDefaults);
  elements.layoutFormattingResetButton?.addEventListener("click", resetLayoutFormattingDefaults);
  wireCommittedInspectorInput(elements.designerSelectionTemplate, applyDesignerInspectorTemplate, { multiline: true });
  elements.designerSelectionTemplate?.addEventListener("input", updateDesignerSelectionTemplatePreview);
  elements.designerSelectionTemplateInsertButton?.addEventListener("click", insertDesignerSelectionTemplateField);
  document.addEventListener("keydown", handleDesignerKeyboard);
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


async function openFieldDiagnostic() {
  showView("field-diagnostic");
  await loadFieldDiagnostic(false);
}

async function loadFieldDiagnostic(force = false) {
  const feed = state.selectedFeed;
  const game = currentScheduleGame();
  if (!feed || !game) {
    elements.fieldDiagnosticContent.hidden = true;
    elements.fieldDiagnosticSources.hidden = true;
    elements.fieldDiagnosticMessage.hidden = false;
    elements.fieldDiagnosticMessage.classList.remove("error");
    elements.fieldDiagnosticMessage.textContent = "No game is selected. Return Home and select a game first.";
    return;
  }

  const token = ++state.fieldDiagnosticLoadToken;
  const gd = feed.gameData || {};
  const officialDate = gd.datetime?.officialDate || game.officialDate || getLocalDateString();
  const away = gd.teams?.away?.name || game.awayTeam || "Away";
  const home = gd.teams?.home?.name || game.homeTeam || "Home";
  elements.fieldDiagnosticSubtitle.textContent = `${away} at ${home} • ${formatDisplayDate(officialDate)}`;
  elements.fieldDiagnosticMessage.hidden = false;
  elements.fieldDiagnosticMessage.classList.remove("error");
  elements.fieldDiagnosticMessage.textContent = "Resolving every active field against the selected Game Pack and required supplemental sources…";
  elements.fieldDiagnosticContent.hidden = true;
  elements.fieldDiagnosticSources.hidden = false;
  elements.refreshFieldDiagnosticButton.disabled = true;
  elements.diagnosticGamePackSourcePill.textContent = "Game Pack: loaded";
  elements.diagnosticGamePackSourcePill.className = "pill ready";
  elements.diagnosticCoachesSourcePill.textContent = "Coaches API: loading…";
  elements.diagnosticCoachesSourcePill.className = "pill neutral";
  elements.diagnosticStandingsSourcePill.textContent = "Standings API: loading…";
  elements.diagnosticStandingsSourcePill.className = "pill neutral";

  try {
    const fieldIds = getCatalogFields().map((definition) => definition.id);
    const model = await hydrateSelectedGameModel(fieldIds, String(game.gamePk));
    if (token !== state.fieldDiagnosticLoadToken || String(state.selectedGamePk) !== String(game.gamePk)) return;
    state.fieldDiagnosticRows = buildFieldDiagnosticRows(model);
    renderFieldDiagnosticSummary(state.fieldDiagnosticRows);
    renderFieldDiagnosticTable();
    renderDiagnosticSourcePills(model);
    elements.fieldDiagnosticContent.hidden = false;
    const summary = summarizeDiagnosticRows(state.fieldDiagnosticRows);
    elements.fieldDiagnosticMessage.textContent = `Diagnostic complete: ${summary.available} available, ${summary.partial} partial, ${summary.missing} missing, ${summary.sourceUnavailable} source unavailable, ${summary.error} error.`;
  } catch (error) {
    if (token !== state.fieldDiagnosticLoadToken) return;
    console.error("Field diagnostic failed:", error);
    elements.fieldDiagnosticMessage.classList.add("error");
    elements.fieldDiagnosticMessage.textContent = errorMessage(error, "Field diagnostic could not be completed.");
  } finally {
    if (token === state.fieldDiagnosticLoadToken) elements.refreshFieldDiagnosticButton.disabled = false;
  }
}

function renderDiagnosticSourcePills(model) {
  const sources = model?.meta?.sources || {};
  setDiagnosticSourcePill(elements.diagnosticGamePackSourcePill, "Game Pack", sources.gamePack);
  setDiagnosticSourcePill(elements.diagnosticCoachesSourcePill, "Coaches API", sources.coaches);
  setDiagnosticSourcePill(elements.diagnosticStandingsSourcePill, "Standings API", sources.standings);
}

function setDiagnosticSourcePill(element, label, loaded) {
  element.textContent = `${label}: ${loaded ? "loaded" : "unavailable"}`;
  element.className = `pill ${loaded ? "ready" : "error"}`;
}

function renderFieldDiagnosticSummary(rows) {
  const summary = summarizeDiagnosticRows(rows);
  const parts = [
    ["Total", summary.total, "neutral"],
    ["Available", summary.available, "ready"],
    ["Partial", summary.partial, "warning"],
    ["Missing", summary.missing, "neutral"],
    ["Source unavailable", summary.sourceUnavailable, "error"],
    ["Error", summary.error, "error"]
  ];
  elements.fieldDiagnosticSummary.replaceChildren(...parts.map(([label, count, tone]) => {
    const pill = document.createElement("span");
    pill.className = `pill ${tone}`;
    pill.textContent = `${label}: ${count}`;
    return pill;
  }));
}

function renderFieldDiagnosticTable() {
  const query = String(elements.fieldDiagnosticSearch?.value || "").trim().toLowerCase();
  const tier = elements.fieldDiagnosticTierFilter?.value || "all";
  const status = elements.fieldDiagnosticStatusFilter?.value || "all";
  const rows = (state.fieldDiagnosticRows || []).filter((row) => {
    if (tier !== "all" && row.visibilityTier !== tier) return false;
    if (status !== "all" && row.status !== status) return false;
    if (!query) return true;
    return [row.label, row.id, row.category, row.description, row.liveValue, row.exampleValue].some((value) => String(value || "").toLowerCase().includes(query));
  });

  elements.fieldDiagnosticTableBody.replaceChildren();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.className = `diagnostic-row-${row.status}`;
    const sources = row.sourceRequirements.join(" + ");
    tr.innerHTML = `<td>${escapeHtml(row.category)}</td>
      <td title="${escapeHtml(row.description)}"><span class="diagnostic-field-label">${escapeHtml(row.label)}</span><span class="diagnostic-field-id">${escapeHtml(row.id)}</span></td>
      <td>${escapeHtml(capitalize(row.visibilityTier || ""))}</td>
      <td class="diagnostic-value">${escapeHtml(row.exampleValue || "—")}</td>
      <td class="diagnostic-value">${escapeHtml(row.liveValue || "—")}</td>
      <td>${escapeHtml(row.coverage || "—")}</td>
      <td>${escapeHtml(sources || "—")}</td>
      <td><span class="diagnostic-status ${escapeHtml(row.status)}" title="${escapeHtml(row.reason || row.statusLabel)}">${escapeHtml(row.statusLabel)}</span></td>`;
    elements.fieldDiagnosticTableBody.append(tr);
  }

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="8" class="gameday-empty">No fields match the current filters.</td>';
    elements.fieldDiagnosticTableBody.append(tr);
  }
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text[0].toUpperCase() + text.slice(1) : text;
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
  document.body.classList.toggle("designer-mode", view === "designer");
  if (view !== "designer") clearDesignerSelection({ render: false });
  document.querySelectorAll("[data-view]").forEach((node) => {
    node.hidden = node.dataset.view !== view;
  });
  elements.navHome.classList.toggle("active", view === "home");
  elements.navGameDay.classList.toggle("active", view === "gameday");
  elements.navFieldDiagnostic.classList.toggle("active", view === "field-diagnostic");
  elements.navLayouts.classList.toggle("active", view === "layouts");
  elements.navDesigner.classList.toggle("active", view === "designer");
  elements.navHome.toggleAttribute("aria-current", view === "home");
  elements.navGameDay.toggleAttribute("aria-current", view === "gameday");
  elements.navFieldDiagnostic.toggleAttribute("aria-current", view === "field-diagnostic");
  elements.navLayouts.toggleAttribute("aria-current", view === "layouts");
  elements.navDesigner.toggleAttribute("aria-current", view === "designer");
  elements.pageTitle.textContent = view === "home" ? "Home" : view === "gameday" ? "Game Day" : view === "field-diagnostic" ? "Field Diagnostic" : view === "layouts" ? "Layouts" : "Layout Designer";
  elements.pageEyebrow.textContent = view === "home" ? "Scorecard Studio • Pregame" : view === "gameday" ? "Scorecard Studio • Game Reference" : view === "field-diagnostic" ? "Scorecard Studio • Developer Diagnostic" : view === "layouts" ? "Scorecard Studio • Layout Management" : "Scorecard Studio • Field Mapping";
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
      designerPaletteGroups: [],
      designerPaletteConfigured: false,
      formattingDefaults: appFormattingDefaults(),
      conditionalFormatting: appConditionalFormattingDefaults(),
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
    state.designerSelection = null;
    state.designerPaletteSelection = null;
    cancelDesignerPlacement();
    ensureRepeatedBlockIds(layout);
    populateDesignerBlockSelect();
    populateDesignerColumnFieldSelect();
    syncDesignerIndividualControls();
    await renderDesignerPage();
    renderDesignerMappingList();
    renderDesignerBlockList();
    renderDesignerIndividualList();
    initializeDesignerPalette(layout);
    renderDesignerPalette();
    renderDesignerSelectionInspector();
    setDesignerMessage("Select data from the palette, place it on the scorecard, then click any placed object to fine-tune it.");
  } catch (error) {
    console.error("Unable to open Designer:", error);
    setDesignerMessage(errorMessage(error, "The Designer could not open this layout."), true);
  }
}

function beginDesignerPlacement() {
  if (!state.designerPdfDocument) return setDesignerMessage("Open a layout PDF first.", true);
  const definition = getFieldDefinition(elements.designerFieldSelect.value);
  const group = formattingGroupForFieldId(definition?.id);
  const alignment = ["left", "center", "right"].includes(elements.designerFieldAlignment?.value) ? elements.designerFieldAlignment.value : "left";
  const format = definition?.formatKind === "playerName" ? { nameFormat: elements.designerFieldNameFormat.value || "full" } : {};
  setDesignerPlacement({ mode: "scalar", alignment, format });
  setDesignerMessage(`Click the ${alignment}-alignment anchor for ${designerFieldLabel(elements.designerFieldSelect.value)}.`);
}

function populateNameFormatSelects() {
  for (const select of [elements.designerFieldNameFormat, elements.designerColumnNameFormat, elements.designerSelectionNameFormat, elements.designerIndividualNameFormat]) {
    if (!select) continue;
    select.replaceChildren();
    if (select === elements.designerColumnNameFormat) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose name format…";
      select.append(placeholder);
    }
    for (const entry of PLAYER_NAME_FORMATS) {
      const option = document.createElement("option"); option.value = entry.value; option.textContent = entry.label; select.append(option);
    }
  }
  syncDesignerSingleNameFormatControl();
  syncDesignerIndividualNameFormatControl();
}

function syncDesignerSingleNameFormatControl() {
  const definition = getFieldDefinition(elements.designerFieldSelect?.value);
  if (elements.designerFieldNameFormatWrap) elements.designerFieldNameFormatWrap.hidden = definition?.formatKind !== "playerName";
}

function populateDesignerTemplateFieldSelect(context = null) {
  if (!elements.designerTemplateField) return;
  elements.designerTemplateField.replaceChildren();
  const groups = new Map();
  const activeGroups = activeDesignerPaletteGroups();
  const definitions = context ? fieldsForRecordContext(context, { catalogOnly: true }) : getCatalogFields({ cardinality: "single" });
  for (const definition of definitions) {
    if (selectedLayout() && !activeGroups.has(designerPaletteGroupForField(definition))) continue;
    if (!groups.has(definition.category)) groups.set(definition.category, []);
    groups.get(definition.category).push(definition);
  }
  for (const [category, definitions] of groups) {
    const group = document.createElement("optgroup");
    group.label = category;
    for (const definition of definitions) {
      const option = document.createElement("option");
      option.value = definition.id;
      option.textContent = context ? slotFieldShortLabel(definition) : definition.label;
      group.append(option);
    }
    elements.designerTemplateField.append(group);
  }
  elements.designerTemplateField.disabled = elements.designerTemplateField.options.length === 0;
  elements.designerTemplateInsertButton.disabled = elements.designerTemplateField.options.length === 0;
}

function templateTokenForField(fieldId) {
  const definition = getFieldDefinition(fieldId);
  return definition ? `[${definition.label}]` : "";
}

function templateFieldIdByToken(tokenText) {
  const token = String(tokenText || "").trim();
  const direct = getFieldDefinition(token);
  if (direct?.cardinality === "single") return direct.id;
  const definition = getSupportedFields({ cardinality: "single" }).find((entry) => entry.label === token || entry.legacyLabels?.includes(token));
  return definition?.id || null;
}

function templateFieldIds(template, context = null) {
  if (context) return slotContentFieldIds({ type: "template", template }, context);
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

function resolveTemplateText(template, model, context = null) {
  if (context) return resolveSlotContent({ type: "template", template }, model, context);
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
  const context = state.designerPaletteSelection?.kind === "record" ? state.designerPaletteSelection.id : null;
  const token = context ? templateTokenForContextField(fieldId) : templateTokenForField(fieldId);
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
  const context = state.designerPaletteSelection?.kind === "record" ? state.designerPaletteSelection.id : null;
  const preview = resolveTemplateText(template, DESIGNER_SAMPLE_MODEL, context);
  elements.designerTemplatePreview.textContent = preview || "Enter text or insert a field.";
}

function beginDesignerTemplatePlacement() {
  if (!state.designerPdfDocument) return setDesignerMessage("Open a layout PDF first.", true);
  const template = elements.designerTemplateText.value;
  if (!template.trim()) return setDesignerMessage("Enter text template before placing it.", true);
  const origin = state.designerPaletteSelection;
  const context = origin?.kind === "record" ? origin.id : null;
  const formattingGroup = origin?.kind === "field" ? formattingGroupForFieldId(origin.id) : formattingGroupForContext(context);
  const alignment = ["left", "center", "right"].includes(elements.designerTemplateAlignment.value) ? elements.designerTemplateAlignment.value : "left";
  setDesignerPlacement({ mode: "template", template, alignment, context, formattingGroup });
  setDesignerMessage(`Click the ${alignment}-alignment baseline anchor for the text template.`);
}

async function createDesignerRepeatedBlock() {
  const layout = selectedLayout();
  if (!layout) return setDesignerMessage("Open a layout first.", true);
  const requestedContext = String(elements.designerLineupSide.value || "away.lineup");
  const isRecord = isRecordContext(requestedContext);
  const arrangement = isRecord ? "grid" : ["vertical", "horizontal", "grid"].includes(elements.designerBlockArrangement.value)
    ? elements.designerBlockArrangement.value : "vertical";
  let rows;
  let columns;
  if (isRecord) {
    rows = 1;
    columns = 1;
  } else if (arrangement === "grid") {
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
  const requestedCollection = requestedContext;
  const supportedCollections = new Set(["away.lineup", "home.lineup", "away.bench", "home.bench", "away.bullpen", "home.bullpen", "game.umpires.crew"]);
  const collection = supportedCollections.has(requestedCollection) ? requestedCollection : null;
  const block = {
    id: makeMappingId(),
    type: isRecord ? "record" : "repeated",
    ...(isRecord ? { record: requestedContext } : { collection: collection || "away.lineup" }),
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
  layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, isRecord ? 7 : 4);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    populateDesignerBlockSelect(block.id);
    syncDesignerBlockControls();
    renderDesignerBlockList();
    state.designerPaletteSelection = null;
    selectDesignerObject({ kind: "block", blockId: block.id });
    beginDesignerBlockGeometryPlacement();
    setDesignerMessage(`Created ${blockLabel(block)}. Follow the placement instructions above the scorecard.`);
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The repeated block could not be saved."), true);
  }
}

function beginDesignerBlockGeometryPlacement() {
  const block = selectedDesignerBlock();
  if (!block) return setDesignerMessage("Create or select a repeated block first.", true);
  if (isRecordBlock(block)) {
    setDesignerPlacement({ mode: "blockGeometrySingle", blockId: block.id });
    return setDesignerMessage(`Click the baseline origin for the ${blockLabel(block)}.`);
  }
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
  const contentType = elements.designerColumnContentType.value;
  if (!['field', 'template'].includes(contentType)) return setDesignerMessage("Choose Field or Text Template before placing slot content.", true);
  const field = elements.designerColumnField.value;
  const definition = getFieldDefinition(field);
  let content;
  if (contentType === "template") {
    const template = elements.designerColumnTemplate.value;
    if (!template.trim()) return setDesignerMessage("Enter a Text Template before placing it.", true);
    content = { type: "template", template };
  } else {
    if (!definition || !fieldsForRecordContext(blockContext(block)).some((entry) => entry.id === definition.id)) return setDesignerMessage("Choose a field that belongs to the selected layout.", true);
    content = { type: "field", field };
    if (definition.formatKind === "playerName") content.format = { nameFormat: elements.designerColumnNameFormat.value };
  }
  const alignment = elements.designerColumnAlignment.value;
  if (!["left", "center", "right"].includes(alignment)) return setDesignerMessage("Choose an alignment before adding slot content.", true);
  if (contentType === "field" && definition?.formatKind === "playerName" && !elements.designerColumnNameFormat.value) return setDesignerMessage("Choose a name format before adding the player-name field.", true);
  setDesignerPlacement({ mode: "blockColumn", blockId: block.id, field: content.field || null, content, alignment, formattingGroup: formattingGroupForContext(blockContext(block)) });
  const label = content.type === "template" ? "the Text Template" : designerFieldLabel(field);
  setDesignerMessage(`Click the ${alignment}-alignment anchor for ${label} in slot 1.${isRecordBlock(block) ? "" : " Scorecard Studio will repeat that offset through the block."}`);
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
  const previous = elements.designerIndividualField.value;
  elements.designerIndividualField.replaceChildren();
  for (const definition of getCatalogFields({ cardinality: "repeated", collection })) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = definition.label.replace(/^(Away|Home) (Lineup|Bench|Bullpen) — /, "").replace(/^Umpire Crew — /, "");
    elements.designerIndividualField.append(option);
  }
  if (previous && Array.from(elements.designerIndividualField.options).some((option) => option.value === previous)) elements.designerIndividualField.value = previous;
  syncDesignerIndividualNameFormatControl();
}

function syncDesignerIndividualNameFormatControl() {
  const definition = getFieldDefinition(elements.designerIndividualField?.value);
  if (elements.designerIndividualNameFormatWrap) elements.designerIndividualNameFormatWrap.hidden = definition?.formatKind !== "playerName";
}

function individualSelectorLabel(mapping) {
  if (mapping?.strategy === "role") {
    const option = (INDIVIDUAL_ROLE_OPTIONS[mapping.collection] || []).find(([value]) => value === mapping.selector?.role);
    return option?.[1] || mapping.selector?.role || "Role";
  }
  return `Slot ${mapping?.selector?.slot || 1}`;
}

function selectNextUnplacedIndividualSelector(collection) {
  const mappings = (selectedLayout()?.individualMappings || []).filter((mapping) => mapping.collection === collection);
  if (elements.designerIndividualStrategy.value === "role" && INDIVIDUAL_ROLE_OPTIONS[collection]) {
    const used = new Set(mappings.filter((m) => m.strategy === "role").map((m) => m.selector?.role));
    const next = INDIVIDUAL_ROLE_OPTIONS[collection].find(([value]) => !used.has(value));
    if (next) elements.designerIndividualRole.value = next[0];
  } else {
    const used = new Set(mappings.filter((m) => m.strategy !== "role").map((m) => Number(m.selector?.slot)));
    let slot = 1; while (used.has(slot) && slot < 30) slot += 1;
    elements.designerIndividualSlot.value = slot;
  }
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
  const alignment = ["left", "center", "right"].includes(elements.designerIndividualAlignment.value) ? elements.designerIndividualAlignment.value : "left";
  const format = definition.formatKind === "playerName" ? { nameFormat: elements.designerIndividualNameFormat?.value || "full" } : {};
  setDesignerPlacement({ mode: "individual", collection, strategy, selector, field, alignment, format, formattingGroup: formattingGroupForContext(collection) });
  setDesignerMessage(`Click the ${alignment}-alignment anchor for ${designerFieldLabel(field)} • ${individualSelectorLabel({ collection, strategy, selector })}.`);
}

async function handleDesignerStageClick(event) {
  if (!state.designerPlacing || !state.designerPdfDocument || !state.designerPlacement) {
    if (event.target === elements.designerStage || event.target === elements.designerOverlay || event.target === elements.designerPdfCanvas) clearDesignerSelection();
    return;
  }
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
      content: { type: "field", field, ...(Object.keys(placement.format || {}).length ? { format: placement.format } : {}) },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      formattingGroup: formattingGroupForFieldId(field),
      alignment: placement.alignment || "left",
      anchor: `baseline-${placement.alignment || "left"}`
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
      renderDesignerPalette();
      selectDesignerObject({ kind: "mapping", id: mapping.id }, { renderOverlay: true });
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
      content: { type: "template", template: placement.template, ...(placement.context ? { context: placement.context } : {}) },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      formattingGroup: placement.formattingGroup || formattingGroupForContext(placement.context),
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
      renderDesignerPalette();
      selectDesignerObject({ kind: "mapping", id: mapping.id }, { renderOverlay: true });
      setDesignerMessage("Placed text template.");
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The text template mapping could not be saved."), true);
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
      content: { type: "field", field: placement.field, ...(Object.keys(placement.format || {}).length ? { format: placement.format } : {}) },
      pageIndex: state.designerPageNumber - 1,
      xPercent,
      yPercent,
      formattingGroup: formattingGroupForContext(placement.collection),
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
      renderDesignerPalette();
      state.designerSelection = { kind: "individualWorkspace", collection: mapping.collection };
      state.designerPaletteSelection = { kind: "collection", id: mapping.collection, label: collectionDisplayLabel(mapping.collection) };
      state.designerPendingMode = "individual";
      selectNextUnplacedIndividualSelector(mapping.collection);
      renderDesignerSelectionInspector();
      renderDesignerPalette();
      setDesignerMessage(`Placed ${designerFieldLabel(mapping.field)} for ${individualSelectorLabel(mapping)}. Ready for the next individual placement.`);
      await refreshLayouts();
      state.selectedLayoutId = layout.id;
    } catch (error) {
      setDesignerMessage(errorMessage(error, "The individual mapping could not be saved."), true);
    }
    return;
  }

  const block = findDesignerBlock(placement.blockId);
  if (!block) return cancelDesignerPlacement();

  if (placement.mode === "blockGeometrySingle") {
    block.pageIndex = state.designerPageNumber - 1;
    block.geometry = {
      mode: "slot-grid-v1", firstXPercent: xPercent, firstYPercent: yPercent,
      lastXPercent: xPercent, lastYPercent: yPercent, rowSpacingPoints: 0, columnSpacingPoints: 0
    };
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, 7);
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement(); renderDesignerOverlay(); renderDesignerBlockList(); renderDesignerPalette();
      selectDesignerObject({ kind: "block", blockId: block.id }, { renderOverlay: true });
      setDesignerMessage(`Placed the ${blockLabel(block)}. Add fields or a Text Template to its slot.`);
      await refreshLayouts(); state.selectedLayoutId = layout.id;
    } catch (error) { setDesignerMessage(errorMessage(error, "The Record Layout placement could not be saved."), true); }
    return;
  }

  if (placement.mode === "blockGeometryFirst") {
    const { rows, columns } = blockDimensions(block);
    setDesignerPlacement({
      mode: "blockGeometryLast",
      blockId: block.id,
      pageIndex: state.designerPageNumber - 1,
      firstXPercent: xPercent,
      firstYPercent: yPercent
    });
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
      renderDesignerPalette();
      selectDesignerObject({ kind: "block", blockId: block.id }, { renderOverlay: true });
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
      content: placement.content || { type: "field", field },
      xPercent,
      formattingGroup: formattingGroupForContext(blockContext(block)),
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
    layout.schemaVersion = Math.max(Number(layout.schemaVersion) || 1, placement.content?.type === "template" || isRecordBlock(block) ? 7 : (isSlotGridGeometry(block) ? 4 : 3));
    layout.updatedAt = new Date().toISOString();
    try {
      await saveLayout(layout);
      cancelDesignerPlacement();
      renderDesignerOverlay();
      renderDesignerBlockList();
      renderDesignerPalette();
      selectDesignerObject({ kind: "repeatedColumn", blockId: block.id, columnId: column.id }, { renderOverlay: true });
      const label = placement.content?.type === "template" ? "Text Template" : designerFieldLabel(field);
      setDesignerMessage(`Placed ${label} as ${alignment}-aligned slot content.`);
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
  state.designerPageWidthPoints = baseViewport.width;
  state.designerPageHeightPoints = baseViewport.height;
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
    const alignment = ["left", "center", "right"].includes(mapping.alignment) ? mapping.alignment : "left";
    marker.className = `mapping-marker${isTemplate ? " template-marker" : ""} align-${alignment}${!isTemplate && !getFieldDefinition(mapping.field) ? " unsupported" : ""}`;
    marker.dataset.mappingId = mapping.id || "";
    marker.style.left = `${mapping.xPercent * 100}%`;
    marker.style.top = `${mapping.yPercent * 100}%`;
    applyPreviewFormatting(marker, effectiveFormatting(mapping));
    marker.textContent = isTemplate ? (resolveTemplateText(mapping.content.template, DESIGNER_SAMPLE_MODEL, mapping.content.context) || "[blank composite]") : designerFieldPreview(mapping.field, null, mapping.content?.format);
    marker.title = `${isTemplate ? "Text template" : designerFieldLabel(mapping.field)} • click to edit • drag to move`;
    if (state.designerSelection?.kind === "mapping" && state.designerSelection.id === mapping.id) marker.classList.add("selected-object");
    wireDesignerMarker(marker, { kind: "mapping", id: mapping.id });
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
        guide.title = `${blockLabel(block)} slot ${slotIndex + 1} • click to select block`;
        guide.classList.toggle("selected-object", state.designerSelection?.kind === "block" && state.designerSelection.blockId === block.id);
        guide.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject({ kind: "block", blockId: block.id }); });
        elements.designerOverlay.append(guide);
        for (const column of block.columns || []) {
          const marker = document.createElement("span");
          const alignment = ["left", "center", "right"].includes(column.alignment) ? column.alignment : "left";
          const isTemplate = column.content?.type === "template";
          marker.className = `mapping-marker repeated-marker${isTemplate ? " template-marker" : ""} align-${alignment}${!isTemplate && !getFieldDefinition(column.field) ? " unsupported" : ""}`;
          const anchorXPercent = slot.xPercent + ((Number(column.xOffsetPoints) || 0) / pageWidthPoints);
          marker.style.left = `${anchorXPercent * 100}%`;
          marker.style.top = `${slot.yPercent * 100}%`;
          const conditionalGroup = conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, blockContext(block), isRecordBlock(block) ? null : { slot: slotIndex + 1 });
          applyPreviewFormatting(marker, effectiveFormatting(column, { group: formattingGroupForContext(blockContext(block)), handednessGroup: conditionalGroup }));
          marker.textContent = designerSlotContentPreview(block, column, slotIndex + 1);
          marker.title = `${blockContentLabel(column)} • slot ${slotIndex + 1} • ${alignment} • click to edit content`;
          marker.dataset.blockId = block.id;
          marker.dataset.columnId = column.id;
          if (state.designerSelection?.kind === "repeatedColumn" && state.designerSelection.blockId === block.id && state.designerSelection.columnId === column.id) marker.classList.add("selected-object");
          marker.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject({ kind: "repeatedColumn", blockId: block.id, columnId: column.id }); });
          elements.designerOverlay.append(marker);
        }
      }
    } else {
      for (let rowIndex = 0; rowIndex < block.capacity; rowIndex += 1) {
        const yPercent = repeatedRowYPercent(block, rowIndex, pageHeightPoints);
        const guide = document.createElement("div");
        guide.className = "repeated-row-guide";
        guide.style.top = `${yPercent * 100}%`;
        guide.classList.toggle("selected-object", state.designerSelection?.kind === "block" && state.designerSelection.blockId === block.id);
        guide.title = `${blockLabel(block)} • click to select block`;
        guide.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject({ kind: "block", blockId: block.id }); });
        elements.designerOverlay.append(guide);
        for (const column of block.columns || []) {
          const marker = document.createElement("span");
          const alignment = ["left", "center", "right"].includes(column.alignment) ? column.alignment : "left";
          const isTemplate = column.content?.type === "template";
          marker.className = `mapping-marker repeated-marker${isTemplate ? " template-marker" : ""} align-${alignment}${!isTemplate && !getFieldDefinition(column.field) ? " unsupported" : ""}`;
          marker.style.left = `${column.xPercent * 100}%`;
          marker.style.top = `${yPercent * 100}%`;
          const conditionalGroup = conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, blockContext(block), isRecordBlock(block) ? null : { slot: rowIndex + 1 });
          applyPreviewFormatting(marker, effectiveFormatting(column, { group: formattingGroupForContext(blockContext(block)), handednessGroup: conditionalGroup }));
          marker.textContent = designerSlotContentPreview(block, column, rowIndex + 1);
          marker.title = `${blockContentLabel(column)} • row ${rowIndex + 1} • ${alignment} • click to edit content`;
          marker.dataset.blockId = block.id;
          marker.dataset.columnId = column.id;
          if (state.designerSelection?.kind === "repeatedColumn" && state.designerSelection.blockId === block.id && state.designerSelection.columnId === column.id) marker.classList.add("selected-object");
          marker.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject({ kind: "repeatedColumn", blockId: block.id, columnId: column.id }); });
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
    const conditionalGroup = conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, mapping.collection, mapping.selector);
    applyPreviewFormatting(marker, effectiveFormatting(mapping, { group: formattingGroupForContext(mapping.collection), handednessGroup: conditionalGroup }));
    marker.textContent = designerFieldPreview(mapping.field, mapping.selector, mapping.content?.format || {}) || `[${individualSelectorLabel(mapping)}]`;
    marker.title = `${designerFieldLabel(mapping.field)} • ${individualSelectorLabel(mapping)} • ${alignment} • click to edit • drag to move`;
    if (state.designerSelection?.kind === "individual" && state.designerSelection.id === mapping.id) marker.classList.add("selected-object");
    wireDesignerMarker(marker, { kind: "individual", id: mapping.id });
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
    text.textContent = `${individualCollectionLabel(mapping.collection)} • ${individualSelectorLabel(mapping)} • ${designerFieldLabel(mapping.field)} • ${effectiveFormatting(mapping, { selection: { kind: "individual" }, object: mapping }).fontSize} pt • ${mapping.alignment || "left"}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary-button compact-button";
    remove.textContent = "Remove Item";
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
    clearDesignerSelection({ render: false });
    renderDesignerPalette();
    renderDesignerSelectionInspector();
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
  if (!elements.designerMappingCount || !elements.designerMappingList) return;
  const layout = selectedLayout();
  const mappings = layout?.mappings || [];
  elements.designerMappingCount.textContent = String(mappings.length);
  elements.designerMappingList.replaceChildren();
  if (!mappings.length) {
    const empty = document.createElement("p");
    empty.className = "subtle";
    empty.textContent = "No scalar or text-template mappings yet.";
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
    meta.textContent = `Page ${mapping.pageIndex + 1} • ${(mapping.xPercent * 100).toFixed(1)}%, ${(mapping.yPercent * 100).toFixed(1)}% • ${effectiveFormatting(mapping, { selection: { kind: "mapping" }, object: mapping }).fontSize} pt • ${mapping.anchor || "baseline-left"}`;
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
    empty.textContent = "No Repeated or Record Layouts yet.";
    elements.designerBlockList.append(empty);
    return;
  }
  for (const block of blocks) {
    const card = document.createElement("div");
    card.className = "designer-block-card";
    const strong = document.createElement("strong");
    strong.textContent = isRecordBlock(block) ? `${blockLabel(block)} • Record Layout` : `${blockLabel(block)} • ${block.capacity} slots • ${blockArrangementLabel(block)}`;
    const meta = document.createElement("span");
    if (block.geometry && Number.isInteger(block.pageIndex)) {
      if (isSlotGridGeometry(block)) {
        const rowText = Number(block.geometry.rowSpacingPoints || 0).toFixed(2);
        const columnText = Number(block.geometry.columnSpacingPoints || 0).toFixed(2);
        meta.textContent = isRecordBlock(block)
          ? `Page ${block.pageIndex + 1} • ${(block.columns || []).length} content item(s)`
          : `Page ${block.pageIndex + 1} • row ${rowText} pt • column ${columnText} pt spacing • ${(block.columns || []).length} content item(s)`;
      } else {
        meta.textContent = `Page ${block.pageIndex + 1} • ${Number(block.geometry.rowSpacingPoints || 0).toFixed(2)} pt row spacing • ${(block.columns || []).length} content item(s) • legacy vertical`;
      }
    } else meta.textContent = `Placement not set • ${(block.columns || []).length} content item(s)`;
    card.append(strong, meta);
    for (const column of block.columns || []) {
      const row = document.createElement("div");
      row.className = "designer-block-column-row";
      const text = document.createElement("span");
      text.textContent = `${blockContentLabel(column)} • ${effectiveFormatting(column, { group: formattingGroupForContext(blockContext(block)) }).fontSize} pt • ${column.alignment || "left"}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary-button compact-button";
      remove.textContent = "Remove Item";
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
      setDesignerMessage(`${mapping.content?.type === "template" ? "Text template" : `Mapped field “${designerFieldLabel(mapping.field)}”`} could not be located on the rendered page.`, true);
      return;
    }
    marker.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    marker.classList.remove("show-target");
    void marker.offsetWidth;
    marker.classList.add("show-target");
    marker.focus({ preventScroll: true });
    window.setTimeout(() => marker.classList.remove("show-target"), 1800);
    setDesignerMessage(`Showing ${mapping.content?.type === "template" ? "text template" : designerFieldLabel(mapping.field)} on page ${mapping.pageIndex + 1}.`);
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
    clearDesignerSelection({ render: false });
    renderDesignerPalette();
    renderDesignerSelectionInspector();
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
    clearDesignerSelection({ render: false });
    renderDesignerPalette();
    renderDesignerSelectionInspector();
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
  if (!window.confirm(`Delete the ${blockLabel(block)} and all of its slot content?`)) return;
  layout.repeatedBlocks = (layout.repeatedBlocks || []).filter((item) => item.id !== block.id);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    cancelDesignerPlacement();
    populateDesignerBlockSelect();
    syncDesignerBlockControls();
    renderDesignerOverlay();
    renderDesignerBlockList();
    clearDesignerSelection({ render: false });
    renderDesignerPalette();
    renderDesignerSelectionInspector();
    setDesignerMessage(isRecordBlock(block) ? "Record Layout deleted." : "Repeated Layout deleted.");
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
    option.textContent = isRecordBlock(block) ? `${blockLabel(block)} ${index + 1} • Record Layout` : `${blockLabel(block)} ${index + 1} • ${block.capacity} slots • ${blockArrangementLabel(block)}`;
    elements.designerBlockSelect.append(option);
  });
  if (blocks.some((block) => block.id === prior)) elements.designerBlockSelect.value = prior;
}

function populateDesignerColumnFieldSelect() {
  const block = state.designerPaletteSelection && state.designerPendingMode ? null : selectedDesignerBlock();
  const context = blockContext(block) || String(elements.designerLineupSide.value || "away.lineup");
  const previous = elements.designerColumnField.value;
  const previousTemplate = elements.designerColumnTemplateField.value;
  elements.designerColumnField.replaceChildren();
  elements.designerColumnTemplateField.replaceChildren();

  const fieldPlaceholder = document.createElement("option");
  fieldPlaceholder.value = "";
  fieldPlaceholder.textContent = "Choose field…";
  elements.designerColumnField.append(fieldPlaceholder);

  const templatePlaceholder = document.createElement("option");
  templatePlaceholder.value = "";
  templatePlaceholder.textContent = "Choose field to insert…";
  elements.designerColumnTemplateField.append(templatePlaceholder);

  for (const definition of fieldsForRecordContext(context, { catalogOnly: true })) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = slotFieldShortLabel(definition);
    elements.designerColumnField.append(option);
    const templateOption = option.cloneNode(true);
    elements.designerColumnTemplateField.append(templateOption);
  }
  if (previous && Array.from(elements.designerColumnField.options).some((option) => option.value === previous)) elements.designerColumnField.value = previous;
  if (previousTemplate && Array.from(elements.designerColumnTemplateField.options).some((option) => option.value === previousTemplate)) elements.designerColumnTemplateField.value = previousTemplate;
  syncDesignerSlotContentControls();
}

function slotFieldShortLabel(definition) {
  return definition.label
    .replace(/^(Away|Home) (Lineup|Bench|Bullpen|Starting Pitcher) — /, "")
    .replace(/^Umpire Crew — /, "");
}

function resetDesignerSlotConfiguration() {
  if (elements.designerColumnContentType) elements.designerColumnContentType.value = "";
  if (elements.designerColumnField) elements.designerColumnField.value = "";
  if (elements.designerColumnAlignment) elements.designerColumnAlignment.value = "";
  if (elements.designerColumnFontSize) elements.designerColumnFontSize.value = "";
  if (elements.designerColumnNameFormat) elements.designerColumnNameFormat.value = "";
  if (elements.designerColumnTemplate) elements.designerColumnTemplate.value = "";
  if (elements.designerColumnTemplateField) elements.designerColumnTemplateField.value = "";
}

function resetDesignerSlotBranchForType() {
  if (elements.designerColumnField) elements.designerColumnField.value = "";
  if (elements.designerColumnAlignment) elements.designerColumnAlignment.value = "";
  if (elements.designerColumnFontSize) elements.designerColumnFontSize.value = "";
  if (elements.designerColumnNameFormat) elements.designerColumnNameFormat.value = "";
  if (elements.designerColumnTemplate) elements.designerColumnTemplate.value = "";
  if (elements.designerColumnTemplateField) elements.designerColumnTemplateField.value = "";
}

function syncDesignerSlotContentControls() {
  const contentType = elements.designerColumnContentType?.value || "";
  const isField = contentType === "field";
  const isTemplate = contentType === "template";
  const hasType = isField || isTemplate;
  const definition = isField ? getFieldDefinition(elements.designerColumnField?.value) : null;
  const hasField = Boolean(definition);
  const needsNameFormat = isField && definition?.formatKind === "playerName";
  const hasAlignment = ["left", "center", "right"].includes(elements.designerColumnAlignment?.value);
  const hasFontSize = true;
  const hasNameFormat = !needsNameFormat || Boolean(elements.designerColumnNameFormat?.value);
  const hasTemplate = isTemplate && Boolean(String(elements.designerColumnTemplate?.value || "").trim());

  if (elements.designerColumnFieldWrap) elements.designerColumnFieldWrap.hidden = !isField;
  if (elements.designerColumnTemplateWrap) elements.designerColumnTemplateWrap.hidden = !isTemplate;
  const alignmentLabel = elements.designerColumnAlignment?.closest("label");
  const fontSizeLabel = elements.designerColumnFontSize?.closest("label");
  if (alignmentLabel) alignmentLabel.hidden = !hasType;
  if (fontSizeLabel) fontSizeLabel.hidden = !hasType;
  if (elements.designerColumnNameFormatWrap) elements.designerColumnNameFormatWrap.hidden = !needsNameFormat;
  if (elements.designerPlaceColumnButton) {
    elements.designerPlaceColumnButton.hidden = !hasType;
    elements.designerPlaceColumnButton.disabled = isField
      ? !(hasField && hasAlignment && hasFontSize && hasNameFormat)
      : !(hasTemplate && hasAlignment && hasFontSize);
  }
  updateDesignerSlotTemplatePreview();
}

function updateDesignerSlotTemplatePreview() {
  if (!elements.designerColumnTemplatePreview) return;
  const block = state.designerPaletteSelection && state.designerPendingMode ? null : selectedDesignerBlock();
  const context = blockContext(block) || String(elements.designerLineupSide?.value || "");
  const preview = resolveSlotContent({ type: "template", template: elements.designerColumnTemplate?.value || "" }, DESIGNER_SAMPLE_MODEL, context, { slot: 1 });
  elements.designerColumnTemplatePreview.textContent = preview || "Enter text or insert a field.";
}

function insertDesignerSlotTemplateField() {
  const token = templateTokenForContextField(elements.designerColumnTemplateField?.value);
  const textarea = elements.designerColumnTemplate;
  if (!token || !textarea) return;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.setRangeText(token, start, end, "end");
  updateDesignerSlotTemplatePreview();
  textarea.focus();
}

function syncDesignerBlockControls() {
  const block = selectedDesignerBlock();
  const disabled = !block;
  elements.designerPlaceRowsButton.disabled = disabled;
  elements.designerPlaceColumnButton.disabled = disabled;
  elements.designerDeleteBlockButton.disabled = disabled;
  elements.designerDeleteBlockButton.textContent = block && isRecordBlock(block) ? "Delete Record Layout" : "Delete Repeated Layout";
  if (block) {
    const { rows, columns } = blockDimensions(block);
    elements.designerLineupSide.value = blockContext(block);
    elements.designerBlockArrangement.value = blockArrangement(block);
    elements.designerLineupCapacity.value = block.capacity;
    elements.designerGridRows.value = rows;
    elements.designerGridColumns.value = columns;
    elements.designerPlaceRowsButton.textContent = block.geometry ? "Change Placement" : "Set Placement";
  } else elements.designerPlaceRowsButton.textContent = "Set Placement";
  syncDesignerArrangementInputs();
  populateDesignerColumnFieldSelect();
}

function syncDesignerArrangementInputs() {
  const isRecord = isRecordContext(String(elements.designerLineupSide?.value || ""));
  const arrangement = elements.designerBlockArrangement.value || "vertical";
  const isGrid = arrangement === "grid";
  elements.designerBlockArrangement.closest("label").hidden = isRecord;
  elements.designerCapacityWrap.hidden = isRecord || isGrid;
  elements.designerGridDimensions.hidden = isRecord || !isGrid;
  if (elements.designerBlockToolTitle) elements.designerBlockToolTitle.textContent = isRecord ? "Record Layout" : "Repeated Layout";
  if (elements.designerCreateBlockButton) elements.designerCreateBlockButton.textContent = isRecord ? "Place Record Layout" : "Set Placement";
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
    "home.bullpen": "Home bullpen",
    "away.startingPitcher": "Away starting pitcher record",
    "home.startingPitcher": "Home starting pitcher record",
    "game.umpires.crew": "Umpire crew"
  };
  return labels[blockContext(block)] || String(blockContext(block) || "Layout block");
}

function isRecordContext(context) {
  return context === "away.startingPitcher" || context === "home.startingPitcher";
}

function isRecordBlock(block) { return block?.type === "record" || Boolean(block?.record); }
function blockContext(block) { return block?.record || block?.collection || ""; }

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

function blockContentLabel(column) {
  return column?.content?.type === "template" ? `Text Template: ${column.content.template || ""}` : designerFieldLabel(column?.field || column?.content?.field);
}

function designerSlotContentPreview(block, column, slot) {
  const content = column.content || { type: "field", field: column.field };
  return resolveSlotContent(content, DESIGNER_SAMPLE_MODEL, blockContext(block), isRecordBlock(block) ? null : { slot }) || "[blank]";
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
  updateDesignerPlacementBanner();
}

function updateDesignerPlacementBanner() {
  const p = state.designerPlacement;
  if (!elements.designerPlacementBanner) return;
  if (!p) { elements.designerPlacementBanner.hidden = true; elements.designerPlacementBanner.textContent = ""; return; }
  let text = "Click the scorecard to place this item. Press Escape to cancel.";
  if (p.mode === "blockGeometryFirst") text = "1 of 2 — Click the first slot anchor on the scorecard. Press Escape to cancel.";
  if (p.mode === "blockGeometryLast") text = "2 of 2 — Click the opposite/final slot anchor on the same page. Press Escape to cancel.";
  if (p.mode === "blockGeometrySingle") text = "Click the one-record slot anchor on the scorecard. Press Escape to cancel.";
  if (p.mode === "blockColumn") text = "Click the field anchor in slot 1; it will repeat through the block. Press Escape to cancel.";
  elements.designerPlacementBanner.textContent = text;
  elements.designerPlacementBanner.hidden = false;
}

function cancelDesignerPlacement() {
  setDesignerPlacement(null);
}

const DESIGNER_ZOOM_MIN = 0.5;
const DESIGNER_ZOOM_MAX = 3;
const DESIGNER_ZOOM_STEP = 0.10;

function updateDesignerZoomStatus() {
  if (elements.designerZoomStatus) elements.designerZoomStatus.textContent = `Zoom: ${Math.round(state.designerZoom * 100)}%`;
  if (elements.designerZoomResetButton) elements.designerZoomResetButton.disabled = Math.abs(state.designerZoom - 1) < 0.001;
}

function setDesignerZoom(zoom) {
  const next = clamp(Math.round(Number(zoom) * 100) / 100, DESIGNER_ZOOM_MIN, DESIGNER_ZOOM_MAX);
  if (!Number.isFinite(next) || Math.abs(next - state.designerZoom) < 0.001) return;
  state.designerZoom = next;
  updateDesignerZoomStatus();
  renderDesignerPage().catch(() => setDesignerMessage("The PDF could not be rendered at that zoom level.", true));
}

function handleDesignerZoomWheel(event) {
  if (!(event.ctrlKey || event.metaKey)) return; // ordinary wheel/trackpad scrolling remains native
  event.preventDefault();
  setDesignerZoom(state.designerZoom + (event.deltaY < 0 ? DESIGNER_ZOOM_STEP : -DESIGNER_ZOOM_STEP));
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

function designerFieldPreview(field, selector = null, format = {}) {
  const definition = getFieldDefinition(field);
  if (!definition) return `[Unsupported: ${field}]`;
  const resolution = resolveField(DESIGNER_SAMPLE_MODEL, field, selector);
  return formatFieldValue(definition, resolution, DESIGNER_SAMPLE_MODEL, format) || (definition.cardinality === "repeated" ? "" : definition.label);
}

function populateDesignerFieldSelect(context = null) {
  if (!elements.designerFieldSelect) return;
  const previous = elements.designerFieldSelect.value;
  elements.designerFieldSelect.replaceChildren();
  const activeGroups = activeDesignerPaletteGroups();
  const groups = new Map();
  const definitions = context ? fieldsForRecordContext(context, { catalogOnly: true }) : getCatalogFields({ cardinality: "single" });
  for (const definition of definitions) {
    const paletteGroup = designerPaletteGroupForField(definition);
    if (!activeGroups.has(paletteGroup)) continue;
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
  if (previous && Array.from(elements.designerFieldSelect.options).some((option) => option.value === previous)) elements.designerFieldSelect.value = previous;
  syncDesignerSingleNameFormatControl();
}


const DESIGNER_PALETTE_GROUPS = [
  { id: "game", label: "Game Information" },
  { id: "away-team", label: "Away Team Information" },
  { id: "away-players", label: "Away Players" },
  { id: "home-team", label: "Home Team Information" },
  { id: "home-players", label: "Home Players" },
  { id: "custom", label: "Text Template" }
];

function designerPaletteGroupForField(definition) {
  const id = String(definition?.id || "");
  if (id.startsWith("away.startingPitcher") || id.startsWith("away.lineup") || id.startsWith("away.bench") || id.startsWith("away.bullpen")) return "away-players";
  if (id.startsWith("home.startingPitcher") || id.startsWith("home.lineup") || id.startsWith("home.bench") || id.startsWith("home.bullpen")) return "home-players";
  if (id.startsWith("game.umpires")) return "game";
  if (id.startsWith("away.")) return "away-team";
  if (id.startsWith("home.")) return "home-team";
  return "game";
}

function initializeDesignerPalette(layout) {
  if (!layout) return;
  // Build 016.2: categories are navigation, not intent checkboxes.
  // Keep any older palette metadata for backwards compatibility, but show the full registry.
  if (elements.designerPaletteChooser) elements.designerPaletteChooser.hidden = true;
  if (elements.designerPaletteSearch) elements.designerPaletteSearch.value = "";
  if (elements.designerPaletteFilter) elements.designerPaletteFilter.value = "all";
  populateDesignerFieldSelect();
  populateDesignerTemplateFieldSelect();
}

function activeDesignerPaletteGroups() {
  return new Set(DESIGNER_PALETTE_GROUPS.map((group) => group.id));
}

function toggleDesignerPaletteChooser() {
  // Retained as a no-op compatibility hook. Build 016.2 uses expandable categories + search.
  elements.designerPaletteSearch?.focus();
}

function renderDesignerPaletteChooser() {
  if (elements.designerPaletteChooser) elements.designerPaletteChooser.hidden = true;
}

function designerPaletteItems() {
  const items = [];
  for (const definition of getCatalogFields({ cardinality: "single" })) {
    if (definition.record) continue;
    const groupId = designerPaletteGroupForField(definition);
    let label = definition.label;
    if ((groupId === "away-players" || groupId === "home-players") && String(definition.id).includes("startingPitcher")) label = "Starting Pitcher";
    items.push({ kind: "field", id: definition.id, groupId, label, description: definition.description, exampleValue: definition.exampleValue });
  }
  items.push(
    { kind: "record", id: "away.startingPitcher", groupId: "away-players", label: "Starting Pitcher", fields: fieldsForRecordContext("away.startingPitcher", { catalogOnly: true }) },
    { kind: "record", id: "home.startingPitcher", groupId: "home-players", label: "Starting Pitcher", fields: fieldsForRecordContext("home.startingPitcher", { catalogOnly: true }) }
  );
  const collections = [
    ["away.lineup", "Starting Lineup", "away-players"], ["home.lineup", "Starting Lineup", "home-players"],
    ["away.bench", "Bench", "away-players"], ["home.bench", "Bench", "home-players"],
    ["away.bullpen", "Bullpen", "away-players"], ["home.bullpen", "Bullpen", "home-players"],
    ["game.umpires.crew", "Umpire Crew", "game"]
  ];
  for (const [collection, label, groupId] of collections) items.push({ kind: "collection", id: collection, groupId, label });
  items.push({ kind: "custom", id: "custom", groupId: "custom", label: "Text Template" });
  return items;
}

function templateUsesField(layout, fieldId) {
  const definition = getFieldDefinition(fieldId);
  const labels = [definition?.label, ...(definition?.legacyLabels || [])].filter(Boolean);
  if (!labels.length) return false;
  return (layout.mappings || []).some((mapping) => mapping.content?.type === "template" && labels.some((label) => String(mapping.content.template || "").includes(`[${label}]`)));
}

function designerInstancesForItem(item, layout = selectedLayout()) {
  if (!layout) return [];
  const instances = [];
  if (item.kind === "field") {
    for (const mapping of layout.mappings || []) {
      if (mapping.content?.type !== "template" && canonicalFieldId(mapping.field) === canonicalFieldId(item.id)) {
        instances.push({ selection: { kind: "mapping", id: mapping.id }, label: `Page ${(mapping.pageIndex ?? 0) + 1} • Single Item` });
      } else if (mapping.content?.type === "template") {
        const label = getFieldDefinition(item.id)?.label;
        if (label && String(mapping.content.template || "").includes(`[${label}]`)) instances.push({ selection: { kind: "mapping", id: mapping.id }, label: `Page ${(mapping.pageIndex ?? 0) + 1} • Used in Text Template`, reference: true });
      }
    }
  } else if (item.kind === "record") {
    for (const mapping of layout.mappings || []) {
      const definition = getFieldDefinition(mapping.field);
      if (definition?.record === item.id) instances.push({ selection: { kind: "mapping", id: mapping.id }, label: `Page ${(mapping.pageIndex ?? 0) + 1} • ${slotFieldShortLabel(definition)}` });
      else if (mapping.content?.type === "template" && mapping.content.context === item.id) instances.push({ selection: { kind: "mapping", id: mapping.id }, label: `Page ${(mapping.pageIndex ?? 0) + 1} • Text Template` });
    }
    let n = 0;
    for (const block of layout.repeatedBlocks || []) if (blockContext(block) === item.id && isRecordBlock(block)) {
      n += 1;
      const page = Number.isInteger(block.pageIndex) ? `Page ${block.pageIndex + 1}` : "Placement not set";
      instances.push({ selection: { kind: "block", blockId: block.id }, label: `Record Layout • ${page} • ${(block.columns || []).length} content item(s) • Instance ${n}` });
    }
  } else if (item.kind === "custom") {
    for (const mapping of layout.mappings || []) if (mapping.content?.type === "template" && !mapping.content.context) instances.push({ selection: { kind: "mapping", id: mapping.id }, label: `Page ${(mapping.pageIndex ?? 0) + 1} • Text Template` });
  } else if (item.kind === "collection") {
    let n = 0;
    for (const block of layout.repeatedBlocks || []) if (block.collection === item.id) {
      n += 1;
      const page = Number.isInteger(block.pageIndex) ? `Page ${block.pageIndex + 1}` : "Placement not set";
      const contentState = (block.columns || []).length ? `${(block.columns || []).length} field${(block.columns || []).length === 1 ? "" : "s"}` : "No fields";
      instances.push({ selection: { kind: "block", blockId: block.id }, label: `${blockArrangementLabel(block)} • ${page} • ${contentState} • Instance ${n}` });
    }
    const individual = (layout.individualMappings || []).filter((mapping) => mapping.collection === item.id);
    if (individual.length) {
      const roleTotal = INDIVIDUAL_ROLE_OPTIONS[item.id]?.length || 0;
      const progress = roleTotal ? `${individual.length} of ${roleTotal} placed` : `${individual.length} placed`;
      instances.push({ selection: { kind: "individualWorkspace", collection: item.id }, label: `Individual Placement • ${progress}`, children: individual.map((mapping) => ({ selection: { kind: "individual", id: mapping.id }, label: `${individualSelectorLabel(mapping)} • Page ${(mapping.pageIndex ?? 0) + 1}` })) });
    }
  }
  return instances;
}

function isDesignerPaletteItemPlaced(item, layout) { return designerInstancesForItem(item, layout).length > 0; }
function designerDirectInstancesForItem(item, layout = selectedLayout()) { return designerInstancesForItem(item, layout).filter((instance) => !instance.reference); }

function paletteGroupLabel(groupId) {
  return DESIGNER_PALETTE_GROUPS.find((group) => group.id === groupId)?.label || "Other";
}

function renderDesignerPalette() {
  const layout = selectedLayout();
  if (!layout || !elements.designerUnplacedList) return;
  const query = String(elements.designerPaletteSearch?.value || "").trim().toLowerCase();
  const filter = elements.designerPaletteFilter?.value || "all";
  const allItems = designerPaletteItems();
  const usedCount = allItems.filter((item) => designerInstancesForItem(item, layout).length > 0).length;
  const visible = allItems.filter((item) => {
    const instances = designerInstancesForItem(item, layout);
    if (filter === "used" && !instances.length) return false;
    if (query && !`${item.label} ${paletteGroupLabel(item.groupId)}`.toLowerCase().includes(query)) return false;
    return true;
  });
  elements.designerUnplacedCount.textContent = `${visible.length}`;
  elements.designerPlacedCount.textContent = `${usedCount}`;
  elements.designerPlacedList?.replaceChildren();
  renderDesignerPaletteCategories(elements.designerUnplacedList, visible);
}

function renderDesignerPaletteCategories(container, items) {
  container.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p"); empty.className = "subtle"; empty.textContent = "No data items match this view."; container.append(empty); return;
  }
  const grouped = new Map();
  for (const group of DESIGNER_PALETTE_GROUPS) grouped.set(group.id, []);
  for (const item of items) {
    if (!grouped.has(item.groupId)) grouped.set(item.groupId, []);
    grouped.get(item.groupId).push(item);
  }
  for (const group of DESIGNER_PALETTE_GROUPS) {
    const groupItems = grouped.get(group.id) || [];
    if (!groupItems.length) continue;
    const details = document.createElement("details"); details.className = "designer-palette-category";
    const hasSelected = groupItems.some((item) => designerPaletteItemMatchesSelection(item, state.designerSelection) || designerPendingPaletteMatches(item));
    const forcedOpen = Boolean(elements.designerPaletteSearch?.value) || (elements.designerPaletteFilter?.value === "used");
    details.open = forcedOpen || state.designerPaletteExpanded.has(group.id) || hasSelected;
    details.addEventListener("toggle", () => {
      if (forcedOpen) return;
      if (details.open) state.designerPaletteExpanded.add(group.id); else state.designerPaletteExpanded.delete(group.id);
    });
    const summary = document.createElement("summary");
    const usedInGroup = groupItems.filter((item) => designerInstancesForItem(item).length).length;
    summary.innerHTML = `<strong>${group.label}</strong><span>${usedInGroup ? `${usedInGroup} used` : `${groupItems.length} available`}</span>`;
    details.append(summary);
    const body = document.createElement("div"); body.className = "designer-palette-category-body";
    for (const item of groupItems) body.append(renderDesignerPaletteItem(item));
    details.append(body); container.append(details);
  }
}

function renderDesignerPaletteItem(item) {
  const group = document.createElement("div"); group.className = "designer-palette-group";
  const button = document.createElement("button"); button.type = "button";
  const instances = designerInstancesForItem(item);
  const directInstances = instances.filter((instance) => !instance.reference);
  const references = instances.filter((instance) => instance.reference);
  const selected = designerPaletteItemMatchesSelection(item, state.designerSelection) || designerPendingPaletteMatches(item);
  button.className = `designer-palette-item${instances.length ? " placed" : ""}${selected ? " selected" : ""}`;
  const check = document.createElement("span"); check.className = "designer-palette-status-icon"; check.textContent = instances.length ? "✓" : "";
  const label = document.createElement("span"); label.className = "designer-palette-item-label"; label.textContent = item.label;
  const status = document.createElement("small");
  status.textContent = directInstances.length ? `${directInstances.length} instance${directInstances.length === 1 ? "" : "s"}` : (references.length ? "Used in template" : "Available");
  button.replaceChildren(check, label, status);
  if (item.description) button.title = item.exampleValue ? `${item.description} Example: ${item.exampleValue}` : item.description;
  button.addEventListener("click", () => activateDesignerPaletteItem(item, directInstances.length > 0));
  if (item.kind === "record" && item.fields?.length) {
    const details = document.createElement("details"); details.className = "designer-record-fields designer-record-direct";
    const summary = document.createElement("summary");
    summary.append(check, label, status);
    summary.className = button.className;
    summary.title = "Expand or collapse Starting Pitcher fields";
    details.append(summary);
    const list = document.createElement("div"); list.className = "designer-instance-list";
    const useRecord = document.createElement("button"); useRecord.type = "button"; useRecord.className = "designer-instance-item designer-record-use-item";
    useRecord.textContent = `Use ${item.label} record`;
    useRecord.addEventListener("click", (event) => { event.stopPropagation(); activateDesignerPaletteItem(item, directInstances.length > 0); });
    list.append(useRecord);
    for (const definition of item.fields) {
      const child = document.createElement("button"); child.type = "button"; child.className = "designer-instance-item";
      child.textContent = slotFieldShortLabel(definition);
      if (definition.description) child.title = definition.exampleValue ? `${definition.description} Example: ${definition.exampleValue}` : definition.description;
      child.addEventListener("click", (event) => { event.stopPropagation(); activateDesignerPaletteItem({ kind: "field", id: definition.id, groupId: item.groupId, label: slotFieldShortLabel(definition), description: definition.description, exampleValue: definition.exampleValue }); });
      list.append(child);
    }
    details.append(list);
    group.append(details);
  } else {
    group.append(button);
  }
  if (directInstances.length || references.length) {
    const children = document.createElement("div"); children.className = "designer-instance-list";
    directInstances.forEach((instance, index) => {
      const child = document.createElement("button"); child.type = "button"; child.className = "designer-instance-item";
      if (designerSelectionsEqual(state.designerSelection, instance.selection)) child.classList.add("selected");
      child.textContent = instance.label || `Instance ${index + 1}`;
      child.addEventListener("click", (event) => { event.stopPropagation(); state.designerPaletteSelection = null; state.designerPendingMode = null; selectDesignerObject(instance.selection, { scrollIntoView: true }); });
      children.append(child);
      if (instance.children?.length) {
        const nested = document.createElement("div"); nested.className = "designer-instance-children";
        for (const entry of instance.children) {
          const nestedButton = document.createElement("button"); nestedButton.type = "button"; nestedButton.className = "designer-instance-item designer-instance-child";
          if (designerSelectionsEqual(state.designerSelection, entry.selection)) nestedButton.classList.add("selected");
          nestedButton.textContent = entry.label;
          nestedButton.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject(entry.selection, { scrollIntoView: true }); });
          nested.append(nestedButton);
        }
        children.append(nested);
      }
    });
    if (references.length) {
      const ref = document.createElement("div"); ref.className = "designer-instance-reference"; ref.textContent = references.length === 1 ? "Referenced by a Text Template" : `Referenced by ${references.length} Text Templates`; children.append(ref);
    }
    group.append(children);
  }
  return group;
}

function designerSelectionsEqual(a,b) {
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "mapping" || a.kind === "individual") return a.id === b.id;
  if (a.kind === "individualWorkspace") return a.collection === b.collection;
  if (a.kind === "block") return a.blockId === b.blockId;
  if (a.kind === "repeatedColumn") return a.blockId === b.blockId && a.columnId === b.columnId;
  return false;
}

function designerPendingPaletteMatches(item) {
  const p = state.designerPaletteSelection;
  return Boolean(p && p.kind === item.kind && p.id === item.id);
}

function designerPaletteItemMatchesSelection(item, selection) {
  const object = locateDesignerObject(selection);
  if (!selection || !object) return false;
  if (item.kind === "field" && selection.kind === "mapping" && object.content?.type !== "template") return canonicalFieldId(object.field) === canonicalFieldId(item.id);
  if (item.kind === "field" && selection.kind === "mapping" && object.content?.type === "template") return false;
  if (item.kind === "custom" && selection.kind === "mapping") return object.content?.type === "template" && !object.content.context;
  if (item.kind === "record") {
    if (selection.kind === "mapping") return getFieldDefinition(object.field)?.record === item.id || object.content?.context === item.id;
    return (selection.kind === "block" && blockContext(object) === item.id) || (selection.kind === "repeatedColumn" && blockContext(object.block) === item.id);
  }
  if (item.kind === "collection") return (selection.kind === "block" && object.collection === item.id) || (selection.kind === "individual" && object.collection === item.id) || (selection.kind === "individualWorkspace" && object.collection === item.id) || (selection.kind === "repeatedColumn" && object.block.collection === item.id);
  return false;
}

function paletteItemForSelection(selection = state.designerSelection) {
  const object = locateDesignerObject(selection);
  if (!selection || !object) return null;
  if (selection.kind === "mapping") {
    if (object.content?.type === "template") return object.content.context
      ? { kind:"record", id:object.content.context, label:collectionDisplayLabel(object.content.context) }
      : { kind:"custom", id:"custom", label:"Text Template" };
    const def = getFieldDefinition(object.field); return def ? { kind:"field", id:def.id, label:def.label } : null;
  }
  if (selection.kind === "block") return isRecordBlock(object) ? { kind:"record", id:blockContext(object), label: collectionDisplayLabel(blockContext(object)) } : { kind:"collection", id:object.collection, label: collectionDisplayLabel(object.collection) };
  if (selection.kind === "individual") return { kind:"collection", id:object.collection, label: collectionDisplayLabel(object.collection) };
  if (selection.kind === "individualWorkspace") return { kind:"collection", id:object.collection, label: collectionDisplayLabel(object.collection) };
  if (selection.kind === "repeatedColumn") return isRecordBlock(object.block) ? { kind:"record", id:blockContext(object.block), label: collectionDisplayLabel(blockContext(object.block)) } : { kind:"collection", id:object.block.collection, label: collectionDisplayLabel(object.block.collection) };
  return null;
}

function collectionDisplayLabel(collection) {
  return ({"away.lineup":"Away starting lineup","home.lineup":"Home starting lineup","away.bench":"Away bench","home.bench":"Home bench","away.bullpen":"Away bullpen","home.bullpen":"Home bullpen","game.umpires.crew":"Umpire crew","away.startingPitcher":"Away starting pitcher","home.startingPitcher":"Home starting pitcher"})[collection] || collection;
}

function activateDesignerPaletteItem(item, placed) {
  cancelDesignerPlacement();
  state.designerPendingMode = null;
  const instances = designerDirectInstancesForItem(item);
  if (instances.length === 1) {
    state.designerPaletteSelection = null;
    selectDesignerObject(instances[0].selection, { scrollIntoView: true });
    return;
  }
  if (instances.length > 1) {
    state.designerSelection = null;
    state.designerPaletteSelection = { ...item };
    renderDesignerOverlay(); renderDesignerPalette(); renderDesignerSelectionInspector();
    return;
  }
  state.designerSelection = null;
  state.designerPaletteSelection = { ...item };
  configureControlsForPaletteItem(item);
  renderDesignerOverlay(); renderDesignerPalette(); renderDesignerSelectionInspector();
}

function configureControlsForPaletteItem(item) {
  if (item.kind === "field") {
    populateDesignerFieldSelect(); populateDesignerTemplateFieldSelect();
    if (Array.from(elements.designerFieldSelect.options).some((o)=>o.value===item.id)) elements.designerFieldSelect.value=item.id;
    elements.designerTemplateField.value = item.id;
    syncDesignerSingleNameFormatControl();
  } else if (item.kind === "record") {
    populateDesignerFieldSelect(item.id); populateDesignerTemplateFieldSelect(item.id);
    elements.designerLineupSide.value = item.id;
    populateDesignerColumnFieldSelect(); syncDesignerArrangementInputs();
  } else if (item.kind === "collection") {
    if (Array.from(elements.designerLineupSide.options).some((o)=>o.value===item.id)) elements.designerLineupSide.value=item.id;
    if (Array.from(elements.designerIndividualCollection.options).some((o)=>o.value===item.id)) elements.designerIndividualCollection.value=item.id;
    populateDesignerColumnFieldSelect(); syncDesignerIndividualControls();
  } else if (item.kind === "custom") {
    populateDesignerTemplateFieldSelect();
  }
}

function beginNewInstanceFromSelection() {
  const item = paletteItemForSelection();
  if (!item) return;
  state.designerSelection = null;
  state.designerPaletteSelection = item;
  state.designerPendingMode = null;
  configureControlsForPaletteItem(item);
  renderDesignerOverlay(); renderDesignerPalette(); renderDesignerSelectionInspector();
}

function showOnlyDesignerTool(tool) {
  const tools = [elements.designerSingleItemTool, elements.designerTextTemplateTool, elements.designerRepeatedTool, elements.designerIndividualTool];
  elements.designerContextTools.hidden = false;
  for (const entry of tools) { entry.hidden = entry !== tool; entry.open = entry === tool; }
}

function chooseDesignerPendingMode(mode) {
  const item = state.designerPaletteSelection; if (!item) return;
  state.designerPendingMode = mode;
  elements.designerContextTools.classList.remove("editing-existing-block");
  configureControlsForPaletteItem(item);
  if (mode === "template") {
    elements.designerTemplateText.value = item.kind === "field" ? templateTokenForField(item.id) : "";
    updateDesignerTemplatePreview();
  }
  renderDesignerSelectionInspector();
  renderDesignerPalette();
}

function insertFieldTokenIntoTemplate(fieldId) {
  const def=getFieldDefinition(fieldId); if(!def) return;
  const token=`[${def.label}]`; const current=elements.designerTemplateText.value;
  if (!current.includes(token)) elements.designerTemplateText.value = current ? `${current} ${token}` : token;
  updateDesignerTemplatePreview();
}

function locateDesignerObject(selection = state.designerSelection) {
  const layout = selectedLayout();
  if (!layout || !selection) return null;
  if (selection.kind === "mapping") return (layout.mappings || []).find((item) => item.id === selection.id) || null;
  if (selection.kind === "individual") return (layout.individualMappings || []).find((item) => item.id === selection.id) || null;
  if (selection.kind === "individualWorkspace") return { collection: selection.collection };
  if (selection.kind === "block") return (layout.repeatedBlocks || []).find((item) => item.id === selection.blockId) || null;
  if (selection.kind === "repeatedColumn") {
    const block = (layout.repeatedBlocks || []).find((item) => item.id === selection.blockId);
    const column = block?.columns?.find((item) => item.id === selection.columnId);
    return block && column ? { block, column } : null;
  }
  return null;
}

function designerSelectionLabel(selection, object) {
  if (!selection || !object) return "Nothing selected";
  if (selection.kind === "mapping") return object.content?.type === "template" ? "Text Template" : designerFieldLabel(object.field);
  if (selection.kind === "individual") return `${collectionDisplayLabel(object.collection)} — Individual Placement`;
  if (selection.kind === "individualWorkspace") return `${collectionDisplayLabel(object.collection)} — Individual Placement`;
  if (selection.kind === "block") return blockLabel(object);
  if (selection.kind === "repeatedColumn") return blockLabel(object.block);
  return "Selected object";
}

function scrollSelectedDesignerObjectIntoView() {
  window.requestAnimationFrame(() => {
    const target = elements.designerOverlay?.querySelector(".selected-object");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  });
}

function selectDesignerObject(selection, options = {}) {
  state.designerPaletteSelection = null;
  state.designerPendingMode = null;
  state.designerSelection = selection;
  if (options.inspectorMode) state.designerCollectionInspectorMode = options.inspectorMode;
  else if (["block"].includes(selection?.kind)) state.designerCollectionInspectorMode = "layout";
  else if (["repeatedColumn", "individual"].includes(selection?.kind)) state.designerCollectionInspectorMode = "item";
  else if (selection?.kind === "individualWorkspace") state.designerCollectionInspectorMode = "new";
  else state.designerCollectionInspectorMode = null;
  const object = locateDesignerObject(selection);
  const pageIndex = selection?.kind === "repeatedColumn" ? object?.block?.pageIndex : object?.pageIndex;
  if (Number.isInteger(pageIndex) && pageIndex + 1 !== state.designerPageNumber && state.designerPdfDocument) {
    state.designerPageNumber = pageIndex + 1;
    renderDesignerPage()
      .then(() => { if (options.scrollIntoView) scrollSelectedDesignerObjectIntoView(); })
      .catch(() => setDesignerMessage("The selected object's page could not be rendered.", true));
  } else {
    if (options.renderOverlay !== false) renderDesignerOverlay();
    if (options.scrollIntoView) scrollSelectedDesignerObjectIntoView();
  }
  if (selection?.kind === "block" && object) { elements.designerBlockSelect.value = object.id; syncDesignerBlockControls(); }
  if (selection?.kind === "repeatedColumn" && object?.block) { elements.designerBlockSelect.value = object.block.id; syncDesignerBlockControls(); }
  renderDesignerSelectionInspector();
  renderDesignerPalette();
}

function clearDesignerSelection(options = {}) {
  state.designerSelection = null;
  state.designerPaletteSelection = null;
  state.designerPendingMode = null;
  state.designerCollectionInspectorMode = null;
  if (options.render !== false && elements.designerOverlay) renderDesignerOverlay();
  if (elements.designerSelectionTitle) renderDesignerSelectionInspector();
  renderDesignerPalette();
}

function designerSelectionAnchor(selection, object) {
  const width = state.designerPageWidthPoints || 1, height = state.designerPageHeightPoints || 1;
  if (selection.kind === "mapping" || selection.kind === "individual") return { x: Number(object.xPercent || 0) * width, y: Number(object.yPercent || 0) * height, canX: true, canY: true };
  if (selection.kind === "block") {
    const g = object.geometry || {};
    if (isSlotGridGeometry(object)) return { x: Number(g.firstXPercent || 0) * width, y: Number(g.firstYPercent || 0) * height, canX: true, canY: true };
    return { x: null, y: Number(g.firstYPercent || 0) * height, canX: false, canY: true };
  }
  if (selection.kind === "repeatedColumn") {
    const { block, column } = object;
    const x = isSlotGridGeometry(block) ? (Number(block.geometry?.firstXPercent || 0) * width) + Number(column.xOffsetPoints || 0) : Number(column.xPercent || 0) * width;
    const y = Number(block.geometry?.firstYPercent || 0) * height;
    return { x, y, canX: true, canY: false };
  }
  return { x: null, y: null, canX: false, canY: false };
}

function isCollectionDesignerSelection(selection = state.designerSelection) {
  return ["block", "repeatedColumn", "individual", "individualWorkspace"].includes(selection?.kind);
}

function collectionParentForSelection(selection = state.designerSelection, object = locateDesignerObject(selection)) {
  if (!selection || !object) return null;
  if (selection.kind === "repeatedColumn") return { kind: "block", blockId: object.block.id };
  if (selection.kind === "block") return { kind: "block", blockId: object.id };
  if (selection.kind === "individual" || selection.kind === "individualWorkspace") return { kind: "individualWorkspace", collection: object.collection };
  return selection;
}

function designerParentLabel(selection = state.designerSelection, object = locateDesignerObject(selection)) {
  if (!selection || !object) return "Nothing selected";
  if (selection.kind === "repeatedColumn") return blockLabel(object.block);
  if (selection.kind === "block") return blockLabel(object);
  if (selection.kind === "individual" || selection.kind === "individualWorkspace") return `${collectionDisplayLabel(object.collection)} — Individual Placement`;
  return designerSelectionLabel(selection, object);
}

function designerChildLabel(selection = state.designerSelection, object = locateDesignerObject(selection)) {
  if (!selection || !object) return "Item";
  if (selection.kind === "repeatedColumn") {
    const content = object.column.content || { type: "field", field: object.column.field };
    if (content.type === "template") return "Text Template";
    const definition = getFieldDefinition(content.field || object.column.field);
    return definition ? slotFieldShortLabel(definition) : "Slot Content";
  }
  if (selection.kind === "individual") {
    const definition = getFieldDefinition(object.content?.field || object.field);
    const fieldLabel = definition ? slotFieldShortLabel(definition) : "Item";
    return `${individualSelectorLabel(object)} — ${fieldLabel}`;
  }
  if (selection.kind === "mapping") {
    if (object.content?.type === "template") return "Text Template";
    return designerFieldLabel(object.field);
  }
  return designerSelectionLabel(selection, object);
}

function setCollectionInspectorMode(mode) {
  if (!isCollectionDesignerSelection()) return;
  const selection = state.designerSelection;
  const object = locateDesignerObject(selection);
  const parentSelection = collectionParentForSelection(selection, object);
  if (mode === "layout") {
    if (parentSelection?.kind !== "block") return;
    state.designerCollectionInspectorMode = "layout";
    if (!designerSelectionsEqual(selection, parentSelection)) return selectDesignerObject(parentSelection, { inspectorMode: "layout" });
  } else if (mode === "new") {
    if (!parentSelection) return;
    state.designerCollectionInspectorMode = "new";
    if (parentSelection.kind === "block") resetDesignerSlotConfiguration();
    if (!designerSelectionsEqual(selection, parentSelection)) return selectDesignerObject(parentSelection, { inspectorMode: "new" });
  } else {
    state.designerCollectionInspectorMode = mode;
  }
  renderDesignerSelectionInspector();
}

function setDesignerWorkspaceHeading(label, title) {
  if (elements.designerWorkspaceLabel) elements.designerWorkspaceLabel.textContent = label;
  if (elements.designerWorkspaceTitle) elements.designerWorkspaceTitle.textContent = title;
}

function resetDesignerInspectorSurfaces() {
  elements.designerSelectionControls.hidden = true;
  elements.designerNewItemPanel.hidden = true;
  elements.designerContextTools.hidden = true;
  if (elements.designerSubordinateWorkspace) elements.designerSubordinateWorkspace.hidden = true;
  if (elements.designerSelectionPositionControls) elements.designerSelectionPositionControls.hidden = false;
  if (elements.designerSelectionFormatControls) elements.designerSelectionFormatControls.hidden = false;
  if (elements.designerBlockLayoutControls) elements.designerBlockLayoutControls.hidden = false;
  if (elements.designerSlotFieldsPanel) elements.designerSlotFieldsPanel.hidden = true;
  if (elements.designerSelectionNameFormatWrap) elements.designerSelectionNameFormatWrap.hidden = true;
  if (elements.designerSelectionTemplateWrap) elements.designerSelectionTemplateWrap.hidden = true;
  if (elements.designerSelectionRemoveItemButton) elements.designerSelectionRemoveItemButton.hidden = true;
  elements.designerContextTools.classList.remove("editing-existing-block", "geometry-ready", "creating-repeated", "creating-record", "scoped-child-workspace");
  if (elements.designerBlockList) elements.designerBlockList.hidden = false;
}

function renderPendingDesignerCreation(pending, pendingMode) {
  if (elements.designerSubordinateWorkspace) elements.designerSubordinateWorkspace.hidden = false;
  setDesignerWorkspaceHeading("New Object", pending.label);
  elements.designerNewItemPanel.hidden = false;
  elements.designerNewItemPanel.replaceChildren();
  const instances = designerInstancesForItem(pending);

  if (!pendingMode) {
    const title = document.createElement("strong");
    title.textContent = instances.length ? "Create a new instance" : "How would you like to use this?";
    elements.designerNewItemPanel.append(title);
    const actions = document.createElement("div"); actions.className = "designer-choice-grid";
    const add = (label, desc, mode) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "designer-choice-button";
      b.innerHTML = `<strong>${label}</strong><span>${desc}</span>`;
      b.addEventListener("click", () => chooseDesignerPendingMode(mode)); actions.append(b);
    };
    if (pending.kind === "field") {
      add("Single Item", "Place this value directly on the scorecard.", "single");
      add("Text Template", "Combine this value with labels or other fields.", "template");
    } else if (pending.kind === "record") {
      add("Single Item", "Place one record attribute directly.", "single");
      add("Text Template", "Combine attributes from this record.", "template");
      add("Record Layout", "Arrange several attributes in one one-record slot.", "record");
    } else if (pending.kind === "collection") {
      add("Repeated Layout", "Arrange records as a list, row, or grid.", "repeated");
      add("Individual Placement", "Place records independently by order or role.", "individual");
    } else {
      add("Text Template", "Create or place a text template.", "template");
    }
    elements.designerNewItemPanel.append(actions);
    return;
  }

  const summary = document.createElement("div"); summary.className = "designer-choice-summary";
  const names = { single:"Single Item", template:"Text Template", repeated:"Repeated Layout", record:"Record Layout", individual:"Individual Placement" };
  const summaryText = document.createElement("div");
  summaryText.innerHTML = `<span>Usage</span><strong>${names[pendingMode] || pendingMode}</strong>`;
  const change = document.createElement("button"); change.type = "button"; change.className = "secondary-button compact-button"; change.textContent = "Change";
  change.addEventListener("click", () => { state.designerPendingMode = null; renderDesignerSelectionInspector(); });
  summary.append(summaryText, change);
  elements.designerNewItemPanel.append(summary);

  configureControlsForPaletteItem(pending);
  if (pendingMode === "single") showOnlyDesignerTool(elements.designerSingleItemTool);
  else if (pendingMode === "template") showOnlyDesignerTool(elements.designerTextTemplateTool);
  else if (pendingMode === "individual") showOnlyDesignerTool(elements.designerIndividualTool);
  else if (pendingMode === "repeated" || pendingMode === "record") {
    showOnlyDesignerTool(elements.designerRepeatedTool);
    elements.designerContextTools.classList.add("creating-repeated");
    elements.designerContextTools.classList.toggle("creating-record", pendingMode === "record");
    // A Record Layout is inherently one record / one anchor. Arrangement and slot-count
    // choices belong only to Repeated Layouts and must never be part of this workflow.
    if (pendingMode === "record") {
      elements.designerBlockArrangement.closest("label").hidden = true;
      elements.designerCapacityWrap.hidden = true;
      elements.designerGridDimensions.hidden = true;
    }
    if (elements.designerSlotFieldsPanel) elements.designerSlotFieldsPanel.hidden = true;
  }
}

function renderDesignerSelectionInspector() {
  if (!elements.designerSelectionTitle) return;
  const selection = state.designerSelection;
  const object = locateDesignerObject(selection);
  const pending = state.designerPaletteSelection;
  const pendingMode = state.designerPendingMode;
  const active = Boolean(selection && object);

  resetDesignerInspectorSurfaces();
  elements.designerSelectionClearButton.disabled = !(active || pending);
  elements.designerSelectionClearButton.hidden = !(active || pending);
  elements.designerSelectionClearButton.textContent = active ? "Deselect" : "Cancel";
  elements.designerSelectionDeleteButton.hidden = !active;
  elements.designerSelectionNewInstanceButton.hidden = !active;
  elements.designerWorkspaceLayoutButton.hidden = true;
  elements.designerWorkspaceNewButton.hidden = true;
  if (elements.designerChildWorkspaceActions) elements.designerChildWorkspaceActions.hidden = true;

  if (!active && !pending) {
    elements.designerSelectionTitle.textContent = "Nothing selected";
    elements.designerSelectionHelp.textContent = "Select a data item on the left or a placed object on the scorecard.";
    return;
  }

  if (!active && pending) {
    elements.designerSelectionTitle.textContent = pending.label;
    elements.designerSelectionHelp.textContent = designerInstancesForItem(pending).length
      ? "This data is already used. Choose an existing instance on the left, or create another use of it."
      : "Choose how you want to use this data item.";
    elements.designerSelectionDeleteButton.hidden = true;
    elements.designerSelectionNewInstanceButton.hidden = true;
    renderPendingDesignerCreation(pending, pendingMode);
    return;
  }

  const parentLabel = designerParentLabel(selection, object);
  elements.designerSelectionTitle.textContent = parentLabel;
  elements.designerSelectionHelp.textContent = "Parent actions apply to the complete object shown here. Child editing appears in the workspace below.";
  if (elements.designerSubordinateWorkspace) elements.designerSubordinateWorkspace.hidden = false;

  const isRepeated = selection.kind === "block" || selection.kind === "repeatedColumn";
  const isIndividual = selection.kind === "individual" || selection.kind === "individualWorkspace";
  const parentBlock = selection.kind === "repeatedColumn" ? object.block : (selection.kind === "block" ? object : null);
  const hasEstablishedGeometry = Boolean(parentBlock?.geometry);
  if (isRepeated) {
    elements.designerWorkspaceLayoutButton.hidden = false;
  } else if (isIndividual) {
    elements.designerWorkspaceNewButton.hidden = true;
    const mappings = (selectedLayout()?.individualMappings || []).filter((mapping) => mapping.collection === object.collection);
    elements.designerSelectionDeleteButton.hidden = !mappings.length;
  }

  const mode = state.designerCollectionInspectorMode;
  const editingLayout = isRepeated && selection.kind === "block" && mode === "layout";
  const placingNew = isCollectionDesignerSelection(selection) && mode === "new";
  const editingChild = selection.kind === "repeatedColumn" || selection.kind === "individual";

  if (placingNew) {
    setDesignerWorkspaceHeading("Place New Item", isRepeated ? "Add slot content" : "Add individual item");
    elements.designerSelectionControls.hidden = true;
    if (isRepeated) {
      elements.designerBlockSelect.value = parentBlock.id;
      syncDesignerBlockControls();
      resetDesignerSlotConfiguration();
      showOnlyDesignerTool(elements.designerRepeatedTool);
      elements.designerContextTools.classList.add("scoped-child-workspace");
      elements.designerBlockLayoutControls.hidden = true;
      elements.designerSlotFieldsPanel.hidden = !hasEstablishedGeometry;
      elements.designerDeleteBlockButton.hidden = true;
      elements.designerBlockList.hidden = true;
      syncDesignerSlotContentControls();
    } else if (isIndividual) {
      const collection = object.collection;
      state.designerPaletteSelection = { kind: "collection", id: collection, label: collectionDisplayLabel(collection) };
      state.designerPendingMode = "individual";
      configureControlsForPaletteItem(state.designerPaletteSelection);
      selectNextUnplacedIndividualSelector(collection);
      showOnlyDesignerTool(elements.designerIndividualTool);
    }
    return;
  }

  if (editingLayout) {
    setDesignerWorkspaceHeading("Edit Layout", parentLabel);
    elements.designerBlockSelect.value = object.id;
    syncDesignerBlockControls();
    const anchor = designerSelectionAnchor(selection, object);
    elements.designerSelectionX.value = anchor.x == null ? "" : anchor.x.toFixed(1);
    elements.designerSelectionY.value = anchor.y == null ? "" : anchor.y.toFixed(1);
    elements.designerSelectionX.disabled = !anchor.canX;
    elements.designerSelectionY.disabled = !anchor.canY;
    elements.designerSelectionControls.hidden = false;
    elements.designerSelectionPositionControls.hidden = false;
    elements.designerSelectionFormatControls.hidden = true;
    elements.designerSelectionNameFormatWrap.hidden = true;
    elements.designerSelectionTemplateWrap.hidden = true;
    elements.designerSelectionRemoveItemButton.hidden = true;
    showOnlyDesignerTool(elements.designerRepeatedTool);
    elements.designerContextTools.classList.add("editing-existing-block");
    if (object.geometry) elements.designerContextTools.classList.add("geometry-ready");
    elements.designerBlockLayoutControls.hidden = false;
    elements.designerSlotFieldsPanel.hidden = true;
    elements.designerPlaceRowsButton.hidden = !object.geometry;
    elements.designerDeleteBlockButton.hidden = true;
    if (hasEstablishedGeometry) {
      elements.designerWorkspaceNewButton.hidden = false;
      if (elements.designerChildWorkspaceActions) elements.designerChildWorkspaceActions.hidden = false;
    }
    return;
  }

  if (selection.kind === "individualWorkspace") {
    state.designerCollectionInspectorMode = "new";
    setDesignerWorkspaceHeading("Place New Item", "Add individual item");
    const collection = object.collection;
    state.designerPaletteSelection = { kind: "collection", id: collection, label: collectionDisplayLabel(collection) };
    state.designerPendingMode = "individual";
    configureControlsForPaletteItem(state.designerPaletteSelection);
    selectNextUnplacedIndividualSelector(collection);
    showOnlyDesignerTool(elements.designerIndividualTool);
    return;
  }

  setDesignerWorkspaceHeading("Selected Item", designerChildLabel(selection, object));
  elements.designerSelectionControls.hidden = false;
  elements.designerContextTools.hidden = true;

  const anchor = designerSelectionAnchor(selection, object);
  elements.designerSelectionX.value = anchor.x == null ? "" : anchor.x.toFixed(1);
  elements.designerSelectionY.value = anchor.y == null ? "" : anchor.y.toFixed(1);
  elements.designerSelectionX.disabled = !anchor.canX;
  elements.designerSelectionY.disabled = !anchor.canY;
  const target = selection.kind === "repeatedColumn" ? object.column : object;
  updateDesignerFormattingSummary(target, selection, object);
  elements.designerSelectionAlignment.disabled = false;
  elements.designerSelectionAlignment.value = target.alignment || "left";
  const isTemplate = (selection.kind === "mapping" || selection.kind === "repeatedColumn") && target.content?.type === "template";
  elements.designerSelectionTemplateWrap.hidden = !isTemplate;
  elements.designerSelectionTemplate.value = isTemplate ? (target.content.template || "") : "";
  const definition = getFieldDefinition(target.content?.field || target.field);
  const hasNameFormat = !isTemplate && definition?.formatKind === "playerName";
  elements.designerSelectionNameFormatWrap.hidden = !hasNameFormat;
  elements.designerSelectionNameFormat.value = hasNameFormat ? (target.content?.format?.nameFormat || "full") : "full";
  elements.designerSelectionRemoveItemButton.hidden = !editingChild;
  // Keep the add-child loop available while an existing child is selected. This is a
  // child-workspace action, not a parent-card action, and applies to both Repeated and
  // single-record Record Layout containers.
  if (editingChild && isRepeated && parentBlock?.geometry) {
    elements.designerWorkspaceNewButton.hidden = false;
    if (elements.designerChildWorkspaceActions) elements.designerChildWorkspaceActions.hidden = false;
  }
  if (isTemplate) {
    populateDesignerSelectionTemplateFieldSelect();
    updateDesignerSelectionTemplatePreview();
  }
}

function populateDesignerSelectionTemplateFieldSelect() {
  const select = elements.designerSelectionTemplateField;
  if (!select) return;
  const previous = select.value;
  select.replaceChildren();
  const selected = locateDesignerObject();
  const context = state.designerSelection?.kind === "repeatedColumn" ? blockContext(selected?.block) : selected?.content?.context;
  const definitions = context ? fieldsForRecordContext(context, { catalogOnly: true }) : getCatalogFields({ cardinality: "single" });
  for (const definition of definitions) {
    const option = document.createElement("option");
    option.value = definition.id;
    option.textContent = context ? slotFieldShortLabel(definition) : definition.label;
    select.append(option);
  }
  if (previous && Array.from(select.options).some((option) => option.value === previous)) select.value = previous;
}

function updateDesignerSelectionTemplatePreview() {
  const preview = elements.designerSelectionTemplatePreview;
  if (!preview || elements.designerSelectionTemplateWrap?.hidden) return;
  const template = elements.designerSelectionTemplate.value || "";
  const selected = locateDesignerObject();
  const context = state.designerSelection?.kind === "repeatedColumn" ? blockContext(selected?.block) : selected?.content?.context;
  const selector = state.designerSelection?.kind === "repeatedColumn" && !isRecordBlock(selected?.block) ? { slot: 1 } : null;
  preview.textContent = context
    ? (resolveSlotContent({ type: "template", template }, DESIGNER_SAMPLE_MODEL, context, selector) || "Enter text or insert a field.")
    : (resolveTemplateText(template, DESIGNER_SAMPLE_MODEL) || "Enter text or insert a field.");
}

function insertDesignerSelectionTemplateField() {
  const textarea = elements.designerSelectionTemplate;
  const field = elements.designerSelectionTemplateField?.value;
  const definition = getFieldDefinition(field);
  if (!textarea || !definition) return;
  const selected = locateDesignerObject();
  const context = state.designerSelection?.kind === "repeatedColumn" ? blockContext(selected?.block) : selected?.content?.context;
  const token = context ? templateTokenForContextField(field) : `[${definition.label}]`;
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.setRangeText(token, start, end, "end");
  updateDesignerSelectionTemplatePreview();
  applyDesignerInspectorTemplate();
  textarea.focus();
}


function layoutFormattingDefaults(layout = selectedLayout()) {
  return ensureLayoutFormattingDefaults(layout || {});
}

function layoutConditionalFormatting(layout = selectedLayout()) {
  return ensureLayoutConditionalFormatting(layout || {});
}

function baseFormattingGroupForTarget(target, selection = state.designerSelection, object = locateDesignerObject(selection)) {
  if (target?.formattingGroup) return target.formattingGroup;
  if (selection?.kind === "repeatedColumn") return formattingGroupForContext(blockContext(object?.block));
  if (selection?.kind === "individual") return formattingGroupForContext(target?.collection);
  if (target?.content?.type === "template" && target.content.context) return formattingGroupForContext(target.content.context);
  return formattingGroupForFieldId(target?.field || target?.content?.field);
}

function defaultFormattingForTarget(target, options = {}) {
  const layout = options.layout || selectedLayout() || {};
  const defaults = layoutFormattingDefaults(layout);
  let group = options.group || baseFormattingGroupForTarget(target, options.selection, options.object);
  if (options.handednessGroup && conditionalFormattingEnabled(layout, options.handednessGroup)) group = options.handednessGroup;
  return defaults[group] || defaults.game;
}

function effectiveFormatting(target, options = {}) {
  return mergeFormat(defaultFormattingForTarget(target, options), target?.formattingOverride || {});
}

function applyPreviewFormatting(marker, format) {
  const previewFontPx = Math.max(1, Number(format.fontSize || 10) * state.designerRenderScale);
  marker.style.fontSize = `${previewFontPx}px`;
  marker.style.setProperty("--preview-font-px", `${previewFontPx}px`);
  marker.style.fontFamily = format.fontFace === "Times" ? "Times New Roman, Times, serif" : format.fontFace === "Courier" ? "Courier New, Courier, monospace" : "Helvetica, Arial, sans-serif";
  marker.style.fontWeight = format.bold ? "700" : "400";
  marker.style.fontStyle = format.italic ? "italic" : "normal";
  marker.style.color = format.color || "#000000";
}

function formattingSummary(format) {
  const style = format.bold && format.italic ? "Bold Italic" : format.bold ? "Bold" : format.italic ? "Italic" : "Normal";
  return `${format.fontFace}, ${format.fontSize} pt, ${colorDisplayName(format.color)}, ${style}`;
}

function currentInlineFormattingTarget() {
  const selection = state.designerSelection;
  const object = locateDesignerObject(selection);
  if (!selection || !object || selection.kind === "block") return null;
  return { selection, object, target: selection.kind === "repeatedColumn" ? object.column : object };
}

function updateDesignerFormattingSummary(target, selection = state.designerSelection, object = locateDesignerObject(selection)) {
  if (!elements.designerSelectionFormatSummary || !target) return;
  const handedness = conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, selection?.kind === "repeatedColumn" ? blockContext(object?.block) : target?.collection || target?.content?.context, selection?.kind === "individual" ? target?.selector : selection?.kind === "repeatedColumn" && !isRecordBlock(object?.block) ? { slot: 1 } : null);
  const defaults = defaultFormattingForTarget(target, { selection, object, handednessGroup: handedness });
  const effective = effectiveFormatting(target, { selection, object, handednessGroup: handedness });
  elements.designerSelectionFormatSummary.textContent = formattingSummary(defaults);
  if (elements.designerSelectionFontFace) elements.designerSelectionFontFace.value = effective.fontFace;
  if (elements.designerSelectionFontSize && document.activeElement !== elements.designerSelectionFontSize) elements.designerSelectionFontSize.value = String(effective.fontSize);
  if (elements.designerSelectionBold) {
    elements.designerSelectionBold.classList.toggle("active", effective.bold);
    elements.designerSelectionBold.setAttribute("aria-pressed", String(effective.bold));
  }
  if (elements.designerSelectionItalic) {
    elements.designerSelectionItalic.classList.toggle("active", effective.italic);
    elements.designerSelectionItalic.setAttribute("aria-pressed", String(effective.italic));
  }
  if (elements.designerSelectionColorPicker) renderColorPicker(elements.designerSelectionColorPicker, effective.color, (color) => applyInlineFormattingProperty("color", color));
}

function formatsEqualValue(prop, a, b) {
  if (prop === "color") return normalizeColor(a) === normalizeColor(b);
  if (prop === "fontSize") return Number(a) === Number(b);
  return a === b;
}

function inlineFormattingOptions(found) {
  const { selection, object, target } = found;
  const context = selection.kind === "repeatedColumn" ? blockContext(object?.block) : target?.collection || target?.content?.context;
  const selector = selection.kind === "individual" ? target?.selector : selection.kind === "repeatedColumn" && !isRecordBlock(object?.block) ? { slot: 1 } : null;
  return { selection, object, handednessGroup: conditionalFormattingGroup(DESIGNER_SAMPLE_MODEL, context, selector) };
}

function applyInlineFormattingProperty(prop, value) {
  const found = currentInlineFormattingTarget();
  if (!found) return;
  const options = inlineFormattingOptions(found);
  const defaults = defaultFormattingForTarget(found.target, options);
  const override = { ...(found.target.formattingOverride || {}) };
  const conditionalVariesByRow = found.selection.kind === "repeatedColumn" && options.handednessGroup && conditionalFormattingEnabled(selectedLayout() || {}, options.handednessGroup);
  if (!conditionalVariesByRow && formatsEqualValue(prop, value, defaults[prop])) delete override[prop];
  else override[prop] = prop === "fontSize" ? Number(value) : prop === "color" ? normalizeColor(value) : value;
  if (Object.keys(override).length) found.target.formattingOverride = override;
  else delete found.target.formattingOverride;
  markDesignerObjectChanged();
  updateDesignerFormattingSummary(found.target, found.selection, found.object);
}

function toggleInlineFormattingProperty(prop) {
  const found = currentInlineFormattingTarget();
  if (!found) return;
  const current = effectiveFormatting(found.target, inlineFormattingOptions(found));
  applyInlineFormattingProperty(prop, !current[prop]);
}

function restoreInlineFormattingDefaults() {
  const found = currentInlineFormattingTarget();
  if (!found) return;
  delete found.target.formattingOverride;
  markDesignerObjectChanged();
  updateDesignerFormattingSummary(found.target, found.selection, found.object);
}

function wireFormattingFontSizeInput() {
  const input = elements.designerSelectionFontSize;
  if (!input) return;
  const menu = document.querySelector("#designer-font-size-menu");
  let original = "";
  input.addEventListener("focus", () => { original = input.value; });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      input.value = original;
      input.blur();
    }
  });
  input.addEventListener("blur", () => {
    const size = Number(input.value);
    if (!Number.isFinite(size) || size <= 0 || size > 144) {
      const found = currentInlineFormattingTarget();
      if (found) input.value = String(effectiveFormatting(found.target, inlineFormattingOptions(found)).fontSize);
      return;
    }
    if (String(size) === String(Number(original))) return;
    applyInlineFormattingProperty("fontSize", size);
  });
  menu?.querySelectorAll("[data-font-size]").forEach((button) => {
    button.addEventListener("click", () => {
      const size = Number(button.dataset.fontSize);
      if (!Number.isFinite(size)) return;
      input.value = String(size);
      menu.open = false;
      applyInlineFormattingProperty("fontSize", size);
    });
  });
}

function renderColorPicker(container, value, onChange) {
  if (!container) return;
  const normalized = normalizeColor(value);
  container.replaceChildren();
  const details = document.createElement("details");
  details.className = "scorecard-color-picker";
  details.dataset.value = normalized;
  const summary = document.createElement("summary");
  summary.className = "scorecard-color-summary";
  summary.setAttribute("aria-label", `Text color: ${colorDisplayName(normalized)}`);
  const chip = document.createElement("span"); chip.className = "scorecard-color-chip"; chip.style.backgroundColor = normalized;
  const caret = document.createElement("span"); caret.className = "scorecard-color-caret"; caret.textContent = "▾";
  summary.append(chip, caret);
  const panel = document.createElement("div"); panel.className = "scorecard-color-panel";
  const swatches = document.createElement("div"); swatches.className = "scorecard-color-swatches";
  for (const swatch of COLOR_SWATCHES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scorecard-color-swatch";
    button.style.backgroundColor = swatch.value;
    button.title = swatch.name;
    button.setAttribute("aria-label", swatch.name);
    button.classList.toggle("selected", swatch.value === normalized);
    button.addEventListener("click", () => { details.open = false; onChange?.(swatch.value); });
    swatches.append(button);
  }
  const custom = document.createElement("button"); custom.type = "button"; custom.className = "scorecard-color-custom"; custom.textContent = "Custom Color…";
  const native = document.createElement("input"); native.type = "color"; native.value = normalized; native.className = "scorecard-color-native"; native.tabIndex = -1;
  custom.addEventListener("click", () => native.click());
  native.addEventListener("input", () => { details.open = false; onChange?.(native.value); });
  panel.append(swatches, custom, native); details.append(summary, panel); container.append(details);
}

function createLayoutFormattingRow(group, value) {
  const row = document.createElement("div"); row.className = "layout-formatting-row"; row.dataset.group = group.id;
  const title = document.createElement("strong"); title.textContent = group.label; row.append(title);
  const faceLabel = document.createElement("label"); faceLabel.textContent = "Font"; const face = document.createElement("select"); face.dataset.prop = "fontFace";
  for (const name of FONT_FACES) { const option = document.createElement("option"); option.value = name; option.textContent = name; face.append(option); }
  face.value = value.fontFace; faceLabel.append(face); row.append(faceLabel);
  const sizeLabel = document.createElement("label"); sizeLabel.textContent = "Size"; const size = document.createElement("input"); size.type = "number"; size.min = "1"; size.max = "144"; size.step = "0.5"; size.value = value.fontSize; size.dataset.prop = "fontSize"; size.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); size.blur(); } }); sizeLabel.append(size); row.append(sizeLabel);
  const colorLabel = document.createElement("label"); colorLabel.textContent = "Color"; const colorHost = document.createElement("div"); colorHost.dataset.prop = "color"; renderLayoutColorHost(colorHost, value.color); colorLabel.append(colorHost); row.append(colorLabel);
  const boldLabel = document.createElement("label"); boldLabel.className = "check-row"; const bold = document.createElement("input"); bold.type = "checkbox"; bold.checked = value.bold; bold.dataset.prop = "bold"; boldLabel.append(bold, document.createTextNode("Bold")); row.append(boldLabel);
  const italicLabel = document.createElement("label"); italicLabel.className = "check-row"; const italic = document.createElement("input"); italic.type = "checkbox"; italic.checked = value.italic; italic.dataset.prop = "italic"; italicLabel.append(italic, document.createTextNode("Italic")); row.append(italicLabel);
  return row;
}

function renderLayoutColorHost(host, value) {
  host.dataset.value = normalizeColor(value);
  renderColorPicker(host, value, (next) => renderLayoutColorHost(host, next));
}

function createConditionalFormattingSection(kind, title, text, enabled, groups, values) {
  const section = document.createElement("section"); section.className = "layout-conditional-section";
  const heading = document.createElement("div"); heading.className = "layout-conditional-heading";
  const copy = document.createElement("div"); const strong = document.createElement("strong"); strong.textContent = title; copy.append(strong);
  const label = document.createElement("label"); label.className = "layout-conditional-toggle"; const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.dataset.conditional = kind; checkbox.checked = enabled; label.append(checkbox, document.createTextNode(text));
  heading.append(copy, label); section.append(heading);
  const rows = document.createElement("div"); rows.className = "layout-conditional-rows"; rows.hidden = !enabled;
  for (const group of groups) rows.append(createLayoutFormattingRow(group, values[group.id]));
  checkbox.addEventListener("change", () => { rows.hidden = !checkbox.checked; });
  section.append(rows);
  return section;
}

function renderLayoutFormattingEditor(values = layoutFormattingDefaults(), conditional = layoutConditionalFormatting()) {
  if (!elements.layoutFormattingGrid) return;
  elements.layoutFormattingGrid.replaceChildren();
  for (const group of FORMAT_GROUPS.filter((item) => item.kind === "base")) elements.layoutFormattingGrid.append(createLayoutFormattingRow(group, values[group.id]));
  elements.layoutFormattingGrid.append(createConditionalFormattingSection("hitters", "Hitter Conditional Formatting", "Format hitters according to their batting side (Left, Right, Switch)", conditional.hitters, FORMAT_GROUPS.filter((item) => item.kind === "hitter"), values));
  elements.layoutFormattingGrid.append(createConditionalFormattingSection("pitchers", "Pitcher Conditional Formatting", "Format pitchers according to their throwing arm (Left, Right, Switch)", conditional.pitchers, FORMAT_GROUPS.filter((item) => item.kind === "pitcher"), values));
}

function openLayoutFormattingDialog() {
  if (!selectedLayout()) return setLayoutMessage("Open a layout before changing Layout Settings.", true);
  renderLayoutFormattingEditor();
  elements.layoutFormattingDialog?.showModal();
}

function readLayoutFormattingEditor() {
  const values = appFormattingDefaults();
  for (const row of elements.layoutFormattingGrid?.querySelectorAll(".layout-formatting-row") || []) {
    const id = row.dataset.group; const current = {};
    for (const input of row.querySelectorAll("[data-prop]")) {
      if (input.dataset.prop === "color") current.color = input.dataset.value;
      else current[input.dataset.prop] = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value) : input.value;
    }
    values[id] = mergeFormat(values[id], current);
  }
  const conditional = appConditionalFormattingDefaults();
  for (const input of elements.layoutFormattingGrid?.querySelectorAll("[data-conditional]") || []) conditional[input.dataset.conditional] = input.checked;
  return { values, conditional };
}

async function saveLayoutFormattingDefaults() {
  const layout = selectedLayout(); if (!layout) return;
  const editor = readLayoutFormattingEditor();
  layout.formattingDefaults = editor.values;
  layout.conditionalFormatting = editor.conditional;
  layout.updatedAt = new Date().toISOString(); await saveLayout(layout);
  elements.layoutFormattingDialog?.close(); renderDesignerOverlay(); renderDesignerSelectionInspector(); renderDesignerMappingList(); renderDesignerBlockList(); renderDesignerIndividualList();
  setDesignerMessage("Layout formatting defaults saved.");
}

function resetLayoutFormattingDefaults() { renderLayoutFormattingEditor(appFormattingDefaults(), appConditionalFormattingDefaults()); }

function handValueForContext(model, context, selector) {
  let id=null;
  if (context==="away.lineup") id="away.lineup[].player.bats"; else if(context==="home.lineup") id="home.lineup[].player.bats"; else if(context==="away.bench") id="away.bench[].player.bats"; else if(context==="home.bench") id="home.bench[].player.bats"; else if(context==="away.bullpen") id="away.bullpen[].player.throws"; else if(context==="home.bullpen") id="home.bullpen[].player.throws"; else if(context==="away.startingPitcher") id="away.startingPitcher.player.throws"; else if(context==="home.startingPitcher") id="home.startingPitcher.player.throws";
  if(!id)return null; const resolution=resolveField(model,id,selector); return resolution?.value ?? null;
}
function conditionalFormattingGroup(model, context, selector){return handednessGroup(context,handValueForContext(model,context,selector));}

function wireCommittedInspectorInput(element, apply, options = {}) {
  if (!element) return;
  let original = "";
  let cancelled = false;
  let pointerAdjusting = false;
  element.addEventListener("focus", () => { original = element.value; cancelled = false; });
  if (element.type === "number") {
    element.addEventListener("pointerdown", () => { pointerAdjusting = true; });
    window.addEventListener("pointerup", () => { pointerAdjusting = false; }, { passive: true });
    element.addEventListener("input", () => { if (pointerAdjusting) { apply(); original = element.value; } });
  }
  element.addEventListener("keydown", (event) => {
    if (element.type === "number" && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      window.setTimeout(() => { apply(); original = element.value; }, 0);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelled = true;
      element.value = original;
      element.blur();
      return;
    }
    if (event.key === "Enter" && !options.multiline) {
      event.preventDefault();
      element.blur();
      return;
    }
    if (event.key === "Enter" && options.multiline && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      element.blur();
    }
  });
  element.addEventListener("blur", () => {
    if (cancelled) { cancelled = false; return; }
    if (element.value === original) return;
    apply();
    original = element.value;
  });
}

function applyDesignerInspectorPosition() {
  const selection = state.designerSelection, object = locateDesignerObject(selection);
  if (!selection || !object) return;
  const width = state.designerPageWidthPoints || 1, height = state.designerPageHeightPoints || 1;
  const x = Number(elements.designerSelectionX.value), y = Number(elements.designerSelectionY.value);
  if (selection.kind === "mapping" || selection.kind === "individual") {
    if (Number.isFinite(x)) object.xPercent = clamp(x / width, 0, 1);
    if (Number.isFinite(y)) object.yPercent = clamp(y / height, 0, 1);
  } else if (selection.kind === "block") {
    if (object.geometry && Number.isFinite(y)) {
      const nextY = clamp(y / height, 0, 1), delta = nextY - Number(object.geometry.firstYPercent || 0);
      object.geometry.firstYPercent = nextY;
      if (Number.isFinite(Number(object.geometry.lastYPercent))) object.geometry.lastYPercent = clamp(Number(object.geometry.lastYPercent) + delta, 0, 1);
    }
    if (isSlotGridGeometry(object) && Number.isFinite(x)) {
      const nextX = clamp(x / width, 0, 1), delta = nextX - Number(object.geometry.firstXPercent || 0);
      object.geometry.firstXPercent = nextX;
      if (Number.isFinite(Number(object.geometry.lastXPercent))) object.geometry.lastXPercent = clamp(Number(object.geometry.lastXPercent) + delta, 0, 1);
    }
  } else if (selection.kind === "repeatedColumn" && Number.isFinite(x)) {
    if (isSlotGridGeometry(object.block)) object.column.xOffsetPoints = x - (Number(object.block.geometry.firstXPercent || 0) * width);
    else object.column.xPercent = clamp(x / width, 0, 1);
  }
  markDesignerObjectChanged();
}

function applyDesignerInspectorFormatting() {
  const selection = state.designerSelection, object = locateDesignerObject(selection);
  if (!selection || !object || selection.kind === "block") return;
  const target = selection.kind === "repeatedColumn" ? object.column : object;
  const alignment = elements.designerSelectionAlignment.value;
  if (["left", "center", "right"].includes(alignment)) { target.alignment = alignment; target.anchor = `baseline-${alignment}`; }
  const definition = getFieldDefinition(target.field || target.content?.field);
  if (definition?.formatKind === "playerName") {
    target.content = target.content || { type: "field", field: target.field };
    target.content.format = { ...(target.content.format || {}), nameFormat: elements.designerSelectionNameFormat.value || "full" };
  }
  markDesignerObjectChanged();
}

function applyDesignerInspectorTemplate() {
  const selection = state.designerSelection, object = locateDesignerObject(selection);
  const target = selection?.kind === "repeatedColumn" ? object?.column : object;
  if (!["mapping", "repeatedColumn"].includes(selection?.kind) || target?.content?.type !== "template") return;
  target.content.template = elements.designerSelectionTemplate.value;
  markDesignerObjectChanged();
}

function markDesignerObjectChanged() {
  const layout = selectedLayout(); if (!layout) return;
  layout.updatedAt = new Date().toISOString();
  renderDesignerOverlay();
  renderDesignerMappingList();
  renderDesignerBlockList();
  renderDesignerIndividualList();
  renderDesignerPalette();
  scheduleDesignerSave();
}

function scheduleDesignerSave() {
  window.clearTimeout(state.designerSaveTimer);
  state.designerSaveTimer = window.setTimeout(async () => {
    const layout = selectedLayout(); if (!layout) return;
    try { await saveLayout(layout); }
    catch (error) { setDesignerMessage(errorMessage(error, "Designer changes could not be saved."), true); }
  }, 250);
}

function wireDesignerMarker(marker, selection) {
  marker.addEventListener("click", (event) => { event.stopPropagation(); selectDesignerObject(selection); });
  marker.addEventListener("pointerdown", (event) => beginDesignerDrag(event, selection));
}

function beginDesignerDrag(event, selection) {
  if (state.designerPlacing || event.button !== 0) return;
  const object = locateDesignerObject(selection); if (!object) return;
  event.stopPropagation(); event.preventDefault();
  selectDesignerObject(selection);
  const anchor = designerSelectionAnchor(selection, object);
  if (!anchor.canX && !anchor.canY) return;
  state.designerDrag = { selection: { ...selection }, startClientX: event.clientX, startClientY: event.clientY, startX: anchor.x, startY: anchor.y, canX: anchor.canX, canY: anchor.canY };
  document.addEventListener("pointermove", handleDesignerDragMove);
  document.addEventListener("pointerup", endDesignerDrag, { once: true });
}

function handleDesignerDragMove(event) {
  const drag = state.designerDrag; if (!drag) return;
  const scale = Math.max(state.designerRenderScale, .0001);
  if (drag.canX && drag.startX != null) elements.designerSelectionX.value = (drag.startX + ((event.clientX - drag.startClientX) / scale)).toFixed(1);
  if (drag.canY && drag.startY != null) elements.designerSelectionY.value = (drag.startY + ((event.clientY - drag.startClientY) / scale)).toFixed(1);
  applyDesignerInspectorPosition();
}

function endDesignerDrag() {
  document.removeEventListener("pointermove", handleDesignerDragMove);
  state.designerDrag = null;
  scheduleDesignerSave();
}

function handleDesignerKeyboard(event) {
  const designer = document.querySelector('[data-view="designer"]');
  if (!designer || designer.hidden) return;
  const tag = document.activeElement?.tagName;
  if (event.key === "Escape") { event.preventDefault(); if (state.designerPlacing) cancelDesignerPlacement(); clearDesignerSelection(); return; }
  if (!state.designerSelection) return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
  if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); deleteSelectedDesignerObject(); return; }
  const deltas = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] };
  if (!deltas[event.key]) return;
  event.preventDefault();
  const step = event.shiftKey ? 5 : 0.5;
  const [dx,dy] = deltas[event.key];
  const anchor = designerSelectionAnchor(state.designerSelection, locateDesignerObject());
  if (anchor.canX && anchor.x != null) elements.designerSelectionX.value = (anchor.x + dx*step).toFixed(1);
  if (anchor.canY && anchor.y != null) elements.designerSelectionY.value = (anchor.y + dy*step).toFixed(1);
  applyDesignerInspectorPosition();
}

async function deleteSelectedDesignerObject() {
  const selection = state.designerSelection; if (!selection) return;
  if (selection.kind === "mapping") return deleteDesignerMapping(selection.id);
  if (selection.kind === "individual" || selection.kind === "individualWorkspace") {
    const object = locateDesignerObject(selection);
    return deleteDesignerIndividualWorkspace(object?.collection);
  }
  if (selection.kind === "repeatedColumn" || selection.kind === "block") {
    const blockId = selection.kind === "block" ? selection.blockId : selection.blockId;
    if (elements.designerBlockSelect) elements.designerBlockSelect.value = blockId;
    return deleteSelectedDesignerBlock();
  }
}

async function removeSelectedDesignerChild() {
  const selection = state.designerSelection;
  if (selection?.kind === "repeatedColumn") return deleteDesignerBlockColumn(selection.blockId, selection.columnId);
  if (selection?.kind === "individual") return deleteDesignerIndividualMapping(selection.id);
}

async function deleteDesignerIndividualWorkspace(collection) {
  const layout = selectedLayout();
  if (!layout || !collection) return;
  const count = (layout.individualMappings || []).filter((mapping) => mapping.collection === collection).length;
  if (!count) return;
  if (!window.confirm(`Delete the ${collectionDisplayLabel(collection)} Individual Placement and all ${count} placed item${count === 1 ? "" : "s"}?`)) return;
  layout.individualMappings = (layout.individualMappings || []).filter((mapping) => mapping.collection !== collection);
  layout.updatedAt = new Date().toISOString();
  try {
    await saveLayout(layout);
    renderDesignerOverlay();
    renderDesignerIndividualList();
    clearDesignerSelection({ render: false });
    renderDesignerPalette();
    renderDesignerSelectionInspector();
    setDesignerMessage("Individual Placement deleted.");
    await refreshLayouts();
    state.selectedLayoutId = layout.id;
  } catch (error) {
    setDesignerMessage(errorMessage(error, "The Individual Placement could not be deleted."), true);
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
    const fontCache = await embedFormattingFonts(pdfDoc);
    const pages = pdfDoc.getPages();
    const skipped = [];
    const overflowBlocks = [];
    let missingCount = 0;

    for (const mapping of mappings) {
      const page = pages[mapping.pageIndex];
      if (!page) { skipped.push(mapping.content?.type === "template" ? "text template" : mapping.field); continue; }
      if (mapping.content?.type === "template") {
      const text = resolveTemplateText(mapping.content.template, model, mapping.content.context);
        if (!text) continue;
        drawAlignedPdfText(page, fontCache, text, effectiveFormatting(mapping, { layout }), mapping.xPercent, mapping.yPercent, mapping.alignment || "left");
        continue;
      }
      const definition = getFieldDefinition(mapping.field);
      if (!definition) { skipped.push(mapping.field); continue; }
      const resolution = resolveField(model, mapping.field);
      const text = formatFieldValue(definition, resolution, model, mapping.content?.format || {});
      if (!text) {
        if (["unsupported", "error"].includes(resolution.state)) skipped.push(mapping.field);
        else if (["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
        continue;
      }
      drawAlignedPdfText(page, fontCache, text, effectiveFormatting(mapping, { layout }), mapping.xPercent, mapping.yPercent, mapping.alignment || "left");
    }

    const emptyBlocks = [];
    for (const block of repeatedBlocks) {
      if (!block.geometry || !Number.isInteger(block.pageIndex)) { skipped.push(`${block.collection} block geometry`); continue; }
      if (!(block.columns || []).length) { emptyBlocks.push(blockLabel(block)); continue; }
      const page = pages[block.pageIndex];
      if (!page) { skipped.push(`${block.collection} block page`); continue; }
      if (!isRecordBlock(block) && collectionHasOverflow(model, block.collection, block.capacity)) overflowBlocks.push(blockLabel(block));
      const { width, height } = page.getSize();
      for (let slotIndex = 0; slotIndex < block.capacity; slotIndex += 1) {
        const slot = isSlotGridGeometry(block)
          ? repeatedSlotPosition(block, slotIndex, width, height)
          : { xPercent: null, yPercent: repeatedRowYPercent(block, slotIndex, height) };
        for (const column of block.columns || []) {
          const content = column.content || { type: "field", field: column.field };
          const selector = isRecordBlock(block) ? null : { slot: slotIndex + 1 };
          const definition = content.type === "field" ? getFieldDefinition(content.field || column.field) : null;
          if (content.type === "field" && (!definition || !fieldsForRecordContext(blockContext(block)).some((entry) => entry.id === definition.id))) { skipped.push(content.field || column.field || "slot field"); continue; }
          const resolution = definition ? resolveField(model, definition.id, selector) : null;
          const text = resolveSlotContent(content, model, blockContext(block), selector);
          if (!text) {
            if (resolution && ["unsupported", "error"].includes(resolution.state)) skipped.push(definition.id);
            else if (resolution && ["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
            continue;
          }
          const xPercent = isSlotGridGeometry(block)
            ? slot.xPercent + ((Number(column.xOffsetPoints) || 0) / width)
            : column.xPercent;
          const conditionalGroup = conditionalFormattingGroup(model, blockContext(block), selector);
          const format = effectiveFormatting(column, { layout, group: formattingGroupForContext(blockContext(block)), handednessGroup: conditionalGroup });
          drawAlignedPdfText(page, fontCache, text, format, xPercent, slot.yPercent, column.alignment || "left");
        }
      }
    }

    for (const mapping of individualMappings) {
      const page = pages[mapping.pageIndex];
      if (!page) { skipped.push(`${mapping.collection} individual mapping page`); continue; }
      const definition = getFieldDefinition(mapping.field);
      if (!definition || definition.cardinality !== "repeated" || definition.collection !== mapping.collection) { skipped.push(mapping.field || "individual field"); continue; }
      const resolution = resolveField(model, mapping.field, mapping.selector);
      const text = formatFieldValue(definition, resolution, model, mapping.content?.format || {});
      if (!text) {
        if (["unsupported", "error"].includes(resolution.state)) skipped.push(mapping.field);
        else if (["missing", "notRequested", "partial"].includes(resolution.state)) missingCount += 1;
        continue;
      }
      const conditionalGroup = conditionalFormattingGroup(model, mapping.collection, mapping.selector);
      const format = effectiveFormatting(mapping, { layout, group: formattingGroupForContext(mapping.collection), handednessGroup: conditionalGroup });
      drawAlignedPdfText(page, fontCache, text, format, mapping.xPercent, mapping.yPercent, mapping.alignment || "left");
    }

    const outputBytes = await pdfDoc.save();
    const blob = new Blob([outputBytes], { type: "application/pdf" });
    const selected = state.schedule.find((game) => game.gamePk === state.selectedGamePk);
    const filename = buildGeneratedFilename(layout, selected);
    downloadBlob(blob, filename);
    const notices = [];
    if (missingCount) notices.push(`${missingCount} mapped value(s) were unavailable and left blank.`);
    if (overflowBlocks.length) notices.push(`Overflow: ${[...new Set(overflowBlocks)].join(", ")} contains player(s) beyond the layout capacity.`);
    if (emptyBlocks.length) notices.push(`Empty repeated layout${emptyBlocks.length === 1 ? "" : "s"} skipped: ${[...new Set(emptyBlocks)].join(", ")}. Add at least one slot field to render ${emptyBlocks.length === 1 ? "it" : "them"}.`);
    if (skipped.length) notices.push(`${skipped.length} unsupported/error mapping(s) were skipped.`);
    setGenerateMessage(`Generated ${filename}.${notices.length ? ` ${notices.join(" ")}` : ""}`, skipped.length > 0 || overflowBlocks.length > 0);
  } catch (error) {
    console.error("Unable to generate PDF:", error);
    setGenerateMessage(errorMessage(error, "The PDF could not be generated."), true);
  } finally {
    elements.designerGenerateButton.disabled = false;
  }
}

async function embedFormattingFonts(pdfDoc) {
  const S = globalThis.PDFLib.StandardFonts;
  const specs = {
    "Helvetica|0|0": S.Helvetica, "Helvetica|1|0": S.HelveticaBold, "Helvetica|0|1": S.HelveticaOblique, "Helvetica|1|1": S.HelveticaBoldOblique,
    "Times|0|0": S.TimesRoman, "Times|1|0": S.TimesRomanBold, "Times|0|1": S.TimesRomanItalic, "Times|1|1": S.TimesRomanBoldItalic,
    "Courier|0|0": S.Courier, "Courier|1|0": S.CourierBold, "Courier|0|1": S.CourierOblique, "Courier|1|1": S.CourierBoldOblique
  };
  const cache = {};
  for (const [key, standardFont] of Object.entries(specs)) cache[key] = await pdfDoc.embedFont(standardFont);
  return cache;
}

function pdfFontForFormat(fontCache, format) {
  const key = `${format.fontFace || "Helvetica"}|${format.bold ? 1 : 0}|${format.italic ? 1 : 0}`;
  return fontCache[key] || fontCache["Helvetica|0|0"];
}

function drawAlignedPdfText(page, fontCache, text, format, xPercent, yPercent, alignment = "left") {
  const size = Number(format?.fontSize) || 10;
  const font = pdfFontForFormat(fontCache, format || {});
  const [r, g, b] = hexToRgb01(format?.color || "#000000");
  const { width, height } = page.getSize();
  const anchorX = width * clamp(Number(xPercent) || 0, 0, 1);
  const anchorY = height * (1 - clamp(Number(yPercent) || 0, 0, 1));
  const lines = String(text ?? "").split(/\r\n|\r|\n/);
  const lineHeight = size * 1.2;

  lines.forEach((line, lineIndex) => {
    if (!line) return;
    const textWidth = font.widthOfTextAtSize(line, size);
    const x = alignment === "right" ? anchorX - textWidth : alignment === "center" ? anchorX - textWidth / 2 : anchorX;
    const y = anchorY - lineIndex * lineHeight;
    page.drawText(line, { x, y, size, font, color: globalThis.PDFLib.rgb(r, g, b) });
  });
}

function collectLayoutFieldIds(layout) {
  const ids = [];
  for (const mapping of layout?.mappings || []) {
    if (mapping.content?.type === "template") ids.push(...templateFieldIds(mapping.content.template, mapping.content.context));
    else if (mapping.field) ids.push(canonicalFieldId(mapping.field));
  }
  for (const block of layout?.repeatedBlocks || []) for (const column of block.columns || []) ids.push(...slotContentFieldIds(column.content || { type: "field", field: column.field }, blockContext(block)));
  for (const mapping of layout?.individualMappings || []) if (mapping.field) ids.push(canonicalFieldId(mapping.field));
  return ids;
}

async function buildModelForMappings(fieldIds, expectedGameKey) {
  return hydrateSelectedGameModel(fieldIds, expectedGameKey);
}

async function hydrateSelectedGameModel(fieldIds, expectedGameKey) {
  const requirements = sourceRequirementsForFields(fieldIds);
  const game = currentScheduleGame();
  const feed = state.selectedFeed;
  if (!feed || !game) throw new Error("No selected game data is available.");

  const gd = feed.gameData || {};
  const officialDate = gd.datetime?.officialDate || game.officialDate || state.selectedDate || getLocalDateString();
  const season = Number(gd.game?.season || officialDate.slice(0, 4));
  const supplemental = {};

  if (requirements.has("coaches")) {
    const awayId = gd.teams?.away?.id || game.awayTeamId;
    const homeId = gd.teams?.home?.id || game.homeTeamId;
    const coachResults = await Promise.allSettled([
      awayId ? fetchTeamCoaches(awayId, officialDate, season) : Promise.resolve(null),
      homeId ? fetchTeamCoaches(homeId, officialDate, season) : Promise.resolve(null)
    ]);
    const coaches = {
      away: coachResults[0]?.status === "fulfilled" ? coachResults[0].value : null,
      home: coachResults[1]?.status === "fulfilled" ? coachResults[1].value : null
    };
    if (coaches.away || coaches.home) supplemental.coaches = coaches;
  }

  if (requirements.has("standings")) {
    const leagueIds = [...new Set([gd.teams?.away?.league?.id, gd.teams?.home?.league?.id].filter(Boolean))];
    const standingsResults = await Promise.allSettled(leagueIds.map((id) => fetchLeagueStandings(id, officialDate, season)));
    const standingsPayloads = standingsResults.filter((result) => result.status === "fulfilled" && result.value).map((result) => result.value);
    if (standingsPayloads.length) supplemental.standingsPayloads = standingsPayloads;
  }

  if (String(state.selectedGamePk || "") !== String(expectedGameKey)) throw new Error("Game selection changed during supplemental hydration.");
  const model = normalizePregameData(feed, supplemental, game);
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
