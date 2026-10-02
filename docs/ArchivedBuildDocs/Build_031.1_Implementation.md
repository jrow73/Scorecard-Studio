# Build 031.1 — Text Template Cleanup

## Status
Accepted. Build 031 closes at Build 031.1.

## Purpose

Build 031.1 is a narrow cleanup pass following the accepted generic Text Template palette flattening in Build 031. It removes one abandoned visual artifact from the old usage-selection workflow and clarifies the terminology used by the Text Template editor.

## Changes

### 1. Remove empty legacy chooser panel

Generic Text Template creation now enters the template workflow directly. The old New Item chooser panel therefore has no content for this path. Build 031.1 hides that empty panel during direct generic Text Template creation so the Text Template editor follows the **New Object — Text Template** heading without an empty rounded container between them.

Other object workflows retain their existing usage/summary panel behavior.

### 2. Text Template editor terminology

For the generic Text Template creation workflow:

- `Text template` is renamed to **Editor**.
- `Insert Field` is renamed to **Insert into editor**.

For an already-placed Text Template in the Selected Item inspector:

- `Template` is renamed to **Editor**.
- `Insert Field` is renamed to **Insert into editor**.

The object itself continues to be named **Text Template**. The new terminology distinguishes the object name from the textarea used to construct its contents.

### 3. Shared repeated-record terminology confirmed

The repeated-record Text Template areas inherit the same shared **Editor / Insert into editor** terminology automatically. Acceptance testing confirmed the wording is consistent in those object areas without a separate repeated-record code change. No Build 031.2 terminology fix is required.

## Acceptance checks

1. Click the generic **Text Template** palette category to create a new template.
   - PASS: no empty rounded chooser/summary container appears.
   - PASS: **Editor** appears immediately above the textarea.
   - PASS: the token button reads **Insert into editor**.

2. Place the Text Template and select it again.
   - PASS: the Selected Item view labels the textarea **Editor**.
   - PASS: the token button reads **Insert into editor**.

3. Verify ordinary Text Template behavior.
   - PASS: field tokens still insert at the caret.
   - PASS: preview still updates.
   - PASS: placement and editing still work.

4. Inspect Text Template editing/creation inside a repeated record (Lineup, Bench, or Bullpen).
   - PASS: the shared **Editor / Insert into editor** wording appears automatically in the repeated-record Text Template areas.
   - PASS: no separate Build 031.2 terminology fix is needed.

## Files changed

- `app-meta.json`
- `index.html`
- `js/app.js`
- `tests/build031.test.mjs`
- `tests/build0311.test.mjs`
- `docs/Build_031.1_Implementation.md`

## Closure

Build 031.1 passed acceptance and is the final decimal release for Build 031. Build 031 is closed. Remaining unrelated Designer polish will be collected under **Build 032 — Designer Remaining Tweaks** before the v0.2.0 release review.
