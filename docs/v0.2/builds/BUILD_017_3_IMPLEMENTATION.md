# Scorecard Studio — Build 017.3 Implementation

## Purpose

Build 017.3 is an acceptance hotfix for Build 017.2. It does not introduce a new Designer data model. Its purpose is to restore previously accepted contextual behavior and finish the parent/child Inspector separation and progressive-reveal workflow uncovered during Build 017.2 testing.

Build 017.3 is intended to be overlaid on **v0.2.0-dev Build 017.2**.

## Scope

### 1. Capability-gated Name Format

`Name format` is a field capability, not a generic object/layout property.

Required behavior:

- Hide Name Format by default.
- Show it only when the exact field being created or edited has `formatKind === "playerName"`.
- Do not show it for dates, team names, jersey numbers, throws/bats, stats, venue/weather, free text, Text Templates, or other non-name fields.
- Do not show it on Repeated Layout / Record Layout parent editors.
- A collection containing a player-name child does not make the parent container name-format capable.

Build 017.3 also adds explicit CSS handling for capability wrappers carrying the `hidden` attribute so other Designer layout rules cannot accidentally reveal them.

### 2. Restore contextual Text Template labels and tokens

When a Text Template is created or edited inside an established record context, both the Insert Field UI and the inserted token must use the short contextual form.

Example inside **Away Starting Pitcher**:

- Dropdown label: `Throws`
- Inserted token: `[Throws]`

Not:

- `Away Starting Pitcher — Throws`
- `[Away Starting Pitcher — Throws]`

Outside a record context, fully qualified labels/tokens remain available and unchanged.

This applies both to new Text Templates created from a record and to the selected-item Text Template editor.

### 3. Move Place New Item into the child workspace

`Place New Item` is a child action, not a parent action.

Required hierarchy for a Repeated/Record Layout:

1. **Selected Object** card — parent identity/actions only.
2. **Edit Layout** workspace — parent/container geometry and layout properties.
3. **Place New Item** action — beneath the parent editor, leading into child creation.

The button must not appear inside the Selected Object parent card.

### 4. Strictly scope the child workspace

When placing content into one selected container, the Inspector must not reveal unrelated Repeated/Record Layouts or their child actions.

Example: while adding content to **Away bench**, the lower workspace must not display Home bullpen, Umpire crew, Home bench, Away starting lineup, or their `Remove Item` buttons.

Build 017.3 suppresses the global repeated-layout inventory while the Inspector is in scoped child-creation mode. Existing global layout data remains unchanged; only the Inspector presentation is scoped.

### 5. True progressive reveal for Place New Item

The child-creation workflow begins with only:

- `Content type`
- `Choose content type…`

No Field-branch or Text-Template-branch controls are displayed until a content type is deliberately chosen.

#### Field branch

After choosing **Field**, reveal only Field configuration:

- Slot field
- Alignment
- Font size
- Name Format only when the chosen field supports it
- Add Slot Content action

#### Text Template branch

After choosing **Text Template**, reveal only Text Template configuration:

- Text template editor
- Context-aware Insert Field helper
- Alignment
- Font size
- Add Slot Content action

Field-only controls remain hidden.

Changing Content Type resets branch-specific values so stale settings are not silently reused across branches.

### 6. Deliberate configuration / disabled Add Content

New slot content must not inherit arbitrary defaults.

When Place New Item begins, required controls are reset to an unselected/blank state. The user must deliberately choose or enter the required configuration.

For **Field** content, Add Slot Content remains disabled until:

- a field is selected;
- alignment is selected;
- a valid font size is entered; and
- when applicable, Name Format is selected.

For **Text Template** content, Add Slot Content remains disabled until:

- the template contains non-whitespace content;
- alignment is selected; and
- a valid font size is entered.

The Insert Field dropdown in a Text Template is a helper and is not itself required for validity.

## Implementation Notes

- No persisted layout schema changes are introduced.
- Existing Build 017/017.1 contextual token resolution remains the source of truth.
- The hotfix changes Inspector rendering/validation only; it does not alter generated field values or existing saved mappings.
- Existing saved player-name mappings without an explicit `nameFormat` continue to render using the existing formatter fallback behavior.

## Acceptance Test

### A. Name Format capability

1. Select **Game Date → Single Item**.
2. Confirm Name Format is absent.
3. Select **Starting Pitcher → Record Layout** and edit the parent layout.
4. Confirm Name Format is absent from the parent editor.
5. Add/edit the specific **Player Name** child field.
6. Confirm Name Format is present there.
7. Add/edit **Throws**, jersey number, or a statistic.
8. Confirm Name Format is absent.

### B. Context-aware template

1. Select **Away Starting Pitcher**.
2. Choose **Text Template**.
3. Open Insert Field.
4. Confirm labels are contextual (`Throws`, `Player Name`, etc.).
5. Insert Throws.
6. Confirm the template receives `[Throws]`, not the fully qualified token.
7. Create a non-contextual Text Template and confirm fully qualified tokens remain available there.

### C. Parent/child Inspector hierarchy

1. Select an established Repeated Layout such as **Away bench**.
2. Confirm Selected Object contains parent actions only.
3. Confirm Edit Layout appears in the subordinate workspace.
4. Confirm Place New Item appears below the parent editor, not in the parent card.

### D. Child-workspace scoping

1. With **Away bench** selected, choose Place New Item.
2. Confirm no unrelated Repeated/Record Layout summaries appear below.
3. Confirm no `Remove Item` actions belonging to unrelated containers are exposed.

### E. Progressive reveal / explicit choices

1. Choose Place New Item.
2. Before selecting Content Type, confirm Slot field, Alignment, Font Size, Name Format, Text Template controls, and Add Slot Content are not shown.
3. Choose **Field**.
4. Confirm only Field controls appear.
5. Confirm field, alignment, font size, and applicable name format begin unselected/blank.
6. Confirm Add Slot Content is disabled until every required Field setting is complete.
7. Change Content Type to **Text Template**.
8. Confirm Field-only controls disappear and branch-specific values are reset.
9. Confirm Add Slot Content remains disabled until template text, alignment, and valid font size are supplied.

## Regression Expectations

Build 017.3 must preserve:

- Build 017 contextual field/token resolution;
- Build 017.1 short contextual tokens;
- Build 017.2 stable parent selection and Edit Layout anchor behavior;
- Starting Pitcher row-wide expand/collapse behavior;
- existing saved mappings/layouts without migration.
