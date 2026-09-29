# Build 028.11 — Modal Separation

## Scope

This decimal build is intentionally limited to the visual separation of the Designer Layout Settings modal. It does not change modal content, card hierarchy, or the broader application styling.

## Changes

- The Layout Settings backdrop is now substantially darker so the Designer workspace visibly recedes while the modal is open.
- The Layout Settings modal surface is slightly differentiated from the underlying Designer while staying within the existing dark theme.
- The modal edge is strengthened with a clearer accent-tinted border and deeper shadow.
- No backdrop blur is used.
- Inner Layout Settings cards and controls are unchanged.

## Acceptance focus

Open Layout Settings from the Designer and compare it with the normal workspace:

1. The surrounding Designer should immediately read as inactive/background content.
2. The modal perimeter should be visually obvious without looking like a different application theme.
3. The modal should remain crisp; the background should be darkened, not blurred.
4. Layout Settings content and controls should otherwise look and behave exactly as before.
