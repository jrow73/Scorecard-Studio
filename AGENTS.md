# Scorecard Studio development instructions

Read `docs/AI.md` before changing the application. It is the current v1
architecture, persistence, testing, and release handoff. Historical build
documents are evidence, not current requirements.

## Non-negotiable product boundaries

- Scorecard Studio is a static, local-first browser application. Do not add a
  backend, accounts, telemetry, or cloud storage without an explicit product
  decision.
- Preserve the pregame-only, spoiler-safe workflow. Do not introduce live
  scores, inning state, or postgame facts into ordinary pregame surfaces.
- User layouts, PDF templates, preferences, and caches stay in the browser.
  Backup export/import is the supported portability mechanism.
- Keep GitHub Pages compatibility: vanilla HTML, CSS, native ES modules, and
  relative asset paths. Do not add a framework or build system casually.

## Change safety

- Treat `app-meta.json` as the runtime version/build source of truth.
- Treat the `v030-*`, `v040-*`, `v050-*`, `v060-*`, `v061-*`, `v070-*`, and
  `v100-*` modules imported by `js/app.js` as current runtime code, not old
  copies to delete.
- Do not change IndexedDB, normalized-model, layout, or backup structures
  without an explicit compatibility/migration plan and tests.
- Load saved layouts through `js/v030-layout-compatibility.js`; preserve unknown
  fields and do not persist compatibility normalization without an explicit
  save.
- Import backups through preflight, conflict planning, and atomic commit. Never
  write imported records before validation succeeds.
- Keep Designer preview, Test PDF, and live PDF field resolution/formatting
  behavior aligned.
- Preserve relative PDF coordinates, PDF point sizes, and baseline-left text
  anchor semantics unless a deliberate schema change says otherwise.
- Do not silently overwrite a user's installed or customized Starter Layout.

## Verification

Run the maintained v1 gate from the repository root:

```text
node tools/run-v100-release-gate.mjs
```

The gate syntax-checks production JavaScript and runs the explicit test list in
`tests/v100-release-gate-manifest.json`. Do not use the pass/fail result of every
historical test file as the current release decision.

For UI, storage, PDF, touch, or browser changes, also run the relevant manual
checks described in `docs/AI.md`. Do not package or publish a release merely
because automated checks pass.

## Repository hygiene

- Keep development documentation, tests, fixtures, schemas, and tools in the
  source repository.
- Publish only the runtime allowlist described in `docs/AI.md`; never deploy
  `docs/`, `tests/`, `tools/`, `schemas/`, `tmp/`, or prior archives.
- Preserve unrelated user changes. Prefer small, reviewable changes and update
  tests with behavior changes.
