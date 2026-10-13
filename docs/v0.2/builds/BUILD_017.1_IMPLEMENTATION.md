# Scorecard Studio — Build 017.1 Implementation

## Status

**Planned acceptance patch for Build 017**

Build 017 successfully established the primary Starting Pitcher record architecture, including Starting Pitcher attributes, Record Layout support, template-aware slot content, and the initial Name Format control.

Manual acceptance testing identified six issues and UX refinements to address before Build 017 is considered complete.

Build 017.1 is intentionally limited to these six items. New Designer capabilities outside this scope should be deferred to later builds.

---

# 1. Name Format — Correct Control Visibility

## Problem

Build 017 introduced the **Name Format** control for Starting Pitcher Player Name.

The control currently appears in editors for fields that are not player-name fields. For example, selecting a field such as Game Date can display a Name Format dropdown even though the setting has no meaning for that field.

## Required Behavior

The Name Format control must appear only when the selected field supports player-name formatting.

Examples of eligible fields include:

- Starting Pitcher — Player Name
- Starting Lineup — Player Name
- Bench — Player Name
- Bullpen — Player Name
- Player-name fields used through Individual Placement
- Other future player-name fields that use the same name-format capability

Fields such as the following must not display Name Format:

- Game Date
- Team Name
- Jersey #
- Position
- Throws
- Bats
- AVG
- ERA
- Other non-name fields

## Implementation Direction

Name Format visibility should be capability-driven rather than hard-coded specifically to:

- `away.startingPitcher.player.name`
- `home.startingPitcher.player.name`

The Designer should determine whether the selected field supports player-name formatting from the field definition or equivalent shared metadata.

This allows the same behavior to generalize naturally to additional player-name fields.

---

# 2. Name Format — Apply to All Supported Player-Name Fields

## Problem

During Build 017 testing, the Name Format dropdown appeared for Player Name fields in collections such as:

- Starting Lineup
- Bench
- Bullpen

However, changing the setting had no effect. These fields continued to display Full Name.

Starting Pitcher Player Name correctly responds to the setting.

## Required Behavior

Every player-name field that exposes the Name Format control must honor the selected format.

Supported formats introduced by Build 017 should continue to include the available choices such as:

- Full Name
- First Initial + Last Name
- Last Name
- First Name
- Use Name + Last Name

Changing the setting should immediately update the Designer PDF preview.

The selected format must also be honored in generated PDFs.

## Coverage

Verify this behavior for:

- Away Starting Pitcher
- Home Starting Pitcher
- Away Starting Lineup
- Home Starting Lineup
- Away Bench
- Home Bench
- Away Bullpen
- Home Bullpen
- Applicable Individual Placement player-name mappings

The implementation should use the shared player-name formatting mechanism rather than Starting-Pitcher-specific formatting logic.

## Preservation Requirement

Existing Build 017 Starting Pitcher Name Format behavior must continue to work unchanged.

---

# 3. Standardize Object-Level Lifecycle Actions

## Problem

Build 016 established the concept that data items and collections remain reusable and can have multiple placed instances.

Build 017 introduced inconsistencies in how these actions are exposed.

In particular:

- An Individual Placement collection can become difficult or impossible to reuse for a second presentation.
- `Create New Instance` appears in different locations depending on object type.
- Delete can change meaning depending on whether a collection child is selected.
- Object-level and child-level actions are visually mixed together.

A common example is Starting Lineup.

A user may want:

1. a Repeated Layout for the batting order, and
2. an Individual Placement instance for the defensive diamond.

Creating Individual Placement first must not prevent creation of the Repeated Layout.

## Existing Object Header

Every existing reusable object should use a consistent Selected Object header containing:

**[Deselect] [Delete] [New Instance]**

These actions always operate at the object/instance level.

### Deselect

Clears the current selection.

### Delete

Deletes the complete object/instance identified by the Selected Object header.

For a collection presentation, Delete removes the entire presentation and all child content belonging to that instance.

Example:

> Delete the Away starting lineup and all of its slot content?

Existing destructive-action confirmation behavior should be preserved where appropriate.

The meaning of the header Delete button must **never change merely because a child item has been selected**.

### New Instance

Creates another use of the underlying data item or collection.

For a scalar field, this begins creation of another placement of that field.

For a collection such as Starting Lineup, this returns the user to the presentation choice:

- Repeated Layout
- Individual Placement

