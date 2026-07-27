#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skills-source");
const skills = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(skills.length, 21, "unexpected canonical skill count");

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

for (const relativePath of fs.readdirSync(sourceRoot, { recursive: true })) {
  if (!relativePath.endsWith(".md")) continue;
  const source = fs.readFileSync(path.join(sourceRoot, relativePath), "utf8");
  assert.doesNotMatch(
    source,
    /`(?:LEGAL|PROJECTS)\.md`/,
    `${relativePath}: external project-only reference remains`,
  );
}

const pluginFixtureRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "lidfly-plugin-skills-sync-"),
);
try {
  const pluginRoot = path.join(pluginFixtureRoot, "plugins/lidfly");
  const pluginSkills = path.join(pluginRoot, "skills");
  fs.mkdirSync(path.join(pluginRoot, ".codex-plugin"), { recursive: true });
  fs.writeFileSync(
    path.join(pluginRoot, ".codex-plugin/plugin.json"),
    `${JSON.stringify({ name: "lidfly", skills: "./skills/" }, null, 2)}\n`,
  );
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/sync-skills.mjs"),
      "--plugin-target",
      pluginSkills,
    ],
    { cwd: root, stdio: "pipe" },
  );
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/sync-skills.mjs"),
      "--check",
      "--plugin-target",
      pluginSkills,
    ],
    { cwd: root, stdio: "pipe" },
  );
  assert.equal(
    fs.readdirSync(pluginSkills, { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).length,
    21,
    "plugin target must contain all canonical skills",
  );

  fs.writeFileSync(path.join(pluginSkills, "unexpected.txt"), "preserve me");
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [
          path.join(root, "scripts/sync-skills.mjs"),
          "--plugin-target",
          pluginSkills,
        ],
        { cwd: root, stdio: "pipe" },
    ),
    "plugin sync must refuse an unmanaged target file",
  );
  fs.unlinkSync(path.join(pluginSkills, "unexpected.txt"));

  const generatedManifestPath = path.join(
    pluginSkills,
    ".lidfly-generated-skills.json",
  );
  const generatedManifest = JSON.parse(
    fs.readFileSync(generatedManifestPath, "utf8"),
  );
  generatedManifest.skills["escaped-skill"] = {
    "../outside.txt": "a".repeat(64),
  };
  fs.writeFileSync(
    generatedManifestPath,
    `${JSON.stringify(generatedManifest, null, 2)}\n`,
  );
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [
          path.join(root, "scripts/sync-skills.mjs"),
          "--plugin-target",
          pluginSkills,
        ],
        { cwd: root, stdio: "pipe" },
      ),
    "plugin sync must reject traversal in a previous generated manifest",
  );
} finally {
  fs.rmSync(pluginFixtureRoot, { recursive: true });
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

const editorialSkill = fs.readFileSync(
  path.join(sourceRoot, "human-editorial-polish/SKILL.md"),
  "utf8",
);
assert.match(editorialSkill, /`references\/russian-patterns\.md`/);
assert.match(editorialSkill, /^## Подготовка$/m);
assert.match(editorialSkill, /^## Калибровка по жанру$/m);
assert.match(editorialSkill, /^## Рабочий цикл$/m);
assert.match(editorialSkill, /^## Смысл и структура$/m);
assert.match(editorialSkill, /^## Защита от переусердствования$/m);
assert.match(editorialSkill, /^## Режим результата$/m);
assert.doesNotMatch(editorialSkill, /запретить длинное тире|заменить «ёлочки»/i);

const editorialPatterns = fs.readFileSync(
  path.join(sourceRoot, "human-editorial-polish/references/russian-patterns.md"),
  "utf8",
);
const patternNumbers = [
  ...editorialPatterns.matchAll(/^### ([0-9]+)\. /gm),
].map((match) => Number(match[1]));
assert.deepEqual(
  patternNumbers,
  Array.from({ length: patternNumbers.length }, (_, index) => index + 1),
  "human-editorial-polish Russian pattern groups must use contiguous numbering",
);
assert.ok(
  patternNumbers.length >= 18,
  "human-editorial-polish must keep at least 18 Russian pattern groups",
);
assert.match(editorialPatterns, /## Ложные срабатывания/);
assert.match(editorialPatterns, /русские типографские кавычки «ёлочки»/);
assert.match(editorialPatterns, /Если текст уже конкретен[\s\S]*не переписывать его/);

const aliasSkill = fs.readFileSync(
  path.join(sourceRoot, "ai-markers-remove/SKILL.md"),
  "utf8",
);
assert.match(aliasSkill, /\$human-editorial-polish/);
assert.match(aliasSkill, /^# AI Markers Remove:/m);
assert.match(aliasSkill, /^## Основной путь$/m);
assert.match(aliasSkill, /^## Резервные инварианты безопасности$/m);
assert.doesNotMatch(aliasSkill, /^## (?:Рабочий цикл|Результат)$/m);
assert.doesNotMatch(aliasSkill, /^1\. Определить задачу/m);
assert.match(aliasSkill, /отказаться только от обхода/);
assert.doesNotMatch(aliasSkill, /Treat it as/);

console.log("All skill structure and workflow tests passed");
