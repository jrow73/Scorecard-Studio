# Build 028.9 — Starting Pitcher Final Workflow Polish

## Scope

This decimal build is intentionally limited to the two remaining Starting Pitcher issues identified after Build 028.8.

### 1. Palette card alignment

The Starting Pitcher palette summary now uses a simple two-part, left-aligned flex header: one explicit chevron followed immediately by the `Starting Pitcher` label. This removes the residual right-justified appearance while preserving the single-chevron behavior accepted in Build 028.8.

### 2. Skip the single-choice usage prompt

Starting Pitcher now declares `Record Layout` as its forced whole-object mode. Selecting an unused Starting Pitcher goes directly into the Record Layout workflow, matching the existing single-mode behavior for Starting Lineup (`Repeated Layout`) and Defensive Alignment (`Individual Placement`). Starting a new instance from an existing Starting Pitcher Record Layout also resumes directly in Record Layout mode.

No conditional-formatting behavior is changed in this build.

## Acceptance checks

- Starting Pitcher label is left-aligned immediately after its single chevron when collapsed and expanded.
- Selecting an unused Starting Pitcher does not show a one-choice “How would you like to use this?” screen.
- The Inspector proceeds directly to the Record Layout workflow.
- `New Instance` from an existing Starting Pitcher Record Layout also proceeds directly to Record Layout.
- Starting Lineup and Defensive Alignment forced-mode behavior remains unchanged.
