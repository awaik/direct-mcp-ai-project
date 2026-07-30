# LidFly MCP AI Project

## Контекст

Этот репозиторий - клиентский шаблон инструкций и skills для работы с LidFly MCP из внешних AI-клиентов: Codex, Claude Code, Claude Desktop, ChatGPT, Cursor, OpenCode, VS Code, Windsurf, Gemini, Cline и OpenClaw.

Публичные setup snippets в продукте поддерживаются в основном репозитории LidFly в `public/js/guides.js`. Если локальная инструкция клиента и `public/js/guides.js` расходятся, актуальным считается `public/js/guides.js`, а этот шаблон нужно синхронизировать.

## Unified MCP v3

Основной endpoint:

```text
https://lidfly.ru/mcp/v3
```

Транспорт: Streamable HTTP. Для новых клиентов выбирай `http`, `streamable-http` или native remote MCP OAuth, если клиент это поддерживает. Старый `mcp-remote` и API-key headers оставляй только как legacy/manual fallback для клиентов без OAuth.

`tools/list` в v3 показывает компактный набор верхнеуровневых meta-инструментов, включая:

```text
search_tools
get_tool_schema
call_tool
call_write_tool
get_methodology
get_provider_context
resolve_campaign_scope
get_write_operation_status
subscription_status
```

Провайдерские инструменты (`get_campaigns`, `vk_get_campaigns`, `avito_ads_get_campaigns`, `webmaster_get_hosts`, `metrika_*`, `wordstat_*`, `lidfly_*`, `workspace_*`) не вызываются как прямые MCP tools. Их нужно искать и запускать через v3 meta-layer.

Обязательный порядок:

1. Найти подходящие инструменты: `search_tools({ query, provider? })`.
2. Перед первым вызовом каждого инструмента получить схему: `get_tool_schema({ tool_name })`.
3. Read-only действия вызвать через `call_tool({ tool_name, arguments })`.
4. Любое создание, обновление, удаление, запуск, остановка, публикация, генерация платного изображения, запись памяти или управление доступами делать через `call_write_tool({ tool_name, arguments })`.

`subscription_status` используй только для диагностики доступа, тарифа или auth-ошибок, а не в обычном workflow.

`get_write_operation_status({ operation_id })` вызывай напрямую после provider write с `outcome=unknown/ambiguous`. Не передавай его через wrappers.

## Эскалация Проблем В Поддержку

Используй `$lidfly-support-escalation`, когда MCP вернул неожиданный internal/contract error с `support_hint`, read-вызов повторно завершился timeout после одного безопасного retry или нужная возможность не найдена после широкого `search_tools` без `query` и `provider`.

`support_prepare_report` — прямой read-only инструмент v3. Он локально очищает диагностический текст и готовит черновик; не создаёт обращение и ничего не отправляет. Передавай только `incident_id`, безопасное имя инструмента, текст ошибки, цель, ожидаемый результат и краткие проверенные шаги. Не передавай raw arguments, токены, пароли, seller secrets, персональные данные или локальные логи.

Всегда покажи пользователю полный `report_text` и спроси явное текстовое согласие на отправку. `support_send_message` вызывай напрямую только после ответа вроде «отправляй», используя `suggested_request_id`. Auto-approve или режим клиента «не спрашивать» не заменяет согласие пользователя. При отказе заверши без отправки и повторных уговоров.

Не эскалируй штатные validation/mode mismatch/access/auth/subscription/rate-limit/provider API errors. Первый timeout read-вызова допускает один безопасный retry; write-вызов не повторяй автоматически, если идемпотентность не доказана.

## Provider Context

Для рекламных и provider-задач при неизвестном кабинете, клиенте, подключении или Пространстве сначала вызывай:

