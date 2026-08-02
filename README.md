# direct-mcp AI Project

Клиентский шаблон для подключения AI-агентов к [LidFly MCP](https://lidfly.ru/): Яндекс Директ, Метрика, Яндекс Вебмастер, VK Ads, Авито Реклама, LidFly sites/Commerce и Пространства через один endpoint.

Шаблон нужен, чтобы внешний AI-клиент работал не как "чат с токеном", а как аккуратный оператор: сначала находит scope, читает состояние, показывает план, затем пишет только через подтверждённый write-вызов.

## Что Подключается

Основной endpoint:

```text
https://lidfly.ru/mcp/v3
```

v3 отдаёт компактный meta-layer, а не большой каталог provider tools:

```text
search_tools
get_tool_schema
call_tool
call_write_tool
get_methodology
get_provider_context
resolve_campaign_scope
subscription_status
```

AI ищет нужный доменный инструмент через `search_tools`, получает схему через `get_tool_schema`, читает через `call_tool`, а действия выполняет через `call_write_tool`. Каталог расширяется; не привязывайте инструкции к точному числу provider tools.

## Быстрый Старт

1. Зарегистрируйтесь в [LidFly](https://lidfly.ru/app).
2. Подключите нужные провайдеры в кабинете: Яндекс Директ/Метрика, Яндекс Вебмастер, VK Ads, Авито Реклама, сайты LidFly. Если стека ещё нет с нуля (счётчик Метрики, цели, подтверждённый Вебмастер) — сначала соберите его по [docs/setup-platforms.md](docs/setup-platforms.md).
3. Подключите AI-клиент к `https://lidfly.ru/mcp/v3`.
4. Проверьте scope запросом:

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

5. Начните с read-only аудита:

```text
Проверь кампанию <название>, найди scope сам, ничего не меняй без отдельного плана.
```

OAuth в браузере - основной путь для современных клиентов. API-key/Bearer header оставлен только как legacy/manual fallback для клиентов без remote MCP OAuth.

## Поддерживаемые Клиенты

| Клиент | Инструкция |
|---|---|
| Codex | [docs/setup-codex.md](docs/setup-codex.md) |
| Claude Code | [docs/setup-claude-code.md](docs/setup-claude-code.md) |
| ChatGPT | [docs/setup-chatgpt.md](docs/setup-chatgpt.md) |
| Claude Desktop | см. [docs/setup-claude-code.md](docs/setup-claude-code.md), раздел Connector |
| Cursor | [docs/setup-cursor.md](docs/setup-cursor.md) |
| VS Code / Copilot / MCP extensions | [docs/setup-vscode-copilot.md](docs/setup-vscode-copilot.md) |
| Windsurf | [docs/setup-windsurf.md](docs/setup-windsurf.md) |
| Cline | [docs/setup-cline.md](docs/setup-cline.md) |
| Gemini CLI | [docs/setup-gemini-cli.md](docs/setup-gemini-cli.md) |
| OpenClaw | [docs/setup-openclaw.md](docs/setup-openclaw.md) |

Публичные snippets подключения в продукте генерируются из `public/js/guides.js` основного репозитория LidFly. Этот AI-project - клиентский шаблон; если snippets разошлись, синхронизируйте их с `public/js/guides.js`.

## Пространства Для Агентств

Пространство хранит память пользователя. Workspace project внутри Пространства - это бизнес, проект, направление или клиент агентства.

Используйте `workspace_project_id` как канонический id для документов, решений, слепков, аналитики, задач и настроек. Provider accounts - это внешние сущности:

- Яндекс Директ: `client_login`
- VK Ads: `client_id` / `vk_client_id`
- Авито Реклама: `account_id`
- Метрика: `counter_id`
- Яндекс Вебмастер: `host_id`
- LidFly sites: `subdomain`

Если имя клиента или кабинета неоднозначно, AI должен показать кандидатов и попросить точный `workspace_project_id`. Он не должен создавать проект "Основной проект" молча.

## Стартовые Промпты

```text
Покажи доступные Пространства и кабинеты.
```

```text
Проверь кампанию "Бренд Москва", найди scope сам, сделай read-only аудит за 30 дней.
```

```text
Создай задачу проверить CPA этой кампании через неделю. allowed_tools укажи реальными доменными инструментами будущей проверки.
```

```text
Собери семантику через Wordstat для направления <услуга> и сохрани документ в нужное Пространство.
```

```text
Проверь сайт example.ru в Яндекс Вебмастере: запросы, страницы в поиске, sitemap и критичные проблемы.
```

```text
Покажи кампании Авито Рекламы и риски по бюджету. Ничего не меняй.
```

```text
Выгрузи отчёт по кампании «Бренд Москва» за последние 30 дней в Google Sheets по ссылке <URL>: добавь расходы, показы, клики, конверсии и публичные креативы, затем перечитай диапазон и проверь формулы.
```

## Skills

Канонический источник skills лежит в `skills-source/`. Клиентские копии в `.agents/skills` (актуальный Codex), `.codex/skills` (legacy compatibility), `.claude/skills` и `.openclaw/skills` генерируются командой:

```bash
node scripts/sync-skills.mjs
```

Правьте только `skills-source/<skill>/`, затем запускайте sync. Каждый skill хранит основной файл `SKILL.md` и Codex metadata в `agents/openai.yaml`. Генератор работает недеструктивно, отказывается перезаписывать расходящиеся клиентские копии и удаляет только известные legacy-файлы собственного старого формата.

Ключевые skills:

| Skill | Задача |
|---|---|
| `mcp-v3-provider-context` | Provider scope, `get_provider_context`, `resolve_campaign_scope` |
| `lidfly-support-escalation` | Диагностика MCP, очищенный черновик и отправка только после согласия |
| `workspace-project-manager` | Пространства, project-first memory, tasks, scheduled AI |
| `export-ad-reports` | Проверенная выгрузка отчётов и публичных креативов в Google Sheets и Google Docs |
| `yandex-direct-campaign-builder` | Директ, Wordstat, Метрика, modern EPK/responsive workflow |
| `vk-ads-campaign-builder` | VK Ads campaigns, groups, banners, statistics and guardrails |
| `avito-ads` | Авито Реклама read/write workflows |
| `yandex-webmaster` | Yandex Webmaster SEO audits and safe write actions |
| `lidfly-site-commerce` | LidFly sites, SEO/social metadata, Schema.org, assets, leads, Commerce, RSS and product feeds |
| `article-writer`, `video-article-writer`, `article-reviser`, `human-editorial-polish` | Контент, SEO/GEO, редактура без обхода детекторов |

## Настройка Под Бизнес

Заполните:

- `PROJECTS.md` - продукт, сайт, KPI, цели, география, ограничения;
- `LEGAL.md` - юридические ограничения формулировок;
- `.styles/*.md` - редакционные стили для контента.

Память кампаний и клиентов хранится в Пространствах LidFly, а не в локальных `campaigns/*.md`. Локальные файлы в `campaigns/` оставлены только как legacy-шаблон для ручной миграции.

## Структура

```text
.
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── PROJECTS.md
├── METRIKA-ADS-RULES.md
├── VK-ADS-RULES.md
├── LEGAL.md
├── skills-source/
├── scripts/sync-skills.mjs
├── docs/setup-*.md
├── .codex/config.toml
├── .mcp.json
├── .cursor/mcp.json
├── .vscode/mcp.json
├── .windsurf/mcp.json
├── .cline/mcp_settings.json
├── .gemini/settings.json
└── .openclaw/openclaw.example.json
```

## Безопасность

- Не коммитьте local token/config files.
- Не показывайте пользователю OAuth tokens, refresh tokens, seller secrets, provider client secrets.
- Write-действия идут через `call_write_tool` после read/preflight/плана.
- Для агентств и командных Пространств write-действия требуют точный `workspace_project_id`.

## Ссылки

- [lidfly.ru](https://lidfly.ru/)
- [Документация](https://lidfly.ru/docs)
- [Быстрый старт](https://lidfly.ru/docs/quickstart)
- [Для агентств](https://lidfly.ru/agencies)