The same collection must remain reusable regardless of which presentation type was created first.

Verify both workflows:

- Repeated Layout first → Individual Placement second
- Individual Placement first → Repeated Layout second

## Child Removal

Collection child content must have its own separate removal action.

When an individual child is selected, its editor should provide an action such as:

**Remove Item**

This removes only that child mapping/content element.

It must not change the meaning of the object-level Delete button.

## New / Unplaced Objects

During a creation workflow where an object has not yet been placed, the header does not need Delete or New Instance.

Use:

**[Cancel]**

where appropriate rather than Deselect, because the user is cancelling an unfinished creation workflow rather than deselecting an existing object.

## General UI Rule

The Selected Object header owns **object lifecycle and navigation actions**.

The Inspector body owns **properties and content editing**.

---

# 4. Collection Inspector Hierarchy and Progressive Reveal

## Problem

The Build 017 collection inspector mixes several different editing contexts simultaneously:

- collection/layout properties
- selected child properties
- new-item creation
- placement controls

This makes it difficult to determine what is currently being edited.

Selecting the collection anchor displays collection properties while child-editing controls may remain visible.

Selecting a placed child can change the Selected Object header to identify the child even though the parent collection is still the actual top-level object.

The `Change Placement` control can also appear far away from the other collection-level controls.

The new slot-content workflow also does not consistently follow the Progressive Reveal behavior established during Build 016.

## Required Inspector Hierarchy

Once a collection presentation exists, the Inspector should have a permanent object-level header followed by clearly separated editing contexts.

Conceptually:

### Selected Object

**Away starting lineup**

**[Deselect] [Delete] [New Instance]**

The Selected Object header must continue to identify the parent collection/presentation even when a child is selected.

Child selection must not replace the object identity shown in this header.

---

## Edit Layout / Edit Placement

Provide an expandable collection-level editing section immediately below the object header.

User-facing terminology may vary according to presentation type:

- **Edit Layout** for Repeated Layout / Record Layout
- **Edit Placement** where that terminology better describes the presentation

Opening this section selects the parent collection object/anchor.

Collection-level controls should appear here, including applicable controls such as:

- X position
- Y position
- keyboard/arrow movement
- layout geometry
- Change Placement

When collection-level editing is active, child-editing controls and new-item creation controls should not remain simultaneously visible.

---

## Selected Item

When an existing placed child is deliberately selected, display a dedicated Selected Item editing section.

Examples include:

- Batting Order
- Jersey #
- Player Name
- Position
- a Text Template content element

This section contains only properties applicable to that child.

Examples:

- field/content selection where appropriate
- alignment
- font size
- name format when applicable
- child positioning/offset controls
- Remove Item

Selecting a child must not change the identity or lifecycle actions in the parent Selected Object header.

---

## Place New Item

Provide a separate expandable **Place New Item** creation section.

Opening this section should hide/close the other editing contexts so the user has one clear active task.

The first decision must be:

**Content Type**

- Field
- Text Template

The remaining controls use Progressive Reveal.

### If Field Is Selected

Reveal only the controls needed to create field content, such as:

- Slot Field
- Alignment
- Font Size
- Name Format, only when the chosen field supports it
- Add/Place Slot Content

Controls that are not yet relevant should remain hidden until the preceding choice makes them applicable.

### If Text Template Is Selected

Reveal only the controls required for template content:

- Text Template editor
- Preview
- Insert Field
- Alignment
- Font Size
- Add/Place Slot Content

Do not display the normal Slot Field selector while Text Template is selected.

Do not display the generic Name Format control for a Text Template.

Per-token formatting is outside Build 017.1 scope.

---

## Mutually Exclusive Editing Contexts

The collection Inspector should present one active editing task at a time.

Opening **Edit Layout/Edit Placement** should close or hide Selected Item and Place New Item editing controls.

Selecting an existing child should activate **Selected Item** and close/hide the other editing workspaces.

Opening **Place New Item** should close/hide collection-property and existing-child editing controls.

The Inspector should always provide a clear answer to:

> What am I editing right now?

This restores the Progressive Reveal interaction model established during Build 016.

---

# 5. Starting Pitcher Palette Hierarchy

## Problem

Build 017 made Starting Pitcher a record with expandable attributes.

The initial implementation introduced a separate expandable **Attributes** node beneath Starting Pitcher.

This disrupts the visual hierarchy established in the Build 016 Field Palette because:

