/**
 * Scorecard Studio
 * v0.7 in-app guide topic contract
 */

export const HELP_TOPICS = Object.freeze([
  Object.freeze({ key: "getting-started", id: "help-getting-started", label: "Getting Started" }),
  Object.freeze({ key: "games", id: "help-games", label: "Find and Select a Game" }),
  Object.freeze({ key: "game-day", id: "help-game-day", label: "Use Game Day" }),
  Object.freeze({ key: "layouts", id: "help-layouts", label: "Create and Manage Layouts" }),
  Object.freeze({ key: "designer", id: "help-designer", label: "Use the Designer" }),
  Object.freeze({ key: "repeating-rows", id: "help-repeating-rows", label: "Player Records and Repeating Rows" }),
  Object.freeze({ key: "lineup", id: "help-lineup", label: "Starting Lineup" }),
  Object.freeze({ key: "bench", id: "help-bench", label: "Bench" }),
  Object.freeze({ key: "starting-pitcher", id: "help-starting-pitcher", label: "Starting Pitcher" }),
  Object.freeze({ key: "bullpen", id: "help-bullpen", label: "Bullpen" }),
  Object.freeze({ key: "standings", id: "help-standings", label: "Configuring the Standings Table" }),
  Object.freeze({ key: "text-templates", id: "help-text-templates", label: "Text Templates" }),
  Object.freeze({ key: "community", id: "help-community", label: "Community Help and Layout Sharing" }),
  Object.freeze({ key: "layout-settings", id: "help-layout-settings", label: "Layout Settings" }),
  Object.freeze({ key: "generate", id: "help-generate", label: "Generate a Scorecard" }),
  Object.freeze({ key: "data", id: "help-data", label: "Settings, Backups, and Local Data" }),
  Object.freeze({ key: "troubleshooting", id: "help-troubleshooting", label: "Troubleshooting and Limits" })
]);

const HELP_TOPIC_BY_KEY = new Map(HELP_TOPICS.map((topic) => [topic.key, topic]));

export function normalizeHelpTopicKey(value) {
  const key = String(value || "").trim();
  return HELP_TOPIC_BY_KEY.has(key) ? key : HELP_TOPICS[0].key;
}

export function helpTopicByKey(value) {
  return HELP_TOPIC_BY_KEY.get(normalizeHelpTopicKey(value));
}

// Object-level help is opt-in. The toolbar remains the general Designer entry.
export function designerHelpTopicForItem(item, { template = false, mode = null } = {}) {
  if (item?.kind === "standingsTable") return "standings";
  if (item?.kind === "custom") return "text-templates";
  if (["record", "collection"].includes(item?.kind) && item.forcedMode !== "individual" && mode !== "individual") {
    const id = String(item.id || "");
    for (const [context, topic] of [["lineup", "lineup"], ["bench", "bench"], ["startingPitcher", "starting-pitcher"], ["bullpen", "bullpen"]]) {
      if (["away", "home"].some((side) => id === `${side}.${context}`)) return topic;
    }
    if (id === "game.umpires.crew") return "repeating-rows";
  }
  return template ? "text-templates" : null;
}
