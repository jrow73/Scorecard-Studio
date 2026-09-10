# Build 011 — Variable-Length Bench + Bullpen Blocks

Status: accepted in browser testing September 10, 2026.

Build 011 extends the accepted Build 010 repeated-block engine from starting
lineups to the variable-length Away/Home bench and bullpen collections. It does
not introduce a new storage shape: existing `repeatedBlocks` continue to store
collection, capacity, page, first-row geometry, physical row spacing, and
independent columns.

The Designer collection selector now supports six collections: Away/Home
starting lineup, Away/Home bench, and Away/Home bullpen. Bench columns include
jersey number, player name, position, bats, AVG, OBP, SLG, OPS, HR, and RBI.
Bullpen columns include jersey number, pitcher name, throws, wins, losses, ERA,
WHIP, innings pitched, strikeouts, saves, and holds.

All repeated collections share the Build 010 behavior already validated in the
browser: layout-defined capacity; first/last-row baseline placement; physical
PDF-point row spacing; independently positioned columns; per-column left,
center, or right alignment; blank unused rows; and a visible overflow notice
when collection membership exceeds capacity.

Compatibility is a primary Build 011 requirement. Existing Build 010 lineup
blocks must load and generate without migration or coordinate changes. Scalar
Build 009 mappings remain baseline-left. Build 011 does not add custom sorting,
continuation blocks, grids, horizontal repetition, composite/free-text
parsing, conditional color formatting, or fit controls.

Acceptance confirmed that existing lineup blocks remain correct and that bench
and bullpen blocks work with different capacities and mixed alignments. A block
with fewer members than available slots correctly leaves unused slots blank; this
is normal behavior, not an error. A block with more members than capacity fills
its mapped slots and explicitly reports overflow.

Future geometry must remain collection-agnostic. Any repeated collection may
eventually use a vertical list, horizontal list, configurable grid, or individual
placement. Individual placement may be ordinal or role-based (for example, named
umpire positions or lineup players placed at defensive positions). These are
future architecture/UX requirements and are not part of Build 011.