- Attributes visually competes with its Starting Pitcher parent.
- Its typography/indentation makes it appear higher in the hierarchy than intended.
- The extra hierarchy level does not provide useful information.

Current conceptual hierarchy:

- Away Players
  - Starting Pitcher
    - Attributes
      - Player Name
      - Jersey #
      - Throws
      - ERA
      - etc.

## Required Behavior

Remove the separate **Attributes** node.

Starting Pitcher itself becomes expandable/collapsible.

Desired hierarchy:

- Away Players
  - Starting Pitcher
    - Player Name
    - Jersey #
    - Throws
    - Games
    - Games Pitched
    - Games Started
    - Wins
    - Losses
    - W-L
    - ERA
    - WHIP
    - IP
    - etc.

The Starting Pitcher row/card should contain the expand/collapse indicator directly.

## Preservation Requirements

Preserve existing Starting Pitcher parent behavior, including:

- Used/checkmark state
- instance count
- placement summary
- ability to select existing instances
- Home/Away symmetry

When collapsed, useful placement summaries such as:

`Page 1 • Player Name`

should remain available without introducing another hierarchy heading.

---

# 6. Short Contextual Text Template Tokens

## Problem

Build 017 added Text Template content inside collection/record slots.

Because these templates already operate within a known record context, the inserted token labels are unnecessarily verbose.

Example:

`[Away Lineup — Player Name]`

inside an Away Lineup slot.

The user already knows the template belongs to Away Lineup, so repeating the collection name makes templates harder to read and edit.

## Required Behavior

Contextual slot/record Text Templates should display and insert concise local token names.

Examples:

- `[Player Name]`
- `[Jersey #]`
- `[Bats]`
- `[Position]`
- `[AVG]`
- `[W-L]`
- `[ERA]`
- `[WHIP]`

This should allow templates to read naturally, for example:

`([Bats]) [Player Name] ([AVG])`

rather than:

`([Away Lineup — Bats]) [Away Lineup — Player Name] ([Away Lineup — AVG])`

The surrounding collection/record context determines which canonical field each token represents.

## Context Isolation

Local tokens must resolve only within the current record context.

For example, `[ERA]` in a Starting Pitcher Record Layout resolves against the Starting Pitcher record.

A token that is not valid in the current context should not accidentally resolve against an unrelated collection.

## Backward Compatibility

Existing Build 017 templates containing long-form contextual tokens must remain valid.

For example:

`[Away Lineup — Player Name]`

must continue to resolve correctly.

Build 017.1 should therefore add support for concise contextual tokens without invalidating existing long-form tokens.

## Deferred

Configurable formatting of an individual template token is not part of Build 017.1.

For example, Build 017.1 does not need to provide a way to independently configure:

`[Player Name]`

as:

- Full Name
- F. Lastname
- Last Name
- etc.

Per-token formatting remains a later Designer capability.

---

# Preservation and Backward Compatibility Requirements

Build 017.1 is an acceptance patch and must preserve all accepted Build 016 and Build 017 behavior.

In particular:

- Existing layouts must continue to load without migration.
- Existing mappings must not be silently deleted or rebound.
- Existing Starting Pitcher mappings must remain valid.
- Existing Starting Pitcher Name Format settings must continue to work.
- Existing Repeated Layouts must remain valid.
- Existing Individual Placements must remain valid.
- Existing Record Layouts must remain valid.
- Existing Text Templates must remain valid.
- Existing long-form contextual template tokens must continue to resolve.
- Missing data continues to render blank according to the established field-resolution behavior.
- Collections remain reusable and may have multiple presentation instances.
- Designer preview and generated PDF behavior must remain consistent.

---

# Explicitly Deferred / Out of Scope

Build 017.1 must not expand into unrelated Designer roadmap work.

The following remain deferred:

- Per-token Name Format controls inside Text Templates
- Generalized conditional colors
- Static color controls
- Long-text shrink-to-fit
- Undo/Redo
- Synthetic full-capacity sample data
- Capacity-warning polish
- Full player/stat field-coverage audit
- Generalized smart punctuation
- Advanced conditional/template logic
- Advanced matchup/research fields

These should remain candidates for subsequent Designer builds.

---

# Build 017.1 Acceptance Checklist

## 1. Name Format Visibility

