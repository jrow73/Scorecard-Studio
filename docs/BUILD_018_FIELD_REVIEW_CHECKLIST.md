# Scorecard Studio - Build 018 Field Review Decisions

**Baseline:** v0.2.0 Build 017 Final  
**Status:** Product review complete - decisions incorporated  
**Purpose:** Human-readable record of the field-support and Standard/Custom exposure decisions that will drive the Build 018 technical implementation pass.

---

## 1. Exposure model agreed for future scorecard setup

Scorecard Studio will distinguish between two independent field properties:

- **Availability** - whether the field is supported, deferred/future, or intentionally not part of the scorecard field catalog.
- **Visibility Tier** - for supported fields, whether the field belongs in the default **Standard** field set or the optional **Custom** field set.

Recommended registry metadata:

```text
availability: supported | future | unverified
visibilityTier: standard | custom
```

`visibilityTier` applies only to supported Designer fields.

A future New Scorecard workflow may offer:

### Use Standard Fields

Expose only registry fields marked **Standard**.

### Use Custom Fields

Start with all **Standard** fields selected, show all supported **Custom** fields, allow the user to add Custom fields, and allow Standard fields to be deselected.

The field-selection interface itself is **not** part of Build 018. Build 018 should establish the classifications and registry metadata needed to support that workflow later.

---

# 2. Game

| Field | Decision | Tier | Notes |
|---|---|---|---|
| Game Date | Support | **Standard** | Keep. |
| Start Time | Support | **Standard** | Keep. |
| Day / Night | Support | **Custom** | Keep as an optional field. |
| Game Type | Future | - | Possible future update; ignore for current implementation. |
| Game Number | Support | **Custom** | Verified as `gameData.game.gameNumber`, meaning the game number within the day's scheduled games (for example Game 1 / Game 2 of a doubleheader), not the team's 45th game of the season. |

**Related decision:** season-to-date team Games Played is separate and belongs under Team Record.

---

# 3. Venue

| Field | Decision | Tier | Notes |
|---|---|---|---|
| Venue Name | Support | **Standard** | Keep. |
| City | Support | **Custom** | Keep. |
| State / Province | Support | **Custom** | Keep. |
| Country | Support | **Custom** | Keep. |
| Capacity | Support | **Custom** | Keep if source data is available. |
| Turf Type | Support | **Custom** | Keep if source data is available. |
| Roof Type | Support | **Custom** | Keep if source data is available. |
| Venue Time Zone | App-only | - | Valuable to Scorecard Studio for showing venue-local vs user-local game times, but not a scorecard Designer field. |
| Field Dimensions | Future | - | Possible future update; ignore for current implementation. |

---

# 4. Weather

The current field family is accepted as-is.

| Field | Decision | Tier |
|---|---|---|
| Weather Summary | Support | **Standard** |
| Temperature | Support | **Custom** |
| Conditions | Support | **Custom** |
| Wind | Support | **Custom** |

---

# 5. Team Information

Applies symmetrically to Away and Home.

| Field | Decision | Tier |
|---|---|---|
| Full Team Name | Support | **Standard** |
| Club Name | Support | **Standard** |
| Abbreviation | Support | **Standard** |
| Location Name | Support | **Custom** |
| Short Name | Support | **Custom** |
| League Name | Support | **Custom** |
| Division Name | Support | **Custom** |

---

# 6. Team Record / Standings

Applies symmetrically to Away and Home.

## Basic record

| Field | Decision | Tier | Notes |
|---|---|---|---|
| Games Played | Support | **Standard** | This is the season-to-date count (for example 45 games played), distinct from Game Number above. |
| W-L Record | Support | **Standard** | Convenience composite. |
| Wins | Support | **Custom** | Atomic value. |
| Losses | Support | **Custom** | Atomic value. |
| Winning Percentage | Support | **Custom** | Atomic value. |

## Standings context

The following should be available as **Custom** fields when the API/source path is reasonably obtainable:

