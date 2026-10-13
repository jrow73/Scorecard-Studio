# Scorecard Studio v0.4 — UI Foundation Audit

**Status:** Authoritative Build 004 implementation input  
**Code baseline:** accepted v0.4.0 Build 003.5  
**Scope:** application shell, Home, Game Day, Layout Library, Designer entry, Layout Settings, and Field Palette

## 1. Executive finding

The reported “card within card within card” problem is not one isolated stylesheet defect. The current application frequently uses the same elevated-card treatment for page framing, independent tasks, internal groups, status summaries, and editor subsections. That repetition consumes space and weakens hierarchy. Several workflows compound it by separating a choice from its result: Home puts selected-game controls after the full schedule; Layouts puts record actions in a separate card below the full library; Layout Settings opens differently sized child dialogs from a summary dialog.

Build 004 should correct the hierarchy rather than merely reduce padding. A compact interface uses one primary surface for the task, keeps actions beside the object they affect, and uses rows, separators, tables, and disclosure inside that surface.

## 2. Current surface inventory

| Surface | Current implementation | Primary finding | Accepted target |
|---|---|---|---|
| App shell | Persistent left sidebar with Home, Game Day, Layouts, Layout Designer, disabled Generate, and Settings | Two entries are not primary destinations; the sidebar consumes persistent width after navigation contracted to four destinations | Compact horizontal desktop navigation and an accessible narrow-screen equivalent; four primary destinations only |
| Home | One schedule card containing controls, schedule groups, and a selected-game inset card | Every nonempty level result selects the first game; selected detail follows the complete list; no filtering | No arbitrary selection, immediate local search, and adjacent schedule/detail presentation |
| Game Day | Header card, source pills, section navigation, nine research sections, nested stat cells and bordered source rows | Dense content lacks user-controlled depth; repeated boxes make values harder to scan; engineering source success is prominent | Compact/Standard/Advanced views, flatter data presentation, season-aware relevance, and user-facing status language |
| Layout Library | Large always-open creation card, library card, full-width layout rows, and distant selected-layout detail card | Creation dominates the page; Open is detached at the far edge; selection scrolls users to another control region | Compact library records with local actions and a separate creation workflow |
| Designer entry | Primary sidebar route plus contextual Open Designer action | A Designer route without a selected layout cannot perform useful work and redirects back to Layouts | Contextual entry from each saved layout only |
| Layout Settings | Summary dialog opens three child dialogs | Content-driven parent/child sizes create visual jumps and modal-within-modal mental overhead | One stable modal frame with internal summary/editor views and Back/Close behavior |
| Field Palette | One searchable, long list of category cards | Categories are hard to scan and mirrored Away/Home choices require duplicate work | Searchable collapsible groups plus optional verified Home/Away mirroring |
| Settings | Separate preference cards and a nested backup workflow | Mostly coherent after Build 003; some reusable density and section styling still duplicates framing | Preserve behavior, adopt flatter shared section primitives, reserve space for future Cloud Sync |

## 3. App shell and navigation

### Code reality

`index.html` exposes six sidebar entries. `showView()` treats Designer as a peer view and the Designer navigation handler sends the user back to Layouts when no saved layout is selected. Generate is permanently disabled and marked “Later.” The skip link explicitly bypasses the persistent sidebar.

### Decision

The four primary destinations are:

1. Home
2. Game Day
3. Layouts
4. Settings

Designer is a contextual editor state launched from a particular layout and closed back to the Layout Library. Generate is already performed from Home and through Designer test generation; the placeholder route is removed rather than implemented.

Build/version identity must not occupy primary content or Game Day headings. It may remain in a quiet app/about location needed for support. Runtime failure status remains available, but normal startup success need not consume a permanent footer treatment.

## 4. Home game-selection workflow

### Code reality

- Changing the date immediately calls `loadLevelSchedule()` for the selected level.
- Changing the level also immediately loads that level schedule.
- `applyScheduleBundle()` renders every returned game and then calls `chooseInitialGame()`.
- `chooseInitialGame()` returns the first game when no previous valid selection exists.
- `renderSelectedGame()` reveals the detail/actions region after the entire grouped schedule list.

This exactly explains the reported behavior: a date or level change can select an unrelated first game, and the resulting actionable information appears after what may be a long schedule.

