# Scorecard Studio v0.5 — Build 004.1 Checkpoint

**Status:** Complete  
**Date:** 2026-10-14  
**Runtime identity:** v0.5.0-dev, Build 004.2

Build 004.1 adds a small player-identity presentation model over the metadata already retained in normalized player records.

- The existing `player.name` remains the displayed table name.
- Formal identity is composed only when both API `firstName` and `lastName` are present.
- Formal identity is shown only when it differs from the displayed name after Unicode compatibility, apostrophe, dash, case, and whitespace normalization.
- API pronunciation is preserved verbatim when present.
- No pronunciation is synthesized.
- Players with neither a distinct formal name nor pronunciation receive no identity trigger.

No new API request, schema revision, saved-layout change, or PDF behavior is introduced.
