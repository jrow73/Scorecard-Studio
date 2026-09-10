# Scorecard Studio --- Pregame Data Inventory

**Status:** Draft\
**Target milestone:** v0.2.0 --- Complete Field Mapping & Formatting\
**Purpose:** Define the pregame data Scorecard Studio may make available
to layouts, independent of which MLB API request supplies it.

> This is a candidate field library, not yet an API specification.
> Fields are first considered from the scorekeeper/layout perspective,
> then verified against MLB data sources.

## Inventory conventions

**Priority:** Core = broadly useful; Common = frequently useful on
detailed cards; Optional = specialized or information-dense layouts.

**Source:** Game Feed = expected in game-specific pregame data; Other
MLB API = supplemental request; Derived = constructed from normalized
data; Unknown = still to investigate.

**Cardinality:** Single, Per Team, ×9 Lineup, ×N variable collection,
Derived, or Composite.

## 1. Game

  ------------------------------------------------------------------------------------------------------------------
  Field         Example      Priority   Cardinality   Expected source Normalized path              Notes
  ------------- ------------ ---------- ------------- --------------- ---------------------------- -----------------
  Game date     2026-09-06   Core       Single        Schedule/feed   `game.date`                  

  Scheduled     7:05 PM      Core       Single        Schedule/feed   `game.startTime`             
  start                                                                                            

  Venue name    T-Mobile     Core       Single        Game feed       `game.venue.name`            
                Park                                                                               

  Venue         47,929       Optional   Single        Unknown/venue   `game.venue.capacity`        Carpenter-style
  capacity                                            metadata                                     field

  Temperature   72°          Common     Single        Game feed       `game.weather.temperature`   

  Conditions    Cloudy       Common     Single        Game feed       `game.weather.condition`     

  Wind          8 mph L→R    Common     Single        Game feed       `game.weather.wind`          

  Weather       72°, cloudy, Common     Composite     Derived         `game.weather.summary`       
  summary       wind 8 mph                                                                         
                L→R                                                                                
  ------------------------------------------------------------------------------------------------------------------

## 2. Teams

Applies to both `away` and `home`.

  -------------------------------------------------------------------------------------------------------------------
  Field          Example    Priority   Cardinality   Expected      Normalized path                      Notes
                                                     source                                             
  -------------- ---------- ---------- ------------- ------------- ------------------------------------ -------------
  Full team name Seattle    Core       Per Team      Game feed     `away.team.name`                     Proven in
                 Mariners                                                                               v0.1.0

  Location name  Seattle    Common     Per Team      Feed/team     `away.team.locationName`             Useful in
                                                     metadata                                           limited space

  Club name      Mariners   Common     Per Team      Feed/team     `away.team.clubName`                 
                                                     metadata                                           

  Abbreviation   SEA        Common     Per Team      Team metadata `away.team.abbreviation`             

  Team ID        136        Internal   Per Team      Game feed     `away.team.id`                       Application
                                                                                                        data

  Wins           82         Core       Per Team      Game feed     `away.team.record.wins`              Verify

  Losses         63         Core       Per Team      Game feed     `away.team.record.losses`            Verify

  W-L record     82-63      Core       Composite     Derived       `away.team.record.display`           

  Winning        .566       Common     Per Team      Other         `away.team.record.pct`               
  percentage                                         API/derived                                        

  Games back     2.5        Common     Per Team      Other MLB API `away.team.standings.gamesBack`      

  Division place 2nd        Common     Per Team      Other MLB API `away.team.standings.divisionRank`   

  League place   4th        Optional   Per Team      Other MLB API `away.team.standings.leagueRank`     

  Streak         W4         Common     Per Team      Other MLB API `away.team.standings.streak`         

  Last 10        7-3        Common     Per Team      Other MLB API `away.team.standings.last10`         
  -------------------------------------------------------------------------------------------------------------------

## 3. Team Personnel

  ----------------------------------------------------------------------------------------------
  Field       Priority    Cardinality   Expected    Normalized path                Notes
                                        source                                     
  ----------- ----------- ------------- ----------- ------------------------------ -------------
  Manager     Core        Per Team      Other MLB   `away.manager.name`            Known gap
  name                                  API                                        from earlier
                                                                                   game-feed
                                                                                   work

  Manager     Optional    Per Team      Other MLB   `away.manager.number`          
  number                                API                                        

  Bench coach Optional    Per Team      Unknown     `away.coaches.bench.name`      Investigate

  Hitting     Optional    Per Team      Unknown     `away.coaches.hitting[]`       Investigate
  coach(es)                                                                        

  Pitching    Optional    Per Team      Unknown     `away.coaches.pitching.name`   Investigate
  coach                                                                            
  ----------------------------------------------------------------------------------------------

