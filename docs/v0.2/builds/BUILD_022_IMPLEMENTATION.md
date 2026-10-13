# Build 022 — Copy / Paste + Away↔Home Translation

## Goal
Add Designer clipboard workflows on top of the accepted Build 021.2 multi-selection model, and centralize displayed application version/build metadata.

## Scope
- Copy a single selected object or the current multi-selection.
- `Ctrl/Cmd+C` copies the current Designer selection; `Ctrl/Cmd+V` begins exact paste placement.
- Paste always enters ghost-placement mode. Nothing is committed until the user clicks inside the PDF.
- While paste placement is pending, the user may change PDF pages, scroll, zoom, or use other non-PDF controls without accidentally placing the copy. Escape cancels.
- Eligible Away-only copied content exposes **Away → Home** paste. Eligible Home-only content exposes **Home → Away** paste.
- If copied content includes both Away and Home data contexts, neither translated-paste command is offered. Neutral content may accompany a one-sided translated copy unchanged.
- Translation preserves geometry, formatting, selectors, Text Templates, and repeated-layout structure while converting data bindings to the opposite team where appropriate.
- A pasted group is one saved Designer action and therefore one Undo step.
- Repeated-layout child selections copy their complete parent repeated layout so copied content remains structurally valid.

## Version metadata
`app-meta.json` is the single build/version display source. The home/sidebar, diagnostic, layouts, and Designer labels load from it at startup. Update this file once per build instead of hard-coding independent labels.

## Explicitly out of scope
- System clipboard serialization between browser tabs/devices.
- Cross-layout clipboard persistence after reload.
- Team translation for mixed Away+Home selections.
- Permanent grouping.

## Acceptance checks
1. Copy/Paste duplicates a single scalar object and waits for a valid PDF click before committing.
2. A copied multi-selection preserves relative spacing.
3. Next/Previous page, scrolling, zooming, Inspector/toolbar clicks do not accidentally place pending paste content.
4. Escape cancels pending paste.
5. Ctrl/Cmd+C and Ctrl/Cmd+V match the visible controls.
6. Away-only selections offer Away → Home; Home-only offer Home → Away; mixed selections offer neither.
7. Text Template bindings translate without rewriting ordinary literal text.
8. Repeated/Record Layout copies preserve their complete block geometry and slot content.
9. One paste is restored/removed by one Undo/Redo action.
10. All visible current-build labels display from `app-meta.json`.
11. README.md remains unchanged.
