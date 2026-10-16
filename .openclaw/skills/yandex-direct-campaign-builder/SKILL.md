---
name: yandex-direct-campaign-builder
description: "Создавать, аудитить, запускать и оптимизировать кампании Яндекс Директа через LidFly MCP v3 с Wordstat, Метрикой и точным provider scope. Использовать для кампаний, групп, ключей, объявлений, ставок, бюджетов и статистики с современным ЕПК workflow."
---

# Yandex Direct Campaign Builder

Use for Yandex Direct campaign creation, audit, optimization, budgets, keywords, negative keywords, responsive ads, search queries, Wordstat, and Metrika-linked decisions.

## Основания для выводов при аудите

Перед выводом проверь соответствующее основание. Если данных нет, выполни нужное чтение или явно оставь вопрос открытым; не выдавай совет по неподтверждённой причине. Таблица задаёт условия конкретного вывода, а не список вызовов на каждый вопрос.

| Вывод или рекомендация | Необходимое основание |
| --- | --- |
| CPA регистрации, оплаты или заявки | Явные ID и название цели, период и атрибуция. Без `goals` называй только целевые визиты по всем целям. Цели можно взять из `get_campaigns` → «Ключевые цели» без выбранного проекта. При общем аудите, если там есть оплата, до итогового плана прочитай её отдельно от регистрации; доступный read не откладывай в совет пользователю. |
| Повышение бюджета | Расход относительно применимого лимита за сопоставимые периоды и проверка причины недорасхода. Наличие конверсий само по себе недостаточно. При недорасходе не называй текущий бюджет узким местом и не предлагай его повысить без отдельного доказательства упора в лимит. |
| Изменение или снятие потолка ставки | Стратегия, место показа, статистика и доступные аукционные данные: `get_keyword_bids` с `AuctionBids` для фраз (у автотаргетинга поле `null`). Текущая оценка аукциона не доказывает историческую причину падения. При снятии потолка объясни риск дорогих кликов. |
| Чистка запросов и минус-фразы | Реальные запросы, объём просмотренной выборки, операторы минус-фразы и фактические пересечения со своими фразами. Неполный топ по расходу не описывает весь хвост. |
| Причина падения показов или трафика | Сопоставимые периоды; состояние счёта, ставка/аукцион, бюджет и настройки. При общем аудите «почему просела» прочитай `get_account_balance`. Без истории значений настроек причина остаётся гипотезой: журнал LidFly покрывает только свои действия, `check_campaign_changes` не возвращает старые и новые значения. |
| Поломка аналитики | Нули по целям при живом трафике — основание проверить код, события и настройки цели, а не доказательство поломки. |
| Почему сейчас нет показов | `diagnose_ad_delivery`: причина — только `kind=blocker` с её `extent`; `observation` — неустановленная причина, `unchecked` — непроверенные уровни. Порядок — в [показах, бюджете и конкурентах](references/serving-budget-competitors.md). |
| Бюджет, которого должно хватить на период | Решение пользователя, текущие бюджеты, баланс и, при необходимости, расход за период; сценарий полного расходования лимитов против баланса, а не прогноз. |
| Офферы и цены конкурентов | Прочитанная страница этого конкурента с источником. Своя посадочная, названия кампаний, Wordstat и поисковые запросы не подтверждают чужих цен. |
| Кампанию нельзя настроить через LidFly (`statistics_only`) | Полное чтение `get_campaigns` точного ID в том же кабинете без фильтров состояний не вернуло кампанию, а Reports того же кабинета вернул её строки. Ошибка, timeout, фильтр или другой кабинет — неполное наблюдение: сначала уточни scope или перечитай. Отсутствие в API не доказывает, что кампания создана в Мастере, и не означает, что поля нет в интерфейсе Директа. |

