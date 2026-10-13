# Scorecard Studio v0.4.0 — Build 003

**Build theme:** User preferences and interface refinement  
**Baseline:** accepted v0.4.0 Build 002.7a  
**Protected product contract:** `README.md`

## Build 003 sequence

The sequence is intentionally incremental. Each decimal build should leave a usable application and preserve the generic Build 002 backup contract.

1. **003.1 — Appearance preference activation:** System, Light, and Dark choices; immediate application; persistence; live System-mode response; initial light palette.
2. **003.2 — Complete appearance coverage:** audit Home, Game Day, Layouts, Designer, dialogs, status states, and narrow layouts for contrast and visual consistency.
3. **003.3 — Startup continuity and accessibility:** minimize incorrect-theme startup flash, verify keyboard/focus behavior, and close reduced-motion/contrast gaps exposed by the appearance work.
4. **003.4 — Settings and backup-workflow UX refinement:** improve hierarchy, language, progress, and confirmation without changing backup semantics.
5. **003.5 — Preference portability and Build 003 closure:** complete/restore round trips for preferences, cross-browser acceptance, regression closure, and the Build 004 handoff.

The later increments may be split if visual acceptance reveals a boundary that is safer to validate independently.

---

## Build 003.1 — Appearance Preference Activation

**Status:** Complete; user smoke test requested  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 003.1`

### Objective

Activate the already-versioned `appPreferencesV1.appearance` setting without reopening the backup engine. Make appearance a real Settings choice and establish a coherent light palette while preserving the accepted dark appearance.

### Delivered behavior

1. Settings presents one accessible radio group with System, Light, and Dark choices.
2. A choice applies immediately and is persisted through the existing registered `appPreferencesV1` record.
3. A failed save visibly restores the prior choice and appearance.
4. System mode resolves from `prefers-color-scheme` and responds to operating-system changes without rewriting the stored `system` preference.
5. Startup reads and applies the stored preference; a successful backup restore does the same through the accepted post-restore refresh path.
6. The light palette covers application chrome, cards, controls, status colors, dialogs, Settings, and principal inset surfaces. The PDF/Designer paper surface remains white by design.
7. The complete-backup format remains version 1; appearance remains ordinary registered JSON-safe preference data.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/v040-settings.js`
- `tools/run-v040-browser-acceptance.mjs`
- current-identity regression tests
- `tests/v040-appearance-preferences.test.mjs`
- `docs/v0.4/builds/Build_003.md`

`README.md`, storage schema, backup envelope, restore transaction, saved layouts, normalized data, and PDF rendering logic did not change.

### Verification

- 207 accepted automated checks pass, including five new appearance-specific checks.
- The generated field-coverage report remains current.
- Chrome desktop and narrow automation switch Light, Dark, and System; observe distinct resolved palettes; create a valid complete backup; and report no browser warnings or errors.
- A visual pass confirms the dark and light Settings surfaces remain readable and responsive at the available narrow viewport.
- Edge automated headless output remains unavailable; normal manual smoke remains appropriate.
- The protected `README.md` remains byte-identical.

### Smoke test

1. Open Settings → Appearance and switch between Light, Dark, and System.
2. Navigate through Home, Game Day, Layouts, and the Designer in both explicit themes; report any surface with poor contrast or an obviously dark-only treatment.
3. Reload once in an explicit theme and confirm the same selection returns.
4. Optionally export a complete backup after choosing Light or Dark, restore it into a fresh browser profile, and confirm the restored choice applies immediately.

### Next increment

Build 003.2 performs the exhaustive appearance-coverage pass, using smoke-test findings to correct specialized surfaces before startup-continuity and broader workflow polish.

---

## Build 003.2 — Complete Appearance Coverage

