#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relativeSkill = "lidfly-support-escalation/SKILL.md";
const source = fs.readFileSync(path.join(root, "skills-source", relativeSkill), "utf8");
const agents = fs.readFileSync(path.join(
  root,
  "skills-source/lidfly-support-escalation/agents/openai.yaml",
), "utf8");
const rootInstructions = [
  fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"),
  fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8"),
];

assert.match(source, /^---\nname: lidfly-support-escalation\ndescription: ".+"\n---\n/);
assert.match(source, /support_hint\.reason=unexpected_internal_error/);
assert.match(source, /Первый timeout read-вызова[\s\S]*один раз безопасно повторить/);
assert.match(source, /Timeout write-вызова[\s\S]*не повторять автоматически/);
assert.match(source, /search_tools\(\{\}\)[\s\S]*широк/i);
assert.match(source, /support_prepare_report\(\{/);
assert.match(source, /полный `report_text`/);
assert.match(source, /явный текст/);
assert.match(source, /Не вызывать `support_send_message` в том же ходе/);
assert.match(source, /request_id: prepared\.suggested_request_id/);
assert.match(source, /не пишет в PostgreSQL/);
assert.doesNotMatch(source, /автоматически отправ/i);

assert.match(agents, /value: "lidfly"/);
assert.match(agents, /transport: "streamable_http"/);
assert.match(agents, /url: "https:\/\/lidfly\.ru\/mcp\/v3"/);

for (const instructions of rootInstructions) {
  assert.match(instructions, /\$lidfly-support-escalation/);
  assert.match(instructions, /support_prepare_report` — прямой read-only инструмент v3/);
  assert.match(instructions, /Auto-approve[\s\S]*не заменяет согласие пользователя/);
  assert.match(instructions, /write-вызов не повторяй автоматически/);
}

for (const clientRoot of [".agents/skills", ".codex/skills", ".claude/skills", ".openclaw/skills"]) {
  const copy = fs.readFileSync(path.join(root, clientRoot, relativeSkill), "utf8");
  assert.equal(copy, source, `${clientRoot} support escalation skill is stale`);
}

console.log("LidFly support escalation skill tests passed");
