---
name: lidfly-site-commerce
description: "Работать с сайтами и Commerce LidFly через MCP v3: страницы, Agent/GEO readiness, SEO/social metadata, Schema.org, RSS/YML feeds, файлы, лиды, аналитика, публикация, товары, остатки, заказы и платежи. Использовать для операций с сайтом или магазином с точным scope и защитой секретов YooKassa."
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

## Agent And GEO Readiness

Use this workflow for requests about GEO, AI visibility, agent ready/readiness, MCP Card, AI robots, Markdown for agents, Agent Skills, WebMCP, or DNS-AID:

1. Find `lidfly_get_agent_readiness` and read its schema, then call it through `call_tool` with the exact `subdomain`.
2. Explain the two independent results: Agent Readiness is technical discovery/access for AI clients; GEO Content Readiness is factual clarity, entities, FAQ, characteristics, geography, dates, authorship, cases, and structured data for Generative Engine Optimization. GEO here does not mean geographic SEO.
3. Treat `crawler_indexing_blocked=true` as a stronger privacy setting. Missing Markdown, Skills, MCP Card, WebMCP, sitemap, and a low external score are expected while the site is closed. Never enable indexing automatically.
4. In `platform` mode, LidFly owns the publication marker, AI robots block, Link headers, Markdown negotiation, API catalog, OAuth metadata, protected-resource metadata, `auth.md`, MCP Card, Agent Skills, capabilities, and WebMCP runtime. Do not edit, upload, overwrite, or delete these platform artifacts manually.
5. Change only the source setting through `lidfly_update_agent_readiness` via `call_write_tool`, using `mode: "platform" | "custom"` and the exact `expected_publication_revision` plus `expected_updated_at` from the same readiness read. Reread afterward. This write does not open search indexing.
6. `custom` returns discovery ownership to the site owner and does not prove that custom artifacts are valid. Preserve user-owned HTML, ZIP, robots rules, CSP, and `.well-known` files.
7. DNS-AID is versioned to draft-02 and remains an Internet-Draft. Report 100/100 only after both generated SVCB records, DNSSEC/AD, the public endpoints, and the current external scanner are verified. Do not publish `_a2a` without a real A2A endpoint.

The default content policy for an open platform-managed site is `search=yes, ai-input=yes, ai-train=no`. A high technical score does not guarantee traffic, rankings, citations, or rich results.

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

#### Private Product Import

For more than 100 products, use this exact flow:

1. Read the managed site and keep its current `publication_revision`.
2. Call `lidfly_request_products_import_upload` through `call_write_tool` with the exact `subdomain`, local filename, and `format: "json" | "jsonl"`.
3. Upload the local file to the returned private URL with `curl -T`. The URL is a five-minute one-use bearer capability; do not expose or save it in documents.
4. Call `lidfly_import_products` through `call_write_tool` with `dry_run: true`, the returned `upload_id`, intended `on_conflict`, and the current `expected_publication_revision`.
5. Review all counts and returned errors. A dry run executes the same transaction and rolls it back; it retains the staged file and does not change PostgreSQL, HTML, or publication revision.
6. Only after an acceptable dry run, call the same import with `dry_run: false`. Then call `lidfly_publish_store` separately and reread representative products.

Limits are 50 MiB and 5,000 products. JSON must be one flat top-level array; JSONL has one object on each non-empty line. Do not pass a public `source_url`, nested batch arrays, or provider-specific field conversions. A completed real `skip`/`update` import removes the upload; parse/CAS failures and an all-or-nothing `fail` rollback retain it until the one-hour TTL.

Product create/import accepts ordered `addon_presets[]`. On update, omitting this field preserves assignments and `[]` clears them.

#### Add-on Presets

Use `lidfly_manage_addon_presets` for reusable site-level add-ons:

1. Call `action: "list"` through `call_tool`; it is read-only and needs no publication revision. Without `key` it returns summaries; with `key` it returns the full preset.
2. Call `action: "upsert"` or `action: "archive"` through `call_write_tool` with the current `expected_publication_revision`.
3. Publish immediately with `lidfly_publish_store`, then reread affected products.

An upsert fully replaces preset contents, preserves item IDs by preset + code, and reactivates an archived key. Archive preserves product links but removes the preset from effective add-ons. Assigned active presets expand in `addon_presets[]` order; duplicate codes across assigned presets are rejected. A product-local `addons[]` row overrides the same code in place, and unique local rows follow preset items. Do not copy `effective_addons` back into local `addons`: management reads intentionally distinguish local `addons`, assigned `addon_presets`, and diagnostic `effective_addons`, while storefront DTOs keep the effective result under the existing `addons` field. Quote and order creation revalidate current effective IDs and prices server-side.

YML generation in LidFly and feed registration in Yandex Webmaster are separate workflows. Use the Yandex Webmaster skill only when the user explicitly asks to register or update the ready feed URL: start with `webmaster_get_hosts`, use the exact `host_id` without `client_login`, inspect the target host and feed state, and perform registration as a separate confirmed write.

When `crawler_indexing_blocked=true`, missing sitemap, `/rss.xml`, and generated feeds are expected privacy behavior and not an SEO defect. Do not recommend enabling indexing unless the user explicitly asks for launch readiness or says the site should already be indexable.

Do not manually edit JSON-LD, `schemaOrigin`, `ssrProducts`, generated HTML, RSS, YML, Google Merchant XML, or platform-owned sitemap files. Do not promise indexing, ranking growth, stars, or rich results.

## Site Chrome And Design Template

### Preserve An Active Site Template

An active `design_template_id` is the site's persistent design system, not a suggestion to replace during ordinary page work.

1. Before the first write to an existing templated site, call `lidfly_list_pages` and `lidfly_audit_site_design_template` through `call_tool`.
2. Read the audit's applied template, expected starter block sequence, page-local overrides, key features, Commerce readiness, and generated-route conflicts. Explain relevant warnings before proposing a write.
3. By default keep `inherit_site_design=true`, omit page-local `theme_preset`, `theme`, header/footer blocks, and custom CSS, and edit the saved content blocks in place. Do not replace inherited chrome with page blocks.
4. Template deviations are allowed when the user chooses them. Never set `confirm_template_deviation=true` automatically or because the client is in auto-approve mode. First show the concrete impact, obtain explicit textual agreement, and only then repeat the exact write with the flag.
5. Rerun `lidfly_audit_site_design_template` after structural, theme, chrome, storefront-route, or homepage changes and report remaining deviations.

Changing normal content or props inside an existing content block is not itself a template deviation. Disabling inheritance, adding local chrome/theme, changing or deleting starter-home structure, disabling a declared key feature, or disabling a route that suppresses such a feature is.

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
