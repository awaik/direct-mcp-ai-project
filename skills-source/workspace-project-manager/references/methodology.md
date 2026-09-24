# Workspace methodology

Workspace is the memory boundary. A workspace_project_id is the canonical project/client/business scope.
Do not write audits, decisions, documents, campaign snapshots or provider-linked tasks without project scope.
If no matching project exists, tell the user and offer to create one; do not silently create a default project.
Use workspace_list_projects/workspace_prepare_project_scope first when provider entities or campaign ownership are ambiguous.
For a selected project with a missing provider link, call get_provider_context first. If provider_link_candidates is returned, use the exact candidate next_action through call_write_tool after confirmation; missing linkage is not a support incident.
For agency accounts, projects separate clients. Ask for the exact workspace_project_id when names or assignments are ambiguous.
workspace_add_tasks creates a manual reminder (напоминание): it stores a prompt and due date, but the due date only triggers email and never runs AI or provider tools. Use it when a future check must be shown to the owner or needs a new decision/confirmation.
workspace_schedule_ai_task creates an AI-автозапуск that runs automatically at the specified time without a new confirmation. Use it only when objects, actions, values and every conditional branch are already approved.
After creating either type, state which type was created, whether it will execute automatically, and what the user must do next.
