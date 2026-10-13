# Scorecard Studio v0.4.0 — Build 004

**Build theme:** Compact, task-oriented interface refinement  
**Baseline:** accepted v0.4.0 Build 003.5  
**Protected product contract:** `README.md`

## Product objective

Build 004 replaces development-shaped presentation with a compact user workflow while preserving the application behavior already accepted through Builds 001–003. The work focuses on information hierarchy, proximity between an object and its actions, deliberate navigation, and progressive disclosure. It does not reopen normalized data, saved-layout compatibility, PDF output, backup format version 1, or per-layout pitcher grouping.

## Build sequence

1. **004.1 — UI inventory and design foundation:** reconcile the current DOM, rendering behavior, field-surface contract, and shared styles against the accepted refinement list; establish compact component and workflow rules before runtime changes.
2. **004.2 — Navigation and app shell:** replace the persistent six-entry sidebar with four primary destinations, retire the unused Generate placeholder, make Designer contextual to a saved layout, and retain accessible skip navigation.
3. **004.3 — Home game selection:** remove arbitrary level-schedule auto-selection, add immediate search filtering, and keep schedule choices and selected-game actions together.
4. **004.4 — Layout Library workflow:** replace the always-open creation form and scroll-to-detail behavior with a compact library, local actions, and a focused creation view.
5. **004.5 — Layout Settings and Field Palette:** use one consistent settings frame, add collapsible/searchable field groups, prove registry coverage, and add optional Home/Away mirrored selection.
6. **004.6 — Game Day information architecture:** add remembered Compact, Standard, and Advanced detail levels; reorganize research content; apply season context independently; remove engineering-facing success notices from the ordinary view.
7. **004.7 — Responsive, touch, and accessibility refinement:** verify compact desktop and narrow layouts, modal containment, keyboard use, reduced motion, and practical Designer touch improvements.
8. **004.8 — Final Home and Game Day refinement:** tighten Home schedule controls and remove duplicated team/standings information across Game Day detail levels.
9. **004.9 — Regression and closure:** verify saved layouts, backups, historical/live games, MLB/MiLB browsing, PDF generation, themes, and supported browsers; package the accepted Build 004 result.

The sequence is dependency-aware rather than cosmetic. Navigation changes precede page redesign, the Layout Library precedes its settings workflow, and the Game Day preference follows the shared compact-surface and settings foundations.

---

## Build 004.1 — UI Inventory and Design Foundation

**Status:** Complete  
**Date:** 2026-10-10  
**Runtime identity:** unchanged at `0.4.0-dev • Build 003.5`

### Objective

Turn the accepted UI observations into an implementation-ready contract. Audit current surfaces and interaction paths, identify the specific causes of wasted space and displaced actions, establish compact shared presentation rules, and define later decimal-build boundaries without changing application behavior.

### Delivered documentation

- `docs/v0.4/V040_UI_FOUNDATION_AUDIT.md` records code-reconciled findings for the shell, Home, Game Day, Layout Library, Designer entry, Layout Settings, Field Palette, and portable preferences.
- `docs/v0.4/V040_UI_COMPONENT_CONTRACT.md` defines the shared hierarchy, density, navigation, dialog, disclosure, filtering, mirrored-selection, status, responsive, and accessibility rules later increments must follow.
- This file records the Build 004 sequence, boundaries, and Build 004.1 acceptance.

### Accepted product decisions

1. Home, Game Day, Layouts, and Settings are the four primary destinations.
2. Layout Designer is contextual work entered from a saved layout, not a fifth primary destination.
3. The disabled Generate placeholder has no product destination and will be removed.
4. Cards are reserved for independent objects or tasks. Internal groups use headings, separators, rows, tables, or disclosures rather than recursively nested cards.
5. A level schedule does not select its first game merely because results arrived. Favorite-team lookup may select an actual favorite-team game; general browsing waits for an explicit user choice.
6. Home schedule search filters visible results immediately without another network request.
7. Layout creation becomes a deliberate workflow rather than a permanently expanded form above the library.
8. Layout actions stay with their layout. Selecting or opening a record must not reveal controls by scrolling to a distant page region.
9. Layout Settings uses one consistently sized modal frame whose internal view changes between its summary and editors.
10. Field Palette categories are searchable and collapsible. Home/Away mirroring is enabled by default, optional, and limited to verified counterpart fields.
11. Compact, Standard, and Advanced are the working Game Day detail labels. The preference is remembered, but a quick local switch remains available.
12. Display density and season context are independent. Preseason, regular-season, and postseason relevance must not silently rewrite the chosen detail level.
13. Expected source success and build identity are not ordinary Game Day content. Actionable failures remain visible in user language; engineering provenance remains available to diagnostics and tests.
14. The current registry already assigns all 171 active fields to Game Day and 167 to Designer. Build 004.5 improves discovery and re-verifies rendering; it does not indiscriminately promote 52 compatibility-only fields.

### Protected boundaries

Build 004.1 changes no runtime source. Later increments must preserve unless separately approved:

- `scorecard-studio-backup` format version 1;
- IndexedDB schema and atomic restore behavior;
- normalized schema-v2 and source/API contracts;
- existing saved-layout resolution and legacy compatibility;
- per-layout pitcher-group behavior;
- PDF placement and generation semantics; and
- `README.md` as the v1 product-goal document.

The future Game Day detail preference is an ordinary JSON-safe extension of `appPreferencesV1` and therefore belongs in complete backups through the existing registered-setting contract. It does not justify a new backup envelope.

### Verification

- Current source contains five view states: four primary destinations plus contextual Designer.
- The shell contains six sidebar entries: the four accepted destinations, contextual Designer, and the unused Generate placeholder.
- Home currently calls `chooseInitialGame()` after every nonempty schedule result, which explains selection of an unrelated first game during general level browsing.
- Layout Library currently places creation controls in its first large card, each saved layout in a full-width row with one far-right Open button, and selected-layout controls in a separate lower card.
- Layout Settings currently uses one summary dialog and three child dialogs with content-driven dimensions.
- Current field evidence remains 223 resolvable definitions, 171 active definitions, and 167 Designer-eligible active definitions.
- `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Files changed

- `docs/v0.4/builds/Build_004.md`
- `docs/v0.4/V040_UI_FOUNDATION_AUDIT.md`
- `docs/v0.4/V040_UI_COMPONENT_CONTRACT.md`

No application source, metadata, cache identity, schema, fixture, test, saved layout, PDF behavior, or `README.md` changed.

### Build 004.1 acceptance

Build 004.1 is accepted when the audit and component contract explain every reported UI concern, identify its current implementation cause, define a bounded target behavior, and leave the accepted Build 003.5 runtime byte-for-byte untouched. Those conditions are satisfied.

### Next action

Proceed to Build 004.2. Implement the compact four-destination shell and contextual Designer entry without redesigning Home, Game Day, or Layout workflows in the same increment.

---

## Build 004.2 — Navigation and App Shell

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.2`

