# Build 021.1 — Touch-Safe Lasso Cleanup

## Purpose

Build 021.1 is a narrow acceptance-fix pass for Build 021 Multi-Select. The accepted desktop multi-select behavior is preserved. This update prevents touch/pinch/pan gestures from initiating or leaving behind Designer lasso rectangles.

## Changes

- Lasso selection can start only from a primary **mouse** pointer using the primary button on empty PDF/overlay space.
- Touch and pen pointer events do not initiate lasso selection.
- The lasso rectangle is not shown until the pointer moves at least 8 pixels from its starting point.
- Lasso state tracks the initiating pointer ID so unrelated pointer activity cannot update or complete the selection.
- Pointer capture is used defensively for an active mouse lasso.
- `pointercancel` and `lostpointercapture` both clean up the active lasso without selecting anything.
- Starting a new lasso first removes any stale lasso state/overlay, preventing orphaned rectangles if a prior gesture was interrupted.
- Existing Ctrl/Cmd-click selection, mouse lasso selection, group formatting, movement, alignment, deletion, and Undo/Redo behavior are unchanged.

## Acceptance checklist

1. Normal mouse lasso selection still selects fully enclosed items.
2. Ctrl/Cmd-click multi-selection still behaves exactly as in Build 021.
3. Small mouse movement below the threshold does not display a lasso rectangle.
4. Touch/pinch/pan gestures do not start a lasso selection.
5. Interrupted pointer gestures do not leave blue lasso rectangles behind.
6. A new lasso cannot leave a previous lasso overlay stranded.
7. Existing Build 021 multi-select acceptance items remain passing.
