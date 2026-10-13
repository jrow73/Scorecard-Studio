import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = await readFile(path.join(root, "css", "styles.css"), "utf8");

test("light appearance tokens meet readable contrast against principal surfaces", () => {
  const tokens = themeTokens(css, "light");
  assert.ok(contrast(tokens["--text"], tokens["--bg"]) >= 7);
  assert.ok(contrast(tokens["--muted"], tokens["--panel"]) >= 4.5);
  assert.ok(contrast("#ffffff", tokens["--accent"]) >= 4.5);
  assert.ok(contrast(tokens["--success-text"], tokens["--panel"]) >= 4.5);
  assert.ok(contrast(tokens["--warning-text"], tokens["--panel"]) >= 4.5);
  assert.ok(contrast(tokens["--danger-text"], tokens["--panel"]) >= 4.5);
});

test("specialized Designer, Game Day, status, and dialog surfaces use theme-aware tokens", () => {
  for (const token of [
    "--surface-subtle", "--surface-soft", "--surface-inset", "--surface-deep",
    "--surface-hover", "--dialog-chrome", "--success-text", "--warning-text",
    "--danger-text", "--selection-text"
  ]) assert.match(css, new RegExp(`${token.replace("--", "--")}:`));
  assert.match(css, /#layout-formatting-dialog \.layout-settings-card[\s\S]*?background: var\(--dialog-chrome\)/);
  assert.match(css, /\.layout-settings-parent-header,[\s\S]*?background: var\(--dialog-chrome\)/);
  assert.match(css, /\.designer-stage-panel[\s\S]*?background: var\(--surface-deep\)/);
  assert.match(css, /\.diagnostic-status\.available[^}]*var\(--success-text\)/);
  assert.match(css, /\.source-outcome-partial[^}]*var\(--warning-text\)/);
  assert.equal((css.match(/#1b2230/g) || []).length, 1, "The historical dark dialog color should remain only as the dark token value.");
});

test("light mode explicitly resolves primary actions, layered controls, backdrops, and keyboard focus", () => {
  assert.match(css, /:root\[data-theme="light"\] \.primary-button[\s\S]*?color: #ffffff/);
  assert.match(css, /:root\[data-theme="light"\] \.designer-palette,[\s\S]*?background: var\(--surface-inset\)/);
  assert.match(css, /:root\[data-theme="light"\] \.formatting-dialog::backdrop,[\s\S]*?background: rgba\(28,39,54,\.52\)/);
  assert.match(css, /button:focus-visible,[\s\S]*?outline: 3px solid color-mix/);
});

function themeTokens(source, theme) {
  const match = source.match(new RegExp(`:root\\[data-theme="${theme}"\\] \\{([\\s\\S]*?)\\n\\}`));
  assert.ok(match, `Missing ${theme} theme block.`);
  return Object.fromEntries([...match[1].matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((item) => [item[1], item[2]]));
}

function contrast(first, second) {
  const high = Math.max(luminance(first), luminance(second));
  const low = Math.min(luminance(first), luminance(second));
  return (high + 0.05) / (low + 0.05);
}

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
