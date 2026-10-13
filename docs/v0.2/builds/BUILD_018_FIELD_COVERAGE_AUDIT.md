# Scorecard Studio - Build 018 Field Coverage Audit

**Baseline:** v0.2.0 Build 017 Final (committed GitHub package)  
**Purpose:** Technical reconciliation and implementation checklist for Build 018.  
**Status:** Product decisions incorporated; ready to define the Build 018 code slice.

---

## 1. Build 018 objective

Reconcile the Build 017 runtime field registry with the accepted product field catalog, and add the metadata needed for the future Standard/Custom field-selection workflow.

Build 018 should focus on **field-contract cleanup and coverage**. It should not redesign the accepted Designer object model or build the future New Scorecard field-selection interface.

The three canonical long-term documents retain their existing roles:

- `PREGAME_DATA_INVENTORY.md` - what pregame information Scorecard Studio intends to support.
- `GAME_PACK_FIELD_MATRIX.md` - where that information comes from and what source evidence exists.
- `FIELD_REGISTRY.md` - canonical semantic fields, collections, formatting capabilities, availability, and exposure metadata.

This audit is a temporary build document and should eventually be archived with the Build 018 implementation/test records.

---

## 2. New registry concept: availability vs visibility

Build 017 currently assigns every runtime registry entry:

```text
availability: supported
```

Build 018 should keep **availability** and add a separate exposure concept:

```text
availability: supported | future | unverified
visibilityTier: standard | custom
```

These answer different questions:

- **availability** - is this a supported scorecard field?
- **visibilityTier** - if supported, does it belong in the default Standard field set or only the optional Custom field set?

Do not use `custom` to mean "not implemented yet." A Custom field is a real supported built-in field that is simply not part of the default field set.

### Future workflow dependency

The eventual New Scorecard UI may use this metadata to offer **Standard Fields** or **Custom Fields**, but Build 018 does **not** need to implement that interface. Until that UI exists, the current Designer can continue exposing supported fields as it does today unless we deliberately add a lightweight filtering step.

---

## 3. Executive technical findings

1. Build 017 already normalizes substantially more data than the runtime registry exposes.
2. `gameData.game.gameNumber` is already normalized as `game.number`, and the canonical documentation identifies it as the number **within the day's scheduled games**. It is therefore the doubleheader/game-of-day concept, not season game count.
3. Season-to-date **Games Played** is already separately normalized at `{side}.team.record.gamesPlayed`.
4. Venue time zone is already normalized and used by `formatter.js` to format scheduled start time in the venue time zone. It should remain application/format context rather than become a Designer field.
5. Team league/division, record games played, division leader, several standings values, manager number, primary position, full game-position name, boxscore name, and many pitching values are already normalized but not fully exposed.
6. Lineup/bench Plate Appearances and Stolen Bases are **not** currently normalized and need small stat-model additions if retained.
7. Position Number is not an MLB field we need to fetch. It should be a derived baseball mapping from today's position abbreviation.
8. Fixed-role umpires require no additional API call: normalization already stores `home`, `first`, `second`, and `third` umpire objects.
9. Build 017 exposes a much broader Starting Pitcher stat family than the accepted v1 selectable catalog. Removing field IDs outright could break existing mappings. Build 018 should separate **catalog exposure** from **resolver compatibility**.
10. The same compatibility concern applies to currently exposed bullpen fields such as IP, SO, Saves, and Holds that are no longer part of the accepted selectable field family.
11. A dedicated defensive-alignment model is not required for Build 018 because Individual Placement of lineup players already supports defensive-diamond layouts.
12. A full Division Standings block remains a larger optional future feature and should not block scalar field completion.

---

## 4. Recommended compatibility strategy

Build 018 should avoid breaking scorecards created during Build 017.

For fields that were selectable in Build 017 but are no longer part of the accepted v1 catalog:

- keep their existing field IDs and resolvers working where practical;
- mark them so they are **not offered as active catalog choices** going forward;
- do not delete normalization merely to make the implementation match the smaller catalog;
- do not migrate or rewrite existing mappings unless necessary.

This implies that `availability` alone may not be enough to describe legacy compatibility. A small additional catalog flag may be cleaner than misusing Standard/Custom, for example:

```text
catalog: true | false
```

or equivalent behavior in the registry selector.

**Recommendation:** use `catalog: true` by default for active supported fields and `catalog: false` only for compatibility-only Build 017 leaves. Existing mappings can still resolve by ID, while field pickers can ignore compatibility-only entries.

This is preferable to deleting working IDs before v1.0.

---

# 5. Game / venue / weather / umpires

| Field/family | Build 017 data state | Accepted state | Build 018 technical action |
|---|---|---|---|
| `game.date` | Normalized + registered | Standard | Add `visibilityTier: standard`; regression only. |
| `game.startTime` | Normalized + registered | Standard | Add tier metadata; regression only. |
| `game.dayNight` | Normalized, not registered | Custom | Add atomic registry field. |
| `game.type` | Normalized, not registered | Future | Do not expose; retain normalization harmlessly. |
| `game.number` | Normalized, not registered | Custom | Add atomic registry field. Canonical meaning is game number within day's scheduled games. |
| Venue name | Normalized + registered | Standard | Add tier metadata. |
| Venue city/state/country | Normalized, not registered | Custom | Add atomic registry fields. |
| Venue capacity/turf/roof | Normalized, not registered | Custom | Add atomic registry fields; blank is acceptable when source omits. |
| Venue time zone | Normalized and used by formatter | App-only | Do not register as Designer field. Preserve for time formatting/Game Day use. |
| Venue dimensions | Not normalized | Future | No Build 018 work. |
| Weather summary | Registered composite | Standard | Add tier metadata; regression missing-component behavior. |
| Temperature/condition/wind | Registered | Custom | Add tier metadata. |
| Umpire crew repeated name/role | Normalized + registered | Standard | Add tier metadata. |
| Fixed HP/1B/2B/3B umpire names | Already normalized as role objects | Custom | Add four scalar registry fields against `game.umpires.home/first/second/third.name`. No new API request required. |

### Game Number finding

`FIELD_REGISTRY.md` already documents `game.number` as `gameData.game.gameNumber` "within day's scheduled games." This closes Q2: it is the doubleheader/game-of-day field and should be **Custom**.

---

# 6. Team / record / standings

Applies symmetrically to Away and Home.

| Field/family | Build 017 data state | Accepted state | Build 018 technical action |
|---|---|---|---|
| Team full name | Registered | Standard | Tier metadata only. |
| Team club name | Registered | Standard | Change from prior proposed Custom to Standard. |
| Team abbreviation | Registered | Standard | Change from prior proposed Custom to Standard. |
| Location name | Registered | Custom | Tier metadata. |
| Short name | Registered | Custom | Tier metadata. |
| League name | Normalized, not registered | Custom | Add field. |
| Division name | Normalized, not registered | Custom | Add field. |
| Games played | Normalized, not registered | Standard | Add field. This is the season game-count concept. |
| Wins / losses | Registered | Custom | Tier metadata. |
| PCT | Registered | Custom | Tier metadata. |
| W-L composite | Registered | Standard | Tier metadata. |
| Division leader | Normalized boolean, not registered | Custom, display TBD | Keep in canonical supported inventory but do not force a printed convention until tested/decided. |
| Division rank | Normalized when standings hydrated | Custom | Add conditionally available field. |
| League rank | Normalized when supplied | Custom | Add conditionally available field. |
| Wild Card rank | Normalized when supplied | Custom | Add conditionally available field. |
| Division games back | Partially normalized | Custom | Verify exact semantics before exposing. |
| League/Wild Card games back | Not normalized | Custom intent | Add only after source path is verified. |
| Streak | Normalized when supplied | Custom | Add if standings hydration remains practical. |
| Last 10 W/L/display | Normalized | Custom | Add atomic W/L plus composite/display. |
| Division Standings block | `standings.groups` empty | Custom future feature | Keep out of Build 018 scalar completion; investigate API cost separately. |

### Division Leader finding

The current source/normalizer treats Division Leader as a boolean. The unresolved issue is only **presentation**. Do not expose raw `true` / `false` by accident. The field can remain documented as supported/Custom while the display convention is deferred until a real-data UX pass.

---