**Status:** Complete; user smoke test requested  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 003.2`

### Objective

Complete the appearance pass begun in Build 003.1 by giving specialized surfaces, status states, dialogs, and narrow layouts the same deliberate Light and Dark treatment as the main application shell.

### Delivered behavior

1. Semantic theme tokens now cover success, warning, danger, selection, subtle/inset/deep surfaces, hover treatments, and dialog chrome.
2. Light-mode primary actions keep a high-contrast white label on the blue action surface; the brand mark receives the same explicit treatment.
3. Game Day source outcomes and diagnostic states use theme-aware status colors instead of dark-palette-only literals.
4. Designer toolbars, stage surround, palette items, placement states, and layout-summary surfaces retain visible hierarchy in both themes.
5. Layout Settings and related dialog chrome, borders, overlays, and inset sections now resolve from the active theme.
6. Keyboard focus has one visible application-wide treatment for buttons, links, form controls, and disclosure controls.
7. Desktop and narrow browser acceptance now traverses Home, Game Day, Layouts, and Settings in both explicit themes and checks that every view remains visible without horizontal overflow.
8. Appearance preference persistence, backup format, restore behavior, saved layouts, normalized data, and PDF rendering remain unchanged.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `tools/run-v040-browser-acceptance.mjs`
- current-identity regression tests
- `tests/v040-appearance-coverage.test.mjs`
- `docs/v0.4/builds/Build_003.md`

`README.md`, storage schema, backup envelope, restore transaction, field registry, saved layouts, normalized data, and PDF rendering logic did not change.

### Verification

- 210 accepted automated checks pass, including new contrast and specialized-surface coverage checks.
- The generated field-coverage report remains current.
- Chrome desktop and narrow automation opens Home, Game Day, Layouts, and Settings in explicit Light and Dark modes; every checked view remains visible without horizontal overflow, backup export remains valid, and no browser warnings or errors are reported.
- A browser visual pass confirms readable Light and Dark application chrome, cards, actions, controls, and empty states across the available Home, Game Day, Layouts, and Settings views.
- Edge automated headless output remains unavailable; normal manual smoke remains appropriate.
- The protected `README.md` remains byte-identical.

### Smoke test

1. Visit Home, Game Day, Layouts, and Settings in both Light and Dark appearances.
2. Open an existing layout in the Designer and open Layout Settings; confirm the toolbar, stage surround, field palette, selections, and dialog sections remain clearly separated in both themes.
3. With game data loaded, inspect source/availability messages and confirm success, warning, and unavailable states remain legible.
4. Repeat the main navigation once at a narrow browser width and confirm no horizontal page overflow appears.

### Next increment

Build 003.3 addresses startup theme continuity and the remaining accessibility details, including reduced-motion behavior and focused keyboard review.

---

## Build 003.3 — Startup Continuity and Accessibility

**Status:** Complete; user smoke test requested  
**Date:** 2026-10-09  
**Runtime identity:** `0.4.0-dev • Build 003.3`

### Objective

Reduce incorrect-theme startup paint and close the keyboard, motion, and modal-labeling gaps identified during the appearance work, without expanding this increment into a general interface redesign.

### Delivered behavior

1. A small inline startup bootstrap resolves System, Light, or Dark before the main stylesheet is requested.
2. IndexedDB `appPreferencesV1` remains authoritative. Only the normalized appearance value is mirrored to `localStorage` so a future page load can select its first-paint theme synchronously.
3. Missing, invalid, or inaccessible startup-mirror storage safely falls back to System appearance. Loading the authoritative IndexedDB record reconciles and refreshes the mirror.
4. System appearance still follows live operating-system preference changes without rewriting the stored preference.
5. Reduced-motion users receive effectively disabled animation and transitions, automatic scrolling, and no forced smooth scrolling from Designer navigation.
6. A visible-on-focus “Skip to main content” link lets keyboard users bypass the persistent sidebar.
7. The main content landmark can receive skip-link focus without entering the ordinary tab sequence.
8. Every native application dialog now has an explicit accessible name tied to its visible heading.
9. Backup format, restore behavior, saved layouts, normalized data, field resolution, and PDF generation remain unchanged.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/v040-settings.js`
- `tools/run-v040-browser-acceptance.mjs`
- current-identity regression tests
- `tests/v040-startup-accessibility.test.mjs`
- `docs/v0.4/builds/Build_003.md`

`README.md`, storage schema, backup envelope, restore transaction, saved layouts, normalized data, and PDF rendering logic did not change.

### Verification

- 214 accepted automated checks pass, including four new startup-continuity and accessibility checks.
- The generated field-coverage report remains current.
- Focused tests verify bounded startup-mirror behavior, pre-stylesheet theme resolution, authoritative IndexedDB reconciliation, reduced-motion coverage, skip navigation, visible focus styling, and accessible names for all seven dialogs.
- Interactive browser acceptance confirms Build 003.3 loads without application errors, exposes the skip link first in the accessibility tree, and preserves an explicit Dark preference across a full reload.
- The updated automated browser harness verifies the startup mirror along with its existing desktop/narrow appearance and backup assertions. The local headless Chrome executable could not run that final matrix because its Windows GPU process failed before page load; Edge continues to report headless output unavailable. This is a runner limitation rather than an observed application failure.
- The protected `README.md` remains byte-identical.

### Smoke test

