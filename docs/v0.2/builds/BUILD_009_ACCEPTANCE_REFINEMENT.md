# Build 009 — Acceptance Refinement

Status: implementation complete; Local/Online acceptance still required.

## Acceptance findings addressed

1. Designer sample data used generic manager placeholders and an intentionally long pitcher placeholder. The normalized Designer fixture now uses realistic representative values for both managers and both starting pitchers.
2. A mapped field’s **Show** button changed PDF pages when necessary but did not bring the target into view or identify it visually.

## Changes

- Designer sample away manager: `Kevin Cash`.
- Designer sample home manager: `Dan Wilson`.
- Designer sample away starting pitcher: `Shane Baz`.
- Designer sample home starting pitcher remains `Logan Gilbert`.
- Every overlay marker now carries its mapping ID in a DOM data attribute.
- **Show** now:
  - switches to the mapping’s page;
  - exits placement mode;
  - renders that page;
  - scrolls the exact mapping marker into the center of the viewport;
  - focuses it without a second scroll;
  - briefly highlights/pulses it;
  - reports which field/page is being shown.
- Repeated Show clicks restart the highlight.
- `prefers-reduced-motion` disables the pulse animation while retaining the visible outline.
- Cache-busting query updated to `009a`.

## Preserved behavior

- Mapping IDs and duplicate-field placements.
- Baseline-left coordinate semantics.
- Stored page percentages and font sizes.
- PDF generation and registry resolution.
- IndexedDB layout/PDF compatibility.
- Game Day behavior and lazy hydration.
- README.md unchanged.

## Targeted checks performed

- `node --check js/app.js`
- `node --check js/field-registry.js`
- `node --check js/formatter.js`
- `node --check js/normalize.js`

## Acceptance test

1. Open a layout with mappings on both pages.
2. Scroll far enough down the mapping list that the PDF preview is off-screen.
3. Click **Show** on a mapping from the current page; verify the browser scrolls to the exact marker and it visibly highlights.
4. Repeat for a mapping on another page; verify the page changes first, then scroll/highlight occurs.
5. Click Show repeatedly on the same mapping; verify the highlight restarts.
6. Confirm the four representative manager/starting-pitcher values appear in Designer previews.
7. Generate the PDF and confirm placement/output remain unchanged.
8. Repeat Local and Online.

Suggested commit after acceptance:

`fix: refine Build 009 designer preview and Show navigation`