### Target state

- Favorite-team startup may automatically select a returned game only when it is actually the saved favorite team's game.
- General level/date browsing begins with no selected game unless the prior selection is still present in the same result set.
- Search appears with the schedule results and filters already-loaded games as the user types. Matching includes team full name, common abbreviation when present, and returned league/group label.
- Filtering performs no new API request and does not silently select the sole remaining result.
- A zero-match message explains that the filter, rather than the schedule source, removed all visible games.
- On wide screens, schedule choices and selected-game detail share the working region. On narrow screens, selected detail follows the chooser immediately and receives deliberate focus/scroll only after an explicit selection.
- The selected matchup, readiness, probable starters, Game Day action, layout choice, and Generate action remain together.

## 5. Game Day research companion

### Code reality

Game Day is correctly the hydrated research surface and already covers the major semantic groups: overview, teams, lineups, pitching, bench, staff, standings, officials, venue/weather, and source scope. The presentation uses repeated `.card`, `.gameday-stat`, bordered table wrappers, classification notes, and bordered source-list rows. The header also exposes “Coaches API” and “Standings API” success/loading language, while a build-derived prefix is present in normal content.

The field-surface contract assigns all 171 active registry definitions to Game Day. The current issue is information architecture and scanability, not an undocumented decision to exclude active fields.

### Detail-level contract

| Level | Purpose | Default content character |
|---|---|---|
| Compact | Fast pregame orientation | Matchup, readiness, probable/selected starters, essential team context, and concise lineup state |
| Standard | Familiar traditional reference | Newspaper/box-score-era lineup, roster, pitching, standings, venue, weather, officials, and common season statistics |
| Advanced | Full research companion | All Standard content plus the broader active registry, availability/classification explanations, staff depth, source-sensitive detail, and advanced normalized context currently accepted for users |

The labels are working product names and may be refined through smoke feedback, but their semantics are fixed: each higher level is additive, and changing levels does not fetch a different truth model.

### Preference and context

- The last selected detail level is remembered in `appPreferencesV1` and participates in complete backup/restore through the existing generic settings registry.
- The toggle remains directly available on Game Day; users do not visit Settings for routine switching.
- Season context is derived independently from normalized competition/game-type data. Spring/preseason, regular-season, and postseason may prioritize or relabel relevant sections, but may not change the saved detail level.
- Expected source success becomes silent. Missing data is explained where the user encounters it. Detailed lineage and source outcomes remain in automated evidence or a deliberately opened diagnostic disclosure, not the default research view.

## 6. Layout Library and creation

### Code reality

The first Layouts card is a complete creation form containing name, description, palette mode, optional custom field selection, PDF upload, Create action, and status. The saved-layout list follows in another card. Each record has one Open button at the far right. `openLayout()` selects the layout, reveals a separate detail card below the full list, populates metadata actions, loads the PDF, and renders its preview there.

### Target state

- The normal Layouts landing view begins with the library, a compact count/filter area if useful, and one “Create Layout” action.
- Create Layout enters a focused workflow within the Layouts destination. It does not remain expanded when the user is managing existing layouts.
- Each layout record contains its identity, useful metadata, favorite state, and immediate actions in one bounded region.
- Open Designer is the primary record action. Settings, Duplicate, Export, Favorite, and Delete are local secondary actions, exposed without scrolling to a separate detail card.
- Destructive actions remain confirmed. Less-common actions may use an accessible overflow menu on narrow screens.
- A preview may be opened deliberately, but selecting a library record must not automatically render a large PDF below the collection.
- Existing layout IDs, PDF records, metadata, mappings, palette configuration, formatting, and compatibility behavior are unchanged.

## 7. Layout Settings modal model

### Code reality

The parent Layout Settings dialog summarizes Layout Details, Field Palette, and Default Formatting. Each Open action launches a separate child dialog. Although CSS applies related maximum widths, the dialogs size to different natural content heights and transition between separate native dialog surfaces.

### Target state

Use one viewport-bounded Layout Settings dialog shell with a stable width and height behavior:

