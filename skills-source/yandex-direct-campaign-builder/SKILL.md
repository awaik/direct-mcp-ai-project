---
name: yandex-direct-campaign-builder
description: "Создавать, аудитить, запускать и оптимизировать кампании Яндекс Директа через LidFly MCP v3 с Wordstat, Метрикой и точным provider scope. Использовать для кампаний, групп, ключей, объявлений, ставок, бюджетов и статистики с современным ЕПК workflow."
---

# Yandex Direct Campaign Builder

Use for Yandex Direct campaign creation, audit, optimization, budgets, keywords, negative keywords, responsive ads, search queries, Wordstat, and Metrika-linked decisions.

## v3 Scope First

1. `search_tools({ provider: "yandex", query })`.
2. `get_tool_schema` before each new tool.
3. Unknown account/client/project: `get_provider_context({ provider: "yandex", query? })`.
4. Named campaign: `resolve_campaign_scope({ provider: "yandex", query, workspace_project_id? })`.
5. Copy returned `scope_arguments` into Direct calls.
6. Read through `call_tool`; write through `call_write_tool`.

Direct tools use `connection_id` and optional `client_login`. Metrika tools use `counter_id` and optional `connection_id`, not `client_login`.

## Default Modern Build

Use modern managed campaigns by default:

```text
add_unified_campaign
-> add_adgroup with adgroup_type: UNIFIED_AD_GROUP
-> add_keywords_batch
-> add_responsive_ad
-> manage_ads action: moderate only after explicit confirmation
```

`add_adgroups` creates multiple legacy `TEXT_AD_GROUP` groups and must not be used for `UNIFIED_AD_GROUP`. Legacy `add_campaign`, `add_adgroups`, `add_ad`, and `add_ads` are compatibility-only for old text scenarios. If used, say clearly that it is a legacy TEXT_AD path and reread actual ad `Type` after creation.

## Guardrails

- Search-first by default; disable networks unless user explicitly asks.
- Budget values are rubles, not micro-units.
- Read current state before write.
- Show write plan and wait for explicit text confirmation.
- For agency/team Пространства include exact `workspace_project_id`.
- Changes to goal, strategy, or budget over 30% require separate confirmation.
- Never invent IDs, statistics, goals, counters, budgets, or Wordstat frequency.

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
