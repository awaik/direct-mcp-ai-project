#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourceRoot = path.join(root, "skills-source");

const targets = [
  { dir: ".codex/skills", skillFile: "SKILL.md" },
  { dir: ".claude/skills", skillFile: "SKILL.md" },
  { dir: ".agents/skills", skillFile: "skill.md" },
  { dir: ".openclaw/skills", skillFile: "SKILL.md" },
];

function parseFrontmatter(markdown, skillName) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${skillName}: missing YAML frontmatter`);
  const frontmatter = match[1];
  const name = frontmatter.match(/^name:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const descLine = frontmatter.match(/^description:\s*"?([^"\n]+)"?\s*$/m)?.[1]?.trim();
  const descBlock = frontmatter.match(/^description:\s*>\-\n((?:  .+\n?)+)/m)?.[1]
    ?.split("\n")
    .map((line) => line.replace(/^  /, "").trim())
    .filter(Boolean)
    .join(" ");
  const description = descLine || descBlock || "";
  if (!name) throw new Error(`${skillName}: missing name in frontmatter`);
  if (!description) throw new Error(`${skillName}: missing description in frontmatter`);
  if (name !== skillName) throw new Error(`${skillName}: folder name must match frontmatter name`);
  return { name, description };
}

function displayName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortDescription(description) {
  const clean = description.replace(/\s+/g, " ").trim();
  return clean.length <= 64 ? clean : `${clean.slice(0, 61).trim()}...`;
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function openaiYaml(meta) {
  return [
    `name: ${yamlQuote(meta.name)}`,
    `description: ${yamlQuote(meta.description)}`,
    "version: 1",
    "interface:",
    `  display_name: ${yamlQuote(displayName(meta.name))}`,
    `  short_description: ${yamlQuote(shortDescription(meta.description))}`,
    `  default_prompt: ${yamlQuote(`Используй $${meta.name} для безопасного workflow LidFly MCP v3.`)}`,
    "",
  ].join("\n");
}

function copyDirWithoutGenerated(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name === "__pycache__" || entry.name.endsWith(".pyc")) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirWithoutGenerated(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(sourceRoot)) {
  throw new Error(`skills-source not found: ${sourceRoot}`);
}

const skills = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const skill of skills) {
  const sourceSkill = path.join(sourceRoot, skill);
  const skillPath = path.join(sourceSkill, "SKILL.md");
  if (!fs.existsSync(skillPath)) throw new Error(`${skill}: missing SKILL.md`);
  parseFrontmatter(fs.readFileSync(skillPath, "utf8"), skill);
}

for (const target of targets) {
  const targetRoot = path.join(root, target.dir);
  fs.rmSync(targetRoot, { recursive: true, force: true });
  fs.mkdirSync(targetRoot, { recursive: true });

  for (const skill of skills) {
    const sourceSkill = path.join(sourceRoot, skill);
    const targetSkill = path.join(targetRoot, skill);
    copyDirWithoutGenerated(sourceSkill, targetSkill);

    const sourceSkillPath = path.join(targetSkill, "SKILL.md");
    const targetSkillPath = path.join(targetSkill, target.skillFile);
    const markdown = fs.readFileSync(sourceSkillPath, "utf8");
    const meta = parseFrontmatter(markdown, skill);
    if (target.skillFile !== "SKILL.md") {
      fs.renameSync(sourceSkillPath, targetSkillPath);
    }
    fs.writeFileSync(path.join(targetSkill, "openai.yaml"), openaiYaml(meta));
  }
}

console.log(`Synced ${skills.length} skills to ${targets.length} client directories.`);
