# Build 028.2 Implementation

Focused correction pass based on Build 028.1 acceptance.

## 1. Game Date format visibility

- `Date format` is shown only when the active Single Item field is `game.date`.
- Visibility is enforced directly when the active field changes and remains deterministic when the Single Item tool is displayed in the contextual New Object panel.
- Other Single Item fields do not display the date-format control.

## 2. Palette state simplification

Removed the crowded right-side status/count text and green checkmark from palette item cards.

Palette state is now communicated visually:

- plain border: available / not currently used;
- subtle green border: used by a placement or Text Template;
- gold selected border: currently selected;
- chevron: the row has expandable content/instances.

This gives field/object names the available card width and removes the prior checkmark/status alignment problem.
