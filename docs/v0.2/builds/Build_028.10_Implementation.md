# Build 028.10 — Starting Pitcher Source Context / Conditional Formatting

## Scope

This decimal build is intentionally limited to the Starting Pitcher-derived Single Item and Text Template context bugs identified during Build 028 acceptance testing. Other player object types (Starting Lineup, Defensive Alignment, Bench, Bullpen) were checked and are behaving correctly.

## Changes

- Starting Pitcher Single Item placements now retain their Away/Home Starting Pitcher record context.
- Designer preview, Inspector defaults, Restore Defaults, Test PDF, and live PDF now resolve pitcher conditional formatting for those scalar placements using the actual pitcher's Throws value.
- Starting Pitcher-derived Text Templates retain the appropriate Away/Home Starting Pitcher context.
- The Text Template Item Selection field list is scoped to the corresponding Starting Pitcher record rather than the full field catalog.
- Starting Pitcher-derived Text Templates now inherit the pitcher conditional style; generic Text Templates created from the main Text Template palette remain in the generic/Game Information formatting context.
- Legacy SP-derived Text Templates that lack an explicit saved context can recover their source context when their saved player-formatting group and template tokens unambiguously identify one Away/Home Starting Pitcher record.
- Manual formatting overrides remain supported. Selecting a value that matches the conditional default now correctly falls back to that conditional default rather than the broader Team Player default.

## Acceptance focus

Use the six-row Starting Pitcher test:

1. Away SP Record Layout — conditional formatting remains correct.
2. Away SP Player Name as Single Item — conditional formatting is correct by default and after Restore Defaults.
3. Away SP Player Name as Text Template — conditional formatting is correct and token picker shows only Away SP fields.
4. Home SP Record Layout — conditional formatting remains correct.
5. Home SP Player Name as Single Item — conditional formatting is correct by default and after Restore Defaults.
6. Home SP Player Name as Text Template — conditional formatting is correct and token picker shows only Home SP fields.

A generic Text Template containing Starting Pitcher tokens must continue to use generic/Game Information formatting.
