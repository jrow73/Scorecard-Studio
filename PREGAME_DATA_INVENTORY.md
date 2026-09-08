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

  Wins           82         Core       Per Team      Other MLB API `away.team.record.wins`              Verify

  Losses         63         Core       Per Team      Other MLB API `away.team.record.losses`            Verify

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

  AVG             .284             Common         Other MLB API   `away.lineup[].stats.avg`

  OBP             .351             Common         Other MLB API   `away.lineup[].stats.obp`

  SLG             .492             Common         Other MLB API   `away.lineup[].stats.slg`

  OPS             .843             Common         Other           `away.lineup[].stats.ops`
                                                  API/derived     

  HR              18               Common         Other MLB API   `away.lineup[].stats.homeRuns`

  RBI             67               Common         Other MLB API   `away.lineup[].stats.rbi`

  Runs            72               Optional       Other MLB API   `away.lineup[].stats.runs`

  Hits            143              Optional       Other MLB API   `away.lineup[].stats.hits`

  Doubles         28               Optional       Other MLB API   `away.lineup[].stats.doubles`

  Triples         3                Optional       Other MLB API   `away.lineup[].stats.triples`

  Stolen bases    22               Optional       Other MLB API   `away.lineup[].stats.stolenBases`

  Walks           48               Optional       Other MLB API   `away.lineup[].stats.walks`

  Strikeouts      121              Optional       Other MLB API   `away.lineup[].stats.strikeouts`

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

  Wins           11             Common         Other MLB API   `away.startingPitcher.stats.wins`

  Losses         7              Common         Other MLB API   `away.startingPitcher.stats.losses`

  W-L            11-7           Common         Derived         `away.startingPitcher.stats.record`

  ERA            3.42           Common         Other MLB API   `away.startingPitcher.stats.era`

  WHIP           1.08           Common         Other MLB API   `away.startingPitcher.stats.whip`

  IP             154.2          Common         Other MLB API   `away.startingPitcher.stats.inningsPitched`

  Hits allowed   132            Optional       Other MLB API   `away.startingPitcher.stats.hits`

  Runs allowed   61             Optional       Other MLB API   `away.startingPitcher.stats.runs`

  Earned runs    58             Optional       Other MLB API   `away.startingPitcher.stats.earnedRuns`

  Walks          39             Optional       Other MLB API   `away.startingPitcher.stats.walks`

  Strikeouts     171            Common         Other MLB API   `away.startingPitcher.stats.strikeouts`

  HR allowed     17             Optional       Other MLB API   `away.startingPitcher.stats.homeRuns`

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

  AVG/OBP/SLG/OPS   Optional          Other MLB API     `away.bench[].stats.*`
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

  W-L               Optional          Other MLB API     `away.bullpen[].stats.record`

  ERA               Common            Other MLB API     `away.bullpen[].stats.era`

  WHIP              Optional          Other MLB API     `away.bullpen[].stats.whip`

  Saves             Common            Other MLB API     `away.bullpen[].stats.saves`

  Holds             Optional          Other MLB API     `away.bullpen[].stats.holds`

  Strikeouts        Optional          Other MLB API     `away.bullpen[].stats.strikeouts`
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
- Supplemental manager, standings, and player-stat data should be treated as on-demand hydration.
- A selected layout should declare its needs implicitly through its mapped fields; unmapped supplemental categories should not be fetched.
- Future one-click generation for the favorite team/favorite layout should use the same dependency-driven hydration process.

## 14. Open Design Questions


1.  How should nine lineup rows be mapped without creating an enormous
    field dropdown?
2.  How should variable-length bench and bullpen collections be mapped?
3.  Should layouts use predefined composite fields, user-defined
    templates, or both?
4.  Which team-name variants should be standardized?
5.  Which batting and pitching stats belong in the initial v0.2.0 field
    set?
6.  What should a mapped field display when pregame data is unavailable?
7.  How should probable/preliminary personnel differ from an officially
    posted lineup?
8.  How should two-way players and unusual roles be represented?
9.  Should mapped text support maximum width, shrink-to-fit, clipping,
    wrapping, or combinations?
10. Which supplemental API data can be hydrated in batches rather than
    player-by-player?

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


-   [ ] Manager/coaching staff
-   [ ] Team W-L record
-   [ ] Division rank and games back
-   [ ] Current streak
-   [ ] Last-10 record
-   [ ] Batter season statistics
-   [ ] Starting-pitcher season statistics
-   [ ] Bullpen season statistics
-   [ ] Bench-player season statistics
-   [ ] Bats/throws metadata
-   [ ] Venue capacity/metadata
-   [ ] Pregame umpire availability/timing
-   [ ] Efficient multi-player/stat hydration options

For each verified item, record: 1. endpoint/request; 2. response path;
3. reliability before first pitch; 4. required IDs from the game feed;
5. raw versus derived normalized value;
6. which mapped field(s) or field category should trigger the request;
7. whether the request can be skipped entirely when the selected layout does not use that data.

## 17. Source Notes

This first draft is based on: - Scorecard Studio v0.1.0's existing
pregame/game-feed work; and - the supplied completed Bob Carpenter
scorecard as an example of a detailed scorekeeper's information needs.

Because the Carpenter example is a completed card, this inventory
intentionally extracts candidate **pregame** information rather than
treating every handwritten value as something available before the game.