1. Choose Light or Dark in Settings, reload the page, and confirm the saved theme is present from the beginning of startup without a conspicuous opposite-theme flash.
2. Choose System, reload once, and confirm the app follows the operating-system theme.
3. Press Tab immediately after loading. Confirm “Skip to main content” appears, then press Enter and confirm focus bypasses the sidebar.
4. Open Layout Settings and its child dialogs with the keyboard; confirm visible focus remains easy to follow and Escape/Cancel returns to the prior context.
5. If the operating system’s reduced-motion preference is enabled, confirm Designer “Show” navigation moves directly rather than smoothly animating.

### Next increment

Build 003.4 refines the Settings and backup/restore workflow hierarchy, language, progress, and confirmation experience without changing the accepted backup semantics.

### Build 003.3a corrective patch

Chrome and Edge smoke testing showed that the transform-based off-screen treatment caused the skip link to be omitted from sequential keyboard focus. Build 003.3a keeps the link inside the viewport and tab order while visually hiding it with opacity and disabled pointer interaction. Ordinary `:focus` and `:focus-visible` both reveal it. The first page-level Tab now targets “Skip to main content” before Home or Refresh Schedule.

The initial narrow patch exposed an overlay-packaging hazard: the new application entry point referenced dependency files under a new cache identity, but those otherwise-unchanged dependencies were not present in the changed-files package. The accepted runtime-repair overlay included the full dependency set. All later packages that advance these runtime cache identities must include every referenced file.

---

## Build 003.4 — Settings and Backup-Workflow UX Refinement

