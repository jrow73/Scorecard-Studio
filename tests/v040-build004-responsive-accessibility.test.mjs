import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  DESIGNER_DRAG_THRESHOLDS,
  designerDragHasStarted,
  designerDragThreshold,
  designerPointerIsTouchLike
} from "../js/v040-designer-interaction.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("Build 004.7a distinguishes taps from deliberate mouse, pen, and touch drags", () => {
  assert.deepEqual(DESIGNER_DRAG_THRESHOLDS, { mouse: 2, pen: 7, touch: 14 });
  assert.equal(designerDragThreshold("unknown"), 2);
  assert.equal(designerDragHasStarted(10, 10, 12, 10, "mouse"), true);
  assert.equal(designerDragHasStarted(10, 10, 13, 14, "touch"), false);
  assert.equal(designerDragHasStarted(10, 10, 20, 20, "touch"), true);
  assert.equal(designerDragHasStarted(0, 0, Number.NaN, 4, "mouse"), false);
  assert.equal(designerPointerIsTouchLike("touch"), true);
  assert.equal(designerPointerIsTouchLike("mouse", true), true);
  assert.equal(designerPointerIsTouchLike("mouse", false, 12, 12), true);
  assert.equal(designerPointerIsTouchLike("mouse", false, 1, 1), false);
});

test("Designer pointer handling captures one pointer, cancels safely, and saves only changed drags", async () => {
  const app = await read("js/app.js");
  assert.match(app, /designerDragHasStarted\(/);
  assert.match(app, /designerPointerIsTouchLike\(/);
  assert.match(app, /designer-touch-drag-handle/);
  assert.match(app, /setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(app, /document\.addEventListener\("pointercancel", cancelDesignerDrag\)/);
  assert.match(app, /releasePointerCapture\?\.\(drag\.pointerId\)/);
  assert.match(app, /if \(!save && drag\.changed\)[\s\S]*?clearTimeout\(state\.designerSaveTimer\)[\s\S]*?setDesignerSelectionPosition\(entry\.selection, entry\.startX, entry\.startY\)/);
  assert.match(app, /if \(save && drag\.changed\) scheduleDesignerSave\(\)/);
  assert.match(app, /function cancelDesignerDrag\(event\) \{ finishDesignerDrag\(event, \{ save: false \}\); \}/);
});

test("narrow dialogs and field pickers are bounded by the dynamic viewport", async () => {
  const css = await read("css/styles.css");
  const hardening = css.slice(css.indexOf("v0.4 Build 004.7"));
  assert.match(hardening, /max-block-size: calc\(100dvh - 16px\)/);
  assert.match(hardening, /height: calc\(100dvh - 16px\)/);
  assert.match(hardening, /\.layout-settings-dialog[\s\S]*?width: min\(1120px, calc\(100vw - 16px\)\)[\s\S]*?height: min\(900px, calc\(100dvh - 16px\)\)[\s\S]*?overflow: hidden/);
  assert.match(hardening, /\.layout-settings-dialog > \.layout-settings-shell[\s\S]*?width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?height: 100%;[\s\S]*?max-height: 100%/);
  assert.match(hardening, /html:has\(\.layout-settings-dialog\[open\]\),[\s\S]*?body:has\(\.layout-settings-dialog\[open\]\)[\s\S]*?overflow: hidden/);
  assert.match(css, /\.layout-settings-shell \{[\s\S]*?display: flex;[\s\S]*?flex-direction: column/);
  assert.match(css, /\.layout-settings-shell-header \{[\s\S]*?flex: 0 0 auto/);
  assert.match(css, /\.layout-settings-shell-body \{[\s\S]*?flex: 1 1 auto/);
  assert.match(css, /\.layout-settings-shell-footer \{[\s\S]*?flex: 0 0 auto/);
  assert.match(hardening, /\.layout-field-picker-side-grid \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  assert.match(hardening, /\.layout-settings-shell-body[\s\S]*?overflow-x: hidden/);
  assert.match(hardening, /\.layout-settings-shell-footer > div:not\(\[hidden\]\)[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("coarse pointers receive practical controls while reduced motion remains authoritative", async () => {
  const css = await read("css/styles.css");
  const hardening = css.slice(css.indexOf("v0.4 Build 004.7"));
  assert.match(css, /\.mapping-marker \{ touch-action: pan-x pan-y; \}/);
  assert.match(css, /\.designer-touch-drag-handle[\s\S]*?touch-action: none/);
  assert.match(hardening, /@media \(pointer: coarse\)/);
  assert.match(hardening, /\.layout-field-picker-item[\s\S]*?min-height: 44px/);
  assert.match(hardening, /\.mapping-marker[\s\S]*?min-width: 24px;[\s\S]*?min-height: 24px/);
  assert.match(hardening, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?transition-duration: \.01ms !important/);
});

test("restore workflow announces its dialog and receives intentional initial focus", async () => {
  const [html, app] = await Promise.all([read("index.html"), read("js/app.js")]);
  assert.match(html, /id="backup-restore-dialog"[^>]+aria-labelledby="backup-restore-dialog-title"/);
  assert.match(html, /id="backup-restore-dialog-title" tabindex="-1"/);
  assert.match(app, /querySelector\("#backup-restore-dialog-title"\)\?\.focus\(\)/);
});

test("Build 004.7d keeps the Game Day section menu below either app-header layout", async () => {
  const [css, app] = await Promise.all([read("css/styles.css"), read("js/app.js")]);
  assert.match(css, /--app-header-height: 68px/);
  assert.match(css, /\.gameday-section-nav \{ top: calc\(var\(--app-header-height\) \+ 8px\)/);
  assert.match(css, /#gameday-content > section \{[^}]*scroll-margin-top: calc\(var\(--app-header-height\) \+ 58px\)/);
  assert.doesNotMatch(css, /\.gameday-section-nav \{ position: sticky; top: 66px/);
  assert.match(app, /function initializeResponsiveStickyOffsets\(\)/);
  assert.match(app, /getBoundingClientRect\?\.\(\)\.height \|\| 68/);
  assert.match(app, /new ResizeObserver\(syncHeaderHeight\)/);
  assert.match(app, /style\.setProperty\("--app-header-height", `\$\{height\}px`\)/);
});
