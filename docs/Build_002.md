# Scorecard Studio v0.3.0 — Build 002

## Build 002.1 — Evidence Harness and Fixture Manifest

**Status:** Complete  
**Date:** 2026-10-05  
**Scope:** Investigation tooling, tests, minimized evidence, and documentation only  
**Application baseline:** committed Scorecard Studio v0.2.0  
**Baseline SHA-256:** `D1726D62573A72A54FA8395598AEFD8C644CDDA753CCE8E753473E4CC67B54BE`

### Objective

Establish a bounded, reproducible way to capture and compare public MLB API evidence before Build 002 begins broader discovery. The harness records the exact request, retrieval time, response metadata and hash, and only the selected JSON values needed for an investigation.

### Files changed

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_SCHEMA.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `tools/api-discovery-capture.mjs`
- `tests/api-discovery-evidence.test.mjs`
- `tests/fixtures/api-discovery/disc-001-822955-schedule-a.json`
- `tests/fixtures/api-discovery/disc-001-822955-schedule-b.json`

No production application code, existing historical documentation, or `README.md` was changed.

### Work completed

- Defined evidence schema version 1 and the distinction between `live-snapshot`, `historical-current`, and `recorded-prior` evidence.
- Added a command-line capture utility restricted to read-only HTTPS requests against approved public MLB hosts.
- Bounded fixture output to `tests/fixtures/api-discovery/` and retained selected JSON-pointer values instead of full response bodies.
- Added deterministic comparison of the selected values in two captures.
- Registered the Build 001 control cases and the sample categories required by later Build 002 increments without claiming evidence that has not yet been collected.
- Validated the harness with two current historical Schedule captures for gamePk `822955`.

### Validation result

The two captures were taken approximately six hours apart. Both returned HTTP 200, selected the same six paths, and produced no selected-value differences. Their complete response hashes also matched:

`c54b36647fb0f629e2ab107179b7e9480584335aae7ac4602d40626f50dbc010`

This establishes capture and deterministic comparison behavior. It does **not** establish pregame availability: the current historical response reports the game as Final and must not replace the separately recorded 2026-07-10 pregame evidence described by Build 001.

### Verification

- Evidence comparison: 6 pointers, matching selections, 0 differences.
- Evidence-tool tests: passed.
- Unchanged v0.2.0 release tests: passed.
- Fixture inspection: no raw response body, credentials, cookies, or authorization headers retained.
- Production application files and `README.md`: unchanged.

### Next increment

Build 002.2 will use this harness for Schedule/feed timing and exceptional game-state investigations. One current historical response remains one observation; source-adoption decisions remain deferred until the planned evidence set is collected.

---

## Build 002.2 — Schedule, Feed Timing, and Game States

**Status:** Complete with explicit live-timing carryovers  
**Date:** 2026-10-05  
**Scope:** DISC-001 and DISC-002 evidence and findings; no production changes

### Objective

Test Schedule publication state, feed-official availability, and exceptional lifecycle representations sufficiently to define safe future state/provenance requirements without changing the v0.2.0 adapters.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `docs/V030_API_FINDINGS.md`
- `tests/api-discovery-evidence.test.mjs`
- ten focused fixtures under `tests/fixtures/api-discovery/`

No production application code, existing historical documentation, evidence-schema/tooling code, or `README.md` was changed.

### Evidence collected

- A live `Pre-Game` AL Division Series Schedule/feed pair approximately 125 minutes before scheduled first pitch.
- A same-day `Scheduled` AL Division Series comparison approximately 308 minutes before scheduled first pitch.
- A current historical postponed/rescheduled regular-season Schedule/feed pair.
- A current historical suspended/resumed regular-season Schedule/feed pair.
- A cancelled regular-season Schedule control.
- A future postseason `startTimeTBD: true` control with placeholder clubs.

### Principal findings

