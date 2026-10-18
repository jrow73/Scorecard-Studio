# Scorecard Studio v1 development handoff

**Current stable release:** `1.0.0`, Build `002`  
**Current browser cache identity:** `100r002`  
**Document purpose:** cold-start handoff for a developer and an AI assistant  
**Last reconciled:** 2026-10-17

This document describes the application as it exists at v1. It is deliberately
not a chronological build log. Read `AGENTS.md` first, then use this guide as
the source of current architectural and maintenance context. Consult historical
build documents only when investigating the origin of a specific compatibility
rule.

## 1. Product contract

Scorecard Studio is a static, browser-based tool for preparing printable
baseball scorecards. A user can upload a blank PDF, map game and player data in
the Designer, and generate a prefilled Test or live-game PDF. Game Day is a
spoiler-safe pregame research companion.

The enduring product boundaries are:

- **Pregame, not live scoring.** Do not expose live scores, inning state, or
  postgame results in the normal workflow.
- **Local first.** Layouts, uploaded PDFs, preferences, normalized snapshots,
  and cached API results stay in the user's browser.
- **No account or application server.** GitHub Pages serves static files. The
  browser calls the public MLB Stats API directly.
- **Manual portability.** Complete and single-layout JSON backups are the
  supported way to protect or move data between browsers or devices.
- **User-owned templates.** Never overwrite a saved layout or PDF silently.
- **MLB and MiLB awareness.** Carry the selected sport/competition context;
  avoid new MLB-only assumptions such as an unconditional `sportId=1`.

## 2. Technology and local startup

- Vanilla HTML, CSS, and JavaScript
- Native browser ES modules
- Native IndexedDB
- `pdf.js` and `pdf-lib` loaded from CDNs in `index.html`
- No npm dependency installation, compilation, bundling, or server runtime

Serve the repository through an HTTP server; do not open `index.html` through
`file://`, because module and fetch behavior will differ. For example:

```text
python -m http.server 8765
```

Then open `http://127.0.0.1:8765/`. VS Code Live Server or another static file
server is also suitable. Validate important changes both locally and on the
GitHub Pages project path, because resource URLs must remain relative.

## 3. Repository map

### Browser runtime

- `index.html` — application markup, dialogs, navigation, CDN dependencies,
  startup appearance bootstrap, and browser/PWA metadata.
- `css/styles.css` — all application styles and responsive behavior.
- `js/app.js` — browser bootstrap, state coordination, DOM workflows,
  Designer interaction, hydration orchestration, and PDF generation. It is
  large; extract behavior only in bounded, tested changes.
- `js/api.js` — MLB Stats API requests.
- `js/storage.js` — IndexedDB creation and access, backup snapshots, atomic
  restore operations, normalized caches, and local-data deletion.
- `js/field-registry.js` — canonical field identities and catalog metadata.
- `js/formatter.js`, `js/formatting.js`, and `js/slot-content.js` — shared
  value formatting, inherited styles, templates, and record-slot resolution.
- `js/sample-data.js` — deterministic fictional Designer/Test PDF data. It is
  test infrastructure, not a simulated live game.
- `js/v030-*` — active normalized schema-v2 adapters, lineage, compatibility,
  persistence, and production cutover.
- `js/v040-*` — active settings, Home/Game Day policy, field-palette,
  pitcher-group, Designer-interaction, and backup subsystems.
- `js/v050-*` — active competition, postseason, and player-identity policy.
- `js/v060-*` and `js/v061-*` — active doubleheader cutoff, generation, layout
  name, and filename safeguards.
- `js/v070-*` — active Help, onboarding, PDF stat-scope, and Division
  Standings behavior.
- `js/v100-*` — active What's New and bundled Starter Layout behavior.
- `assets/icons/` and `manifest.webmanifest` — favicon, Apple touch icon, and
  installed web-app identity.