### Objective

Replace the persistent development-era sidebar with a compact application header, reduce primary navigation to the four real destinations, and make Layout Designer an explicitly contextual workflow without changing the contents or behavior of the destination pages.

### Delivered behavior

1. Desktop navigation now uses a compact sticky application header rather than permanently reserving 286 pixels for a sidebar.
2. Home, Game Day, Layouts, and Settings are the only primary destinations.
3. The unused disabled Generate placeholder is removed.
4. Layout Designer is removed from primary navigation. It remains available through Open Designer on the selected-layout workflow and returns to Layouts when closed.
5. Narrow layouts present the same four destinations in one equal-width navigation row beneath the compact brand/status row.
6. The current destination retains visible active state and `aria-current="page"` semantics in both themes.
7. Skip to main content remains the first keyboard bypass and continues to target the focusable main landmark.
8. Build identity remains quietly available beneath the application name for support, while build-number labels are removed from ordinary Game Day and Layout Library content.
9. Designer full-screen mode now hides the application header and its ordinary page topbar exactly as it previously hid the sidebar.

### Compatibility boundaries

- View identifiers and Home/Game Day/Layouts/Settings behavior are unchanged.
- A selected layout remains required before Designer can open.
- Layout storage, mappings, PDF templates, generation, backup/restore, normalized data, and API behavior are unchanged.
- `README.md` remains untouched.

### Verification

- 209 current v0.3/v0.4 automated checks pass, including three focused shell checks.
- Focused tests verify exactly four primary destinations, absence of the Generate and Designer navigation entries, contextual Designer entry/exit, responsive four-column navigation, skip navigation, user-facing section labels, and Build 004.2 identity.
- Existing appearance, startup accessibility, backup workflow, schema-v2 cutover, and Build 001 acceptance checks pass.
- The automated Chrome process could not start because the host GPU process terminated before page load, matching the previously documented runner limitation. No application browser failure was observed; the short manual smoke below remains required.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- current-identity regression tests
- `tests/v040-build004-shell.test.mjs`
- `tools/run-v040-browser-acceptance.mjs`
- `docs/v0.4/builds/Build_004.md`
- `docs/v0.4/builds/Build_004_2_CHECKPOINT.md`

Runtime dependency modules referenced by the changed application entry point are repackaged with the overlay to avoid a partial-cache-identity installation.

### Smoke test

1. Reload and confirm the left sidebar is gone and the top header contains Home, Game Day, Layouts, and Settings only.
2. Open each destination with the mouse, then repeat with Tab and Enter/Space; confirm the active destination remains clear.
3. Press Tab immediately after a reload and confirm Skip to main content still appears and works.
4. From Layouts, open an existing layout and enter Designer. Confirm the normal header disappears in the full-screen Designer and Close Layout Designer returns to Layouts.
5. Narrow the browser to roughly phone width. Confirm all four destinations remain usable on one row and the page has no horizontal overflow.
6. Repeat a quick navigation pass in both Light and Dark appearance.

### Next action

Smoke acceptance received. Proceed to Build 004.3: Home game selection, no arbitrary schedule selection, immediate filtering, and adjacent selected-game detail.

---

## Build 004.3 — Home Game Selection

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.3`

### Objective

Make general date-and-level browsing deliberate and compact: results must never choose an unrelated game for the user, local search must narrow the loaded schedule immediately, and the selected matchup must remain beside its actions on wide screens.

### Delivered behavior

1. Favorite-team startup still selects the returned favorite-team game when one exists.
2. General date-and-level schedules now open with no selected game. Game Day and scorecard actions appear only after the user explicitly chooses a matchup.
3. A local search filters the already-loaded schedule immediately by team name, available abbreviation, or league/group label.
4. Filtering performs no network request and never selects a game merely because one result remains.
5. Clearing search restores the loaded collection without changing an existing explicit selection.
6. Search-result counts update live, and a zero-match search has a distinct message from a date with no scheduled games.
7. Schedule choices and selected-game details use an adjacent two-column workspace on wide screens and a single stacked column on narrower screens.
8. The selected-game area has an intentional empty state rather than placeholder matchup data.
9. Home remains Schedule-only; roster, People, Feed, venue, standings, and other supplemental hydration still begins only from Game Day or scorecard generation.

### Compatibility boundaries

- Favorite-team storage and competition-level behavior are unchanged.
- Schedule endpoint scope and normalized game objects are unchanged.
- Explicit selection continues to drive the existing Game Day and PDF-generation paths.
- Layouts, PDF templates, backup/restore format, IndexedDB schema, normalized schema-v2, and field registry are unchanged.
- `README.md` remains untouched and byte-identical.

### Verification

- 213 applicable v0.3/v0.4 automated checks pass, including four focused Home-search and selection checks.
- Focused checks verify favorite-only automatic selection, explicit general-schedule selection, local selection-neutral filtering, zero-match state, responsive adjacency, Build 004.3 identity, and unchanged Schedule-only loading.
- JavaScript syntax checks pass for the application coordinator and Home helper module.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/v040-home.js`
- current-identity regression tests
- `tests/v040-build004-home-selection.test.mjs`
- `tools/run-v040-browser-acceptance.mjs`
- `docs/v0.4/builds/Build_004.md`
- `docs/v0.4/builds/Build_004_3_CHECKPOINT.md`

### Smoke test

1. Let the favorite-team Home view load. Confirm its actual game is selected automatically when scheduled.
2. Choose another date or level with multiple games. Confirm the schedule appears with **Choose a game** and no matchup is selected.
3. Type part of a team name and then a league name in **Find a game**. Confirm results narrow immediately and clearing the search restores them.
4. Enter a search with no matches. Confirm the page says no games match the search rather than claiming no games are scheduled.
5. Reduce the filter to one result. Confirm it is not selected until clicked.
6. Select a matchup. Confirm Game Day and scorecard generation still work, and that filtering afterward does not replace the chosen game.
7. Check one wide and one narrow window. Confirm the schedule/detail columns sit side by side when space permits and stack without horizontal overflow when narrow.

