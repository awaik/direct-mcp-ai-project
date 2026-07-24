---
name: lidfly-site-commerce
description: "Работать с сайтами и Commerce LidFly через MCP v3: страницы, файлы, лиды, аналитика, публикация, товары, остатки, заказы и платежи. Использовать для операций с сайтом или магазином с точным scope и защитой секретов YooKassa."
---

# LidFly Site Commerce

Use for LidFly sites, landing pages, published pages, assets/uploads, leads, analytics, stores, offers, variants, inventory, orders, fulfillments, payments, and Commerce setup.

## Terminology

- "Тема оформления" means visual tokens: colors, fonts, radius, renderer choices.
- "Шаблон сайта" means persistent site-level design system: header, footer, product page/card layout, checkout, and page blueprints.
- Do not call generated storefront pages "templates" unless they use real `design_template_id`.

## Source Of Truth

- Commerce source of truth is store/provider tools backed by PostgreSQL.
- Published HTML under `/sites` is only a publish artifact.
- YooKassa seller secrets are never shown, echoed, or saved in user-visible docs.

## Workflow

1. If the site, store, owner, or project is unclear, call the top-level `get_provider_context({ provider: "lidfly", query? })` and use only returned scope arguments.
2. Find internal LidFly tools with `search_tools`.
3. Read each internal tool schema with `get_tool_schema` before its first call.
4. Use `call_tool` for reads: sites, pages, assets, leads, analytics, stores, orders.
5. Use `call_write_tool` for publishing, uploads, store/order changes, payment setup, and image generation.
6. For paid image generation, show prompt, format, crop, and wait for explicit confirmation.

### Change Site Design Template

For an existing site, use the shared read → write → reread workflow:

1. Call `lidfly_list_sites` through `call_tool`; use the exact `subdomain` and note the current template id.
2. Call `lidfly_list_site_design_templates` through `call_tool`; use an exact registry id.
3. Call `lidfly_set_site_design_template` through `call_write_tool` with `subdomain`, `design_template_id`, and normally `rebuild_existing_pages: true`.
4. Call `lidfly_list_sites` again and verify the resulting template id.

An empty `design_template_id` resets the site template. The write changes the persistent site-level profile and safely rebuilds managed HTML artifacts by default; it does not replace page `index.json`, content blocks, or the existing homepage with another template's starter page. HTML-only pages, static deployments, standalone pages with `inheritSiteDesign=false`, local design overrides, and user-owned files on generated paths are preserved and may be returned as warnings. A partial rebuild keeps the saved profile; rerun the same id with `rebuild_existing_pages: true` to reconcile.

Only the site owner or a shared-site `admin` may change the template. A shared-site `write` grant must not attempt this write.

## Workspace

If work belongs to a business/client, resolve `workspace_project_id` before saving decisions, documents, or scheduled follow-ups.
