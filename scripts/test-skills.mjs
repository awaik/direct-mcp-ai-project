#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(root, "skills-source");
const pullScript = fs.readFileSync(path.join(root, "scripts/pull-lidfly-skills.mjs"), "utf8");
const pullWorkflow = fs.readFileSync(path.join(root, ".github/workflows/pull-lidfly-skills.yml"), "utf8");
const releaseLock = JSON.parse(fs.readFileSync(path.join(sourceRoot, ".lidfly-release-lock.json"), "utf8"));

assert.match(pullScript, /PUBLIC_BASE_URL = "https:\/\/lidfly\.ru\/skills-releases\/"/, "generated pull must use the fixed public release origin");
assert.match(pullScript, /PUBLIC_KEY_SPKI_BASE64 = "MCowBQYDK2VwAyEA[^\"]+"/, "generated pull must pin the dedicated public key");
assert.match(pullScript, /crypto\.verify\(null, bytes, key, signature\)/, "generated pull must verify detached Ed25519 signatures");
assert.match(pullScript, /digest\(manifestBytes\) !== latest\.manifest_digest[\s\S]*digest\(canonicalJson\(manifest\.skills\)\) !== manifest\.registry_digest/, "generated pull must verify manifest and registry digests");
assert.match(pullScript, /bytes\.byteLength !== file\.bytes \|\| digest\(bytes\) !== file\.digest/, "generated pull must verify every released file");
assert.match(pullScript, /Refusing to overwrite manually diverged projection file/, "generated pull must fail closed on manually changed files");
assert.match(pullScript, /JSON\.stringify\(previousLock\) !== JSON\.stringify\(nextLock\)/, "generated pull check must include the deterministic lock");
assert.match(pullScript, /!Number\.isInteger\(manifest\.minimum_runtime_contract_version\)/, "generated pull must reject non-integer runtime contract versions");
assert.doesNotMatch(pullScript, /bootstrap-current/, "generated pull must not expose the lock bypass used only during initial adoption");
assert.match(pullScript, /containsNonDirectoryEntry[\s\S]*fs\.rmSync\(absolute, \{ recursive: true \}\)/, "generated pull must remove released skill directories that contain only empty subdirectories");
assert.match(pullWorkflow, /workflow_dispatch:[\s\S]*pull-lidfly-skills\.mjs[\s\S]*sync-skills\.mjs --check[\s\S]*gh pr create/, "generated pull workflow must support manual verified sync and open its own PR");
assert.doesNotMatch(pullWorkflow, /^\s+schedule:/m, "generated pull must not be scheduled before the public release origin is live");
assert.match(pullWorkflow, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/, "checkout action must be pinned to a full commit SHA");
assert.match(pullWorkflow, /actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020/, "setup-node action must be pinned to a full commit SHA");
assert.equal(releaseLock.schema_version, 1);
assert.equal(releaseLock.key_id, "lidfly-skills-2026-01");
assert.match(releaseLock.registry_digest, /^sha256:[a-f0-9]{64}$/);
assert.match(releaseLock.manifest_digest, /^sha256:[a-f0-9]{64}$/);

function markdownSection(source, heading) {
  const marker = `${heading}\n`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${heading}: section missing`);
  const level = heading.match(/^#+/)?.[0].length;
  assert.ok(level, `${heading}: invalid Markdown heading`);
  const remainder = source.slice(start + marker.length);
  const nextHeading = remainder.search(new RegExp(`^#{1,${level}}\\s`, "m"));
  return nextHeading === -1 ? remainder : remainder.slice(0, nextHeading);
}