1. **Availability is stateful and source-specific.** The `Pre-Game` fixture had two probable pitchers, two nine-player lineups, and six field officials. The later `Scheduled` fixture had probable pitchers, missing lineup paths, and a present-empty officials array.
2. **The observations bound availability but do not establish exact timing.** They are different games and both are postseason fixtures. A same-game multi-stage study remains necessary before setting a publication threshold or ordinary-MLB refresh cadence.
3. **Postseason crews require role-preserving collections.** The live pregame feed exposed Home Plate, First Base, Second Base, Third Base, Left Field, and Right Field roles. Four fixed umpire slots are insufficient.
4. **The status tuple must be preserved.** `abstractGameState` and `abstractGameCode` alone collapse important distinctions. Both postponed and cancelled controls reported an abstract final state/code while their detailed/coded/status-code values remained distinct.
5. **Schedule and feed can expose different lifecycle views for the same gamePk.** The postponed Schedule control remained `Postponed` with reschedule metadata while its feed represented the completed rescheduled contest as `Final`.
6. **Suspended/resumed dates need separate fields.** The resumed control retained official date `2025-05-19` and resume game date `2025-05-21`; one generic game date cannot express both.
7. **`startTimeTBD` is authoritative over the timestamp.** The TBD control carried a placeholder `07:33Z` timestamp and placeholder teams. Consumers must not display that value as a confirmed first pitch or treat placeholder clubs as settled participants.
8. **Historical refetch cannot recover transient delayed or suspended states.** Those observations remain live-only carryovers, not missing historical support.

Detailed evidence and interpretation are in `docs/V030_API_FINDINGS.md`; exact capture metadata is in `docs/V030_API_EVIDENCE_MANIFEST.md`.

### Verification

- All 12 Build 002 fixtures pass common schema, scope, host, hash, and raw-body-exclusion checks.
- Dedicated assertions cover Scheduled, Pre-Game, Postponed, Final-rescheduled, resumed dates, Cancelled, TBD, lineup presence/absence, and officials cardinality.
- Evidence tests and the unchanged v0.2.0 release regression suite pass.

### Carryovers

- Same-game early-day → lineup-posted → pregame → live → final snapshots for an ordinary MLB game.
- A live delayed-state snapshot and the transient suspended state itself.
- Crew-change detection across milestones and MiLB officials timing.
- A future real doubleheader transition under DISC-013.

These carryovers are timing validations. They do not block the state/provenance requirements established here and must not be replaced by historical inference.

---

## Build 002.3 — Rosters, People Statistics, and Coaches

**Status:** Complete with bounded cross-level and rare-case carryovers  
**Date:** 2026-10-05  
**Scope:** DISC-004, DISC-005, and DISC-007; opportunistic DISC-014/015 evidence; no production changes

### Objective

Test the semantic boundaries of dated active rosters, regular-season People `byDateRange` totals, and dated coaching staffs before those sources are formalized in the v0.3.0 model.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `docs/V030_API_FINDINGS.md`
- `tests/api-discovery-evidence.test.mjs`
- twenty-five focused fixtures under `tests/fixtures/api-discovery/`

No production application code, evidence capture tooling/schema, existing historical documentation, or `README.md` was changed.

### Evidence collected

- Before/after dated rosters around a verified MLB trade.
- Active-roster presence/absence/presence around a verified injured-list placement and activation.
- MLB `TWP` roster classification and dual hitting/pitching People groups.
- Triple-A and Double-A dated active rosters.
- Doubleheader Schedule views plus the single calendar-date roster request.
- Traded-hitter, traded-pitcher, single-team, debut-boundary, pre-opening, regular/postseason cutoff, and two-way People controls.
- MLB manager-change before/after staff, a current broad MLB staff, and a Triple-A staff with duplicate hitting/pitching roles.

### Principal findings

1. The roster endpoint is a dated **active** roster in the tested controls. It followed team membership across a trade and excluded/reincluded an injured player around IL/activation dates.
2. Active-roster absence does not mean absence from the organization; transaction/IL context remains distinct provenance.
3. `TWP` is a real position code/type and is not recognized by v0.2.0's pitcher predicate. Two-way identity must support separate hitting and pitching role views.
4. One date-scoped roster cannot distinguish membership between two games on the same date.
5. A direct Schedule gamePk lookup can return two date buckets for a postponed/makeup game; `dates[0]` is not always the selected completed contest.
6. Sport `0` / code `All` reliably aggregated the captured one-team and multi-team hitting/pitching controls. Multi-team aggregates lacked a team object.
7. Empty splits correctly represented no prior MLB statistics; minor-league and spring activity did not leak into the tested MLB totals.
8. Extending the default range through the postseason produced a byte-identical response to regular-season end. Default `byDateRange` is not a postseason-total source.
9. Dated Coaches tracked a manager-to-interim-manager change and returned multiple people with the same coaching role. Staff roles must be collections preserving job, title, and jobId.

### Verification

- All 37 cumulative fixtures pass schema, scope, host, response-hash, and raw-body-exclusion checks.
- Seven evidence subtests pass, including dedicated roster, aggregate/cutoff/two-way, and coaches assertions.
- The unchanged v0.2.0 release regression suite passes.
- No production application file or `README.md` is included in the changed-files package.