- `assets/starter-layout/Scorecard-Studio-Starter-Layout.json` — bundled
  single-layout backup, including its embedded PDF.
- `app-meta.json` — displayed runtime version and internal build number.

Version-prefixed modules describe the milestone in which a subsystem was
introduced. If they are imported through the `js/app.js` dependency graph,
they are current runtime code. Do not delete or consolidate them based only on
their filenames.

The v1 runtime dependency graph currently excludes the development-only or
unreferenced `field-diagnostic.js`, `normalize.js`, and
`v040-field-surfaces.js`. Confirm the graph again before relying on that list in
a later release.

### Development material

- `tests/` — current and historical Node tests plus fixtures.
- `tests/v100-release-gate-manifest.json` — explicit maintained v1 test set.
- `tools/run-v100-release-gate.mjs` — active automated release gate.
- `schemas/` — design-time schema evidence; the browser does not fetch these.
- `docs/` — current decisions, contracts, checkpoints, and history.
- `tmp/` and `output/` — scratch/generated material; never publish these.

## 4. Runtime data flow

The normal flow is:

```text
Schedule and selected game
        -> determine layout requirements or Game Day requirements
        -> fetch only required roster/People/context sources
        -> normalize to schema-v2 snapshot with availability and lineage
        -> resolve canonical fields and collection rows
        -> format through shared field/template rules
        -> display in Game Day/Designer or draw into the PDF
```

Important rules:

- Home remains Schedule-first and lightweight.
- Opening Game Day or generating a selected layout may hydrate additional
  sources required by that consumer.
- Prefer immutable pregame sources: Schedule, date-specific rosters, bulk
  People data, and date-appropriate standings.
- `/feed/live` is supplemental when a narrower immutable source cannot provide
  a value; never let completed-game mutations silently become historical
  pregame truth.
- Player season/YTD cutoffs normally end before the selected game.
- For a same-day doubleheader Game 2, supported player/team values may advance
  through completed Game 1. Standings-derived fields such as position and Last
  10 intentionally remain on the previous-day standings snapshot.
- Absence has meaning. Preserve distinctions such as unavailable, unposted,
  omitted, not requested, unsupported, and not applicable. Do not manufacture
  plausible-looking fallback values.

The normalized contract lives in `js/v030-contract.js`:

- schema ID: `scorecard-studio.normalized-game`
- schema version: `2`
- contract revision: `0.3.0-draft.2`

Lineage and availability metadata are functional behavior, not diagnostic
decoration. New sources or fields must preserve truthful provenance and cutoff
semantics.

## 5. Persistence and compatibility

IndexedDB database: `scorecard-studio`  
Database version: `4`

Stores:

- `settings`, key path `key`
- `pdfTemplates`, key path `key`
- `layouts`, key path `id`
- `normalizedSnapshotsV2`, key path `key`
- `adapterResultsV1`, key path `key`

Do not rename stores or increase the database version without an upgrade plan,
migration tests, and reset/backup verification.

Layout records have evolved through multiple schema levels. Do not assume all
saved layouts have the newest shape. `js/v030-layout-compatibility.js` loads a
compatible in-memory representation while preserving unknown field IDs.
Canonicalization is persisted only through an explicit user save.

Compatibility rules:

- Existing layouts and PDFs are user data, not disposable caches.
- Unknown future or extension properties should survive when practical.
- A data-model cleanup must not silently rewrite every stored layout.
- Changes to field identity require aliases/compatibility behavior and tests.
- Browser reset must coordinate other open tabs and return them to a fresh app
  state.
- First-visit detection is IndexedDB-authoritative; a leftover localStorage
  preference must not suppress Welcome after the database has been deleted.

## 6. Backup and restore

The implemented backup is JSON, not ZIP:

- format: `scorecard-studio-backup`
- format version: `1`
- scopes: complete backup and one-layout backup
- PDFs: Base64 data with size and SHA-256 validation

