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
7. Never run two write calls for the same site in parallel. Before a write to a known URL/site_id/subdomain/name, refresh the targeted `get_provider_context({ provider: "lidfly", query: "..." })`; use `lidfly_list_sites` only when the site is unknown. Continue only when `publication_write.status="idle"` and use its fresh `publication_revision`. If it is `busy`, wait for the named operation to finish, reread the same targeted scope, verify the previous write's actual state, and only then make at most one retry.

For a new or substantially revised managed site, use the server-verifiable workflow from [MCP v3 compatibility methodology](references/methodology.md): declare the page and image scope, inspect compact snapshots, choose a blueprint, apply one acceptance-bound changeset, then verify the exact revision on desktop and mobile. A successful write means only that changes were applied. Say that the site is ready only after promised routes/assets and visual QA pass; disclose every visual warning explicitly.

For several desired-state edits on one site, save them sequentially and publish once after all edits. In particular, multiple taxonomy node page overrides use `get_catalog_node_page → update_catalog_node_page` one node at a time, followed by one `preview_catalog_publish → publish_store` flow.

### Privacy consent on managed sites

- Privacy consent is a site-level managed capability, not CSS, arbitrary HTML, a custom checkbox field, or a Bitrix24-only setting.
- Use `lidfly_get_site_privacy_consent` to read the current policy and exact revisions. Publish every referenced internal document route first, then call `lidfly_update_site_privacy_consent` with those exact revisions, and finish with a control read.
- `form.required=true` adds one required unchecked checkbox to every standard managed lead form. Use distinct `consent_url` and `privacy_policy_url`; changing enabled text or links requires a new version.
- `analytics.required=true` enables the site-wide accept/reject banner and keeps Yandex Metrika and optional tracking inert until acceptance. A new analytics version asks visitors again.
- Verify submitted proof through `lidfly_get_leads`: `consent` must include acceptance time, current version, immutable text, both document URLs, and the submitting page URL. Do not claim compliance from visual presence alone.

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