# 7. Manager / coaches

| Field/family | Build 017 state | Accepted state | Build 018 action |
|---|---|---|---|
| Manager name | Normalized + registered | Standard | Tier metadata only. |
| Manager jersey number | Normalized, not registered | Custom | Add field. Blank is valid. |
| Coach collections | Not normalized/registered | Out of active roadmap | Remove from active v1 field requirements; no implementation. |

Do not apply Player Name Format to manager names unless manager source data later gains equivalent structured name variants. Current manager normalization is a simple full-name string.

---

# 8. Shared player identity and position

| Field/family | Build 017 state | Accepted state | Build 018 action |
|---|---|---|---|
| Player name | Normalized + exposed | Standard | Tier metadata + Name Format audit. |
| Jersey number | Normalized + exposed | Standard | Tier metadata. |
| Bats | Normalized + lineup/bench exposed | Standard where relevant | Tier metadata. |
| Throws | Normalized + SP/bullpen exposed | Standard where relevant | Tier metadata. |
| Today's position abbreviation | Normalized + lineup/bench exposed | Standard lineup / Custom bench | Clarify labels so it is not confused with Primary Position. |
| Today's position full name | Normalized, not exposed | Custom | Add repeated field. |
| Today's position number | Not stored | Custom derived | Add resolver/derived row value from position abbreviation. No API pull. |
| Primary position abbreviation/name | Normalized, not exposed | Custom lineup / Standard bench | Add repeated fields with clear Primary Position labels. |
| Boxscore Name | Normalized source variant | Name Format choice | Add as a sixth Player Name Format option, not a separate semantic field. |
| Pronunciation | Normalized source fact | Not exposed | No field. |
| Suffix/title | Normalized source fact | Automatic only | Keep source data; do not expose as standalone fields. |

### Derived position number

Use standard defensive numbering:

```text
P  = 1
C  = 2
1B = 3
2B = 4
3B = 5
SS = 6
LF = 7
CF = 8
RF = 9
```

Do not manufacture a defensive number for `DH`. Unknown/non-defensive roles should resolve blank rather than guess.

---

# 9. Starting Pitcher

Build 017 currently exposes a very broad pitching-stat family. The accepted v1 selectable catalog is intentionally smaller.

## Active catalog

| Field | Build 017 | Tier | Build 018 action |
|---|---|---|---|
| Player Name | Exists | Standard | Tier metadata + Name Format. |
| Jersey # | Exists | Standard | Tier metadata. |
| Throws | Exists | Standard | Tier metadata. |
| Games Started | Exists | Standard | Tier metadata. |
| W-L Record | Exists composite | Standard | Tier metadata. |
| ERA | Exists | Standard | Tier metadata. |
| Wins | Exists | Custom | Tier metadata. |
| Losses | Exists | Custom | Tier metadata. |
| WHIP | Exists | Custom | Change from earlier proposed Standard to Custom. |

## Compatibility-only candidates

The Build 017 runtime also exposes Games Played, Games Pitched, Win %, IP, H, R, ER, HR allowed, BB, SO, Saves, Save Opportunities, Holds, Blown Saves, K/BB, K/9, BB/9, H/9, HR/9, Pitches/Inning, and Compact Pitching Summary.

These are no longer part of the accepted active selectable catalog. Recommended treatment:

- keep their IDs/resolvers functioning for existing mappings;
- mark them `catalog: false` (or equivalent) rather than deleting them;
- do not assign Standard/Custom exposure because they are not active choices.

Opponent AVG remains a post-v1 possibility only.

---

# 10. Starting Lineup batting coverage

Applies symmetrically to Away and Home.

| Field | Build 017 data/registry | Tier | Build 018 action |
|---|---|---|---|
| AVG | Normalized + registered | Standard | Tier metadata. |
| OBP | Normalized + registered | Custom | Tier metadata. |
| SLG | Normalized + registered | Custom | Tier metadata. |
| OPS | Normalized + registered | Custom | Tier metadata. |
| HR | Normalized + registered | Custom | Tier metadata. |
| RBI | Normalized + registered | Custom | Tier metadata. |
| Games Played | Normalized but not registered for lineup | Custom | Add repeated field. |
| Plate Appearances | Not normalized | Custom | Add batting normalization + repeated field. |
| Stolen Bases | Not normalized | Custom | Add batting normalization + repeated field. |
| Slash Line | Components already normalized | Custom | Add convenience composite/resolver or derived repeated field using AVG/OBP/SLG with missing-value-safe formatting. |

