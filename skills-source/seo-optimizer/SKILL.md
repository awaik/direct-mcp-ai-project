---
name: seo-optimizer
description: "Проводить SEO/GEO-аудит и оптимизацию страницы или сайта: интент, Wordstat, Вебмастер, метаданные, структура контента, перелинковка и конверсия. Использовать для аудита URL, плана улучшений или проверки видимости в поиске и AI-ответах."
---

# SEO Optimizer

Use for SEO audits, GEO/AI-search visibility, question selection and monitoring reports, page optimization, metadata, internal links, and content improvement plans.

For GEO monitoring, question selection, report analysis or comparison, read [references/geo-monitoring.md](references/geo-monitoring.md). Use the shared `lidfly_geo_*` tools for sites on any platform.

## Workflow

1. Clarify target page, region, business goal, and priority queries.
2. Use Wordstat for demand when needed; no `client_login` or `connection_id`.
3. Use Yandex Webmaster if site access is available; start with `webmaster_get_hosts`.
4. Inspect page content and search intent.
5. Produce prioritized fixes: technical blockers, intent gaps, title/meta/H1, headings, content, internal links, conversion elements.
6. Return the audit in the requested format. Save to Workspace only when requested and with resolved `workspace_project_id`; do not require Workspace for a response or local artifact.

Read `references/audit-checklist.md` before producing the final priority list. If the page content cannot be opened through an available browser, connector, or supplied file, ask for the text/HTML and do not pretend to have inspected the page.

## Rules

- Separate verified data from hypotheses.
- Use selected-project notes and rules for attributed business terms; do not ask again for facts already supplied there. Name conflicts with website content and the source of each claim.
- If `page_details_available: false` or a page has `details: null`, give a text audit: distinguish findings checked through text/available Webmaster data from checks requiring a browser or manual inspection (forms, header/footer, mobile layout, canonical/robots). Missing details do not mean those elements are absent. Do not call `read_website_page(part="details")` for a page whose details are unavailable.
- When moving from an audit to drafting page copy, briefly retain the unfinished checks from the audit. Use only services needed for the task; missing visual data does not block useful text recommendations.
- Do not invent rankings or traffic numbers.
- For generated page changes, preserve user-provided brand and legal constraints; flag regulated or unsupported claims that require qualified review.
