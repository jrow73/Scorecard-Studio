# Build 010 — Repeated Block Foundation + Starting Lineups

Status: implementation ready for Local/Online acceptance.

Build 010 introduces a reusable repeated-block model without changing accepted Build 009 scalar mapping semantics. A lineup block binds to `away.lineup` or `home.lineup`, owns a layout-defined row capacity, derives vertical row spacing from first/last-row placement, and contains independently positioned/formatted columns.

Initial repeated lineup columns: batting order, jersey number, player name, position, bats, AVG, OBP, SLG, OPS, HR, and RBI. Each column supports left, center, or right X-anchor alignment. Row Y remains baseline-based. Stored spacing is in physical PDF points.

Generation resolves repeated fields with explicit 1-based slot selectors. Unused rows remain blank. Players beyond capacity produce a visible overflow notice. Posted lineups longer than nine are preserved by normalization.

Compatibility: legacy scalar mappings remain baseline-left and retain existing coordinates/font sizes. New mapping/column records reserve `content: { type: "field", field: ... }` so future free-text templates can use the same content boundary; template parsing/editing is not part of Build 010.

Acceptance focus: create Away and Home blocks; test 9-row and non-9-row capacities; place first/last rows; add multiple columns with mixed alignment; save/reload; generate from a posted historical lineup; verify blank rows and deliberate overflow; confirm existing Build 009 scalar mappings still generate in unchanged positions; repeat Local and Online.
