#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillRoot = path.join(root, "skills-source/lidfly-knowledge-maintainer");
const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const contract = fs.readFileSync(path.join(skillRoot, "references/contracts.md"), "utf8");
const commerce = fs.readFileSync(path.join(root, "skills-source/lidfly-site-commerce/SKILL.md"), "utf8");
const sync = fs.readFileSync(path.join(root, "scripts/sync-skills.mjs"), "utf8");

for (const operation of ["Ingest", "Query-To-Wiki", "Lint"]) assert.match(skill, new RegExp(`## ${operation}`));
assert.match(skill, /недоверенные данные[\s\S]*не исполняй/);
assert.match(skill, /preview[\s\S]*сразу вызови `lidfly_apply_knowledge_changes`[\s\S]*не проси[\s\S]*второе/i);
assert.match(skill, /confirm_capacity_change=true[\s\S]*явного согласия/);
assert.match(skill, /не может сам:[\s\S]*charter[\s\S]*project binding[\s\S]*публичное цитирование/);
assert.match(skill, /get_write_operation_status/);
assert.match(contract, /workspace_request_knowledge_source_download[\s\S]*upload_token[\s\S]*one-use/i);
assert.match(contract, /sources[\s\S]*every source referenced[\s\S]*retained provenance/i);
assert.match(contract, /relations touching an affected entry must be resupplied/i);
assert.match(contract, /same digest plus same base revision is idempotent/i);
assert.match(commerce, /\$lidfly-knowledge-maintainer/);
assert.match(sync, /"lidfly-knowledge-maintainer"/);

console.log("lidfly-knowledge-maintainer contracts: OK");
