# Scorecard Studio — Build 017.2 Implementation

## Status

**Acceptance hotfix for Build 017.1**

Build 017.1 addressed six acceptance-patch items identified after Build 017. Follow-up manual acceptance testing confirmed that Items 2 and 6 are working as intended, Item 5 is substantially implemented but needs a small UI correction, and Items 1, 3, and 4 require additional work.

Build 017.2 is intentionally limited to these acceptance findings. It should correct the remaining UI and Inspector workflow issues without expanding into unrelated Designer capabilities.

---

# 1. Name Format — Correct Field-Specific Visibility

## Acceptance Result

**Build 017.1: FAILED**

The underlying Name Format functionality works, but the control remains visible in editing contexts where it has no meaning.

Observed examples include:

- Game Date as a Single Item
- collection-level Edit Layout properties
- non-name child fields inside a collection

## Required Behavior

The Name Format control must be visible **if and only if the specific field/content element currently being edited is a player-name-capable field**.

Examples where Name Format should appear:

- Starting Pitcher — Player Name
- Starting Lineup — Player Name
- Bench — Player Name
- Bullpen — Player Name
- applicable Individual Placement player-name fields
- future fields explicitly identified by shared field metadata as supporting player-name formatting

Examples where Name Format must not appear:

- Game Date
- Team Name
- Jersey #
- Position
- Throws
- Bats
- AVG
- ERA
- Batting Order
- parent collection/layout properties
- Text Templates
- any other non-player-name field

## Implementation Direction

Visibility must be determined from the **specific field being edited**, using the shared player-name capability metadata established for Build 017.1.

Do not infer eligibility merely because:

- the parent object is a player collection
- the collection contains a Player Name field
- the selected presentation supports player-name formatting elsewhere
- the Inspector happens to be displaying a Name Format value

A parent collection/layout does not itself have a player name to format.

## Preservation Requirement

Build 017.1 Item 2 passed acceptance testing. Do not change the working shared Name Format behavior while correcting visibility.

---

# 2. Name Format — Shared Functionality

## Acceptance Result

**Build 017.1: PASSED**

Name Format correctly applies to supported player-name fields, including the collection and Individual Placement use cases tested during acceptance.

## Build 017.2 Requirement

No functional redesign is required.

Preserve:

- Full Name
- First Initial + Last Name
- Last Name
- First Name
- Use Name + Last Name
- immediate Designer preview updates
- generated PDF behavior
- shared behavior across Starting Pitcher, Starting Lineup, Bench, Bullpen, and applicable Individual Placement mappings

Build 017.2 changes for Item 1 must not regress this functionality.

---

# 3. Object Lifecycle and Parent/Child Separation

## Acceptance Result

**Build 017.1: FAILED**

The intended separation between the reusable parent object and its child content was not fully achieved.

Observed problems include:

- parent object controls and child editor controls remain visually mixed in the same card
- when editing a child, the Inspector does not clearly identify which child is being edited
- Edit Layout is separated from the parent object controls
- Edit Layout can continue to display X/Y coordinates belonging to the previously selected child
- Change Placement is visually separated from the layout-editing workflow
- controls can appear during new/unplaced creation even though no corresponding layout or child exists
- Selected Item behaves like a glowing mode button rather than a meaningful editing workspace

## Permanent Parent Object Card

Once an object/presentation exists, the top Inspector card must represent the **parent object/instance**.

Example:

### Selected Object

**Away starting lineup**

Parent-level controls should be grouped here:

**[Deselect] [Delete] [New Instance] [Edit Layout]**

The exact responsive wrapping may vary with available width, but these actions belong to the same parent-object control area.

### Deselect

Clears the current selection.

### Delete

Deletes the complete object/instance named in the Selected Object card.

For a collection presentation, this deletes the presentation and all child content belonging to that instance.

The meaning of Delete must never change because a child is selected.

### New Instance

