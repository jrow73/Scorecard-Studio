# Build 032.4 — Defensive Alignment Text Template Support

## Scope

Extend Home/Away Defensive Alignment Individual Placement so each defensive role can be represented either by a single field or by a contextual Text Template, while preserving the existing sequential role-placement workflow.

## Changes

- Added **Content type** to Defensive Alignment role placement:
  - **Single Item** retains the existing field workflow.
  - **Text Template** opens the shared-style Editor, Preview, token selector, and **Insert into editor** controls.
- Text Template tokens resolve in the selected defensive role context. Example: `#[Jersey #] [Player Name]` resolves against Catcher, First Base, Second Base, etc. as the role advances.
- After each placement, the Inspector continues to advance to the next unplaced defensive role.
- The just-used configuration carries forward to the next role:
  - content type,
  - selected field/name format for Single Item,
  - template text for Text Template,
  - alignment.
- Individual Text Template mappings use the existing `individualMappings` structure and `content.type = "template"`; existing field-only layouts require no migration.
- Existing individual Text Templates can be selected and edited with the shared Text Template Editor controls.
- Designer overlay previews and generated PDFs resolve individual Text Templates using the defensive role selector.
- Text Template support is intentionally exposed only for Home/Away Defensive Alignment in this build; other legacy Individual Placement collections retain their existing behavior.

## Acceptance checks

1. Open Away or Home **Defensive Alignment** and select the first role.
2. Confirm **Content type** offers **Single Item** and **Text Template**.
3. Confirm **Single Item** behaves exactly as before.
4. Choose **Text Template**, create a template such as `#[Jersey #] [Player Name]`, and verify the Preview resolves against the selected role.
5. Place the Catcher template. Confirm the workflow advances automatically to First Base while retaining Text Template mode, the same template text, and alignment.
6. Continue placing several roles using only **Place Text Template → click scorecard** after the initial configuration.
7. Confirm each overlay preview resolves to the correct player for its defensive role.
8. Select an already-placed defensive Text Template and confirm the Editor/tokens can modify it.
9. Generate a Test PDF and confirm each defensive role's Text Template renders using that role's player data.
10. Verify existing field-only Defensive Alignment placements and saved layouts still work unchanged.
