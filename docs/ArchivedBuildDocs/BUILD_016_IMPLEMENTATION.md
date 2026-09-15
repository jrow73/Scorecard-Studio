# Build 016 Implementation - Designer Interaction Model

Build 016 refines the accepted Build 015 workspace around a single-selection, contextual-editor model.

## Build 016.2 UX Cleanup

Build 016.2 consolidates the UX findings from the Build 016/016.1 browser passes and the first complete iPad scorecard-design workflow.

### Selection and inspector
- The Designer keeps one authoritative selection across the left data palette, PDF canvas, and right inspector.
- When nothing is selected, the right panel shows only the `Nothing selected` state.
- Clicking a data item with exactly one existing instance selects that instance directly.
- Data items with multiple uses show child instances beneath the parent item; each child can be selected independently.
- `Create New Instance` returns to the selected data item's creation choices without deleting the existing instance.

### Progressive disclosure
- Single-value data asks **Single Item** vs **Text Template** only when creating a new instance.
- Collection data asks **Repeated Layout** vs **Individual Placement** only when creating a new instance.
- After the user chooses a usage type, the question collapses to a compact `Usage ... Change` summary.
- The selected palette item already establishes the data/collection; redundant Field/Collection selectors are hidden from the normal contextual workflow.
- Repeated Layout creation now reads as a single flow: choose arrangement/capacity -> **Set Placement** -> follow temporary on-canvas instructions -> add slot fields.
- Slot-field controls remain hidden until repeated-layout geometry has actually been placed.
- Existing repeated layouts are selected from their named child instances in the left palette rather than from a generic block dropdown.
- `Change Placement` is available when editing an existing repeated layout.

### Data palette
- Categories are navigation, not intent checkboxes.
- Expanding a category does not mark every field as unfinished or unplaced.
- The palette shows **Available Data** with expandable categories and per-item usage status.
- Search filters the palette by field/category name.
- `Used only` limits the palette to fields/collections already placed or referenced by a Text Template.
- A field referenced by a Text Template counts as used but remains available for reuse.
- The old Placed/Unplaced counters and duplicated Placed list are no longer the primary workflow.

### Calm property editing
- Typed X, Y, font-size, and template edits are treated as drafts while the user is typing.
- Changes commit when focus leaves the control, when Tab is used, or when Enter is used for single-line controls.
- Escape restores the pre-edit value.
- Dragging, keyboard nudging, alignment dropdowns, and other discrete actions still update immediately.
- This prevents temporary values such as `25` while editing `250` -> `255` from making the object jump around the scorecard.

### Viewport zoom
- Mouse-wheel zoom now uses the pointer location as the focal point.
- Pinch zoom uses the midpoint between the two touches as the focal point.
- +/- buttons and preset percentage changes preserve the current viewport center.
- Zoom changes only the Designer camera/view. Stored PDF coordinates and generated-PDF placement are unchanged.

### Width/stretch containment
- Designer/status containers now enforce `min-width: 0` and wrap long generated-PDF messages/filenames so post-generation text cannot force the workspace grid wider.
- Browser acceptance must confirm whether this eliminates the longstanding post-generation stretch issue.

## Preserved
- Universal left/center/right alignment for Single Items.
- Repeated vertical/horizontal/grid layouts.
- Individual placement by slot/order and supported semantic roles.
- Text Templates, multiline rendering, missing-value behavior, and field-reference tracking.
- PDF-only zoom controls and page switching.
- Drag/nudge editing and generated-PDF coordinate accuracy.

## Deferred
- Starting Pitcher record expansion remains Build 017 data-model work.
- Full Undo/Redo snapshot history remains a follow-up after the revised 016.2 interaction model is browser-validated.
- Conditional/static color formatting remains deferred.


### Build 016.2 Interaction Hotfix
- Restored native wheel/trackpad scrolling in the PDF viewport. Scorecard Studio no longer intercepts wheel, Ctrl+wheel, or touch pinch gestures.
- Browser/device zoom gestures are left to the browser. PDF-only zoom remains available through the explicit minus, percentage, and plus controls; those controls preserve the visible viewport center.
- Added a conventional disclosure chevron to palette category headers so collapsed and expanded state is visually obvious while the full header remains clickable.

## Build 016.2 Umpire Repeated-Layout Hotfix

