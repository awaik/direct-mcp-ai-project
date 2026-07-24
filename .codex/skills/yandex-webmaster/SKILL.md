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

## Write Workflow

Use `call_write_tool` only after explaining quota/risk and receiving explicit confirmation for:

- adding/deleting host;
- starting verification;
- adding/deleting sitemap;
- requesting recrawl;
- feed changes;
- Pro export start.

Always reread status after write when the API supports it.

## Workspace

Do not save Webmaster audits, decisions, or documents without `workspace_project_id`. If project scope is unclear, call `workspace_prepare_project_scope` with `host_id` or domain as `external_entity_key`.
