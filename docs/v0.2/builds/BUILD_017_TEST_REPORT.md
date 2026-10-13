# Build 017 Test Report

Status: **Automated and browser smoke checks pass; local/GitHub Pages acceptance required.**

## Automated checks

Run from the repository root:

`node tests/build017.test.mjs`

Result: **PASS**.

Covered behaviors:

- Home/Away Starting Pitcher registry symmetry;
- normalization and resolution of Jersey #, W-L, walks, and the pitching family;
- source-backed First Initial + Last Name formatting and full-name fallback;
- Starting Pitcher Record Layout template resolution;
- repeated lineup slot template resolution in the selected row;
- rejection/blanking of tokens outside the active record context;
- legacy Build 016 `[Away Starting Pitcher]` token compatibility;
- field dependency collection for field and template slot content; and
- continued availability of the Build 016 repeated-field registry.

Syntax checks passed for `app.js`, `field-registry.js`, `formatter.js`, `normalize.js`, and `slot-content.js`.

## Browser smoke check

The app was served locally and loaded in a browser. Result: **PASS**.

- Build 017 assets loaded with no console errors.
- Both Starting Pitcher record contexts appeared in the layout context selector.
- Field and Text Template appeared as slot-content choices.
- All five initial Player Name formats were populated.
- Existing pregame initialization completed normally.

## Acceptance test

1. Open an existing accepted Build 016 layout. Confirm scalar items, existing Text Templates, Individual Placement, and vertical/horizontal/grid Repeated Layouts preview and generate unchanged.
2. Expand Away and Home Players → Starting Pitcher. Confirm the record exposes Player Name, Jersey #, Throws, W, L, W-L, ERA, WHIP, IP, strikeouts, walks, and the remaining supported pitching fields.
3. Place Starting Pitcher Player Name as a Single Item. Test Full Name, First Initial + Last Name, Last Name, First Name, and Use Name + Last Name. Confirm a missing selected source variant falls back to Full Name.
4. Create an Away Starting Pitcher Record Layout. One click should set its single slot. Add centered Jersey #, centered Throws, and a left-aligned Text Template such as `[Away Starting Pitcher — Player Name] ([Away Starting Pitcher — W-L], [Away Starting Pitcher — ERA] ERA)`.
5. Add ERA or WHIP separately as another Single Item. Confirm the Record Layout did not consume or prevent reuse of the same record attributes.
6. Create an Away Starting Lineup repeated vertical layout. Add Jersey # and Position as fields and `([Away Lineup — Bats]) [Away Lineup — Player Name] ([Away Lineup — AVG])` as a Text Template. Confirm every row resolves in its own lineup slot.
7. Repeat the slot-template check for Bench, Bullpen, and Umpire Crew. Confirm the Insert Field list is limited to the selected collection and each row resolves in its current context.
8. Select a placed slot Text Template from the PDF. Edit its template, font size, alignment, and X anchor; confirm every repeated slot updates while a Record Layout updates its single slot.
9. Save/reopen the layout and generate a PDF locally. Confirm preview/output agreement, blank-value behavior, multiline template behavior, and unchanged overflow reporting for repeated collections.
10. Publish the changed files to GitHub Pages and repeat steps 1, 4, 6, and 9 online.

## Explicit non-tests

Colors, fit/shrink, Undo/Redo, synthetic full-capacity sample filling, capacity-warning polish, and broad post-017 field coverage are outside this build and should not be treated as regressions unless existing Build 016 behavior changed.