- [ ] Select Starting Pitcher — Player Name; Name Format is visible.
- [ ] Select Starting Lineup — Player Name; Name Format is visible.
- [ ] Select Bench — Player Name; Name Format is visible.
- [ ] Select Bullpen — Player Name; Name Format is visible.
- [ ] Select Game Date; Name Format is not visible.
- [ ] Select Jersey #; Name Format is not visible.
- [ ] Select ERA/AVG/Position/etc.; Name Format is not visible.

## 2. Name Format Functionality

- [ ] Starting Pitcher Player Name responds immediately to format changes.
- [ ] Starting Lineup Player Name responds immediately.
- [ ] Bench Player Name responds immediately.
- [ ] Bullpen Player Name responds immediately.
- [ ] Applicable Individual Placement player names respond immediately.
- [ ] Designer preview and generated PDF agree.
- [ ] Full Name remains the default/fallback where appropriate.

## 3. Object Lifecycle Actions

- [ ] Existing objects consistently show Deselect, Delete, and New Instance in the header.
- [ ] Header Delete always deletes the complete selected object/instance.
- [ ] Selecting a collection child does not change the meaning of header Delete.
- [ ] Child content has a separate Remove Item action.
- [ ] New Instance on a collection returns to the collection presentation choices.
- [ ] Starting Lineup can create Repeated Layout first, then Individual Placement.
- [ ] Starting Lineup can create Individual Placement first, then Repeated Layout.
- [ ] New/unplaced creation uses Cancel where appropriate.
- [ ] Collection deletion confirmation remains clear when child content will also be removed.

## 4. Collection Inspector Hierarchy

- [ ] Parent Selected Object header remains stable when children are selected.
- [ ] Edit Layout/Edit Placement exposes parent X/Y and applicable placement controls.
- [ ] Change Placement is located with parent/layout editing controls.
- [ ] Selecting a child activates only the Selected Item editor.
- [ ] Place New Item is a separate creation workspace.
- [ ] Edit Layout, Selected Item, and Place New Item do not expose conflicting controls simultaneously.
- [ ] Choosing Field reveals only Field-related controls.
- [ ] Choosing Text Template hides the Slot Field selector.
- [ ] Text Template mode shows editor, preview, Insert Field, alignment, font size, and placement action.
- [ ] Irrelevant Name Format controls do not appear.

## 5. Starting Pitcher Palette Hierarchy

- [ ] No separate Attributes node appears.
- [ ] Starting Pitcher itself has the expand/collapse indicator.
- [ ] Starting Pitcher attributes are directly nested underneath.
- [ ] Away and Home Starting Pitcher behave symmetrically.
- [ ] Used/checkmark state remains correct.
- [ ] Instance count remains correct.
- [ ] Existing placement summaries remain usable.

## 6. Contextual Template Tokens

- [ ] Away Lineup slot templates insert `[Player Name]` rather than `[Away Lineup — Player Name]`.
- [ ] Other contextual fields use similarly concise labels.
- [ ] Starting Pitcher Record Layout templates use local tokens.
- [ ] Bench, Bullpen, and Umpire contexts use local tokens where applicable.
- [ ] Local tokens resolve only against the appropriate current record context.
- [ ] Existing long-form Build 017 tokens still resolve correctly.
- [ ] Existing saved templates require no migration.

---

# Regression Testing

In addition to the Build 017.1 acceptance tests, rerun the existing Build 017 automated regression suite.

The Build 017 tests covering the following must continue to pass:

- Starting Pitcher Home/Away field symmetry
- Starting Pitcher pitching-stat exposure
- Starting Pitcher record resolution
- player-name formatting
- slot-content field resolution
- slot-content Text Template resolution
- Starting Lineup contextual template resolution
- invalid cross-context token behavior
- Build 016 repeated-field compatibility

Add regression coverage for Build 017.1 behavior where practical, particularly:

- player-name formatting outside Starting Pitcher
- contextual short-token resolution
- long-token backward compatibility
- field capability detection for Name Format

---

# Completion Criteria

Build 017.1 may be accepted when:

1. All six acceptance-patch items above behave as specified.
2. Existing Build 016/017 layouts continue to function without migration.
3. Existing automated regression tests pass.
4. New 017.1 regression tests pass.
5. Browser smoke testing produces no new console errors.
6. Local acceptance testing confirms both the new Starting Pitcher functionality and the refined collection workflows.

Once Build 017.1 passes acceptance testing, Build 017 should be considered complete and the Designer roadmap can proceed to the next planned build.