---
name: vk-ads-campaign-builder
description: "Создавать, аудитить и оптимизировать кампании VK Ads через LidFly MCP v3: connection_id/client_id, группы, объявления, лид-формы, аудитории, статистика и бюджеты. Использовать для работы с VK Рекламой с безопасным scope и write workflow."
---

# VK Ads Campaign Builder

Use for VK Ads campaigns, ad groups, banners, lead forms, statistics, audiences, contextual phrases, budgets, statuses, and creative checks.

## v3 Scope First

1. Search with `search_tools({ provider: "vk", query })`.
2. Read schemas with `get_tool_schema`.
3. If account/client is unclear, call `get_provider_context({ provider: "vk", query? })`.
4. If campaign is named, call `resolve_campaign_scope({ provider: "vk", query, workspace_project_id? })`.
5. Use only returned `connection_id`, `client_id`, `workspace_project_id`, and `scope_arguments`.
6. Read via `call_tool`; write via `call_write_tool`.

## VK Account Rules

- `connection_id` selects VK OAuth connection.
- `client_id` selects agency/manager/client account.
- Manual VK user-filter is allowed only when it appears in provider context; do not pass arbitrary VK user ids.
- In manual user-filter mode, creation/upload/single update may be unavailable; prefer allowed mass actions and reread state.
- For `max_goals` bidding, use `max_price` when updating limits; reread the group after write.

## Write Safety

- Read current campaign/group/banner first.
- Show plan, budget impact, and fields to change.
- Wait for explicit confirmation.
- Use `call_write_tool`.
- Reread state and report before/after.
- For agency/team Пространства include exact `workspace_project_id`.

## Creative And Text

- Validate package/banner pattern before creating banners.
- Avoid unsupported symbols in text; keep copy within VK field limits.
- Upload images/videos only after source asset is final.
- Do not replace complete banner sections unless the schema requires it and current content has been reread.

## Workspace

Save decisions, campaign snapshots, analytics summaries, and follow-up scheduled tasks only after resolving `workspace_project_id`.

## Google Export

When the user asks to export a VK Ads report to Google Sheets or Google Docs, keep this skill for account/campaign scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.
