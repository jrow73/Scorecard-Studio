/**
 * Generated Scorecard Studio v0.3.0 compatibility declarations.
 * Source: tests/fixtures/model-contract/v030-compatibility-map.json
 * Regenerate with tools/generate-v030-compatibility-definitions.mjs.
 */

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export const V030_COMPATIBILITY_DEFINITIONS = deepFreeze({
  "schemaId": "scorecard-studio.compatibility-map",
  "schemaVersion": 1,
  "contractRevision": "0.3.0-draft.1",
  "sourceModel": {
    "schemaVersion": 1,
    "fieldCount": 223,
    "catalogCount": 171
  },
  "targetModel": {
    "schemaVersion": 2
  },
  "capabilityVocabulary": [
    "corePregame",
    "officials",
    "extendedVenue",
    "staff",
    "pitcherRoles",
    "game2Overlay"
  ],
  "aliases": [
    {
      "alias": "away.teamName",
      "canonical": "away.team.name",
      "policy": "canonicalize-in-memory"
    },
    {
      "alias": "home.teamName",
      "canonical": "home.team.name",
      "policy": "canonicalize-in-memory"
    },
    {
      "alias": "away.startingPitcher.name",
      "canonical": "away.startingPitcher.player.name",
      "policy": "canonicalize-in-memory"
    },
    {
      "alias": "home.startingPitcher.name",
      "canonical": "home.startingPitcher.player.name",
      "policy": "canonicalize-in-memory"
    }
  ],
  "fields": [
    {
      "fieldId": "game.date",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.date",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.dates.officialDate",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "official-date",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.startTime",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.startTime",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.dates.scheduledStart",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "scheduled-start",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.dayNight",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.dayNight",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "game.dayNight",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.number",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.gameNumber",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "game.venue.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.city",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.city",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.location.city",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.state",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.state",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.location.state",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.country",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.country",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.location.country",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.capacity",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.capacity",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.fieldInfo.capacity",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.turfType",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.turfType",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.fieldInfo.turfType",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.venue.roofType",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.venue.roofType",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "game.venue.fieldInfo.roofType",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "extendedVenue"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.weather.temperature",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.weather.temperature",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "game.weather.temperature",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.weather.condition",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.weather.condition",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "game.weather.condition",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.weather.wind",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.weather.wind",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "game.weather.wind",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.weather.summary",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "game.weather.temperature",
          "game.weather.condition",
          "game.weather.wind"
        ],
        "projection": "weather-summary-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.home.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.umpires.home.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "game.umpires.crew"
        ],
        "projection": "select-official-role:home-plate",
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.first.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.umpires.first.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "game.umpires.crew"
        ],
        "projection": "select-official-role:first-base",
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.second.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.umpires.second.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "game.umpires.crew"
        ],
        "projection": "select-official-role:second-base",
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.third.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "game.umpires.third.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "game.umpires.crew"
        ],
        "projection": "select-official-role:third-base",
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.locationName",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.locationName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.locationName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.shortName",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.shortName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.shortName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.clubName",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.clubName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.clubName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.abbreviation",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.abbreviation",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.league.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.league.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.league.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.division.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.division.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.division.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.record.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.record.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.record.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.gameNumber",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.gameNumber",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.gameNumber",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.record.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.record.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.record.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.record.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.record.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.record.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.record.pct",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.record.pct",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.record.pct",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.record.display",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "away.team.record.wins",
          "away.team.record.losses"
        ],
        "projection": "wins-losses-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.divisionRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.divisionRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.divisionRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.leagueRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.leagueRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.leagueRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.wildCardRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.wildCardRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.wildCardRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.divisionGamesBack",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.divisionGamesBack",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.divisionGamesBack.raw",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "games-back-raw",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.streak",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.streak",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.team.standings.streak",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.last10.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.last10.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.lastTen.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.last10.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.last10.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.team.standings.lastTen.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.team.standings.last10.display",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.team.standings.last10.display",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "away.team.standings.lastTen.wins",
          "away.team.standings.lastTen.losses"
        ],
        "projection": "wins-losses-last-ten-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.manager.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.manager.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "coaches"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.manager.selected.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "selected-manager",
        "capabilityRequirements": [
          "staff"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.manager.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.manager.number",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "coaches"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.manager.selected.number",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "selected-manager",
        "capabilityRequirements": [
          "staff"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.player.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.startingPitcher.player.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.player.number",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.startingPitcher.player.number",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.player.throws",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.player.throws",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "away.startingPitcher.player.throws",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.gamesPlayed",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.gamesPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.gamesPitched",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.gamesPitched",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.gamesStarted",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.gamesStarted",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.gamesStarted",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.record",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "away.startingPitcher.stats.pitching.totals.wins",
          "away.startingPitcher.stats.pitching.totals.losses"
        ],
        "projection": "wins-losses-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.era",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.era",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.era",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.whip",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.whip",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.whip",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.inningsPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.inningsPitched",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.inningsPitched",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.hits",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.hits",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.hits",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.runs",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.runs",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.runs",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.earnedRuns",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.earnedRuns",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.earnedRuns",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.homeRuns",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.homeRuns",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.homeRuns",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.walks",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.walks",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.walks",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.strikeouts",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.strikeouts",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.strikeouts",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.saves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.saves",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.saves",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.saveOpportunities",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.saveOpportunities",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.saveOpportunities",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.holds",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.holds",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.holds",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.blownSaves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.blownSaves",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.blownSaves",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.winPercentage",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.winPercentage",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.winPercentage",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.strikeoutWalkRatio",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.strikeoutWalkRatio",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.strikeoutWalkRatio",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.strikeoutsPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.strikeoutsPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.strikeoutsPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.walksPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.walksPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.walksPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.hitsPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.hitsPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.hitsPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.homeRunsPer9",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.homeRunsPer9",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.homeRunsPer9",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.pitchesPerInning",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "away.startingPitcher.stats.pitchesPerInning",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "away.startingPitcher.stats.pitching.totals.pitchesPerInning",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.startingPitcher.stats.compact",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "away.startingPitcher.stats.pitching.totals.wins",
          "away.startingPitcher.stats.pitching.totals.losses",
          "away.startingPitcher.stats.pitching.totals.era"
        ],
        "projection": "pitching-compact-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.locationName",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.locationName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.locationName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.shortName",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.shortName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.shortName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.clubName",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.clubName",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.clubName",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.abbreviation",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.abbreviation",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.league.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.league.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.league.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.division.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.division.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.division.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.record.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.record.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.record.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.gameNumber",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.gameNumber",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.gameNumber",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.record.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.record.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.record.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.record.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.record.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.record.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.record.pct",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.record.pct",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.record.pct",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.record.display",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "home.team.record.wins",
          "home.team.record.losses"
        ],
        "projection": "wins-losses-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.divisionRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.divisionRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.divisionRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.leagueRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.leagueRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.leagueRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.wildCardRank",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.wildCardRank",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.wildCardRank.value",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "rank-value",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.divisionGamesBack",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.divisionGamesBack",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.divisionGamesBack.raw",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "games-back-raw",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.streak",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.streak",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.team.standings.streak",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.last10.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.last10.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.lastTen.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.last10.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.last10.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.team.standings.lastTen.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "renamed-path",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.team.standings.last10.display",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.team.standings.last10.display",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "standings"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "home.team.standings.lastTen.wins",
          "home.team.standings.lastTen.losses"
        ],
        "projection": "wins-losses-last-ten-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.manager.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.manager.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "coaches"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.manager.selected.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "selected-manager",
        "capabilityRequirements": [
          "staff"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.manager.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.manager.number",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "coaches"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.manager.selected.number",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "selected-manager",
        "capabilityRequirements": [
          "staff"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.player.name",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.startingPitcher.player.name",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.player.number",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.startingPitcher.player.number",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.player.throws",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.player.throws",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": "home.startingPitcher.player.throws",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.gamesPlayed",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.gamesPlayed",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.gamesPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.gamesPitched",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.gamesPitched",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.gamesStarted",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.gamesStarted",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.gamesStarted",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.wins",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.wins",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.losses",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.losses",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.record",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "home.startingPitcher.stats.pitching.totals.wins",
          "home.startingPitcher.stats.pitching.totals.losses"
        ],
        "projection": "wins-losses-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.era",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.era",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.era",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.whip",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.whip",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.whip",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.inningsPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.inningsPitched",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.inningsPitched",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.hits",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.hits",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.hits",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.runs",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.runs",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.runs",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.earnedRuns",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.earnedRuns",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.earnedRuns",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.homeRuns",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.homeRuns",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.homeRuns",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.walks",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.walks",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.walks",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.strikeouts",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.strikeouts",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.strikeouts",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.saves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.saves",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.saves",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.saveOpportunities",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.saveOpportunities",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.saveOpportunities",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.holds",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.holds",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.holds",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.blownSaves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.blownSaves",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.blownSaves",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.winPercentage",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.winPercentage",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.winPercentage",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.strikeoutWalkRatio",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.strikeoutWalkRatio",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.strikeoutWalkRatio",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.strikeoutsPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.strikeoutsPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.strikeoutsPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.walksPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.walksPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.walksPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.hitsPer9Inn",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.hitsPer9Inn",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.hitsPer9Inn",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.homeRunsPer9",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.homeRunsPer9",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.homeRunsPer9",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.pitchesPerInning",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "single",
        "path": "home.startingPitcher.stats.pitchesPerInning",
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": "home.startingPitcher.stats.pitching.totals.pitchesPerInning",
        "collection": null,
        "rowPath": null,
        "dependencies": [],
        "projection": "pitching-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.startingPitcher.stats.compact",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "composite",
        "cardinality": "single",
        "path": null,
        "collection": null,
        "rowPath": null,
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "home.startingPitcher.stats.pitching.totals.wins",
          "home.startingPitcher.stats.pitching.totals.losses",
          "home.startingPitcher.stats.pitching.totals.era"
        ],
        "projection": "pitching-compact-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].battingOrder",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "battingOrder",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "battingOrder",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "player.number",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "player.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].player.bats",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "player.bats",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "player.bats",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].position.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "position.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "position.abbreviation",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].position.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "position.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "position.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].position.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "position.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "position.number",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].player.primaryPosition.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "player.primaryPosition.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "player.primaryPosition.abbreviation",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].player.primaryPosition.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "player.primaryPosition.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "player.primaryPosition.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.avg",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.avg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.avg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.obp",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.obp",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.obp",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.slg",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.slg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.slg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.ops",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.ops",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.ops",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.homeRuns",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.homeRuns",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.homeRuns",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.rbi",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.rbi",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.rbi",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.gamesPlayed",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.gamesPlayed",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.plateAppearances",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.plateAppearances",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.plateAppearances",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.stolenBases",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.stolenBases",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": "stats.hitting.totals.stolenBases",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.lineup[].stats.slashLine",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.lineup",
        "rowPath": "stats.slashLine",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": "away.lineup.slots",
        "rowPath": null,
        "dependencies": [
          "away.lineup.slots[].stats.hitting.totals.avg",
          "away.lineup.slots[].stats.hitting.totals.obp",
          "away.lineup.slots[].stats.hitting.totals.slg"
        ],
        "projection": "hitting-slash-line-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].battingOrder",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "battingOrder",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "battingOrder",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "player.number",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "player.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].player.bats",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "player.bats",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "player.bats",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].position.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "position.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "position.abbreviation",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].position.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "position.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "position.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].position.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "position.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "position.number",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].player.primaryPosition.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "player.primaryPosition.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "player.primaryPosition.abbreviation",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].player.primaryPosition.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "player.primaryPosition.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "player.primaryPosition.name",
        "dependencies": [],
        "projection": "lineup-slots",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.avg",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.avg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.avg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.obp",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.obp",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.obp",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.slg",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.slg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.slg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.ops",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.ops",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.ops",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.homeRuns",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.homeRuns",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.homeRuns",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.rbi",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.rbi",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.rbi",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.gamesPlayed",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.gamesPlayed",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.plateAppearances",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.plateAppearances",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.plateAppearances",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.stolenBases",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.stolenBases",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": "stats.hitting.totals.stolenBases",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.lineup[].stats.slashLine",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.lineup",
        "rowPath": "stats.slashLine",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": "home.lineup.slots",
        "rowPath": null,
        "dependencies": [
          "home.lineup.slots[].stats.hitting.totals.avg",
          "home.lineup.slots[].stats.hitting.totals.obp",
          "home.lineup.slots[].stats.hitting.totals.slg"
        ],
        "projection": "hitting-slash-line-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.number",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.name",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].player.bats",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.bats",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.bats",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].player.primaryPosition.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.primaryPosition.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.primaryPosition.abbreviation",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].player.primaryPosition.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.primaryPosition.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "player.primaryPosition.name",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].position.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "position.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "away.bench",
        "rowPath": "position.abbreviation",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.avg",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.avg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.avg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.obp",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.obp",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.obp",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.slg",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.slg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.slg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.ops",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.ops",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.ops",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.homeRuns",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.homeRuns",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.homeRuns",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.rbi",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.rbi",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.rbi",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.gamesPlayed",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.gamesPlayed",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.plateAppearances",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.plateAppearances",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.plateAppearances",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.stolenBases",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.stolenBases",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.hitting.totals.stolenBases",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bench[].stats.slashLine",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bench",
        "rowPath": "stats.slashLine",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": "away.bench",
        "rowPath": null,
        "dependencies": [
          "away.bench[].stats.hitting.totals.avg",
          "away.bench[].stats.hitting.totals.obp",
          "away.bench[].stats.hitting.totals.slg"
        ],
        "projection": "hitting-slash-line-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.number",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.name",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].player.bats",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.bats",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.bats",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].player.primaryPosition.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.primaryPosition.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.primaryPosition.abbreviation",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].player.primaryPosition.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.primaryPosition.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "player.primaryPosition.name",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].position.abbreviation",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "position.abbreviation",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "home.bench",
        "rowPath": "position.abbreviation",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.avg",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.avg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.avg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.obp",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.obp",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.obp",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.slg",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.slg",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.slg",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.ops",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.ops",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.ops",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.homeRuns",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.homeRuns",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.homeRuns",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.rbi",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.rbi",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.rbi",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.gamesPlayed",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.gamesPlayed",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.gamesPlayed",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.plateAppearances",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.plateAppearances",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.plateAppearances",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.stolenBases",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.stolenBases",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.hitting.totals.stolenBases",
        "dependencies": [],
        "projection": "hitting-stat-scope",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bench[].stats.slashLine",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bench",
        "rowPath": "stats.slashLine",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": "home.bench",
        "rowPath": null,
        "dependencies": [
          "home.bench[].stats.hitting.totals.avg",
          "home.bench[].stats.hitting.totals.obp",
          "home.bench[].stats.hitting.totals.slg"
        ],
        "projection": "hitting-slash-line-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.number",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.name",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].player.throws",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "player.throws",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.throws",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.record",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.record",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters",
          "away.bullpen[].stats.pitching.totals.wins",
          "away.bullpen[].stats.pitching.totals.losses"
        ],
        "projection": "legacy-bullpen-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.era",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.era",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.era",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.whip",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.whip",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.whip",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.gamesStarted",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.gamesStarted",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.gamesStarted",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.wins",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.wins",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.losses",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.losses",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.inningsPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.inningsPitched",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.inningsPitched",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.strikeouts",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.strikeouts",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.strikeouts",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.saves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.saves",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.saves",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "away.bullpen[].stats.holds",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "away.bullpen",
        "rowPath": "stats.holds",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.holds",
        "dependencies": [
          "away.bullpen",
          "away.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].player.number",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "player.number",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.number",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].player.name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "player.name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.name",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].player.throws",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "player.throws",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "player.throws",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-union-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.record",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.record",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "derived",
        "path": null,
        "collection": null,
        "rowPath": null,
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters",
          "home.bullpen[].stats.pitching.totals.wins",
          "home.bullpen[].stats.pitching.totals.losses"
        ],
        "projection": "legacy-bullpen-record-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.era",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.era",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.era",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.whip",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.whip",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.whip",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.gamesStarted",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.gamesStarted",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.gamesStarted",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.wins",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.wins",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.wins",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.losses",
      "v1": {
        "catalog": true,
        "visibilityTier": "custom",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.losses",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.losses",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.inningsPitched",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.inningsPitched",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.inningsPitched",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.strikeouts",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.strikeouts",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.strikeouts",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.saves",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.saves",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.saves",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "home.bullpen[].stats.holds",
      "v1": {
        "catalog": false,
        "visibilityTier": "compatibility-only",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "home.bullpen",
        "rowPath": "stats.holds",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "projected",
        "path": null,
        "collection": null,
        "rowPath": "stats.pitching.totals.holds",
        "dependencies": [
          "home.bullpen",
          "home.additionalStarters"
        ],
        "projection": "legacy-bullpen-pitching-stat-v1",
        "capabilityRequirements": [
          "corePregame"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.crew[].name",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "game.umpires.crew",
        "rowPath": "name",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "game.umpires.crew",
        "rowPath": "name",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    },
    {
      "fieldId": "game.umpires.crew[].role",
      "v1": {
        "catalog": true,
        "visibilityTier": "standard",
        "kind": "atomic",
        "cardinality": "repeated",
        "path": null,
        "collection": "game.umpires.crew",
        "rowPath": "role",
        "sourceRequirements": [
          "gamePack"
        ]
      },
      "v2": {
        "disposition": "direct",
        "path": null,
        "collection": "game.umpires.crew",
        "rowPath": "role",
        "dependencies": [],
        "projection": null,
        "capabilityRequirements": [
          "officials"
        ],
        "unavailableBehavior": "blank-with-availability-state"
      }
    }
  ],
  "unknownFieldPolicy": {
    "resolution": "unsupported",
    "render": "blank-placeholder",
    "preserveOnLoadAndSave": true,
    "diagnostics": "retain-original-id-and-report-once-per-layout"
  },
  "persistencePolicy": {
    "layouts": {
      "storageSchemaIndependentFromNormalizedModel": true,
      "canonicalizeKnownAliases": "in-memory-on-load",
      "persistCanonicalIds": "only-on-explicit-user-save",
      "preserveUnknownFields": true
    },
    "normalizedSnapshots": {
      "keyParts": [
        "namespace",
        "schemaVersion",
        "contractRevision",
        "gamePk",
        "selectedViewKey"
      ],
      "namespace": "normalized-game",
      "acceptSchemaVersions": [
        2
      ],
      "v1ReadPolicy": "discard-and-recompute",
      "inPlaceUpgrade": false,
      "reason": "schema-v1 snapshots cannot reconstruct schema-v2 source results, scope, availability, or lineage"
    },
    "adapterCache": {
      "keyParts": [
        "namespace",
        "adapterContractRevision",
        "requestKey"
      ],
      "namespace": "adapter-result",
      "cacheSuccessfulAndPartialUnitsOnly": true,
      "cacheFailureAsEmpty": false,
      "invalidateOn": [
        "semantic-key-change",
        "adapter-contract-revision-change",
        "declared-freshness-trigger"
      ]
    },
    "generatedArtifacts": {
      "pdfAndExportBlobs": "unaffected",
      "reason": "rendered outputs are not normalized snapshots or adapter results"
    }
  }
});
export const COMPATIBILITY_FIELDS = V030_COMPATIBILITY_DEFINITIONS.fields;
export const COMPATIBILITY_ALIASES = V030_COMPATIBILITY_DEFINITIONS.aliases;
