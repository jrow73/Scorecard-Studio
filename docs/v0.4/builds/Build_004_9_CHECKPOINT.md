# Build 004.9 Checkpoint

**Date:** 2026-10-12  
**Runtime identity:** `0.4.0-dev • Build 004.9`  
**Baseline:** accepted Build 004.8d  
**Status:** focused smoke accepted; Build 004 closed

## Scope

Build 004.9 is a bounded data-correctness release that restores the intended timezone behavior before Build 004 closes. It does not add another presentation redesign.

## Completed

- The formatter accepts normalized venue timezone objects as well as legacy timezone strings.
- Home's Selected Game card obtains the venue timezone and shows user-local and game-local first-pitch times when they differ.
- Game Day uses the same dual-zone browser presentation.
- Generated scorecards render `game.startTime` in the game's venue timezone only.
- Scorecard hydration requests venue details whenever game-local first-pitch time is required.
- Same-zone browser displays remain concise with one time.

## Verification

- 248 applicable v0.3/v0.4 automated checks pass.
- Three Build 004.9 timezone regression checks cover normalized timezone objects, PDF game-local formatting, and browser dual-zone wiring.
- Changed JavaScript and the browser acceptance runner pass syntax validation.
- Protected `README.md` retains its accepted SHA-256 hash.

## Smoke checklist

1. From a Central Time browser, choose an Eastern Time home game.
2. Confirm Home and Game Day identify both the user-local and game-local first-pitch times.
3. Generate the scorecard and confirm the PDF shows only Eastern Time.
4. Choose a same-timezone game and confirm the browser does not repeat the time.

## Closure

Focused smoke acceptance was received on 2026-10-12. Build 004 is closed, and subsequent feature or UI requests begin in the next numbered build.
