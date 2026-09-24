#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const skillPaths = [
  "skills-source/workspace-project-manager/SKILL.md",
  ".codex/skills/workspace-project-manager/SKILL.md",
  ".claude/skills/workspace-project-manager/SKILL.md",
  ".agents/skills/workspace-project-manager/SKILL.md",
  ".openclaw/skills/workspace-project-manager/SKILL.md",
];

const canonical = readFileSync(skillPaths[0], "utf8");
for (const skillPath of skillPaths) {
  const source = readFileSync(skillPath, "utf8");
  assert.equal(source, canonical, `${skillPath} must be synchronized from the canonical skill`);
  assert.match(source, /workspace_add_tasks[^.]*manual reminder/i);
  assert.match(source, /workspace_schedule_ai_task[^.]*AI autostart/i);
  assert.match(
    source,
    /Write through `call_write_tool`:[\s\S]*workspace_add_tasks[\s\S]*workspace_schedule_ai_task/i,
  );
  assert.match(source, /new decision[^.]*workspace_add_tasks/i);
  assert.match(source, /objects, actions, values[^.]*conditional branches[^.]*workspace_schedule_ai_task/i);
  assert.match(source, /which type[^.]*automatically[^.]*user/i);
  assert.match(source, /workspace_prepare_project_deletion[\s\S]*workspace_delete_project/i);
  assert.match(source, /explicit textual confirmation/i);
  assert.match(source, /expected_project_name[\s\S]*expected_updated_at/i);
  assert.match(source, /never allowed in an AI autostart/i);
}

const agents = readFileSync("AGENTS.md", "utf8");
const claude = readFileSync("CLAUDE.md", "utf8");
assert.equal(agents, claude, "AGENTS.md and CLAUDE.md must remain paired");
for (const source of [agents, claude]) {
  assert.match(source, /workspace_add_tasks[^.]*ручн[^.]*напомин/i);
  assert.match(source, /workspace_schedule_ai_task[^.]*AI-автозапуск/i);
  assert.match(source, /нов[^.]*решен[^.]*workspace_add_tasks/i);
  assert.match(source, /После создания[^.]*тип[^.]*автоматическ[^.]*пользовател/i);
}

const campaignTemplate = readFileSync("campaigns/template.md", "utf8");
assert.match(campaignTemplate, /Будущая проверка, после которой нужно решение[^\n]*workspace_add_tasks/);
assert.match(campaignTemplate, /Заранее одобренное автоматическое действие[^\n]*workspace_schedule_ai_task/);

console.log("Workspace project manager instructions passed");
