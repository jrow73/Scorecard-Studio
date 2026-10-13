# Scorecard Studio — Build 024.2 Implementation

**Baseline:** v0.2.0 Build 024.1  
**Purpose:** Complete the Inspector/workflow cleanup that remained partially implemented after the first Build 024 acceptance pass.

## Acceptance fixes

- Finish the compact **Selected Object** card: object identity appears first, followed by one slim action row in the order Deselect / New Instance / Edit Layout / Delete. Routine explanatory prose is removed from the Inspector.
- Remove the repeated-layout `Content in each slot` helper line. The creation workflow now proceeds directly into Content Type and its progressive controls.
- Rename Inspector actions to match the actual workflow: **Create New Item** starts configuration; the final repeated/individual placement action is **Place Item on Scorecard**.
- Complete Text Template editor parity after placement. The placed-item editor now uses the same compact insertion controls as creation mode: `Choose text field to insert…`, conditional `Choose name format…` only for Player Name, encoded Player Name formatting, and reset of both insertion pickers after Insert Field.
- Remove the **Individual mappings** inventory entirely from Individual Placement. Existing individual items are edited or removed by selecting them directly on the scorecard.
- Correct disabled Paste toolbar behavior. Paste keeps its tooltip and unavailable cursor while disabled; pointer suppression no longer prevents hover feedback.

## Acceptance checks

1. Select a repeated-layout parent and confirm the Selected Object card is compact, contains no instructional paragraph, and keeps all available actions in the slim action row.
2. With nothing copied, hover Paste and confirm the Paste tooltip and unavailable cursor appear. Copy something and confirm Paste activates normally.
3. Open Create New Item for a repeated layout and confirm the routine `Content in each slot` prose is gone. Configure an item and confirm the final button says `Place Item on Scorecard`.
4. Edit a placed Text Template. Confirm the insertion area has no redundant `Insert field` / `Name format` labels, Player Name alone reveals the name-format picker, and Insert Field resets the insertion controls afterward.
5. Open Individual Placement for any collection and confirm no existing-mappings inventory/list appears. Existing items remain removable by selecting them directly on the scorecard.
6. Confirm child removal still preserves the parent creation context and all prior Build 024/024.1 functionality remains intact.

`README.md` remains intentionally unchanged.
