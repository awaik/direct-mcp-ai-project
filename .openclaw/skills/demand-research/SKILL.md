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
7. Save the final document in a resolved Workspace project when requested or when the result affects future work.

## Output

Give clusters with intent, frequency notes, negative themes, recommended landing pages/campaigns, and what was saved to Пространство.
