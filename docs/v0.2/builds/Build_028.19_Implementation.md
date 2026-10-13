# Build 028.19 - Custom Color Picker Interaction

## Scope
Focused Designer polish for the custom color chooser only.

## Changes
- Native custom-color changes now commit on the chooser's `change` event rather than every `input` event. This keeps the chooser alive while dragging sliders or typing a hex value.
- Before opening the native chooser, its hidden anchor is positioned inside the visible viewport near the Custom Color button. This gives the browser an in-bounds anchor so its native chooser can flip/reposition at the right or bottom screen edge.
- Applied the same behavior to single-selection, multi-selection, and Layout Settings color controls because they share the color-picker renderer.
- Preset swatch behavior is unchanged.

## Acceptance
1. Open Custom Color in the Inspector near the right edge of the browser. The chooser remains visible/on-screen.
2. Drag the chooser sliders and select within the color field; it remains open during interaction.
3. Type a complete hex value; the chooser does not disappear after the first key.
4. Complete/accept the color selection; the chosen color is applied.
5. Repeat from Layout Settings and multi-selection formatting.
6. Preset swatches still apply immediately.
