# Build 012 Test Report

Status: **STATIC/TARGETED TESTS PASS — browser acceptance pending**

## Automated/static checks

- `js/app.js` passes `node --check`.
- Confirmed Build 012 Designer controls for vertical, horizontal, and grid arrangements are present.
- Confirmed generalized `slot-grid-v1` geometry and slot-relative field offsets are present.
- Confirmed Build 012 slot-guide CSS is present.

## Targeted geometry assertions

A small Node assertion harness verified:

- a 2 x 2 grid resolves slots in row-major order;
- the first and last slot coordinates resolve to the expected page-relative positions;
- a 1 x 4 horizontal arrangement resolves as one row and four columns;
- a legacy Build 010/011 block with no arrangement metadata still resolves as a vertical `N x 1` block;
- converting an existing absolute field anchor to a slot-relative offset reconstructs the original X anchor.

## Browser acceptance still required

Recommended acceptance pass:

1. Open an existing Build 011/011.1 layout and verify its vertical repeated blocks still preview and generate exactly as before.
2. Create a new vertical repeated block and confirm behavior remains equivalent to the accepted Build 011 workflow.
3. Create a horizontal block (for example four slots), place the first and last slot origins, add two or more fields with mixed alignment, and generate a PDF.
4. Create a 2 x 2 grid, place top-left and bottom-right slot origins, add two or more fields to slot 1, and verify all four slots repeat correctly in row-major order.
5. Repeat one placement at 200% Designer zoom and confirm the generated PDF is unchanged by viewer zoom.
6. Verify under-capacity collections leave unused slots blank and overflow still reports explicitly.

Browser acceptance should focus on slot geometry, field alignment, backwards compatibility, and generated-PDF placement.
