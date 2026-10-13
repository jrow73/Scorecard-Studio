# Scorecard Studio v0.4.0 — Build 002 Closure

**Build range:** 002.1–002.7a  
**Status:** Implementation complete; fresh-profile Edge restore retest requested  
**Closed contract:** `scorecard-studio-backup`, format version 1  
**Closure date:** 2026-10-09

## 1. Delivered capability

Build 002 provides one recoverable, extensible backup path for user-owned Scorecard Studio data:

- registered portable application settings;
- saved layouts;
- every PDF template referenced by an exported layout;
- complete and single-layout scopes;
- deterministic ordering and authenticated PDF bytes;
- read-only import validation and compatibility analysis;
- explicit Replace, Keep Both, and Skip decisions;
- reference-safe identity remapping;
- one atomic settings/layouts/PDF transaction;
- a visible Settings workflow with a separate final confirmation; and
- interruption, corruption, compatibility, quota, and post-commit failure handling.

API caches, normalized snapshots, generated scorecards, credentials, permissions, and other reproducible or browser-owned state remain outside the portable-data boundary.

## 2. Closure evidence

- 202 accepted automated checks pass.
- Complete and single-layout round trips preserve portable data and isolation.
- Historical layouts, unknown fields, unknown properties, and missing legacy `pitcherGroup` values survive without opportunistic rewrites.
- Duplicate identities, missing references, malformed Base64, invalid PDFs, size mismatches, hash tampering, incompatible versions, and limit violations cannot produce a writable plan.
- Quota and transaction failures publish no partial data across the three portable stores.
- Stale file selections cannot supersede a newer selection.
- Confirmation is locked during commit, and commit failure is distinguished from refresh failure after a successful commit.
- Chrome 153 passes desktop and narrow browser automation, including IndexedDB readiness and a real complete-backup payload.
- The Codex in-app browser passes live Settings, complete-backup creation, disabled-state, and console checks.
- Edge 154 is present but its managed headless invocation returns no DOM output; no Edge automated-pass claim is made.
- A real Chrome-to-Edge complete restore preserved the favorite competition, but the running Edge interface did not display it until a hard refresh. Build 002.7a now invalidates the Settings team-list cache, repopulates the restored favorite selection, and refreshes Home immediately after commit.
- `README.md` remains unchanged.

## 3. Manual Edge 002.7a retest

After overlaying the changed files onto the freshly cleared Edge profile:

1. Load the app and confirm the sidebar shows `0.4.0-dev • Build 002.7a`.
2. Open **Settings** and confirm the status reads **IndexedDB ready**.
3. Import the complete backup created in Chrome, review it, and complete the restore.
4. Without reloading or hard-refreshing, confirm the favorite-team selector immediately shows the restored favorite.
5. Return to **Home** and confirm the restored favorite's current-date schedule/readiness appears without reloading.
6. Confirm the restored layouts are present and open normally.

Report the step number and visible message if any check fails. This retest intentionally performs a restore into the cleared Edge database.

## 4. Extension rule

Future registered JSON-safe settings enter complete backups through the setting registry and do not require a backup-format change. A format revision is needed only when the envelope, integrity model, storage-unit semantics, or compatibility guarantees themselves must change.

## 5. Build 003 handoff

Build 003 may implement user-facing preferences on top of the generic setting registry. The initial likely scope is appearance preferences, including system/light/dark behavior, without reopening the backup engine unless a new setting cannot be represented as registered JSON-safe portable data.