### Next action

Smoke acceptance received. Proceed to Build 004.4: compact Layout Library cards, local actions, and a focused layout-creation workflow.

---

## Build 004.4 — Layout Library Workflow

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.4`

### Objective

Replace the development-era Layouts page with a compact library whose actions remain attached to each saved layout, and move layout creation into a focused internal workflow rather than leaving the full creation form permanently expanded.

### Delivered behavior

1. Layouts now opens directly to the saved-layout library with one page-level **Create Layout** action.
2. The creation form lives in a separate internal Layouts view. **Back to Library** exits without writing and preserves the current draft; successful creation clears the draft and returns to the library with the new layout highlighted.
3. Saved layouts use compact responsive cards rather than full-width rows.
4. Every card keeps **Open Designer** and **Settings** beside the layout identity.
5. Duplicate, single-layout backup export, favorite selection, and confirmed deletion live in that card's accessible **More** menu.
6. Favorite state is visible on the owning layout card.
7. Opening a library action no longer scrolls to or eagerly renders a large PDF beneath the entire collection. The PDF is loaded only when Designer or an explicit PDF-dependent operation needs it.
8. Single-layout export reuses the accepted version-1 backup envelope and registered storage snapshot.
9. Routine IndexedDB success language is removed from visible primary content; failures and user-initiated results remain visible.

### Compatibility boundaries

- Existing layout IDs, mappings, palette settings, formatting, PDF-template records, and compatibility cleanup remain authoritative.
- Designer entry still requires a selected layout and loads the same stored PDF.
- Duplicate, favorite, delete, and Layout Settings behavior reuse their existing persistence functions.
- No IndexedDB schema, backup envelope, normalized data, API, field registry, or PDF-generation contract changed.
- `README.md` remains untouched and byte-identical.

### Verification

- 217 applicable v0.3/v0.4 automated checks pass, including four focused Layout Library workflow checks.
- Focused checks verify library-first presentation, focused creation, local card actions, absence of the displaced detail/PDF region, lazy PDF loading, direct version-1 export reuse, responsive menus, and Build 004.4 identity.
- JavaScript syntax validation passes.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- current-identity regression tests
- `tests/v040-build004-layout-library.test.mjs`
- `tools/run-v040-browser-acceptance.mjs`
- `docs/v0.4/builds/Build_004.md`
- `docs/v0.4/builds/Build_004_4_CHECKPOINT.md`

### Smoke test

1. Open **Layouts** and confirm the saved layouts appear immediately as compact cards; the full creation form should not be visible.
2. Choose **Create Layout**, enter a partial draft, then select **Back to Library**. Reopen creation and confirm the draft remains but nothing was saved.
3. Create a disposable layout from a PDF. Confirm the app returns to the library and visibly highlights the new card.
4. On an existing card, open **Designer**, then close Designer. Confirm you return to the library and the layout remains selected.
5. Open **Settings** from a card and confirm it applies to that layout. A quick name edit is a useful end-to-end check.
6. Use **More** to duplicate a layout, set one as favorite, and export a single-layout backup. Confirm each action affects the card on which it was invoked.
7. Delete the disposable layout and cancel once before confirming; verify cancellation preserves it and confirmation removes it.
8. Narrow the browser to phone width. Confirm the cards, primary actions, and expanded **More** menu remain usable without horizontal page overflow.

### Next action

Smoke acceptance received. Proceed to Build 004.5: one consistent Layout Settings frame, improved Field Palette discovery, registry-coverage verification, and optional mirrored Home/Away selection.

---

## Build 004.5 — Layout Settings and Field Palette

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.5`

### Objective

Replace the parent/child Layout Settings dialog stack with one stable workspace, improve discovery in the complete Designer field catalog, and make symmetric Home/Away field selection efficient without changing the field registry or any saved-layout contract.

### Delivered behavior

1. Layout Details, Field Palette, and Default Formatting now open as internal views inside one consistently sized Layout Settings dialog.
2. The dialog keeps one header, body, and footer frame. **Back to Layout Settings** returns to the summary without opening or repositioning another modal.
3. The dialog's Back, close, Escape, Save, and discard-confirmation paths preserve the existing unsaved-change protections.
4. Field Palette groups are collapsible and can be opened or closed together with **Expand All** and **Collapse All**.
5. Field search opens matching groups immediately and searches labels, categories, descriptions, and representative values.
6. **Mirror Home and Away selections** begins enabled each time the Field Palette editor opens. Selecting, deselecting, or using a group bulk action also applies the verified counterpart. Turning it off permits asymmetric layouts.
7. Pairing is built from compatible registry definitions once, rather than inferred from display text during interaction.
8. The active Designer catalog remains exactly 167 fields: 75 Away fields, 75 Home fields, and 17 non-side fields. All 150 side fields form 75 reciprocal pairs; no active side field is unpaired.

### Compatibility boundaries

- No field IDs, visibility tiers, sample values, layout records, palette modes, PDF mappings, or formatting values changed.
- Existing Standard and Custom palette selections load and save through the same layout properties.
- Mirroring is an editing convenience only. It does not retroactively alter a saved asymmetric selection, and it can be disabled before making a change.
- Layout and PDF-template storage, backup format version 1, normalized data, API behavior, and Designer rendering remain unchanged.
- `README.md` remains untouched and byte-identical.

### Verification

- 221 applicable v0.3/v0.4 automated checks pass, including four focused Layout Settings and Field Palette checks.
- The registry-derived audit proves 167 active Designer fields, 75 reciprocal Away/Home pairs, and zero unpaired side fields.
- Focused checks verify a single settings dialog, stable internal views, progressive disclosure, search behavior, default-on optional mirroring, and reciprocal selection behavior.
- JavaScript syntax validation passes for the application coordinator and field-palette helper.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/v040-field-palette.js`
- current-identity and accessibility regression tests
- `tests/v040-build004-field-palette.test.mjs`
- `tests/v040-build004-layout-settings.test.mjs`
- `tools/run-v040-browser-acceptance.mjs`
- `docs/v0.4/builds/Build_004.md`
- `docs/v0.4/builds/Build_004_5_CHECKPOINT.md`

### Smoke test

1. From a saved layout card, open **Settings**. Confirm the summary, Details, Field Palette, and Formatting all use one stable dialog rather than opening stacked modals.
2. Open **Layout Details**, change the description, save it, and confirm you return to the settings summary with the new description shown.
3. Reopen Details, make an unsaved change, choose **Back to Layout Settings**, cancel the discard prompt once, then discard. Confirm the edit is not saved and the outer dialog remains open.
4. Open **Field Palette**, search for a field term such as `ERA`, and confirm only matching groups and fields remain visible. Clear the search and try **Expand All** and **Collapse All**.
5. With mirroring enabled, change one Away field and confirm the corresponding Home field changes too. Save, reopen, and confirm both selections persisted.
6. Turn mirroring off, make one side different, save, and reopen. Confirm the asymmetric choice persists without altering the counterpart.
7. Open **Default Formatting**, make and save a harmless change, and confirm you return to the same settings summary. Reopen it to confirm the value persisted.
8. Check the settings dialog in a narrow browser window. Confirm the header, field controls, scrolling body, and footer actions remain usable without page-level horizontal overflow.

### Next action

Smoke acceptance received. Apply the Build 004.5a presentation correction before proceeding to Build 004.6.

---

## Build 004.5a — Field Palette Category Correction

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.5a`

