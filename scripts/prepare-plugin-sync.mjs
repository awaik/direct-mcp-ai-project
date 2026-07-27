#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_REPOSITORY = "https://github.com/awaik/direct-mcp-ai-project";
const MIN_INSTALLER_VERSION = "1.2.0";

function usage() {
  return `Usage:
  node scripts/prepare-plugin-sync.mjs --target-repo <lidfly-plugins-checkout> [options]

Options:
  --source-commit <sha>  Full source commit; defaults to HEAD.
  --check                Validate an already prepared snapshot without writing.
  --help, -h             Show this help.
`;
}

function fail(message) {
  throw new Error(`${message}\n\n${usage()}`);
}

const args = { check: false, sourceCommit: null, targetRepo: null };
for (let index = 0; index < process.argv.slice(2).length; index += 1) {
  const argv = process.argv.slice(2);
  const argument = argv[index];
  if (argument === "--check") {
    args.check = true;
  } else if (argument === "--target-repo" || argument === "--source-commit") {
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`${argument} requires a value`);
    if (argument === "--target-repo") args.targetRepo = value;
    else args.sourceCommit = value;
    index += 1;
  } else if (argument === "--help" || argument === "-h") {
    process.stdout.write(usage());
    process.exit(0);
  } else {
    fail(`Unknown argument: ${argument}`);
  }
}

if (!args.targetRepo) fail("--target-repo is required");
const targetRepo = path.resolve(process.cwd(), args.targetRepo);
const pluginRoot = path.join(targetRepo, "plugins/lidfly");
const pluginManifestPath = path.join(pluginRoot, ".codex-plugin/plugin.json");
if (!fs.existsSync(pluginManifestPath)) {
  fail(`LidFly plugin manifest not found: ${pluginManifestPath}`);
}

const sourceCommit =
  args.sourceCommit ??
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
if (!/^[a-f0-9]{40}$/.test(sourceCommit)) {
  fail("--source-commit must be a full lowercase Git commit SHA");
}

const snapshot = JSON.parse(
  execFileSync(
    process.execPath,
    [
      path.join(root, "scripts/sync-skills.mjs"),
      ...(args.check ? ["--check"] : []),
      "--plugin-target",
      path.join(pluginRoot, "skills"),
      "--json",
    ],
    { cwd: root, encoding: "utf8" },
  ),
);
if (
  snapshot.schema_version !== 1 ||
  !Number.isSafeInteger(snapshot.skill_count) ||
  snapshot.skill_count < 1 ||
  !Number.isSafeInteger(snapshot.file_count) ||
  snapshot.file_count < snapshot.skill_count * 2 ||
  !/^[a-f0-9]{64}$/.test(snapshot.skills_tree_sha256)
) {
  fail("sync-skills returned an invalid source snapshot");
}

const currentPlugin = JSON.parse(fs.readFileSync(pluginManifestPath, "utf8"));
if (
  currentPlugin.name !== "lidfly" ||
  !/^\d+\.\d+\.\d+$/.test(currentPlugin.version)
) {
  fail("Target plugin manifest has an invalid name or version");
}
const [major, minor, patch] = currentPlugin.version.split(".").map(Number);
const nextVersion = `${major}.${minor}.${patch + 1}`;
const lockPath = path.join(pluginRoot, "skills-source.lock.json");
const existingLock = fs.existsSync(lockPath)
  ? JSON.parse(fs.readFileSync(lockPath, "utf8"))
  : null;
const sourceTreeChanged =
  existingLock?.skills_tree_sha256 !== snapshot.skills_tree_sha256;
if (!sourceTreeChanged) {
  if (
    existingLock?.schema_version !== 1 ||
    existingLock?.source?.repository !== SOURCE_REPOSITORY ||
    !/^[a-f0-9]{40}$/.test(existingLock?.source?.commit ?? "") ||
    existingLock?.skill_count !== snapshot.skill_count ||
    existingLock?.file_count !== snapshot.file_count
  ) {
    fail("Existing skills-source.lock.json is invalid");
  }
  process.stdout.write(
    `${JSON.stringify(
      {
        changed: false,
        plugin_version: currentPlugin.version,
        ...existingLock,
      },
      null,
      2,
    )}\n`,
  );
  process.exit(0);
}
const lock = {
  schema_version: 1,
  source: {
    repository: SOURCE_REPOSITORY,
    commit: sourceCommit,
  },
  skills_tree_sha256: snapshot.skills_tree_sha256,
  skill_count: snapshot.skill_count,
  file_count: snapshot.file_count,
};

if (args.check) {
  fail("Plugin snapshot is out of date");
}

currentPlugin.version = nextVersion;
fs.writeFileSync(
  pluginManifestPath,
  `${JSON.stringify(currentPlugin, null, 2)}\n`,
);
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

const pluginReleases = path.join(targetRepo, "plugin-releases");
fs.mkdirSync(pluginReleases, { recursive: true });
const draftPath = path.join(pluginReleases, `${nextVersion}.json`);
const draft = {
  schema_version: 1,
  channel: "stable",
  status: "draft",
  min_installer_version: MIN_INSTALLER_VERSION,
  plugin: { name: "lidfly", version: nextVersion },
  source: {
    repository: SOURCE_REPOSITORY,
    commit: sourceCommit,
    skills_tree_sha256: snapshot.skills_tree_sha256,
  },
};
if (fs.existsSync(draftPath)) {
  fail(`Refusing to overwrite existing plugin release metadata: ${draftPath}`);
}
fs.writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ changed: true, plugin_version: nextVersion, draft: path.relative(targetRepo, draftPath), ...lock }, null, 2)}\n`,
);
