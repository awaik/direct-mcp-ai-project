---
name: serp-monitor
description: Monitor Yandex SERP positions, competitors, snippets, ads blocks, and dynamics with explicit region/query scope, read-only checks, and Workspace-scoped reports.
---

# SERP Monitor

Use for checking positions, competitors, snippets, paid blocks, and movement over time.

## Workflow

1. Clarify queries, region, device if relevant, and target domain.
2. Use available SERP/Yandex XML tools or configured local scripts only if tokens are present.
3. Record date, region, query, domain, position, URL, competitors, ads block observations.
4. Compare against prior saved data only when available.
5. Save reports in Workspace with resolved `workspace_project_id` when they affect project decisions.

## Rules

- Mark SERP data as point-in-time.
- Do not claim stable ranking from one check.
- Do not mix organic and paid positions.
