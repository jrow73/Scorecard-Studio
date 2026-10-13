# Build 032 — Designer Remaining Tweaks

## Status
Accepted through Build 032.4b; final closure candidate is Build 032.5.

## Purpose
Build 032 collects the final Designer defects and consistency issues discovered after completion of the planned Build 030 Layout Settings and Build 031 Text Template workflow work. The build is intentionally a polish/completion bucket rather than a new feature phase.

## Final implemented scope

### 032.1 — Field Palette counts and filtering
- Added **Unused only** alongside All data and Used only.
- Search continues to combine with the selected filter.
- Category cards show dynamic **`[used] of [available]`** counts.
- Counts describe immediate children at that palette level; Home/Away Players therefore count Starting Pitcher, Starting Lineup, Defensive Alignment, Bench, and Bullpen rather than rolling up every field inside those collections.

### 032.2 / 032.2a / 032.2b — visual consistency
- Standardized normal Designer action-button sizing while preserving large blue placement buttons as primary actions.
- Brought PDF page-navigation arrows into alignment with the other toolbar buttons.
- Standardized subordinate Inspector card chrome against Selected Object, including compact eyebrow/title spacing, reduced duplicate padding, and the Selected Item divider.
- Made Text Template Editor textareas read more clearly as editable inputs.
- Compacted Formatting controls to match the density of nearby Designer selectors.

Manual acceptance closed this phase at **032.2b**.

### 032.3 / 032.3a — user-facing placement terminology
- Removed developer-facing `slot` and `anchor` vocabulary from user-visible Designer instructions where it was not meaningful to the scorecard designer.
- Vertical collections use rows; horizontal collections use columns; grids use positions; precise placements use points.
- Starting Pitcher Record Layout specifically establishes a **row**, then places child items at **points on the row**.
- Internal data-model/helper terminology remains unchanged; no schema migration was introduced.

Manual acceptance closed this phase at **032.3a**.

### 032.4 / 032.4a / 032.4b — Defensive Alignment and Text Template consistency
- Added **Single Item** and **Text Template** representation choices for Home/Away Defensive Alignment.
- Contextual Text Template tokens resolve against the selected defensive role.
- The existing sequential role workflow is preserved: after placement the next unplaced role is selected and the just-used configuration carries forward.
- Existing field-only Defensive Alignment mappings remain compatible.
- Corrected Player Name format-option initialization during new Defensive Alignment Text Template creation.
- Standardized new repeated-record Text Template creation to **Editor** and **Insert into editor** before placement as well as after placement.

Manual acceptance closed the functional phase at **032.4b**.

### 032.5 — final polish and closure
- Removed the development-only **BUILD 032.x • DESIGNER WORKSPACE** eyebrow from the Designer header.
- Reconciled Build 032 documentation to the accepted final behavior.

## Deferred / later work
The following remain intentionally outside Build 032 and do not block Designer completion:

- homepage/browser time-display improvements;
- doubleheader Game 2 data-quality disclosure UI;
- optional team-logo support using team IDs;
- future pitcher-role/depth-chart refinement for bullpen presentation;
- live validation of the pre-/in-progress first-game branch on the next real doubleheader;
- broader application/Game Day polish outside the Designer.

## Closure
Upon acceptance of Build 032.5, **Build 032 is closed and the planned Designer feature/workflow roadmap for v0.2.0 is complete**. The next step is the **v0.2.0 release review**, focused on regression, persistence/reload, PDF output comparison, multi-page/viewport behavior, import/export, and release readiness rather than feature expansion.