The safety sequence is:

```text
read/export a consistent storage snapshot
or
parse -> validate -> decode/hash PDFs -> compatibility analysis
      -> conflict decisions -> commit plan -> atomic IndexedDB commit
```

`js/v040-backup-import.js` is preflight-only and performs no writes.
`js/v040-backup-restore.js` creates decisions/plans and coordinates the atomic
commit through `js/storage.js`. Maintain that separation. Invalid, oversized,
corrupt, ambiguous, or conflicting input must stop before writes.

When adding an ordinary portable setting, extend the registry in
`js/v040-backup-settings.js`; do not hard-code special handling throughout the
backup engine.

## 7. Designer and PDF invariants

- Stored placement coordinates are page-relative, not screen pixels.
- Stored text sizes are PDF points.
- Text placement uses baseline-left anchor semantics unless an explicit newer
  schema introduces another anchor.
- Designer zoom changes presentation only; it must not alter persisted
  coordinates or font sizes.
- Designer representative data is deterministic and intentionally exercises
  long/short values, handedness, and collection capacity.
- **Generate Test PDF** always uses representative data. Live generation uses
  the selected game outside Designer.
- Direct fields, templates, repeated blocks, individual placements, record
  layouts, and Division Standings must resolve through shared field/formatting
  semantics.
- Preview and PDF density will differ if they use different measurements.
  When fixing one surface, compare both rather than applying a visual-only
  patch.
- Touch selection, lasso, drag thresholds, mouse interaction, keyboard nudging,
  zoom, page changes, clipboard placement, undo/redo, and resizing are related
  interaction contracts. Test the affected input modes together.

## 8. Field and presentation changes

Use `js/field-registry.js` as the canonical field catalog. Field identity must
be independent of the endpoint that currently supplies its value.

When adding a field:

1. Verify the authoritative MLB/MiLB source and pregame cutoff.
2. Add the normalized value and truthful availability/lineage behavior.
3. Add the registry definition and correct product surfaces/category.
4. Add representative data that makes mistakes visually obvious.
5. Add or update formatting and template resolution if required.
6. Verify Game Day, Designer preview, Test PDF, and live PDF as applicable.
7. Verify Home/Away symmetry and MLB/MiLB/postseason applicability.
8. Add focused tests and, if it is a release contract, the active gate entry.

Do not infer missing names, roles, handedness, competition halves, series
context, or other facts merely because a fallback looks reasonable.

## 9. Starter Layout maintenance

The bundled asset is a valid one-layout backup. The current stable identity is
defined in `js/v100-starter-layout.js` and must match the JSON:

- name: `Scorecard Studio Starter Layout`
- layout ID: `ca4bbef0-5e0e-4aca-bc5b-6961469c537f`
- PDF template ID/key: the same UUID
- exactly one layout, one PDF, and no settings

Normal update procedure:

1. Install the Starter Layout in the app.
2. Edit it directly, without duplicating it.
3. verify Designer preview and Test PDF.
4. Export that one layout.
5. Replace the bundled JSON using the exact repository filename.
6. Update the asset/cache identity for the shipping release.
7. Run the Starter Layout tests and full release gate.

Keeping the UUID means existing installed/customized copies are not silently
updated; new installations and reinstalls receive the new asset. A design that
must be offered alongside an existing copy requires a new identity and an
explicit product workflow.

## 10. Version, cache, changelog, and onboarding

- Update `app-meta.json` once per release/build. Stable versions display the
  version without the internal build number.
- All first-party URLs and ES-module imports use one coherent query-string
  cache identity. Do not leave mixed cache keys after a release.
- `js/v100-whats-new.js` owns changelog entries and version-aware display.
- A first-time visitor sees Welcome, not What's New.
- v1 establishes the changelog baseline silently. Later versions may show
  release notes only to returning users who have crossed that version.
- Help can always open What's New and must return to Help when it closes.
- The PWA manifest and icon URLs must remain relative to the project site.

