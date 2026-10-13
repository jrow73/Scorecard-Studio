# Build 032.4a — Defensive Alignment Player Name Format Fix

## Scope

Correct a narrow initialization issue in the new Defensive Alignment Text Template workflow. During new-object creation, selecting **Player Name** in the token picker displayed the dependent name-format selector, but that selector contained no options.

## Changes

- Added the Defensive Alignment Text Template name-format selector to the shared `populateNameFormatSelects()` initialization path.
- The selector now receives the same supported Player Name formats used throughout the Designer:
  - Full Name
  - First Initial + Last Name
  - Last Name
  - First Name
  - Use Name
  - Boxscore Name
- The fix uses the existing shared name-format population logic; no Defensive Alignment-specific option list was added.
- Existing placed-item editing behavior is unchanged.
- Generic and repeated-record Text Template name-format behavior is unchanged.

## Acceptance checks

1. Open Home or Away **Defensive Alignment** and choose **Text Template**.
2. In the token selector, choose **Player Name**.
3. Confirm the secondary name-format dropdown appears and is populated immediately.
4. Confirm **Insert into editor** remains disabled until a name format is chosen.
5. Choose each supported format and confirm the inserted token/Preview uses that format.
6. Place the item, reopen it, and confirm the existing-item editor still shows the populated name-format selector.
7. Spot-check a generic Text Template and a repeated-record Text Template to confirm their Player Name format selectors still behave normally.

## Result

Build 032.4 behavior is otherwise unchanged.
