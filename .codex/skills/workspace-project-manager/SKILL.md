---
name: workspace-project-manager
description: "Управлять Пространствами LidFly и project-first памятью Workspace: проекты, provider entities, кампании, документы, решения, настройки, задачи и AI-автозапуски. Использовать для любой записи памяти или управления проектом с точным workspace_project_id."
---

# Workspace Project Manager

Use this skill when the user asks about projects, clients, memory, decisions, documents, settings, saved campaign context, tasks, reminders, or scheduled AI checks.

## Model

- Пространство is the user-facing memory container.
- Workspace project is a business, project, direction, or agency client.
- `workspace_project_id` is the canonical id for memory writes.
- Provider identifiers are external entities, not project ids: `client_login`, `client_id`, `account_id`, `counter_id`, `host_id`, `subdomain`.

## Project Scope

Before writing audits, documents, decisions, snapshots, settings, provider links, campaign links, or provider-scoped tasks:

1. If exact `workspace_project_id` is known, use it.
2. Otherwise call `workspace_prepare_project_scope` with all known selectors: `project_name`, `provider`, `external_entity_key`, `external_campaign_id`, `client_login`, `vk_client_id`, `account_id`, `metrika_counter_id`, `lidfly_subdomain`, `host_id`, `campaign_name`.
3. If resolved, write with returned `workspace_project_id`.
4. If ambiguous, show candidates and ask for exact `workspace_project_id`.
5. If no project exists or no project matches, offer to create one with `workspace_create_project`; do not create "Основной проект" silently.

## Tools To Prefer

Find every internal Workspace tool with `search_tools({ provider: "workspace", ... })` and read its schema with `get_tool_schema` before the first call.

Read through `call_tool`:

- `workspace_list_projects`
- `workspace_get_project`
- `workspace_prepare_project_scope`
- `workspace_prepare_project_deletion`
- `workspace_get_settings`
- `workspace_get_tasks`
- `workspace_get_scheduled_ai_tasks`

Write through `call_write_tool`:

- `workspace_create_project`
- `workspace_delete_project`
- `workspace_upsert_provider_entity`
- `workspace_link_campaign`
- `workspace_update_settings`
- `workspace_add_tasks`
- `workspace_schedule_ai_task`

Never pass top-level meta-tools such as `search_tools` or `get_tool_schema` as `tool_name`.

## Permanent Project Deletion

Permanent deletion is owner-only, irreversible, and never allowed in an AI autostart.

1. Resolve and use the exact `workspace_project_id`; never select a deletion target from a similar name.
2. Call read-only `workspace_prepare_project_deletion`.
3. If `can_delete=false`, explain the returned blocker. Archive an active project only if the user asked; protected accounting history means the project must remain archived.
4. If ready, show `confirmation_message`, the deletion counts, and retained activity-history count. Wait for an explicit textual confirmation.
5. Call `workspace_delete_project` through `call_write_tool` with the unchanged `workspace_project_id`, `expected_project_name`, and `expected_updated_at` from that preflight.
6. If the target changed, run the preflight again and request a new confirmation. After a transport-uncertain delete, reread the exact project before considering any retry.

## Reminders vs AI Autostarts

- `workspace_add_tasks` is a manual reminder: it stores a prompt and due date, but the due date only triggers email and never runs AI or provider tools.
- If a future check must be shown to the owner, asks a question, or needs a new decision or confirmation, use `workspace_add_tasks`.
- `workspace_schedule_ai_task` is an AI autostart: LidFly executes the saved plan automatically at the specified time without a new confirmation.
- Objects, actions, values, and all conditional branches must be fully approved before using `workspace_schedule_ai_task`.

For `workspace_schedule_ai_task`:

- `allowed_tools` must list real domain tools for the future run, not v3 meta-tools.
- Include `workspace_project_id` for provider/campaign tasks.
- For write future runs, include concrete target items and a confirmed plan.

## Output

Return a short human summary: project selected, which type was created, whether it runs automatically, what the user must do next, and what remains unconfirmed.
