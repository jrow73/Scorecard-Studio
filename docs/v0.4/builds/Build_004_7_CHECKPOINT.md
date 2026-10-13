# Build 004.7 Checkpoint

**Build:** Scorecard Studio `0.4.0-dev • Build 004.7d`  
**Date:** 2026-10-12  
**Scope:** Responsive layout, touch interaction, dialog containment, keyboard focus, and reduced-motion hardening

## Completed

- Added pointer-type-aware Designer drag thresholds so taps do not move scorecard items.
- Added active-pointer capture, pointer-cancel cleanup, and changed-only persistence for Designer drags.
- Bounded dialogs to the dynamic viewport and hardened narrow Layout Settings body/footer behavior.
- Stacked mirrored Field Palette columns on very narrow displays.
- Added coarse-pointer target sizing to the primary interactive surfaces without changing desktop density.
- Preserved Designer source/visual order while improving its narrow-screen spacing and touch scrolling.
- Added intentional initial focus to the named Restore dialog heading.
- Preserved the accepted skip navigation, visible focus treatment, native modal behavior, keyboard Designer commands, and reduced-motion handling.
- Advanced current runtime and backup identity to Build 004.7 without changing `README.md`.
- Removed avoidable horizontal overflow from the Layout Settings body and wrapped narrow category actions.
- Reserved direct touch gestures over markers for scrolling and added a selected-item move handle for deliberate touch movement.
- Added remote-touch detection fallbacks and restored a near-immediate 2-pixel mouse/trackpad drag threshold.
- Advanced the correction identity to Build 004.7a without changing `README.md`.
- Corrected the dialog/form viewport-width mismatch that remained visible in the parent and child Layout Settings views.
- Moved the touch move handle above selected content so it remains distinct from the Shrink-to-Fit width affordance.
- Advanced the second correction identity to Build 004.7b without changing `README.md`.
- Rebuilt the Layout Settings shell as a non-shrinking header/footer flex column with a single scrollable body.
- Bound the parent and all child views to the same dynamic-viewport height and disabled hidden-page scrolling while the modal is open.
- Advanced the third correction identity to Build 004.7c without changing `README.md`.
- Replaced the Game Day floating section menu's hard-coded top offsets with the measured responsive app-header height.
- Applied the same responsive measurement to section-link landing positions.
- Advanced the fourth correction identity to Build 004.7d without changing `README.md`.

## Resume / acceptance gate

- 240 applicable v0.3/v0.4 automated checks pass.
- JavaScript syntax checks pass for the application, Designer interaction helper, and browser acceptance runner.
- The real in-app browser passes a 319px-wide render check: no root overflow, valid dialog names, skip link first, contained Restore dialog, no dialog horizontal overflow, and correct initial focus.
- Command-line Chrome acceptance is blocked by a Windows GPU-process startup failure before application load.
- Protected `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

Package changed files only, then request the Build 004.7 smoke test documented in `docs/v0.4/builds/Build_004.md`.
