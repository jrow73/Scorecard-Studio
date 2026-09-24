# Scorecard Studio — Build 024 Implementation

**Baseline:** v0.2.0 Build 023 Final  
**Purpose:** Complete the Designer workflow and Inspector cleanup before the Field Palette / Layout Settings build.

## Scope

Build 024 focuses on existing Designer workflows rather than adding catalog fields.

- Text Templates suppress the complete output when every mapped token resolves blank/unavailable, preventing punctuation-only residue such as `# ()`.
- Player Name tokens in Text Templates support the same name-format choices used by ordinary Player Name fields. Formatted tokens retain their display choice as template metadata in the token itself.
- Repeated Layout slot-content creation uses progressive reveal: content type → field/template → field-specific option → alignment → Add Slot Content.
- Individual Placement is role-driven; the Slot/order strategy is removed from the creation workflow. Controls progressively reveal Role → Field → field-specific option → Alignment → Place Individual Item.
- Copy/Paste moves from the Selected Object card to the PDF toolbar beside Undo/Redo. Paste exposes ordinary Paste and only the eligible Away↔Home translation actions. Keyboard shortcuts remain unchanged and clipboard state remains single-use.
- The Selected Object card is compacted and routine instructional prose is removed from the Inspector/workspaces.
- Delete behavior is normalized: a selected repeated child deletes only that child; a structurally selected complete repeated layout targets the parent and requires confirmation before deleting the complete structure.
- The two persistent bottom Designer status panels are removed from the visible workspace; status nodes remain screen-reader-only for transient operational/error announcements.

## Deferred

Umpire Crew palette consolidation remains Build 025 with the broader Field Palette and Layout Settings work.

## Acceptance focus

1. Verify blank Text Templates do not print punctuation-only residue.
2. Insert Player Name into scalar and repeated Text Templates and exercise all Name Format choices.
3. Verify repeated-slot controls reveal in logical order and Add Slot Content appears only when ready.
4. Verify Individual Placement no longer offers Slot/order and progresses from Role through placement.
5. Verify Copy/Paste toolbar enablement, translation menu eligibility, keyboard shortcuts, ghost placement, and single-use clipboard behavior.
6. Verify a single repeated child can be deleted with Delete without removing its parent.
7. Verify a complete structurally selected repeated layout prompts before whole-layout deletion and Undo restores it as one action.
8. Confirm the persistent bottom status panels and routine helper paragraphs are gone.
9. Run Build 017–023 regression suites and Build 024 checks.

`README.md` is intentionally unchanged.
