# Scorecard Studio v0.4.0 — Build 003 Closure

**Build range:** 003.1–003.5  
**Status:** Implementation complete; short cross-browser smoke requested  
**Runtime identity:** `0.4.0-dev • Build 003.5`  
**Closure date:** 2026-10-10

## 1. Delivered capability

Build 003 turns application appearance into an ordinary, portable preference and completes the surrounding interface and accessibility work:

- System, Light, and Dark appearance choices with immediate application and persistence;
- startup appearance mirroring that minimizes opposite-theme flash without replacing IndexedDB authority;
- live System-mode response to operating-system appearance changes;
- complete Light and Dark coverage across Home, Game Day, Layouts, Designer, dialogs, status states, and narrow layouts;
- keyboard-visible focus, a functional skip-to-main-content link, reduced-motion behavior, and named dialogs;
- a Settings hierarchy that separates favorite-team setup, appearance, and backup responsibilities;
- one progressively revealed restore modal for file choice, validation, optional conflicts, confirmation, and completion;
- viewport-bounded restore presentation without horizontal overflow;
- immediate post-restore refresh of portable preferences and layouts; and
- recovery from an IndexedDB connection invalidated by live developer-tools database deletion.

The backup envelope remains `scorecard-studio-backup` format version 1. The IndexedDB schema, normalized game model, saved-layout model, PDF behavior, and protected v1 product contract do not change in Build 003.

## 2. Portable preference boundary

| Setting | Complete backup | Single-layout backup | Restore behavior |
|---|---:|---:|---|
| `appPreferencesV1` | Yes | No | Normalized and immediately reapplied; currently owns appearance. |
| `favoriteCompetition` | Yes | No | Normalized and immediately reflected in Settings and Home. |
| `favoriteLayoutId` | Yes, when its layout is included | No | Restored only with a valid target; rewritten when Keep Both remaps the layout. |
| `livePdfLayoutId` | No | No | Receiving browser keeps its transient last-used selection. |
| `favoriteTeam` | Migration only | No | Converts to canonical competition-aware favorite state when needed. |
| `includeAdditionalStarters` | No | No | Retired global behavior cannot override per-layout pitcher-group choices. |

Future ordinary preferences remain extensions to the registered-setting contract, not special cases in the backup engine.

## 3. Closure evidence

- 221 accepted automated checks pass.
- Five focused Build 003 closure checks prove complete preference round trip, single-layout isolation, Keep Both reference remapping, post-restore state order, and protected-contract continuity.
- Chrome passes desktop and 390-pixel-wide browser automation with Light, Dark, and System state; all primary views remain free of horizontal overflow.
- The restore modal opens at Step 1, remains within the viewport, and has no horizontal overflow in both automated viewports.
- A real complete-backup payload reports format version 1 and Build 003.5 identity.
- No captured Chrome browser errors or unhandled rejections occurred.
- Managed Edge headless invocation returns no DOM output, so no automated Edge-pass claim is made.
- Earlier manual Chrome-to-Edge complete restore and Edge-to-Chrome single-layout replacement tests passed, including immediate favorite refresh after Build 002.7a.
- Manual Build 003.4a acceptance confirmed the progressive modal workflow; Build 003.4b isolated and corrected the stale connection exposed by deleting IndexedDB without reloading.
- `README.md` SHA-256 remains `7EE092F6F1CBD3CFD113E4C2C9DB6B85F0E4A3E28568759FFBEC17EE98A528BE`.

## 4. Manual acceptance handoff

Use the six-step smoke checklist in `docs/v0.4/builds/Build_003.md`. The key closure evidence is one Chrome-to-Edge complete restore proving immediate preference application and one Edge-to-Chrome single-layout restore proving preference isolation, followed by one PDF generation check.

## 5. Build 004 planning boundary

Build 003 completes the defined preference and interface-refinement roadmap. Build 004 requires an explicit product-scope review before implementation. It must begin from the accepted Build 003.5 behavior and must not silently reopen:

- backup format version 1;
- the storage schema;
- normalized source/API contracts;
- saved-layout compatibility;
- per-layout pitcher-group semantics; or
- the protected `README.md`.

Any future setting that is JSON-safe and ordinary should join complete backup/restore through the generic registry. Only a change to envelope structure, integrity semantics, storage-unit atomicity, or compatibility guarantees justifies a new backup format.
