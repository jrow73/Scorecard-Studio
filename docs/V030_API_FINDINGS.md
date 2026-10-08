# Scorecard Studio v0.3.0 — API Findings

**Introduced:** Build 002.2  
**Evidence manifest:** `docs/V030_API_EVIDENCE_MANIFEST.md`  
**Backlog authority:** `docs/V030_API_DISCOVERY_BACKLOG.md`

This is a cumulative findings document. Each conclusion is limited to the captured requests and states; later Build 002 increments may extend or qualify it.

## DISC-001 — Schedule publication timing and game-state taxonomy

### Live state comparison

At `2026-10-05T18:54:35.254Z`, gamePk `849834` was `Pre-Game`, with scheduled first pitch at `21:00Z` (about 125 minutes later). Hydrated Schedule supplied:

- both probable pitchers;
- nine ordered players for each lineup;
- weather; and
- the full raw status tuple.

At `2026-10-05T18:52:03.056Z`, gamePk `849839` was `Scheduled`, with scheduled first pitch at `00:00Z` (about 308 minutes later). It supplied both probable pitchers, but the two lineup paths were missing.

Interpretation: Schedule distinguishes not-yet-published lineups by omission in the tested Scheduled response. A populated original lineup was available in the tested Pre-Game response. This comparison does not prove the transition time because it uses different postseason games; it only establishes two observed availability states.

### Status vocabulary observed

| Normalized candidate | Observed raw tuple | Additional evidence |
|---|---|---|
| scheduled | `Preview / S / Scheduled / S`, `startTimeTBD: false` | Probables present; lineups absent in gamePk `849839` |
| pregame | `Preview / P / Pre-Game / P`, `startTimeTBD: false` | Probables and lineups present in gamePk `849834` |
| postponed | `Final / D / Postponed / DR`, reason `Rain` | `rescheduleDate` and `rescheduleGameDate` present in gamePk `777164` |
| cancelled | `Final / C / Cancelled / CR`, reason `Rain` | Regular-season gamePk `746577`; no lineup object |
| final | `Final / F / Final / F` | Feed view of the rescheduled game and completed resumed game |
| time TBD | scheduled tuple plus `startTimeTBD: true` | gamePk `849809` also had placeholder teams and a non-display-safe placeholder timestamp |

Tuple order above is `abstractGameState / codedGameState / detailedState / statusCode`.

Do not normalize from `abstractGameState` or `abstractGameCode` alone: postponed and cancelled records can both carry abstract final values. Preserve the complete raw tuple and reason alongside any future canonical state.

### Postponed and rescheduled behavior

For gamePk `777164`, the hydrated Schedule response retained:

- original scheduled instant `2025-07-10T23:40:00Z`;
- `officialDate: 2025-07-11`;
- `rescheduleDate: 2025-07-11T19:10:00Z`;
- `rescheduleGameDate: 2025-07-11`;
- detailed state `Postponed`; and
- the two probable pitchers, but no lineup object.

The current feed for the same gamePk reported `Final` and used the rescheduled date/time. Therefore, source family and retrieval cutoff are part of the meaning of status. Schedule is the better source for the postponement/reschedule relationship; feed is the completed-contest view.

### Suspended and resumed behavior

For gamePk `777861`, the current Schedule response retained:

- original game instant `2025-05-19T23:40:00Z`;
- `officialDate: 2025-05-19`;
- `resumeDate: 2025-05-21T17:10:00Z`;
- `resumeGameDate: 2025-05-21`; and
- completed state `Final`.

The feed datetime also distinguished original/official, resume, and resumed-from dates. The current historical response does not reproduce the transient `Suspended` state, so it cannot establish that state's exact raw tuple or lineup behavior while suspended. The future model needs distinct original, official, rescheduled, and resumed concepts rather than one overloaded date.

### Cancelled behavior

The regular-season cancellation control, gamePk `746577`, retained probable pitchers but no lineup object and used `codedGameState: C`, `detailedState: Cancelled`, `statusCode: CR`, reason `Rain`. A cancellation is therefore not equivalent to a request failure or a missing game, and should remain selectable only if the product intentionally supports cancelled records.

### Start-time-TBD behavior

