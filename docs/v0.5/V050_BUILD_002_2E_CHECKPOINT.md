# Scorecard Studio v0.5 — Build 002.2e Checkpoint

**Status:** Complete  
**Date:** 2026-10-13  
**Implementation baseline:** corrective Build 002.2d / runtime Build 002.3d  
**Runtime identity after integration:** v0.5.0-dev, Build 002.3e

## Outcome

Corrected the wide-screen vertical alignment introduced by Build 002.2d. Away-league and home-league standings now render inside two independent stacked columns. Both columns begin immediately below the shared Wild Card cutoff note, and cards within either column no longer reserve rows based on the height or count of cards in the opposite column.

The narrow-screen presentation remains a single stacked column.

Wild Card rows whose source-specific elimination marker is `-` now display a neutral em dash rather than the malformed text `E-`.

## Verification

- Static integration coverage requires the dedicated two-column wrapper and its narrow-screen collapse.
- Existing standings-side assignment and Wild Card elimination-field regression tests remain green.
- Runtime cache identities advance so browsers do not retain the superseded grid rules.

## Smoke-test focus

1. Open a September MLB interleague game in Advanced mode.
2. Confirm the first away-league and home-league standings cards align at the top.
3. Confirm each league's remaining division and Wild Card cards stack directly below its first card without large vertical gaps.
4. Narrow the browser and confirm both league columns stack cleanly into one column.
