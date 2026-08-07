---
name: lidfly-page-migration
description: "Перенести или улучшить существующую страницу в LidFly 1:1 через MCP v3: полный инвентарь секций без сжатия и выдумывания, безопасная работа с существующим design_template_id, полный replacement payload, перенос изображений и посекционная сверка."
---

# LidFly Page Migration

Use when the user asks to migrate, copy, or recreate an existing page from another platform, or to use it as a reference for improving a managed LidFly page. This workflow supports both a new or empty target and a site that already has pages, content, and an active design template. The goal is a faithful 1:1 transfer: same sections, same order, same content, same visual character. A migration that compresses 12 sections into 5 blocks or invents content the original does not have is a failed migration.

## Workflow

1. Fetch the original page HTML and its CSS files. Identify the platform (WordPress/Elementor, Tilda, Bitrix) to pick the right section markers: Elementor top-level containers use `e-parent`, Tilda uses `t-rec` records.
2. Build a section inventory before writing anything: one line per section, top to bottom, with heading, body summary, image count, button labels, and forms. Number the sections.
3. Extract design tokens from the CSS: background, text, card, and accent colors by frequency; heading and body font families; card border radius. Note whether the heading font differs from the body font. This is a comparison input, not permission to change the whole site's theme.
4. Resolve the target with `get_provider_context({ provider: "lidfly", query })` and copy only returned `tool_args`. Before the first write, call `lidfly_list_pages`. If the target page exists, read it with `lidfly_get_page`, call `lidfly_get_block` for every saved block index, and keep the complete page state plus the exact latest `publication_revision` from that read. If the page is new, use the current site state and creation contract returned by the read tools and current schema; do not invent replacement fields or a revision. Stop if the target is a static artifact, generated Commerce route, or otherwise not editable through managed page tools.
5. If the existing site has an active `design_template_id`, call `lidfly_audit_site_design_template` before the first write. Inspect the applied template, starter block sequence, inheritance, page-local overrides, key features, Commerce readiness, and route conflicts. Explain relevant warnings before proposing the migration write.
6. Map every source section to a LidFly block via `lidfly_list_blocks`. Do not drop a section because no block feels perfect: pick the closest block and keep the content. Do not add blocks that have no counterpart in the original (FAQ, quizzes, calculators) unless the user asks.
7. Prepare and show the section mapping and every intended template deviation before changing the page. By default preserve `inherit_site_design=true`, inherited chrome, starter structure, and the site's design system. If 1:1 styling requires a page-local theme, custom CSS, disabled inheritance, local header/footer, or a starter-structure change, explain the impact and obtain explicit textual confirmation before the write. Only then may the exact call use `confirm_template_deviation: true`; auto-approve is not confirmation.
8. Transfer all images: download originals, upload through `lidfly_upload_images_batch`, and use the returned asset references in block props. Never hotlink the source site.
9. For an existing managed page, reconstruct every block with its complete `type`, `id`, and `props`, then call `lidfly_update_page` with a complete replacement payload from the same page read: the same exact `slug`; all reconstructed blocks; the saved `title`, `description`, `og_image`, `theme_preset`, `theme`, `custom_css`, `page_kind`, `inherit_site_design`, and `auto_structured_data`, except fields the user explicitly changes; plus the exact latest `expected_publication_revision` required by the tool schema. Missing blocks are deletions, and omitted optional fields can reset to defaults. Never automatically retry a stale CAS conflict: reread and rebuild the payload.
10. For a change confined to one existing block, prefer `lidfly_update_block` with all current props instead of replacing the whole page. Do not call `lidfly_update_site_theme` for a page-only migration or improvement. A site-wide theme change is a separate operation that requires the user to ask for the whole site to change and to confirm its stated cross-page impact before the write.
11. Reread the page after the write and compare it section by section with the inventory from step 2. After structural, theme, chrome, storefront-route, or homepage changes, rerun `lidfly_audit_site_design_template`. Report the mapping table, effective page fields, and any remaining deliberate deviations.

## Block Mapping Hints

- Personal intro with a photo, or text plus illustration: `feature-split`.
- Three to four advantage cards: `features-grid`.
- Service chips or tag strips: `logo-service-rail` with wordmark labels.
- Large service cards with photos, bullets, and per-card CTA: `overlap-services-showcase`.
- Case studies with metrics: `case-study` per case, badges via `stats-counter`.
- Price plans with bullet lists: `pricing-3col` or `stacked-pricing-groups` for four and more plans.
- Client logo walls: `logo-cloud` with grayscale, `logo-cloud-cases` when captions matter.
- Contact section with address, hours, phone: `contact-card` plus a lead form block.

## Rules

- Follow MCP v3 order: `search_tools`, then `get_tool_schema`, then `call_tool` for reads and `call_write_tool` for writes.
- Page and site updates, uploads, and publication are writes and must use `call_write_tool`; all prerequisite reads use `call_tool`.
- Keep the original wording. Fix only obvious typos, and tell the user about each fix.
- Respect legal blocks: transfer privacy policy links, offer links, and footer requisites as they are.
