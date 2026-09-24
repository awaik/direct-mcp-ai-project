---
name: yandex-metrika
description: "Анализировать Яндекс Метрику и безопасно создавать цели через LidFly MCP v3. Использовать для счётчиков, целей, UTM, CPA, конверсий, страниц и сравнений с точным counter_id и без client_login."
---

# Yandex Metrika

Use for counters, goal reads and safe goal creation, traffic sources, UTM, Direct reports, CPA, conversion health, popular pages, ecommerce, and period comparisons.

## Scope

- Metrika uses `counter_id`; it does not use `client_login`.
- If counter/project is unclear, call `get_provider_context({ provider: "yandex", query? })` and use returned Metrika scope.
- If a Пространство is selected, prefer counters linked as provider entities to `workspace_project_id`.
- Do not rely on a local project brief or cached context as the only counter/goal source; verify live counters and goals when access exists.

## Read Workflow

1. `search_tools({ provider: "yandex", query: "metrika ..." })`.
2. `get_tool_schema`.
3. `call_tool` for `metrika_get_counters`, `metrika_get_counter`, `metrika_get_goals`, reports.
4. Use explicit date ranges, attribution, dimensions, and goal ids. If the user does not choose attribution, pass `lastsign`; do not leave the model implicit.

## Attribution Contract

- LidFly's default for Metrika reports is `lastsign`. Every report answer must name the data source, attribution model, whether it was explicit or default, and whether it is single-device, cross-device, or automatic.
- Supported Metrika values are `first`, `last`, `lastsign`, `last_yandex_direct_click`, `cross_device_first`, `cross_device_last`, `cross_device_last_significant`, `cross_device_last_yandex_direct_click`, and `automatic`.
- Since 2026-06-25 Yandex resolves legacy `first` to `cross_device_first`, `lastsign` to `cross_device_last_significant`, and both Direct-click variants to `automatic`. Keep the requested key in the call and report the provider-effective model shown by the tool methodology; do not describe legacy `lastsign` as currently single-device.
- Prefer parameterized dimensions and filters such as `ym:s:<attribution>TrafficSource`. Never introduce a hardcoded `last*` dimension when the tool can use `<attribution>`.
- Raw reports preserve an explicitly supplied fixed legacy dimension or filter. Do not rewrite it. Read the returned methodology warning before interpreting a request that mixes fixed models or fixed expressions with `<attribution>`.
- A `preset` is expanded by Yandex and is opaque to LidFly's expression analyzer. The tool still sends the selected/default attribution for parameterized preset dimensions, but its methodology warns that fixed attribution expressions inside the preset cannot be verified locally.
- `TrafficSource='ad'` means all paid advertising traffic, not only Yandex Direct. Direct-specific dimensions can still be empty for traffic from other ad systems.
- Metrika and Direct use separate attribution enums. Use these pairs only to align an explanation, never copy one API's value into the other automatically: `first↔FC`, `last↔LC`, `lastsign↔LSC`, `last_yandex_direct_click↔LYDC`, `cross_device_first↔FCCD`, `cross_device_last_significant↔LSCCD`, `cross_device_last_yandex_direct_click↔LYDCCD`, `automatic↔AUTO`. Direct Reports API has no direct analogue for Metrika `cross_device_last`.
- To compare with Direct, call the existing `get_custom_report` with the same dates, timezone, goals, revenue metric, and matching Direct attribution. Direct supports `Revenue`, `PurchaseRevenue`, `Profit`, `GoalsRoi`, purchase variants, and `LSCCD`. `Profit` stays aggregate even when `goals` is supplied; calculate goal-specific profit from that goal's `Revenue - Cost`. Purchase metrics use the separate `purchase_goals` filter, not `goals`. If a configured report omits a field, do not replace it with zero or claim the API cannot return revenue.

## Goal Workflow

- Read one goal with `metrika_get_goal`; read the list with `metrika_get_goals`.
- The first write increment supports `metrika_create_goal` only. Do not imply that update or delete tools exist.
- Before creation, resolve the exact `workspace_project_id` and counter, then call `get_tool_schema` for `metrika_create_goal`. The schema has 13 goal variants and type-specific fields; do not invent provider JSON.
- State the counter, goal name, type, type-specific conditions or steps, price/favorite fields, and broad effects such as “all files” before confirmation.
- Execute only through `call_write_tool`. In built-in chat, wait for the user's next textual confirmation; do not add buttons or claim success before the tool result.
- If preflight returns `reconnect_required`, stop the write and ask the user to reconnect Yandex. Read tools remain available.
- Treat `operation_id` and `outcome` as authoritative. `deduplicated=true` means the exact goal already existed and no POST was sent.
- After `unknown` or `ambiguous`, never create the same goal again. Call top-level `get_write_operation_status({ operation_id })`; if ambiguity remains, require manual verification.
- A successful create must include `goal_id`; reread it with `metrika_get_goal` when subsequent work depends on the exact saved state.

## Analysis

- Name goals as "цель Название (id)", not bare ids.
- Separate total conversions from target lead/order goals.
- Compare periods with the same dates, timezone, goals, attribution, revenue metric, and filters.
- For Direct-linked analysis, include campaign ids and UTM where possible.

## Workspace

Save analytics snapshots, documents, or decisions only with resolved `workspace_project_id`. A counter linked to several projects still requires the exact selected project for every write.

## Google Export

When the user asks to export a Metrika report to Google Sheets or Google Docs, keep this skill for counter scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.
