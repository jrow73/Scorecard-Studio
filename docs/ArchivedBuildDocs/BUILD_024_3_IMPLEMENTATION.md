# Scorecard Studio - Build 024.3 Implementation

**Baseline:** v0.2.0 Build 024.2  
**Purpose:** Close the remaining Text Template parity gap discovered during Build 024.2 acceptance testing.

---

## Scope

Build 024.3 is a narrowly targeted correction for Text Templates created from a record context, most visibly the Starting Pitcher record.

### Player Name format parity

The Text Template workflow used by standalone and Record objects now exposes the same Player Name display-format choices already available elsewhere in the Designer.

When **Player Name** is chosen from **Choose text field to insert…**:

- **Choose name format…** is progressively revealed.
- The Insert Field button remains unavailable until a name format is selected.
- The chosen format is encoded into the inserted Player Name token.
- The field and name-format controls reset after insertion so another token can be selected cleanly.
- Non-player-name fields do not display the Name Format control.

This applies to Starting Pitcher Record Text Templates as well as other objects using the same Text Template creation path.

---

## Acceptance

1. Select Away or Home Starting Pitcher and choose **Text Template**.
2. Confirm the insertion picker begins at **Choose text field to insert…**.
3. Select **Player Name** and confirm **Choose name format…** appears.
4. Confirm all standard Player Name formats are available.
5. Choose a format and insert Player Name.
6. Confirm the token contains the selected format and the preview renders accordingly.
7. Confirm the field picker resets and Name Format disappears after insertion.
8. Select a non-name field and confirm Name Format does not appear.

---

## Changed/new files

- `app-meta.json`
- `index.html`
- `js/app.js`
- `tests/build0242.test.mjs`
- `tests/build0243.test.mjs`
- `docs/BUILD_024_3_IMPLEMENTATION.md`

`README.md` remains intentionally unchanged.