Группы, объявления (включая `DisplayUrlPath`) и Метрику читай по задаче. Учитывай пометки неполных границ временного ряда; сравнение допустимо с явной оговоркой о разной длительности. Сводка операторов относится только к полученным фразам, а не к `MatchType` поискового отчёта.
Источники фактов, проверено 02.10.2026: [Reports](https://yandex.ru/dev/direct/doc/ru/report-format), [ставки](https://yandex.ru/dev/direct/doc/ru/keywordbids/get), [изменения кампаний](https://yandex.ru/dev/direct/doc/ru/changes/checkCampaigns), [минус-фразы](https://yandex.ru/support/direct/ru/keywords/negative-keywords). Методика — редакционное правило этого навыка; фактические пометки формирует общий каталог.

## Кампании без управления через API

Если установлено ограничение `statistics_only` (см. таблицу оснований) и пользователь хочет тонко настроить такую кампанию:

- Коротко и без служебных терминов скажи, что через LidFly по ней доступна статистика, но менять и проверять её настройки нельзя. Не пересказывай названия методов API.
- Не подтверждай и не опровергай по памяти слова клиента о полях интерфейса («там негде добавить минус-фразы»). Ограничение API LidFly — не доказательство отсутствия поля в интерфейсе Директа; если вопрос важен, предложи проверить в кабинете.
- Предложи управляемую ЕПК и аргументируй цифрами этого кейса из прочитанных отчётов: сколько расхода пришлось на нецелевые запросы и на площадки с плохими показателями, каких разбивок не хватает (в Reports по кампаниям Мастера нет групп и объявлений). Назови рычаги ЕПК, которые LidFly настроит и проверит после записи: категории автотаргетинга, места показа, минус-фразы, исключение площадок.
- Не обещай, что перенос сам сэкономит бюджет или приведёт целевых клиентов: эффект оценивается по результатам. Старую кампанию не отключай без решения пользователя.
- Для магазина с фидом рассмотри ЕПК с фидом и согласуй места показа; возможности конкретного типа группы проверяй по каталогу и схеме инструмента, а не по названию ЕПК.

Пример (не шаблон): «Через LidFly мы видим статистику этой кампании, но не можем менять и проверять её настройки. За три месяца около 1 600 ₽ ушло на перечисленные нецелевые запросы и около 2 500 ₽ — на площадки с высокой долей отказов. В ЕПК можно ограничить запросы и площадки и проверить это после записи; эффект оценим по результатам.»

## v3 Scope First

1. `search_tools({ provider: "yandex", query })`.
2. `get_tool_schema` before each new tool.
3. Unknown account/client/project: `get_provider_context({ provider: "yandex", query? })`. Keep `query` for free project/name/INN search; when the exact Direct login is known, pass it separately as `client_login` (both fields may be used together).
4. Known campaign ID: `resolve_campaign_scope({ provider: "yandex", campaign_id, connection_id?, client_login?, workspace_project_id?, date_from?, date_to? })`. For 16+ digits pass the ID as a string. Full exact name: use `campaign_name`; legacy `query` accepts only one exact ID or full exact name. Never pass more than one selector.
5. Copy returned `scope_arguments` into Direct calls.
6. Read through `call_tool`; write through `call_write_tool`.

Direct tools use `connection_id` and optional `client_login`. Metrika tools use `counter_id` and optional `connection_id`, not `client_login`.

`resolve_campaign_scope` returns a typed status. Use `resolved` only when one exact scope is proven; `ambiguous` requires an exact scope choice; `not_observed` is a successful empty result for the checked sources/period; `incomplete` means at least one required check failed; `failed` is a typed technical failure. `content[].text` is only a human-readable rendering and must never be parsed for campaign fields or execution decisions.

For `not_observed`, follow `diagnosis` instead of guessing a cause. `api_visibility` lists the sources that returned no campaign: this does not prove that the object is absent from the Direct web UI. `provider_access="verified"` with `oauth_reconnect.status="not_indicated"` means the listed scopes answered successfully, so do not reconnect OAuth. `checked_scopes[].selection` says who chose each cabinet: only a caller-supplied `connection_id` or `client_login` is `explicit`, while `workspace_project_id` is a memory boundary and stays `discovered`. When every checked scope is `explicit`, `yandex_client_login.status="not_required_for_explicit_scope"` and `next_action.kind="none"`: do not propose another scope, period, or the same reads without new evidence. When any scope was `discovered` and another Direct account is genuinely possible, `yandex_client_login.status="provide_if_campaign_is_in_another_account"`: request its exact `client_login` and use the prepared confirmed save action. Never invent the login or infer campaign-type support from an empty result.

For exact Yandex IDs, discovery checks Reports over the supplied period or, by default, the last 90 completed Moscow calendar days. Reports can expose some campaigns absent from Campaigns API, but it does not guarantee every object or every Master Campaign subtype. A campaign found only there has `access_mode="statistics_only"`, `management_eligibility="not_allowed"`, and a read-only statistics `next_call`. No Reports row means statistics are not observed, not that the account is empty. Reports activity never authorizes management; every configured write still goes through the server write preflight. Do not treat `not_observed` as an incident or call support for it.

For legacy Workspace links, accept a recovered Direct scope only when `get_provider_context` returns the complete `workspace_project_id + connection_id + client_login` in `tool_args`. Read `scope_issues`: run only a read-only `next_action` with `may_execute_automatically=true`; never guess around `manual_scope_review`, ambiguity, conflict, provider outage, or login-not-found. Do not derive `client_login` from `external_entity_key`, a project/account name, `external_entity_name`, or Direct `ClientId`.

## Credential Boundary

- В пользовательских задачах работай с Директом только через LidFly MCP v3. Не вызывай `api.direct.yandex.com` напрямую через shell, curl, PowerShell или другой HTTP-клиент — ни для проверки, ни как fallback после успеха, ошибки или timeout MCP.
- Не читай `.env`, process environment или shell history и не ищи/используй `YANDEX_DIRECT_TOKEN` либо другие локальные provider credentials.
- LidFly API key и MCP OAuth авторизуют только LidFly. Они не являются OAuth-токенами Яндекса и не передаются в provider API.
- Успешный MCP-результат — источник истины, включая пустой результат. Не перепроверяй его прямым HTTP-запросом, не советуй менять локальный токен или перезапускать клиент.
- Классифицируй Yandex auth error из MCP как `provider_connection` (включая ошибку 53) и предложи переподключить Яндекс в LidFly. Ошибка локального прямого запроса ничего не говорит о server-side подключении LidFly.
- При transport error/timeout выполни существующий один retry и support workflow; direct provider fallback запрещён. Не повторяй write без проверки состояния.
- `npm run start:stdio`, `npm run test:direct-live`, `LIVE_YANDEX_DIRECT_TOKEN` и `YANDEX_DIRECT_TOKEN` допустимы только во внутреннем maintainer workflow, который пользователь явно попросил запустить в репозитории. Это не fallback для пользовательской рекламной задачи.
- Явный запрос разработать отдельную интеграцию с API Яндекса вне LidFly — другая задача с собственными credentials пользователя; никогда не извлекай и не подменяй ими credentials LidFly.

## Progressive References

- For a new ЕПК campaign read [campaign creation](references/campaign-creation-workflow.md).
- For bidding, goals and learning status read [bidding strategy](references/bidding-strategy.md).
- For customer bases, Look-alike, geo segments and retargeting by Yandex Audience segments read [audiences](references/audiences.md).
- For missing impressions, a budget that must last a period and competitor comparisons read [serving, budget and competitors](references/serving-budget-competitors.md).
- `get_methodology(topic: "yandex")` uses the compact [compatibility methodology](references/methodology.md).

## Guardrails

- Search-first by default; disable networks unless user explicitly asks.
- Budget values are rubles, not micro-units.
- Read current state before write.
- Show the write plan and use the current surface confirmation contract. Built-in chat accepts the next user text or the server-issued action for the same sealed ChangeSet; external MCP requires its explicit textual consent. Never invent a confirmation button.
- For agency/team Пространства include exact `workspace_project_id`.
- Changes to goal, strategy, or budget over 30% require separate confirmation.
- Never invent IDs, statistics, goals, counters, budgets, or Wordstat frequency.

## Лендинги Директа

Публичный API Яндекс Директа не позволяет прочитать настройки блоков, создать, изменить, опубликовать или удалить контент лендингов на `clients.site` и турбо-страницах. Для такого запроса `search_tools` возвращает `capability_notice.status=unsupported_by_provider_api`.

- Объясни пользователю ограничение и предложи открыть страницу в веб-интерфейсе Директа.
- `get_turbo_pages` читает только метаданные опубликованных страниц; `get_leads` читает только отправленные формы.
- Не используй `update_ad`, `update_campaign` или другой рекламный write как замену редактированию блоков страницы.
- Не вызывай support-инструменты и не отправляй такое ограничение в поддержку LidFly.

### Браузерный fallback

Использовать браузерный сценарий только когда AI-клиент умеет управлять уже авторизованным браузером и пользователь прямо попросил выполнить работу в веб-интерфейсе. Это не MCP/API-операция.

- Сначала прочитать текущее состояние в интерфейсе. Не запрашивать, не вводить и не сохранять логины, пароли, одноразовые коды или другие учётные данные; если сессия не авторизована, попросить пользователя войти самостоятельно и остановиться.
- Перед любым кликом, который меняет контент, публикацию, бюджет, ставку, цель, стратегию, статус, модерацию или расход денег, показать точный план и дождаться явного текстового подтверждения. Просьба открыть или проверить страницу не разрешает сохранять изменения.
- Ничего не сохранять, не публиковать, не запускать и не останавливать автоматически. После подтверждённого действия перечитать состояние в интерфейсе и проверить фактический результат.

## Отменённый переключатель расширенного геотаргетинга

Яндекс отменил настройку `ENABLE_AREA_OF_INTEREST_TARGETING`: [новость от 31.08.2026](https://b2b.yandex.ru/adv/news/obnovlenie-geotargetinga-v-direkte), [справка API](https://yandex.ru/dev/direct/doc/ru/annex/campaign-options). Это касается и ЕПК (`UNIFIED_CAMPAIGN`). Отменён именно переключатель, а не географический таргетинг в целом.

- Не предлагай эту опцию, не включай её в add/update и не повторяй запись полным набором Settings. Не ищи обход через другой тип кампании, API или веб-интерфейс.
- Если чтение возвращает старое YES/NO, учитывай `campaign_setting_notices`: поле неуправляемое. Не трактуй YES как доказательство действующего переключателя, показов вне региона или перерасхода.
- Ответь: «К сожалению, отключить расширенный геотаргетинг отдельным переключателем больше нельзя: Яндекс убрал эту настройку и применяет обновлённые алгоритмы автоматически. LidFly не может вернуть отменённую возможность. Можно проверить регионы групп и фактическую географию трафика, но это не гарантирует показы только людям, находящимся в регионе прямо сейчас».
- При жалобе на прежний success признай: «Предыдущее сообщение об успешном отключении было некорректным: оно не подтверждало изменение настройки». Не скрывай ошибочное подтверждение за ограничением Яндекса и не обещай, что запрет записи выключил таргетинг.
- Не эскалируй само известное ограничение в поддержку LidFly, не советуй переподключение. Свежий success при попытке записать запрещённую опцию — отдельный дефект контракта, его можно диагностировать штатным support workflow.
- Регионы групп, минус-фразы, автотаргетинг и корректировки ставок — разные настройки. Их чтение и анализ допустимы; изменение требует отдельного согласованного плана. Не выдавай их за эквивалент отменённого переключателя.

## Read Checklist

### Применимость рекомендации

Порядок аудита: место показа → применимые настройки → бизнес-цель → фактические данные → гипотеза и способ проверки.

- Сначала прочитай места показа через `get_campaigns`. Для смешанной кампании разделяй выводы о Поиске/Картах и РСЯ. Сохранённое API-значение само по себе не доказывает влияние настройки на показы.
- Используй пометки общего каталога `direct.autotargeting_applicability`, `direct.autotargeting_legacy` и `direct.keyword_operators`. Категории запросов и бренды нельзя рекомендовать как рычаг отключения аудитории РСЯ только по YES/NO. Legacy Items не восстанавливают однозначно современные Categories/BrandOptions; недостающее поле не означает выключенную опцию.
- Сверяй числа с конкретным прочитанным источником: период, кампанию, единицы и тип бюджета. При продолжении беседы прежний ответ ассистента не служит источником цифр. Если исходного чтения нет в доступном контексте, повтори scoped read; не подменяй его памятью о своём выводе.
- Разделяй наблюдение, расчёт и прогноз. Укажи основание и неопределённость гипотезы; не обещай процент роста или срок заявки без данных. Успешная запись подтверждает сохранение параметров; влияние на результаты проверяется отдельно.
- При возражении пользователя проверь исходную предпосылку и соседние рекомендации. Сохраняй решения клиента и бюджет, если пользователь не изменил их явно. Для `[]` проверяй порядок внутри каждой пары скобок, для `!` — словоформу; отдельные `[слова]` не фиксируют порядок всей фразы.

Источники и дата сверки: [автотаргетинг](https://yandex.ru/support/direct/ru/impression-criteria/autotargeting), [Keywords.get](https://yandex.ru/dev/direct/doc/ru/keywords/get), [операторы](https://yandex.ru/support/direct/ru/keywords/symbols-and-operators), 01.10.2026. Проверяемые правила принадлежат provider-каталогу; этот раздел задаёт метод проверки рекомендации.

- `get_campaigns` with useful `states` and `field_names`.
- `get_adgroups`, `get_ads` or `get_responsive_ads`, `get_keywords`.
- `get_autotargeting` for categories.
- `get_campaign_stats`, `get_search_queries` with period and attribution.
- Wordstat via `wordstat_*` without `client_login` or `connection_id`.

## Workspace

After confirmed work, save decisions, documents, analytics, campaign snapshots, or follow-up tasks only with resolved `workspace_project_id`. Use `workspace_prepare_project_scope` if uncertain.

## Google Export

When the user asks to export a Direct report to Google Sheets or Google Docs, keep this skill for campaign scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.

The export handoff applies only when this host exposes the skill and a Google write connector. If either is unavailable, state the exact missing capability and return the requested report as a draft; do not claim a saved Google file or silently switch to Workspace.


## Проверяемая оптимизация и память

- Перед новой оптимизацией прочитай журнал исполненных действий и решения клиента. Не предлагай повторно выполненную чистку без нового основания; отменённые решения не применяй.
- В точном выбранном проекте храни `metadata.primary_conversion_goal_id`: числовой ID цели заявки. Если его нет, один раз уточни основную цель, проверь ID через `metrika_get_goals`, затем предложи сохранить в `workspace_update_project`, сохранив остальные поля metadata. Не подменяй ID названием `lead_sent`.
- Для заявок/CPA вызывай `get_campaign_stats` с `goals=[primary_conversion_goal_id]`. Без выбранного проекта используй явный ID и название из ключевых целей кампании либо Метрики. Агрегат без goals описывай как целевые визиты по всем целям, включая микроцели; это не сумма достижений. Оплату читай отдельно; `primary_conversion_goal_id` сохраняет смысл основной цели заявки и не перепрофилируется под оплату. Не добавляй микроцели в стратегию без отдельного согласия и объяснения последствий.
- Ссылки и факты о компании бери из проверенных страниц, брифа или явных сообщений клиента. Не придумывай URL, партнёрство, опыт, сроки, скидки и гарантии. Неподтверждённые факты явно перечисляй для подтверждения.
- Утверждать применение или сохранение разрешено только по серверному ledger. Подготовленный пакет не означает, что кабинет или Проекты изменены.
- Для прогноза CPC/CR/сроков/объёма укажи источник: AuctionBids из `get_keyword_bids`, историю кампании или прогноз бюджета. Без данных обозначь «оценка без данных» и диапазон; не обещай срок заявки. Недельный лимит не равен фиксированному дневному бюджету: деление на семь — арифметическая средняя, не правило расходования площадкой.

### Операторы минус-фраз

По [справке Директа](https://yandex.ru/support/direct/ru/keywords/negative-keywords), проверенной 26.09.2026: минус-фраза исключает запросы со всеми её словами; полное пересечение с ключевой фразой обычно отменяет её действие. `[]` закрепляет порядок, `!` — словоформу, `+` — обязательность слова, кавычки — запрос только из указанных слов. Кавычки действуют и при полном совпадении с ключом. Для одного бренда используй `"битрикс"`, если нужно исключить только запрос из него: `[битрикс]` такого ограничения не задаёт. `![битрикс]` не исправляй догадкой — уточни намерение. Сочетание `серый +в !яблоках` допустимо. Для автотаргетинга не обещай исключение полного пересечения: проверь реальные Query/MatchedKeyword/CriterionType. Предпросмотр без морфологии — только нижняя оценка по прочитанным строкам.

## Existing Metrika audiences

When asked to use an existing Metrika segment, follow [saved-segment reuse](references/audiences.md#reuse-a-saved-metrika-segment): resolve the exact counter, discover/read the existing segment, verify its expression, then reuse or create the Direct condition and read back the modifier. A partial catalog never authorizes creating a replacement segment.
