---
name: mcp-v3-provider-context
description: "Разрешать provider scope в LidFly MCP v3 через get_provider_context и resolve_campaign_scope. Использовать вместе с provider-скиллом, когда кабинет, подключение, кампания или workspace_project_id не заданы точно либо пользователь называет объект по имени."
---

# MCP v3 Provider Context

Use this helper before any provider task where the account, client, connection, campaign, or Workspace project is not already exact.

## Required Sequence

1. Resolve provider scope with the top-level meta-tools:
   - account/client/project unknown: `get_provider_context({ provider, query? })`;
   - campaign named by user: `resolve_campaign_scope({ provider, query, workspace_project_id? })`.
2. Find internal provider tools with `search_tools`, passing resolved provider/project scope when supported.
3. Read each internal tool schema with `get_tool_schema` before its first call.
4. Copy only returned `tool_args`, `scope_arguments`, or `next_call.arguments` into the internal provider call.
5. Read with `call_tool`; write with `call_write_tool`.

Call `search_tools`, `get_tool_schema`, `get_provider_context`, and `resolve_campaign_scope` directly. Never pass these top-level meta-tools as `tool_name` to `call_tool` or `call_write_tool`.

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
