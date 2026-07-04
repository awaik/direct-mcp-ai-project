---
name: workspace-project-manager
description: Manage LidFly Пространства with project-first Workspace memory: projects, provider entities, campaign links, documents, decisions, settings, snapshots, tasks, scheduled AI runs, and ambiguity-safe workspace_project_id scope.
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

- `workspace_list_projects`
- `workspace_get_project`
- `workspace_create_project`
- `workspace_prepare_project_scope`
- `workspace_upsert_provider_entity`
- `workspace_link_campaign`
- `workspace_get_settings`
- `workspace_update_settings`
- `workspace_schedule_ai_task`
- `workspace_get_scheduled_ai_tasks`

## Scheduled AI

For `workspace_schedule_ai_task`:

- `allowed_tools` must list real domain tools for the future run, not v3 meta-tools.
- Include `workspace_project_id` for provider/campaign tasks.
- For write future runs, include concrete target items and a confirmed plan.

## Output

Return a short human summary: project selected, what was saved or scheduled, and what remains unconfirmed.
