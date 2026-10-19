/** Browser-only Help search. Text is indexed from the loaded help.html topics. */
export function helpSearchTerms(query) {
  return [...new Set(String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean))];
}

export function helpMatchRanges(text, terms) {
  const lower = String(text).toLowerCase();
  const ranges = [];
  for (const term of terms) {
    if (!term) continue;
    let start = 0;
    while ((start = lower.indexOf(term, start)) !== -1) {
      ranges.push([start, start + term.length]);
      start += term.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged = [];
  for (const range of ranges) {
    const previous = merged.at(-1);
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
    else merged.push([...range]);
  }
  return merged;
}

export function helpSearchExcerpt(text, terms, length = 180) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= length) return normalized;
  const lower = normalized.toLowerCase();
  const positions = terms.flatMap(term => {
    const matches = [];
    let position = 0;
    while (term && (position = lower.indexOf(term, position)) !== -1) {
      matches.push(position); position += term.length;
    }
    return matches;
  });
  let start = 0, best = -1;
  for (const position of positions) {
    const candidate = Math.max(0, position - 35);
    const window = lower.slice(candidate, candidate + length);
    const score = terms.filter(term => window.includes(term)).length;
    if (score > best) { best = score; start = candidate; }
  }
  // Avoid partial words at either edge, without dropping the first match.
  if (start > 0) {
    const boundary = normalized.lastIndexOf(" ", start);
    if (boundary >= Math.max(0, start - 25)) start = boundary + 1;
  }
  let end = Math.min(normalized.length, start + length);
  if (end < normalized.length) {
    const boundary = normalized.lastIndexOf(" ", end);
    if (boundary > end - 25) end = boundary;
  }
  return `${start ? "…" : ""}${normalized.slice(start, end)}${end < normalized.length ? "…" : ""}`;
}

export function searchHelpTopics(topics, query) {
  const terms = helpSearchTerms(query);
  if (!terms.length) return [];
  return topics.map((topic, order) => {
    const title = String(topic.title || "").toLowerCase();
    const text = `${topic.title || ""} ${topic.heading || ""} ${topic.text || ""}`.toLowerCase();
    if (!terms.every(term => text.includes(term))) return null;
    const score = terms.filter(term => title.includes(term)).length;
    return { ...topic, excerpt: helpSearchExcerpt(topic.text, terms), score, order };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.order - b.order);
}

export function appendHelpHighlightedText(parent, text, terms, documentObject = globalThis.document) {
  let offset = 0;
  for (const [start, end] of helpMatchRanges(text, terms)) {
    parent.append(documentObject.createTextNode(text.slice(offset, start)));
    const mark = documentObject.createElement("mark");
    mark.dataset.helpSearchMark = "";
    mark.textContent = text.slice(start, end);
    parent.append(mark);
    offset = end;
  }
  parent.append(documentObject.createTextNode(text.slice(offset)));
}

export function clearHelpHighlights(root) {
  for (const mark of root.querySelectorAll("mark[data-help-search-mark]")) mark.replaceWith(...mark.childNodes);
  root.normalize();
}

function textNodes(root, documentObject) {
  const walker = documentObject.createTreeWalker(root, 4); // NodeFilter.SHOW_TEXT
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

export function highlightHelpTopic(root, terms, documentObject = globalThis.document) {
  clearHelpHighlights(root);
  if (!terms.length) return;
  for (const node of textNodes(root, documentObject)) {
    if (node.parentElement?.closest("script, style, button, select, textarea")) continue;
    if (!helpMatchRanges(node.textContent, terms).length) continue;
    const fragment = documentObject.createDocumentFragment();
    appendHelpHighlightedText(fragment, node.textContent, terms, documentObject);
    node.replaceWith(fragment);
  }
}

export function createHelpSearchController({ elements, topics, onSelectTopic, documentObject = globalThis.document }) {
  const { input, clearButton, backButton, status, results, article } = elements;
  let index = [], selectedKey = null;
  const query = () => input.value.trim();
  const terms = () => helpSearchTerms(query());
  const countMessage = count => count ? `${count} matching ${count === 1 ? "topic" : "topics"}.` : "No matching help topics. Try different words.";

  function reset() {
    input.value = "";
    selectedKey = null;
    clearButton.hidden = true;
    backButton.hidden = true;
    results.hidden = true;
    results.replaceChildren();
    article.hidden = false;
    status.textContent = "";
    clearHelpHighlights(article);
  }

  function showTopic() {
    results.hidden = true;
    article.hidden = false;
    backButton.hidden = !query();
    clearHelpHighlights(article);
    if (query()) highlightHelpTopic(article, terms(), documentObject);
  }

  function showResults() {
    if (!query()) { reset(); return; }
    const matches = searchHelpTopics(index, query());
    clearButton.hidden = false;
    backButton.hidden = true;
    article.hidden = true;
    results.hidden = false;
    results.scrollTop = 0;
    results.replaceChildren();
    status.textContent = countMessage(matches.length);
    const heading = documentObject.createElement("h4");
    heading.textContent = "Search results";
    results.append(heading);
    if (!matches.length) {
      const message = documentObject.createElement("p");
      message.textContent = "No matching help topics. Try different words.";
      results.append(message);
      return;
    }
    const list = documentObject.createElement("ul");
    list.className = "help-search-result-list";
    for (const match of matches) {
      const item = documentObject.createElement("li");
      const button = documentObject.createElement("button");
      button.type = "button";
      button.dataset.helpSearchResult = match.key;
      const title = documentObject.createElement("strong");
      const excerpt = documentObject.createElement("span");
      appendHelpHighlightedText(title, match.title, terms(), documentObject);
      appendHelpHighlightedText(excerpt, match.excerpt, terms(), documentObject);
      button.append(title, excerpt);
      button.addEventListener("click", () => { selectedKey = match.key; onSelectTopic(match.key); });
      item.append(button); list.append(item);
    }
    results.append(list);
  }

  input.addEventListener("input", showResults);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && query() && !results.hidden) {
      event.preventDefault();
      results.querySelector("[data-help-search-result]")?.click();
    }
  });
  clearButton.addEventListener("click", () => { reset(); input.focus(); });
  backButton.addEventListener("click", () => {
    showResults();
    const buttons = [...results.querySelectorAll("[data-help-search-result]")];
    (buttons.find(button => button.dataset.helpSearchResult === selectedKey) || buttons[0] || input).focus();
  });

  return {
    reset, showTopic,
    setContent() {
      clearHelpHighlights(article);
      index = topics.map(topic => {
        const section = article.querySelector(`#${topic.id}`);
        return {
          key: topic.key, title: topic.label,
          heading: section?.querySelector("h4")?.textContent || "",
          text: section ? textNodes(section, documentObject).map(node => node.textContent).join(" ").replace(/\s+/g, " ").trim() : ""
        };
      });
      input.disabled = false;
    }
  };
}
