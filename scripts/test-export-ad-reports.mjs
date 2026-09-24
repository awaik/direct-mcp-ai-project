#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "skills-source/export-ad-reports/SKILL.md"), "utf8");

assert.match(source, /original public URL/);
assert.match(source, /drive\.google\.com/);
assert.match(source, /Разрешить доступ/);
assert.match(source, /Never replace.*HYPERLINK/s);
assert.match(source, /leave the `=IMAGE\(\.\.\.\)` formula/);

for (const relativePath of [
  ".codex/skills/export-ad-reports/SKILL.md",
  ".claude/skills/export-ad-reports/SKILL.md",
  ".agents/skills/export-ad-reports/SKILL.md",
  ".openclaw/skills/export-ad-reports/SKILL.md",
]) {
  assert.equal(
    fs.readFileSync(path.join(root, relativePath), "utf8"),
    source,
    `${relativePath} must match the canonical export skill`,
  );
}

console.log("export ad reports image fallback tests passed");
