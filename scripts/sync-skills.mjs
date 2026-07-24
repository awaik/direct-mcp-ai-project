#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const sourceRoot = path.join(root, "skills-source");
const manifestName = ".lidfly-generated-skills.json";

function usage() {
  return `Usage:
  node scripts/sync-skills.mjs [--check] [--plugin-target <skills-directory>]

Options:
  --check           Validate generated copies without changing files.
  --plugin-target   Also sync an existing LidFly plugin's skills directory.
  --help, -h        Show this help.
`;
}

let checkOnly = false;
let pluginTargetArgument = null;
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--check") {
    checkOnly = true;
    continue;
  }
  if (argument === "--plugin-target") {
    if (pluginTargetArgument !== null) {
      throw new Error("--plugin-target may be provided only once");
    }
    pluginTargetArgument = args[index + 1];
    if (!pluginTargetArgument || pluginTargetArgument.startsWith("--")) {
      throw new Error("--plugin-target requires a skills directory");
    }
    index += 1;
    continue;
  }
  if (argument === "--help" || argument === "-h") {
    console.log(usage());
    process.exit(0);
  }
  throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
}

const targets = [
  { dir: ".agents/skills", legacySkillFile: "skill.md" },
  { dir: ".codex/skills", legacySkillFile: "skill.md" },
  { dir: ".claude/skills", legacySkillFile: "skill.md" },
  { dir: ".openclaw/skills", legacySkillFile: "skill.md" },
];

function resolvePluginTarget(rawTarget) {
  const targetRoot = path.resolve(process.cwd(), rawTarget);
  if (path.basename(targetRoot) !== "skills") {
    throw new Error("--plugin-target must point to the plugin's skills directory");
  }

  const pluginRoot = path.dirname(targetRoot);
  const pluginManifestPath = path.join(pluginRoot, ".codex-plugin", "plugin.json");
  if (!fs.existsSync(pluginManifestPath)) {
    throw new Error(`LidFly plugin manifest not found: ${pluginManifestPath}`);
  }

  const plugin = JSON.parse(readText(pluginManifestPath));
  if (plugin.name !== "lidfly") {
    throw new Error(`Expected LidFly plugin at ${pluginRoot}`);
  }
  if (plugin.skills !== undefined && plugin.skills !== "./skills/") {
    throw new Error(`LidFly plugin has unsupported skills path: ${plugin.skills}`);
  }

  return targetRoot;
}

if (pluginTargetArgument !== null) {
  const pluginTargetRoot = resolvePluginTarget(pluginTargetArgument);
  targets.push({
    dir: pluginTargetRoot,
    label: pluginTargetRoot,
    legacySkillFile: null,
    strictGeneratedOnly: true,
  });
}

