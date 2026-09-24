---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git ls-files:*), Bash(node scripts/sync-skills.mjs --check:*), Bash(node scripts/test-skills.mjs:*), Read, Grep, Glob
description: Code review незакоммиченных изменений
---

Собери все незакоммиченные изменения и проанализируй их.

Изменённые отслеживаемые файлы:
```bash
git diff
```

Застейдженные изменения:
```bash
git diff --cached
```

Новые (неотслеживаемые) файлы — прочитай их целиком через Read:
```bash
git status --short
git ls-files --others --exclude-standard
```

---

Ты ревьюер репозитория **direct-mcp-ai-project** — клиентского шаблона инструкций и agent skills для подключения внешних AI-клиентов (Codex, Claude Code, Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, Gemini CLI, Cline, OpenClaw) к LidFly MCP v3 (`https://lidfly.ru/mcp/v3`). Это не application-код: почти всё содержимое — markdown-инструкции, YAML-манифесты и несколько небольших `.mjs`-скриптов синхронизации (Node ≥22, без `package.json`/npm и без внешних зависимостей — запуск строго `node scripts/*.mjs`). Ошибка здесь — это не сломанная логика, а рассинхронизация документации, скрытая утечка секрета/пути или ослабленная проверка подписи в pipeline. Политика — `CLAUDE.md`/`AGENTS.md`, они обязаны обновляться парой и оставаться идентичными.

## Архитектура

```
CLAUDE.md, AGENTS.md              # идентичная пара — source of truth для MCP-workflow правил
README.md, PROJECTS.md, LEGAL.md, .styles/*.md   # бизнес- и редакционная настройка конкретного клиента
METRIKA-ADS-RULES.md, VK-ADS-RULES.md, agent-direct_wordstat.md, agent-vk.md   # provider-специфичные правила
skills-source/                    # generated signed-release projection из основного репо LidFly — НЕ редактируется вручную
  .lidfly-release-lock.json       # pinned release: schema_version, key_id, registry_digest, manifest_digest
.agents/skills/  .claude/skills/  .codex/skills/  .openclaw/skills/   # 4 клиентские копии, генерируются из skills-source
scripts/
  pull-lidfly-skills.mjs          # верифицированное обновление skills-source (Ed25519 + digests, fail-closed)
  sync-skills.mjs                 # skills-source → 4 клиентские копии (--check, --json, --plugin-target)
  test-skills.mjs                 # инвариант-тесты по конкретным skills, внутри вызывает sync-skills.mjs --check
  test-*.mjs, build-client-archives.mjs, prepare-plugin-sync.mjs   # точечные тесты и export-скрипты
.github/workflows/pull-lidfly-skills.yml   # cron/dispatch: pull → sync → test → sync --check → bot PR
docs/setup-*.md                   # инструкции по клиентам; публичные snippets синхронизированы с public/js/guides.js основного репо LidFly
```

## Проверь в первую очередь

**Skills — single source of truth (нарушение = MAJOR/CRITICAL)**
- `skills-source/` — generated projection подписанного release из основного репозитория LidFly. Ручная правка любого файла внутри `skills-source/` в этом репо — CRITICAL: следующий верифицированный `pull-lidfly-skills.mjs` откажется перезаписывать «manually diverged projection file», и запланированный cron (каждые 6 часов) начнёт стабильно фейлиться, пока кто-то не разрулит расхождение вручную. Легитимный путь изменить контент skill — правка в основном репозитории LidFly и последующий `node scripts/pull-lidfly-skills.mjs`.
- Если diff меняет `skills-source/<skill>/SKILL.md`, он обязан быть побайтово идентичен во всех 4 клиентских копиях (`.agents/skills`, `.codex/skills`, `.claude/skills`, `.openclaw/skills`) — это проверяет `test-skills.mjs`. Правка канона или одной клиентской копии без остальных — MAJOR.
- `agents/openai.yaml` не обязан быть идентичным между клиентами: осмысленные client-specific адаптации допустимы (например генерация изображений через встроенный Codex `imagegen` вместо LidFly `generate_ad_image` для Claude/OpenClaw), но расхождение должно быть объяснимым, а не случайным дрейфом. Отсутствие `agents/openai.yaml` в любой из 4 копий или legacy корневой `openai.yaml` (не внутри `agents/`) — MAJOR.
- `SKILL.md` frontmatter — только `name` (`[a-z0-9-]+`, совпадает с именем каталога) и `description` в кавычках. Ссылки `$skill-name` в тексте и в `agents/openai.yaml: default_prompt` должны указывать на реально существующий skill.
- Легитимные файлы skill по манифесту pull-скрипта — только `SKILL.md`, `agents/openai.yaml`, `references/*.md` (lowercase-hyphen); файл другого типа/расширения внутри skill вне этого паттерна не пройдёт verified pull.