const skills = fs
  .readdirSync(sourceRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.equal(skills.length, 25, "unexpected generated skill count");

execFileSync(
  process.execPath,
  [path.join(root, "scripts/sync-skills.mjs"), "--check"],
  {
    cwd: root,
    stdio: "inherit",
  },
);

const sourceSnapshot = JSON.parse(
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/sync-skills.mjs"), "--check", "--json"],
    { cwd: root, encoding: "utf8" },
  ),
);
assert.equal(sourceSnapshot.schema_version, 1);
assert.equal(sourceSnapshot.skill_count, 25);
assert.equal(sourceSnapshot.files.length, sourceSnapshot.file_count);
assert.match(sourceSnapshot.skills_tree_sha256, /^[a-f0-9]{64}$/);
assert.deepEqual(
  sourceSnapshot.files.map((file) => file.path),
  [...sourceSnapshot.files.map((file) => file.path)].sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  ),
  "source snapshot paths must be deterministic",
);

for (const skill of skills) {
  const source = fs.readFileSync(
    path.join(sourceRoot, skill, "SKILL.md"),
    "utf8",
  );
  assert.match(source, /^---\nname: [a-z0-9-]+\ndescription: ".+"\n---\n/);
  assert.ok(
    fs.existsSync(path.join(sourceRoot, skill, "agents/openai.yaml")),
    `${skill}: agents/openai.yaml missing`,
  );

  for (const clientRoot of [
    ".agents/skills",
    ".codex/skills",
    ".claude/skills",
    ".openclaw/skills",
  ]) {
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

const siteCommerceSkill = fs.readFileSync(
  path.join(sourceRoot, "lidfly-site-commerce/SKILL.md"),
  "utf8",
);
const siteManagedPages = fs.readFileSync(
  path.join(sourceRoot, "lidfly-site-commerce/references/managed-pages.md"),
  "utf8",
);
const siteSeoFeeds = fs.readFileSync(
  path.join(sourceRoot, "lidfly-site-commerce/references/seo-feeds.md"),
  "utf8",
);
const siteCommerceReference = fs.readFileSync(
  path.join(sourceRoot, "lidfly-site-commerce/references/commerce.md"),
  "utf8",
);
const siteChromeReference = fs.readFileSync(
  path.join(sourceRoot, "lidfly-site-commerce/references/site-chrome.md"),
  "utf8",
);
const siteFloatingVideoSection = markdownSection(
  siteManagedPages,
  "### Native Floating Video Widget",
);
execFileSync(process.execPath, [path.join(root, "scripts/test-lidfly-knowledge-maintainer.mjs")], {
  cwd: root,
  stdio: "inherit",
});
const siteSeoSection = markdownSection(
  siteSeoFeeds,
  "## SEO, Social Metadata And Feeds",
);
const siteSeoProfileSection = markdownSection(
  siteSeoSection,
  "### Organization And Local Business Schema",
);
const siteSocialSection = markdownSection(
  siteManagedPages,
  "### Page Open Graph And Twitter Cards",
);
const siteArticlesSection = markdownSection(
  siteSeoSection,
  "### Articles And RSS",
);
const siteVideoSection = markdownSection(siteManagedPages, "### VideoObject");
const siteCommerceFeedsSection = markdownSection(
  siteCommerceReference,
  "### Commerce Schema And Feeds",
);
const siteChromeSection = markdownSection(
  siteChromeReference,
  "## Site Chrome And Design Template",
);

assert.match(
  siteFloatingVideoSection,
  /lidfly_get_floating_video_widget[\s\S]*lidfly_update_floating_video_widget[\s\S]*close_persistence="session"[\s\S]*close_persistence="page"[\s\S]*F5/i,
  "floating video guidance must explain both close lifetimes and map reload requests to page mode",
);
assert.match(
  siteChromeSection,
  /premium-header[\s\S]*commerce-header[\s\S]*logoImage[\s\S]*logoSize[\s\S]*compact[\s\S]*regular[\s\S]*large/,
  "LidFly site skill must scope image logo size to supported headers with logoImage",
);
assert.match(
  siteChromeSection,
  /lidfly_get_site_chrome[\s\S]*lidfly_update_site_chrome[\s\S]*effective\.header\.logoSize/,
  "LidFly site skill must require read → write → reread verification for logo size",
);
assert.match(
  siteChromeSection,
  /site-header[\s\S]*gallery-header[\s\S]*do not support `logoSize`/,
  "LidFly site skill must reject logoSize for unsupported header types",
);
assert.match(
  siteChromeSection,
  /^### Change Header Logo Size$[\s\S]*^### Change Site Design Template$/m,
  "site chrome and design recipes must stay outside the SEO section",
);
assert.match(
  siteSeoProfileSection,
  /lidfly_get_site_seo_profile[\s\S]*lidfly_update_site_seo_profile[\s\S]*expected_updated_at[\s\S]*expected_publication_revision[\s\S]*destructive full replacement[\s\S]*profile: \{\}[\s\S]*reread/i,
  "SEO entity updates must use both CAS guards and reread",
);
assert.match(
  siteSocialSection,
  /lidfly_get_page[\s\S]*lidfly_get_block[\s\S]*lidfly_update_page[\s\S]*all blocks[\s\S]*Open Graph[\s\S]*Twitter Cards/i,
  "social metadata updates must preserve the full page block set",
);
for (const field of [
  "title",
  "description",
  "og_image",
  "theme_preset",
  "theme",
  "page_kind",
  "inherit_site_design",
  "auto_structured_data",
]) {
  assert.ok(
    siteSocialSection.includes(`\`${field}\``),
    `page replacement instructions must preserve ${field}`,
  );
}
assert.match(
  siteSocialSection,
  /Missing blocks are deletions[\s\S]*omitted optional page fields are reset or defaulted/,
  "full page replacement must warn about both block deletion and optional-field reset",
);
assert.match(
  siteArticlesSection,
  /lidfly_publish_blog_article[\s\S]*\/rss\.xml/,
  "article publishing must own the generated RSS workflow",
);
assert.match(
  siteVideoSection,
  /lidfly_list_blocks[\s\S]*lidfly_get_page[\s\S]*lidfly_get_block[\s\S]*lidfly_update_block[\s\S]*video-embed[\s\S]*VideoObject/,
  "video metadata must be edited through video-embed source props",
);
assert.match(
  siteCommerceFeedsSection,
  /Commerce source of truth[\s\S]*lidfly_publish_store[\s\S]*OfferCatalog[\s\S]*yandex-market\.yml[\s\S]*google-merchant\.xml/i,
  "store publication must own product schema and generated feeds",
);
assert.match(
  `${siteSeoSection}\n${siteCommerceReference}`,
  /Do not manually edit[\s\S]*JSON-LD[\s\S]*schemaOrigin[\s\S]*ssrProducts[\s\S]*generated HTML[\s\S]*RSS[\s\S]*YML/i,
  "clients must not mutate generated SEO artifacts or renderer internals",
);
assert.match(
  siteCommerceFeedsSection,
  /crawler_indexing_blocked[\s\S]*expected[\s\S]*not an SEO defect/i,
  "closed indexing must not be reported as a missing-feed defect",
);
assert.match(
  siteCommerceFeedsSection,
  /Yandex Webmaster[\s\S]*explicitly asks[\s\S]*webmaster_get_hosts[\s\S]*host_id[\s\S]*separate confirmed write/i,
  "YML generation and Webmaster registration must remain separate workflows",
);

const pageMigrationSkill = fs.readFileSync(
  path.join(sourceRoot, "lidfly-page-migration/SKILL.md"),
  "utf8",
);
assert.match(
  pageMigrationSkill,
  /lidfly_list_pages[\s\S]*lidfly_get_page[\s\S]*lidfly_get_block[\s\S]*design_template_id[\s\S]*lidfly_audit_site_design_template[\s\S]*before the first write/i,
  "page migration must audit an active site template before its first write",
);
assert.match(
  pageMigrationSkill,
  /intended template deviation[\s\S]*explicit textual confirmation before the write[\s\S]*confirm_template_deviation: true[\s\S]*auto-approve is not confirmation/i,
  "page migration must confirm template deviations before writing",
);
assert.match(
  pageMigrationSkill,
  /complete replacement payload from the same page read[\s\S]*all reconstructed blocks[\s\S]*expected_publication_revision[\s\S]*Missing blocks are deletions[\s\S]*omitted optional fields can reset/i,
  "page migration must use a complete CAS-guarded page replacement",
);
for (const field of [
  "title",
  "description",
  "og_image",
  "theme_preset",
  "theme",
  "page_kind",
  "inherit_site_design",
  "auto_structured_data",
]) {
  assert.ok(
    pageMigrationSkill.includes(`\`${field}\``),
    `page migration replacement must preserve ${field}`,
  );
}
assert.match(
  pageMigrationSkill,
  /Do not call `lidfly_update_site_theme` for a page-only migration or improvement[\s\S]*separate operation[\s\S]*cross-page impact before the write/i,
  "page-only migration must not mutate the site-wide theme",
);
assert.match(
  pageMigrationSkill,
  /Do not carry `custom_css` through this call[\s\S]*lidfly_get_css[\s\S]*lidfly_update_page_css[\s\S]*lidfly_update_site_css[\s\S]*expected_custom_css_sha256[\s\S]*64 KiB/i,
  "page migration must keep CSS out of page replacement and use dedicated CAS-guarded CSS tools",
);
assert.match(
  pageMigrationSkill,
  /Reread the page after the write[\s\S]*rerun `lidfly_audit_site_design_template`/i,
  "page migration must reread the page and reaudit template-sensitive changes",
);

const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.doesNotMatch(
  readme,
  /^(?:search_skills|get_skill|get_skill_resource)$/m,
  "README must not advertise unavailable MCP meta-tools",
);
assert.match(
  readme,
  /^get_write_operation_status$/m,
  "README must list the write-operation status tool used by current v3 workflows",
);
assert.match(
  readme,
  /^\| `lidfly-site-commerce` \|[^\n]*SEO\/social metadata[^\n]*Schema\.org[^\n]*RSS[^\n]*feeds \|$/m,
  "README must describe the expanded LidFly site/Commerce skill scope",
);

const agentsRules = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
const claudeRules = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
assert.equal(agentsRules, claudeRules, "AGENTS.md and CLAUDE.md must stay synchronized");
assert.match(
  agentsRules,
  /lidfly_get_css[\s\S]*lidfly_update_page_css[\s\S]*lidfly_update_site_css[\s\S]*expected_custom_css_sha256[\s\S]*Не передавай `custom_css` в `lidfly_update_page`[\s\S]*64 KiB/,
  "project rules must route custom CSS through its dedicated tools",
);

const vkSkill = fs.readFileSync(
  path.join(sourceRoot, "vk-ads-campaign-builder/SKILL.md"),
  "utf8",
);
assert.match(
  vkSkill,
  /goal_mode/,
  "VK Ads skill must preserve package goal_mode safety rules",
);

const avitoBusinessSkill = fs.readFileSync(
  path.join(sourceRoot, "avito-business/SKILL.md"),
  "utf8",
);
assert.match(
  avitoBusinessSkill,
  /avito_user_id[\s\S]*Не подменяй[\s\S]*account_id/,
  "Avito Business skill must not confuse profile avito_user_id with advertising account_id",
);
assert.match(
  avitoBusinessSkill,
  /POST \/autoload\/v1\/upload[\s\S]*полного фида[\s\S]*тот же неизменный `Id`[\s\S]*Avito ID[\s\S]*не обещ/i,
  "Avito Business skill must explain safe full-feed updates without promising provider statistics",
);

const transcriptionWorkflow = fs.readFileSync(
  path.join(
    sourceRoot,
    "video-article-writer/references/transcription-workflow.md",
  ),
  "utf8",
);
assert.match(
  transcriptionWorkflow,
  /4 hours/,
  "media workflows must know the real per-request transcription duration limit",
);
assert.match(
  transcriptionWorkflow,
  /M4A[\s\S]*200 MiB[\s\S]*segment_time 14340/,
  "media workflows must inspect and split long recordings before upload",
);
assert.match(
  transcriptionWorkflow,
  /For every chunk in filename order[\s\S]*invoke `request_upload_audio` once[\s\S]*original order/,
  "media workflows must transcribe and merge every chunk deterministically",
);
assert.match(
  transcriptionWorkflow,
  /Do not invent a `diarize` argument/,
  "media workflows must not invent an argument absent from the current upload schema",
);
assert.match(
  transcriptionWorkflow,
  /96k[\s\S]*14340[\s\S]*coupled[\s\S]*200 MiB/,
  "media workflows must keep bitrate and segment duration coupled to the upload limit",
);
assert.match(
  transcriptionWorkflow,
  /chunk-boundary marker[\s\S]*mark the seam[\s\S]*do not complete or reconstruct/,
  "media workflows must preserve and mark phrases cut at chunk boundaries",
);
assert.match(
  transcriptionWorkflow,
  /delete only the generated chunk paths recorded by this run[\s\S]*Do not delete the original media/,
  "media workflows must clean up only their own temporary chunks",
);

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
    fs
      .readdirSync(pluginSkills, { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).length,
    25,
    "plugin target must contain all canonical skills",
  );

  const provenanceTarget = path.join(pluginFixtureRoot, "provenance-target");
  const provenancePluginRoot = path.join(provenanceTarget, "plugins/lidfly");
  fs.mkdirSync(path.join(provenancePluginRoot, ".codex-plugin"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(provenancePluginRoot, ".codex-plugin/plugin.json"),
    `${JSON.stringify(
      { name: "lidfly", version: "1.0.0", skills: "./skills/" },
      null,
      2,
    )}\n`,
  );
  const firstPreparation = JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.join(root, "scripts/prepare-plugin-sync.mjs"),
        "--target-repo",
        provenanceTarget,
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  assert.equal(firstPreparation.changed, true);
  assert.equal(firstPreparation.plugin_version, "1.0.1");
  const preparedLock = JSON.parse(
    fs.readFileSync(
      path.join(provenancePluginRoot, "skills-source.lock.json"),
      "utf8",
    ),
  );
  assert.equal(
    preparedLock.skills_tree_sha256,
    sourceSnapshot.skills_tree_sha256,
  );
  assert.match(preparedLock.source.commit, /^[a-f0-9]{40}$/);
  assert.ok(
    fs.existsSync(path.join(provenanceTarget, "plugin-releases/1.0.1.json")),
  );
  const repeatedPreparation = JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.join(root, "scripts/prepare-plugin-sync.mjs"),
        "--target-repo",
        provenanceTarget,
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  assert.equal(repeatedPreparation.changed, false);
  assert.equal(
    JSON.parse(
      fs.readFileSync(
        path.join(provenancePluginRoot, ".codex-plugin/plugin.json"),
        "utf8",
      ),
    ).version,
    "1.0.1",
    "idempotent preparation must not bump the plugin twice",
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
  fs
    .readdirSync(path.join(root, ".agents/skills"), { recursive: true })
    .filter((item) => path.basename(item) === "skill.md").length,
  0,
  "lowercase .agents skill.md files remain",
);

const directSkill = fs.readFileSync(
  path.join(sourceRoot, "yandex-direct-campaign-builder/SKILL.md"),
  "utf8",
);
const directCreationReference = fs.readFileSync(
  path.join(sourceRoot, "yandex-direct-campaign-builder/references/campaign-creation-workflow.md"),
  "utf8",
);
assert.match(directCreationReference, /add_adgroup with adgroup_type: UNIFIED_AD_GROUP/);
assert.doesNotMatch(
  directCreationReference,
  /add_adgroup\/add_adgroups[\s\S]*UNIFIED_AD_GROUP/,
);
assert.match(directCreationReference, /add_adgroups.*legacy `TEXT_AD_GROUP`/);
const directLandingSection = markdownSection(
  directSkill,
  "## Лендинги Директа",
);
const directBrowserSection = markdownSection(
  directLandingSection,
  "### Браузерный fallback",
);
assert.match(directLandingSection, /clients\.site/);
assert.match(
  directLandingSection,
  /публичн.*API[\s\S]*не (?:позволяет|поддерживает)/i,
);
assert.match(
  directLandingSection,
  /не (?:вызывай|отправляй)[\s\S]*support/i,
);
assert.match(
  directBrowserSection,
  /уже авторизованн[\s\S]*пользователь прямо попросил/i,
  "browser fallback requires an existing session and an explicit user request",
);
assert.match(
  directBrowserSection,
  /Не запрашивать[\s\S]*не вводить[\s\S]*не сохранять[\s\S]*пароли[\s\S]*одноразовые коды/i,
  "browser fallback must not handle credentials",
);
assert.match(
  directBrowserSection,
  /показать точный план[\s\S]*явного текстового подтверждения[\s\S]*Ничего не сохранять[\s\S]*не публиковать[\s\S]*автоматически[\s\S]*перечитать состояние/i,
  "browser writes require a plan, confirmation, no automation, and reread",
);

const serpSkill = fs.readFileSync(
  path.join(sourceRoot, "serp-monitor/SKILL.md"),
  "utf8",
);
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
assert.doesNotMatch(
  editorialSkill,
  /запретить длинное тире|заменить «ёлочки»/i,
);

const articleReviserSkill = fs.readFileSync(
  path.join(sourceRoot, "article-reviser/SKILL.md"),
  "utf8",
);
assert.match(
  articleReviserSkill,
  /\$human-editorial-polish[\s\S]*complete Russian-pattern catalog/,
  "article-reviser must run the canonical Russian editorial pass",
);
assert.match(
  articleReviserSkill,
  /first meaningful screen[\s\S]*paste-ready command[\s\S]*two client scenarios[\s\S]*confirmed action or verifiable artifact[\s\S]*reread\/check/,
  "article-reviser must enforce the LidFly product story and verification arc",
);
assert.match(
  articleReviserSkill,
  /removing LidFly paragraphs leaves the method unchanged[\s\S]*rebuild the product arc/,
  "article-reviser must reject decorative LidFly mentions",
);

const articleWriterSkill = fs.readFileSync(
  path.join(sourceRoot, "article-writer/SKILL.md"),
  "utf8",
);
assert.match(articleWriterSkill, /^## LidFly Product Story Contract$/m);
assert.match(
  articleWriterSkill,
  /user situation → paste-ready command → concrete LidFly data\/tools → explained plan → confirmed action or verifiable artifact → reread\/check → next improvement cycle/,
  "article-writer must define the complete product arc",
);
assert.match(
  articleWriterSkill,
  /at least two client scenarios[\s\S]*experienced marketer's process accessible[\s\S]*Never invent a customer/,
  "article-writer must require client scenarios, expert reasoning, and honest examples",
);

const videoArticleWriterSkill = fs.readFileSync(
  path.join(sourceRoot, "video-article-writer/SKILL.md"),
  "utf8",
);
assert.match(videoArticleWriterSkill, /^## LidFly-Owned Material$/m);
assert.match(
  videoArticleWriterSkill,
  /first meaningful screen[\s\S]*at least two client scenarios[\s\S]*end-to-end LidFly workflow[\s\S]*Do not claim instant expertise/,
  "video-article-writer must carry the LidFly product story into derived articles",
);

const editorialPatterns = fs.readFileSync(
  path.join(
    sourceRoot,
    "human-editorial-polish/references/russian-patterns.md",
  ),
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
assert.match(
  editorialPatterns,
  /Если текст уже конкретен[\s\S]*не переписывать его/,
);
assert.match(
  editorialPatterns,
  /^### 14\. Синтаксические кальки и импортированные остроты$/m,
);
assert.match(
  editorialPatterns,
  /Тест вслух:[\s\S]*Тест обратного перевода:/,
);
assert.match(
  editorialPatterns,
  /английской многозначности[\s\S]*сохранять функцию приёма/,
);
assert.match(
  editorialPatterns,
  /Замена импортированного образа русской остротой:[\s\S]*стратегию снова назвали черновиком/,
);

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
