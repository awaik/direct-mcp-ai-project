#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRelative = "lidfly-connection-doctor/SKILL.md";
const source = fs.readFileSync(path.join(root, "skills-source", skillRelative), "utf8");
const body = source.replace(/^---\n[\s\S]*?\n---\n/, "");
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
  "OpenCode",
  "VS Code",
  "Authenticate",
  "Login",
  "connection timeout",
  "provider",
  "skills",
]) {
  assert.match(body, new RegExp(required, "i"), `connection doctor must cover ${required}`);
}

assert.match(
  body,
  /Failed[\s\S]{0,500}Authenticate[\s\S]{0,500}(ровно одно|одно действие)/i,
  "Failed + Authenticate must lead to exactly one action",
);
assert.match(
  body,
  /не переходи к provider tools|не обсуждай[\s\S]{0,120}provider tools/i,
  "provider tools must wait until MCP OAuth succeeds",
);
assert.match(
  body,
  /VS Code[\s\S]{0,500}(оболоч|host)/i,
  "VS Code must be described as a host rather than a separate mandatory connection",
);
assert.doesNotMatch(body, /\b147\b|ровно\s+\d+\s+meta-инструмент/i);
assert.match(
  body,
  /Streamable HTTP[\s\S]{0,200}fallback[\s\S]{0,120}405[\s\S]{0,120}вторичен/i,
  "OpenCode fallback SSE 405 must be recognized as a secondary error",
);
assert.match(
  body,
  /headers\.Authorization[\s\S]{0,500}перекрывает OAuth-токен/i,
  "OpenCode static Authorization conflicts must have an OAuth recovery action",
);
assert.match(
  body,
  /legacy_or_unknown_bearer[\s\S]{0,800}(config|конфигурац)/i,
  "the doctor must map a legacy bearer received during expected OAuth to the config layer",
);
assert.match(
  body,
  /oauth_access_token[\s\S]{0,800}(mcp_oauth|повтори.*вход|обнови.*OAuth)/i,
  "the doctor must distinguish an expired OAuth token from a static-header conflict",
);
assert.match(
  body,
  /"oauth": false[\s\S]{0,240}отключает OAuth/i,
  "OpenCode recovery must account for explicitly disabled OAuth",
);
assert.match(
  body,
  /opencode mcp debug lidfly[\s\S]{0,180}HTTP[\s\S]{0,120}OAuth discovery/i,
  "OpenCode diagnostics must use the built-in MCP debugger",
);
assert.match(
  body,
  /timeout[\s\S]{0,240}5000 мс[\s\S]{0,240}30000/i,
  "OpenCode catalog timeout recovery must document the default and a scoped override",
);

const layerEvidence = {
  config: "### Config отсутствует или неверен",
  mcp_oauth: "### Ожидается MCP OAuth",
  transport: "### Connection timeout",
  provider_connection: "### MCP работает, provider не подключён",
  skills: "### Skills отсутствуют или устарели",
};

for (const scenario of scenarios) {
  assert.ok(scenario.id && scenario.client && scenario.expected_layer && scenario.expected_action);
  assert.ok(Array.isArray(scenario.signals) && scenario.signals.length > 0);
  assert.ok(Array.isArray(scenario.forbidden));
  assert.ok(
    layerEvidence[scenario.expected_layer],
    `${scenario.id}: unsupported expected_layer ${scenario.expected_layer}`,
  );
  assert.ok(
    body.includes(layerEvidence[scenario.expected_layer]),
    `${scenario.id}: expected layer is not documented`,
  );
  assert.ok(
    body.includes(scenario.expected_action),
    `${scenario.id}: expected action is not documented`,
  );
  for (const forbidden of scenario.forbidden) {
    assert.ok(
      body.includes(forbidden),
      `${scenario.id}: missing prohibition: ${forbidden}`,
    );
  }
}

console.log(`Connection doctor scenarios passed: ${scenarios.length}`);
