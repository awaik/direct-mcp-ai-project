# Avito for business methodology

Use get_provider_context(provider: "avito") and avito_status first. Copy connection_id and avito_user_id from tool_args; never substitute an avito_ads account_id.
OAuth scopes and personal client_credentials capabilities are separate. Follow the manifest-selected auth mode and unavailable_reason; never swap credentials by guesswork.
Use call_tool for READ-ONLY tools and call_write_tool for WRITE tools. Writes perform preflight, one outbound attempt and readback when the API has a reliable read endpoint.
Never retry a write after timeout/5xx. Call get_write_operation_status; an unknown result without readback requires manual verification in Avito.
Most writes have no readback endpoint: an answer with verification="manual" means Avito accepted the call but cannot confirm the effect. Say so instead of claiming the change is verified.
Tool schemas list the documented body and query fields; nested structures follow the Avito API docs. Required fields are rejected before the request leaves LidFly.
Money, promotion, access, orders, statuses, blacklist, mailings and legal actions require explicit confirmation. Scheduled AI writes are disabled in the first release.
PII, résumés, call recordings, delivery codes and private files require project admin access.
