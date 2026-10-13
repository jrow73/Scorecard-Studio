import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, "..");
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".pdf", "application/pdf"]
]);

class HeadlessUnavailableError extends Error {}

function parseArguments(argv) {
  const result = { root: DEFAULT_ROOT, browsers: [] };
  for (const argument of argv) {
    if (argument.startsWith("--root=")) result.root = resolve(argument.slice(7));
    if (argument.startsWith("--browser=")) {
      const [label, ...pathParts] = argument.slice(10).split("|");
      result.browsers.push({ label: label.trim(), path: pathParts.join("|").trim() });
    }
  }
  return result;
}

async function discoverWindowsBrowsers() {
  if (process.platform !== "win32") return [];
  const candidates = [
    ["Chrome", join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe")],
    ["Chrome", join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe")],
    ["Edge", join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft", "Edge", "Application", "msedge.exe")],
    ["Edge", join(process.env.PROGRAMFILES || "", "Microsoft", "Edge", "Application", "msedge.exe")]
  ];
  const discovered = [];
  for (const [label, path] of candidates) {
    if (!path || discovered.some((entry) => entry.label === label)) continue;
    try {
      if ((await stat(path)).isFile()) discovered.push({ label, path });
    } catch {}
  }
  return discovered;
}

function acceptanceHook() {
  return `<script>
    window.__scorecardAcceptance = { blobs: [], errors: [] };
    window.addEventListener("error", (event) => window.__scorecardAcceptance.errors.push(event.message || "Browser error"));
    window.addEventListener("unhandledrejection", (event) => window.__scorecardAcceptance.errors.push(String(event.reason?.message || event.reason || "Unhandled rejection")));
    for (const method of ["warn", "error"]) {
      const original = console[method].bind(console);
      console[method] = (...args) => {
        window.__scorecardAcceptance.errors.push(method + ": " + args.map((value) => String(value)).join(" "));
        original(...args);
      };
    }
    const createObjectUrl = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (value) => {
      if (value instanceof Blob) window.__scorecardAcceptance.blobs.push(value);
      return createObjectUrl(value);
    };
    HTMLAnchorElement.prototype.click = function () {};
  </script>`;
}

function acceptancePage() {
  return `<!doctype html>
    <html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{display:block;border:0;width:100vw;height:100vh}</style></head>
    <body><img hidden src="/__hold__"><iframe id="app" src="/__app__.html"></iframe><script>
      const waitUntil = async (callback, message, timeout = 12000) => {
        const deadline = Date.now() + timeout;
        while (Date.now() < deadline) {
          const value = await callback();
          if (value) return value;
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        throw new Error(message);
      };
      const publish = (result) => {
        const bytes = new TextEncoder().encode(JSON.stringify(result));
        let binary = "";
        for (const byte of bytes) binary += String.fromCharCode(byte);
        document.body.dataset.result = btoa(binary);
        fetch("/__done__", { method: "POST" });
      };
      document.querySelector("#app").addEventListener("load", async (event) => {
        const frame = event.currentTarget;
        const win = frame.contentWindow;
        const doc = frame.contentDocument;
        try {
          await waitUntil(() => doc.body?.innerText.includes("0.4.0"), "Application identity did not load.");
          const identity = doc.querySelector("[data-app-version-label]")?.textContent?.trim();
          doc.querySelector("#nav-settings")?.click();
          await waitUntil(() => doc.querySelector("#backup-heading")?.textContent?.trim() === "Backup & Restore", "Settings did not render.");
          await waitUntil(() => doc.querySelector("#storage-status")?.textContent?.trim() === "IndexedDB ready", "IndexedDB did not become ready.");
          const desktop = {
            storage: doc.querySelector("#storage-status")?.textContent?.trim(),
            completeEnabled: !doc.querySelector("#backup-complete-btn")?.disabled,
            layoutDisabled: Boolean(doc.querySelector("#backup-layout-btn")?.disabled),
            fileEnabled: !doc.querySelector("#backup-restore-file-btn")?.disabled
          };
          const chooseAppearance = async (value) => {
            const input = doc.querySelector('input[name="appearance"][value="' + value + '"]');
            input.checked = true;
            input.dispatchEvent(new win.Event("change", { bubbles: true }));
            await waitUntil(() => doc.documentElement.dataset.appearance === value && !doc.querySelector("#appearance-status")?.textContent?.includes("Saving"), "Appearance " + value + " did not settle.");
            const styles = win.getComputedStyle(doc.documentElement);
            const views = {};
            if (value !== "system") {
              for (const [name, navId] of [["home", "nav-home"], ["gameday", "nav-gameday"], ["layouts", "nav-layouts"], ["settings", "nav-settings"]]) {
                doc.querySelector("#" + navId)?.click();
                const view = await waitUntil(() => {
                  const candidate = doc.querySelector('[data-view="' + name + '"]');
                  return candidate && !candidate.hidden ? candidate : null;
                }, "View " + name + " did not open in " + value + " mode.");
                views[name] = {
                  visible: !view.hidden,
                  horizontalOverflow: view.scrollWidth > view.clientWidth + 1
                };
              }
            }
            return {
              preference: doc.documentElement.dataset.appearance,
              theme: doc.documentElement.dataset.theme,
              startupMirror: win.localStorage.getItem("scorecardStudio.appearance"),
              text: styles.getPropertyValue("--text").trim(),
              background: styles.getPropertyValue("--bg").trim(),
              views
            };
          };
          const lightAppearance = await chooseAppearance("light");
          const darkAppearance = await chooseAppearance("dark");
          const systemAppearance = await chooseAppearance("system");
          doc.querySelector("#backup-open-restore-btn")?.click();
          const restoreDialog = await waitUntil(() => doc.querySelector("#backup-restore-dialog")?.open ? doc.querySelector("#backup-restore-dialog") : null, "Restore modal did not open.");
          const restoreCard = restoreDialog.querySelector(".backup-restore-dialog-card");
          const restoreRect = restoreDialog.getBoundingClientRect();
          const restoreModal = {
            initialStep: doc.querySelector("#backup-restore-progress")?.textContent?.trim(),
            withinViewport: restoreRect.left >= -1 && restoreRect.right <= doc.documentElement.clientWidth + 1 && restoreRect.top >= -1 && restoreRect.bottom <= doc.documentElement.clientHeight + 1,
            horizontalOverflow: restoreCard.scrollWidth > restoreCard.clientWidth + 1,
            initialFocus: doc.activeElement?.id
          };
          restoreDialog.close();
          doc.querySelector("#backup-complete-btn")?.click();
          const blob = await waitUntil(() => win.__scorecardAcceptance?.blobs?.find((value) => value.type === "application/json"), "Complete backup was not created.");
          const backup = JSON.parse(await blob.text());
          const card = doc.querySelector(".backup-settings-card");
          const rect = card?.getBoundingClientRect();
          const responsive = {
            horizontalOverflow: doc.documentElement.scrollWidth > doc.documentElement.clientWidth + 1,
            cardWithinViewport: Boolean(rect && rect.left >= -1 && rect.right <= doc.documentElement.clientWidth + 1)
          };
          const dialogs = [...doc.querySelectorAll("dialog")];
          const firstInteractive = doc.body.querySelector('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])');
          const accessibility = {
            skipLinkFirst: firstInteractive?.classList.contains("skip-link") === true,
            namedDialogs: dialogs.length > 0 && dialogs.every((dialog) => {
              const labelId = dialog.getAttribute("aria-labelledby");
              return Boolean(labelId && doc.getElementById(labelId));
            })
          };
          publish({
            ok: true,
            identity,
            desktop,
            appearance: { light: lightAppearance, dark: darkAppearance, system: systemAppearance },
            restoreModal,
            responsive,
            accessibility,
            backup: {
              format: backup.format,
              formatVersion: backup.formatVersion,
              scope: backup.scope,
              applicationVersion: backup.source?.applicationVersion,
              build: backup.source?.build,
              settingsArray: Array.isArray(backup.settings),
              layoutsArray: Array.isArray(backup.layouts),
              pdfTemplatesArray: Array.isArray(backup.pdfTemplates)
            },
            errors: win.__scorecardAcceptance?.errors || []
          });
        } catch (error) {
          publish({ ok: false, error: error.message, errors: win.__scorecardAcceptance?.errors || [] });
        }
      });
    </script></body></html>`;
}

async function startStaticServer(root) {
  const indexHtml = await readFile(join(root, "index.html"), "utf8");
  const instrumentedApp = indexHtml.replace("</head>", `${acceptanceHook()}</head>`);
  const wrapper = acceptancePage();
  const heldResponses = [];
  const rootPrefix = `${normalize(root)}${process.platform === "win32" ? "\\" : "/"}`;
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || "/", "http://127.0.0.1").pathname);
      if (pathname === "/__hold__") {
        heldResponses.push(response);
        return;
      }
      if (pathname === "/__done__") {
        while (heldResponses.length) {
          const held = heldResponses.shift();
          held.writeHead(204);
          held.end();
        }
        response.writeHead(204);
        response.end();
        return;
      }
      if (pathname === "/__acceptance__.html") {
        response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": "text/html; charset=utf-8" });
        response.end(wrapper);
        return;
      }
      if (pathname === "/__app__.html") {
        response.writeHead(200, { "Cache-Control": "no-store", "Content-Type": "text/html; charset=utf-8" });
        response.end(instrumentedApp);
        return;
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const filePath = normalize(resolve(root, relative));
      if (!`${filePath}`.startsWith(rootPrefix)) throw new Error("Path is outside the application root.");
      const body = await readFile(filePath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": MIME_TYPES.get(extname(filePath).toLowerCase()) || "application/octet-stream"
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  return { server, port: server.address().port };
}

async function runHeadlessPage(browser, url, width, height) {
  const profileDir = await mkdtemp(join(tmpdir(), "scorecard-browser-profile-"));
  try {
    return await new Promise((resolveRun, reject) => {
      const child = spawn(browser.path, [
        "--headless=new",
        `--user-data-dir=${profileDir}`,
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-gpu",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-breakpad",
        "--disable-crash-reporter",
        "--noerrdialogs",
        "--run-all-compositor-stages-before-draw",
        `--window-size=${width},${height}`,
        "--dump-dom",
        url
      ], { windowsHide: true });
      let stdout = "";
      let stderr = "";
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`${browser.label} timed out at ${width}x${height}.`));
      }, 30000);
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`${browser.label} exited with code ${code}: ${stderr.trim()}`));
          return;
        }
        const encoded = stdout.match(/data-result="([^"]+)"/)?.[1];
        if (!encoded) {
          if (!stdout.trim() && !stderr.trim()) {
            reject(new HeadlessUnavailableError(`${browser.label} returned no headless DOM output.`));
            return;
          }
          reject(new Error(`${browser.label} produced no acceptance result at ${width}x${height}. stderr=${stderr.trim()} stdout=${stdout.slice(0, 1000)}`));
          return;
        }
        resolveRun(JSON.parse(Buffer.from(encoded, "base64").toString("utf8")));
      });
    });
  } finally {
    await rm(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

function assertAcceptance(result, browser, viewport) {
  assert.equal(result.ok, true, `${browser.label} ${viewport}: ${result.error || "acceptance failed"} ${JSON.stringify(result.errors || [])}`);
  assert.equal(result.identity || "", "0.4.0");
  assert.deepEqual(result.desktop, {
    storage: "IndexedDB ready",
    completeEnabled: true,
    layoutDisabled: true,
    fileEnabled: true
  });
  assert.equal(result.appearance.light.preference, "light");
  assert.equal(result.appearance.light.theme, "light");
  assert.equal(result.appearance.light.startupMirror, "light");
  assert.equal(result.appearance.dark.preference, "dark");
  assert.equal(result.appearance.dark.theme, "dark");
  assert.equal(result.appearance.dark.startupMirror, "dark");
  assert.equal(result.appearance.system.preference, "system");
  assert.match(result.appearance.system.theme, /^(light|dark)$/);
  assert.equal(result.appearance.system.startupMirror, "system");
  assert.notEqual(result.appearance.light.text, result.appearance.dark.text);
  assert.notEqual(result.appearance.light.background, result.appearance.dark.background);
  for (const appearance of ["light", "dark"]) {
    for (const view of ["home", "gameday", "layouts", "settings"]) {
      assert.deepEqual(result.appearance[appearance].views[view], { visible: true, horizontalOverflow: false });
    }
  }
  assert.deepEqual(result.backup, {
    format: "scorecard-studio-backup",
    formatVersion: 1,
    scope: "complete",
    applicationVersion: "0.4.0",
    build: "004.9",
    settingsArray: true,
    layoutsArray: true,
    pdfTemplatesArray: true
  });
  assert.deepEqual(result.restoreModal, {
    initialStep: "Step 1 of 3 · Choose",
    withinViewport: true,
    horizontalOverflow: false,
    initialFocus: "backup-restore-dialog-title"
  });
  assert.equal(result.responsive.horizontalOverflow, false);
  assert.equal(result.responsive.cardWithinViewport, true);
  assert.deepEqual(result.accessibility, { skipLinkFirst: true, namedDialogs: true });
  assert.deepEqual(result.errors, []);
}

const options = parseArguments(process.argv.slice(2));
const browsers = options.browsers.length ? options.browsers : await discoverWindowsBrowsers();
assert.ok(browsers.length, "No supported local browser executable was found. Use --browser=Label|absolute-path.");
for (const browser of browsers) assert.ok(browser.label && browser.path, "Every browser entry needs a label and executable path.");

const { server, port } = await startStaticServer(options.root);
try {
  const acceptanceUrl = `http://127.0.0.1:${port}/__acceptance__.html`;
  const results = [];
  for (const browser of browsers) {
    try {
      process.stderr.write(`[${browser.label}] desktop acceptance\n`);
      const desktop = await runHeadlessPage(browser, acceptanceUrl, 1280, 900);
      assertAcceptance(desktop, browser, "desktop");
      process.stderr.write(`[${browser.label}] narrow acceptance\n`);
      const narrow = await runHeadlessPage(browser, acceptanceUrl, 390, 844);
      assertAcceptance(narrow, browser, "narrow");
      results.push({ browser: browser.label, status: "accepted", desktop, narrow });
    } catch (error) {
      if (!(error instanceof HeadlessUnavailableError)) throw error;
      results.push({ browser: browser.label, status: "manual-required", reason: error.message });
    }
  }
  assert.ok(results.some((result) => result.status === "accepted"), "No local browser completed automated acceptance.");
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
