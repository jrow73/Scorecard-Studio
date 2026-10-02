import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'app-meta.json'), 'utf8'));

assert.equal(meta.build, '031.1');

// Generic Text Template remains an internal custom item, but now has a forced
// template workflow so creation never stops at a one-choice usage screen.
assert.match(app, /kind: "custom", id: "custom", groupId: "custom", label: "Text Template", forcedMode: "template"/);
assert.match(app, /kind:"custom", id:"custom", label:"Text Template", forcedMode:"template"/);

// The custom palette group is rendered as a flattened category -> instances tree.
assert.match(app, /details\.classList\.add\("designer-generic-template-category"\)/);
assert.match(app, /if \(group\.id === "custom"\) \{[\s\S]*for \(const instance of designerDirectInstancesForItem\(templateItem\)\)/);
assert.match(app, /if \(templateItem\) beginGenericTextTemplateCreation\(templateItem\)/);

// Chevron is a dedicated expand/collapse target; category body/title is creation.
assert.match(app, /chevron\.setAttribute\("aria-label", "Expand or collapse Text Template instances"\)/);
assert.match(app, /details\.open = !details\.open/);
assert.match(css, /designer-generic-template-category > summary \.designer-category-chevron/);

// Generic template creation enters template mode directly and does not show the
// generic Usage summary that other object workflows still use.
assert.match(app, /function beginGenericTextTemplateCreation[\s\S]*state\.designerPendingMode = "template"/);
assert.match(app, /if \(pending\.kind !== "custom"\) \{[\s\S]*designer-choice-summary/);

// Creating another instance from a selected generic template also stays direct.
assert.match(app, /if \(item\.kind === "custom" && state\.designerPendingMode === "template"\)/);

console.log('Build 031 tests passed.');