Begins creation of another instance/use of the underlying data item or collection.

For reusable collections, this must continue to allow presentation choices such as:

- Repeated Layout
- Individual Placement

The same collection remains reusable regardless of which presentation type was created first.

### Edit Layout

Edit Layout is a **parent-object action** and belongs with the other parent controls.

Activating it opens the parent/layout editing workspace described in Item 4.

It must select/edit the actual parent collection/layout geometry rather than retaining child geometry from a previous selection.

## Child Removal

Child content must use a separate action:

**Remove Item**

Remove Item deletes only the selected child mapping/content element.

It must never change the meaning of the parent Delete action.

## New / Unplaced Creation

An unfinished object does not yet have an existing layout, selected child, or additional item-placement workspace.

During initial creation:

- use **Cancel** where appropriate
- do not show Edit Layout for a layout that does not yet exist
- do not show Selected Item when no child exists/is selected
- do not show Place New Item until the collection/presentation geometry required to place child content has been established

The UI should expose only actions that are valid for the current creation state.

---

# 4. Collection Inspector Hierarchy and Progressive Reveal

## Acceptance Result

**Build 017.1: FAILED**

Items 3 and 4 overlap substantially. Build 017.2 should treat them as one coherent Inspector correction rather than independent patches.

## Core Inspector Model

For an existing collection/presentation, the Inspector consists of:

1. a permanent **Selected Object** parent card, and
2. **one active subordinate editing workspace at a time**.

The subordinate workspace is one of:

- Edit Layout / Edit Placement
- Selected Item
- Place New Item

These are editing contexts, not three persistent mode buttons that must always remain visible.

The UI should always make it obvious:

> What object am I working with, and what part of it am I editing right now?

---

## A. Parent Selected Object Card

The parent Selected Object card remains stable while editing the collection.

Example:

**Away starting lineup**

**[Deselect] [Delete] [New Instance] [Edit Layout]**

Selecting a child must not replace or blur this parent identity.

Child-specific controls do not belong inside this card.

---

## B. Edit Layout / Edit Placement Workspace

Activating **Edit Layout** from the parent card opens a visually separate layout-editing card/workspace.

It must operate on the **parent collection/presentation**, not the previously selected child.

Applicable controls belong here, including:

- parent/layout X position
- parent/layout Y position
- keyboard/arrow movement for the parent anchor
- layout geometry
- row/column/spacing controls as applicable to the presentation type
- Change Placement

**Change Placement belongs inside this workflow.** It should not appear as a disconnected action below unrelated controls.

When Edit Layout is active:

- Selected Item controls are not displayed
- Place New Item controls are not displayed
- X/Y values must represent the parent/layout anchor

---

## C. Selected Item Workspace

When a placed child is deliberately selected, display a separate **Selected Item** card/workspace.

This should not be represented merely by a highlighted “Selected Item” button.

The card must identify the selected child, for example:

### Selected Item

**Player Name**

or:

**Jersey #**

or:

**Text Template**

The child editor then contains only properties applicable to that child, such as:

- child X/Y or applicable offsets
- font size
- alignment
- Name Format only if that child is a player-name-capable field
- other child-specific properties
- Remove Item

The parent Selected Object card remains visible above it and continues to identify the collection/presentation.

When Selected Item is active:

- Edit Layout properties are not displayed
- Place New Item creation controls are not displayed

Selecting a different placed child updates the Selected Item identity and editor.

---

## D. Place New Item Workspace

For an existing collection/presentation whose geometry has been established, provide a **Place New Item** action/workspace.

Opening it displays a separate creation card and closes/hides the other subordinate editing workspaces.

The first decision is:

**Content Type**

- Field
- Text Template

Use Progressive Reveal from that choice.

### Field

After Field is selected, reveal only applicable controls, such as:

- Slot Field
- Alignment
- Font Size
- Name Format only if the selected Slot Field is player-name-capable
- Add/Place Slot Content