### Carryovers

- Same-day transaction between doubleheader games remains opportunistic because the roster request has no gamePk.
- Broader MiLB level coverage and competition-aware spring/postseason stats remain assigned to Build 002.6.
- More than 100 People IDs and a live failed chunk were not induced; the future failure contract is documented.
- Staff vacancy, co-manager, and multiple manager-like candidate cases remain unobserved.

These carryovers do not block the roster/stat/coaches source boundaries established by this increment.

---

## Build 002.4 — Standings, Venues, and Timezones

**Status:** Complete with broader MiLB and rare-venue carryovers  
**Date:** 2026-10-05  
**Scope:** DISC-003, DISC-006, and DISC-010; historical venue-transition evidence relevant to DISC-016; no production changes

### Objective

Establish venue-field source precedence, timezone and historical-context requirements, standings cutoff/type semantics, and the safe boundary for populating full standings groups.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `docs/V030_API_FINDINGS.md`
- `tests/api-discovery-evidence.test.mjs`
- thirty-two focused fixtures under `tests/fixtures/api-discovery/`

No production application code, evidence capture tooling/schema, existing historical documentation, or `README.md` was changed.

### Evidence collected

- Schedule/feed venue pairs for ordinary MLB, London, Tokyo, spring training, Triple-A, Oakland 2024, and Sacramento 2025.
- Season-scoped hydrated Venue endpoint responses for the same seven venue IDs.
- MLB regular-season standings before Opening Day, on Opening Day, early season, and at the final regular-season date.
- Explicit Wild Card-with-leaders, spring-training, and postseason standings responses.
- Final-date International League and Pacific Coast League standings.
- The supported standings-type vocabulary.

### Principal findings

1. Schedule venue hydration supplied identity only in all seven controls. Feed supplied the extended venue object.
2. `/venues/{venueId}?season={season}&hydrate=location,fieldInfo,timezone` returned the same venue object as feed in every control while using roughly 0.7–0.8 KB instead of 0.74–1.12 MB feed responses. Feed is not necessary solely for extended venue metadata.
3. IANA `timeZone.id` was present across ordinary MLB, international, spring, Triple-A, and transitioned Athletics venues. Abbreviations and offsets are not substitutes for the IANA identifier.
4. Venue dimensions are optional by named field; London omitted the two center-gap fields present in other controls.
5. The standings `date` behaved as an end-of-day cutoff. Production's prior-day request is correct for pregame data; selected-game-date requests can include completed same-day results.
6. Ranks and games-back/elimination values are semantic strings, not plain numbers. Leader dashes, signed Wild Card advantages, elimination `E`, and clinch codes require typed unions with raw preservation.
7. Standings type materially changes response structure. Regular season, Wild Card-with-leaders, spring training, postseason, and MiLB division groups cannot share implicit MLB cardinality or scope assumptions.
8. `standings.groups[]` can safely adopt records exactly as returned, keyed by standings type plus sport/league/division IDs. Synthetic league-wide or Wild Card groups from division records remain deferred.
9. League-wide intraday standings reconstruction remains rejected.

### Verification

- All 69 cumulative fixtures pass the common schema, scope, host, response-hash, and raw-body-exclusion contract.
- Ten evidence subtests pass, including venue-source equivalence, standings cutoff/scope/token checks, and group-identity boundaries.
- The unchanged v0.2.0 release regression suite passes.
- No production application file or `README.md` is included in the changed-files package.

### Carryovers

- Lower-level and split-season MiLB standings remain assigned to Build 002.6.
- Additional temporary/shared/renamed venues and the full neutral-site/international transition matrix remain opportunistic.
- Whether venue dimensions become user-facing remains a later product decision under DISC-019.
- Standings tie presentation should be validated if a source response exposes an explicit tie marker rather than only equal records with unique ordinal ranks.

These carryovers do not block the venue source-precedence, standings typing, or source-faithful group decisions established by this increment.

---

## Build 002.5 — Depth Charts and Team Logos

**Status:** Complete with explicitly bounded coverage  
**Date:** 2026-10-06  
**Scope:** DISC-008 and DISC-009; no production changes

### Objective

Determine whether depth-chart labels can safely annotate active-roster pitchers and influence derived Bullpen presentation, and whether the current team-logo endpoint is suitable as a future optional asset source.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `docs/V030_API_EVIDENCE_SCHEMA.md`
- `docs/V030_API_FINDINGS.md`
- `tests/api-discovery-evidence.test.mjs`
- `tools/api-discovery-capture.mjs`
- twelve focused fixtures under `tests/fixtures/api-discovery/`

