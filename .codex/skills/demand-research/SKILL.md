---
name: demand-research
description: "Исследовать поисковый спрос через LidFly Wordstat: сезонность, упущенный спрос, интент, регионы и каннибализация. Использовать для проверки спроса и подготовки рекомендаций без client_login или connection_id Директа."
---

# Demand Research

Use for demand checks, seasonality, missed demand, keyword cannibalization, region demand, and intent verification.

## Wordstat Rules

- Use `wordstat_*` through LidFly MCP v3.
- Do not pass `client_login`, `connection_id`, or advertising account scope.
- Get schemas before first call.
- `wordstat_top_requests` is the primary exact frequency source for the last 30 days.
- `check_search_volume` only checks whether Direct has traffic; it is not exact Wordstat frequency.

## Workflow

1. Clarify product, geography, audience, and business goal.
2. Collect seed queries and stop topics.
3. Use `wordstat_find_region` when regional ids are needed.
4. Use `wordstat_top_requests`, `wordstat_dynamics`, and `wordstat_regions` as needed.
5. Classify intent: commercial, informational, comparison, branded, competitor, support.
6. Identify missed demand, seasonality, and cannibalization risk.
7. Return the research in the requested format. Save to Workspace only when the user asked to save there and the exact project scope is resolved; usefulness for future work is not permission to persist it.

## Output

Bind every number to its exact phrase, section, regions, devices and observation
time. Use typed observations in embedded chat. Top/regions cover the last 30 days;
do not invent calendar boundaries. Dynamics uses the actual normalized interval.
Show unknown/failed values as N/A, preserve measured zero, and never turn YES/NO
into frequency. Separate unmeasured ideas from measured phrases. Report unread
sites and missing sources, and never infer conversion quality from frequency alone.
Advice based on supplied data does not automatically require paid Wordstat reads.

Give clusters with intent, frequency notes, negative themes, recommended landing pages/campaigns, and the actual saved artifact only if a save was requested and verified.
