# Build 028.8 — Starting Pitcher Palette / Record Workflow Cleanup

Baseline: Build 028.7 checkpoint.

## Scope

This decimal build is intentionally limited to two Starting Pitcher issues.

### 1. Starting Pitcher palette-card consistency

- Keep the Starting Pitcher label left-aligned when collapsed.
- Use exactly one expand/collapse chevron.
- Preserve the existing green used-state border and existing child-field / instance list behavior.

### 2. Remove whole-record Text Template creation

- A Starting Pitcher record remains available as a **Record Layout**.
- The whole Starting Pitcher record is no longer offered as a **Text Template** creation mode.
- Text Templates remain available for individual Starting Pitcher child fields.

## Acceptance checks

1. With no Starting Pitcher placement, the Starting Pitcher palette card is left-aligned and shows one chevron.
2. Expanding/collapsing Starting Pitcher never shows a duplicate chevron.
3. Existing child fields and placed-instance entries still appear under Starting Pitcher.
4. Selecting **Use Starting Pitcher record** offers **Record Layout** but not **Text Template**.
5. Selecting an individual Starting Pitcher field still offers its normal Single Item / Text Template choices.
