#!/usr/bin/env node

/**
 * Scorecard Studio v0.3.0 API discovery evidence utility.
 *
 * This investigation-only tool captures focused JSON evidence from approved
 * public MLB hosts. It stores selected JSON Pointer values plus a hash of the
 * complete response; it never writes the complete response body.
 */

import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ALLOWED_HOSTS = new Set(["statsapi.mlb.com", "www.mlbstatic.com"]);
const EVIDENCE_KINDS = new Set(["live-snapshot", "historical-current", "recorded-prior"]);
const FIXTURE_ROOT = path.resolve(process.cwd(), "tests", "fixtures", "api-discovery");

export function getJsonPointer(root, pointer) {
  if (pointer === "") return { found: true, value: root };
  if (!String(pointer).startsWith("/")) throw new Error(`JSON Pointer must start with '/': ${pointer}`);
  const tokens = String(pointer)
    .slice(1)
    .split("/")
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
  let value = root;
  for (const token of tokens) {
    if (value === null || value === undefined || !Object.prototype.hasOwnProperty.call(Object(value), token)) {
      return { found: false, value: null };
    }
    value = value[token];
  }
  return { found: true, value };
}

export function compareEvidence(left, right) {
  const leftValues = left?.selection?.values || {};
  const rightValues = right?.selection?.values || {};
  const pointers = [...new Set([...Object.keys(leftValues), ...Object.keys(rightValues)])].sort();
  const differences = [];
  for (const pointer of pointers) {
    const leftValue = leftValues[pointer] ?? { found: false, value: null };
    const rightValue = rightValues[pointer] ?? { found: false, value: null };
    if (JSON.stringify(leftValue) !== JSON.stringify(rightValue)) {
      differences.push({ pointer, left: leftValue, right: rightValue });
    }
  }
  return {
    schemaVersion: 1,
    leftCaptureId: left?.captureId ?? null,
    rightCaptureId: right?.captureId ?? null,
    comparedPointers: pointers.length,
    matchingSelections: differences.length === 0,
    differences
  };
}

function parseOptions(args) {
  const options = { pointer: [], note: [] };
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (key === "fail-on-difference") {
      options[key] = true;
      continue;
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    index += 1;
    if (key === "pointer" || key === "note") options[key].push(value);
    else options[key] = value;
  }
  return options;
}

function required(options, key) {
  const value = String(options[key] || "").trim();
  if (!value) throw new Error(`Missing required --${key}`);
  return value;
}

function validateCaptureOptions(options) {
  const requestUrl = new URL(required(options, "url"));
  if (requestUrl.protocol !== "https:") throw new Error("Evidence requests must use HTTPS.");
  if (!ALLOWED_HOSTS.has(requestUrl.hostname)) throw new Error(`Host is not approved for discovery capture: ${requestUrl.hostname}`);

  const investigationId = required(options, "investigation");
  if (!/^DISC-\d{3}$/.test(investigationId)) throw new Error("Investigation ID must match DISC-NNN.");

  const captureId = required(options, "capture-id");
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(captureId)) throw new Error("Capture ID contains unsupported characters.");

  const evidenceKind = required(options, "evidence-kind");
  if (!EVIDENCE_KINDS.has(evidenceKind)) throw new Error(`Unsupported evidence kind: ${evidenceKind}`);

  const outputName = required(options, "output");
  if (path.basename(outputName) !== outputName || !outputName.endsWith(".json")) {
    throw new Error("--output must be a JSON filename without directory components.");
  }

  const pointers = [...new Set(options.pointer || [])];
  if (!pointers.length) throw new Error("At least one --pointer is required; full response capture is intentionally unsupported.");

  return { requestUrl, investigationId, captureId, evidenceKind, outputName, pointers };
}

function validateAssetOptions(options) {
  const requestUrl = new URL(required(options, "url"));
  if (requestUrl.protocol !== "https:") throw new Error("Evidence requests must use HTTPS.");
  if (!ALLOWED_HOSTS.has(requestUrl.hostname)) throw new Error(`Host is not approved for discovery capture: ${requestUrl.hostname}`);

  const investigationId = required(options, "investigation");
  if (!/^DISC-\d{3}$/.test(investigationId)) throw new Error("Investigation ID must match DISC-NNN.");
  const captureId = required(options, "capture-id");
  if (!/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(captureId)) throw new Error("Capture ID contains unsupported characters.");
  const evidenceKind = required(options, "evidence-kind");
  if (!EVIDENCE_KINDS.has(evidenceKind)) throw new Error(`Unsupported evidence kind: ${evidenceKind}`);
  const outputName = required(options, "output");
  if (path.basename(outputName) !== outputName || !outputName.endsWith(".json")) {
    throw new Error("--output must be a JSON filename without directory components.");
  }
  return { requestUrl, investigationId, captureId, evidenceKind, outputName };
}