- Summary, Layout Details, Field Palette, and Default Formatting are internal views of the same shell.
- Opening a section changes the dialog body and title without opening a second modal layer.
- Child views provide Back to Layout Settings, Cancel where edits are staged, and Save when changes are valid.
- The header and footer remain stable while the body scrolls.
- Narrow screens use the same logical frame at near-full viewport dimensions.
- Existing dirty-state and discard protection remains authoritative.

## 8. Field Palette exposure and mirrored selection

### Existing coverage evidence

| Measure | Count | Build 004 interpretation |
|---|---:|---|
| Resolvable definitions | 223 | Must remain resolvable for saved layouts |
| Active catalog definitions | 171 | Current user-facing catalog authority |
| Designer-eligible active definitions | 167 | Expected redesigned palette population |
| Fixed-role umpire aliases hidden from new Designer work | 4 | Continue using variable Umpire Crew workflow |
| Compatibility-only definitions | 52 | Do not promote without a separate adoption decision |
| Unregistered normalized value families with dispositions | 10 | Already reconciled; some are intentionally Game Day or internal only |

The Build 004.5 audit therefore begins with a strong conclusion: there is no known active-field registry gap to repair. It must prove that all 167 eligible definitions remain discoverable and selectable after the UI redesign, and separately identify any proposed compatibility promotion rather than quietly expanding the catalog.

### Palette interaction contract

- Categories are collapsed by default according to a deliberate policy, with Expand All and Collapse All available.
- Search expands only matching categories and hides nonmatching fields immediately.
- Selection counts remain visible at the overall and category levels.
- “Mirror Home and Away selections” is enabled by default for the editing session and clearly visible near the selection controls.
- A verified counterpart map—not string substitution at click time—defines mirror pairs.
- Selecting or clearing one member applies the same action to its counterpart when mirroring is on.
- Fields with no verified counterpart act independently.
- Turning mirroring off never rewrites existing selections; it only changes subsequent actions.
- Save persists the resulting enabled-field set exactly as today. The mirroring helper itself need not become layout data unless later product evidence requires that behavior to persist between editing sessions.
- Keyboard activation, focus, search results, selected counts, and mixed asymmetric states remain understandable without relying on color.

## 9. Shared density diagnosis

The audit found 27 explicit `card` instances in static markup before counting cards generated by render functions. Game Day alone declares nine section-card instances and then places stat cells, table wrappers, notes, and source rows inside them. Layout Settings adds three summary cards inside a modal card. The problem is therefore structural enough that isolated margin changes would preserve the visual noise.

The accepted replacement rules live in `V040_UI_COMPONENT_CONTRACT.md`. Later increments should migrate one workflow at a time rather than globally restyling every `.card`, because Designer and backup dialogs have specialized behavior that could regress under a broad selector change.

## 10. Dependency and risk register

| Change | Dependency | Principal risk | Required evidence |
|---|---|---|---|
| Four-destination shell | Existing view switching and skip link | Keyboard/focus or narrow navigation regression | Desktop/narrow navigation and first-Tab acceptance |
| Home no-auto-select | Schedule mode and PDF/Game Day enablement | Stale selection or enabled actions with no game | Favorite, level, date, filter, and no-selection tests |
| Layout Library redesign | Layout selection and PDF loading | Accidental saved-layout mutation or expensive eager previews | Old-layout open/edit/generate tests |
| Single settings frame | Dirty drafts and native dialog behavior | Lost edits or broken focus restoration | Save/cancel/discard/focus matrix |
| Mirrored field selection | Registry category/side metadata | Incorrect pair or asymmetric layout corruption | Complete counterpart-map and opt-out tests |
| Game Day levels | Field disposition and app preferences | Hidden required data or preference loss | Field-level membership matrix and backup round trip |
| Touch refinement | Designer pointer/drag logic | Accidental field movement | Mouse, keyboard, and touch-emulation regression |

## 11. Out of scope for Build 004

- Cloud-provider authentication and synchronization implementation;
- team-logo adoption;
- new API endpoints or inferred statistics;
- backup envelope changes;
- normalized schema changes;
- arbitrary promotion of compatibility-only fields;
- redesign of PDF output; and
- changes to the protected v1 `README.md`.

Build 004 should leave a clear Settings location for future Cloud Sync, but provider selection, OAuth, revisions, conflict semantics, deletion propagation, and automatic synchronization belong to the separately scoped Build 005 investigation.
