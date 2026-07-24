---
name: seo-optimizer
description: Audit and optimize pages for SEO/GEO visibility with Yandex/Google intent, Wordstat where useful, Webmaster signals, content structure, metadata, internal links, and Workspace-scoped recommendations.
---

# SEO Optimizer

Use for SEO audits, GEO/AI-search visibility, page optimization, metadata, internal links, and content improvement plans.

## Workflow

1. Clarify target page, region, business goal, and priority queries.
2. Use Wordstat for demand when needed; no `client_login` or `connection_id`.
3. Use Yandex Webmaster if site access is available; start with `webmaster_get_hosts`.
4. Inspect page content and search intent.
5. Produce prioritized fixes: technical blockers, intent gaps, title/meta/H1, headings, content, internal links, conversion elements.
6. Save the audit only with resolved `workspace_project_id`.

## Rules

- Separate verified data from hypotheses.
- Do not invent rankings or traffic numbers.
- For generated page changes, keep brand/legal constraints from `LEGAL.md`.
