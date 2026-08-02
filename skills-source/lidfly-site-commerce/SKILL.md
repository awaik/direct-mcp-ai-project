---
name: lidfly-site-commerce
description: "Работать с сайтами и Commerce LidFly через MCP v3: страницы, SEO/social metadata, Schema.org, RSS/YML feeds, файлы, лиды, аналитика, публикация, товары, остатки, заказы и платежи. Использовать для операций с сайтом или магазином с точным scope и защитой секретов YooKassa."
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

1. If the site, store, owner, or project is unclear, call the top-level `get_provider_context({ provider: "lidfly", query? })` and use only returned scope arguments.
2. Find internal LidFly tools with `search_tools`.
3. Read each internal tool schema with `get_tool_schema` before its first call.
4. Use `call_tool` for reads: sites, pages, assets, leads, analytics, stores, orders.
5. Use `call_write_tool` for publishing, uploads, store/order changes, payment setup, and image generation.
6. For paid image generation, show prompt, format, crop, and wait for explicit confirmation.

## SEO, Social Metadata And Feeds

Use the exact `subdomain` from the latest read. Change source fields through LidFly tools and let the platform rebuild canonical URLs, JSON-LD, social meta, RSS, feeds, and managed HTML. After every write, reread the same source object; do not treat a successful tool call as verification by itself.

### Organization And Local Business Schema

1. Find `lidfly_get_site_seo_profile` and `lidfly_update_site_seo_profile` with `search_tools`, then read each schema with `get_tool_schema` before its first call.
2. Call `lidfly_get_site_seo_profile` through `call_tool` with the exact `subdomain`. Keep its full profile, `updated_at`, and `publication_revision` from the same read.
3. Call `lidfly_update_site_seo_profile` through `call_write_tool` with the full replacement profile, exact `expected_updated_at`, and exact `expected_publication_revision`. This is a destructive full replacement: omitted profile fields are cleared to their empty/default values, and `profile: {}` removes the public organization entity. Do not send a partial profile or automatically retry a stale conflict.
4. Call `lidfly_get_site_seo_profile` again and reread the effective Organization, OnlineStore, LocalBusiness, or more specific factual business type.

Use only public, factual contacts, address/geo, opening hours, `sameAs`, service area, and buyer-visible merchant policies. Do not copy external organization reviews into JSON-LD. Schema eligibility does not guarantee positions, stars, or a rich result.

### Page Open Graph And Twitter Cards

1. Call `lidfly_get_page` with the exact `subdomain` and `slug`. Stop if the page is a static artifact, generated Commerce route, unknown publication, or otherwise not editable through managed page tools.
2. For every saved block index returned by the page read, call `lidfly_get_block` and reconstruct all blocks with their complete `type`, `id`, and `props`.
3. Call `lidfly_update_page` through `call_write_tool` only with a complete replacement payload from the same page read: the same exact `slug`; all blocks; the saved `title`, `description`, `og_image`, `theme_preset`, `theme`, `custom_css`, `page_kind`, `inherit_site_design`, and `auto_structured_data`, except fields the user explicitly changes; plus the latest `expected_publication_revision` required by the tool schema. Missing blocks are deletions, and omitted optional page fields are reset or defaulted.
4. Call `lidfly_get_page` again and reread the page. Open Graph, Twitter Cards, canonical, WebPage JSON-LD, and managed HTML are generated automatically from the source fields.

For one block-only change, prefer `lidfly_update_block`; do not replace the whole page. A static site must be changed in its source project and republished through the supported full static-deployment flow.

### Articles And RSS

Publish or update an article through `lidfly_publish_blog_article`; LidFly generates Article JSON-LD, Open Graph, Twitter Cards, and the marker-owned `/rss.xml`. There is no separate RSS write tool. A user-owned `/rss.xml` is preserved and reported as a warning rather than overwritten.

### VideoObject

1. Call `lidfly_list_blocks` and inspect the `video-embed` source contract.
2. Call `lidfly_get_page`, then `lidfly_get_block` for the exact video block.
3. Call `lidfly_update_block` with all current `video-embed` props and the intended embed/preview/date/duration values. LidFly derives VideoObject fields such as `thumbnailUrl`, `uploadDate`, and `duration`; do not edit the generated VideoObject directly.
4. Reread the block and page after the write.

### Commerce Schema And Feeds

The Commerce source of truth is products, variants, taxonomy, inventory, and store settings in PostgreSQL-backed tools. Read and update those records, use preview tools when the chosen operation exposes them, then call `lidfly_publish_store`. Publication generates Product or ProductGroup, visible-catalog OfferCatalog, `/yandex-market.yml`, and `/google-merchant.xml` from valid active physical products and variants. It may exclude invalid offers, including variants without a usable HTTPS image; report the returned feed counts and warnings.

YML generation in LidFly and feed registration in Yandex Webmaster are separate workflows. Use the Yandex Webmaster skill only when the user explicitly asks to register or update the ready feed URL: start with `webmaster_get_hosts`, use the exact `host_id` without `client_login`, inspect the target host and feed state, and perform registration as a separate confirmed write.

When `crawler_indexing_blocked=true`, missing sitemap, `/rss.xml`, and generated feeds are expected privacy behavior and not an SEO defect. Do not recommend enabling indexing unless the user explicitly asks for launch readiness or says the site should already be indexable.

Do not manually edit JSON-LD, `schemaOrigin`, `ssrProducts`, generated HTML, RSS, YML, Google Merchant XML, or platform-owned sitemap files. Do not promise indexing, ranking growth, stars, or rich results.

## Site Chrome And Design Template

### Change Header Logo Size

For an inherited `premium-header` or `commerce-header`, change the image logo size through site chrome instead of replacing the image with a larger bitmap or claiming that the logo container cannot grow:

1. Call `lidfly_get_site_chrome` through `call_tool` and verify that `header_type` is `premium-header` or `commerce-header`.
2. Verify that `effective.header.logoImage` is set. Without `logoImage`, `logoSize` does not change the decorative mark or text brand.
3. Choose `logoSize`: `compact` for a smaller logo, `regular` for the legacy default, or `large` for a larger responsive logo. Prefer `large` when the user asks to enlarge a vertical or detailed logo.
4. Call `lidfly_update_site_chrome` through `call_write_tool` with `change.operation: "set"`, the exact current header type (`premium-header` or `commerce-header`), `props: { logoSize }`, and the exact `expected_updated_at` plus `expected_publication_revision` from the read.
5. Call `lidfly_get_site_chrome` again and verify `effective.header.logoSize`.

`site-header` and `gallery-header` do not support `logoSize`; do not send the field for those header types.

The `large` preset keeps separate desktop, mobile, and compact scrolled sizes. Do not use page-level CSS or edit published HTML artifacts for inherited site chrome.

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
