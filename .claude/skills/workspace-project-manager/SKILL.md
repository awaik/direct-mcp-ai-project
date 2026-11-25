---
name: workspace-project-manager
description: "Управлять Пространствами LidFly и project-first памятью Workspace: проекты, provider entities, кампании, документы, решения, настройки, задачи и AI-автозапуски. Использовать для любой записи памяти или управления проектом с точным workspace_project_id."
---

# Workspace Project Manager

Use for projects, memory, decisions, documents, settings, campaign context, tasks, reminders and scheduled AI checks.

## Model

- Пространство = memory container; Workspace project = business/direction/client (`workspace_project_id` is canonical).
- Provider IDs (`client_login`, `client_id`, `account_id`, `counter_id`, `host_id`, `subdomain`) are external entities, not project IDs.

## Project Scope

Before writing memory, settings, links or provider-scoped tasks:

1. Use known `workspace_project_id`, or call `workspace_prepare_project_scope` with all known selectors (`project_name`, `provider`, `external_entity_key`, `external_campaign_id`, `client_login`, `vk_client_id`, `account_id`, `metrika_counter_id`, `lidfly_subdomain`, `host_id`, `campaign_name`).
2. If resolved, write with returned `workspace_project_id`. If ambiguous, ask for exact `workspace_project_id`.
3. If none matches, offer `workspace_create_project`; never silently create "Основной проект".
4. Scope resolution is not write permission. You may propose saving a durable rule or decision; write only on user request, after consent to your proposal, or under an authorized workflow. Never mix clients.

Brief & campaign history: [business-brief.md](references/business-brief.md).

## Project Memory

- Read project context/rules at session start (`get_provider_context` returns `project_memory` for a single active project; use `workspace_get_context` for full rules/decisions).
- Durable rules: ongoing preferences, constraints, wording bans, tone, KPI/budget/targeting guardrails — never one-off tasks, temporary numbers, or secrets/tokens.
- Offer once per rule; do not repeat after refusal. Never write silently without consent.
- Save via `call_write_tool` → `workspace_update_settings` with `workspace_project_id`, `scope_type: "project"`, `scope_id: "<workspace_project_id>"`, `settings: [{ namespace: "rules", key: "<unique_key>", value: "<rule>", value_type: "string", source: "mcp_suggestion" }]`. Use a unique `key` per new rule; reuse `key` only when replacing that rule.

## Provider Links

- Call top-level `get_provider_context` with exact `workspace_project_id` before treating a missing scope as an error.
- `provider_link_candidates` are verified unlinked scopes: on user request, run only the chosen candidate's `next_action` unchanged via `call_write_tool` (MCP confirmation required); if multiple, ask. Never invent `client_login` or escalate to `support_prepare_report`.
- Read-only members do not receive owner OAuth candidates; do not enumerate personal scopes.

## Tools To Prefer

Discover via `search_tools({ provider: "workspace", ... })` and `get_tool_schema`. Never pass top-level meta-tools to `call_tool`.

- Read (`call_tool`): `workspace_list_projects`, `workspace_get_project`, `workspace_prepare_project_scope`, `workspace_prepare_project_deletion`, `workspace_get_settings`, `workspace_get_tasks`, `workspace_get_scheduled_ai_tasks`.
- Write (`call_write_tool`): `workspace_create_project`, `workspace_delete_project`, `workspace_upsert_provider_entity`, `workspace_link_campaign`, `workspace_update_settings`, `workspace_add_tasks`, `workspace_schedule_ai_task`.

## Permanent Project Deletion

Owner-only, irreversible, forbidden in AI autostarts.

1. Use exact `workspace_project_id`, call `workspace_prepare_project_deletion`.
2. If `can_delete=false`, explain blocker (archive only if asked; protected accounting history stays archived).
3. Show `confirmation_message`, deletion counts, and retained activity count; wait for explicit confirmation, then call `workspace_delete_project` via `call_write_tool` with unchanged `workspace_project_id`, `expected_project_name`, `expected_updated_at`.
4. Re-preflight if changed; reread project after uncertain transport before retrying.

## Reminders vs AI Autostarts

- `workspace_add_tasks`: manual reminder (email only, no AI/provider execution). If a future check needs a new decision or confirmation, use `workspace_add_tasks`.
- `workspace_schedule_ai_task`: AI autostart executing without new confirmation; objects, actions, values, and conditional branches must be fully approved before using `workspace_schedule_ai_task`.
- Set `allowed_tools` to real domain tools (not v3 meta-tools), pass `workspace_project_id`, and for writes include concrete targets and confirmed plan.

## Output

Summarize selected project, created object type, whether it runs automatically, next user action and unconfirmed details.
