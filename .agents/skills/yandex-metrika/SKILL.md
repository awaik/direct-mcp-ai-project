---
name: yandex-metrika
description: "Анализировать Яндекс Метрику через LidFly MCP v3: счётчики, цели, UTM, Директ, CPA, конверсии, страницы и сравнение периодов. Использовать для отчётов и диагностики с точным counter_id и без client_login."
---

# Yandex Metrika

Use for counters, goals, traffic sources, UTM, Direct reports, CPA, conversion health, popular pages, ecommerce, and period comparisons.

## Scope

- Metrika uses `counter_id`; it does not use `client_login`.
- If counter/project is unclear, call `get_provider_context({ provider: "yandex", query? })` and use returned Metrika scope.
- If a Пространство is selected, prefer counters linked as provider entities to `workspace_project_id`.
- Do not rely on a local project brief or cached context as the only counter/goal source; verify live counters and goals when access exists.

## Read Workflow

1. `search_tools({ provider: "yandex", query: "metrika ..." })`.
2. `get_tool_schema`.
3. `call_tool` for `metrika_get_counters`, `metrika_get_counter`, `metrika_get_goals`, reports.
4. Use explicit date ranges, attribution assumptions, dimensions, and goal ids.

## Analysis

- Name goals as "цель Название (id)", not bare ids.
- Separate total conversions from target lead/order goals.
- Compare periods with the same attribution and filters.
- For Direct-linked analysis, include campaign ids and UTM where possible.

## Workspace

Save analytics snapshots, documents, or decisions only with resolved `workspace_project_id`.

## Google Export

When the user asks to export a Metrika report to Google Sheets or Google Docs, keep this skill for counter scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.
