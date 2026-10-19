# Editing Scorecard Studio Help

## Everyday wording changes

Edit **`help.html` in the project root**. It contains every topic's paragraphs, lists, examples, and topic headings. No application JavaScript changes or build step are required for wording changes.

1. Open `help.html` in VS Code. Search for a topic heading, such as `Bullpen`, or its stable section ID, such as `help-bullpen`.
2. Edit the text inside the topic's existing HTML tags. Use VS Code's formatting command if you want more line breaks while editing.
3. Save the file. If working locally, normally reload the app, then open Help or the relevant Inspector question mark. The first Help request after an app reload revalidates `help.html`; a help-only wording edit does not require a version/cache-key change.
4. Check the edited topic in both the wide Help dialog and the narrow topic-picker layout. Check the instructions against the actual controls.
5. When publishing, include the updated root-level `help.html` in the deployed site. Visitors with an already open app should reload it to pick up the revision.

Search indexes topic labels, headings, and body text automatically after the Help file loads. New wording and examples need no search keywords or index maintenance; reload the app to make your saved changes searchable.

Help is loaded once per page session and shared by all entry points. Closing and reopening Help without reloading the app keeps that session's copy.

## Useful HTML

```html
<p>Write an explanatory paragraph here.</p>
<p>Choose <strong>Edit Layout</strong> to adjust the object.</p>
<ul>
  <li>Use a bullet for an independent option.</li>
  <li>Add another item as needed.</li>
</ul>
<ol>
  <li>Use numbered steps for a sequence.</li>
  <li>Explain the next action.</li>
</ol>
```

Use `&amp;` for a literal ampersand and `&lt;` for a literal less-than sign. Avoid copying styled text from Word directly into the HTML; paste plain text and keep the existing tags.

To link to another topic within Help, use its topic key:

```html
<button class="secondary-button compact-button" type="button"
        data-help-topic="repeating-rows">Help with repeating rows</button>
```

## Keep the topic structure

For example:

```html
<section class="help-topic" id="help-bullpen" data-help-section="bullpen">
  <p class="section-label">Designer Help</p>
  <h4 tabindex="-1">Bullpen</h4>
  <p>Your explanatory text goes here.</p>
</section>
```

Keep the `section` ID, its `data-help-section` key, the `help-topic` class, the `h4` heading, and the matching closing tags. Keep control IDs such as `help-start-tour-btn` and link routing attributes intact. Edit the text around those structural attributes freely.

The file is an HTML fragment for the app's existing Help dialog. Do not wrap it in another `html`, `body`, `article`, or `dialog`, or add scripts. Preview the content through the app rather than opening this file as a separate page.

Missing, duplicated, or incorrectly identified topics cause Help to show a retry message instead of a broken guide. Correct the file, save it, and select Retry Help. Existing Designer edits remain untouched.

## Renaming or adding topics

A change to a paragraph, list, example, or displayed topic heading only needs `help.html`. The navigation labels are maintained separately from the body heading: changing those labels requires updating the topic registry in `js/v070-help.js` and the desktop/mobile navigation in `index.html`.

Adding a new topic also needs a unique registry key and ID, its navigation entries, a matching section in `help.html`, and tests. To give an object a question-mark button, add an explicit relevant route in `designerHelpTopicForItem` in `js/v070-help.js`. Do not add a general Designer Overview fallback to object headers. The Designer toolbar remains the general Help entry point.

Run `node tools/run-v110-release-gate.mjs` after structural changes. Wording-only changes can be checked by reloading and reading the edited topic in the app.
