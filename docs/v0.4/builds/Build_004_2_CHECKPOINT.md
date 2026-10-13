# Build 004.2 Checkpoint

Updated: 2026-10-10

## Baseline

- Working tree: `V040_Build004_2_work`
- Copied from the completed Build 004.1 documentation baseline and accepted Build 003.5 runtime.
- Protected `README.md` SHA-256: `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## Scope

1. Replace the persistent sidebar with compact responsive navigation.
2. Retain Home, Game Day, Layouts, and Settings as the only primary destinations.
3. Remove the unused Generate placeholder.
4. Require Layout Designer entry through a selected layout.
5. Preserve skip navigation, visible focus, themes, full-screen Designer behavior, and application status.
6. Advance runtime and backup-export identity to Build 004.2.
7. Do not redesign the destination-page workflows in this increment.

## Checkpoints

- [x] C0 — Build 004.1 product and component contracts accepted as implementation authority.
- [x] C1 — Compact desktop and narrow application-header structure implemented.
- [x] C2 — Primary navigation reduced to four destinations; Generate and Designer entries removed.
- [x] C3 — Contextual Designer entry/exit and full-screen behavior preserved.
- [x] C4 — Build identity removed from normal Game Day/Layout content and retained in quiet support context.
- [x] C5 — Focused navigation, appearance, accessibility, backup, and cutover checks pass.
- [x] C6 — Full current v0.3/v0.4 suite passes 209 checks.
- [x] C7 — Changed-files overlay and extraction verification completed.

## Browser note

The isolated Chrome automation process terminates in the host GPU process before page load despite its existing disabled-GPU flag. This is the same runner-class limitation documented in Build 003 and is not an observed application error. Manual Chrome/Edge smoke should cover wide and narrow navigation plus contextual Designer entry.

## Resume instruction

Build 004.2 is complete. After user smoke acceptance, begin Build 004.3 from this working tree. Do not fold Home workflow changes into a corrective shell patch unless the shell itself fails acceptance.