Future NLCS gamePk `849809` used `startTimeTBD: true`, placeholder team objects, and `gameDate: 2026-10-11T07:33:00Z`. The timestamp must not be formatted as a confirmed first pitch while the flag is true. The placeholder-team marker must also be preserved so the UI does not present seed placeholders as confirmed clubs.

### Recommended disposition

- Retain hydrated Schedule as the base game/state source.
- In a future normalized model, preserve the raw status tuple, reason, `startTimeTBD`, and source/capture time.
- Add separate original/scheduled, official, rescheduled, and resumed date fields with explicit provenance.
- Represent lineup/probable availability independently from game state; absence is not an empty lineup.
- Use milestone refreshes around meaningful status changes; do not infer an exact cadence from these two games.
- Keep delayed and live suspended-state validation open until captured live.

## DISC-002 — Pregame umpire publication timing and crew evolution

At `2026-10-05T18:54:32.765Z`, the feed for Pre-Game ALDS gamePk `849834` contained six officials:

- Home Plate;
- First Base;
- Second Base;
- Third Base;
- Left Field; and
- Right Field.

At `2026-10-05T18:54:30.282Z`, the feed for Scheduled ALDS gamePk `849839` contained a present but empty `officials` array.

Interpretation: the feed can distinguish a posted postseason crew from a not-yet-populated collection. The evidence does not prove when publication occurred, whether an earlier response omitted the property, or whether assignments changed. It does prove that a role-preserving collection is required and that a four-slot-only consumer loses valid postseason roles.

### Recommended disposition

- Retain Game Feed as the observed officials source.
- Model officials as a collection keyed by preserved `officialType`, with convenience selectors for traditional roles.
- Treat missing and present-empty separately in evidence/provenance; at product level both may initially display “not posted” unless an endpoint failure occurred.
- Keep the feed lazy or milestone-triggered; the 180–223 KB scheduled/pregame responses are too large to justify tight polling solely for officials.
- Do not set a publication-time guarantee until a same-game multi-stage sequence exists.
- Carry MiLB timing and live crew-change checks to later evidence work.

## Build 002.2 limits

- The live comparison is postseason, not ordinary regular-season MLB.
- The two timing observations are different games.
- Delayed and transient suspended states were not live during collection.
- Current historical data proves retained resume/reschedule metadata, not what every field looked like at the interruption.
- No MiLB conclusion is made here.

## DISC-004 — Dated roster historical semantics

### Active-membership meaning

Every tested response identified itself as `rosterType: active`. The endpoint reconstructed date-specific active membership in the tested MLB transaction and injured-list cases:

- Seranthony Domínguez (person `622554`) appeared for Baltimore on `2025-07-28` with jersey `56`, then for Toronto on `2025-07-30` with jersey `48`. The supporting transaction response records the Baltimore-to-Toronto trade on `2025-07-29`.
- Aaron Judge (person `592450`) appeared on the Yankees' `2025-07-25` roster, was absent on `2025-07-28` while on the injured list, and appeared again on the `2025-08-05` activation date. Supporting transactions record the retroactive IL effective date and activation.

Interpretation: the current request is a dated **active-roster** source, not a 40-man, injured-list, or organizational-membership source. Absence can mean “not active on that date”; it must not be displayed as proof that the player was outside the organization. The transaction endpoint was used only to corroborate the controls and is not proposed as a new production dependency.

### Two-way classification

The Dodgers roster on `2025-06-16` represented Shohei Ohtani (person `660271`) as:

- position code `Y`;
- type `Two-Way Player`; and
- abbreviation `TWP`.

The v0.2.0 `isPitcher()` predicate recognizes only pitcher code/name/type/abbreviation and therefore does not classify `TWP` as a pitcher. A future adapter must preserve two-way identity and allow the same player ID in both applicable role views. It must not globally coerce every TWP into the bullpen or deduplicate the player out of one view.

### MiLB shape

The same dated endpoint returned active rosters for Triple-A Columbus (28 entries) and Double-A Akron (27 entries) on `2025-06-01`, using the same person, jersey, position, status, and parent-team shape. This demonstrates compatibility at those two levels, not universal MiLB historical reliability; the broader level matrix remains assigned to Build 002.6.

### Doubleheader limitation and Schedule multi-view behavior

The team roster URL accepts team ID and calendar date, not gamePk. Both games of the `2025-06-19` STL/CWS doubleheader therefore resolve to the same White Sox roster request. It cannot prove a between-game roster move.

