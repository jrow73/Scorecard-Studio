# Scorecard Studio v1.1.0

Release prepared: October 19, 2026. Stable version: **1.1.0**.

## What's new

- **Searchable Help:** Search topic titles and instructions using one or more words. Matching topics show short excerpts; opening a result highlights the matching words. Back to results keeps the query, and Clear search returns to the normal guide. Topic navigation remains available.
- **Relevant Designer help:** Question-mark buttons open guidance for Starting Lineup, Bench, Starting Pitcher, Bullpen, Standings Table, and Text Templates. Repeated Umpire Crew can use the shared repeating-row guide. Objects without relevant guidance do not show a generic help icon.
- **Detailed instructions:** Guides explain repeating-row placement, record layouts, player options, standings configuration, and Text Templates.
- **Community help and layout sharing:** Links on Home and in Help open the Scorecard Studio Discord. The guide explains how to export and import single-layout backups for sharing.
- **Easier Help maintenance:** Topic text is maintained in root-level `help.html`. Wording changes become searchable after an ordinary app reload; no application-code change or separate index is needed.

The in-app What's New entry explicitly includes search, matching excerpts, and highlighted words alongside contextual guidance and Discord.

## Compatibility

Existing layouts, PDF templates, settings, and backups remain compatible. This release does not change the browser database version (4), normalized data schema (2), or layout/backup formats. Help and search run locally in the browser. There is no new account, cloud synchronization, or search service.

Returning v1 users see the v1.1 announcement once. Users who already saw v1.1 during acceptance do not see it again merely because the development suffix was removed. First-time users retain the welcome flow.

## Install

Use the clean complete-release archive for a fresh deployment, or the ReleaseUpdate changed-files archive over accepted v1.1 Build 003 in a development folder. See `V110_INSTALLATION.md` for the exact workflow and rollback.

## Release evidence

Builds 001, 002, and 003 were accepted by the user. Release finalization is internal Build 004, with coordinated cache identity `110r004`. The stable gate passes 212 automated tests across 30 files, and syntax checks all 46 production JavaScript files. Package manifests, checksums, relative-resource references, and clean archive contents are verified separately.

These files are prepared for deployment. Publishing to the user's repository/hosting environment and checking the deployed stable header are performed after installing the package; no hosting publication was performed during preparation.
