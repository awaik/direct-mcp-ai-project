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

function markdownSection(document, heading) {
  const marker = `${heading}\n`;
  const start = document.indexOf(marker);
  assert.notEqual(start, -1, `${heading}: section missing`);
  const level = heading.match(/^#+/)?.[0].length;
  assert.ok(level, `${heading}: invalid Markdown heading`);
  const remainder = document.slice(start + marker.length);
  const nextHeading = remainder.search(new RegExp(`^#{1,${level}}\\s`, "m"));
  return nextHeading === -1 ? remainder : remainder.slice(0, nextHeading);
}

const transportSection = markdownSection(
  source,
  "## Восстановить Транспорт Без Ложной Ошибки Провайдера",
);

assert.match(source, /^---\nname: lidfly-support-escalation\ndescription: ".+"\n---\n/);
assert.match(source, /support_hint\.reason=unexpected_internal_error/);
assert.match(source, /Первый timeout read-вызова[\s\S]*один раз безопасно повторить/);
assert.match(source, /transport send error/);
assert.match(source, /HTTP request failed/);
assert.match(source, /транспортн.*неопредел/i);
assert.match(source, /subscription_status/);
assert.match(source, /соединение восстановлено[\s\S]*исходн.*read/i);
assert.match(source, /не считать[\s\S]*ошибкой Wordstat/i);
assert.match(source, /support_prepare_report[\s\S]*endpoint снова отвечает[\s\S]*повтори исходный read/i);
assert.match(source, /Timeout write-вызова[\s\S]*не повторять автоматически/);
assert.match(source, /search_tools\(\{\}\)[\s\S]*широк/i);
assert.match(source, /support_prepare_report\(\{/);
assert.match(source, /полный `report_text`/);
assert.match(source, /явный текст/);
assert.match(source, /Не вызывать `support_send_message` в том же ходе/);
assert.match(source, /request_id: prepared\.suggested_request_id/);
assert.match(source, /не пишет в PostgreSQL/);
assert.match(source, /unsupported_by_provider_api/);
assert.match(source, /не эскалир/i);
assert.doesNotMatch(source, /автоматически отправ/i);
assert.deepEqual(
  [...transportSection.matchAll(/^([0-9]+)\. /gm)].map((match) => Number(match[1])),
  [1, 2, 3, 4],
  "transport recovery must keep Retry-After outside the no-response steps",
);
assert.match(
  transportSection,
  /Отдельная ветка[\s\S]*HTTP 429[\s\S]*503[\s\S]*Retry-After[\s\S]*шаги 1–4[\s\S]*не выполнять[\s\S]*вместо connectivity probe/i,
);

assert.match(agents, /value: "lidfly"/);
assert.match(agents, /transport: "streamable_http"/);
assert.match(agents, /url: "https:\/\/lidfly\.ru\/mcp\/v3"/);

for (const instructions of rootInstructions) {
  assert.match(instructions, /\$lidfly-support-escalation/);
  assert.match(instructions, /support_prepare_report` — прямой read-only инструмент v3/);
  assert.match(instructions, /Auto-approve[\s\S]*не заменяет согласие пользователя/);
  assert.match(instructions, /write-вызов не повторяй автоматически/);
  assert.match(
    instructions,
    /`subscription_status` используй только[\s\S]*connectivity\/auth probe[\s\S]*не включай его в обычный workflow/,
  );
  assert.match(instructions, /transport send error[\s\S]*subscription_status/);
  assert.match(instructions, /соединение восстановлено[\s\S]*исходн.*read/i);
  assert.match(instructions, /unsupported_by_provider_api/);
}

for (const clientRoot of [".agents/skills", ".codex/skills", ".claude/skills", ".openclaw/skills"]) {
  const copy = fs.readFileSync(path.join(root, clientRoot, relativeSkill), "utf8");
  assert.equal(copy, source, `${clientRoot} support escalation skill is stale`);
}

console.log("LidFly support escalation skill tests passed");
