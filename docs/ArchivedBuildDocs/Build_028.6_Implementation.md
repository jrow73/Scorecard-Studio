# Build 028.6 — Text Template Inspector Ordering

## Scope

This is a deliberately narrow follow-up to Build 028.5. It changes only the ordering of Text Template controls in the Selected Item inspector.

## Changes

- Moved the existing Text Template editor block above the Formatting expander.
- Template, Preview, field selector / optional name-format selector, and Insert Field now appear with the Selected Item content before Formatting.
- Formatting remains below that content and otherwise behaves exactly as in Build 028.5.
- No Text Template editing behavior, token insertion behavior, preview logic, formatting behavior, placement data, or PDF generation logic was changed.

## Acceptance

1. Select an existing Text Template placement.
2. Confirm Template, Preview, the field selector, and Insert Field appear before the Formatting expander.
3. Expand and collapse Formatting and confirm the Text Template controls remain visible above it.
4. Edit the template and insert fields; confirm Preview continues to update normally.
5. Confirm non-Text-Template items are unchanged.