## 4. Starting Lineup

Repeat for batting-order positions 1--9 for each team.

  -------------------------------------------------------------------------------------------------------
  Field           Example          Priority       Expected source Normalized path pattern
  --------------- ---------------- -------------- --------------- ---------------------------------------
  Batting-order   1                Core           Game feed       `away.lineup[].battingOrder`
  slot                                                            

  Player ID       ---              Internal       Game feed       `away.lineup[].player.id`

  Full name       Julio Rodríguez  Core           Game feed       `away.lineup[].player.name`

  Uniform number  44               Core           Feed/player     `away.lineup[].player.number`
                                                  metadata        

  Position        CF               Core           Game feed       `away.lineup[].position.abbreviation`
  abbreviation                                                    

  Position name   Center Field     Optional       Game feed       `away.lineup[].position.name`

  Bats            R/L/S            Common         Player          `away.lineup[].player.bats`
                                                  metadata/feed   

  AVG             .284             Common         Game feed       `away.lineup[].stats.avg`

  OBP             .351             Common         Game feed       `away.lineup[].stats.obp`

  SLG             .492             Common         Game feed       `away.lineup[].stats.slg`

  OPS             .843             Common         Game feed       `away.lineup[].stats.ops`
                                                  API/derived     

  HR              18               Common         Game feed       `away.lineup[].stats.homeRuns`

  RBI             67               Common         Game feed       `away.lineup[].stats.rbi`

  Runs            72               Optional       Game feed       `away.lineup[].stats.runs`

  Hits            143              Optional       Game feed       `away.lineup[].stats.hits`

  Doubles         28               Optional       Game feed       `away.lineup[].stats.doubles`

  Triples         3                Optional       Game feed       `away.lineup[].stats.triples`

  Stolen bases    22               Optional       Game feed       `away.lineup[].stats.stolenBases`

  Walks           48               Optional       Game feed       `away.lineup[].stats.walks`

  Strikeouts      121              Optional       Game feed       `away.lineup[].stats.strikeouts`

  Slash line      .284/.351/.492   Common         Derived         `away.lineup[].stats.slashLine`
  -------------------------------------------------------------------------------------------------------

## 5. Starting Pitcher

  ----------------------------------------------------------------------------------------------------------
  Field          Example        Priority       Expected source Normalized path
  -------------- -------------- -------------- --------------- ---------------------------------------------
  Full name      Logan Gilbert  Core           Game feed       `away.startingPitcher.player.name`

  Uniform number 36             Core           Feed/player     `away.startingPitcher.player.number`
                                               metadata        

  Throws         R/L            Common         Player          `away.startingPitcher.player.throws`
                                               metadata/feed   

  Wins           11             Common         Game feed       `away.startingPitcher.stats.wins`

  Losses         7              Common         Game feed       `away.startingPitcher.stats.losses`

  W-L            11-7           Common         Derived         `away.startingPitcher.stats.record`

  ERA            3.42           Common         Game feed       `away.startingPitcher.stats.era`

  WHIP           1.08           Common         Game feed       `away.startingPitcher.stats.whip`

  IP             154.2          Common         Game feed       `away.startingPitcher.stats.inningsPitched`

  Hits allowed   132            Optional       Game feed       `away.startingPitcher.stats.hits`

  Runs allowed   61             Optional       Game feed       `away.startingPitcher.stats.runs`

  Earned runs    58             Optional       Game feed       `away.startingPitcher.stats.earnedRuns`

  Walks          39             Optional       Game feed       `away.startingPitcher.stats.walks`

  Strikeouts     171            Common         Game feed       `away.startingPitcher.stats.strikeouts`

  HR allowed     17             Optional       Game feed       `away.startingPitcher.stats.homeRuns`

  Opponent AVG   .221           Optional       Other           `away.startingPitcher.stats.opponentAvg`
                                               API/derived     
  ----------------------------------------------------------------------------------------------------------

## 6. Bench