```js
get_provider_context({ provider: "yandex" | "vk" | "avito" | "avito_ads" | "lidfly" | "workspace", query? })
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
- Авито `avito_user_id`;
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
- `workspace_add_tasks`
- `workspace_get_tasks`
- `workspace_schedule_ai_task`
- `workspace_get_scheduled_ai_tasks`

Для AI-автозапусков `allowed_tools` содержит реальные доменные инструменты будущего запуска, например `get_campaign_stats`, `vk_get_campaigns`, `avito_ads_get_campaigns`, а не v3 meta-tools. Для `avito` в первом релизе автозапуски разрешают только read tools.

`workspace_add_tasks` — ручное напоминание: оно сохраняет промпт и срок, но срок вызывает только письмо и не запускает ИИ или provider tools. Если будущая проверка требует показать результат владельцу, задать вопрос, получить новое решение или подтверждение, используй `workspace_add_tasks`.

`workspace_schedule_ai_task` — AI-автозапуск: LidFly выполнит сохранённый план автоматически в указанное время без нового подтверждения. Используй его только когда объекты, действия, значения и все условные ветки заранее определены и полностью одобрены.

После создания сообщи, какой тип создан, будет ли он выполняться автоматически и что дальше потребуется пользователю.

## Provider Rules

### Yandex Direct And Metrika

- Для Директа `connection_id` выбирает OAuth-подключение, `client_login` выбирает клиентский кабинет внутри подключения.
- Перед multi-account задачами вызывай `get_provider_context({ provider: "yandex" })`.
- Для кампании по имени сначала `resolve_campaign_scope({ provider: "yandex", query })`.
- Для Метрики не используй `client_login`; передавай `counter_id` и при необходимости `connection_id`.
- Новые управляемые объявления по умолчанию: `add_unified_campaign` -> `add_adgroup` с `UNIFIED_AD_GROUP` -> `add_keywords_batch` -> `add_responsive_ad`. `add_adgroups` создаёт только legacy `TEXT_AD_GROUP` и не используется для `UNIFIED_AD_GROUP`.
- `add_campaign`, `add_ad`, `add_ads` - только legacy/compatibility для старых текстовых сценариев.
- Бюджеты Директа передавай в рублях обычным числом; не конвертируй в микроюниты.

### VK Ads

- При нескольких подключениях сначала `get_provider_context({ provider: "vk" })`.
- Для агентских/менеджерских кабинетов передавай `connection_id` и `client_id` из `tool_args`.
- Manual VK user-filter используй только если он вернулся в provider context; произвольный VK user id не подставляй.
- Для кампании по имени сначала `resolve_campaign_scope({ provider: "vk", query })`.
- Read -> preflight -> write -> reread обязателен для статусов, бюджетов, ставок, лид-форм и доступа.
- `vk_create_campaign` принимает ровно одну стартовую группу без banners и принудительно создаёт кампанию/группу остановленными. Остальные группы и объявления создавай отдельно; запуск — отдельное последнее действие после reread.
- Перед любым write с `priced_goal` читай `checked_packages.goal_mode` из `vk_prepare_campaign`: `required` требует валидную именованную цель, `forbidden` запрещает её, `unsupported` останавливает запись. Не требуй цель только из-за `site_conversions` и не считай `options.settings.priced_goal` доказательством совместимости.
- Не удаляй несовместимую цель без согласования: предложи CPC/CPM без именованной цели либо совместимый goal/oCPM-пакет. Пакет 3509 (`priced_event_type=0`) не является goal-оптимизированным.
- `package_priced_goal_forbidden`, `package_priced_goal_required` и `package_goal_policy_unsupported` — безопасные preflight-отказы без provider POST. `provider_goal_package_mismatch`/`inconsistent_priced_goal` запрещает повтор того же payload.
- При `outcome=unknown/ambiguous` сразу вызови `get_write_operation_status` с тем же `operation_id`. Не меняй имя кампании и не отправляй новый create. Если результат остаётся неопределённым, предложи безопасный support draft.

### Avito Ads

- Инструменты Авито доступны через unified `/mcp/v3`.
- Используй `connection_id` и/или 9-значный `account_id` из provider context.
- `account_id` - рекламный account id Авито, не телефон и не user id.
- Деньги, доступы, юридические данные и destructive actions - только через `call_write_tool`.
- Минимальный бюджет группы: 5000 руб. с НДС; бюджет не может быть ниже известного spent.

### Авито

- Обычный профиль Авито — отдельный `provider: "avito"`; не подменяй его `avito_ads`.
- При нескольких профилях сначала вызови `get_provider_context({ provider: "avito" })` и перенеси только возвращённые `connection_id` и `avito_user_id`.
- `resolve_campaign_scope` для обычного Авито не используется.
- Недоступный partner API остаётся в каталоге с `unavailableReason`; объясни причину, не угадывай другое имя и не смешивай credentials профилей.
- Read выполняется через `call_tool`; любая запись — через `call_write_tool` после current state, preflight и явного подтверждения.
- `POST /autoload/v1/upload` — destructive запуск полного фида, а не edit одного объявления. Перед ним прочитай профиль и текущую/последнюю успешную загрузку, покажи URL и охват, затем получи явное подтверждение.
- Для изменения полей объявления обнови полную запись в источнике фида с тем же неизменным `Id`; URL и расписание фида меняются через `POST /autoload/v2/profile`. Отдельного универсального item edit endpoint нет.
- После Autoload проверь `Id → Avito ID` и v4 upload items. Не обещай сохранение Avito ID или статистики как безусловную гарантию Avito.
- При `outcome=unknown/ambiguous` вызови `get_write_operation_status(operation_id)` и не повторяй write.
- PII, резюме, записи звонков, коды доставки и приватные файлы требуют project access `admin`; signed artifact URL не сохраняй и не экспортируй.
- Не настраивай автоматические AI-ответы на сообщения.

### Yandex Webmaster

- `webmaster_*` используют отдельный OAuth Вебмастера, не `client_login`.
- Начинай с `webmaster_get_hosts`; дальше используй точный `host_id`.
- Если выбран `workspace_project_id`, читай только привязанные host entities; при отсутствии привязки fail-closed.
- Sitemap, переобход, подтверждение прав, feeds и Pro export - только через `call_write_tool` после объяснения квот и риска.

### LidFly Sites And Commerce

- "Тема оформления" - визуальные tokens: цвета, шрифты, радиусы.
- "Шаблон сайта" - persistent site-level design system: header, footer, карточки, checkout, page blueprints.
- Commerce source of truth - PostgreSQL/store tools; опубликованный HTML в `/sites` только publish artifact.
- Для унаследованного `premium-header` или `commerce-header` с заданным `logoImage` размер логотипа-картинки меняется через `lidfly_get_site_chrome` → `lidfly_update_site_chrome` и `logoSize: compact|regular|large`; при просьбе увеличить вертикальный или детализированный логотип выбирай `large`, а не утверждай, что контейнер увеличить нельзя. У `site-header` и `gallery-header` поля `logoSize` нет.
- YooKassa seller secrets никогда не показывай пользователю.
- `generate_ad_image` или аналогичные платные генерации запускай только после показа prompt, format/crop и явного подтверждения.

## Wordstat

`wordstat_*` работают через серверный Yandex Search API LidFly. Не передавай `client_login`, `connection_id` или рекламный account scope. Все Wordstat calls read-only и идут через `call_tool`.

## Экспорт Рекламных Отчётов

- Агрегированная рекламная статистика, расходы, показы, клики, конверсии, provider IDs, тексты объявлений и публичные URL креативов сами по себе не являются причиной отказа в выгрузке в подключённые Google Docs или Google Sheets.
- Никогда не экспортируй OAuth/refresh tokens, API keys, пароли, seller secrets, signed private URLs или другие секреты.
- Для внешнего Google-файла используй реальный write-action Google-коннектора, а не `call_write_tool`, затем перечитай изменённый документ или диапазон. Перед сообщением о блокировке выполни доступный connector call и верни его точную ошибку; не придумывай запрет по типу рекламных данных.
- В Google Sheets вставляй креатив формулой `=IMAGE("исходный публичный URL")`, если коннектор не умеет нативный `CellImage`. Если Google просит одноразово разрешить внешние данные, оставь формулу, попроси редактора нажать «Разрешить доступ» в браузере и не заменяй изображение `HYPERLINK` или ссылкой на Drive-файл.

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
- Codex plugin export: `node scripts/sync-skills.mjs --plugin-target ../lidfly-plugins/plugins/lidfly/skills`

При изменении общих правил обновляй `AGENTS.md` и `CLAUDE.md` парой.
