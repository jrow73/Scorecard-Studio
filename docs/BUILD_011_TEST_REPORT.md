# Build 011 — Test Report

Status: static/targeted tests and browser acceptance passed September 10, 2026.

## Automated/static checks

- `js/app.js`, `js/field-registry.js`, and `js/normalize.js` pass `node --check`.
- Registry exposes all six supported repeated collections.
- Per-side field counts: starting lineup 11, bench 10, bullpen 11.
- Bench and bullpen repeated fields resolve through the existing 1-based slot
  resolver.
- Existing overflow detection works for the newly supported collections.
- Existing Build 010 collection IDs remain unchanged; no IndexedDB/storage
  migration is introduced.
- Browser cache-busting/build references advance to Build 011.

## Browser acceptance results

- Existing Build 010 lineup blocks continued to render correctly.
- Bench and bullpen blocks were tested with multiple field-column combinations
  and alignments; row/column generation matched the intended layout geometry.
- A 4-slot bench with only 2 available players populated two slots and left the
  remaining slots blank as intended. This is normal under-capacity behavior and
  should not be presented as an error.
- A bullpen block with fewer mapped slots than available pitchers generated the
  mapped rows correctly and produced an explicit overflow notice.
- The overflow/status text is currently easy to miss because the browser file-
  save dialog can cover the page immediately after generation. Future UX should
  present generation success and warnings in a post-generation dialog/toast.
- Proof of concept accepted.

## Follow-on architecture note

Repeated collections should not be assigned fixed geometry by collection type.
The future placement model should support vertical list, horizontal list,
configurable grid, and individual placement modes for any suitable collection.
Individual placement may eventually support role-aware anchors, such as umpire
positions or defensive positions on a field diagram.
