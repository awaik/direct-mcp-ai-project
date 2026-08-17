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

Use `lidfly_manage_addon_presets` for reusable site-level add-ons:

1. Call `action: "list"` through `call_tool`; it is read-only and needs no publication revision. Without `key` it returns summaries; with `key` it returns the full preset.
2. Call `action: "upsert"` or `action: "archive"` through `call_write_tool` with the current `expected_publication_revision`.
3. Publish immediately with `lidfly_publish_store`, then reread affected products.

An upsert fully replaces preset contents, preserves item IDs by preset + code, and reactivates an archived key. Archive preserves product links but removes the preset from effective add-ons. Assigned active presets expand in `addon_presets[]` order; duplicate codes across assigned presets are rejected. A product-local `addons[]` row overrides the same code in place, and unique local rows follow preset items. Do not copy `effective_addons` back into local `addons`: management reads intentionally distinguish local `addons`, assigned `addon_presets`, and diagnostic `effective_addons`, while storefront DTOs keep the effective result under the existing `addons` field. Quote and order creation revalidate current effective IDs and prices server-side.

YML generation in LidFly and feed registration in Yandex Webmaster are separate workflows. Use the Yandex Webmaster skill only when the user explicitly asks to register or update the ready feed URL: start with `webmaster_get_hosts`, use the exact `host_id` without `client_login`, inspect the target host and feed state, and perform registration as a separate confirmed write.

When `crawler_indexing_blocked=true`, missing sitemap, `/rss.xml`, and generated feeds are expected privacy behavior and not an SEO defect. Do not recommend enabling indexing unless the user explicitly asks for launch readiness or says the site should already be indexable.

Do not manually edit JSON-LD, `schemaOrigin`, `ssrProducts`, generated HTML, RSS, YML, Google Merchant XML, or platform-owned sitemap files. Do not promise indexing, ranking growth, stars, or rich results.