const mcpSkills = new Set([
  "article-writer",
  "avito-ads",
  "demand-research",
  "export-ad-reports",
  "lidfly-site-commerce",
  "lidfly-support-escalation",
  "mcp-v3-provider-context",
  "semantic-core",
  "seo-optimizer",
  "serp-monitor",
  "video-article-writer",
  "vk-ads-campaign-builder",
  "workspace-project-manager",
  "yandex-direct-campaign-builder",
  "yandex-metrika",
  "yandex-webmaster",
  "youtube-video-seo",
]);

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseQuotedValue(raw, label) {
  if (!raw.startsWith("\"")) {
    throw new Error(`${label}: value must be a double-quoted YAML string`);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label}: invalid quoted string (${error.message})`);
  }
}

function parseFrontmatter(markdown, skillName) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error(`${skillName}: missing YAML frontmatter`);

  const values = new Map();
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const field = line.match(/^([a-z-]+):\s*(.+)$/);
    if (!field) throw new Error(`${skillName}: unsupported frontmatter line: ${line}`);
    if (values.has(field[1])) throw new Error(`${skillName}: duplicate frontmatter field ${field[1]}`);
    values.set(field[1], field[2].trim());
  }

  const keys = [...values.keys()].sort();
  if (keys.join(",") !== "description,name") {
    throw new Error(`${skillName}: frontmatter must contain only name and description`);
  }

  const name = values.get("name");
  const description = parseQuotedValue(values.get("description"), `${skillName}: description`);
  if (name !== skillName) throw new Error(`${skillName}: folder name must match frontmatter name`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
    throw new Error(`${skillName}: invalid skill name`);
  }
  if (!description.trim() || description.length > 1024) {
    throw new Error(`${skillName}: description must contain 1-1024 characters`);
  }
  return { name, description };
}

function quotedYamlField(yaml, field, skillName) {
  const match = yaml.match(new RegExp(`^\\s+${field}:\\s*(.+)$`, "m"));
  if (!match) throw new Error(`${skillName}: agents/openai.yaml missing ${field}`);
  return parseQuotedValue(match[1].trim(), `${skillName}: ${field}`);
}

function validateOpenAiYaml(skillDir, skillName) {
  const yamlPath = path.join(skillDir, "agents", "openai.yaml");
  if (!fs.existsSync(yamlPath)) throw new Error(`${skillName}: missing agents/openai.yaml`);
  const yaml = readText(yamlPath);

  if (/^(name|description|version):/m.test(yaml)) {
    throw new Error(`${skillName}: agents/openai.yaml contains legacy top-level fields`);
  }

  const displayName = quotedYamlField(yaml, "display_name", skillName);
  const shortDescription = quotedYamlField(yaml, "short_description", skillName);
  const defaultPrompt = quotedYamlField(yaml, "default_prompt", skillName);
  if (!displayName.trim()) throw new Error(`${skillName}: display_name is empty`);
  if (shortDescription.length < 25 || shortDescription.length > 64) {
    throw new Error(`${skillName}: short_description must contain 25-64 characters`);
  }
  if (!defaultPrompt.includes(`$${skillName}`)) {
    throw new Error(`${skillName}: default_prompt must mention $${skillName}`);
  }

  if (mcpSkills.has(skillName)) {
    if (!/^\s+value:\s*"lidfly"\s*$/m.test(yaml)
      || !/^\s+transport:\s*"streamable_http"\s*$/m.test(yaml)
      || !/^\s+url:\s*"https:\/\/lidfly\.ru\/mcp\/v3"\s*$/m.test(yaml)) {
      throw new Error(`${skillName}: missing LidFly MCP v3 dependency`);
    }
  }

  if (skillName === "ai-markers-remove"
    && !/^\s+allow_implicit_invocation:\s*false\s*$/m.test(yaml)) {
    throw new Error(`${skillName}: legacy alias must disable implicit invocation`);
  }
}

function listFiles(dir, baseDir = dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name === "__pycache__" || entry.name.endsWith(".pyc")) continue;
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(entryPath, baseDir));
    if (entry.isFile()) files.push(path.relative(baseDir, entryPath));
  }
  return files.sort();
}

function listAllTargetFiles(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listAllTargetFiles(entryPath, baseDir));
    if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(path.relative(baseDir, entryPath));
    }
  }
  return files.sort();
}

function expectedGeneratedFiles(manifest) {
  const expected = new Set([manifestName]);
  for (const [skillName, files] of Object.entries(manifest.skills)) {
    for (const relativePath of Object.keys(files)) {
      expected.add(path.join(skillName, relativePath));
    }
  }
  return expected;
}

function validateStrictGeneratedTarget(targetRoot, manifest) {
  const expected = expectedGeneratedFiles(manifest);
  const unexpected = listAllTargetFiles(targetRoot).filter((file) => !expected.has(file));
  if (unexpected.length > 0) {
    throw new Error(
      `Refusing to manage plugin target with unexpected files: ${unexpected.join(", ")}`,
    );
  }
}

function validateReferences(skillDir, markdown, skillNames, skillName) {
  const resourceRefs = markdown.matchAll(/`((?:references|scripts|assets)\/[^`\s]+)`/g);
  for (const match of resourceRefs) {
    if (!fs.existsSync(path.join(skillDir, match[1]))) {
      throw new Error(`${skillName}: missing referenced resource ${match[1]}`);
    }
  }

  const skillRefs = markdown.matchAll(/\$([a-z0-9]+(?:-[a-z0-9]+)*)/g);
  for (const match of skillRefs) {
    if (!skillNames.has(match[1])) {
      throw new Error(`${skillName}: unknown referenced skill $${match[1]}`);
    }
  }
}

function isLegacyOpenAiYaml(filePath, skillName) {
  if (!fs.existsSync(filePath)) return false;
  const yaml = readText(filePath);
  return yaml.includes(`name: "${skillName}"`)
    && yaml.includes("version: 1")
    && yaml.includes(`Используй $${skillName} для безопасного workflow LidFly MCP v3.`);
}

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, manifestName);
  if (!fs.existsSync(manifestPath)) return null;
  const manifest = JSON.parse(readText(manifestPath));
  validateGeneratedManifest(manifest, manifestPath);
  return manifest;
}

