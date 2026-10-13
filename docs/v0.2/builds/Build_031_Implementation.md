# Build 031 — Text Template Workflow Completion

## Status
Accepted and closed through Build 031.1.

## Purpose
Build 031 removes the redundant palette and Inspector steps from creation of a **generic Text Template** while preserving the existing saved-layout representation and all contextual Text Template behavior.

## Implemented workflow
The generic Text Template palette hierarchy is now intentionally flattened:

**Before**

`Text Template category -> Text Template item -> instance(s)`

**Build 031**

`Text Template category -> instance(s)`

The visible **Text Template** category now serves two distinct actions:

- **Chevron:** expand/collapse existing generic Text Template instances.
- **Category title/body:** begin creation of a new generic Text Template.

Starting creation immediately enters the Text Template editor. The redundant one-option **How would you like to use this? -> Text Template** step is no longer shown.

## Architecture
The change is intentionally presentation/workflow-only. Generic templates continue to use the existing internal `kind: "custom"` palette identity and existing mapping representation (`content.type === "template"` with no context). No saved-layout schema migration is required.

Contextual Text Templates created through fields/records retain their existing behavior and hierarchy.

## Acceptance checklist

### Generic Text Template palette
- [x] Palette shows a single top-level **Text Template** category with no nested second **Text Template** item card.
- [x] Existing generic template instances appear directly beneath that category when expanded.
- [x] Chevron click only expands/collapses the instance list.
- [x] Clicking the category title/body begins creation of a new generic Text Template.

### Creation workflow
- [x] Creation opens directly in the Text Template construction controls.
- [x] No one-choice **How would you like to use this?** screen appears.
- [x] No redundant **Usage: Text Template** summary appears for this generic workflow.
- [x] A new generic Text Template can be configured, placed, selected, edited, and removed normally.
- [x] Creating a second generic Text Template from an existing selected template also opens directly in the Text Template editor.

### Regression
- [x] Existing saved generic Text Templates load and appear under the flattened category.
- [x] Context-scoped Text Templates created from normal palette fields continue to work unchanged.
- [x] Context-scoped Text Templates retain their existing context/token behavior.
- [x] Undo/Redo continues to work for generic Text Template placement/removal.
- [x] Copy/Paste and selection behavior for existing Text Template mappings remain unchanged.
- [x] Generate Test PDF and Live PDF render Text Templates normally.

## Scope note
The previously observed Starting Pitcher Sort control was determined to be a stale-browser/refresh artifact and is not part of Build 031.

## Build 031.1 closure
Build 031.1 removed the empty legacy chooser panel left behind by the flattened generic Text Template workflow and standardized shared Text Template editing terminology to **Editor** and **Insert into editor**. Acceptance testing confirmed that the shared terminology also flows through Text Template editing inside repeated-record object areas, so no Build 031.2 consistency fix is required.

## Final status
Build 031 is accepted and closed through **Build 031.1**. The next implementation bucket is **Build 032 — Designer Remaining Tweaks**, followed by the **v0.2.0 release review**.