**CLAUDE.md / AGENTS.md — обновляются парой**
- Это правило зафиксировано в самом CLAUDE.md: «При изменении общих правил обновляй AGENTS.md и CLAUDE.md парой». Diff, меняющий один файл без другого, — MAJOR. Сверь `diff CLAUDE.md AGENTS.md` после изменений — файлы должны совпадать.

**Локальные и фантомные ссылки**
- Никаких абсолютных путей `/Users/...` или другого локального username в skills/docs/references — это утечка и мёртвая ссылка для всех остальных пользователей шаблона.
- Ссылка на файл внутри `skills-source/**` или `docs/**`, претендующая быть локальной, должна реально резолвиться в этом дереве; кросс-репо зависимость (например, файл живёт в основном репозитории LidFly, а не здесь) должна быть явно помечена как таковая, без выдуманного локального пути.
- `test-skills.mjs` явно запрещает упоминание `` `LEGAL.md` `` / `` `PROJECTS.md` `` внутри канонических skills (это project-only файлы конкретного бизнеса, а не зависимость skill) — новая ссылка на них из `skills-source/**/*.md` — MAJOR.

**MCP v3 workflow и provider-инварианты — при правке provider-related текста**
- Порядок: `search_tools` → `get_tool_schema` → `call_tool` (read) / `call_write_tool` (write); провайдерские tools не вызываются как прямые MCP tools.
- `workspace_project_id` — канонический Workspace-идентификатор; provider entities (`client_login`, `vk_client_id`/`client_id`, `account_id`, `counter_id`, `host_id`, `subdomain`) не путать с ним и не собирать из имени проекта.
- Ключевые провайдерские инварианты (Yandex Direct: `add_unified_campaign`→`UNIFIED_AD_GROUP` по умолчанию, бюджеты в рублях; VK Ads: `vk_create_campaign` создаёт кампанию остановленной, `priced_goal` проверяется через `goal_mode`; Avito Ads: 9-значный `account_id`, минимум 5000 руб. на группу; LidFly sites: `logoSize` только для `premium-header`/`commerce-header`, YooKassa secrets не показываются) — если diff переписывает их иначе, чем в `CLAUDE.md`/`AGENTS.md`, без синхронной правки обоих файлов, это рассинхронизация source of truth и skills — MAJOR.

