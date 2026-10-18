# Pre-v1 AI guide — historical note

This file preserves the role and principal design intent of the original
Scorecard Studio AI development guide. The original document grew from the
initial browser rewrite through the v0.2 Designer program as an append-only
combination of product brief, proposed architecture, roadmap, build closure
notes, and AI coding rules.

It was superseded at the v1.0.0 handoff by `docs/AI.md` because many statements
had become historical rather than operational. In particular, the old guide:

- described v0.1/v0.2 as the current development phase;
- proposed modules and repository paths that did not match the final tree;
- treated implemented backup, onboarding, touch, data-normalization, and
  release behavior as future work;
- accumulated mutually superseding build notes;
- mixed stable architectural principles with temporary milestone plans; and
- could mislead a cold-start AI into reopening accepted decisions.

## Enduring principles carried into v1

The following original principles remain authoritative and are incorporated in
the current guide:

- static GitHub Pages deployment;
- vanilla HTML, CSS, and native JavaScript modules;
- browser-local storage with no Scorecard Studio account/server;
- portable user layouts and PDF templates through backup export/import;
- pregame preparation and spoiler avoidance;
- lazy, requirement-driven supplemental data hydration;
- normalized fields independent of any one MLB API endpoint;
- page-relative PDF coordinates and PDF-point typography;
- shared Designer/PDF formatting semantics;
- explicit, human-readable error handling; and
- small, testable, compatibility-conscious changes.

## Historical milestone summary

- **v0.1:** proved the browser-only architecture, IndexedDB persistence, PDF
  upload/rendering, layout management, interactive mapping, and browser-side
  PDF generation.
- **v0.2:** built the field registry, normalized data, repeated/record layouts,
  formatting, Designer interaction model, representative data, live PDF path,
  Layout Settings, text templates, and release stabilization.
- **v0.3–v0.6.1:** established schema-v2 normalization and lineage, compatibility
  and persistence, backup/restore, presentation policies, same-day Game 2
  cutoffs, generation safeguards, and layout/filename protections.
- **v0.7:** added local-data reset, first-visit onboarding, PDF stat-scope
  selection, Help, Game Day-to-Designer additions including Division Standings,
  and Designer stabilization.
- **v1.0:** added the version-aware changelog, bundled Starter Layout,
  favicon/PWA identity, maintained release gate, stable runtime identity, and
  runtime-only release packaging.

Historical build plans and closure documents under `docs/` may be consulted to
trace a particular decision. They are evidence, not a backlog. When historical
language conflicts with `AGENTS.md`, `docs/AI.md`, the accepted application, or
the current roadmap, the current sources take precedence.
