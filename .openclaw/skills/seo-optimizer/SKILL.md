---
name: seo-optimizer
description: "Проводить SEO/GEO-аудит и оптимизацию страницы или сайта: интент, Wordstat, Вебмастер, метаданные, структура контента, перелинковка и конверсия. Использовать для аудита URL, плана улучшений или проверки видимости в поиске и AI-ответах."
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

Read `references/audit-checklist.md` before producing the final priority list. If the page content cannot be opened through an available browser, connector, or supplied file, ask for the text/HTML and do not pretend to have inspected the page.

## Rules

- Separate verified data from hypotheses.
- Do not invent rankings or traffic numbers.
- For generated page changes, preserve user-provided brand and legal constraints; flag regulated or unsupported claims that require qualified review.
