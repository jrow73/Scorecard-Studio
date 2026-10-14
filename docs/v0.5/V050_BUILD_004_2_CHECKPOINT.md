# Scorecard Studio v0.5 — Build 004.2 Checkpoint

**Status:** Complete; smoke tests accepted  
**Date:** 2026-10-14  
**Runtime identity:** v0.5.0-dev, Build 004.2

Build 004.2 exposes available player identity details from lineup, bench, selected-starter, additional-starter, and bullpen tables.

- Hover and keyboard focus open the popover.
- Click, Enter, Space, and touch tap pin or dismiss it.
- Escape, outside click, and a second activation dismiss it.
- Touch movement beyond eight CSS pixels suppresses activation to avoid accidental popovers while scrolling.
- The fixed-position popover is clamped to the viewport and sits above sticky table layers without reflowing a row.
- Re-rendering Game Day closes any stale popover before replacing table content.
- Triggers are visually subtle and appear only when the identity model has useful details.

The feature does not affect PDFs or other application surfaces.