Variable-length collection for each team.

  --------------------------------------------------------------------------------------------
  Field             Priority          Expected source   Normalized path
  ----------------- ----------------- ----------------- --------------------------------------
  Player name       Core              Game feed         `away.bench[].player.name`

  Uniform number    Core              Feed/player       `away.bench[].player.number`
                                      metadata          

  Position          Common            Feed/player       `away.bench[].position.abbreviation`
                                      metadata          

  Bats              Common            Player metadata   `away.bench[].player.bats`

  AVG/OBP/SLG/OPS   Optional          Game feed         `away.bench[].stats.*`
  --------------------------------------------------------------------------------------------

## 7. Bullpen

Variable-length collection for each team.

  -----------------------------------------------------------------------------------------
  Field             Priority          Expected source   Normalized path
  ----------------- ----------------- ----------------- -----------------------------------
  Pitcher name      Core              Game feed         `away.bullpen[].player.name`

  Uniform number    Core              Feed/player       `away.bullpen[].player.number`
                                      metadata          

  Throws            Common            Player metadata   `away.bullpen[].player.throws`

  W-L               Optional          Game feed         `away.bullpen[].stats.record`

  ERA               Common            Game feed         `away.bullpen[].stats.era`

  WHIP              Optional          Game feed         `away.bullpen[].stats.whip`

  Saves             Common            Game feed         `away.bullpen[].stats.saves`

  Holds             Optional          Game feed         `away.bullpen[].stats.holds`

  Strikeouts        Optional          Game feed         `away.bullpen[].stats.strikeouts`
  -----------------------------------------------------------------------------------------

## 8. Defensive Alignment

Primarily alternate views of the starting lineup rather than separate
player data.

  ---------------------------------------------------------------------------------------
  Field             Priority          Source            Normalized path
  ----------------- ----------------- ----------------- ---------------------------------
  Pitcher           Common            Starting          `away.defense.pitcher`
                                      pitcher/lineup    

  Catcher           Common            Starting lineup   `away.defense.catcher`

  First base        Common            Starting lineup   `away.defense.firstBase`

  Second base       Common            Starting lineup   `away.defense.secondBase`

  Third base        Common            Starting lineup   `away.defense.thirdBase`

  Shortstop         Common            Starting lineup   `away.defense.shortstop`

  Left field        Common            Starting lineup   `away.defense.leftField`

  Center field      Common            Starting lineup   `away.defense.centerField`

  Right field       Common            Starting lineup   `away.defense.rightField`

  Designated hitter Common            Starting lineup   `away.defense.designatedHitter`
  ---------------------------------------------------------------------------------------

## 9. Umpires

  -----------------------------------------------------------------------------------
  Field             Priority          Expected source   Normalized path
  ----------------- ----------------- ----------------- -----------------------------
  Home plate        Common            Game feed         `game.umpires.home`

  First base        Common            Game feed         `game.umpires.first`

  Second base       Common            Game feed         `game.umpires.second`

  Third base        Common            Game feed         `game.umpires.third`

  Additional        Optional          Game feed         `game.umpires.additional[]`
  umpire(s)                                             
  -----------------------------------------------------------------------------------

## 10. Standings Table

A layout may map a standings block in addition to each selected team's
own standings fields.

  Field     Priority   Expected source   Normalized path
  --------- ---------- ----------------- -------------------------
  Team      Common     Other MLB API     `standings[].team.name`
  Wins      Common     Other MLB API     `standings[].wins`
  Losses    Common     Other MLB API     `standings[].losses`
  PCT       Common     Other MLB API     `standings[].pct`
  GB        Common     Other MLB API     `standings[].gamesBack`
  Rank      Common     Other MLB API     `standings[].rank`
  Streak    Optional   Other MLB API     `standings[].streak`
  Last 10   Optional   Other MLB API     `standings[].last10`

## 11. Composite / Display Fields

Composite fields should be assembled from atomic normalized values
rather than stored as separate source data.

  -----------------------------------------------------------------------------------
  Composite               Example                             Components
  ----------------------- ----------------------------------- -----------------------
  Team record             `82-63`                             wins + losses

  Pitcher record          `11-7`                              wins + losses

  Batter slash line       `.284/.351/.492`                    AVG + OBP + SLG

  Compact batter line     `.284/.351/.492 • 18 HR • 67 RBI`   hitting stats

  Compact pitcher line    `11-7 • 3.42 ERA • 1.08 WHIP`       pitching stats

  Weather summary         `72°, Cloudy • Wind 8 mph L→R`      weather components

  Player identity         `#44 Julio Rodríguez CF`            number + name +
                                                              position
  -----------------------------------------------------------------------------------

