# Scorecard Studio — Game Pack Field Matrix

**Fixture:** MLB gamePk `822955` — Seattle Mariners at Tampa Bay Rays  
**Snapshot status:** `Pre-Game` / `Preview`  
**Snapshot timestamp:** 2026-07-10 18:59:24 (feed metadata)  
**Purpose:** Compare the v0.2.0 candidate pregame field library against a real pregame `/api/v1.1/game/{gamePk}/feed/live` response before researching supplemental endpoints.

> **Important:** “Verified” below means the field is present in this specific pregame fixture. It does not yet prove how early before first pitch MLB populates the field, or that every MLB/MiLB game populates it identically.

## Status Legend

- **VERIFIED — Game Pack:** Present and usable in this pregame fixture.
- **DERIVED — Game Pack:** Source components are present; Scorecard Studio can compose the display value.
- **PARTIAL — Game Pack:** A related key exists, but the fixture does not provide a useful value or the desired field is incomplete.
- **MISSING — Supplemental research:** Not found in this fixture; investigate another MLB API endpoint.
- **INTERNAL:** Useful to Scorecard Studio but not normally a visible scorecard field.

## Executive Summary

This fixture substantially reduces the amount of supplemental API work originally expected.

The Game Pack already contains:

- game date/time and status;
- multiple team-name forms and IDs;
- current team wins, losses, and winning percentage;
- league/division metadata;
- probable/starting pitcher IDs and names;
- posted batting orders;
- bench and bullpen membership;
- player jersey numbers and positions;
- player bats/throws metadata;
- **full season/YTD batting and pitching statistics for boxscore players**;
- venue name, capacity, turf, roof, field dimensions, location, and time zone;
- weather;
- four-man umpire crew;
- defensive alignment.

Build 008 subsequently verified the two supplemental-data families needed to
fill the clearest remaining gaps:

1. **Team Coaches API** for manager/coaching personnel;
2. **Standings API** for division/league rank, meaningful games-back values,
   streak, last-10 record, and standings-table context.

Build 008 also verified historical-date behavior: embedded player season/YTD
statistics corresponded to the selected historical game date; a real
managerial-change test returned the manager appropriate to that historical
date; and standings context was successfully retrieved for the selected date.

These are verified application behaviors, not a guarantee that every MLB/MiLB
game populates every field identically or at the same time before first pitch.

## 1. Game

| Candidate field | Status | Verified Game Pack path | Fixture value / note |
|---|---|---|---|
| Game date | VERIFIED — Game Pack | `gameData.datetime.officialDate` | `2026-07-10` |
| Scheduled start | VERIFIED — Game Pack | `gameData.datetime.dateTime` and `gameData.datetime.time` / `ampm` | `7:10 PM` |
| First pitch | VERIFIED — Game Pack | `gameData.gameInfo.firstPitch` | ISO timestamp |
| Day/night | VERIFIED — Game Pack | `gameData.datetime.dayNight` | `night` |
| Game type | VERIFIED — Game Pack | `gameData.game.type` | `R` |
| Game number | VERIFIED — Game Pack | `gameData.game.gameNumber` | `1` |
| Venue name | VERIFIED — Game Pack | `gameData.venue.name` | Tropicana Field |
| Venue capacity | VERIFIED — Game Pack | `gameData.venue.fieldInfo.capacity` | `25025` |
| Turf type | VERIFIED — Game Pack | `gameData.venue.fieldInfo.turfType` | Artificial Turf |
| Roof type | VERIFIED — Game Pack | `gameData.venue.fieldInfo.roofType` | Dome |
| Field dimensions | VERIFIED — Game Pack | `gameData.venue.fieldInfo.*` | LF/LFC/CF/RFC/RF lines/distances |
| Venue city/state | VERIFIED — Game Pack | `gameData.venue.location.*` | St. Petersburg, FL |
| Venue time zone | VERIFIED — Game Pack | `gameData.venue.timeZone.*` | America/New_York |
| Temperature | VERIFIED — Game Pack | `gameData.weather.temp` | `72` |
| Conditions | VERIFIED — Game Pack | `gameData.weather.condition` | Dome |
| Wind | VERIFIED — Game Pack | `gameData.weather.wind` | `0 mph, None` |
| Weather summary | DERIVED — Game Pack | weather components above | Scorecard Studio can format |

