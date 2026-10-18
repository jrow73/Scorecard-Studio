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