A related Schedule finding sharpened the limitation: a direct gamePk request for `777458` returned two date buckets for the same gamePk. The first preserved the `2025-06-18` postponed record as game 1/non-doubleheader; the second represented the `2025-06-19` makeup as Final, `doubleHeader: Y`, `gameNumber: 2`, and `startTimeTBD: true`. Consumers must select the date/game view matching the selected contest context rather than blindly reading `dates[0]`.

### Recommended disposition

- Retain dated active roster as membership authority for the tested calendar date and level, with provenance explicitly saying `active`.
- Preserve roster status and position shape; distinguish inactive/IL absence from endpoint failure.
- Keep the current roster-minus-lineup fallback. For pitchers, retain the dated roster as membership authority, then apply available depth-chart role annotations as described by DISC-008; use roster-pitchers-minus-starter when those annotations are unavailable.
- Add explicit TWP handling before relying on those fallbacks for two-way players.
- Do not claim game-specific roster membership within a same-date doubleheader. Record the limitation until a game-specific source is verified.
- Treat a multi-date Schedule response for one gamePk as a collection requiring contextual selection.

## DISC-005 — People `byDateRange` scope and competition boundaries

### Aggregate split behavior

The preserved controls confirmed the sport `0` / code `All` selection rule for both hitting and pitching:

| Player | Group | Team splits | `All` result |
|---|---|---|---|
| Taylor Ward (`621493`) | hitting | Baltimore 111 games + Seattle 32 | 143 games |
| Seranthony Domínguez (`622554`) | pitching | White Sox 43 games + Seattle 24 | 67 games pitched |
| Cal Raleigh (`663728`) | hitting | Seattle 126 games | identical 126-game aggregate |

For multi-team players, the `All` split did not carry a team object; for the single-team control it did. Aggregate selection must therefore use `sport.id == 0` or `sport.code == "All"`, never team presence or array position. Hitting and pitching used the same split convention in the captured controls.

### Debut and no-prior-stat boundary

Colt Emerson (person `806068`, MLB debut `2026-05-17`) returned a hitting group with `splits: []` through `2026-05-16`, despite prior minor-league activity. Through `2026-05-18`, MLB and `All` splits appeared with two MLB games. Empty splits are a valid no-prior-MLB-stat result, not a failed person lookup.

### Two-way groups

Shohei Ohtani retained primary position `TWP` and, through `2025-06-17`, one person record contained both hitting and pitching `byDateRange` groups. Each non-empty group carried MLB and `All` splits. The groups must be normalized independently and joined by person ID; one must not overwrite the other.

### Spring and postseason boundaries

- The range ending `2025-03-17`, before the regular-season opener, returned empty hitting and pitching splits rather than spring-training totals.
- The complete People response through the `2025-09-28` regular-season end was byte-for-byte identical to the response using `2025-10-30` as the end date. The default `byDateRange` request did not add postseason games.

Thus the production request is evidence for MLB regular-season date-range totals, not a generic “all baseball since January 1” total. Spring and postseason statistics require explicit competition/stat scope rather than changing only the date range.

### Aggregate fallback and chunk failure policy

Every non-empty tested group supplied `All`. The current fallback to the first split is unsafe for a multi-team response if `All` is unexpectedly absent. A future adapter should:

1. prefer `sport.id == 0` / `code == "All"`;
2. accept one unambiguous MLB split only as a provenance-marked fallback;
3. mark a multi-split/no-aggregate response ambiguous rather than silently choosing the first team; and
4. distinguish empty splits from request failure.

The API's greater-than-100-ID failure behavior was not induced. v0.2.0 uses `Promise.all`, so one failed chunk currently removes People enrichment for the whole load. Future partial success is acceptable only if per-person/per-chunk availability is explicit; silently mixing missing chunks with zero statistics is not.

### Recommended disposition

- Retain People `byDateRange` for regular-season pregame MLB totals with start/end cutoff provenance.
- Name the scope explicitly (sport/competition/stat type); do not call it an unqualified “season” total.
- Preserve group descriptors and selected-split provenance.
- Keep spring and postseason totals separate and unresolved until competition-aware requests are tested in Build 002.6.
- Model two-way hitting and pitching groups independently under one person identity.

## DISC-007 — Coaches roles, ambiguity, and historical correctness

### Dated manager change

