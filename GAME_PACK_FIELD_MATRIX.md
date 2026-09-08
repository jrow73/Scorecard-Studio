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

The clearest remaining supplemental-data targets are:

1. manager/coaching personnel;
2. division/league rank;
3. meaningful games-back values if the feed does not populate them reliably;
4. streak;
5. last-10 record.

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

| Candidate field | Status | Game Pack path | Note |
|---|---|---|---|
| Manager name | MISSING — Supplemental research | — | No `manager` key/name found |
| Manager number | MISSING — Supplemental research | — | |
| Bench coach | MISSING — Supplemental research | — | |
| Hitting coach(es) | MISSING — Supplemental research | — | |
| Pitching coach | MISSING — Supplemental research | — | |

This remains a genuine supplemental-data family.

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

## 13. Standings / Record Data Still Needing Research

The Game Pack makes a useful distinction apparent:

### Already available without another request

- wins;
- losses;
- games played;
- winning percentage;
- division leader flag;
- league/division identity.

### Still unresolved / likely supplemental

- division rank/place;
- league rank/place;
- meaningful games-back value;
- current streak;
- last 10;
- full division/league standings table.

The Game Pack contains several `*GamesBack` keys, but all are `"-"` in this fixture, so they should **not yet be treated as verified usable standings fields**.

## 14. Supplemental API Discovery Queue

Based on this fixture, the next API discovery work should be much narrower than originally planned.

### Priority 1 — Team personnel

Need to discover and verify:

- manager name;
- manager number if available;
- bench coach;
- hitting coach(es);
- pitching coach.

**Likely hydration trigger:** any mapped `manager` / `coach` field.

### Priority 2 — Standings context

Need to discover and verify:

- division rank;
- league rank if useful;
- games back;
- streak;
- last 10;
- standings-table rows.

**Likely hydration trigger:** mapped standings/rank/GB/streak/last-10 fields or a standings block.

### Lower-priority verification

These are already present in this fixture but should eventually be tested for timing/consistency:

- umpire crew availability before first pitch;
- Game Pack seasonStats completeness for all lineup/bench/bullpen players;
- probable pitcher availability timing;
- lineups and bench/bullpen population timing;
- Game Pack behavior for MiLB games.

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

Research the two remaining high-value supplemental families using the IDs already present in this fixture:

- Seattle Mariners team ID: `136`
- Tampa Bay Rays team ID: `139`
- Seattle division ID: `200`
- Tampa Bay division ID: `201`
- Season: `2026`

Start with **manager/coaching staff**, then **standings context**.
