# Build 032.5 — Final Designer Polish / Integration

## Status
Final Build 032 integration candidate.

## Scope
Build 032.5 closes the **Designer Remaining Tweaks** build with one final production-facing header cleanup and a reconciliation of the accepted Build 032 work. It does not add new Designer behavior.

## UI change
The development eyebrow above the Designer title has been removed:

`BUILD 032.x • DESIGNER WORKSPACE`

The Designer header now begins with **Layout Designer**, followed by the existing layout/PDF/page metadata. Application build/version information remains available through the app's normal version plumbing; it is simply no longer presented as part of the Designer workspace header.

## Build 032 accepted sequence

- **032.1 — Field Palette Counts & Filtering**
  - added **Unused only**;
  - standardized dynamic category counts to **used of available** using immediate-child semantics.
- **032.2b — Designer Control & Inspector Visual Consistency**
  - standardized compact action/button sizing;
  - standardized PDF page-navigation controls;
  - aligned subordinate Inspector card chrome with Selected Object;
  - restored the Selected Item divider;
  - improved Text Template Editor affordance;
  - compacted Formatting controls.
- **032.3a — User-Facing Placement Terminology**
  - replaced exposed `slot` / `anchor` vocabulary with row, column, position, point, and record wording appropriate to each workflow;
  - refined Starting Pitcher Record Layout wording to establish a row first, then place items at points on that row.
- **032.4a — Defensive Alignment Text Template Support**
  - added Single Item / Text Template content types for Home/Away Defensive Alignment;
  - preserved sequential defensive-role progression and configuration carry-forward;
  - corrected Player Name format initialization in the new Text Template workflow.
- **032.4b — Repeated-Record Text Template Label Consistency**
  - standardized new repeated-record Text Template creation to **Editor** / **Insert into editor**.
- **032.5 — Final Designer Polish / Integration**
  - removes the development-only Designer workspace/build eyebrow;
  - reconciles Build 032 documentation for closure.

## Acceptance checklist

### Header
- [ ] Designer no longer shows `BUILD 032.x • DESIGNER WORKSPACE` above the title.
- [ ] **Layout Designer** remains the page heading.
- [ ] Layout/PDF/page metadata remains visible beneath the heading.
- [ ] Generate Test PDF and Close Layout Designer controls remain unchanged.

### Build 032 integration regression
- [ ] Field Palette offers All data / Used only / Unused only and dynamic `used of available` counts.
- [ ] Compact button and toolbar sizing from 032.2b remains intact.
- [ ] Inspector cards retain the accepted spacing/divider treatment.
- [ ] Text Template Editor and Formatting controls retain the accepted 032.2b styling.
- [ ] Repeated-layout and Starting Pitcher placement prompts use accepted row/column/position/point terminology.
- [ ] Defensive Alignment supports both Single Item and Text Template placement.
- [ ] Defensive Alignment Text Template configuration carries forward as roles advance.
- [ ] Player Name format choices populate immediately during new Defensive Alignment Text Template creation.
- [ ] New Starting Pitcher / Lineup / Bench / Bullpen Text Template child creation shows **Editor** and **Insert into editor** from the start.
- [ ] Existing saved layouts continue to open without migration.
- [ ] Representative Test PDF and Live PDF generation remain unchanged except for the intentionally revised Designer UI.

## Final status target
After manual acceptance of this checklist, **Build 032 is complete** and the planned Designer development roadmap for v0.2.0 is closed. The next activity is the **v0.2.0 release review**, which should be treated as regression/release validation rather than another feature build.

`README.md` is intentionally unchanged.