Washington's `2025-07-05` response contained Dave Martinez as exact `Manager` (`jobId: MNGR`) and Miguel Cairo as `Bench Coach`. The `2025-07-07` response removed Martinez and represented Cairo as `Interim Manager` (`jobId: NTRM`). This verifies date-sensitive staff history across the tested change.

The current v0.2.0 fuzzy fallback finds “Interim Manager,” but a future adapter should prefer explicit job IDs/normalized jobs and surface multiple manager-like candidates as ambiguous. No vacancy or simultaneous co-manager case was observed.

### Role breadth and repeated roles

The current Cleveland sample contained 16 entries, including manager, bench, hitting, assistant hitting, pitching, two assistant pitching coaches, bullpen coach, two bullpen catchers, combined base/catching and base/infield titles, interpreter, baserunning/outfield coach, and field coordinator.

The Triple-A Columbus sample contained seven entries, including two `Hitting Coach` and two `Pitching Coach` records. Therefore:

- coaching categories are collections, not singular slots;
- `job`, `title`, and `jobId` all carry useful and sometimes different meaning;
- duplicate roles are valid and must be preserved; and
- jersey number can be empty.

The dated coaches endpoint worked for the sampled Triple-A club, but no broader MiLB guarantee is made.

### Recommended disposition

- Retain the dated Coaches endpoint as manager/staff source for the tested MLB and Triple-A cases.
- Match manager roles by explicit recognized job IDs/jobs, then a controlled manager-title fallback.
- Preserve every staff row and the source order plus person ID, jersey number, job, title, and jobId.
- Normalize non-manager roles into repeated categorized collections without collapsing duplicates.
- Mark zero or multiple manager candidates explicitly; do not select the first arbitrary match.
- Keep exact role-taxonomy expansion provisional until Build 002.6 samples more levels and organizations.

## Build 002.3 limits

- Transaction and injured-list semantics were tested with one player sequence each.
- Dated rosters were sampled at MLB, Triple-A, and Double-A only.
- The same-date doubleheader endpoint cannot prove between-game membership.
- Opening Day, spring, and postseason conclusions here apply to the default MLB `byDateRange` request; explicit competition-aware variants remain for Build 002.6.
- No live chunk failure, staff vacancy, or multiple manager-like candidate was induced.

## DISC-003 — Venue metadata and timezone completeness

### Source completeness across venue classes

Seven historical-current Schedule/feed pairs sampled an ordinary MLB park, London Stadium, Tokyo Dome, a spring-training park, a Triple-A park, and the Athletics' 2024 Oakland/2025 Sacramento home venues.

In every pair, hydrated Schedule supplied only venue identity and lifecycle fields: `id`, `name`, `link`, `active`, and `season`. It did not supply `location`, `timeZone`, or `fieldInfo`. Feed supplied all three extended objects in every sample. The matching IDs and names mean the current shallow Schedule-then-Feed merge does not lose a Schedule-only nested venue value in these controls, but the merge also gives no field-level provenance.

The feed payloads were approximately 739 KB to 1.12 MB. A narrower request to `/api/v1/venues/{venueId}?season={season}&hydrate=location,fieldInfo,timezone` returned a venue object byte-for-byte equal to `gameData.venue` for all seven controls, in responses of only 697–805 bytes. Hydration is case-sensitive in the observed request: `timezone` populated `timeZone`; `timeZone` did not.

Interpretation by field:

- Schedule is sufficient for venue ID and game-specific displayed name.
- The hydrated venue endpoint is sufficient for the accepted location, IANA timezone, capacity, surface, roof, and dimension fields in the sampled MLB, international, spring, and Triple-A cases.
- Feed is not required solely for those venue fields when venue ID and season are known. It may still be fetched for independent feed-owned concepts such as officials.
- `timeZone.id` is the stable formatting input. `timeZone.tz` and numeric offsets are observed game-time abbreviations/offsets and should not replace the IANA identifier.

### Optional dimensions and historical identity

All seven detailed venue objects contained capacity, turf type, roof type, city, country, and IANA timezone. Dimension shape was not uniform: London Stadium had left-line, center, and right-line values but no left-center or right-center values. Dimensions must therefore be an optional keyed object, not a required five-value tuple.

