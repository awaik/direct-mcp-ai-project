#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skills-source");
const skills = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(skills.length, 20, "unexpected canonical skill count");

execFileSync(process.execPath, [path.join(root, "scripts/sync-skills.mjs"), "--check"], {
  cwd: root,
  stdio: "inherit",
});

for (const skill of skills) {
  const source = fs.readFileSync(path.join(sourceRoot, skill, "SKILL.md"), "utf8");
  assert.match(source, /^---\nname: [a-z0-9-]+\ndescription: ".+"\n---\n/);
  assert.ok(
    fs.existsSync(path.join(sourceRoot, skill, "agents/openai.yaml")),
    `${skill}: agents/openai.yaml missing`,
  );

  for (const clientRoot of [".agents/skills", ".codex/skills", ".claude/skills", ".openclaw/skills"]) {
    const skillDir = path.join(root, clientRoot, skill);
    assert.equal(
      fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8"),
      source,
      `${clientRoot}/${skill} must match canonical SKILL.md`,
    );
    assert.ok(
      fs.existsSync(path.join(skillDir, "agents/openai.yaml")),
      `${clientRoot}/${skill}: agents/openai.yaml missing`,
    );
    assert.ok(
      !fs.existsSync(path.join(skillDir, "openai.yaml")),
      `${clientRoot}/${skill}: legacy root openai.yaml remains`,
    );
  }
}

assert.equal(
  fs.readdirSync(path.join(root, ".agents/skills"), { recursive: true })
    .filter((item) => path.basename(item) === "skill.md").length,
  0,
  "lowercase .agents skill.md files remain",
);

const directSkill = fs.readFileSync(
  path.join(sourceRoot, "yandex-direct-campaign-builder/SKILL.md"),
  "utf8",
);
assert.match(directSkill, /add_adgroup with adgroup_type: UNIFIED_AD_GROUP/);
assert.doesNotMatch(directSkill, /add_adgroup\/add_adgroups[\s\S]*UNIFIED_AD_GROUP/);
assert.match(directSkill, /add_adgroups.*legacy `TEXT_AD_GROUP`/);

const serpSkill = fs.readFileSync(path.join(sourceRoot, "serp-monitor/SKILL.md"), "utf8");
assert.match(serpSkill, /webmaster_get_popular_queries/);
assert.match(serpSkill, /aggregated search-performance data/);
assert.doesNotMatch(serpSkill, /configured local scripts|Yandex XML tools/i);

const aliasMetadata = fs.readFileSync(
  path.join(sourceRoot, "ai-markers-remove/agents/openai.yaml"),
  "utf8",
);
assert.match(aliasMetadata, /allow_implicit_invocation: false/);

console.log("All skill structure and workflow tests passed");