No production application code, existing historical documentation, or `README.md` was changed.

### Evidence collected

- Dodgers depth charts for season parameters 2025 and 2026.
- A Rays depth chart with `SP`, `P`, and `CP` roles.
- A Triple-A Columbus depth-chart request compared with its existing dated active-roster fixture.
- Logo responses for MLB, Triple-A, Double-A, relocated/current-brand, All-Star, placeholder, and missing team IDs.
- Focused SVG, response-header, redirect, cache, CORS, and failure metadata without retaining SVG bodies.

### Principal findings

1. Depth charts distinguish useful pitcher-role labels, but include inactive players and are not membership authority.
2. The Dodgers 2025 and 2026 responses were byte-identical, so the season parameter did not establish historical behavior.
3. Two-way identity was reduced to one depth-chart role, and the sampled Triple-A response omitted its roster entirely.
4. Depth charts are adopted as **annotation-only** after person-ID intersection with the dated active roster. An active pitcher labeled `SP`, other than the selected probable starter, may be classified as an additional starting pitcher and excluded from the core Bullpen. Users should be able to include those additional starters in the displayed Bullpen. When depth-chart annotations are unavailable, the current roster-pitchers-minus-starter behavior remains the fallback.
5. Seven sampled valid logo URLs returned vector SVGs with `viewBox`, permissive CORS, 14-day caching, no redirects, and no embedded raster image.
6. A missing team ID returned a non-SVG 404; status and MIME validation plus a text fallback are required.
7. Logo URLs are team-ID-only and current-brand-only. They cannot establish historically correct branding.
8. Logo references are suitable for a future optional model field, but UI placement and PDF embedding remain outside Build 002.

### Verification

- All 81 cumulative fixtures pass the bounded evidence contract, including the intentional missing-logo 404.
- Twelve evidence subtests pass, including depth-chart authority boundaries and asset metadata/failure behavior.
- The unchanged v0.2.0 release regression suite passes.
- No production application file or `README.md` is included in the changed-files package.

### Carryovers

- Broader MiLB depth-chart availability and competition coverage remain part of Build 002.6.
- Opener/bulk-pitcher role behavior remains unobserved but does not block annotation-only use.
- Exhaustive inactive/reaffiliated logo coverage remains unproven; absence is handled by the required fallback.
- Visual logo sizing and PDF rendering require later product-level testing.

These limits do not block the depth-chart or current-logo source dispositions established by this increment.

---

## Build 002.6 — Competition and MiLB Capability Boundaries

**Status:** Complete with explicit live-timing and endpoint-parity carryovers  
**Date:** 2026-10-06  
**Scope:** DISC-011 and DISC-012; no production changes

### Objective