The Athletics controls preserved different game-specific venue IDs, names, cities, and seasons for Oakland Coliseum in 2024 and Sutter Health Park in 2025. This supports requesting venue metadata by the selected game's venue ID and season. It does not prove that all fields—particularly capacity or naming—are immutable historical facts within a season; the evidence is a current historical refetch.

### Recommended disposition

- Keep Schedule venue identity as part of the selected game.
- Adopt the season-scoped hydrated Venue endpoint as the preferred extended-venue source when extended venue fields are requested and the feed is not already needed.
- If feed is already loaded, its equivalent venue object may satisfy the same fields without another request.
- Normalize venue objects field-by-field, preserving source, retrieval time, requested season, and optionality; do not depend on a generic shallow merge as the future adapter contract.
- Keep dimensions model-ready but optional. Product exposure remains a later decision under DISC-019.

## DISC-006 — Standings semantics, cutoffs, and competition scope

### Date cutoff behavior

The American League `regularSeason` response dated `2025-03-26` contained three division records and all 15 clubs at 0–0. It still supplied a `lastTen` split of 0–0, while `streak` was absent. The otherwise equivalent `2025-03-27` response incorporated games played on Opening Day, including 1–0 records and `W1` streaks.

This is evidence that the tested historical `date` acts as an end-of-day standings cutoff. The production use of `officialDate - 1 day` is therefore the correct pregame request pattern for ordinary games. Requesting the selected game date would leak completed same-day results. Intraday reconstruction remains unsupported; the existing explicit Game 1 boxscore adjustment for a later same-day game is a narrow exception, not a league-wide reconstruction method.

Early-season responses supplied `lastTen` even when fewer than ten games had been played; it represented the games available. Consumers must not require exactly ten decisions. At zero games, streak absence is a valid state rather than a request failure.

### Rank, games-back, and marker types

Observed ranks were decimal-integer strings, not numbers. Observed games-back fields were string tokens with several semantic forms:

- `"-"` for the relevant leader/reference position;
- unsigned decimal strings such as `"5.0"`;
- positive signed strings such as `"+7.0"` in Wild Card context.

Elimination fields used `"-"`, remaining-number strings, and `"E"`. Clinch indicators used compact codes including `w`, `y`, and `z`. These are not safely represented as one nullable number.

The future model should preserve raw values and add typed interpretations:

- rank: `{ raw, value }`, where `value` is an integer only when parseable;
- games back: `{ raw, state: leader | ahead | behind | unknown, games }`;
- elimination: `{ raw, state: notEliminated | remaining | eliminated | unknown, gamesRemaining }`;
- clinch: `{ raw, state }`, with unknown codes retained rather than discarded.

`gamesBack`, `leagueGamesBack`, and `wildCardGamesBack` are separate concepts. The existing `divisionGamesBack` mapping from `gamesBack` is valid only because the production `regularSeason` records are division groups.

### Standings types and competition boundaries

The metadata endpoint listed distinct `regularSeason`, `wildCard`, `divisionLeaders`, `wildCardWithLeaders`, `springTraining`, and `postseason` types, among others. Captures confirmed that request type changes response meaning:

- MLB `regularSeason` returned three five-team division records per league.
- `wildCardWithLeaders` returned two 12-team Wild Card records plus six one-team division-leader records. The response therefore requires `standingsType` as part of group identity.
- `springTraining` returned six division-scoped records and materially richer team objects than the regular-season response.
- `postseason` returned only the teams/groups represented at the tested postseason cutoff; it is not a postseason bracket model.
- Triple-A International League and Pacific Coast League controls returned two divisions each, with 10 teams per IL division and five per PCL division. MLB cardinality assumptions do not generalize.

Regular-season team rows contained division, league, and Wild Card ranks even though leaders could omit `wildCardRank`. Final-date controls contained clinch and elimination markers; pre-opening controls already had deterministic ordinal ranks despite all clubs being 0–0, so rank strings are source ordering, not proof of a meaningful untied performance difference.

### Recommended disposition

- Retain the prior-day `regularSeason` request for ordinary pregame team standings.
- Make sport/league, standings type, season, and cutoff date explicit provenance and future adapter inputs.
- Preserve all three rank and games-back concepts plus raw clinch/elimination markers.
- Select spring and postseason standings explicitly from the selected game's competition context; never reuse `regularSeason` by default outside regular-season presentation.
- Do not synthesize intraday league-wide standings from game results.

## DISC-010 — Full standings-group normalization