- Division Leader
- Division Rank
- League Rank
- Wild Card Rank
- Division Games Back
- League Games Back
- Wild Card Games Back
- Streak
- Last 10 Wins
- Last 10 Losses
- Last 10 Record

### Division Leader display

The source-backed value is currently a boolean. The field is retained as a **Custom** candidate, but the printed representation is still intentionally undecided until we inspect/use real data in context. Build 018 should not invent a display convention merely to close the audit.

### Division Standings block

A full **Division Standings** block remains a desirable **Custom** option if it can be obtained without excessive supplemental API traffic. Treat this as a larger collection/block feature rather than a simple scalar field. It does not need to be implemented merely to finish the scalar-field portion of Build 018.

---

# 7. Manager and Coaches

Applies symmetrically to Away and Home.

| Field | Decision | Tier |
|---|---|---|
| Manager Name | Support | **Standard** |
| Manager Jersey Number | Support | **Custom** |
| Coach collections | Do not pursue | - |

Manager is sufficient for the Scorecard Studio scorecard use case. Bench, hitting, pitching, and other coach collections can be removed from the active roadmap unless a future requirement emerges.

---

# 8. Starting Pitcher

Applies symmetrically to Away and Home.

## Identity

| Field | Decision | Tier |
|---|---|---|
| Player Name | Support | **Standard** |
| Jersey Number | Support | **Standard** |
| Throws | Support | **Standard** |

## Pitching statistics retained in the selectable field catalog

| Field | Decision | Tier |
|---|---|---|
| Games Started | Support | **Standard** |
| W-L Record | Support | **Standard** |
| ERA | Support | **Standard** |
| Wins | Support | **Custom** |
| Losses | Support | **Custom** |
| WHIP | Support | **Custom** |

Other pitching statistics currently present in the Build 017 runtime should not remain general selectable fields merely because the source supplies them. Build 018 should preserve compatibility with existing mappings where practical, but the active field catalog should follow the six-field decision above.

**Opponent Batting Average:** possible post-v1 enhancement only; leave out of the active roadmap for now.

---

# 9. Starting Lineup

Repeated collection for Away and Home.

## Identity / role

| Field | Decision | Tier | Notes |
|---|---|---|---|
| Player Name | Support | **Standard** | Name Format applies. |
| Jersey Number | Support | **Standard** | |
| Bats | Support | **Standard** | |
| Today's Position Abbreviation | Support | **Standard** | Example: `SS`. |
| Today's Position Full Name | Support | **Custom** | Example: `Shortstop`. |
| Today's Position Number | Support - derived | **Custom** | Baseball defensive number derived from the position: P=1, C=2, 1B=3, 2B=4, 3B=5, SS=6, LF=7, CF=8, RF=9. DH has no artificial defensive number. |
| Primary Position | Support | **Custom** | Distinct from today's posted lineup assignment. |

## Batting statistics

| Field | Decision | Tier |
|---|---|---|
| Batting Average | Support | **Standard** |
| On-Base Percentage | Support | **Custom** |
| Slugging Percentage | Support | **Custom** |
| OPS | Support | **Custom** |
| Home Runs | Support | **Custom** |
| RBI | Support | **Custom** |
| Games Played | Support | **Custom** |
| Plate Appearances | Support | **Custom** |
| Stolen Bases | Support | **Custom** |
| Slash Line composite | Support | **Custom** |

Other batting statistics from the earlier broad inventory are not part of the active v1 field catalog unless a future requirement emerges.

---

# 10. Bench

Bench players should have access to the **same supported batting-stat family as Starting Lineup players**, with the same Standard/Custom classifications.

## Identity / position

| Field | Decision | Tier | Notes |
|---|---|---|---|
| Player Name | Support | **Standard** | Name Format applies. |
| Jersey Number | Support | **Standard** | |
| Bats | Support | **Standard** | |
| Primary Position | Support | **Standard** | Intended to show the player's normal/typical position. |
| Game/listed Position | Support | **Custom** | Retain separately where the source provides meaningful game-context position data. |