## 2. Teams

Applies symmetrically to `gameData.teams.away` and `.home`.

| Candidate field | Status | Verified Game Pack path | Fixture note |
|---|---|---|---|
| Full team name | VERIFIED — Game Pack | `gameData.teams.{side}.name` | Seattle Mariners / Tampa Bay Rays |
| Location name | VERIFIED — Game Pack | `gameData.teams.{side}.locationName` | Seattle / St. Petersburg |
| Short name | VERIFIED — Game Pack | `gameData.teams.{side}.shortName` | Seattle / Tampa Bay |
| Club/team name | VERIFIED — Game Pack | `gameData.teams.{side}.clubName` or `.teamName` | Mariners / Rays |
| Abbreviation | VERIFIED — Game Pack | `gameData.teams.{side}.abbreviation` | SEA / TB |
| Team ID | INTERNAL | `gameData.teams.{side}.id` | 136 / 139 |
| League | VERIFIED — Game Pack | `gameData.teams.{side}.league.*` | American League |
| Division | VERIFIED — Game Pack | `gameData.teams.{side}.division.*` | AL West / AL East |
| Games played | VERIFIED — Game Pack | `gameData.teams.{side}.record.gamesPlayed` | 94 / 91 |
| Wins | VERIFIED — Game Pack | `gameData.teams.{side}.record.wins` | 47 / 54 |
| Losses | VERIFIED — Game Pack | `gameData.teams.{side}.record.losses` | 47 / 37 |
| W-L record | DERIVED — Game Pack | wins + losses | `47-47`, `54-37` |
| Winning percentage | VERIFIED — Game Pack | `gameData.teams.{side}.record.winningPercentage` | `.500`, `.593` |
| Division leader flag | VERIFIED — Game Pack | `gameData.teams.{side}.record.divisionLeader` | Boolean |
| Division games back | PARTIAL — Game Pack | `gameData.teams.{side}.record.divisionGamesBack` | Key exists, but value is `"-"` in fixture |
| Wild-card games back | PARTIAL — Game Pack | `gameData.teams.{side}.record.wildCardGamesBack` | Key exists, but value is `"-"` in fixture |
| League games back | PARTIAL — Game Pack | `gameData.teams.{side}.record.leagueGamesBack` | Key exists, but value is `"-"` in fixture |
| Division rank/place | MISSING — Supplemental research | — | No rank field found in fixture |
| League rank/place | MISSING — Supplemental research | — | No rank field found in fixture |
| Current streak | MISSING — Supplemental research | — | No streak field found |
| Last 10 | MISSING — Supplemental research | — | No last-10 field found |

### Important revision to prior assumptions

**Current team W-L and winning percentage do not require a supplemental standings request for this fixture.** They are already embedded in the Game Pack.

Standings data may still be required for rank, GB, streak, last-10, and a full standings table.

## 3. Team Personnel

Team personnel remain supplemental rather than Game-Pack-native. Build 008
browser-verified the date-aware Team Coaches endpoint:

`/api/v1/teams/{teamId}/coaches?date={date}&season={season}`

| Candidate field | Status | Source | Note |
|---|---|---|---|
| Manager name | VERIFIED — Supplemental | Team Coaches API | Historical managerial-change test returned the manager appropriate to the selected date |
| Manager number | AVAILABLE — Supplemental | Team Coaches API | `jerseyNumber` when supplied |
| Bench coach | AVAILABLE — Supplemental | Team Coaches API | Identified by job/title |
| Hitting coach(es) | AVAILABLE — Supplemental | Team Coaches API | Variable collection by job/title |
| Pitching coach | AVAILABLE — Supplemental | Team Coaches API | Identified by job/title |

This remains a genuine supplemental-data family and should be lazily hydrated.

## 4. Player Identity & Metadata

Player metadata is available under `gameData.players.ID{playerId}`.

