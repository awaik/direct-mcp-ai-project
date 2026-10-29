# LidFly MCP AI Project

## Контекст

Этот репозиторий — официальный клиентский шаблон инструкций, конфигов и skills, созданный и поддерживаемый командой **[LidFly](https://lidfly.ru/)** (`https://lidfly.ru/`) для работы с LidFly MCP из внешних AI-клиентов: Codex, Claude Code, Claude Desktop, ChatGPT, Cursor, OpenCode, VS Code, Windsurf, Gemini, Cline и OpenClaw.

Публичные setup snippets в продукте поддерживаются в основном репозитории LidFly в `public/js/guides.js`. Если локальная инструкция клиента и `public/js/guides.js` расходятся, актуальным считается `public/js/guides.js`, а этот шаблон нужно синхронизировать.

Этот файл задаёт общие правила и маршрутизацию. Подробные методики — в skills (`$имя-skill`).

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
- Редакционные стили для статей (Хабр, VC.ru, блог): `.styles/*.md` (например, `.styles/awaik.md`)
- Юридические ограничения публичного контента: `LEGAL.md`
- Сопровождение шаблона (обновление skills, экспорт плагина, лимит размера этого файла): `README.md` → «Сопровождение шаблона».

## Возможности LidFly и поиск инструментов

LidFly MCP объединяет Яндекс Директ, Яндекс Метрику (Metrika), Яндекс Аудитории
(Audience), AppMetrica, Яндекс Вебмастер (Webmaster), Wordstat, VK Ads, сообщества
ВКонтакте (`vk_social`), обычное Авито (`avito`) и Авито Рекламу (`avito_ads`),
публикации и ведение каналов/групп в Telegram (`telegram`) и мессенджере MAX (`max`);
сайты, базы знаний, Commerce, ИИ-помощника (`ermiy_*`) и генерацию документов по
образцам (`business_docs_*`); Пространства с памятью, документами и задачами;
изображения, распознавание аудио и отдельный MCP бухгалтерии УСН «Доходы»
(`https://lidfly.ru/mcp/accounting`, `accounting_*`).

Подсказки для `search_tools({ query })`: посещаемость, цели, конверсии — `metrika`; приложения —
`appmetrica`; сегменты и базы клиентов — `audience`; SEO и индексация — `webmaster`; спрос и
частотность — `wordstat`; Telegram, сообщества ВКонтакте, MAX — `telegram`, `vk_social`, `max`;
профиль Авито — `avito`; ИИ-консультант и договоры — `ermiy`, `business_docs`; бесплатная
расшифровка аудио и видео — `audio`. Так ищи и тогда, когда пользователь не назвал LidFly или сервис.

Отсутствие профильного инструмента в `tools/list` не означает отсутствие возможности:
сначала выполни поиск, получи `get_tool_schema`, затем используй нужный read/write wrapper.
Если поиск пуст, попробуй короткое название сервиса и поиск без фильтров; усечённый
список не является полным каталогом. Наличие инструмента не доказывает доступ к
конкретному счётчику или сайту: scope и разрешения проверяются отдельно через MCP.
Метрика начинает с `metrika_get_counters`, Вебмастер — с `webmaster_get_hosts`.
Не подставляй для них `client_login` Директа.

## Unified MCP v3

Основной endpoint:

```text
https://lidfly.ru/mcp/v3
```

Транспорт: Streamable HTTP (`http`, `streamable-http` или native remote MCP OAuth). OAuth — способ по умолчанию. API-ключ — по явному выбору пользователя или для клиента без OAuth: ключ в `LIDFLY_TOKEN`, в конфиге ссылка на переменную окружения (`docs/setup-api-key.md`). Не добавляй Bearer header в общие OAuth-конфиги и не смешивай два способа авторизации в одном подключении. `mcp-remote` — только для клиентов без native HTTP MCP.

`tools/list` в v3 показывает компактный набор верхнеуровневых meta-инструментов: `search_tools`, `get_tool_schema`, `call_tool`, `call_write_tool`, `get_methodology`, `get_provider_context`, `resolve_campaign_scope`, `get_write_operation_status`, `subscription_status` и другие.

Провайдерские инструменты (`get_campaigns`, `vk_get_campaigns`, `avito_ads_get_campaigns`, `webmaster_get_hosts`, `metrika_*`, `wordstat_*`, `lidfly_*`, `workspace_*`) не вызываются как прямые MCP tools. Их нужно искать и запускать через v3 meta-layer.

Обязательный порядок:

1. Найти подходящие инструменты: `search_tools({ query, provider? })`.
2. Перед первым вызовом каждого инструмента получить схему: `get_tool_schema({ tool_name })`.
3. Read-only действия вызвать через `call_tool({ tool_name, arguments })`.
4. Любое создание, обновление, удаление, запуск, остановка, публикация, генерация платного изображения, запись памяти или управление доступами делать через `call_write_tool({ tool_name, arguments })`.

`subscription_status` используй только для диагностики доступа, тарифа или auth-ошибок либо как одиночный connectivity/auth probe после повторной транспортной ошибки read-вызова по правилам ниже; не включай его в обычный workflow.

`get_write_operation_status({ operation_id })` вызывай напрямую после provider write с `outcome=unknown/ambiguous`. Не передавай его через wrappers.

## Эскалация Проблем В Поддержку

Используй `$lidfly-support-escalation`, когда MCP вернул неожиданный internal/contract error с `support_hint`, read-вызов повторно завершился timeout после одного безопасного retry или нужная возможность не найдена после широкого `search_tools` без `query` и `provider`.

`support_prepare_report` — прямой read-only инструмент v3: готовит очищенный черновик и ничего не отправляет. Передавай только `incident_id`, имя инструмента, безопасный текст ошибки, цель и проверенные шаги — без raw arguments, токенов, секретов и персональных данных. Покажи пользователю полный `report_text`; `support_send_message` вызывай только после явного текстового согласия, с `suggested_request_id`. Auto-approve или режим клиента «не спрашивать» не заменяет согласие пользователя. При отказе ничего не отправляй.

Не эскалируй штатные validation/access/auth/subscription/rate-limit/provider API errors. Первый timeout read-вызова допускает один безопасный retry; write-вызов не повторяй автоматически, если идемпотентность не доказана.

`transport send error`, `HTTP request failed`, HTTP 000 и ответ без HTTP-статуса — транспортная неопределённость, а не ошибка LidFly или площадки. Для read сделай один retry; при повторной ошибке вызови `subscription_status({})` как одиночный probe. Если probe ответил, соединение восстановлено: повтори исходный read и продолжи задачу; если нет — готовь support draft.

`capability_notice.status=unsupported_by_provider_api` — ограничение публичного API площадки, а не ошибка LidFly: объясни `user_action` и альтернативы, не подменяй задачу похожим инструментом и не эскалируй.

## Provider Context

Если кабинет, клиент, подключение или Пространство неизвестны, сначала вызови `get_provider_context({ provider, query?, client_login? })`; `provider`: `yandex`, `vk`, `vk_social`, `telegram`, `max`, `avito`, `avito_ads`, `lidfly` или `workspace`. Если пользователь назвал кампанию, сначала вызови `resolve_campaign_scope({ provider: "yandex" | "vk" | "avito_ads", query, workspace_project_id? })`. Точный логин Директа передавай в `client_login`, а не в `query`.

В следующий `call_tool` или `call_write_tool` переноси только возвращённые `tool_args`, `scope_arguments` или `next_call.arguments`. Не придумывай `client_login`, `client_id`, `account_id`, `counter_id` или `host_id` по названиям. Автоматически выполняй только read-only `next_action` с `may_execute_automatically=true`; неоднозначность, конфликт, outage и not-found в `scope_issues` не обходи догадками. Подробности — `$mcp-v3-provider-context`.

`provider_link_candidates` — проверенные личные кабинеты, ещё не связанные с выбранным Пространством. Если пользователь попросил привязать кабинет, выполни только готовый `next_action` выбранного кандидата через `call_write_tool` с обычным подтверждением; при нескольких кандидатах сначала попроси выбрать. Это штатный сценарий, а не повод для обращения в поддержку.

Для campaign write в командных/агентских Пространствах передавай точный `workspace_project_id`. Исключение — preflight `call_write_tool` нашёл ровно один scope и вернул следующий безопасный вызов.

## Пространства И Workspace

Пользовательский термин — **Пространства**, в API — `Workspace`. Workspace project — бизнес, направление или клиент агентства; канонический идентификатор — `workspace_project_id`. Идентификаторы кабинетов (`client_login`, `audience_connection_id`, VK `client_id`, `group_id`, `chat_binding_id`, `avito_user_id`, Avito Ads `account_id`, `counter_id`, LidFly `subdomain`, `host_id`) не являются Workspace-идентификаторами.

Перед записью решений, документов, аудитов, аналитики, настроек, provider links или задач резолви проект: точный `workspace_project_id`, однозначный `project_name`, provider + `external_entity_key` или `workspace_prepare_project_scope`. Если scope неоднозначен, покажи кандидатов и попроси точный `workspace_project_id`. Не создавай молча проект "Основной проект". Подробности — `$workspace-project-manager`.

`workspace_add_tasks` — ручное напоминание: срок вызывает только письмо и не запускает ИИ или provider tools. Если будущая проверка требует показать результат владельцу, получить новое решение или подтверждение, используй `workspace_add_tasks`.

`workspace_schedule_ai_task` — AI-автозапуск: LidFly выполнит сохранённый план в указанное время без нового подтверждения. Используй его, только когда объекты, действия, значения и условные ветки заранее определены и одобрены. В `allowed_tools` указывай доменные инструменты запуска (`get_campaign_stats`, `vk_get_campaigns`), а не meta-tools; для `avito` автозапуски разрешают только read tools.

После создания сообщи, какой тип создан, будет ли он выполняться автоматически и что дальше потребуется пользователю.

## Provider Rules

### Yandex Direct And Metrika

- Для Директа `connection_id` выбирает OAuth-подключение, `client_login` выбирает клиентский кабинет внутри подключения.
- Для Метрики не используй `client_login`; передавай `counter_id` и при необходимости `connection_id`.
- `GoalId=13` — служебное значение «все PriorityGoals», а не количество целей. `get_strategy_learning_status` даёт расчётную оценку Reports API, не нативный статус из интерфейса Директа; при расхождении доверяй интерфейсу и никогда не превращай «статус не определён» в «обучение идёт нормально».
- Новые управляемые объявления по умолчанию: `add_unified_campaign` -> `add_adgroup` с явным `unified_offer_retargeting` (в том числе `false`; так создаётся группа ЕПК) -> `add_keywords_batch` -> `add_responsive_ad`. `add_adgroups` создаёт только legacy `TEXT_AD_GROUP` и не используется для ЕПК.
- `add_campaign`, `add_ad`, `add_ads` - только legacy/compatibility для старых текстовых сценариев.
- Бюджеты Директа передавай в рублях обычным числом; не конвертируй в микроюниты.
- Для Яндекс Аудиторий (`audience_*`) используй `audience_connection_id` или точный `workspace_project_id`; для загрузки CSV с контактами клиентов сначала вызывай `audience_request_csv_upload`, а создание/изменение/удаление сегментов и выдачу доступов выполняй через `call_write_tool`.
- Для AppMetrica (`appmetrica_*`) начинай с `appmetrica_list_applications`, затем передавай точный `application_id` через `call_tool` без `client_login`.

### VK Ads

- Для агентских/менеджерских кабинетов передавай `connection_id` и `client_id` из `tool_args`.
- Manual VK user-filter используй только если он вернулся в provider context; произвольный VK user id не подставляй.
- Read -> preflight -> write -> reread обязателен для статусов, бюджетов, ставок, лид-форм и доступа.
- `vk_create_campaign` принимает ровно одну стартовую группу без banners и принудительно создаёт кампанию/группу остановленными. Остальные группы и объявления создавай отдельно; запуск — отдельное последнее действие после reread.
- Перед любым write с `priced_goal` читай `checked_packages.goal_mode` из `vk_prepare_campaign`: `required` требует валидную именованную цель, `forbidden` запрещает её, `unsupported` останавливает запись. Не требуй цель только из-за `site_conversions` и не считай `options.settings.priced_goal` доказательством совместимости.
- Не удаляй несовместимую цель без согласования: предложи CPC/CPM без именованной цели либо совместимый goal/oCPM-пакет. Пакет 3509 (`priced_event_type=0`) не является goal-оптимизированным.
- `package_priced_goal_forbidden`, `package_priced_goal_required` и `package_goal_policy_unsupported` — безопасные preflight-отказы без provider POST. `provider_goal_package_mismatch`/`inconsistent_priced_goal` запрещает повтор того же payload.
- При `outcome=unknown/ambiguous` сразу вызови `get_write_operation_status` с тем же `operation_id`. Не меняй имя кампании и не отправляй новый create. Если результат остаётся неопределённым, предложи безопасный support draft.

### Avito Ads

- Используй `connection_id` и/или 9-значный `account_id` из provider context.
- `account_id` - рекламный account id Авито, не телефон и не user id.
- Деньги, доступы, юридические данные и destructive actions - только через `call_write_tool`.
- Минимальный бюджет группы: 5000 руб. с НДС; бюджет не может быть ниже известного spent.

### Авито

- Обычный профиль Авито — отдельный `provider: "avito"`; не подменяй его `avito_ads`. Методика — `$avito-business`.
- При нескольких профилях сначала вызови `get_provider_context({ provider: "avito" })` и перенеси только возвращённые `connection_id` и `avito_user_id`; `resolve_campaign_scope` здесь не используется.
- Любая запись — через `call_write_tool` после чтения текущего состояния, preflight и явного подтверждения. `POST /autoload/v1/upload` — destructive запуск полного фида, а не правка одного объявления.
- При `outcome=unknown/ambiguous` вызови `get_write_operation_status(operation_id)` и не повторяй write.
- PII, резюме, записи звонков, коды доставки и приватные файлы требуют project access `admin`; signed artifact URL не сохраняй и не экспортируй.
- Не настраивай автоматические AI-ответы на сообщения.

### Сообщества ВКонтакте (vk_social), Telegram И MAX

- Ведение сообществ ВКонтакте — отдельный `provider: "vk_social"` (`vk_social_*`), не подменяй его рекламным кабинетом `provider: "vk"` (VK Ads). Сначала резолви `connection_id` и `group_id` через `get_provider_context({ provider: "vk_social" })` или `vk_social_list_groups`.
- Для каналов и групп Telegram (`provider: "telegram"`, `telegram_*`) и каналов в мессенджере MAX (`provider: "max"`, `max_*`) сначала получай `connection_id` и `chat_binding_id` через `get_provider_context` либо `telegram_list_chats` / `max_list_chats`. Не подставляй произвольный `chat_id` или `@username` без привязки в LidFly.
- Перед публикацией или планированием поста в Telegram или MAX предлагай безопасный предпросмотр в личном чате с ботом (`telegram_preview_post` или `max_preview_post`).
- Чтение статистики, постов, ленты канала (`max_get_channel_history`) и комментариев — через `call_tool`; публикация, отложенный пост, правка, закрепление, удаление, ответ, модерация или сообщение сообщества — только через `call_write_tool` после явного подтверждения текста, медиа и времени выхода. Методики — `$telegram-posting`, `$max-posting`.

### Yandex Webmaster

- `webmaster_*` используют отдельный OAuth Вебмастера, не `client_login`.
- Начинай с `webmaster_get_hosts`; дальше используй точный `host_id`.
- Если выбран `workspace_project_id`, читай только привязанные host entities; при отсутствии привязки fail-closed.
- Sitemap, переобход, подтверждение прав, feeds и Pro export - только через `call_write_tool` после объяснения квот и риска.

### LidFly Sites And Commerce

- Страницы, редизайн, Commerce, шаблон и chrome сайта веди по `$lidfly-site-commerce` и его visual guides. После записи смотри реальные desktop/mobile изображения: technical pass не подтверждает визуальное качество. При точечной правке сохраняй существующий стиль.
- Перед первой записью в сайт с `design_template_id` вызывай `lidfly_audit_site_design_template` и сохраняй inheritance. `confirm_template_deviation=true` допустим только после показа последствий и явного текстового согласия пользователя, никогда автоматически или из-за auto-approve.
- Commerce source of truth - PostgreSQL/store tools; опубликованный HTML в `/sites` только publish artifact. YooKassa seller secrets никогда не показывай пользователю.
- Custom CSS веди отдельными инструментами: сначала `lidfly_get_css`, затем `lidfly_update_page_css` для одной страницы или `lidfly_update_site_css` для общих правил, с `expected_custom_css_sha256` из того же чтения. Не передавай `custom_css` в `lidfly_update_page`: отсутствие поля сохраняет текущий CSS; пустая строка в CSS-инструменте очищает выбранный уровень. Каскад: theme tokens → platform block CSS → site CSS → page CSS; лимит каждого уровня 64 KiB, `</style` запрещён. На шаблонном сайте непустой CSS требует явного согласия и `confirm_template_deviation=true`.
- `generate_ad_image` или аналогичные платные генерации запускай только после показа prompt, format/crop и явного подтверждения.
- Сайт с `design_template_id="knowledge-base"` веди через `$lidfly-knowledge-maintainer`, а не последовательными page writes.
- Для базы знаний ИИ-помощника (`ermiy_*`: сайт, Авито, ВКонтакте) и подготовки договоров/КП по образцам Word (`business_docs_*`) сначала проверяй черновик или `changeset`, а публикацию и сохранение выполняй через `call_write_tool`.

## Wordstat

`wordstat_*` работают через серверный Yandex Search API LidFly. Не передавай `client_login`, `connection_id` или рекламный account scope. Все Wordstat calls read-only и идут через `call_tool`.

## Статьи, Видео И Редактура

Контентные skills включай автоматически по задаче, даже если пользователь не назвал skill:

- статья из видео или аудио, включая файлы 1 ГБ+ и многочасовые записи, — `$video-article-writer`: локальная нарезка `ffmpeg` и бесплатная расшифровка в LidFly (`request_upload_audio`, `get_transcription`);
- упаковка видео для YouTube (названия, описание, таймкоды, теги, обложка) — `$youtube-video-seo`;
- новая статья на Хабр, VC.ru, в блог или на сайт — `$article-writer` с редстандартом `.styles/*.md`;
- ревизия готовой статьи или HTML — `$article-reviser`; редактура и «гуманизация» текста — `$human-editorial-polish`.

Статью из видео и новую статью всегда доводи цепочкой `$article-reviser` → `$human-editorial-polish`. Пиши строго по проверенным фактам: сохраняй цифры, имена, цитаты, код и ссылки, не выдумывай истории и не занимайся обходом AI-детекторов.

## Экспорт Рекламных Отчётов

Выгрузку в Google Docs или Google Sheets веди по `$export-ad-reports`. Агрегированная статистика, расходы, provider IDs, тексты объявлений и публичные URL креативов сами по себе не причина отказа. OAuth/refresh tokens, API keys, пароли, seller secrets и signed private URLs не экспортируй никогда. Используй реальный write-action Google-коннектора, а не `call_write_tool`, затем перечитай результат; при ошибке верни её точный текст.
