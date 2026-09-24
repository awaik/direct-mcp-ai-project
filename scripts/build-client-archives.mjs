#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputIndex = process.argv.indexOf("--output");
const outputRoot = outputIndex >= 0 && process.argv[outputIndex + 1]
  ? path.resolve(process.argv[outputIndex + 1])
  : path.join(root, "dist");
const fixedTime = new Date("2000-01-01T00:00:00.000Z");

const archives = [
  {
    name: "lidfly-claude-code.zip",
    entries: [".mcp.json", "CLAUDE.md", ".claude/settings.json", ".claude/skills"],
  },
  {
    name: "lidfly-codex.zip",
    entries: ["AGENTS.md", ".codex/config.toml", ".codex/skills"],
  },
  {
    name: "lidfly-cursor.zip",
    entries: ["AGENTS.md", ".cursor/mcp.json", ".agents/skills"],
  },
];

function listFiles(sourcePath) {
  const stat = fs.statSync(sourcePath);
  if (stat.isFile()) return [sourcePath];
  return fs.readdirSync(sourcePath, { withFileTypes: true })
    .flatMap((entry) => listFiles(path.join(sourcePath, entry.name)));
}

function stageArchive(stageRoot, entries) {
  const relativeFiles = [];
  for (const entry of entries) {
    const source = path.join(root, entry);
    if (!fs.existsSync(source)) throw new Error(`Archive source is missing: ${entry}`);
    for (const sourceFile of listFiles(source)) {
      const relative = path.relative(root, sourceFile);
      const target = path.join(stageRoot, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(sourceFile, target);
      fs.chmodSync(target, 0o644);
      fs.utimesSync(target, fixedTime, fixedTime);
      relativeFiles.push(relative);
    }
  }
  return relativeFiles.sort((left, right) => left.localeCompare(right, "en"));
}

fs.mkdirSync(outputRoot, { recursive: true });
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lidfly-client-archives-"));

try {
  for (const archive of archives) {
    const stageRoot = path.join(temporaryRoot, archive.name.replace(/\.zip$/, ""));
    fs.mkdirSync(stageRoot, { recursive: true });
    const files = stageArchive(stageRoot, archive.entries);
    const target = path.join(outputRoot, archive.name);
    fs.rmSync(target, { force: true });
    execFileSync("zip", ["-X", "-q", target, ...files], { cwd: stageRoot });
    const digest = crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
    console.log(`${archive.name} ${digest}`);
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