### Deterministic source groups

The existing production `regularSeason` response is sufficient to populate division groups without another request. Each returned record has a deterministic identity tuple:

`standingsType + sport.id + league.id + division.id`

Each record already contains ordered team rows with team ID and name. The sampled MLB league response contained three non-overlapping five-team groups; the sampled Triple-A leagues contained two non-overlapping groups with their own cardinalities. No separate team metadata request is required to create these source-faithful division groups.

`standingsType` cannot be omitted from the key. In the `wildCardWithLeaders` response, Wild Card and division-leader records can share league/division identifiers while representing different group semantics.

### Adopt/defer boundary

- **Adopt:** populate `standings.groups[]` from each record actually returned by a fetched standings response, preserving source order, IDs, type, cutoff, and team-row order.
- **Adopt conditionally:** an explicit future `wildCardWithLeaders`, `springTraining`, or `postseason` request may populate groups of that type when product context requests it.
- **Defer:** do not manufacture a league-wide or Wild Card group from division-scoped `regularSeason` records merely because team rows contain league/Wild Card ranks.
- **Reject:** do not attempt league-wide intraday reconstruction from completed scores plus a prior-day snapshot.

This gives `standings.groups[]` a supported source-faithful meaning without committing Build 002 to new production fan-out.

## Build 002.4 limits

- All game and standings controls are current historical refetches; none proves what mutable metadata looked like at the original retrieval time.
- Venue coverage includes MLB, international, spring, Triple-A, and a team venue transition, but not every temporary/shared venue or lower MiLB level.
- The venue `season` parameter preserved the sampled season context; it is not proof of fully versioned field history.
- Standings were sampled at MLB and two Triple-A leagues. Broader MiLB and split-season behavior remains for Build 002.6.
- Tie-specific presentation was not inferred from equal records because the source still emitted unique ordinal rank strings.
- The postseason response is standings data, not a bracket or series-state source.

## DISC-008 — Pitcher depth-chart roles

### Observed role and membership behavior

The Dodgers depth chart returned 48 entries and distinguished generic pitchers (`P`) from starting pitchers (`SP`). It also included pitchers with 15-day and 60-day injured-list statuses, so it is not an active-roster source. The Rays control additionally exposed a `CP` role, confirming that role labels can add useful annotation beyond the dated roster's general pitcher classification.

The Dodgers requests for seasons 2025 and 2026 were byte-identical, including all 48 entries. The endpoint has no date parameter, and this observation provides no historical-season guarantee; the `season` argument did not change the captured result.

Shohei Ohtani appeared only as `DH` in the depth chart while the dated 2025 roster represented him as `TWP`. One depth-chart row therefore cannot preserve every valid role for a two-way player. The Triple-A Columbus request returned `rosterType: depthChart` and team ID but omitted `roster`, while the dated active roster for the same club/date contained 28 players.

### Disposition: annotation-only

- Dated active roster remains membership authority.
- Probable pitcher remains starting-pitcher authority for the selected game.
- Depth-chart `SP`/`CP` labels may annotate players only after intersection by person ID with the dated active roster.
- Preserve the depth-chart label as separately sourced pitching-role metadata; do not replace the roster position or two-way classification with it.
- After removing the selected probable starter, classify active roster pitchers labeled `SP` as `additionalStarters`. Derive the core Bullpen from the remaining active roster pitchers.
- Allow users to include or exclude `additionalStarters` in the displayed Bullpen without changing roster membership or the stored role annotation.
- Depth chart must never add inactive players to the Bullpen, remove unclassified active pitchers from the available pitcher pool, replace two-way classification, or serve as historical evidence.
- Missing MiLB or MLB depth data is an ordinary unavailable state. When role annotations are unavailable, fall back to dated-roster pitchers minus the selected starter.

Openers and bulk-pitcher semantics were not established by the bounded sample. Their absence does not block the annotation-only disposition because role hints cannot change membership or starter selection, even though they may change derived grouping and presentation.

## DISC-009 — Team-logo coverage and asset behavior

### Bounded coverage sample

Successful current asset responses were captured for:

- an MLB club (Dodgers, team `119`);
- the Athletics' location-transition team ID (`133`);
- Triple-A and Double-A clubs (`445` and `402`);
- American and National League All-Star teams (`159` and `160`); and
- a placeholder/special team ID (`42`).

