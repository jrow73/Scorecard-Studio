import { FIELD_REGISTRY } from "./field-registry.js";

export const PRODUCT_SURFACES = Object.freeze(["home", "gameDay", "designer", "legacyLayout", "internal"]);

export const DESIGNER_HIDDEN_ACTIVE_FIELDS = Object.freeze([
  "game.umpires.home.name",
  "game.umpires.first.name",
  "game.umpires.second.name",
  "game.umpires.third.name"
]);

const designerHidden = new Set(DESIGNER_HIDDEN_ACTIVE_FIELDS);

function compatibilityReason(definition) {
  if (/\.lineup\[\]\.battingOrder$/.test(definition.id)) {
    return "Legacy-only: repeated lineup order already supplies placement semantics; no separate new-layout scalar is needed.";
  }
  if (/\.startingPitcher\./.test(definition.id)) {
    return "Legacy-only: preserved for saved layouts; the accepted active starter summary remains the supported new-layout set.";
  }
  return "Legacy-only compatibility field; retained for saved-layout resolution and intentionally hidden from new catalogs.";
}

function registryDisposition(definition) {
  const active = definition.catalog !== false;
  const hiddenFromDesigner = designerHidden.has(definition.id);
  return Object.freeze({
    fieldId: definition.id,
    classification: active ? "active" : "compatibility-only",
    surfaces: Object.freeze({
      home: false,
      gameDay: active,
      designer: active && !hiddenFromDesigner,
      legacyLayout: true,
      internal: false
    }),
    reason: active
      ? hiddenFromDesigner
        ? "Game Day and saved layouts retain the fixed-role value; new Designer work uses the variable Umpire Crew collection."
        : "Active registry field: visible in the research companion and eligible for new Designer layouts."
      : compatibilityReason(definition)
  });
}

export const FIELD_SURFACE_DISPOSITIONS = Object.freeze(FIELD_REGISTRY.map(registryDisposition));

export const UNREGISTERED_VALUE_DISPOSITIONS = Object.freeze([
  {
    family: "game-status-and-schedule-variants",
    schemaPaths: ["/game/status", "/game/dates/originalScheduledStart", "/game/dates/rescheduledStart", "/game/dates/resumeStart"],
    surfaces: { home: true, gameDay: true, designer: false, legacyLayout: false, internal: false },
    decision: "Home uses compact readiness/status; Game Day explains full timing context. Stable printable date/time fields already exist in the registry."
  },
  {
    family: "competition-context",
    schemaPaths: ["/context/sport", "/context/gameType", "/context/competitionSegment"],
    surfaces: { home: true, gameDay: true, designer: false, legacyLayout: false, internal: true },
    decision: "Competition scope drives game discovery and research context; new printable fields require a later product decision."
  },
  {
    family: "venue-timezone",
    schemaPaths: ["/game/venue/timeZone"],
    surfaces: { home: false, gameDay: true, designer: false, legacyLayout: false, internal: false },
    decision: "Research detail only; field dimensions are separately exposed through the registered Field Dimensions summary."
  },
  {
    family: "identity-and-join-keys",
    schemaPaths: ["/context/gamePk", "/away/team/id", "/home/team/id", "/standings/groups/*/key"],
    surfaces: { home: false, gameDay: false, designer: false, legacyLayout: false, internal: true },
    decision: "Stable internal joins and cache identity, not user-facing values."
  },
  {
    family: "typed-standings-detail",
    schemaPaths: ["/standings/groups", "/away/team/standings/elimination", "/away/team/standings/clinch"],
    surfaces: { home: false, gameDay: true, designer: false, legacyLayout: false, internal: false },
    decision: "Game Day displays source-returned standings groups and typed tokens. Scalar performance fields are registered; full standings tables and elimination/clinch markers remain outside the Designer."
  },
  {
    family: "manager-candidates-and-coaches",
    schemaPaths: ["/away/manager/candidates", "/away/coaches", "/home/manager/candidates", "/home/coaches"],
    surfaces: { home: false, gameDay: true, designer: false, legacyLayout: false, internal: false },
    decision: "Game Day exposes ambiguity and dated staff. Designer retains registered manager fields; repeated coaching collections are not yet a layout feature."
  },
  {
    family: "person-name-variants",
    schemaPaths: ["/*/*/person/name", "/*/*/person/firstName", "/*/*/person/useName", "/*/*/person/boxscoreName"],
    surfaces: { home: false, gameDay: true, designer: true, legacyLayout: true, internal: true },
    decision: "Source name variants are formatting inputs for one player-name field, not separate catalog fields."
  },
  {
    family: "pitcher-classification-and-groups",
    schemaPaths: ["/away/additionalStarters", "/away/bullpen", "/home/additionalStarters", "/home/bullpen"],
    surfaces: { home: false, gameDay: true, designer: true, legacyLayout: true, internal: true },
    decision: "Game Day shows honest groups. Build 001.7 will add per-block Designer group selection; omitted legacy mode continues to mean the combined projection."
  },
  {
    family: "availability-lineage-and-source-results",
    schemaPaths: ["/meta/sourceResults", "/meta/lineage", "/*/lineup/state", "/*/manager/state"],
    surfaces: { home: false, gameDay: true, designer: false, legacyLayout: false, internal: true },
    decision: "Game Day may summarize freshness and availability; full provenance remains engineering evidence and must not become ordinary printable data."
  },
  {
    family: "team-logos",
    schemaPaths: ["/away/team/logo", "/home/team/logo"],
    surfaces: { home: false, gameDay: false, designer: false, legacyLayout: false, internal: true },
    decision: "Deferred until asset sourcing, licensing, fallback, and layout behavior receive a separate product/design acceptance."
  }
].map((entry) => Object.freeze({ ...entry, schemaPaths: Object.freeze(entry.schemaPaths), surfaces: Object.freeze(entry.surfaces) })));

export function fieldSurfaceDisposition(fieldId) {
  return FIELD_SURFACE_DISPOSITIONS.find((entry) => entry.fieldId === fieldId) || null;
}
