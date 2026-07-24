---
name: avito-ads
description: "Работать с Авито Рекламой через LidFly MCP v3: кабинеты, кампании, группы, бюджеты, статистика, доступы и юридические операции. Использовать для аудита или управления Avito Ads с проверкой 9-значного account_id и безопасным write workflow."
---

# Avito Ads

Use for Авито Реклама accounts, campaigns, groups, budgets, statistics, balances, access, agency operations, advertisers, contracts, and legal/money operations.

## Scope

1. `get_provider_context({ provider: "avito_ads", query? })` when account is unclear.
2. Use returned `connection_id` and/or `account_id`.
3. `account_id` must be a 9-digit advertising account id from Avito Ads.
4. For named campaigns use `resolve_campaign_scope({ provider: "avito_ads", query, workspace_project_id? })`.

## Call Pattern

- `search_tools` -> `get_tool_schema` -> `call_tool` for reads.
- `search_tools` -> `get_tool_schema` -> `call_write_tool` for writes.

## Write Guardrails

Every write must:

1. Read current state.
2. Preflight constraints.
3. Show plan and get explicit confirmation.
4. Execute via `call_write_tool`.
5. Reread and return before/after summary.

Money/access/legal/destructive actions always require explicit intent.

## Product Constraints

- Budget and price are integer rubles.
- Group budget minimum is 5000 rubles with VAT.
- Group budget must not be below known spent amount.
- Budget and price changes work only where manual bid control allows it.
- Warn when available account balance is below 5000 rubles.
- Statistics requests are limited to 100 days per API call.

## Workspace

If a Пространство is selected or the account belongs to several projects, pass exact `workspace_project_id` and fail closed on ambiguity.

## Google Export

When the user asks to export an Avito Ads report to Google Sheets or Google Docs, keep this skill for account/campaign scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.