### Text Template

After Text Template is selected, reveal only template-related controls:

- Text Template editor
- Preview
- Insert Field
- Alignment
- Font Size
- Add/Place Slot Content

Do not show:

- the normal Slot Field selector
- generic Name Format

Per-token Name Format remains outside Build 017.2 scope.

---

## E. Mutually Exclusive Workspaces

Only one subordinate workflow should be active at a time.

- Edit Layout closes/hides Selected Item and Place New Item
- selecting an existing child activates Selected Item and closes/hides the others
- Place New Item closes/hides Edit Layout and Selected Item

The parent Selected Object card remains visible throughout.

The subordinate workspaces should be visually distinct cards/sections so parent and child concepts are not mixed together.

---

## F. Initial Creation State

Before a new collection/presentation has established the geometry necessary for child placement:

- do not show Edit Layout
- do not show Selected Item
- do not show Place New Item

Show only the controls needed to complete or cancel the current creation step.

Once the parent/presentation is successfully placed, transition into the normal existing-object Inspector hierarchy.

---

# 5. Starting Pitcher Palette — Expand/Collapse Discoverability

## Acceptance Result

**Build 017.1: PARTIAL PASS**

The redundant Attributes hierarchy was successfully removed.

Starting Pitcher attributes are now directly nested under Starting Pitcher as intended.

However, the expandable nature of Starting Pitcher is not obvious, and the clickable region is too small.

During acceptance testing, expanding/collapsing required clicking in a very specific region around or to the left of the green used/checkmark indicator. Clicking the Starting Pitcher row itself did not reliably toggle the attributes.

## Required Behavior

Starting Pitcher must visibly behave like an expandable/collapsible palette item.

### Visible Affordance

Add a clear expand/collapse chevron/indicator directly to the Starting Pitcher row.

The indicator should communicate collapsed versus expanded state consistently with other expandable palette elements.

### Click Target

The **entire Starting Pitcher row/card** should act as the expand/collapse target.

The user should not need to discover a small hidden hit area around the used/checkmark icon.

Clicking the row should toggle the attribute list.

### Preserve Existing Information

Continue to display and preserve:

- used/checkmark state
- instance count
- placement summary
- existing instance selection behavior
- direct attribute hierarchy
- Home/Away symmetry

When collapsed, useful placement summaries such as:

`Page 1 • Player Name`

should remain available.

Do not reintroduce an Attributes hierarchy level.

---

# 6. Short Contextual Text Template Tokens

## Acceptance Result

**Build 017.1: PASSED**

Contextual template editors correctly use concise local tokens where the surrounding record/collection context makes the canonical field unambiguous.

Examples include:

- `[Player Name]`
- `[Jersey #]`
- `[Bats]`
- `[Position]`
- `[AVG]`
- `[W-L]`
- `[ERA]`
- `[WHIP]`

Non-contextual templates can still use fully qualified tokens when needed, for example:

`[Away Starting Pitcher — Player Name]`

This is the intended behavior.

## Build 017.2 Requirement

No redesign is required.

Preserve:

- concise contextual token insertion
- context isolation
- fully qualified tokens in non-contextual templates
- existing long-form token resolution
- saved-template backward compatibility
- no migration requirement

---

# Preservation and Backward Compatibility Requirements

Build 017.2 is a focused UI acceptance hotfix.

Preserve all accepted Build 016, Build 017, and Build 017.1 behavior not explicitly changed above.

In particular:

- existing layouts load without migration
- existing mappings are not silently deleted or rebound
- existing Starting Pitcher mappings remain valid
- working shared Name Format functionality remains intact
- existing Name Format selections remain valid
- existing Repeated Layouts remain valid
- existing Individual Placements remain valid
- existing Record Layouts remain valid
- collections remain reusable and support multiple presentation instances
- existing Text Templates remain valid
- short contextual tokens continue to resolve correctly
- fully qualified/long-form tokens continue to resolve correctly
- missing data continues to render blank according to established behavior
- Designer preview and generated PDF behavior remain consistent
- accepted Build 017.1 Item 2 behavior must not regress
- accepted Build 017.1 Item 6 behavior must not regress

