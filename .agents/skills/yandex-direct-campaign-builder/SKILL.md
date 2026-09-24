---
name: yandex-direct-campaign-builder
description: "Создавать, аудитить, запускать и оптимизировать кампании Яндекс Директа через LidFly MCP v3 с Wordstat, Метрикой и точным provider scope. Использовать для кампаний, групп, ключей, объявлений, ставок, бюджетов и статистики с современным ЕПК workflow."
---

# Yandex Direct Campaign Builder

Use for Yandex Direct campaign creation, audit, optimization, budgets, keywords, negative keywords, responsive ads, search queries, Wordstat, and Metrika-linked decisions.

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
- `get_methodology(topic: "yandex")` uses the compact [compatibility methodology](references/methodology.md).

## Guardrails

- Search-first by default; disable networks unless user explicitly asks.
- Budget values are rubles, not micro-units.
- Read current state before write.
- Show write plan and wait for explicit text confirmation.
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

## Read Checklist

- `get_campaigns` with useful `states` and `field_names`.
- `get_adgroups`, `get_ads` or `get_responsive_ads`, `get_keywords`.
- `get_autotargeting` for categories.
- `get_campaign_stats`, `get_search_queries` with period and attribution.
- Wordstat via `wordstat_*` without `client_login` or `connection_id`.

## Workspace

After confirmed work, save decisions, documents, analytics, campaign snapshots, or follow-up tasks only with resolved `workspace_project_id`. Use `workspace_prepare_project_scope` if uncertain.

## Google Export

When the user asks to export a Direct report to Google Sheets or Google Docs, keep this skill for campaign scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.
