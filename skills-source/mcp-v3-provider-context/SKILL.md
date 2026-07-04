---
name: mcp-v3-provider-context
description: Use for LidFly MCP v3 provider scope resolution: get_provider_context, resolve_campaign_scope, multi-account Yandex/VK/Avito/LidFly workflows, campaign lookup by name, and safe transfer of scope_arguments into call_tool/call_write_tool.
---

# MCP v3 Provider Context

Use this helper before any provider task where the account, client, connection, campaign, or Workspace project is not already exact.

## Required Sequence

1. Find tools with `search_tools`.
2. Read schemas with `get_tool_schema` before the first call.
3. Resolve provider scope:
   - account/client/project unknown: `get_provider_context({ provider, query? })`;
   - campaign named by user: `resolve_campaign_scope({ provider, query, workspace_project_id? })`.
4. Copy only returned `tool_args`, `scope_arguments`, or `next_call.arguments` into the next provider call.
5. Read with `call_tool`; write with `call_write_tool`.

## Scope Rules

- Do not infer `client_login`, `client_id`, `account_id`, `counter_id`, `host_id`, or `connection_id` from a human name.
- If `resolve_campaign_scope` returns candidates, ask for the exact `workspace_project_id` or campaign id.
- For campaign write in agency/team Пространства, include `workspace_project_id` unless preflight returned one unambiguous scope.
- If provider context says a tool is available only in a selected Пространство, fail closed and ask for that project id.

## Provider Keys

- Yandex Direct: `connection_id`, optional `client_login`.
- Metrika: `counter_id`, optional `connection_id`; no `client_login`.
- VK Ads: `connection_id`, optional `client_id`.
- Avito Ads: `connection_id`, optional 9-digit `account_id`.
- Yandex Webmaster: start with `webmaster_get_hosts`, then `host_id`; no `client_login`.
- LidFly sites: `subdomain`, site id, or store id from returned tool args.

## Output

Tell the user which scope was selected in human terms and include the exact id only when useful for audit: `workspace_project_id`, provider account, campaign id. Do not expose tokens or secrets.
