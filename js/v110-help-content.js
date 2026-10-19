/** Load the locally maintained Help fragment without a framework or build step. */
import { HELP_TOPICS } from "./v070-help.js?v=110r004";

// Module-relative URL keeps GitHub Pages project subdirectories working.
export const HELP_CONTENT_URL = new URL("../help.html", import.meta.url);

export function validateHelpContent(html, documentObject = globalThis.document) {
  const template = documentObject.createElement("template");
  template.innerHTML = html;
  const sections = template.content.querySelectorAll("section[data-help-section]");
  if (sections.length !== HELP_TOPICS.length) throw new Error("The Help file has missing or extra topics.");
  for (const topic of HELP_TOPICS) {
    const matches = [...sections].filter((section) => section.dataset.helpSection === topic.key);
    if (matches.length !== 1 || matches[0].id !== topic.id || !matches[0].querySelector("h4")) {
      throw new Error(`The Help topic ${topic.key} is incomplete.`);
    }
    // Keep headings focusable even if an author drops the attribute while editing.
    matches[0].querySelector("h4").setAttribute("tabindex", "-1");
  }
  return template.innerHTML;
}

export function createHelpContentLoader({ fetchImpl = globalThis.fetch, validate = validateHelpContent } = {}) {
  let pending = null;
  return function load() {
    if (!pending) {
      pending = Promise.resolve().then(async () => {
        // Revalidate after a normal app reload so prose edits need no version bump.
        const response = await fetchImpl(HELP_CONTENT_URL, { cache: "no-cache" });
        if (!response.ok) throw new Error("Help could not be loaded.");
        return validate(await response.text());
      }).catch((error) => {
        pending = null;
        throw error;
      });
    }
    return pending;
  };
}
