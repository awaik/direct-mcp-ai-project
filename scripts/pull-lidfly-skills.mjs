#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skills-source");
const lockPath = path.join(sourceRoot, ".lidfly-release-lock.json");
const PUBLIC_BASE_URL = "https://lidfly.ru/skills-releases/";
const KEY_ID = "lidfly-skills-2026-01";
const PUBLIC_KEY_SPKI_BASE64 = "MCowBQYDK2VwAyEAItNj1JYbc9gEks1/ibep39+R184Ws0mECt8AvwkvHd8=";
const CLIENT_PATH = /^(?:SKILL\.md|agents\/openai\.yaml|references\/[a-z0-9][a-z0-9._-]*\.md)$/;
const DIGEST = /^sha256:[a-f0-9]{64}$/;

const args = process.argv.slice(2);
const options = { releaseRoot: "", check: false };
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--release-root") options.releaseRoot = args[++index] || "";
  else if (arg === "--check") options.check = true;
  else throw new Error(`Unknown argument: ${arg}`);
}

function digest(bytes) {
  return `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function safeRelative(value) {
  return typeof value === "string" && value && !path.isAbsolute(value) && !value.includes("\\")
    && value.split("/").every((part) => part && part !== "." && part !== "..");
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort().join(",");
  const expected = [...keys].sort().join(",");
  if (actual !== expected) throw new Error(`${label} has unknown or missing fields`);
}

async function readAsset(relativePath) {
  if (!safeRelative(relativePath)) throw new Error(`Unsafe release path: ${relativePath}`);
  if (options.releaseRoot) {
    const releaseRoot = path.resolve(options.releaseRoot);
    const absolute = path.resolve(releaseRoot, relativePath);
    if (!absolute.startsWith(`${releaseRoot}${path.sep}`)) throw new Error(`Release path escapes root: ${relativePath}`);
    const stat = fs.lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Release asset is not a regular file: ${relativePath}`);
    return fs.readFileSync(absolute);
  }
  const response = await fetch(new URL(relativePath, PUBLIC_BASE_URL), { redirect: "error" });
  if (!response.ok) throw new Error(`LidFly skill release fetch failed: ${relativePath} (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

function verifySignature(bytes, signatureBytes) {
  const key = crypto.createPublicKey({ key: Buffer.from(PUBLIC_KEY_SPKI_BASE64, "base64"), format: "der", type: "spki" });
  const signature = Buffer.from(signatureBytes.toString("utf8").trim(), "base64");
  if (signature.length !== 64 || !crypto.verify(null, bytes, key, signature)) throw new Error("Skill release signature verification failed");
}

function listProjectionFiles(directory, base = directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlink is forbidden in generated projection: ${absolute}`);
    if (entry.isDirectory()) result.push(...listProjectionFiles(absolute, base));
    else if (entry.isFile()) result.push(path.relative(base, absolute).split(path.sep).join("/"));
  }
  return result.sort();
}

function containsNonDirectoryEntry(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink() || !entry.isDirectory()) return true;
    if (containsNonDirectoryEntry(path.join(directory, entry.name))) return true;
  }
  return false;
}

function validateLock(lock) {
  exactKeys(lock, ["schema_version", "key_id", "release_version", "registry_digest", "manifest_digest", "files"], "projection lock");
  if (lock.schema_version !== 1 || lock.key_id !== KEY_ID || !DIGEST.test(lock.registry_digest) || !DIGEST.test(lock.manifest_digest)) throw new Error("Invalid projection lock metadata");
  if (!lock.files || typeof lock.files !== "object" || Array.isArray(lock.files)) throw new Error("Invalid projection lock files");
  for (const [relativePath, expectedDigest] of Object.entries(lock.files)) {
    if (!safeRelative(relativePath) || !/^[a-z0-9]+(?:-[a-z0-9]+)*\//.test(relativePath) || !CLIENT_PATH.test(relativePath.slice(relativePath.indexOf("/") + 1)) || !DIGEST.test(expectedDigest)) {
      throw new Error(`Unsafe projection lock entry: ${relativePath}`);
    }
  }
  return lock;
}

const latestBytes = await readAsset("latest.json");
const latestSignature = await readAsset("latest.json.sig");
verifySignature(latestBytes, latestSignature);
const latest = JSON.parse(latestBytes.toString("utf8"));
exactKeys(latest, ["contract_version", "release_version", "manifest_path", "manifest_digest", "key_id"], "latest.json");
if (latest.contract_version !== 1 || latest.key_id !== KEY_ID || latest.manifest_path !== `${latest.release_version}/manifest.json` || !DIGEST.test(latest.manifest_digest)) throw new Error("Invalid latest.json contract");

const manifestBytes = await readAsset(latest.manifest_path);
verifySignature(manifestBytes, await readAsset(`${latest.manifest_path}.sig`));
if (digest(manifestBytes) !== latest.manifest_digest) throw new Error("Manifest digest mismatch");
const manifest = JSON.parse(manifestBytes.toString("utf8"));
exactKeys(manifest, ["contract_version", "minimum_runtime_contract_version", "release_version", "released_at", "provenance", "registry_digest", "skills"], "manifest.json");
if (manifest.contract_version !== 1 || !Number.isInteger(manifest.minimum_runtime_contract_version) || manifest.minimum_runtime_contract_version < 1 || manifest.minimum_runtime_contract_version > 1 || manifest.release_version !== latest.release_version || !DIGEST.test(manifest.registry_digest) || !Array.isArray(manifest.skills)) throw new Error("Invalid skill release manifest");
if (digest(canonicalJson(manifest.skills)) !== manifest.registry_digest) throw new Error("Registry digest mismatch");