**Секреты и примеры**
- Никаких реальных OAuth/refresh tokens, API keys, Bearer-токенов, YooKassa seller secrets, паролей в `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `.windsurf/mcp.json`, `.cline/mcp_settings.json`, `.gemini/settings.json`, `.openclaw/*.json`, примерах и skills — только плейсхолдеры. Реальный секрет в diff — CRITICAL.
- Примеры `client_login`/`account_id`/`counter_id`/`host_id`/`workspace_project_id` в документации должны быть очевидно фиктивными.

**Supply-chain безопасность skills pipeline (ослабление = CRITICAL)**
- `scripts/pull-lidfly-skills.mjs`: фиксированный `PUBLIC_BASE_URL`, pinned `PUBLIC_KEY_SPKI_BASE64`, Ed25519 `crypto.verify(null, bytes, key, signature)`, проверка `manifest_digest`/`registry_digest` и digest каждого файла, fail-closed отказ перезаписывать вручную изменённый файл. Любое ослабление (URL/ключ через аргумент или env, пропуск digest-проверки, перезапись при расхождении без ошибки) открывает supply-chain атаку на весь skills pipeline сразу для всех клиентов шаблона — CRITICAL.
- `.github/workflows/pull-lidfly-skills.yml`: минимальные `permissions` (`contents: write`, `pull-requests: write`), `git push --force-with-lease` (не голый `--force`), токен только через `${{ github.token }}`, не hardcoded PAT.
- `skills-source/.lidfly-release-lock.json` меняется только через `pull-lidfly-skills.mjs`; ручная правка `schema_version`/`key_id`/`registry_digest`/`manifest_digest` обесценивает immutable-гарантию — CRITICAL.

**Тесты — нет package.json/npm, всё через `node scripts/*.mjs` напрямую**
- Затронут любой файл под `skills-source/`, `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, `.openclaw/skills/`, `scripts/sync-skills.mjs`, `scripts/pull-lidfly-skills.mjs` или `.github/workflows/pull-lidfly-skills.yml` → прогони `node scripts/sync-skills.mjs --check` и `node scripts/test-skills.mjs`, приложи результат.
- `test-skills.mjs` содержит десятки точечных regex-проверок конкретных формулировок в конкретных skills (site-commerce, page-migration, vk, editorial и т.д.) — при падении цитируй сообщение конкретного `assert`, а не пересказывай его своими словами.
- Точечная функциональность → соответствующий тест, если он существует: `test-connection-doctor.mjs`, `test-export-ad-reports.mjs`, `test-lidfly-knowledge-maintainer.mjs`, `test-lidfly-support-escalation.mjs`, `test-workspace-project-manager.mjs`, `test-client-archives.mjs`.
- Правки внутри `scripts/*.mjs` сами по себе — обычный Node.js код: проверяй как код (границы try/catch, работа с fs/crypto, отсутствие лишних зависимостей вне stdlib), а не только как генератор markdown.

**Бизнес-конфиги и legacy**
- `PROJECTS.md`, `LEGAL.md`, `.styles/*.md` — настройка конкретного бизнеса, не архитектура; но контентные skills (`article-writer`, `article-reviser`, ...) не должны противоречить ограничениям `LEGAL.md`.
- `campaigns/*.md` — legacy-шаблон только для ручной миграции (память кампаний живёт в Пространствах LidFly); новую функциональность сюда не добавляют.
- `docs/setup-*.md` — если diff меняет способ подключения (endpoint, transport, headers), а публичные snippets — источник истины в `public/js/guides.js` основного репозитория LidFly, напомни об этом в ответе, а не только в docs этого репозитория.

## Напоминания (не часть самого ревью, упомяни если применимо)

- Правка внутри `skills-source/` вручную (не через `pull-lidfly-skills.mjs`) → следующий verified pull будет фейлиться на «manually diverged projection file».
- Правка клиентской копии без пересборки через `node scripts/sync-skills.mjs` → `sync-skills.mjs --check` упадёт.
- Изменён CLAUDE.md или AGENTS.md без другого → напомни синхронизировать пару.
- Новый skill добавлен → обновить таблицу «Ключевые skills» в README.md и свериться с ожидаемым числом skills в `test-skills.mjs`.

---

## Формат ответа

**🔴 CRITICAL** — ручная правка `skills-source/` или `.lidfly-release-lock.json` мимо pull-pipeline, реальный секрет/токен в diff, ослабление подписи/digest-проверки в `pull-lidfly-skills.mjs`, `push --force` без `--force-with-lease` в CI

**🟡 MAJOR** — рассинхронизация `SKILL.md` между каноном и клиентскими копиями, отсутствующий `agents/openai.yaml`, локальный `/Users/...` путь или фантомная ссылка, ссылка на `LEGAL.md`/`PROJECTS.md` из канонического skill, provider-инвариант в skill разошёлся с CLAUDE.md/AGENTS.md, CLAUDE.md/AGENTS.md изменены не парой

**🟢 MINOR** — стиль формулировок, нейминг, мелкие уточнения в docs/примерах

Будь кратким. Указывай `файл:строка` и что конкретно исправить. Если изменения чистые — так и скажи.
