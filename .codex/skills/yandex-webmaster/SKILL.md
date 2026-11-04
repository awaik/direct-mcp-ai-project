---
name: yandex-webmaster
description: "Работать с Яндекс Вебмастером через LidFly MCP v3: сайты, диагностика, индексация, запросы, позиции, sitemap, переобход, подтверждение, feeds и Pro exports. Использовать для SEO-проверок и операций с точным host_id без client_login."
---

# Yandex Webmaster

Use for Яндекс Вебмастер site checks: hosts, diagnostics, indexing, pages in search, search queries, links, sitemap, recrawl, verification, feeds, and Pro export.

## Access Model

- Webmaster uses separate OAuth.
- Do not pass `client_login`.
- Start with `webmaster_get_hosts`.
- Use exact `host_id` from returned hosts.
- If `workspace_project_id` is selected, only use hosts linked to that project; fail closed if links are absent.

## Read Workflow

1. `search_tools({ provider: "yandex", query: "webmaster ..." })`.
2. `get_tool_schema` for `webmaster_get_hosts` and selected read tools.
3. `call_tool` for host list, summary, diagnostics, query analytics, sitemap, indexing, and links.
4. Summarize SEO risks and next actions.

`webmaster_query_analytics` covers only the last two weeks; for longer periods request `webmaster_get_queries_history` with explicit dates and check the returned range. `webmaster_get_popular_queries` returns a ranked sample and may return a shorter period than requested. Use response `date_from`/`date_to` or dated history points as the observed period; request arguments alone do not prove coverage. Compare delivered queries/samples with `count`, keep pagination and name the reviewed share (for example, 20 of 303 queries). Do not generalize that sample to all site demand or treat missing rows as zero. In chat, preserve `server_delivery` period, filters and completeness alongside the data. Never claim that Webmaster is not connected while `webmaster_*` tools are present: verify access with `webmaster_check_access` and report its actual result.

Read-data contract checked 2026-10-31: [popular queries — actual dates and count](https://yandex.ru/dev/webmaster/doc/ru/reference/host-search-queries-popular), [dated history indicators](https://yandex.ru/dev/webmaster/doc/ru/reference/host-links-internal-history).

## Write Workflow

Use `call_write_tool` only after explaining quota/risk and receiving explicit confirmation for:

- adding/deleting host;
- starting verification;
- adding/deleting sitemap;
- requesting recrawl;
- feed changes;
- Pro export start.

Always reread status after write when the API supports it.

## Temporary API Failures

If a tool reports provider HTTP 5xx/408 or `TIMED_OUT` (also returned with HTTP 404), explain that the affected Webmaster API operation failed, pause it and recommend returning in about an hour. This is a suggested interval, not a recovery promise. Reconnecting OAuth or changing parameters will not fix this failure. Keep auth, quota, validation and `HOST_NOT_LOADED` separate; a lost connection without a provider response does not prove a Yandex outage.

A failed read does not imply an unknown write. A write with `writeOutcomeUnknown: true` / `retryable: false` may already have been applied: do not repeat it or continue the batch automatically. Before continuing recrawl, use `webmaster_get_recrawl_tasks` with complete pagination and `webmaster_get_recrawl_quota` on the same connection and exact host. For other writes use the corresponding state/list reader; use task/request IDs only if actually returned. Absence from a list, available quota or elapsed time does not prove nonexecution or that POST recovered. If verification is unavailable, retain unknown. Do not invent an `operation_id`.

Do not automatically prepare a LidFly support draft solely for this temporary provider failure, the pause or a missing operation ID. Escalate a contradiction after readback, an internal LidFly failure, or the user's explicit request.

LidFly owner decision: 2026-11-02. Provider contract checked 2026-11-02: [feed upload status and TIMED_OUT](https://yandex.ru/dev/webmaster/doc/ru/reference/feeds-add-info).

## Workspace

Do not save Webmaster audits, decisions, or documents without `workspace_project_id`. If project scope is unclear, call `workspace_prepare_project_scope` with `host_id` or domain as `external_entity_key`.