Future formatting controls may determine separators, labels,
prefixes/suffixes, ordering, and handling of missing components.

## 12. Pregame Boundary

The supplied completed Bob Carpenter card contains both pregame and
information recorded while scoring. The initial field library excludes
clearly in-game/postgame results such as:

-   inning-by-inning R/H/E/LOB;
-   final R/H/E/LOB;
-   winning and losing pitcher;
-   save credited in the current game;
-   current-game pitcher lines;
-   current-game batter AB/R/H/RBI;
-   actual finish time and elapsed game time;
-   play-by-play scorekeeping marks.

A field such as **scheduled start time** remains pregame data even
though a completed card may later show the actual start time.

## 13. Field-Model Principles

- **Field inventory** means everything Scorecard Studio knows how to obtain or derive.
- **Mapped fields** are the subset a specific layout chooses to place on its PDF.
- The Designer should consume a normalized pregame model rather than raw API response paths.
- One normalized player can be referenced in multiple views, such as batting order and defensive alignment.
- Prefer **atomic fields** (`avg`, `obp`, `slg`) plus optional **composite fields** (`.284/.351/.492`) over storing duplicate formatted values.
- Repeated structures such as lineups should be modeled as collections rather than dozens of unrelated field IDs.
- Variable collections such as bench and bullpen require layout behavior that tolerates different collection lengths.
- Traditional scorecard information is the v0.2/v1.0 priority; advanced broadcaster-style matchup research is deferred.
- Game Pack / game-feed data is the base pregame model used for Home / Select Game.
- Supplemental manager/coaching personnel and standings context should be treated as on-demand hydration.
- Team records and relevant player season/YTD statistics are Game-Pack-native and do not require separate player-stat hydration.
- Build 008 historical testing verified date-appropriate player season/YTD statistics, manager, and standings context for selected historical games.
- A selected layout should declare its needs implicitly through its mapped fields; unmapped supplemental categories should not be fetched.
- Future one-click generation for the favorite team/favorite layout should use the same dependency-driven hydration process.

## 14. Mapping and Formatting Design Decisions

The following questions were resolved during post-Build-009 planning and form
the design basis for Build 010 and later v0.2.0 work.

1. **Lineups use repeated blocks, not nine copies of every field.** A repeated
   row structure binds to the lineup collection. The layout defines its own
   capacity, so an MLB card may use nine rows while college, youth, or other
   baseball cards may provide ten or more.
2. **Vertical repeated placement uses first/last row geometry.** The user places
   the first and last row for the configured capacity; intermediate row spacing
   is inferred. This preserves the successful interaction from the earlier
   Python mapper while removing the hard-coded nine-row assumption.
3. **A repeated row may contain multiple independently formatted columns.**
   Jersey number, name, position, handedness, and statistics may each have
   independent X placement, font size, and alignment while sharing the same row
   progression.
4. **Alignment is per placement/column.** Left, center, and right alignment are
   required. Existing baseline-left mappings retain their coordinates and
   semantics. New repeated-column placement should support alignment-aware X
   anchors without changing the baseline Y convention.
5. **Bench and bullpen will reuse the repeated-block engine.** Their variable
   length must not be hard-coded to four or any other typical count. Fewer
   members than layout capacity leave blanks; overflow is explicitly reported.
   Horizontal/grid arrangements and continuation blocks are planned extensions
   rather than separate bench/bullpen systems.
6. **Composite/free-text templates are general-purpose.** They may be used for
   ordinary scalar placements (`[Away Team] ([W-L])`, `Weather: [temp] and
   [conditions]`) or within repeated rows (`[jersey] [lastname] ([position])`).
   Repeated templates resolve tokens in the current row context.
7. **Templates remain allowlisted and dependency-aware.** They reference
   registry fields, never arbitrary JavaScript, and their referenced fields
   participate in lazy hydration planning. A template editor/parser is deferred
   from Build 010, tentatively after the repeated-collection geometry work. Future optional/smart punctuation
   behavior should prevent empty parentheses, dangling separators, and similar
   artifacts when values are missing.
8. **Overflow must be visible.** Scorecard Studio must not silently discard
   players, invent new pages, or unpredictably resize an entire collection to
   force it into a layout. Explicit continuation/truncation choices can be added
   later.