## 11. Automated and manual verification

Run from the repository root:

```text
node tools/run-v100-release-gate.mjs
```

The runner:

1. syntax-checks every JavaScript file under `js/`;
2. loads the explicit current list from
   `tests/v100-release-gate-manifest.json`;
3. runs those Node tests.

Hundreds of historical tests remain as implementation evidence. Some assert
frozen source shapes, old cache identities, or old build labels. Running every
test indiscriminately is useful for research but is not the v1 release gate.
Do not rewrite historical evidence merely to make a global count green; update
the maintained manifest when a current contract genuinely changes.

Manual verification should be proportional to the change. The complete v1
matrix includes:

- desktop, narrow browser, Safari/iPad, Chrome/iPad, and installed PWA;
- Home schedule selection and Game Day for MLB, MiLB, historical, postseason,
  and supported split contexts;
- legacy and current layouts across reload/save;
- Designer mouse, keyboard, and touch interaction;
- representative Test PDF and live PDF comparison;
- complete and one-layout backup export/import, including conflict/failure
  preflight;
- local-data reset with a second tab open;
- Welcome, tour, Help, and What's New navigation;
- Starter Layout install/delete/reinstall;
- favicon/home-screen icon, filenames, long names, and doubleheaders.

## 12. Release and packaging

The development repository and deployable archive have different purposes.

Keep in source control:

- runtime files;
- tests and fixtures;
- schemas and tools;
- current documentation and selected historical evidence.

Publish only:

- `.nojekyll`, `index.html`, `app-meta.json`, `manifest.webmanifest`,
  `README.md`, and `LICENSE`;
- `css/styles.css`;
- the runtime JavaScript dependency closure rooted at `js/app.js`;
- required icons and the bundled Starter Layout asset;
- a generated per-file checksum manifest when distributing an archive.

Never publish `docs/`, `tests/`, `tools/`, `schemas/`, `tmp/`, `output/`, old
archives, or source/master artwork. Recompute the JavaScript dependency closure
for each release rather than relying forever on the v1 file count.

Release sequence:

1. Complete scoped implementation and focused tests.
2. Update version/build, cache identity, changelog/help, and public README as
   applicable.
3. Run the active automated gate.
4. Run the relevant manual matrix in local and deployed environments.
5. Record acceptance.
6. Build the runtime-only archive and verify every manifest hash.
7. Deploy the runtime package, not the development workspace.

## 13. Safe change checklist for a new maintainer

Before changing code:

- State the user-visible problem and affected workflows.
- Identify the current module and persisted contracts involved.
- Search current tests and documentation for an accepted behavior decision.
- Decide whether the change needs migration, compatibility, or cache work.

While changing code:

- Prefer a focused pure helper/module over adding more unrelated logic to
  `app.js`.
- Preserve unrelated behavior and user data.
- Keep UI language user-facing; do not expose adapter/developer terminology.
- Add deterministic tests at the narrowest useful layer.

Before declaring completion:

- Run the active gate and relevant manual checks.
- Verify reload/persistence and both Test/live PDF paths if applicable.
- Check narrow/touch behavior for dialog or Designer changes.
- Reconcile Help, README, changelog, and cache identity if the public contract
  changed.

## 14. Current roadmap authority

`docs/POST_V050_ROADMAP.md` is the reconciled roadmap through v1.0.0. Its v1
Build 001 and Build 002 sections are accepted and closed. Older plan documents
often contain unfinished or future-looking language that was later superseded.

At the v1 handoff there is no unfinished committed feature build. New work
should begin with a bounded issue/plan, preserve v1 compatibility, and define
its acceptance tests before implementation.

## 15. Historical context

`docs/history/AI_PRE_V1.md` explains the earlier AI guide and why it was
archived. The old guide remains useful for design intent, but it is not an
instruction source for current implementation or release status.
