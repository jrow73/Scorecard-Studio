# Scorecard Studio v0.4 Game Selection and Competition Scope

**Status:** Build 001.1 authority  
**Purpose:** Define favorite-team initialization and date/level browsing without an implicit MLB-only startup assumption.

## 1. User workflow

### Favorite-team startup

1. Read the saved favorite level/sport and team from Settings.
2. Request that team's games for the user's current local date in the saved competition context.
3. Show each matching game when more than one exists.
4. Present source status, lineup readiness, and optional probable `SP vs SP`.
5. Offer Open Game Day and Generate Scorecard actions.

### Browse another game

1. Choose a date.
2. Choose a supported level.
3. Request the Schedule for that date and level.
4. Group games by returned league identity when both teams make that grouping unambiguous.
5. Put cross-league, ambiguous, or unclassified games in a neutral group rather than assigning them arbitrarily.
6. Select a game and show the same readiness/actions card used for the favorite-team game.

The interface uses friendly level names. Raw `sportId`, `leagueId`, and division identifiers remain implementation/provenance values.

## 2. Initial evidenced levels

The v0.3 evidence established bounded regular-season endpoint behavior at these levels:

| User label | Tested sport ID | Current evidence boundary |
|---|---:|---|
| MLB | 1 | Broadest tested support across adopted source families. |
| Triple-A | 11 | Schedule/feed, dated roster, explicitly scoped People statistics, staff, standings, logo, and venue evidence with documented limits. |
| Double-A | 12 | Schedule/feed, dated roster, explicitly scoped People statistics, staff, standings, and logo evidence; extended Venue parity remains less complete. |
| High-A | 13 | Schedule/feed, dated roster, explicitly scoped People statistics, staff, standings, and logo evidence; extended Venue parity remains untested. |
| Single-A | 14 | Schedule/feed, dated roster, explicitly scoped People statistics, staff, standings, and logo evidence; extended Venue parity remains untested. |

“Supported” remains endpoint-specific. It does not promise identical staff size, official cardinality, standings shape, depth-chart roles, historical availability, or live publication timing across levels.

## 3. Rookie-level discovery gate

Rookie-level competition is a desired v0.4 scope candidate but was not established by the v0.3 evidence. Before adding it to the ordinary level picker, a bounded discovery increment must verify:

- date/level Schedule enumeration and game identity;
- future/pregame lineup and probable-pitcher publication behavior;
- dated active-roster membership;
- explicitly scoped People hitting and pitching statistics;
- coaching staff and manager behavior;
- standings group behavior, including split-season or atypical structures;
- Game Feed officials and venue identity;
- narrow Venue detail where used;
- team-logo behavior if logos enter product scope;
- expected missing depth-chart behavior and the authoritative bullpen fallback.

If only Schedule discovery is reliable, Rookie games may not be advertised as fully supported for Game Day/PDF hydration until the missing capabilities are represented honestly.

## 4. Deferred provider investigations

College baseball and Korean professional baseball are not v0.4 commitments. They require separate discovery of authoritative providers and contracts for:

- stable team/game/player identifiers;
- schedules and game lifecycle;
- pregame lineups and probable pitchers;
- dated roster membership;
- player statistics and competition scope;
- standings;
- officials, venues, and licensing/usage constraints.

These competitions must not be forced into MLB/MiLB field assumptions merely because the user workflow can display another level option.

## 5. Favorite-team setting and migration

The favorite must retain both team and competition identity. The user chooses a level first, then a team at that level.

Existing v0.3 favorites are MLB-only records. On first v0.4 settings migration:

- preserve the stored team ID and name;
- add level key `mlb` and sport ID `1`;
- do not clear or silently replace the favorite;
- persist the expanded setting only through a deliberate migration path.

If a saved team no longer appears in a fetched current team list, keep the stored identity and report that validation is unavailable rather than selecting a different team.

## 6. Schedule query contract

Two distinct queries are required:

| Use | Scope |
|---|---|
| Favorite-team startup | date + team ID + saved sport/level context |
| Browse other games | date + sport/level context, without a favorite-team filter |

Both retain selected date, sport ID, game type, season, gamePk, official date, game number, team IDs, and returned league/division identity. The selected game becomes the sole authority for downstream competition scope.

No roster, People, standings, or other adapter may replace the selected game's sport context with an MLB default.

## 7. League grouping rules

League grouping is presentation, not selection authority.

- If both teams share a returned league identity, group the game under that league.
- If league identities differ, are absent, or conflict, use a neutral `Other / Cross-league` group.
- MLB may be shown as one MLB list rather than forcing interleague games into American or National League ownership.
- Group ordering should be deterministic and based on source labels/IDs, followed by scheduled start time.
- Do not synthesize league membership from team names.

## 8. Readiness and multiple games

Each game view has independent readiness. A doubleheader can therefore show Game 1 Ready and Game 2 Waiting. Selection keys must continue using gamePk plus the intended date/view so postponed/rescheduled duplicates do not collapse.

Probable starters are optional Schedule values. Their absence does not change lineup readiness and renders as `TBD` rather than an inferred roster pitcher.

Generating a PDF before both lineups are posted requires a separate product decision in Build 001.4: either disable the primary action, allow an explicit incomplete-data override, or generate with a prominent missing-data warning. The readiness model must support any of those policies without redefining source state.

## 9. Home performance target

The initial favorite-team/today result should be renderable from Schedule data alone. Opening Game Day or generating a mapped PDF activates the richer capability-driven source plan. This boundary reduces unnecessary requests and prevents the landing page from blocking on research-level hydration.

## 10. Acceptance cases

- Existing MLB favorite migrates and loads today's MLB schedule.
- New Triple-A, Double-A, High-A, or Single-A favorite loads that level directly on startup.
- No favorite presents setup without preventing date/level browsing.
- Date/level browsing lists every returned game exactly once.
- Same-league games group correctly; cross-league/unknown games remain neutral.
- Doubleheader games retain independent selection and readiness.
- Missing probable pitcher displays `TBD` without selecting a roster substitute.
- Partial, unposted, postponed, cancelled, final, unknown, no-game, and request-failure states remain distinguishable.
- No downstream request silently changes a MiLB selected game to MLB scope.
