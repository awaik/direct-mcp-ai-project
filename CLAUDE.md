# LidFly MCP AI Project

## Контекст

Этот репозиторий - клиентский шаблон инструкций и skills для работы с LidFly MCP из внешних AI-клиентов: Codex, Claude Code, Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, Gemini, Cline и OpenClaw.

Публичные setup snippets в продукте поддерживаются в основном репозитории LidFly в `public/js/guides.js`. Если локальная инструкция клиента и `public/js/guides.js` расходятся, актуальным считается `public/js/guides.js`, а этот шаблон нужно синхронизировать.

## Unified MCP v3

Основной endpoint:

```text
https://lidfly.ru/mcp/v3
```

Транспорт: Streamable HTTP. Для новых клиентов выбирай `http`, `streamable-http` или native remote MCP OAuth, если клиент это поддерживает. Старый `mcp-remote` и API-key headers оставляй только как legacy/manual fallback для клиентов без OAuth.

`tools/list` в v3 показывает 8 meta-инструментов:

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

Провайдерские инструменты (`get_campaigns`, `vk_get_campaigns`, `avito_ads_get_campaigns`, `webmaster_get_hosts`, `metrika_*`, `wordstat_*`, `lidfly_*`, `workspace_*`) не вызываются как прямые MCP tools. Их нужно искать и запускать через v3 meta-layer.

Обязательный порядок:

1. Найти подходящие инструменты: `search_tools({ query, provider? })`.
2. Перед первым вызовом каждого инструмента получить схему: `get_tool_schema({ tool_name })`.
3. Read-only действия вызвать через `call_tool({ tool_name, arguments })`.
4. Любое создание, обновление, удаление, запуск, остановка, публикация, генерация платного изображения, запись памяти или управление доступами делать через `call_write_tool({ tool_name, arguments })`.

`subscription_status` используй только для диагностики доступа, тарифа или auth-ошибок, а не в обычном workflow.

## Provider Context

Для рекламных и provider-задач при неизвестном кабинете, клиенте, подключении или Пространстве сначала вызывай:

```js
get_provider_context({ provider: "yandex" | "vk" | "avito_ads" | "lidfly" | "workspace", query? })
```

Если пользователь назвал кампанию или часть названия кампании, сначала вызывай:

```js
resolve_campaign_scope({ provider: "yandex" | "vk" | "avito_ads", query, workspace_project_id? })
```

Дальше переноси в следующий `call_tool` или `call_write_tool` только возвращённые `scope_arguments` или `next_call.arguments`. Не придумывай `client_login`, `client_id`, `account_id`, `counter_id` или `host_id` из имени проекта.

Для campaign write в командных/агентских Пространствах всегда передавай точный `workspace_project_id`. Исключение допустимо только если `call_write_tool` preflight по campaign id нашёл ровно один Workspace/provider scope и явно вернул следующий безопасный вызов.

## Пространства И Workspace

Пользовательский термин: **Пространства**. Технический термин в API: `Workspace`.

Workspace project - бизнес, проект, направление или клиент агентства внутри Пространства. Канонический идентификатор:

```text
workspace_project_id
```

Внешние provider entities не являются Workspace-идентификаторами:

- Yandex Direct `client_login`;
- VK Ads `vk_client_id` или `client_id`;
- Avito Ads `account_id`;
- Metrika `counter_id`;
- LidFly `subdomain`;
- Yandex Webmaster `host_id`.

Перед записью решений, документов, аудитов, слепков кампаний, аналитики, настроек, provider links или задач используй один из способов резолва project scope:

- точный `workspace_project_id`;
- `project_name`, если он однозначен;
- provider + `external_entity_key`;
- `workspace_prepare_project_scope`.

Если scope неоднозначен, покажи кандидатов и попроси точный `workspace_project_id`. Не создавай молча проект "Основной проект".

Современные Workspace tools:

- `workspace_list_projects`
- `workspace_get_project`
- `workspace_create_project`
- `workspace_prepare_project_scope`
- `workspace_upsert_provider_entity`
- `workspace_link_campaign`
- `workspace_get_settings`
- `workspace_update_settings`
- `workspace_schedule_ai_task`
- `workspace_get_scheduled_ai_tasks`

