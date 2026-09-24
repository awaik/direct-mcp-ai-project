---
name: serp-monitor
description: "Мониторить запросы, CTR и средние позиции сайта в Яндексе через данные Вебмастера; при наличии отдельного SERP-инструмента делать точечные снимки выдачи и конкурентов. Использовать для динамики позиций, сниппетов и поисковых запросов."
---

# SERP Monitor

Use for checking a site's Yandex queries, CTR, average positions, snippets, and movement over time.

## Workflow

1. Clarify target domain, queries, period, comparison period, and region when the source supports it.
2. Use `$yandex-webmaster`: start with `webmaster_get_hosts`, select the exact `host_id`, then read `webmaster_get_popular_queries`, `webmaster_get_queries_history`, `webmaster_get_query_history`, or `webmaster_query_analytics` as appropriate.
3. Treat Webmaster positions as aggregated search-performance data, not a point-in-time rank checker.
4. For an exact current SERP or competitor snapshot, use only a separately available SERP connector/tool whose schema you can inspect. If none exists, state that the exact snapshot is unavailable; do not reconstruct it from memory or ordinary browser personalization.
5. Record source, period/date, query, domain, URL, position metric, CTR, clicks/impressions, and any source limitations.
6. Compare against prior verified data only when available.
7. Save reports in Workspace through `call_write_tool` only after resolving `workspace_project_id`.

## Rules

- Mark exact SERP snapshots as point-in-time and Webmaster metrics as period aggregates.
- Do not claim stable ranking from one snapshot or average position.
- Do not infer advertising blocks from Yandex XML/Webmaster organic data.
- Do not mix organic and paid positions.
