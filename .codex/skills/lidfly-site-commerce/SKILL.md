---
name: lidfly-site-commerce
description: "Работать с сайтами, базами знаний и Commerce LidFly через MCP v3: страницы, content catalog, Agent/GEO readiness, SEO/social metadata, Schema.org, RSS/YML feeds, файлы, лиды, аналитика, публикация, товары, остатки, заказы и платежи. Использовать для операций с сайтом или магазином с точным scope и защитой секретов YooKassa."
---

# LidFly Site Commerce

Use for LidFly sites, landing pages, published pages, SEO and social metadata, Schema.org, RSS/YML feeds, assets/uploads, leads, analytics, stores, offers, variants, inventory, orders, fulfillments, payments, and Commerce setup.

## Terminology

- "Тема оформления" means visual tokens: colors, fonts, radius, renderer choices.
- "Шаблон сайта" means persistent site-level design system: header, footer, product page/card layout, checkout, and page blueprints.
- Do not call generated storefront pages "templates" unless they use real `design_template_id`.

## Source Of Truth

- Commerce source of truth is store/provider tools backed by PostgreSQL.
- Published HTML under `/sites` is only a publish artifact.
- YooKassa seller secrets are never shown, echoed, or saved in user-visible docs.

## Workflow

For a managed site with `design_template_id="knowledge-base"`, route ingest, query-to-wiki, provenance, relations, findings, changesets, and lint to `$lidfly-knowledge-maintainer`; do not emulate knowledge updates with sequential page writes.

1. If the site, store, owner, or project is unclear, call the top-level `get_provider_context({ provider: "lidfly", query? })` and use only returned scope arguments.
2. Find internal LidFly tools with `search_tools`.
3. Read each internal tool schema with `get_tool_schema` before its first call.
4. Use `call_tool` for reads: sites, pages, assets, leads, analytics, stores, orders.
5. Use `call_write_tool` for publishing, uploads, store/order changes, payment setup, and image generation.
6. For paid image generation, show prompt, format, crop, and wait for explicit confirmation.

## Progressive References

Read only the reference needed for the current task:

- [Managed pages](references/managed-pages.md) — native widgets, page metadata and video blocks.
- [Site chrome](references/site-chrome.md) — inherited header/footer and design templates.
- [Static sites](references/static-sites.md) — archive preview and full deployment.
- [Commerce](references/commerce.md) — products, imports, add-ons and storefront feeds.
- [SEO and feeds](references/seo-feeds.md) — GEO readiness, Organization, articles and RSS.
- [MCP v3 compatibility methodology](references/methodology.md) — compact legacy projection for `get_methodology`.

## Workspace

If work belongs to a business/client, resolve `workspace_project_id` before saving decisions, documents, or scheduled follow-ups.