Fixed an Umpire Crew-only repeated-layout routing defect. The object-driven palette correctly selected `game.umpires.crew`, but the legacy repeated-block collection selector did not contain that collection and the creation guard did not recognize it. The repeated-block creator therefore fell back to `away.lineup`. The hidden compatibility selector and supported collection set now both include `game.umpires.crew`, so Umpire Crew creation carries the selected collection through geometry placement without special-casing the rendered block.


## Build 016.2 consolidated UX refinement

This candidate consolidates the start-to-finish Designer acceptance findings after the Umpire Crew hotfix.

- Desktop PDF interaction uses ordinary wheel/trackpad scrolling. Ctrl/Cmd+wheel performs PDF-only zoom in 5% increments (50%-300%), anchored at the normal page origin. The toolbar now shows passive `Zoom: N%` status and a Reset button instead of +/-/preset controls. Touch pinch is not custom-handled.
- Palette organization is task-oriented: Game Information (including Umpire Crew), Away/Home Team Information, and Away/Home Players. Starting Pitcher, Starting Lineup, Bench, and Bullpen live under the appropriate Players group. Palette hierarchy is presentation only and does not change normalized data/collection IDs.
- Text Template preview is directly below the template editor. Existing Text Template instances now expose the same Insert Field helper as creation, inserting at the current caret/selection.
- Inspector numeric typing commits on Enter/Tab/blur; native spinner clicks and Arrow Up/Down increments apply immediately. Alignment and scorecard-object nudges remain immediate.
- Inspector/tool content is top-stacked instead of vertically distributed on tall displays.
- Repeated layouts with geometry but zero slot fields are treated as incomplete/empty: they are skipped during rendering and overflow validation, identified as `No fields` in the palette, and reported as a non-blocking generation notice when other content is generated.
- The confirmed Umpire Crew repeated-layout routing fix remains included.
- Starting Pitcher record/stat expansion remains deferred to Build 017.

## Build 016.2 Final Interaction Hotfix

Two interaction regressions were corrected before final Build 016.2 acceptance:

- **Palette-to-PDF navigation restored.** Selecting an existing placed instance from the Field Palette now switches to the correct PDF page when necessary and then scrolls the selected rendered object into the center of the PDF viewport. This restores the earlier Show/navigation behavior while retaining the unified Designer selection state.
- **Legacy-style PDF zoom/pan restored.** The PDF viewport remains an ordinary scrollable container. Normal wheel/trackpad input scrolls it. `Ctrl`/`Cmd` + wheel applies PDF-only zoom in 10% increments, matching the behavior of the legacy Automatic Scorecards v9 mapper more closely. The PDF stays normally anchored and grows right/down; no focal-point calculations are performed. The passive `Zoom: N%` indicator and Reset control remain.
- **Touch gestures are no longer restricted by Designer CSS.** The explicit `touch-action: pan-x pan-y` rule was removed from the PDF viewport, and no custom pinch handler is used. This allows browser/remote-desktop touch handling to pan/magnify naturally, including iPad use through Windows App/Tailscale.

PDF coordinate storage and generated-PDF geometry are unchanged.



## Build 016.2 Final Designer UX Cleanup

Five acceptance findings were addressed without changing stored PDF coordinates or generation semantics:

- New Text Template creation now initializes a fresh draft. A field-initiated template begins with only that field token; previous template editor contents are never inherited. Existing template editing remains instance-specific and retains Insert Field support.
- Palette category expansion is session UI state. Selection changes, Escape, and deselection no longer collapse categories the user opened.
- Palette hierarchy now uses fixed disclosure/status columns and a consistent child rail so used and unused fields align and remain visually subordinate to category headers.
- Selected mapping anchors use a small precision crosshair instead of the large red dot, while the existing blue selection bounds and baseline remain.
- Individual Placement is treated as an ongoing collection usage. The palette groups its child mappings beneath an `Individual Placement • N of M placed` entry; selecting that entry reopens the placement workspace, placement advances to the next unplaced role/slot when possible, and the inspector no longer presents `Create New Instance` as though it would create another selected role.

The previously accepted Palette-to-PDF navigation and legacy-style zoom/pan behavior are preserved.


## Final acceptance

Build 016 is **ACCEPTED**. The final accepted interaction model is the Build 016.2 state documented above, including the final interaction hotfixes and Designer UX cleanup. Subsequent Designer work should treat this behavior as the baseline and should not reintroduce the superseded intermediate zoom/selection variants described earlier in this implementation history.

The next planned implementation milestone is **Build 017 — Starting Pitcher Record Expansion**. Full Undo/Redo, broader formatting, synthetic collection preview data, and generation-result polish remain follow-up Designer-completion work.