| Candidate field | Status | Verified path pattern |
|---|---|---|
| Player ID | INTERNAL | `gameData.players.ID{id}.id` |
| Full name | VERIFIED — Game Pack | `.fullName` |
| First name | VERIFIED — Game Pack | `.firstName` |
| Last name | VERIFIED — Game Pack | `.lastName` |
| Preferred/use name | VERIFIED — Game Pack | `.useName`, `.useLastName` |
| Boxscore name | VERIFIED — Game Pack | `.boxscoreName` |
| First + last | VERIFIED — Game Pack | `.firstLastName` / `.nameFirstLast` |
| Last + first | VERIFIED — Game Pack | `.lastFirstName` |
| Initial + last | VERIFIED — Game Pack | `.initLastName` |
| Last + initial | VERIFIED — Game Pack | `.lastInitName` |
| Uniform number | VERIFIED — Game Pack | `.primaryNumber` |
| Primary position | VERIFIED — Game Pack | `.primaryPosition.*` |
| Bats | VERIFIED — Game Pack | `.batSide.code` |
| Throws | VERIFIED — Game Pack | `.pitchHand.code` |
| Pronunciation | VERIFIED when supplied | `.pronunciation` | Optional; not all players have it |
| Suffix/title | VERIFIED when supplied | `.nameSuffix` / `.nameTitle` | e.g. Victor Mesa Jr. |

This is richer than the initial field inventory anticipated and should help the future **Name Format** controls avoid reconstructing names unnecessarily.

## 5. Starting Lineups

The official batting order for each side is directly available as a list of player IDs:

`liveData.boxscore.teams.{side}.battingOrder`

The fixture contains exactly nine IDs per team.

Individual player records are in:

`liveData.boxscore.teams.{side}.players.ID{playerId}`

| Candidate field | Status | Verified path |
|---|---|---|
| Batting-order slot | VERIFIED — Game Pack | order of IDs in `.battingOrder`, and player `.battingOrder` such as `"100"`, `"200"` |
| Player name | VERIFIED — Game Pack | player `.person.fullName` or `gameData.players` |
| Jersey number | VERIFIED — Game Pack | player `.jerseyNumber` |
| Defensive position | VERIFIED — Game Pack | player `.position.abbreviation` / `.name` |
| Bats | VERIFIED — Game Pack | cross-reference same player ID to `gameData.players.ID{id}.batSide.code` |
| Throws | VERIFIED — Game Pack | cross-reference same player ID to `gameData.players.ID{id}.pitchHand.code` |
| All positions used | VERIFIED — Game Pack | player `.allPositions[]` when present |

## 6. Batter Season/YTD Statistics

**Major finding:** the boxscore player records already contain season statistics in the pregame fixture.

Path pattern:

`liveData.boxscore.teams.{side}.players.ID{playerId}.seasonStats.batting`

Verified fields include:

| Candidate field | Status | Game Pack property |
|---|---|---|
| Games played | VERIFIED — Game Pack | `gamesPlayed` |
| AVG | VERIFIED — Game Pack | `avg` |
| OBP | VERIFIED — Game Pack | `obp` |
| SLG | VERIFIED — Game Pack | `slg` |
| OPS | VERIFIED — Game Pack | `ops` |
| Hits | VERIFIED — Game Pack | `hits` |
| Runs | VERIFIED — Game Pack | `runs` |
| Doubles | VERIFIED — Game Pack | `doubles` |
| Triples | VERIFIED — Game Pack | `triples` |
| Home runs | VERIFIED — Game Pack | `homeRuns` |
| RBI | VERIFIED — Game Pack | `rbi` |
| Walks | VERIFIED — Game Pack | `baseOnBalls` |
| Strikeouts | VERIFIED — Game Pack | `strikeOuts` |
| Stolen bases | VERIFIED — Game Pack | `stolenBases` |
| Caught stealing | VERIFIED — Game Pack | `caughtStealing` |
| Plate appearances | VERIFIED — Game Pack | `plateAppearances` |
| At-bats | VERIFIED — Game Pack | `atBats` |
| Total bases | VERIFIED — Game Pack | `totalBases` |
| HBP | VERIFIED — Game Pack | `hitByPitch` |
| Sac bunts | VERIFIED — Game Pack | `sacBunts` |
| Sac flies | VERIFIED — Game Pack | `sacFlies` |
| BABIP | VERIFIED — Game Pack | `babip` |
| AB per HR | VERIFIED — Game Pack | `atBatsPerHomeRun` |
| Slash line | DERIVED — Game Pack | `avg` + `obp` + `slg` |

