# Avito Ads methodology

Use avito_ads_status first when several account_id connections may exist; pass connection_id or account_id explicitly.
Read current account, balance, campaigns, groups, creatives and statistics before writes.
Statistics requests are limited to 1..100 days; use day/week/month granularity and keep entity lists compact.
Use call_tool only for READ-ONLY tools and call_write_tool for WRITE tools. Group budget and price writes always perform read, preflight, write and reread.
Money, bonus transfers, user access, child accounts, advertisers and contracts are destructive agency-level writes; require explicit user intent and call_write_tool.
When Workspace project scope is selected, only linked avito_ads account_id values may be used.