const nextFiles = {};
const nextBytes = new Map();
const skillIds = new Set();
for (const skill of manifest.skills) {
  exactKeys(skill, ["id", "status", "digest", "files", "dependencies", "resolved_required_tools"], `skill ${skill.id || "?"}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.id) || skillIds.has(skill.id) || !DIGEST.test(skill.digest) || !Array.isArray(skill.files)) throw new Error("Invalid or duplicate skill entry");
  skillIds.add(skill.id);
  if (skill.status !== "active") continue;
  const fileShape = [];
  for (const file of skill.files) {
    exactKeys(file, ["path", "digest", "bytes"], `${skill.id} file`);
    if (!safeRelative(file.path) || !DIGEST.test(file.digest) || !Number.isInteger(file.bytes) || file.bytes < 0) throw new Error(`Invalid file metadata: ${skill.id}/${file.path}`);
    const bytes = await readAsset(`${manifest.release_version}/skills/${skill.id}/${file.path}`);
    if (bytes.byteLength !== file.bytes || digest(bytes) !== file.digest) throw new Error(`Skill file digest mismatch: ${skill.id}/${file.path}`);
    fileShape.push(file);
    if (!CLIENT_PATH.test(file.path)) continue;
    const relativePath = `${skill.id}/${file.path}`;
    nextFiles[relativePath] = file.digest;
    nextBytes.set(relativePath, bytes);
  }
  if (digest(canonicalJson({ id: skill.id, files: fileShape })) !== skill.digest) throw new Error(`Skill digest mismatch: ${skill.id}`);
}

const previousLock = fs.existsSync(lockPath) ? validateLock(JSON.parse(fs.readFileSync(lockPath, "utf8"))) : null;
if (!previousLock) throw new Error("Generated projection lock is missing. Refusing to overwrite skills-source.");

for (const [relativePath, bytes] of nextBytes) {
  const absolute = path.join(sourceRoot, relativePath);
  if (!fs.existsSync(absolute)) continue;
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Refusing to replace non-regular projection file: ${relativePath}`);
  const currentDigest = digest(fs.readFileSync(absolute));
  const lockedDigest = previousLock.files[relativePath];
  if (lockedDigest ? currentDigest !== lockedDigest : currentDigest !== digest(bytes)) throw new Error(`Refusing to overwrite manually diverged projection file: ${relativePath}`);
}
for (const [relativePath, lockedDigest] of Object.entries(previousLock.files)) {
  if (nextFiles[relativePath]) continue;
  const absolute = path.join(sourceRoot, relativePath);
  if (fs.existsSync(absolute) && digest(fs.readFileSync(absolute)) !== lockedDigest) throw new Error(`Refusing to delete manually diverged projection file: ${relativePath}`);
}

const nextLock = {
  schema_version: 1,
  key_id: KEY_ID,
  release_version: manifest.release_version,
  registry_digest: manifest.registry_digest,
  manifest_digest: latest.manifest_digest,
  files: Object.fromEntries(Object.entries(nextFiles).sort(([left], [right]) => left.localeCompare(right))),
};

if (options.check) {
  for (const [relativePath, expectedDigest] of Object.entries(nextFiles)) {
    const absolute = path.join(sourceRoot, relativePath);
    if (!fs.existsSync(absolute) || digest(fs.readFileSync(absolute)) !== expectedDigest) throw new Error(`Generated projection is stale: ${relativePath}`);
  }
  if (JSON.stringify(previousLock) !== JSON.stringify(nextLock)) throw new Error("Generated projection lock is stale");
  console.log(`Verified generated projection ${manifest.release_version}: ${skillIds.size} release skills, ${Object.keys(nextFiles).length} client files.`);
  process.exit(0);
}

for (const [relativePath, lockedDigest] of Object.entries(previousLock.files)) {
  if (nextFiles[relativePath]) continue;
  const absolute = path.join(sourceRoot, relativePath);
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}
for (const [relativePath, bytes] of nextBytes) {
  const absolute = path.join(sourceRoot, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const temporary = `${absolute}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, bytes, { flag: "wx" });
  fs.renameSync(temporary, absolute);
}
for (const skillDir of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
  if (!skillDir.isDirectory() || skillDir.name.startsWith(".")) continue;
  const absolute = path.join(sourceRoot, skillDir.name);
  if (listProjectionFiles(absolute).length === 0 && !containsNonDirectoryEntry(absolute)) {
    fs.rmSync(absolute, { recursive: true });
  }
}
const lockTemporary = `${lockPath}.${process.pid}.tmp`;
fs.writeFileSync(lockTemporary, `${JSON.stringify(nextLock, null, 2)}\n`, { flag: "wx" });
fs.renameSync(lockTemporary, lockPath);
console.log(`Updated generated projection to ${manifest.release_version}: ${Object.keys(nextFiles).length} client files.`);