function validateGeneratedManifest(manifest, label) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error(`${label}: generated manifest must be an object`);
  }
  if (manifest.version !== 1
    || !manifest.skills
    || typeof manifest.skills !== "object"
    || Array.isArray(manifest.skills)) {
    throw new Error(`${label}: generated manifest must use version 1 and contain skills`);
  }
  for (const [skillName, files] of Object.entries(manifest.skills)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName)
      || !files
      || typeof files !== "object"
      || Array.isArray(files)) {
      throw new Error(`${label}: invalid generated skill ${skillName}`);
    }
    for (const [relativePath, expectedHash] of Object.entries(files)) {
      const parts = relativePath.split(/[\\/]/);
      if (!relativePath
        || path.isAbsolute(relativePath)
        || relativePath.includes("\0")
        || parts.some((part) => !part || part === "." || part === "..")
        || !/^[a-f0-9]{64}$/.test(expectedHash)) {
        throw new Error(`${label}: unsafe generated path ${skillName}/${relativePath}`);
      }
    }
  }
}

function resolveGeneratedPath(targetRoot, skillName, relativePath) {
  const resolved = path.resolve(targetRoot, skillName, relativePath);
  const relative = path.relative(targetRoot, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Generated path escapes target root: ${skillName}/${relativePath}`);
  }
  return resolved;
}

function hasExactBasename(filePath) {
  const parent = path.dirname(filePath);
  return fs.existsSync(parent) && fs.readdirSync(parent).includes(path.basename(filePath));
}

function removeEmptyParents(startDir, stopDir) {
  let current = startDir;
  while (current.startsWith(stopDir) && current !== stopDir) {
    if (!fs.existsSync(current) || fs.readdirSync(current).length > 0) return;
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

function cleanStaleGeneratedFiles(targetRoot, previousManifest, nextManifest) {
  if (!previousManifest?.skills) return;
  for (const [skillName, files] of Object.entries(previousManifest.skills)) {
    for (const [relativePath, previousHash] of Object.entries(files)) {
      if (nextManifest.skills[skillName]?.[relativePath]) continue;
      const stalePath = resolveGeneratedPath(targetRoot, skillName, relativePath);
      if (!fs.existsSync(stalePath)) continue;
      const current = fs.readFileSync(stalePath);
      if (hash(current) !== previousHash) {
        throw new Error(`Refusing to delete modified generated file: ${stalePath}`);
      }
      fs.unlinkSync(stalePath);
      removeEmptyParents(path.dirname(stalePath), targetRoot);
    }
  }
}

if (!fs.existsSync(sourceRoot)) throw new Error(`skills-source not found: ${sourceRoot}`);

const skills = fs.readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const skillNames = new Set(skills);
const sourceFiles = new Map();
const skillMetadata = new Map();

for (const skillName of skills) {
  const skillDir = path.join(sourceRoot, skillName);
  const skillPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillPath)) throw new Error(`${skillName}: missing SKILL.md`);
  const markdown = readText(skillPath);
  skillMetadata.set(skillName, parseFrontmatter(markdown, skillName));
  validateOpenAiYaml(skillDir, skillName);
  validateReferences(skillDir, markdown, skillNames, skillName);
  sourceFiles.set(skillName, listFiles(skillDir));
}

const directSkill = readText(path.join(sourceRoot, "yandex-direct-campaign-builder", "SKILL.md"));
if (/add_adgroup\/add_adgroups[\s\S]*UNIFIED_AD_GROUP/.test(directSkill)) {
  throw new Error("yandex-direct-campaign-builder: add_adgroups must not be used for UNIFIED_AD_GROUP");
}
const serpSkill = readText(path.join(sourceRoot, "serp-monitor", "SKILL.md"));
if (/Yandex XML tools|configured local scripts/i.test(serpSkill)) {
  throw new Error("serp-monitor: obsolete unbundled local-script workflow remains");
}

// Preserve client-only edits: all existing generated copies of each source file must agree.
for (const skillName of skills) {
  for (const relativePath of sourceFiles.get(skillName)) {
    const existing = [];
    for (const target of targets) {
      const targetRoot = path.join(root, target.dir);
      const preferredPath = path.join(targetRoot, skillName, relativePath);
      const legacyPath = relativePath === "SKILL.md" && target.legacySkillFile
        ? path.join(targetRoot, skillName, target.legacySkillFile)
        : null;
      const existingPath = fs.existsSync(preferredPath)
        ? preferredPath
        : legacyPath && fs.existsSync(legacyPath) ? legacyPath : null;
      if (existingPath) existing.push({ path: existingPath, content: fs.readFileSync(existingPath) });
    }
    const hashes = new Set(existing.map((item) => hash(item.content)));
    if (hashes.size > 1) {
      throw new Error(`Refusing to overwrite divergent client copies for ${skillName}/${relativePath}`);
    }
  }
}

for (const target of targets) {
  const targetRoot = path.isAbsolute(target.dir)
    ? target.dir
    : path.join(root, target.dir);
  const targetLabel = target.label ?? target.dir;
  const nextManifest = { version: 1, skills: {} };

  for (const skillName of skills) {
    nextManifest.skills[skillName] = {};
    for (const relativePath of sourceFiles.get(skillName)) {
      const sourcePath = path.join(sourceRoot, skillName, relativePath);
      const content = fs.readFileSync(sourcePath);
      nextManifest.skills[skillName][relativePath] = hash(content);
    }
  }

  if (checkOnly) {
    if (target.strictGeneratedOnly) {
      validateStrictGeneratedTarget(targetRoot, nextManifest);
    }
    for (const skillName of skills) {
      for (const relativePath of sourceFiles.get(skillName)) {
        const sourcePath = path.join(sourceRoot, skillName, relativePath);
        const targetPath = path.join(targetRoot, skillName, relativePath);
        if (!hasExactBasename(targetPath)
          || !fs.readFileSync(targetPath).equals(fs.readFileSync(sourcePath))) {
          throw new Error(`${targetLabel}: out of sync: ${skillName}/${relativePath}`);
        }
      }
      if (target.legacySkillFile
        && hasExactBasename(path.join(targetRoot, skillName, target.legacySkillFile))) {
        throw new Error(`${targetLabel}: legacy ${skillName}/${target.legacySkillFile} still exists`);
      }
      if (fs.existsSync(path.join(targetRoot, skillName, "openai.yaml"))) {
        throw new Error(`${targetLabel}: legacy ${skillName}/openai.yaml still exists`);
      }
    }
    const currentManifest = readManifest(targetRoot);
    if (JSON.stringify(currentManifest) !== JSON.stringify(nextManifest)) {
      throw new Error(`${targetLabel}: generated manifest is missing or stale`);
    }
    continue;
  }

  if (target.strictGeneratedOnly && fs.existsSync(targetRoot)) {
    const currentManifest = readManifest(targetRoot);
    if (currentManifest === null) {
      const existingFiles = listAllTargetFiles(targetRoot);
      if (existingFiles.length > 0) {
        throw new Error(
          `Refusing to adopt non-empty plugin target without ${manifestName}: ${targetRoot}`,
        );
      }
    } else {
      validateStrictGeneratedTarget(targetRoot, currentManifest);
    }
  }

  fs.mkdirSync(targetRoot, { recursive: true });
  cleanStaleGeneratedFiles(targetRoot, readManifest(targetRoot), nextManifest);

  for (const skillName of skills) {
    const targetSkill = path.join(targetRoot, skillName);
    fs.mkdirSync(targetSkill, { recursive: true });
    let legacySkillTemp = null;
    if (target.legacySkillFile) {
      const legacyPath = path.join(targetSkill, target.legacySkillFile);
      if (hasExactBasename(legacyPath)) {
        legacySkillTemp = path.join(targetSkill, ".lidfly-legacy-skill-migration");
        fs.renameSync(legacyPath, legacySkillTemp);
      }
    }

    for (const relativePath of sourceFiles.get(skillName)) {
      const sourcePath = path.join(sourceRoot, skillName, relativePath);
      const targetPath = path.join(targetSkill, relativePath);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }

    if (legacySkillTemp && fs.existsSync(legacySkillTemp)) fs.unlinkSync(legacySkillTemp);
    const legacyOpenAiPath = path.join(targetSkill, "openai.yaml");
    if (isLegacyOpenAiYaml(legacyOpenAiPath, skillName)) fs.unlinkSync(legacyOpenAiPath);
  }

  fs.writeFileSync(
    path.join(targetRoot, manifestName),
    `${JSON.stringify(nextManifest, null, 2)}\n`,
  );
  if (target.strictGeneratedOnly) {
    validateStrictGeneratedTarget(targetRoot, nextManifest);
  }
}

console.log(
  checkOnly
    ? `Validated ${skills.length} skills across ${targets.length} client directories.`
    : `Synced ${skills.length} skills to ${targets.length} client directories without replacing target roots.`,
);