Still open for later refinement:

- Which exact batting and pitching statistics should be surfaced first in the
  repeated-block Designer UI.
- How probable/preliminary personnel should be labeled before an official lineup
  is posted.
- Detailed fit behavior for long text: maximum width, shrink-to-fit, clipping,
  wrapping, or combinations.
- Final grid/horizontal repeated-block interaction and continuation-block UX.
- Which supplemental personnel/standings categories Game Day should hydrate
  automatically versus only when required by a mapped layout.

## 15. Scope Boundary: Advanced Matchup & Situational Data

The traditional field library should remain focused on information commonly
placed on a pregame scorecard. The following categories are intentionally
**deferred beyond the initial v1.0 scope**, even if MLB data sources make some
of them technically available:

- season-series/head-to-head record;
- record versus division opponents;
- home/road splits;
- batter-vs-starting-pitcher history;
- pitcher-vs-opponent history;
- platoon splits;
- recent-performance windows;
- situational batting or pitching splits;
- other broadcaster-style or sabermetric matchup data.

These are not rejected ideas. They are separated from the v1.0 field library
because they introduce relationships, historical windows, and situational
queries that are substantially different from ordinary atomic pregame fields.

### Future Pregame Research / Game Day View

A future **Pregame Research** or **Game Day** page may be a better home for this
information than fixed PDF mappings.

The intended distinction is:

| Scorecard PDF | Pregame Research |
|---|---|
| Structured fields | Contextual information |
| Predictable placement | Variable length |
| Repeatable formatting | Browsable |
| Intended for automatic PDF population | Intended for selective note-taking |

Example research insight:

> Julio Rodríguez has homered five times against today's opposing starter.

A scorekeeper may decide that one such fact is worth handwriting into a notes
section without requiring Scorecard Studio to reserve a permanent PDF field for
every possible matchup statistic.

## 16. API Verification Worklist

-   [x] Manager/coaching staff — Team Coaches API browser-verified; historical manager date behavior verified
-   [x] Team W-L record — Game Pack
-   [x] Division rank and games back — Standings API browser-verified
-   [x] Current streak — Standings API browser-verified
-   [x] Last-10 record — Standings API browser-verified
-   [x] Batter season statistics — Game Pack `seasonStats.batting`
-   [x] Starting-pitcher season statistics — Game Pack `seasonStats.pitching`
-   [x] Bullpen season statistics — Game Pack `seasonStats.pitching`
-   [x] Bench-player season statistics — Game Pack `seasonStats.batting`
-   [x] Bats/throws metadata — Game Pack player metadata
-   [x] Venue capacity/metadata — Game Pack
-   [x] Historical player season/YTD date behavior — verified with a selected historical game
-   [ ] Pregame umpire availability/timing — present in tested fixture; timing still to characterize
-   [ ] Early-day Game Pack completeness before lineups are posted
-   [ ] MiLB consistency for the same data families

### Build 008 historical-date verification

Build 008 added historical date selection to Home / Select Game. Testing showed
that a selected historical game returned season/YTD player statistics
appropriate to that game date. A separate test involving a team whose manager
had subsequently been replaced returned the manager appropriate to the
historical date. Standings context was also successfully retrieved for the
selected game's date.

These results support historical scorecard generation as a useful secondary
workflow while keeping today's game as the normal use case. They remain
verified real-game behaviors rather than a guarantee of identical availability
or timing for every MLB/MiLB fixture.

## 17. Source Notes

This first draft is based on: - Scorecard Studio v0.1.0's existing
pregame/game-feed work; and - the supplied completed Bob Carpenter
scorecard as an example of a detailed scorekeeper's information needs.

Because the Carpenter example is a completed card, this inventory
intentionally extracts candidate **pregame** information rather than
treating every handwritten value as something available before the game.


Build 008 browser testing further refined this inventory using the Game Day view, Team Coaches API, Standings API, and historical-date selection.


### Collection geometry note (post-Build 011)

Build 011 acceptance confirms the repeated-block data model can be reused across
starting lineup, bench, and bullpen collections. Future layout geometry should
remain independent of collection type. The same collection may need to render as
a vertical list, horizontal list, configurable grid, or individually placed
items/roles depending on the scorecard design. This also covers role-oriented
diagrams, such as individually placed umpire assignments or lineup players placed
at defensive positions. These are future placement capabilities, not new pregame
data requirements.
