#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRelative = "lidfly-connection-doctor/SKILL.md";
const source = fs.readFileSync(path.join(root, "skills-source", skillRelative), "utf8");
const scenarios = JSON.parse(fs.readFileSync(
  path.join(root, "scripts/fixtures/connection-doctor-scenarios.json"),
  "utf8",
));

for (const clientRoot of [".agents/skills", ".codex/skills", ".claude/skills", ".openclaw/skills"]) {
  assert.equal(
    fs.readFileSync(path.join(root, clientRoot, skillRelative), "utf8"),
    source,
    `${clientRoot} connection doctor must match canonical source`,
  );
}

for (const required of [
  "Claude Code",
  "Claude Desktop",
  "Cursor",
  "VS Code",
  "Authenticate",
  "Login",
  "connection timeout",
  "provider",
  "skills",
]) {
  assert.match(source, new RegExp(required, "i"), `connection doctor must cover ${required}`);
}

assert.match(
  source,
  /Failed[\s\S]{0,500}Authenticate[\s\S]{0,500}(ровно одно|одно действие)/i,
  "Failed + Authenticate must lead to exactly one action",
);
assert.match(
  source,
  /не переходи к provider tools|не обсуждай[\s\S]{0,120}provider tools/i,
  "provider tools must wait until MCP OAuth succeeds",
);
assert.match(
  source,
  /VS Code[\s\S]{0,500}(оболоч|host)/i,
  "VS Code must be described as a host rather than a separate mandatory connection",
);
assert.doesNotMatch(source, /\b147\b|ровно\s+\d+\s+meta-инструмент/i);

for (const scenario of scenarios) {
  assert.ok(scenario.id && scenario.client && scenario.expected_layer && scenario.expected_action);
  assert.ok(Array.isArray(scenario.signals) && scenario.signals.length > 0);
  assert.ok(Array.isArray(scenario.forbidden));
}

console.log(`Connection doctor scenarios passed: ${scenarios.length}`);