For the traditional v0.2.0 batting-stat library, **a separate per-player stats request may not be necessary at all** when the Game Pack is populated like this fixture.

## 7. Starting Pitchers

The fixture identifies probable pitchers at:

`gameData.probablePitchers.away`  
`gameData.probablePitchers.home`

The boxscore also contains the current pitcher list:

`liveData.boxscore.teams.{side}.pitchers`

In this pregame fixture, each list contains the selected starting pitcher ID.

| Candidate field | Status | Path / source |
|---|---|---|
| Starting/probable pitcher name | VERIFIED — Game Pack | `gameData.probablePitchers.{side}.fullName` |
| Player ID | INTERNAL | `gameData.probablePitchers.{side}.id` |
| Jersey number | VERIFIED — Game Pack | player record / `gameData.players` |
| Throws | VERIFIED — Game Pack | `gameData.players.ID{id}.pitchHand.code` |
| Season stats | VERIFIED — Game Pack | boxscore player `.seasonStats.pitching` |

## 8. Pitcher Season/YTD Statistics

Path pattern:

`liveData.boxscore.teams.{side}.players.ID{playerId}.seasonStats.pitching`

Verified fields include:

| Candidate field | Status | Game Pack property |
|---|---|---|
| Games played/pitched | VERIFIED — Game Pack | `gamesPlayed`, `gamesPitched` |
| Games started | VERIFIED — Game Pack | `gamesStarted` |
| Wins | VERIFIED — Game Pack | `wins` |
| Losses | VERIFIED — Game Pack | `losses` |
| W-L record | DERIVED — Game Pack | wins + losses |
| ERA | VERIFIED — Game Pack | `era` |
| WHIP | VERIFIED — Game Pack | `whip` |
| Innings pitched | VERIFIED — Game Pack | `inningsPitched` |
| Hits allowed | VERIFIED — Game Pack | `hits` |
| Runs allowed | VERIFIED — Game Pack | `runs` |
| Earned runs | VERIFIED — Game Pack | `earnedRuns` |
| Walks | VERIFIED — Game Pack | `baseOnBalls` |
| Strikeouts | VERIFIED — Game Pack | `strikeOuts` |
| Home runs allowed | VERIFIED — Game Pack | `homeRuns` |
| Saves | VERIFIED — Game Pack | `saves` |
| Save opportunities | VERIFIED — Game Pack | `saveOpportunities` |
| Holds | VERIFIED — Game Pack | `holds` |
| Blown saves | VERIFIED — Game Pack | `blownSaves` |
| Win percentage | VERIFIED — Game Pack | `winPercentage` |
| K/BB ratio | VERIFIED — Game Pack | `strikeoutWalkRatio` |
| K/9 | VERIFIED — Game Pack | `strikeoutsPer9Inn` |
| BB/9 | VERIFIED — Game Pack | `walksPer9Inn` |
| H/9 | VERIFIED — Game Pack | `hitsPer9Inn` |
| HR/9 | VERIFIED — Game Pack | `homeRunsPer9` |
| Pitches per inning | VERIFIED — Game Pack | `pitchesPerInning` |
| Opponent AVG | NOT DIRECTLY VERIFIED | — | Not found as a named `opponentAvg` property in this fixture |

The initial inventory's traditional starter/bullpen fields are therefore almost entirely Game-Pack-native.

## 9. Bench

Membership list:

`liveData.boxscore.teams.{side}.bench`

The fixture contains four bench player IDs for each team.

Each bench player's identity, metadata, and season batting statistics are available through the same player records described above.

| Candidate field | Status |
|---|---|
| Name | VERIFIED — Game Pack |
| Number | VERIFIED — Game Pack |
| Position | VERIFIED — Game Pack |
| Bats | VERIFIED — Game Pack |
| AVG / OBP / SLG / OPS | VERIFIED — Game Pack |
| Other traditional hitting stats | VERIFIED — Game Pack |