All other broad batting leaves from the earlier canonical inventory should be removed from the **active v1 catalog requirement** unless deliberately reintroduced later.

---

# 11. Bench batting coverage

Bench should expose the same supported batting-stat family as Starting Lineup with the same stat tiers:

- AVG - Standard
- OBP, SLG, OPS, HR, RBI, Games Played, PA, SB, Slash Line - Custom

Identity/position differences:

- Player Name, Jersey #, Bats - Standard
- **Primary Position - Standard**
- Game/listed Position - Custom

Technical work is mostly shared with lineup because bench rows use the same `normalizeBoxPlayer()` / `normalizeStats()` model. Prefer one shared field-family builder so lineup/bench stat coverage cannot drift again.

---

# 12. Bullpen pitching coverage

Bullpen should use the same retained six pitching statistics as Starting Pitcher, but with the accepted bullpen exposure tiers.

| Field | Build 017 | Tier | Build 018 action |
|---|---|---|---|
| W-L Record | Not currently exposed as bullpen composite | Standard | Add repeated-row composite/derived field. |
| ERA | Exists | Standard | Tier metadata. |
| WHIP | Exists | Standard | Tier metadata. |
| Games Started | Normalized but not exposed | Custom | Add repeated field. |
| Wins | Exists | Custom | Tier metadata. |
| Losses | Exists | Custom | Tier metadata. |

Identity fields Pitcher Name, Jersey #, and Throws remain Standard.

Build 017 bullpen fields IP, SO, Saves, and Holds are compatibility-only candidates under the same strategy used for Starting Pitcher extras.

---

# 13. Player Name Format

Build 017 currently supports:

- Full Name
- First Initial + Last Name
- Last Name
- First Name
- Use Name + Last Name

Build 018 should add:

- **Boxscore Name**

`normalizeBoxPlayer()` already carries `player.boxscoreName`, so this is a formatter/option addition rather than a new API requirement.

Acceptance requirements:

- every exposed player-name field supports Name Format;
- no non-name field exposes the control;
- missing requested variants fall back to Full Name;
- fallback does not split Full Name to manufacture parts;
- Home/Away behavior is identical;
- existing mappings with no explicit `nameFormat` still default to `full`;
- Boxscore Name follows the same fallback rule.

Suffix/title remain source metadata only and should be naturally preserved by whatever source-backed name representation is selected; they are not standalone Designer fields.

---

# 14. Defensive alignment

No Build 018 data-model expansion is required.

Build 017 can already create a second Starting Lineup instance and place individual players by defensive role/position using Individual Placement. That satisfies the functional need for a defensive diamond.

Build 018 action:

- regression-test that the accepted lineup/position changes do not break Individual Placement;
- do not implement `defense: {}` as a new parallel data family;
- leave a future UX improvement open if a dedicated defensive-diamond workflow can make the existing capability easier to discover/use.

---

# 15. Home/Away symmetry

Every side-specific field accepted above should be generated from shared builders wherever practical.

Acceptance checks:

- [ ] Team identity and record fields match Away/Home.
- [ ] Manager fields match Away/Home.
- [ ] Starting Pitcher active fields and tiers match Away/Home.
- [ ] Lineup fields and tiers match Away/Home.
- [ ] Bench fields and tiers match Away/Home.
- [ ] Bullpen fields and tiers match Away/Home.
- [ ] Name Format choices match Away/Home.
- [ ] Fixed umpire roles remain game-level rather than side-level.

---

# 16. Supplemental API implications

## No additional API pull needed

These accepted additions are already available in the normalized Game Pack or already-normalized supplemental structures:

- Day/Night
- Game Number
- venue city/state/country/capacity/turf/roof
- team league/division
- team Games Played
- manager jersey number (when coaches payload supplies it)
- Primary Position
- Today's Position Full Name
- Boxscore Name
- fixed-role umpire names
- most retained pitching statistics