**Status:** Complete; user smoke test requested  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 003.4`

### Objective

Make Settings and Backup & Restore easier to understand and safer to operate without changing the accepted portable-data contract, validation rules, conflict policies, or atomic restore transaction.

### Delivered behavior

1. Settings now explains its three responsibilities—startup schedule, appearance, and portable backups—without presenting itself as a development-status surface.
2. Backup creation visually distinguishes a complete backup from a single-layout backup and states exactly what each contains.
3. Restore is presented as a three-stage Choose, Review, and Confirm workflow. The page explicitly states that selecting a file is read-only.
4. The restore preview uses clearer actions: Cancel Restore and Continue to Confirmation.
5. The final dialog identifies the selected file, summarizes the approved writes, explains atomic failure behavior, and separates Go Back from Confirm & Restore.
6. Backup work now has visible working, success, and error treatments. Working regions expose `aria-busy`, and status announcements are atomic for assistive technology.
7. File-selection controls make it clear when the user is replacing an already-selected file.
8. Backup envelope version, portable setting discovery, export contents, validation, conflict policies, commit planning, transaction behavior, and post-restore refresh remain unchanged.

### Files changed

- `app-meta.json`
- `index.html`
- `css/styles.css`
- `js/app.js`
- runtime dependency files repackaged under the Build 003.4 cache identity
- `tools/run-v040-browser-acceptance.mjs`
- current-identity and backup-workflow regression tests
- `docs/v0.4/builds/Build_003.md`

`README.md`, storage schema, backup envelope schema, restore engine semantics, normalized data, saved-layout model, and PDF generation did not change.

### Verification

- The full accepted automated suite passes, including new assertions for staged workflow language, working-state feedback, atomic status announcements, and final confirmation context.
- Existing backup contract, export, import-preflight, restore-planning, round-trip, rollback, appearance, and accessibility checks remain green.
- The release package includes the complete browser runtime dependency set referenced by the new cache identity, preventing the incomplete-overlay failure found during Build 003.3a acceptance.
- The protected `README.md` remains byte-identical.

### Smoke test

1. Open Settings and confirm the three sections and their descriptions remain readable in both Light and Dark appearance.
2. Download a complete backup, then a single-layout backup; confirm the working message appears briefly and each download succeeds.
3. Choose a known-good backup. Confirm no data changes at file selection, the preview is understandable, and the button reads Continue to Confirmation.
4. If a layout conflict is shown, choose a policy and confirm the final dialog accurately summarizes the result. Use Go Back once, then reopen it.
5. Confirm the restore. Verify the success message, favorite team, appearance, and restored layouts update immediately.
6. At a narrow browser width, confirm the export choices, restore steps, preview, and confirmation remain usable without horizontal overflow.

### Next increment

Build 003.5 completes preference-portability acceptance, cross-browser regression closure, and the Build 004 handoff.

### Build 003.4a corrective patch

Manual acceptance confirmed that Build 003.4 preserved the backup engine correctly but made restore feel like two disconnected workflows. File validation expanded the Settings page below the current viewport, conflict-oriented instructions appeared even when no conflicts existed, and the final modal repeated most of the inline preview while exceeding the usable viewport in some window sizes.

Build 003.4a moves the entire restore journey into one bounded, progressively revealed modal:

1. Settings now launches restore through a single **Import Backup…** action.
2. File choice, validation progress, review, optional conflict resolution, confirmation, and completion remain in the same focus context.
3. A conflict-free backup receives a prominent **No conflicts found** result and no irrelevant conflict instruction.
4. Conflict choices appear only when the validated plan actually requires them.
5. The final confirmation is intentionally concise: selected file, total portable records to restore, and the chosen layout decisions. It does not repeat the full validation grid.
6. A successful restore reveals an in-modal completion state rather than closing abruptly and returning the user to a changed page position.
7. The dialog uses viewport-bounded sizing, border-box width calculation, internal vertical scrolling when necessary, and no horizontal overflow.

The export controls remain directly on Settings because they are single-action operations. Validation, conflict policy, restore planning, atomic commit behavior, storage schema, and backup-envelope version remain unchanged.

### Build 003.4b corrective patch

Manual acceptance found that restore could reject a valid Build 003.4 backup before reading the selected file when IndexedDB was deleted through browser developer tools and restore was attempted without reloading the still-open app page. The supplied complete backup was independently verified as valid backup format version 1 with four layouts, four PDF templates, and three settings. The failure occurred because the open page retained a database connection that the browser had invalidated.

Build 003.4b strengthens that browser-storage read without changing the backup or restore contracts:

1. The preferred path remains one read-only transaction across settings, layouts, and PDF templates.
2. If the browser connection has become inactive, the app closes and discards that connection, opens a fresh one, and retries the same atomic snapshot. If developer tools deleted the database, normal schema initialization recreates the empty stores during that reopen.
3. If the fresh atomic read also fails, restore still stops before parsing decisions or writing any data and reports the existing safe failure state.

There is no non-atomic compatibility path. The IndexedDB schema, backup-envelope format, conflict policies, atomic read and write guarantees, progressive modal workflow, and `README.md` remain unchanged.

---

## Build 003.5 — Preference Portability and Build 003 Closure

**Status:** Implementation complete; short cross-browser smoke requested  
**Date:** 2026-10-10  
**Runtime identity:** `0.4.0-dev • Build 003.5`

### Objective

Close the Build 003 preference and interface-refinement sequence without adding another product feature. Prove that current portable preferences travel with complete backups, single-layout backups remain preference-isolated, the accepted restore workflow remains intact, and the cumulative v0.3/v0.4 regression stays green.

### Closure results

1. Complete-backup round trips explicitly cover `appPreferencesV1`, `favoriteCompetition`, and the portable `favoriteLayoutId` reference.
2. `livePdfLayoutId` and the retired `includeAdditionalStarters` global preference remain excluded as designed.
3. Single-layout backups contain no global settings.
4. Keep Both conflict resolution rewrites `favoriteLayoutId` to the newly allocated restored layout identity and keeps the copied layout/PDF reference pair closed.
5. Post-restore refresh reapplies appearance and favorite-team state before refreshing layouts, so the favorite layout can resolve against the newly committed set.
6. The Build 003.4b stale-connection recovery remains atomic: one failed snapshot read may reopen IndexedDB and retry the same multi-store read, but no per-store compatibility snapshot is accepted.
7. All 221 accepted automated checks pass.
8. Chrome passes the reusable desktop and narrow browser acceptance runs with no captured errors, no horizontal overflow, correct Light/Dark/System state, a bounded restore modal, and a valid Build 003.5 complete-backup envelope.
9. Managed Edge headless mode still returns no DOM output. Prior manual Chrome-to-Edge and Edge-to-Chrome acceptance established complete and single-layout portability; a short Build 003.5 manual confirmation remains the user handoff.
10. The protected `README.md` remains byte-identical.

### Manual closure smoke

1. Overlay Build 003.5 and confirm the sidebar reports `0.4.0-dev • Build 003.5` in Chrome and Edge.
2. In Chrome, choose a non-default appearance and confirm the favorite team and favorite layout are set. Create a complete backup.
3. Restore that backup in Edge. Without reloading, confirm appearance, favorite team, favorite layout, and saved layouts reflect the restored values.
4. Reload Edge and confirm those values remain stable.
5. Export one layout from Edge and restore it in Chrome. Confirm the layout/PDF arrives but Chrome's appearance, favorite team, and favorite layout do not change.
6. Open the restored layout and generate either a Representative Test PDF or a known historical Live PDF.

### Build 004 handoff

Build 003 closes the currently defined v0.4 sequence. Build 004 does not yet have an authoritative feature scope. Begin it with a short roadmap evaluation against the accepted application rather than assuming that additional Settings, appearance, or backup work belongs in the next build. The Build 002 backup format remains generic and should reopen only if a future feature cannot be represented by the existing registered-setting or saved-layout contracts.