The Inspector restructuring should change presentation and editing state, not the persisted meaning of existing mappings.

---

# Explicitly Deferred / Out of Scope

Build 017.2 must not expand into unrelated Designer roadmap work.

The following remain deferred:

- per-token Name Format controls inside Text Templates
- generalized conditional colors
- static color controls
- long-text shrink-to-fit
- Undo/Redo
- synthetic full-capacity sample data
- capacity-warning polish
- full player/stat field-coverage audit
- generalized smart punctuation
- advanced conditional/template logic
- advanced matchup/research fields
- unrelated palette redesign
- unrelated Designer visual polish

---

# Build 017.2 Acceptance Checklist

## 1. Name Format Visibility

- [ ] Starting Pitcher — Player Name shows Name Format.
- [ ] Starting Lineup — Player Name shows Name Format.
- [ ] Bench — Player Name shows Name Format.
- [ ] Bullpen — Player Name shows Name Format.
- [ ] Applicable Individual Placement player-name fields show Name Format.
- [ ] Game Date does not show Name Format.
- [ ] Jersey # does not show Name Format.
- [ ] Position does not show Name Format.
- [ ] Bats/Throws do not show Name Format.
- [ ] AVG/ERA and other statistics do not show Name Format.
- [ ] Batting Order does not show Name Format.
- [ ] Parent collection/layout editing does not show Name Format.
- [ ] Text Template editing does not show generic Name Format.

## 2. Name Format Regression

- [ ] Starting Pitcher Player Name still responds to Name Format.
- [ ] Starting Lineup Player Name still responds.
- [ ] Bench Player Name still responds.
- [ ] Bullpen Player Name still responds.
- [ ] Applicable Individual Placement player names still respond.
- [ ] Designer preview and generated PDF remain consistent.
- [ ] Existing saved Name Format selections remain valid.

## 3. Parent Object Lifecycle

- [ ] Existing parent objects clearly display their parent identity.
- [ ] Deselect operates on the current object selection.
- [ ] Delete always deletes the complete named object/instance.
- [ ] Selecting a child does not change Delete into a child-delete action.
- [ ] New Instance remains available for reusable existing objects.
- [ ] Edit Layout is grouped with parent object actions.
- [ ] Child removal uses a separate Remove Item action.
- [ ] Repeated Layout first → Individual Placement second remains supported.
- [ ] Individual Placement first → Repeated Layout second remains supported.
- [ ] Initial/unplaced creation uses Cancel where appropriate.
- [ ] Invalid existing-object actions are hidden during unfinished creation.

## 4. Inspector Hierarchy

- [ ] Parent Selected Object card remains visible and stable while editing children.
- [ ] Child controls are not displayed inside the parent object card.
- [ ] Edit Layout opens a separate parent/layout editing workspace.
- [ ] Edit Layout X/Y values correspond to the actual parent/layout anchor.
- [ ] Parent keyboard/arrow movement operates on the parent/layout anchor.
- [ ] Change Placement appears inside the Edit Layout/Edit Placement workflow.
- [ ] Selecting a child opens a visually separate Selected Item card.
- [ ] Selected Item clearly names the child being edited.
- [ ] Child X/Y/offset controls correspond to the selected child.
- [ ] Selected Item exposes only applicable child properties.
- [ ] Remove Item removes only the selected child.
- [ ] Place New Item opens a separate creation workspace.
- [ ] Edit Layout, Selected Item, and Place New Item are mutually exclusive subordinate workspaces.
- [ ] New/unplaced collection creation does not show Edit Layout prematurely.
- [ ] New/unplaced collection creation does not show Selected Item prematurely.
- [ ] New/unplaced collection creation does not show Place New Item before required geometry exists.