All seven successful responses were SVG (`image/svg+xml`), returned without redirects, supplied a `viewBox`, omitted intrinsic `width`/`height`, contained no raster `<image>`, allowed cross-origin access with `Access-Control-Allow-Origin: *`, and advertised a 14-day cache (`max-age=1209600`). SVG canvases are transparent by default; the structural check does not promise that a particular mark lacks a full-canvas painted shape.

A nonexistent ID returned HTTP 404, `text/html`, no CORS header, and no SVG structure. Consumers need a non-image fallback and must validate status/MIME before use.

### Branding and rendering limits

The URL contains only team ID, with no date, season, or brand-version argument. A successful response is therefore evidence for the current asset at capture time, not the historically correct mark for a selected game. The Athletics control reinforces the limitation: the same team ID spans the documented Oakland/Sacramento transition, while only one live asset URL exists.

The captured SVG structure is browser-suitable and vector-friendly for a future PDF pipeline, but PDF embedding was not implemented or visually certified in Build 002.5. Marks vary substantially in aspect ratio and styling; layout must use the `viewBox`, preserve aspect ratio, and provide padding rather than assume a fixed square canvas.

### Recommended disposition

- Adopt the URL as an optional current-brand asset reference with capture/retrieval provenance and explicit non-historical semantics.
- Preserve a fallback chain of valid SVG → text/team abbreviation → empty placeholder.
- Treat 404, non-SVG MIME, or parse failure as asset unavailable rather than a game-data failure.
- Cache according to response metadata while allowing asset refresh independent of saved game data.
- Defer logo placement, visual sizing rules, and PDF embedding to a later product build.

## Build 002.5 limits

- Depth charts were sampled for two MLB organizations and one Triple-A club; the evidence is sufficient for annotation-only use, not universal role coverage.
- No opener/bulk-pitcher case was identified, and no historical snapshot behavior was demonstrated.
- Logo sampling covers MLB, two targeted MiLB levels, All-Star, relocated/current-brand, placeholder, and missing-ID behavior. It does not establish exhaustive inactive or reaffiliated-club coverage.
- Logo fixtures retain hashes and derived metadata, not copyrighted SVG bodies or visual identity judgments.

## DISC-011 — MiLB parity and endpoint-specific capability

### Historical Final-game parity

One completed regular-season game was sampled at each of Triple-A, Double-A, High-A, and Single-A. Each hydrated Schedule response identified game type `R`, supplied both probable pitchers, and returned two nine-player lineups. Each matching Game Feed returned populated home/away player maps and an officials collection.

This is useful parity evidence for the relevant historical Final shape, not a universal MiLB guarantee. It does not establish when probable pitchers, lineups, weather, officials, or boxscore data become available before first pitch. It also does not prove the separate Boxscore endpoint merely because `liveData.boxscore` was present in Feed.

Officials cannot be modeled with an MLB cardinality assumption. The sampled Triple-A and Double-A games contained three field officials; High-A and Single-A contained two. Preserve each returned role and allow an empty, short, or expanded collection.

### Rosters, coaches, standings, and assets

High-A and Single-A dated active-roster requests returned 27 rows each, extending the prior Triple-A/Double-A evidence. Dated coaching staff requests returned seven rows at Double-A, four at High-A, and five at Single-A. These are source collections, not promises about staff size or role vocabulary.

The sampled Double-A, High-A, and Single-A standings responses each contained two six-team division records. Together with the earlier Triple-A controls, this confirms that source group counts and team cardinalities must remain data-driven and keyed by sport, league, division, standings type, season, and cutoff.

Current-logo responses succeeded at High-A and Single-A with the same vector/cache/CORS characteristics documented in DISC-009. This broadens the bounded sample but does not change the current-brand-only, optional-asset disposition.

### Explicit MiLB statistic scope

One unscoped multi-person People request returned identities but no `stats` fields for the four selected MiLB pitchers. Separate requests adding the matching `sportId` and `gameType=[R]` returned pitching groups at sports 11, 12, 13, and 14, each with the requested level split and sport `0` / `All` aggregate.

Therefore a future adapter must request and record the intended sport explicitly. Absence from an MLB-default People response is not a zero MiLB total. The tested pattern is level-specific regular-season evidence; cross-level career aggregation and mixed-sport requests remain unproven.