async function capture(options) {
  const validated = validateCaptureOptions(options);
  const startedAt = new Date();
  const response = await fetch(validated.requestUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store"
  });
  const body = await response.text();
  const completedAt = new Date();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`Response was not JSON (HTTP ${response.status}, content-type ${response.headers.get("content-type") || "unknown"}).`);
  }

  const values = {};
  for (const pointer of validated.pointers) values[pointer] = getJsonPointer(parsed, pointer);

  const evidence = {
    schemaVersion: 1,
    captureId: validated.captureId,
    investigationId: validated.investigationId,
    evidenceKind: validated.evidenceKind,
    capturedAtUtc: completedAt.toISOString(),
    context: {
      subject: String(options.subject || "").trim() || null,
      gameState: String(options["game-state"] || "").trim() || null
    },
    request: {
      method: "GET",
      url: validated.requestUrl.toString(),
      headers: { Accept: "application/json" }
    },
    response: {
      status: response.status,
      ok: response.ok,
      durationMs: completedAt.getTime() - startedAt.getTime(),
      headers: {
        contentType: response.headers.get("content-type"),
        cacheControl: response.headers.get("cache-control"),
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified")
      },
      bodyBytes: Buffer.byteLength(body),
      bodySha256: createHash("sha256").update(body).digest("hex")
    },
    selection: {
      jsonPointers: validated.pointers,
      values
    },
    notes: (options.note || []).map((note) => String(note).trim()).filter(Boolean)
  };

  await mkdir(FIXTURE_ROOT, { recursive: true });
  const outputPath = path.join(FIXTURE_ROOT, validated.outputName);
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ outputPath, captureId: evidence.captureId, status: response.status, selectedPointers: validated.pointers.length }, null, 2)}\n`);
  if (!response.ok) process.exitCode = 2;
}

function svgMetadata(body) {
  const root = body.match(/<svg\b([^>]*)>/i);
  const attribute = (name) => root?.[1]?.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? null;
  return {
    isSvg: Boolean(root),
    viewBox: attribute("viewBox"),
    width: attribute("width"),
    height: attribute("height"),
    transparentCanvasByDefault: Boolean(root),
    hasOpacityAttributes: /\b(?:opacity|fill-opacity|stroke-opacity)\s*=/i.test(body),
    hasRasterImage: /<image\b/i.test(body),
    hasStyleElement: /<style\b/i.test(body),
    hasTitle: /<title\b/i.test(body)
  };
}

async function captureAsset(options) {
  const validated = validateAssetOptions(options);
  const startedAt = new Date();
  const response = await fetch(validated.requestUrl, { method: "GET", headers: { Accept: "image/svg+xml,*/*" }, redirect: "follow", cache: "no-store" });
  const body = await response.text();
  const completedAt = new Date();
  const asset = svgMetadata(body);
  const evidence = {
    schemaVersion: 1,
    captureId: validated.captureId,
    investigationId: validated.investigationId,
    evidenceKind: validated.evidenceKind,
    capturedAtUtc: completedAt.toISOString(),
    context: { subject: String(options.subject || "").trim() || null, gameState: null },
    request: { method: "GET", url: validated.requestUrl.toString(), headers: { Accept: "image/svg+xml,*/*" } },
    response: {
      status: response.status,
      ok: response.ok,
      durationMs: completedAt.getTime() - startedAt.getTime(),
      finalUrl: response.url,
      redirected: response.redirected,
      headers: {
        contentType: response.headers.get("content-type"),
        cacheControl: response.headers.get("cache-control"),
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
        accessControlAllowOrigin: response.headers.get("access-control-allow-origin")
      },
      bodyBytes: Buffer.byteLength(body),
      bodySha256: createHash("sha256").update(body).digest("hex")
    },
    selection: { jsonPointers: ["/asset"], values: { "/asset": { found: true, value: asset } } },
    notes: (options.note || []).map((note) => String(note).trim()).filter(Boolean)
  };
  await mkdir(FIXTURE_ROOT, { recursive: true });
  const outputPath = path.join(FIXTURE_ROOT, validated.outputName);
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  process.stdout.write(`${JSON.stringify({ outputPath, captureId: evidence.captureId, status: response.status, asset }, null, 2)}\n`);
}

async function compare(options) {
  const leftPath = path.resolve(required(options, "left"));
  const rightPath = path.resolve(required(options, "right"));
  const [left, right] = await Promise.all([
    readFile(leftPath, "utf8").then(JSON.parse),
    readFile(rightPath, "utf8").then(JSON.parse)
  ]);
  const result = compareEvidence(left, right);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (options["fail-on-difference"] && !result.matchingSelections) process.exitCode = 3;
}

function usage() {
  return `Usage:
  node tools/api-discovery-capture.mjs capture --url <https-url> --investigation DISC-NNN \\
    --capture-id <id> --evidence-kind <live-snapshot|historical-current|recorded-prior> \\
    --subject <text> --game-state <text> --output <file.json> --pointer </json/pointer> [--pointer ...] [--note ...]

  node tools/api-discovery-capture.mjs compare --left <capture.json> --right <capture.json> [--fail-on-difference]

  node tools/api-discovery-capture.mjs capture-asset --url <https-url> --investigation DISC-NNN \
    --capture-id <id> --evidence-kind <kind> --subject <text> --output <file.json> [--note ...]
`;
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "help") {
    process.stdout.write(usage());
    return;
  }
  const options = parseOptions(args);
  if (command === "capture") return capture(options);
  if (command === "capture-asset") return captureAsset(options);
  if (command === "compare") return compare(options);
  throw new Error(`Unknown command: ${command}\n${usage()}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