Primary Position and today's/game position are separate facts and should remain distinct in the registry.

---

# 11. Bullpen

Repeated collection for Away and Home.

## Identity

| Field | Decision | Tier |
|---|---|---|
| Pitcher Name | Support | **Standard** |
| Jersey Number | Support | **Standard** |
| Throws | Support | **Standard** |

## Pitching statistics

Bullpen should use the same retained six-stat family as Starting Pitcher, but keep the currently proposed bullpen default exposure.

| Field | Decision | Tier |
|---|---|---|
| W-L Record | Support | **Standard** |
| ERA | Support | **Standard** |
| WHIP | Support | **Standard** |
| Games Started | Support | **Custom** |
| Wins | Support | **Custom** |
| Losses | Support | **Custom** |

Other Build 017 bullpen/pitching leaves may remain resolvable for compatibility where practical, but they should not remain part of the active selectable field catalog unless deliberately reintroduced later.

---

# 12. Player Name Format

Name Format remains a presentation capability on player-name fields rather than separate semantic fields.

Approved choices:

- Full Name
- First Initial + Last Name
- Last Name
- First Name
- Use Name + Last Name
- **Boxscore Name**

Additional decisions:

- **Pronunciation:** do not expose.
- **Suffix / title:** handle automatically as part of the appropriate source-backed name representation; do not expose as standalone fields.
- Do not manufacture name parts by splitting a full-name string when source-backed parts are unavailable.

---

# 13. Primary Position vs Today's Position

Both concepts should be retained because they answer different questions:

- **Primary Position** - the player's normal/typical position from player metadata.
- **Today's Position** - the player's assignment in the posted lineup for this game.

Starting Lineup should emphasize Today's Position; Bench should emphasize Primary Position.

---

# 14. Defensive Alignment

Build 017 already allows a second instance of Today's Lineup to be placed using **Individual Placement**, which lets the user arrange defensive players however the scorecard requires.

Decision for Build 018:

- Do **not** create a new first-class defensive-alignment data family solely to duplicate something the Designer can already accomplish.
- Preserve the existing Individual Placement capability.
- Keep a future UX exploration open for a more intuitive defensive-diamond workflow if one can improve usability without introducing redundant field semantics.

---

# 15. Umpires / Officials

Both access methods are useful.

## Repeated collection

| Field | Decision | Tier |
|---|---|---|
| Umpire Name | Support | **Standard** |
| Umpire Role | Support | **Standard** |

## Fixed-role convenience fields

| Field | Decision | Tier |
|---|---|---|
| Home Plate Umpire | Support | **Custom** |
| First Base Umpire | Support | **Custom** |
| Second Base Umpire | Support | **Custom** |
| Third Base Umpire | Support | **Custom** |

---

# 16. Explicitly deferred or excluded from the active v1 field catalog

The following should not expand Build 018:

- Game Type - future possibility.
- Venue field dimensions - future possibility.
- Venue Time Zone as a Designer field - app metadata only.
- Coach collections - not needed.
- Opponent Batting Average - possible post-v1 enhancement.
- Pronunciation - not needed.
- New dedicated defensive-alignment data family - not needed while Individual Placement provides the capability.
- Full Division Standings block - retain as a Custom future feature if the supplemental data cost is reasonable.

---

# 17. Product review status

The broad product-owner question pass is complete. Remaining questions are now technical rather than conceptual:

1. Which accepted fields already exist in Build 017 but are hidden?
2. Which require a small normalization or resolver addition?
3. Which require supplemental API hydration?
4. Which current Build 017 fields should become compatibility-only rather than selectable?
5. How should `visibilityTier` be represented and consumed without building the future scorecard field-selection UI yet?
6. What display convention should eventually be used for the boolean Division Leader field?
7. Is a full Division Standings block economical enough in API traffic to retain as a practical future Custom feature?

Those questions are handled in `BUILD_018_FIELD_COVERAGE_AUDIT.md`.