### Acceptance correction

User smoke testing confirmed the Build 004.5 behavior but exposed four presentation issues: the shell close control occupied the center grid track when Back was hidden, mirrored categories remained separate cards, category bulk actions had dropped below their headings, and development-oriented category names remained visible.

### Delivered behavior

1. The Layout Settings close control is explicitly anchored to the top-right header column whether Back is visible or hidden.
2. Mirrored fields now use one full-width category card with permanent **Away** and **Home** columns.
3. The paired columns remain side by side at narrow widths so corresponding lineup, team, record, standings, personnel, pitcher, bench, and bullpen choices retain visual alignment.
4. **Select All** and **Deselect All** are restored to the category heading line. Their clicks no longer toggle the disclosure itself.
5. The Field Palette now presents ten user-facing categories:
   - Game Day Information
   - Venue Information
   - Team Information
   - Team Records
   - Team Standings
   - Team Personnel
   - Starting Pitchers
   - Starting Lineup
   - Bench
   - Bullpen
6. The two active variable-crew umpire fields are included in Game Day Information. The four retired fixed-position umpire compatibility fields remain excluded as before.

### Compatibility boundaries

- Category organization changes presentation only. Field IDs, registry categories, selection state, mirroring rules, saved layouts, and PDF mappings are unchanged.
- Existing asymmetric selections remain intact and visible in their respective Away/Home columns.
- No storage, backup, API, normalized-data, or PDF-generation contract changed.
- `README.md` remains untouched and byte-identical.

### Verification

- 222 applicable v0.3/v0.4 automated checks pass, including five focused Field Palette and Layout Settings checks.
- Focused checks verify the ten category labels, combined paired-category declarations, permanent two-column CSS, category-line bulk actions, top-right close placement, and unchanged 167-field/75-pair coverage.
- JavaScript syntax validation passes.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

1. Open a layout's Settings and confirm the close button sits at the top-right on both the summary and an editor view.
2. Open Field Palette and confirm the revised ten-category structure.
3. Expand Team Information and Starting Lineup. Confirm each is one card with Away and Home columns.
4. Narrow the window and confirm those columns remain side by side without page-level horizontal overflow.
5. Confirm **Select All** and **Deselect All** remain on each category heading and work without collapsing the card.
6. Confirm the two Umpire Crew fields appear under Game Day Information.
7. Repeat one mirrored and one mirror-disabled selection, save, and reopen to confirm both behaviors remain correct.

### Next action

Smoke acceptance received. Apply the Build 004.5b palette-clarity correction before proceeding to Build 004.6.

---

## Build 004.5b — Field Palette Clarity and Category Defaults

**Status:** Complete; user smoke test accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.5b`

### Acceptance correction

Build 004.5a confirmed the correct category structure and behavior, but user review showed that card ownership remained visually ambiguous—especially in dark mode—and that restoring defaults required resetting the entire palette even when only one category needed correction.

### Delivered behavior

1. Field Palette cards now use a stronger theme-aware outer boundary, shadow, accented header edge, tinted header surface, and separately defined content surface.
2. The Away/Home subheader remains visually connected to its category while clearly separating the two columns from the category heading.
3. Every category heading now includes **Standard Fields** before **Select All** and **Deselect All**.
4. **Standard Fields** restores only fields owned by that category: standard-tier fields are selected and custom-tier fields are cleared.
5. Fields in every other category remain untouched.
6. The category action disables when that category already matches its standard defaults.
7. The existing footer-level **Restore Standard Fields** action remains available for resetting the entire palette.

### Compatibility boundaries

- Category defaults come directly from each registry definition's existing `visibilityTier`; no duplicate default list was introduced.
- The action changes only the unsaved Field Palette draft until the user chooses Save.
- Existing mirroring behavior, field IDs, saved layouts, PDF mappings, storage, backup format, normalized data, and APIs remain unchanged.
- `README.md` remains untouched and byte-identical.

### Verification

- 224 applicable v0.3/v0.4 automated checks pass, including seven focused Field Palette and Layout Settings checks.
- Focused behavior proves category restore adds missing standard fields, removes custom fields in that category, preserves unrelated selections, and does not mutate its input set.
- Structural checks verify the per-category action, registry-derived standard IDs, dark/light themed card treatment, and retained combined-category layout.
- JavaScript syntax validation passes.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

1. Open Field Palette in dark mode and confirm each category header and its content read as one distinct card.
2. Repeat in light mode and confirm the distinction remains clear without excessive contrast.
3. In one category, create a nonstandard mix by changing both a standard and custom field.
4. Choose that category's **Standard Fields** action. Confirm its standard fields return, its custom fields clear, and another category remains unchanged.
5. Confirm **Standard Fields** becomes disabled when the category matches its defaults.
6. Confirm **Select All**, **Deselect All**, the footer-level global restore, mirroring, Save, and reopen behavior still work.

### Next action

Smoke acceptance received. Apply the Build 004.5c header correction before proceeding to Build 004.6.

---

## Build 004.5c — Layout Settings Header Correction

**Status:** Superseded by Build 004.5d during smoke testing  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.5c`

### Acceptance correction

Remove the redundant header-level **← Layout Settings** action from Details, Field Palette, and Default Formatting. Each editor already has a footer **Back to Layout Settings** action, while the shared close control exits the workflow.

### Delivered behavior

