#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lidfly-archive-test-"));
const first = path.join(temporaryRoot, "first");
const second = path.join(temporaryRoot, "second");
const expected = {
  "lidfly-claude-code.zip": [".mcp.json", "CLAUDE.md", ".claude/settings.json", ".claude/skills/"],
  "lidfly-codex.zip": ["AGENTS.md", ".codex/config.toml", ".codex/skills/"],
  "lidfly-cursor.zip": ["AGENTS.md", ".cursor/mcp.json", ".agents/skills/"],
};

const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

try {
  for (const output of [first, second]) {
    execFileSync(process.execPath, [
      path.join(root, "scripts/build-client-archives.mjs"),
      "--output",
      output,
    ], { cwd: root, stdio: "pipe" });
  }

  for (const [archive, allowedRoots] of Object.entries(expected)) {
    assert.equal(hash(path.join(first, archive)), hash(path.join(second, archive)), `${archive} is not deterministic`);
    const files = execFileSync("unzip", ["-Z1", path.join(first, archive)], { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    assert.ok(files.length > 3, `${archive} is unexpectedly empty`);
    for (const file of files) {
      assert.ok(
        allowedRoots.some((allowed) => allowed.endsWith("/") ? file.startsWith(allowed) : file === allowed),
        `${archive} contains a foreign client file: ${file}`,
      );
    }
  }
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log("Client archives are isolated and deterministic");
