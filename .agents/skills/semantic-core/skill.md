---
name: semantic-core
description: Build a semantic core for SEO or ads using Wordstat Search API, clustering, minus words, intent classification, site structure, campaign structure, and Workspace project documentation.
---

# Semantic Core

Use when the user asks to build a keyword core, cluster semantics, prepare SEO structure, or prepare ad campaign groups from demand.

## Inputs

Ask only for missing essentials:

- product/service and geography;
- site or planned landing pages;
- business goal and target action;
- exclusions and legal restrictions;
- whether output is for SEO, ads, or both;
- `workspace_project_id` if the result should be saved.

## MCP Rules

- Use `search_tools` and `get_tool_schema` before Wordstat calls.
- Wordstat does not need `client_login` or `connection_id`.
- For provider-specific follow-up, resolve scope through `get_provider_context`.

## Workflow

1. Generate seed queries.
2. Expand through `wordstat_top_requests`.
3. Check seasonality and region when relevant.
4. Remove irrelevant intents and collect minus words.
5. Cluster by user intent, not only lexical similarity.
6. Produce SEO page structure and/or ad group structure.
7. Save a document through Workspace only after project scope is resolved.

## Output

Return clusters, representative phrases, intent, recommended page/campaign, minus words, and validation notes. Mark estimates clearly when Wordstat data is unavailable.