## Small normalization additions, same existing player source

- batting Plate Appearances
- batting Stolen Bases
- derived Position Number
- Slash Line composite
- bullpen W-L composite

## Depends on standings supplemental hydration / source verification

- division/league/wild-card rank
- games-back variants
- streak
- last 10
- Division Leader presentation

## Larger future feature

- full Division Standings block

---

# 17. Proposed Build 018 implementation slices

### 018-A - Registry metadata and catalog behavior

- Add `visibilityTier` to active supported registry entries.
- Add a compatibility-safe way to keep old Build 017 field IDs resolvable without continuing to advertise every old field in the active catalog (`catalog: false` or equivalent).
- Add tests that Standard/Custom is metadata only for now and does not break current Designer loading.

### 018-B - Easy normalized-but-hidden fields

Add accepted fields that already exist in the normalized model:

- Day/Night and Game Number
- venue city/state/country/capacity/turf/roof
- team league/division/Games Played
- manager number
- Primary Position and Today's Position Full Name
- fixed-role umpire names

### 018-C - Small derived/stat additions

- Position Number mapping
- Plate Appearances
- Stolen Bases
- Slash Line
- bullpen W-L composite
- bullpen Games Started

### 018-D - Name Format

- Add Boxscore Name option.
- Run full player-name capability regression.

### 018-E - Standings scalar reconciliation

- Expose only fields whose source semantics are verified.
- Do not expose raw boolean Division Leader until display behavior is chosen.
- Leave full Division Standings block for a separate feature slice if API cost/complexity merits it.

### 018-F - Documentation + acceptance

Reconcile `FIELD_REGISTRY.md`, `GAME_PACK_FIELD_MATRIX.md`, and `PREGAME_DATA_INVENTORY.md` with accepted scope. Keep `README.md` untouched during intermediate builds.

---

# 18. Build 018 acceptance gate

Build 018 is ready to call complete when:

- [ ] Every active v1 Designer field is explicitly classified Standard or Custom.
- [ ] Availability and visibility tier are separate concepts in the registry/documentation.
- [ ] Compatibility-only Build 017 field IDs still resolve for existing mappings, or any necessary migration is explicitly tested.
- [ ] Game Number is documented as game-of-day/doubleheader number; Team Games Played is documented separately as the season count.
- [ ] Venue Time Zone remains available to application formatting but is not exposed as a scorecard field.
- [ ] Accepted easy scalar fields resolve and render in preview/PDF.
- [ ] Lineup and Bench support the accepted batting family only: AVG, OBP, SLG, OPS, HR, RBI, GP, PA, SB, Slash Line.
- [ ] Starting Pitcher active catalog supports only GS, W-L, ERA, W, L, WHIP with accepted tiers.
- [ ] Bullpen active catalog supports the same six stat concepts with accepted bullpen tiers.
- [ ] Today's Position Abbreviation, Full Name, and derived Position Number behave correctly; DH does not get a fabricated defensive number.
- [ ] Primary Position remains distinct from Today's Position and is available where accepted.
- [ ] Boxscore Name is available as a Name Format choice with full-name fallback.
- [ ] Fixed-role umpire fields and repeated Umpire Crew both work.
- [ ] Home/Away symmetry tests pass.
- [ ] Individual Placement remains sufficient for defensive-diamond layouts and is not regressed.
- [ ] Missing supplemental data produces blank/unavailable behavior rather than fabricated values or generation failure.
- [ ] Existing Build 017 mappings continue to load and render.
- [ ] Canonical documentation is reconciled with the accepted implementation.

---

# 19. Intentionally outside Build 018

Do not expand Build 018 to include:

- Game Type field implementation;
- venue field dimensions;
- Venue Time Zone as a Designer field;
- coach collections;
- Opponent Batting Average;
- pronunciation;
- a new dedicated defensive-alignment data family;
- the future Standard-vs-Custom New Scorecard selection UI;
- a full Division Standings block unless separately approved as a Build 018 feature;
- static color/conditional formatting;
- shrink-to-fit/wrapping;
- Undo/Redo;
- synthetic preview collection filling;
- cross-device/cloud synchronization.