## 10. Bullpen

Membership list:

`liveData.boxscore.teams.{side}.bullpen`

The fixture contains bullpen player IDs for both teams. Each listed pitcher's season pitching statistics are available in their boxscore player record.

| Candidate field | Status |
|---|---|
| Name | VERIFIED — Game Pack |
| Number | VERIFIED — Game Pack |
| Throws | VERIFIED — Game Pack |
| W-L | DERIVED — Game Pack |
| ERA | VERIFIED — Game Pack |
| WHIP | VERIFIED — Game Pack |
| Saves | VERIFIED — Game Pack |
| Holds | VERIFIED — Game Pack |
| Strikeouts | VERIFIED — Game Pack |

## 11. Defensive Alignment

The currently configured defense is directly represented at:

`liveData.linescore.defense`

The fixture exposes pitcher, catcher, first, second, third, shortstop, left, center, and right by player ID/name.

This means a defensive-position diagram can be populated either:

1. directly from `liveData.linescore.defense`, or
2. derived from the posted starting lineup and positions.

**Status: VERIFIED — Game Pack**

## 12. Umpires

The complete four-man crew is present in this pregame snapshot at:

`liveData.boxscore.officials[]`

Each entry contains:

- `official.id`
- `official.fullName`
- `officialType`

Fixture roles:

- Home Plate
- First Base
- Second Base
- Third Base

**Status: VERIFIED — Game Pack for this pregame snapshot**

### Timing caution

This proves that umpires were available at the time this fixture was captured. It does **not yet prove how early in the day MLB populates the crew**. That should remain a later timing/reliability test.

## 13. Standings / Record Data

The Game Pack makes a useful distinction apparent:

### Already available without another request

- wins;
- losses;
- games played;
- winning percentage;
- division leader flag;
- league/division identity.

### Verified supplemental standings context

Build 008 browser-verified the date-aware Standings API for division rank,
games back, streak, last 10, and standings-table records:

`/api/v1/standings?leagueId={leagueId}&standingsTypes=regularSeason&date={date}&season={season}`

The Game Pack's `*GamesBack` values were `"-"` in the original fixture, so
Scorecard Studio should continue to use the Standings API for reliable
standings context.

## 14. Verified Supplemental APIs & Historical-Date Behavior

### Team Coaches API
Build 008 browser-verified date-aware team-personnel hydration. A historical
test involving a team whose manager was later replaced returned the manager
appropriate to the selected game date.

### Standings API
Build 008 browser-verified date-aware standings hydration, including division
rank, games back, streak, and last-10 record.

### Historical Game Pack season statistics
Historical-date testing showed that embedded `seasonStats.batting` and
`seasonStats.pitching` correspond to the selected historical game context
rather than simply today's YTD totals.

### Remaining timing/consistency verification
- umpire crew availability before first pitch;
- Game Pack completeness early in the day before lineups are posted;
- probable-pitcher and lineup/bench/bullpen population timing;
- MiLB consistency.

## 15. Implication for Scorecard Studio Hydration Architecture

The fixture suggests an even simpler first implementation than originally planned:

```text
Game Pack
   │
   ├── game / venue / weather
   ├── teams + W-L
   ├── player metadata
   ├── lineup / bench / bullpen
   ├── batter season stats
   ├── pitcher season stats
   ├── umpires
   └── defensive alignment
          ↓
   Normalized Pregame Model
          ↓
   Does selected layout require missing fields?
          │
          ├── No → generate immediately
          │
          └── Yes
               ↓
          Supplemental hydration
          (manager / standings context)
               ↓
          Generate
```

The selected layout should still drive supplemental requests, but **most traditional scorecards may be satisfiable from the Game Pack alone**.

## 16. Next Discovery Step

With the major traditional pregame data families identified and both
supplemental endpoints browser-verified, discovery can shift toward locking the
normalized pregame model, repeated/variable collection mapping, initial stat
selection, formatting/composite controls, and continued timing/MiLB tests.