Для AI-автозапусков `allowed_tools` содержит реальные доменные инструменты будущего запуска, например `get_campaign_stats`, `vk_get_campaigns`, `avito_ads_get_campaigns`, а не v3 meta-tools.

## Provider Rules

### Yandex Direct And Metrika

- Для Директа `connection_id` выбирает OAuth-подключение, `client_login` выбирает клиентский кабинет внутри подключения.
- Перед multi-account задачами вызывай `get_provider_context({ provider: "yandex" })`.
- Для кампании по имени сначала `resolve_campaign_scope({ provider: "yandex", query })`.
- Для Метрики не используй `client_login`; передавай `counter_id` и при необходимости `connection_id`.
- Новые управляемые объявления по умолчанию: `add_unified_campaign` -> `add_adgroup`/`add_adgroups` с `UNIFIED_AD_GROUP` -> `add_responsive_ad`.
- `add_campaign`, `add_ad`, `add_ads` - только legacy/compatibility для старых текстовых сценариев.
- Бюджеты Директа передавай в рублях обычным числом; не конвертируй в микроюниты.

### VK Ads

- При нескольких подключениях сначала `get_provider_context({ provider: "vk" })`.
- Для агентских/менеджерских кабинетов передавай `connection_id` и `client_id` из `tool_args`.
- Manual VK user-filter используй только если он вернулся в provider context; произвольный VK user id не подставляй.
- Для кампании по имени сначала `resolve_campaign_scope({ provider: "vk", query })`.
- Read -> preflight -> write -> reread обязателен для статусов, бюджетов, ставок, лид-форм и доступа.

### Avito Ads

- Инструменты Авито доступны через unified `/mcp/v3`.
- Используй `connection_id` и/или 9-значный `account_id` из provider context.
- `account_id` - рекламный account id Авито, не телефон и не user id.
- Деньги, доступы, юридические данные и destructive actions - только через `call_write_tool`.
- Минимальный бюджет группы: 5000 руб. с НДС; бюджет не может быть ниже известного spent.

### Yandex Webmaster

- `webmaster_*` используют отдельный OAuth Вебмастера, не `client_login`.
- Начинай с `webmaster_get_hosts`; дальше используй точный `host_id`.
- Если выбран `workspace_project_id`, читай только привязанные host entities; при отсутствии привязки fail-closed.
- Sitemap, переобход, подтверждение прав, feeds и Pro export - только через `call_write_tool` после объяснения квот и риска.

### LidFly Sites And Commerce

- "Тема оформления" - визуальные tokens: цвета, шрифты, радиусы.
- "Шаблон сайта" - persistent site-level design system: header, footer, карточки, checkout, page blueprints.
- Commerce source of truth - PostgreSQL/store tools; опубликованный HTML в `/sites` только publish artifact.
- YooKassa seller secrets никогда не показывай пользователю.
- `generate_ad_image` или аналогичные платные генерации запускай только после показа prompt, format/crop и явного подтверждения.

## Wordstat

`wordstat_*` работают через серверный Yandex Search API LidFly. Не передавай `client_login`, `connection_id` или рекламный account scope. Все Wordstat calls read-only и идут через `call_tool`.

## Ответ Пользователю

В финальном сообщении всегда отделяй:

- что было прочитано или проверено;
- какие scope identifiers использованы (`workspace_project_id`, provider entity);
- что изменено или подготовлено;
- что записано в Пространство;
- какие write-действия требуют отдельного подтверждения.

Не показывай токены, refresh tokens, seller secrets, internal provider routing, model/provider names или reasoning parameters.

## Навигация

- Яндекс Директ и Wordstat: `agent-direct_wordstat.md`, `METRIKA-ADS-RULES.md`
- VK Ads: `agent-vk.md`, `VK-ADS-RULES.md`
- Бизнес-настройки: `PROJECTS.md`
- Юридические ограничения публичного контента: `LEGAL.md`
- Canonical skills: `skills-source/`
- Skill sync: `node scripts/sync-skills.mjs`

При изменении общих правил обновляй `AGENTS.md` и `CLAUDE.md` парой.
