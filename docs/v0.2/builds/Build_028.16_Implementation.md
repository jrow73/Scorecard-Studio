# Build 028.16 - Team Information Text Template Context

## Scope

This decimal build fixes one regression: a Text Template created from a Home/Away Team Information palette field was losing its source context and becoming a generic Text Template.

## Changes

- Team Information field-derived Text Templates now retain an explicit Away/Home Team Information context.
- The Text Template field picker is scoped to the matching Team Information side instead of exposing the full registry.
- The originating Team Information field is persisted on the template mapping so the palette treats it as a placed instance rather than only as a referenced token.
- Other Team Information fields used inside that template still appear as references.
- Home/Away copy-paste context conversion now translates the retained Team Information context and originating field.
- Team Information formatting defaults remain unchanged.
- Generic Text Templates created from the standalone Text Template palette remain unrestricted and context-free.

## Acceptance checks

1. Start from any Away Team Information field and choose Text Template. The token picker contains only Away Team Information fields.
2. Place the template. The originating Away Team field shows the placement as a Text Template instance rather than only `Referenced by a Text Template`.
3. Other Away Team fields added as tokens may still show reference status.
4. Copy/paste the placed template with Away -> Home conversion. Its context, origin field, and tokens resolve as Home Team Information.
5. Repeat symmetrically from Home Team Information.
6. A Text Template created from the standalone Text Template palette still exposes all available fields and does not acquire Team Information context.
