---
name: yandex-metrika
description: "Анализировать Яндекс Метрику и AppMetrica и безопасно управлять целями через LidFly MCP v3. Использовать для счётчиков, целей, UTM, CPA, конверсий, страниц, сравнений с точным counter_id и без client_login, а также установок и событий мобильных приложений."
---

# Yandex Metrika

Use for counters, goal reads and safe goal create/update/delete, traffic sources, UTM, Direct reports, CPA, conversion health, popular pages, ecommerce, and period comparisons.

## Scope

- For mobile applications (installs, app events, tracking partners, Direct app campaigns) read [appmetrica](references/appmetrica.md).
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
- Metrika and Direct use separate attribution enums. Compare effective models using the server methodology, never copy enum keys across APIs. Current Direct models are FCCD, LC, LSCCD and AUTO. Legacy Direct FC/LSC/LYDC/LYDCCD are normalized by the tool with an explicit requested → sent notice. Metrika keeps its own compatibility contract. Direct has no direct analogue for Metrika cross_device_last. Source: https://yandex.ru/dev/direct/doc/ru/spec (checked 2026-09-26).
- To compare with Direct, call the existing `get_custom_report` with the same dates, timezone, goals, revenue metric, and matching Direct attribution. Direct supports `Revenue`, `PurchaseRevenue`, `Profit`, `GoalsRoi`, purchase variants, and `LSCCD`. `Profit` stays aggregate even when `goals` is supplied; calculate goal-specific profit from that goal's `Revenue - Cost`. Purchase metrics use the separate `purchase_goals` filter, not `goals`. If a configured report omits a field, do not replace it with zero or claim the API cannot return revenue.

## Goal Workflow

- Read one goal with `metrika_get_goal`; read the list with `metrika_get_goals`.
- Goal writes are `metrika_create_goal`, `metrika_update_goal`, and `metrika_delete_goal`. Before a write, resolve the exact counter. Owners may write without a project; members need a selected or sole granted project. A selected project strictly limits access to linked counters. Then call `get_tool_schema` for the selected tool.
- Create has 13 goal variants. Update accepts only a partial `changes` object, reads the full current goal internally, and preserves unspecified fields; do not reconstruct a whole goal from prose. For type-specific changes, pass `settings.type` matching the stored goal type.
- Delete is destructive. State the exact counter, goal id, and current goal name before confirmation.
- State the counter, goal name, type, type-specific conditions or steps, price/favorite fields, and broad effects such as “all files” before confirmation.
- Execute only through `call_write_tool`. In built-in chat, the exact sealed ChangeSet is confirmed by the user's next text or its server-issued confirmation action. Do not generate confirmation buttons yourself. External MCP uses its existing explicit-confirmation workflow. Never claim success before the tool result.
- If preflight returns `reconnect_required`, stop the write and ask the user to reconnect Yandex. Read tools remain available.
- Treat `operation_id` and `outcome` as authoritative. `deduplicated=true` means the exact goal already existed and no POST was sent; `updated=false` means the requested values already matched and no PUT was sent.
- After `unknown` or `ambiguous`, never repeat the same goal write. Call top-level `get_write_operation_status({ operation_id })`; if ambiguity remains, require manual verification.
- Successful create/update results include `goal_id`; reread it with `metrika_get_goal` when subsequent work depends on the exact saved state. After delete, reread `metrika_get_goals` if later work depends on absence.

## Analysis

- Name goals as "цель Название (id)", not bare ids.
- Separate total conversions from target lead/order goals.
- Compare periods with the same dates, timezone, goals, attribution, revenue metric, and filters.
- For Direct-linked analysis, include campaign ids and UTM where possible.
- To decide whether Direct traffic belongs to the selected account, compare `DirectClickOrder` and `DirectBannerGroup` IDs against campaigns/groups actually read in that account, then inspect its tracking configuration and UTM values. A UTM string alone does not prove ownership; `TrafficSource=ad` also includes other paid platforms. Account for `lastsign` attribution and repeat visits when reconciling counts. Sources: https://yandex.ru/support/metrica/ru/general/direct, https://yandex.ru/support/direct/ru/statistics/url-tags (checked 2026-09-26). If the IDs cannot be verified in the connected scope, state that ownership is unconfirmed.

## Workspace

Save analytics snapshots, documents, or decisions only with resolved `workspace_project_id`. Memory writes for a counter linked to several projects require the exact selected project; personal provider writes by its owner do not.

## Google Export

When the user asks to export a Metrika report to Google Sheets or Google Docs, keep this skill for counter scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.

The export handoff applies only when this host exposes the skill and a Google write connector. If either is unavailable, state the exact missing capability and return the requested report as a draft; do not claim a saved Google file or silently switch to Workspace.

## Logs exports

Owners may create personal Logs API exports without a project. Members need a selected or sole granted project and its linked counter. A selected project always restricts the counter scope. Personal exports belong only to their owner; do not share the one-time download capability URL. Project memory and knowledge operations still require a project.


## Основная цель и реальные заявки

Для отчётов о заявках/CPA используй подтверждённый числовой `primary_conversion_goal_id` из metadata точного проекта. Если его нет, один раз выясни, какая цель означает отправленную заявку, проверь ID через `metrika_get_goals` и предложи сохранить его в проект с сохранением остальных metadata. Открытие формы и другие микроцели не называй заявками. В Директе передавай `get_campaign_stats.goals=[primary_conversion_goal_id]`; агрегат без goals означает достижения всех целей, включая микроцели. Не добавляй микроцели в стратегию без явного согласия. Прогнозы сопровождай источником; без истории — «оценка без данных» и диапазон. Применение и сохранение подтверждай по результатам записи, а не по обещанию модели.