### Depth-chart absence through Single-A

The new Double-A, High-A, and Single-A depth-chart requests matched the prior Triple-A boundary: HTTP 200, `rosterType: depthChart`, correct team ID, and omitted `roster`. This is an ordinary unavailable state, not an empty active roster.

The Build 002.5 disposition remains authoritative:

- dated active roster is membership authority;
- probable pitcher is selected-game starter authority;
- available depth-chart labels are annotation-only after person-ID intersection;
- active roster pitchers labeled `SP`, other than the probable starter, are `additionalStarters` and may optionally be shown in the Bullpen; and
- when annotations are absent, Bullpen falls back to active roster pitchers minus the selected starter.

## DISC-012 — Spring and postseason competition boundaries

### Game-source shape by game type

The spring-training control identified `gameType: S`, returned two nine-player lineups and probable pitchers, and exposed four officials in Feed. Final-game controls for Wild Card (`F`), Division Series (`D`), League Championship (`L`), and World Series (`W`) returned the same relevant Schedule shape and six officials per Feed.

These are historical Final controls. Build 002.2 remains the authority for observed live postseason Scheduled/Pre-Game availability differences. Neither set establishes a universal publication time.

### Competition-scoped People statistics

Explicit People `byDateRange` requests for Shohei Ohtani produced distinct source totals:

- `gameType=[S]` through March 17 returned seven spring hitting games, while the earlier default request over the same dates returned empty splits;
- `gameType=[R]` through September 28 returned 158 hitting games and 14 pitching games; and
- `gameType=[F,D,L,W]` over the postseason returned a 15-game hitting aggregate and a three-game pitching aggregate, with separate MLB splits corresponding to the requested postseason game types.

The prior default request extended through October 30 remained byte-identical to the regular-season-end response. This makes the source boundary explicit: date range alone does not broaden competition scope.

Regular-season, spring, and postseason totals must be stored separately with their requested `gameType[]`, sport, stat type, start/end dates, and selected aggregate provenance. They must not be silently merged into an unqualified season total. Any future combined display is a deliberate product calculation.

### Standings and date-scoped sources

Build 002.4 already established explicit `springTraining` and `postseason` standings requests. The postseason response remains standings data, not a bracket or series-state source. Dated rosters and coaches do not accept a game-type key; using them around spring or postseason is therefore conditional on date and cannot prove competition-specific eligibility rules.

## Build 002.6 limits

- All new game controls are current historical refetches in Final state.
- MiLB future/pregame, live timing, delayed/suspended transitions, and crew changes remain unobserved.
- Separate MiLB Boxscore parity, narrow Venue parity below Triple-A, and competition-specific roster rules remain untested.
- Four clubs/games and one representative league per lower level are bounded samples, not universal coverage.
- Explicit People controls establish the requested sport/game-type patterns for selected players; they do not establish every stat group, player, or cross-level aggregation.
- The authoritative compact classification is in `docs/V030_COMPETITION_CAPABILITY_MATRIX.md`; unsupported and untested contexts must remain explicit availability states.

## Build 002.7 — Final source-adoption synthesis

Build 002 closes with no remaining evidence gap that blocks versioned normalized-model design. The authoritative dispositions, precedence chains, availability vocabulary, provenance requirements, and Build 003 priorities are in `docs/V030_SOURCE_ADOPTION_DECISIONS.md`.

The synthesis preserves these cross-cutting boundaries:

- Schedule is the game/pre-game base, not an undifferentiated “Game Pack.”
- Active membership, selected-game starter, player totals, officials, venue detail, standings, and staff remain separately sourced concepts.
- Optional enrichment cannot create or remove authoritative membership.
- Every accepted total or standings value carries explicit sport/competition/type/cutoff scope.
- Mixed-cutoff Game 2 values retain per-source derivation provenance rather than pretending the whole model shares one timestamp.
- Missing, unposted, present-empty, omitted, unsupported, ambiguous, partial, failed, and stale states must not collapse into one null.
- Per-source MiLB and competition capabilities replace a global support assumption.
- Opportunistic live cases remain useful refinements but are non-blocking because the model can preserve raw states, unknowns, fallbacks, and source timing.

`docs/V030_BUILD_002_CLOSURE.md` records the completed increment ledger, acceptance checklist, non-blocking carryovers, and bounded Build 003 sequence.
