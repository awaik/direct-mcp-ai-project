# Commerce

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

Use the dedicated read and write tools for reusable site-level add-ons:

1. Call `lidfly_list_addon_presets` through `call_tool`. It is read-only and needs no publication revision. Without `key` it returns summaries; with `key` it returns the full preset, current `updated_at`, assignments, and actual co-assignment conflicts.
2. Call `lidfly_manage_addon_presets` through `call_write_tool` with `action: "upsert"` or `action: "archive"` and the current `expected_publication_revision`. A full replacement of an existing preset also requires `expected_preset_updated_at` from the point read.
3. Publish immediately with `lidfly_publish_store`, then reread affected products.

The former `lidfly_manage_addon_presets(action: "list")` contract is intentionally unsupported; do not retry it or emulate it with a write call.

An upsert fully replaces preset contents, preserves item IDs by preset + code, and reactivates an archived key. Archive preserves product links but removes the preset from effective add-ons. Assigned active presets expand in `addon_presets[]` order; duplicate codes across assigned presets are rejected. A product-local `addons[]` row overrides the same code in place, and unique local rows follow preset items. Do not copy `effective_addons` back into local `addons`: management reads intentionally distinguish local `addons`, assigned `addon_presets`, and diagnostic `effective_addons`, while storefront DTOs keep the effective result under the existing `addons` field. Quote and order creation revalidate current effective IDs and prices server-side.

YML generation in LidFly and feed registration in Yandex Webmaster are separate workflows. Use the Yandex Webmaster skill only when the user explicitly asks to register or update the ready feed URL: start with `webmaster_get_hosts`, use the exact `host_id` without `client_login`, inspect the target host and feed state, and perform registration as a separate confirmed write.

When `crawler_indexing_blocked=true`, missing sitemap, `/rss.xml`, and generated feeds are expected privacy behavior and not an SEO defect. Do not recommend enabling indexing unless the user explicitly asks for launch readiness or says the site should already be indexable.

Do not manually edit JSON-LD, `schemaOrigin`, `ssrProducts`, generated HTML, RSS, YML, Google Merchant XML, or platform-owned sitemap files. Do not promise indexing, ranking growth, stars, or rich results.

### Generated Storefront Ownership

Generated catalog, taxonomy, facet, product, checkout, order, and customer routes are platform-owned projections of Commerce data. Read their current typed configuration with the dedicated store or catalog-node tools and change only capabilities declared by those tools. Do not use generic page replacement or site/page custom CSS to compensate for a shared renderer, runtime, or DOM-contract defect.

If a visual problem remains after the typed configuration, custom CSS, and template state have been read, verify the smallest affected desktop/mobile scenario and search the full tool catalog once without `query` or `provider`. When no dedicated capability exists and the defect belongs to platform-owned output, explain that the site data is intact and a LidFly platform fix is required. Do not invent a tool, rewrite generated HTML, or apply a site-specific workaround. Load `$lidfly-support-escalation` to prepare a redacted capability request; show the draft and send it only after the user's explicit textual consent.

### Commerce Order References And CRM Profiles

Catalog reference codes support nested `brand → model group → model` primary paths. Read `lidfly_get_order_reference_settings` and its diagnostic v2 details before changing codes. A coded model is scoped to its single active brand ancestor even when its immediate parent is another model; the same model code may exist under different brands but not in two branches of one brand. Use `lidfly_set_catalog_codes` with `dry_run: true`, review every fallback/conflict, then apply once with `dry_run: false` and the fresh reference revision. Do not infer a model scope from the immediate parent and do not rewrite historical order snapshots.

`lidfly_get_orders(detail_level="full")` returns `line_position` and immutable `primary_classification` for each item. Summary mode intentionally stays compact. `item_count` is the sum of quantities; CRM `order.line_count` is the number of order rows. Full order data can contain customer PII, so request it only when needed and never paste it into public documents.

For Bitrix24 profile changes use this exact flow:

1. Call `lidfly_get_bitrix24_integration`.
2. Call `lidfly_list_crm_delivery_profiles` and use only field IDs/title tokens returned in `source_schemas`; never invent a token.
3. Call `lidfly_preview_crm_profile_change` with the candidate change and sample. For Commerce, omit both sample payload selectors to use the safe multi-item fixture, or pass one owned `source_order_id`; never pass it together with `source_payload`.
4. Show the normalized change, configuration hash and `sample_delivery_plan`, then wait for explicit textual confirmation.
5. Call `lidfly_apply_crm_profile_change` with the unchanged normalized change, revisions and hash, then reread profiles.

Keep `title_template` separate from `field_mapping`; Bitrix24 `TITLE` is adapter-managed. Useful Commerce templates are `Заказ с сайта — {order.item_titles}` and `{order.reference_code} — {order.brand_model_summary} — {order.item_titles}`. `order.item_titles` contains only immutable product-line titles in `line_position` order, without variants, quantities, SKU, prices or totals.