Test whether the source families characterized in Builds 002.1–002.5 retain their relevant shapes across Triple-A, Double-A, High-A, Single-A, MLB spring training, and every current MLB postseason round; identify the context keys and fallbacks needed where they do not.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_EVIDENCE_MANIFEST.md`
- `docs/V030_API_FINDINGS.md`
- `docs/V030_COMPETITION_CAPABILITY_MATRIX.md`
- `tests/api-discovery-evidence.test.mjs`
- thirty-nine focused fixtures under `tests/fixtures/api-discovery/`

No production application code, evidence capture tooling/schema, existing historical documentation, or `README.md` was changed.

### Evidence collected

- Final regular-season Schedule/feed pairs at Triple-A, Double-A, High-A, and Single-A.
- High-A and Single-A dated active rosters; AA, High-A, and Single-A coaching staffs and depth-chart requests.
- AA, High-A, and Single-A regular-season standings plus High-A and Single-A current-logo controls.
- One default multi-person People request and four explicit level-scoped People requests for sports 11–14.
- A spring-training Schedule/feed pair and explicit spring People statistics.
- Schedule/feed pairs for 2025 Wild Card, Division Series, League Championship Series, and World Series games.
- Explicit regular-season and combined postseason People-stat controls compared with the earlier unscoped boundaries.

### Principal findings

1. Hydrated Schedule and Game Feed preserved the relevant historical Final-game shape at all four sampled MiLB levels: game type `R`, two nine-player lineups, probable pitchers, team/player maps, and officials.
2. Officials cardinality is competition-dependent. The MiLB samples contained three, three, two, and two officials; spring contained four; the four postseason rounds contained six. Officials must remain a role-bearing collection.
3. Active rosters, coaches, and division standings were available through Single-A in the sampled controls, but shapes and cardinalities vary by league and organization.
4. People statistics require explicit source scope. `sportId` plus `gameType=[R]` produced level-specific MiLB splits; explicit `S`, `R`, and `F,D,L,W` requests produced distinct MLB competition totals.
5. Date range alone remains insufficient. The earlier default pre-opening request omitted spring totals, and the default postseason-extended request remained regular-season-only.
6. MiLB depth-chart requests at Triple-A, Double-A, High-A, and Single-A succeeded but omitted `roster`. The authoritative fallback remains dated-roster pitchers minus the selected starter; no role label may be inferred from absence.
7. Current-logo coverage extended through the sampled lower levels, but it remains optional, current-brand-only, and unrelated to historical competition identity.
8. Capability is endpoint-specific, not a blanket “MiLB supported” flag. `sportId`, `gameType`, season/cutoff, league/division, standings type, and stat scope must be preserved explicitly.

### Verification

- All 120 cumulative fixtures pass the common schema, scope, host, response-hash, status, and raw-body-exclusion contract.
- Fifteen evidence subtests pass, including dedicated MiLB game-shape, endpoint-specific support, sport-scoped statistics, and competition-scope assertions.
- The unchanged v0.2.0 release regression suite passes.
- No production application file or `README.md` is included in the changed-files package.

### Carryovers

- Future/pregame and live-transition timing remains unobserved at the four MiLB levels.
- Separate MiLB boxscore endpoint parity remains untested; embedded feed boxscore data is not proof of that endpoint.
- Narrow season-scoped Venue comparisons remain untested below Triple-A.
- Spring/postseason roster and coaching requests are date-scoped and do not prove tournament-specific membership rules.
- Broader leagues, split-season formats, clubs, and seasons remain outside this bounded sample.

These carryovers do not block the competition-routing, explicit-stat-scope, varying-officials, or fallback requirements established by Build 002.6.

---

## Build 002.7 — Findings and Source-Adoption Decisions

**Status:** Complete; Build 002 closed  
**Date:** 2026-10-06  
**Scope:** DISC-001 through DISC-022 reconciliation; no new probing and no production changes

### Objective

Close API discovery by converting the cumulative evidence into authoritative/conditional/optional/fallback/deferred/rejected source decisions, a source-precedence and provenance contract, explicit blocker classifications, and a bounded normalized-model design handoff.

### Files changed in this increment

- `docs/Build_002.md`
- `docs/V030_API_DISCOVERY_BACKLOG.md`
- `docs/V030_API_FINDINGS.md`
- `docs/V030_BUILD_002_PLAN.md`
- `docs/V030_SOURCE_ADOPTION_DECISIONS.md`
- `docs/V030_BUILD_002_CLOSURE.md`

No production application code, evidence fixtures/tooling/tests, existing historical documentation, or `README.md` was changed.

### Principal decisions

1. Hydrated Schedule remains the selected-game and original-pregame base.
2. Dated active roster, People totals, Coaches, Standings, Feed officials, and extended Venue data remain independently scoped sources rather than one Game-Pack family.
3. Explicit competition and level context is mandatory for adapter requests and provenance.
4. Depth chart remains annotation-only; dated roster and probable pitcher remain membership/starter authority. The agreed `additionalStarters` and optional Bullpen-display behavior is preserved.
5. Current logos are optional, current-brand-only enrichment and are not required by the core model.
6. Source-faithful standings groups are adopted; league-wide intraday reconstruction remains rejected.
7. Missing/unposted/empty/omitted/unsupported/ambiguous/partial/failed/stale states require distinct representation.
8. Mixed-cutoff and derived Game 2 values require selected-value provenance, not only model-level retrieval time.
9. DISC-013–016 live/rare cases remain opportunistic and non-blocking. DISC-017–020 remain deferred; DISC-021 retains derivation; DISC-022 remains rejected.

### Verification

- The cumulative 120-fixture evidence suite passes all 15 subtests.
- The unchanged v0.2.0 release regression suite passes.
- Every DISC-001–012 planned investigation now has evidence, limitations, and a final disposition.
- Every DISC-013–022 item has an explicit non-blocking, deferred, retained, or rejected closure status.
- No application code, evidence fixture, capture tool, or `README.md` is included in the changed-files package.

### Handoff

Build 003 begins with a versioned normalized-model and provenance contract, followed by adapter/capability interfaces, compatibility/migration mapping, and contract fixtures. No new API evidence is required to begin Build 003.1.