## 5. Place New Item Progressive Reveal

- [ ] Content Type is the first decision.
- [ ] Selecting Field reveals Slot Field and applicable field controls.
- [ ] Field mode shows Name Format only for a player-name-capable Slot Field.
- [ ] Selecting Text Template hides Slot Field.
- [ ] Text Template mode does not show generic Name Format.
- [ ] Text Template mode shows editor, Preview, Insert Field, alignment, font size, and placement action.
- [ ] Switching content types does not leave irrelevant controls visible.

## 6. Starting Pitcher Palette

- [ ] No Attributes node is present.
- [ ] Starting Pitcher has an obvious expand/collapse chevron.
- [ ] Collapsed/expanded state is visually clear.
- [ ] Clicking anywhere on the Starting Pitcher row/card toggles expansion.
- [ ] The user does not need to click the checkmark or a small hidden hit target.
- [ ] Attributes remain directly nested under Starting Pitcher.
- [ ] Used/checkmark state remains correct.
- [ ] Instance count remains correct.
- [ ] Placement summary remains available when collapsed.
- [ ] Existing instance selection remains functional.
- [ ] Away and Home Starting Pitcher behave symmetrically.

## 7. Contextual Token Regression

- [ ] Contextual templates continue inserting short local tokens.
- [ ] Local tokens continue resolving only in the correct record context.
- [ ] Non-contextual templates can insert/use fully qualified tokens.
- [ ] Existing long-form Build 017 tokens still resolve.
- [ ] Existing saved templates require no migration.

---

# Regression Testing

Rerun the existing Build 017 and Build 017.1 automated regression suites.

Existing coverage should continue to verify:

- Starting Pitcher Home/Away field symmetry
- Starting Pitcher pitching-stat exposure
- Starting Pitcher record resolution
- shared player-name formatting
- player-name formatting outside Starting Pitcher
- slot-content field resolution
- slot-content Text Template resolution
- contextual short-token resolution
- long-token backward compatibility
- invalid cross-context token behavior
- Build 016 repeated-field compatibility
- field capability detection for Name Format

Add targeted Build 017.2 regression coverage where practical for:

- Name Format visibility based on the exact selected field
- no Name Format on parent/layout editors
- no generic Name Format on Text Templates
- parent versus child Inspector state
- Edit Layout using parent geometry
- child Remove Item versus parent Delete
- creation-state control visibility
- mutually exclusive subordinate Inspector workspaces
- Starting Pitcher row-wide expand/collapse behavior

Because several 017.2 changes are interaction/UI-state corrections, automated tests should be supplemented with browser acceptance testing rather than treated as a substitute for it.

---

# Completion Criteria

Build 017.2 may be accepted when:

1. Item 1 Name Format visibility behaves strictly according to the selected field capability.
2. Build 017.1 Item 2 Name Format functionality remains fully operational.
3. Parent object lifecycle actions are visually and behaviorally separated from child editing.
4. The Inspector uses a stable parent card plus one clear subordinate workspace at a time.
5. Edit Layout operates on true parent/layout geometry and contains Change Placement.
6. Selected Item clearly identifies and edits only the selected child.
7. New/unplaced creation exposes only controls valid for its current state.
8. Starting Pitcher expansion is obvious and the entire row/card is a reliable toggle target.
9. Build 017.1 contextual token behavior remains unchanged.
10. Existing Build 016/017/017.1 layouts continue functioning without migration.
11. Existing automated regression tests pass.
12. New targeted 017.2 tests pass where practical.
13. Browser smoke testing produces no new console errors.
14. Local manual acceptance testing passes the checklist above.

Once Build 017.2 passes acceptance testing, the Build 017 acceptance-patch cycle can be considered complete and Designer work can proceed to the next planned build.