1. The redundant Back button is removed from markup, element bindings, and event wiring.
2. The shared header now uses two columns: editor identity on the left and the close X on the right.
3. Existing footer Back actions retain dirty-state confirmation and return to the settings summary.
4. The close X retains dirty-state confirmation and exits the complete Layout Settings workflow.

### Compatibility and verification

- No field, palette, formatting, saved-layout, PDF, storage, backup, normalized-data, or API behavior changed.
- 224 applicable v0.3/v0.4 automated checks pass.
- Focused checks verify the redundant control is absent and the heading/X occupy the correct header columns.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

Open each of Layout Details, Field Palette, and Default Formatting. Confirm the header contains only the editor identity and top-right close X, while **Back to Layout Settings** remains in the footer and still protects unsaved changes.

### Next action

Smoke testing exposed an incorrect shared-close behavior. Apply Build 004.5d before closing Build 004.5.

---

## Build 004.5d — Contextual Layout Settings Close Behavior

**Status:** Complete; smoke accepted  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 004.5d`

### Acceptance correction

The single-shell workflow reused one top-right X, but Build 004.5c treated it as an outer-workflow close in every view. In a child editor this incorrectly exited Layout Settings and returned to the Layout Library.

### Delivered behavior

1. In Layout Details, Field Palette, and Default Formatting, the top-right X returns to the parent Layout Settings summary.
2. Escape from a child editor follows the same child-to-parent boundary.
3. Each child footer **Back to Layout Settings** retains the same behavior.
4. On the parent Layout Settings summary, the top-right X and footer **Close** still exit the complete settings workflow.
5. Dirty child state still prompts before returning to the parent. Discard returns to the parent rather than closing the outer workflow.

### Compatibility and verification

- The correction changes navigation dispatch only. It does not alter saved settings, fields, formatting, layouts, PDFs, storage, backup data, normalized data, or APIs.
- 224 applicable v0.3/v0.4 automated checks pass.
- Focused checks require the shared X to use contextual dispatch and prohibit direct outer-close binding.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

1. From the parent summary, open each of the three child editors and choose its X. Confirm each returns to the parent summary.
2. Repeat using the footer Back action and Escape.
3. Make an unsaved child change, choose X, and test both Cancel and Discard. Confirm neither path unexpectedly exits the outer workflow.
4. From the parent summary, confirm its X and Close both exit to the Layout Library.

### Next action

Smoke acceptance received. Build 004.5 is closed. Proceed to Build 004.6.

---

## Build 004.6 — Game Day Information Architecture

**Status:** complete; user smoke accepted  
**Date:** 2026-10-11  
**Runtime identity:** `0.4.0-dev • Build 004.6`

### Objective

Turn Game Day into the configurable research companion defined in Build 004.1: a fast Compact orientation, a familiar Standard pregame reference, and a full Advanced research view. Preserve one hydrated model and make the detail choice a local presentation preference rather than a new data-loading mode.

### Delivered behavior

1. Compact, Standard, and Advanced form one maintained additive section hierarchy. Standard is the default for an installation without a saved choice.
2. The selector is always available on Game Day, switches immediately without a refetch, and remembers the last choice in the existing `appPreferencesV1` setting.
3. Complete backup/restore carries the choice through the already-generic registered setting; single-layout backup remains preference-isolated.
4. Compact retains overview, essential team context, lineups, and pitching. Standard adds bench, standings, officials, venue, and weather. Advanced adds staff, broader statistics, research scope, classification explanations, and technical source detail.
5. Spring/preseason, regular-season, postseason, and unknown competition context are derived from normalized game scope independently of the saved detail preference.
6. Expected source success and schema-version messages no longer occupy the ordinary interface. Partial failure remains visible as a concise user-facing availability notice.
7. Raw adapter outcomes remain available only in an Advanced, closed-by-default technical disclosure.
8. Game Day sections now share a flatter bordered research surface; team summaries and section content no longer repeat the full card-within-card treatment.

### Compatibility and verification

- Supplemental hydration, normalized data, lineage/source precedence, field registry, Layout Designer, live PDF, storage schema, and backup envelope are unchanged.
- Existing Game Day sections and IDs remain available; detail level controls visibility only.
- Focused tests cover additive membership, Standard defaulting, preference normalization, season context, source-detail disclosure, and the absence of engineering success notices.
- The cumulative v0.3/v0.4 suite passes.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

1. Open a selected game in Game Day. Confirm Standard is selected on first use and no “API loaded” or schema-success notice appears.
2. Choose Compact. Confirm the page immediately reduces to Overview, Teams, Starting Lineups, and Pitching without reloading data.
3. Choose Standard. Confirm Bench, Standings, Officials, and Venue & Weather return.
4. Choose Advanced. Confirm Managers & Coaching Staff and Research Context appear; open **Technical source details** and confirm it is closed by default.
5. Reload the app and return to Game Day. Confirm the last detail level is remembered.
6. If practical, check one spring/preseason or postseason game and confirm its season-context label changes without changing the selected detail level.
7. Confirm live PDF generation and the Layout Designer behave as before.

### Next action

After smoke acceptance, close Build 004.6 and proceed to the next Build 004 increment.

---

## Build 004.6a — Compact Game Day Research Sheet

**Status:** Complete; user smoke test requested  
**Date:** 2026-10-11  
**Runtime identity:** `0.4.0-dev • Build 004.6a`

### Objective

Apply the accepted Game Day review without changing hydration or normalized data: replace the oversized layered presentation with a dense research sheet, make each detail level control genuinely useful information density, clarify pitching/standings behavior, and surface empty-layout PDF guidance where the action occurs.

### Delivered behavior

1. With no selected game, Game Day now shows only one direct selection prompt and a Home action.
2. For a selected game, the detail selector, season label, and Refresh action share one compact toolbar; the redundant introductory card is removed.
3. Game, venue/weather, and officials lead the research sheet. Venue is no longer isolated near the bottom.
4. The section navigator remains pinned beneath the application header while the research sheet scrolls.
5. Sections, tables, player rows, and team summaries use denser spacing and flatter boundaries. Horizontally scrolling player/standings tables keep rank/order and player/team identity columns visible.
6. `Pitching Groups` is renamed **Pitching Staff**. Missing SP annotations no longer add question marks or duplicate explanations; the authoritative fallback has one warning at the bottom. Classified groups no longer show a success notice.
7. Compact hides standings. Standard shows only the unique standings groups containing the participating teams directly below team summaries. Advanced adds all other returned groups near the bottom.
8. Missing standings labels use known division metadata or stable league/division identity rather than `Returned Standings Group`. Participating teams are highlighted.
9. The duplicated visible Research Context/Snapshot Context block is removed. The Advanced technical source disclosure remains closed by default, and a differing selected schedule date appears only when it actually differs from the official date.
10. Empty PDF layouts now disable live/test generation with an adjacent explanation. Defensive generation checks remain in place and display actionable errors.

### Compatibility boundaries

- Game Day still renders the same normalized snapshot and performs the same supplemental hydration.
- Detail level remains a presentation preference in the existing generic application settings record.
- No API request, normalized field, source precedence rule, saved layout, PDF mapping, storage schema, backup envelope, or `README.md` changed.
- Existing v0.2/v0.3 saved layouts remain compatible.

### Verification

- 229 applicable v0.3/v0.4 automated checks pass.
- Focused checks cover additive detail membership, relevant/other standings partitioning, unnamed MLB division labels, the compact no-game state, removal of duplicated research/pitching copy, and empty-layout generation safeguards.
- Production JavaScript syntax checks pass.
- A local browser preview confirms Build 004.6a boots successfully and the no-game Game Day state contains only the intended selection prompt.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

### Smoke test

1. Open Game Day without a selected game and confirm only the selection prompt appears.
2. Select a game, open Game Day, and check Compact, Standard, and Advanced.
3. Confirm venue/weather is at the top and the section navigator remains visible while scrolling.
4. Confirm Compact has no standings; Standard has only the participating teams' division group(s); Advanced adds the remaining returned divisions near the bottom.
5. Check same-division and cross-league matchups. The same division should appear once, and no group should be called `Returned Standings Group`.
6. Check one classified and one fallback pitching staff. The fallback should use `P` and one warning; the classified staff should have no success notice.
7. Scroll a wide lineup or standings table horizontally and confirm the identity columns remain visible.
8. Choose an empty layout on Home and open an empty layout in the Designer. Confirm generation is disabled with a clear explanation; mapped layouts should still generate normally.

### Next action

After smoke acceptance, close Build 004.6a and proceed to Build 004.7 responsive, touch, and accessibility hardening.

## Build 004.6b — Wide-Screen Density Correction

**Status:** smoke accepted; Build 004 closed  
**Runtime identity:** `0.4.0-dev • Build 004.6b`

Build 004.6b is a focused presentation correction based on the first Build 004.6a wide-screen review. It does not change Game Day data, visibility rules, or source precedence.

### Delivered

- Caps and centers the Game Day research sheet on very wide displays so Compact view remains meaningfully compact.
- Adds a protected center gutter and shrink-safe team columns so away-team statistics cannot run into the home-team player area.
- Keeps player identity and statistics together at the start of each pitcher and bench row instead of pushing the statistics to the far edge.
- Presents pitcher and bench identity metadata on the same line when space permits, while retaining a safe wrap on narrow screens.
- Keeps Compact lineup tables content-sized so the player name and position do not drift apart on wide displays.
- Advances runtime and cache identity to Build 004.6b without changing `README.md`.

### Focused smoke test

1. Open the same selected game in Compact mode on a wide desktop window.
2. Confirm the Game Day sheet is centered and does not stretch across the entire display.
3. Confirm lineup positions remain close to player names.
4. Confirm pitcher and bench metadata normally stays on the same line and statistics follow the identity block.
5. Confirm a visible gutter remains between away and home teams with no collision or overlap.
6. Narrow the window and confirm long rows wrap within their own team column rather than crossing into the other team.

## Build 004.6c — Consistent Game Day Tables and Context

**Status:** implementation complete; awaiting user smoke acceptance  
**Runtime identity:** `0.4.0-dev • Build 004.6c`

Build 004.6c resolves the remaining Game Day presentation inconsistencies found during the Build 004.6b review.

### Delivered

- Removes the forced Compact lineup-table width that caused unnecessary horizontal scrolling.
- Presents lineup, bench, and pitching statistics in consistent labeled columns.
- Places Bench immediately below Starting Lineups when the selected detail level includes it.
- Removes `SP`, `RP`, and `P` name prefixes; pitching hand now appears in the first column before the player name.
- Removes Day/Night and Competition from the overview.
- Shows `Double Header Game Number` only when the selected Schedule record identifies a doubleheader.
- Keeps Game, Venue & Weather, Officials, Away Team, and Home Team information fully expanded in Compact, Standard, and Advanced views.
- Retains detail-level behavior for player statistics, Team Staff, Other Standings, and Technical Details.
- Replaces the verbose missing-role notice with `No Starter/Reliever role available`.
- Keeps manager and coaching roles on one line when the available team column can accommodate them.
- Displays the optional current-brand team SVG beside each team name, preferring a normalized logo URL and falling back to the validated team-ID URL. Asset failures leave the existing text identity intact.
- Advances runtime and cache identity without changing `README.md`.

### Focused smoke test

1. Compare Compact, Standard, and Advanced for the same game; confirm the five core context areas do not change.
2. Confirm Compact lineups do not show an unnecessary horizontal scrollbar on a normal desktop width.
3. Confirm Bench follows Lineups and that both use labeled stat columns.
4. Confirm pitching rows begin with `RHP` or `LHP`, contain no redundant role prefix, and use stat columns.
5. Check an ordinary game and a doubleheader: only the doubleheader should show `Double Header Game Number`.
6. Confirm a missing depth-chart role displays `No Starter/Reliever role available`.
7. Confirm current team logos appear when available and that a missing asset does not displace the team name.
8. Confirm long staff roles remain on one line on a normal desktop width.

## Build 004.6d — Standings Alignment and Advanced Stat Density

**Status:** implementation complete; awaiting user smoke acceptance  
**Runtime identity:** `0.4.0-dev • Build 004.6d`

Build 004.6d addresses the final table-density and standings-placement issues found during the Build 004.6c review.

### Delivered

- Removes the Advanced player-table minimum width that widened the gap after player names and forced avoidable horizontal scrolling.
- Reduces Advanced cell padding and stacks paired Advanced player tables before their columns would become crowded on narrower desktop windows.
- Associates each relevant standings group with the away team, home team, or both teams, then orders and places it under the corresponding team regardless of API return order.
- Centers a shared same-division standings table at a readable half-sheet width instead of stretching it across the page.
- Arranges Other Standings in a responsive two-column grid, returning to one column on narrow screens.
- Adds Advanced-only pitching columns for games pitched, innings pitched, walks, saves, and holds. Standard retains the concise W-L, GS, ERA, WHIP, and strikeout set.
- Advances runtime and cache identity without changing `README.md`.

### Focused smoke test

1. Open a cross-division matchup in Standard or Advanced and confirm each relevant division table appears beneath its corresponding team.
2. Open a same-division matchup and confirm the one shared standings table is centered and does not span the entire sheet.
3. In Advanced, inspect Other Standings and confirm the tables form readable columns on a wide screen and one column on a narrow screen.
4. Compare Standard and Advanced lineups; Advanced should add columns without creating a large player-name gap or a desktop horizontal scrollbar.
5. Compare Standard and Advanced pitching; Advanced should add G, IP, BB, SV, and HLD.

## Build 004.6e — Stable Columns and MiLB Division Names

**Status:** complete; user smoke accepted  
**Runtime identity:** `0.4.0-dev • Build 004.6e`

Build 004.6e resolves the remaining repeated-table alignment differences and replaces numeric MiLB standings headings with authoritative division names.

### Delivered

- Gives lineup and bench tables the same fixed column measurements at each detail level, preventing jersey-number or value length from shifting later columns independently.
- Gives every selected-starter, additional-starter, and bullpen table the same fixed pitching column measurements.
- Bounds the coaching-role column so names remain vertically aligned while unusually long roles wrap within their own column.
- Recovers omitted MiLB standings-group names from the matching division metadata returned inside each group’s team records. Ambiguous or unavailable names still retain the honest numeric fallback.
- Advances runtime, nested normalizer, and browser cache identity without changing `README.md`.

### Focused smoke test

1. Compare Starting Lineups and Bench in Standard and Advanced; matching stat columns should share the same horizontal positions.
2. Compare Selected Starter, Additional Starting Pitchers, and Core Bullpen; every shared pitching column should align vertically.
3. Inspect a staff list containing a long role. The role may wrap, but the adjacent person-name column should remain aligned with other rows.
4. Open Advanced Game Day for an MLB matchup and each available MiLB level. Other Standings should use returned division names rather than `Division <id>` whenever the source supplies that name.

## Build 004.7 — Responsive, Touch, and Accessibility Hardening

**Status:** implementation complete; awaiting user smoke acceptance  
**Runtime identity:** `0.4.0-dev • Build 004.7d`

Build 004.7 hardens the accepted Build 004.6 interface without changing baseball data, field contracts, layout persistence, or Game Day information architecture.

### Delivered

- Distinguishes a tap from an intentional Designer drag, with a larger movement threshold for touch than mouse input.
- Captures only the active drag pointer, handles pointer cancellation, and avoids saving unchanged tap gestures.
- Bounds dialogs and their scrollable cards to the dynamic viewport height so mobile browser chrome does not strand actions off-screen.
- Makes the Layout Settings workspace occupy the available narrow viewport, condenses its padding, stacks Away/Home field lists when needed, and keeps footer actions usable without horizontal overflow.
- Preserves source order in the one-column Designer layout while tightening narrow-screen spacing and enabling smooth touch scrolling inside the stage.
- Provides practical coarse-pointer targets for navigation, Designer controls, dialog actions, field-picker rows, and scorecard markers.
- Moves intentional initial focus to the Restore dialog heading while retaining native modal focus containment and focus return behavior.
- Retains the accepted skip link, visible keyboard focus, keyboard Designer controls, and reduced-motion override.
- Advances runtime, backup, browser, and cache identity without changing `README.md`.

### Build 004.7a smoke correction

- Prevents the Layout Settings body from producing a cross-axis scrollbar and allows category actions to wrap beneath their heading on very narrow windows.
- Lets a touch gesture over an ordinary mapped item remain available for stage scrolling.
- Adds a visible move handle to the selected item for deliberate touch dragging.
- Recognizes touch-originated mouse events and large contact geometry when remote-control software does not preserve `pointerType: touch`.
- Reduces the true mouse/trackpad movement threshold from 5 pixels to 2 pixels to recover the prior responsive drag feel.
- Retains local horizontal scrolling for dense Standard and Advanced player tables because those columns cannot be legibly condensed into the available narrow width.

### Build 004.7b smoke correction

- Fixes the underlying narrow-modal width mismatch: the Layout Settings form now inherits the dialog's content width instead of independently sizing itself from the viewport.
- Constrains the dialog, form, and footer to the same box and clips only the shell's unintended cross-axis overflow.
- Moves the selected-item touch handle above the object so it no longer competes with the Shrink-to-Fit width bar at the object's right edge.

### Build 004.7c smoke correction

- Makes the Layout Settings shell a true flex column so its header and footer remain fixed while only the middle content area shrinks and scrolls.
- Gives the parent dialog and each child view one shared dynamic-viewport height at every window width, eliminating the intermediate-width case that could push the footer outside the visible modal.
- Locks the hidden application page while Layout Settings is open and contains scroll gestures within the modal, preventing wheel or touch scrolling from moving the Designer behind it.

### Build 004.7d smoke correction

- Replaces the Game Day section menu's fixed sticky offset with the app header's measured height.
- Keeps the floating menu below either the one-row or two-row header, including when text scaling changes the header height.
- Uses the same measured height for Game Day section-link scroll margins so selected sections are not hidden beneath the responsive header and menu.

### Verification

- 240 applicable v0.3/v0.4 automated checks pass, including six focused Build 004.7 regressions.
- Changed JavaScript and the browser acceptance runner pass syntax validation.
- A real 319px-wide browser render has no page-level horizontal overflow; the Restore dialog remains fully inside the viewport, has no internal horizontal overflow, and receives focus on its named heading.
- All four dialogs have valid programmatic names, and the skip link remains the first interactive element.
- The command-line Chrome acceptance process is unavailable in the current Windows session because its GPU process exits before the page loads; this is recorded as an environment limitation, not an application failure.
- Protected `README.md` remains unchanged.

### Focused smoke test

1. On a phone-width window, open each primary page and confirm the page itself does not scroll sideways.
2. In Settings, open Restore a Backup and confirm the entire dialog, file choice, and close action remain reachable.
3. In Layout Settings, open each internal editor and confirm the body scrolls while the heading and action footer remain available.
4. With touch or a mouse, tap a mapped Designer item without moving it; its saved position should not change.
5. Drag the same item deliberately and confirm it moves normally. Cancel an in-progress touch gesture and confirm no unintended save occurs.
6. Use Tab, Shift+Tab, Escape, arrow keys, Delete, and the existing Designer shortcuts to confirm keyboard behavior remains intact.
7. Enable reduced motion at the operating-system level and confirm decorative animation and smooth scrolling are suppressed.

### Next action

Smoke acceptance received. Build 004.7 is closed. Proceed to Build 004.8 for the final bounded Home and Game Day presentation refinements requested before closure.

---

## Build 004.8 — Final Home and Game Day Refinement

**Status:** smoke accepted; closed  
**Runtime identity:** `0.4.0-dev • Build 004.8d`

### Delivered

- Bounds the Home date and level controls to practical reading widths instead of stretching them across the schedule card.
- Keeps the Home controls compact at intermediate widths and allows them to use the available width only when the viewport is genuinely narrower than their preferred size.
- Makes Compact and Standard team cards show Record, PCT, Games Played, Division Rank, and Games Back.
- Makes Advanced team cards show League Rank, Wild Card Rank, and Wild Card Games Back when the source exposes it.
- Removes Division, Team Game, Streak, and Last 10 from the team cards to eliminate duplicated or secondary information.
- Embeds each team's relevant Division Standings inside its Advanced team presentation.
- When both teams share a division, uses the requested Away Team | Division Standings | Home Team arrangement on wide Advanced screens and stacks the same content safely when space is constrained.
- Leaves Other Standings as an Advanced-only section.

### Build 004.8a smoke correction

- Removes the unused Advanced-only gap after Player by reducing that column from 185px to 150px.
- Rebalances the shortest code columns so both Advanced batter and pitcher tables fit a 640px two-team column at full-screen width.
- Leaves the accepted Standard batter and pitcher table widths unchanged.

### Build 004.8b Home and Settings refinement

- Removes the repetitive Settings summary card and places Favorite Team and Appearance side by side when the viewport is wide enough, with a one-column fallback.
- Loads the complete schedule for today's selected level on startup instead of reducing Home to the favorite team's game.
- Preselects the favorite team's game, when present, whenever the displayed level matches the saved favorite level; changing the date repeats the same selection behavior while retaining the full schedule.
- Removes the Show Games and Favorite Team Today buttons because date and level changes now refresh automatically.
- Moves Find a Game into the primary control row, places the result count with the schedule results, and narrows the Level control.
- Removes the duplicate visible schedule-status pill and fixes the selected-game empty state so it does not reserve space after a game is selected.

### Build 004.8c Home card structure correction

- Splits the schedule browser and Selected Game into two true sibling cards instead of nesting both presentations inside one large schedule card.
- Aligns the two cards at their top edges on wide screens and stacks them at 1280px and below.
- Keeps the Selected Date details, date and level controls, and search fixed within the schedule card while only the schedule results scroll.
- Gives the schedule card the slightly wider wide-screen column so the condensed search field remains on the same row without overflow.

### Build 004.8d schedule density correction

- Lets the schedule card size itself to short slates instead of always occupying the full available viewport height.
- Applies a viewport-bounded internal scrollbar only when the schedule is long enough to need it, keeping the date and search controls stationary.
- Removes the duplicated status subtitle from each game choice and retains the single status badge beside the game time.
- Tightens row padding and spacing so more games remain visible without sacrificing the matchup label or selection target.

### Verification

- 245 applicable v0.3/v0.4 automated checks pass, including five focused Build 004.8 presentation regressions.
- Application, Designer-interaction, and browser-acceptance JavaScript syntax checks pass.
- Protected `README.md` remains unchanged.

### Focused smoke test

1. On Home at a wide width, confirm Date and Level remain compact and left-aligned with the two actions rather than expanding across the full card.
2. Narrow Home through tablet and phone widths. Confirm the controls reflow without horizontal scrolling and do not become wider than necessary.
3. On Game Day Standard, confirm each team shows exactly Record, PCT, Games Played, Division Rank, and Games Back, with no Division Standings table.
4. On Game Day Advanced for teams in different divisions, confirm each team shows League Rank, Wild Card Rank, optional Wild Card Games Back, and its own Division Standings table.
5. On Game Day Advanced for teams in the same division, confirm the wide layout reads Away Team | Division Standings | Home Team and highlights both selected teams in the shared standings table.
6. Narrow the shared-division Advanced view and confirm the three areas stack without page-level horizontal overflow.

### Next action

Smoke acceptance received. Proceed to Build 004.9 for the game-time regression correction, final documentation, and Build 004 closure.

---

## Build 004.9 — Game-Local Time Correctness and Build Closure

**Status:** implementation complete; awaiting user smoke acceptance  
**Runtime identity:** `0.4.0-dev • Build 004.9`

### Delivered

- Corrects a regression caused by the normalized venue timezone being stored as an object such as `{ iana: "America/New_York" }` while the formatter expected a plain string.
- Shows the user's local first-pitch time and the game's venue-local first-pitch time in Home's Selected Game card and the Game Day overview when those zones differ.
- Labels the two browser times as `(you)` and `(game)` so their meaning remains clear across daylight-saving changes and timezone abbreviations.
- Shows one browser time when the user's timezone and the game's timezone resolve to the same formatted value.
- Keeps the compact schedule list in the user's local timezone to avoid adding noise to every result row.
- Formats the generated scorecard PDF's `game.startTime` in the venue's timezone only, without a browser-local fallback when valid venue timezone data is available.
- Fetches venue timezone details when a scorecard uses `game.startTime`, even when the selected layout does not otherwise require extended venue fields.
- Performs a lightweight venue lookup for Home's Selected Game card so dual-zone display does not depend on opening Game Day first.

### Verification

- 248 applicable v0.3/v0.4 automated checks pass, including three focused Build 004.9 timezone regressions.
- Application, formatter, Designer-interaction, and browser-acceptance JavaScript syntax checks pass.
- Protected `README.md` remains unchanged.

### Focused smoke test

1. Select a game whose venue is in a different timezone from the browser, such as a Tampa Bay home game viewed from Central Time.
2. On Home, confirm First Pitch shows both clocks in the form `7:00 PM CDT (you) • 8:00 PM EDT (game)`.
3. Open Game Day and confirm its First Pitch field shows the same two-clock presentation.
4. Generate a scorecard PDF and confirm First Pitch contains only the venue-local time, such as `8:00 PM`.
5. Select a game in the browser's timezone and confirm Home and Game Day show a single time rather than a duplicated pair.

### Next action

Smoke acceptance received on 2026-10-12. Build 004 is closed. Carry newly discovered feature work into the next numbered build.
