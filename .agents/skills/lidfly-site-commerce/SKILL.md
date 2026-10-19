---
name: lidfly-site-commerce
description: "Создавать, оформлять и проверять сайты LidFly через MCP v3: визуальная концепция, шаблоны, блоки, изображения, адаптивность и visual QA. Также страницы, базы знаний, SEO/GEO, feeds, файлы, лиды, публикация, товары, остатки, заказы и платежи с точным scope и защитой секретов YooKassa."
---

# LidFly Site Commerce

## Terminology

- "Тема оформления" means visual tokens: colors, fonts, radius, renderer choices.
- "Шаблон сайта" means persistent site-level design system: header, footer, product page/card layout, checkout, and page blueprints.
- Do not call generated storefront pages "templates" unless they use real `design_template_id`.

## Source Of Truth

- Commerce source of truth is store/provider tools backed by PostgreSQL.
- Published HTML under `/sites` is only a publish artifact.
- YooKassa seller secrets are never shown, echoed, or saved in user-visible docs.

## Workflow

### Visual work

For page creation/redesign, follow this cycle within authorized scope. For local corrections preserve direction and inspect the affected area; order/inventory/SEO edits need no redesign.

1. Read site/references and `design_system` from lidfly_get_site_theme. On v2 the platform owns rhythm/type; choose style/composition. Define audience, hierarchy, type, palette, grid, spacing and image treatment. Read [Design system](references/design-system.md) and [Creative direction](references/creative-page-direction.md).
2. Map content to native blocks with deliberate mobile order. Read [Frontend craft](references/frontend-page-craft.md). Blueprints are starting points, not section quotas; knowledge pages need readable structure, not forced sales heroes/oversized cards.
3. When media is needed, read [Visual assets](references/visual-assets.md), plan crops/roles, inspect images and verify bindings. Preserve supplied content; never invent evidence or require paid generation.
4. Read [Visual QA](references/visual-qa.md); inspect actual desktop/mobile screenshots and interactions, fix defects and recheck the revision. Publication/technical pass alone is not aesthetic approval. Report unavailable viewing as incomplete QA.

Load references by stage using get_skill_resource(name="lidfly-site-commerce", path=...) in MCP/chat, or local files in installed clients.

### Native operations

Choose whole-card navigation/zoom/CTA/form explicitly. Read section snapshots for focused edits, blueprints for composition. Filter catalog by description/purpose/visible_when; read definitions and paginate/narrow while has_more. Explain unsupported interactions; never substitute a button for whole-card navigation. After saving disclose warnings and test clicks, anchors, unwanted zoom, keyboard and mobile.

For `design_template_id="knowledge-base"`, use `$lidfly-knowledge-maintainer` for
ingest, query-to-wiki, provenance, relations, findings, changesets and lint;
never emulate knowledge updates with sequential page writes.

1. Resolve unclear site/store/owner/project through top-level `get_provider_context({provider:"lidfly",query?})`; use returned scope only.
2. Discover via `search_tools`; read `get_tool_schema` before first use. `call_tool` reads; `call_write_tool` publishes/uploads, changes stores/orders/payment/CRM policy, resolves delivery and generates images.
3. Paid image generation requires explicit confirmation of prompt, format and crop.
4. Serialize same-site writes. Refresh `get_provider_context` for known URL/id/domain/name; use `lidfly_list_sites` only if unknown. Require fresh `publication_revision` and `publication_write.status="idle"`. If busy, await operation, reread targeted scope and verify the previous write before at most one retry.

For new or substantially revised managed sites, follow [MCP v3 methodology](references/methodology.md):
declare page/image scope, inspect compact snapshots, choose a blueprint, apply one
acceptance-bound changeset, then check that exact revision on desktop/mobile.
A write only proves application; claim readiness after promised routes/assets and
visual QA pass, disclosing all visual warnings.

Save same-site desired-state edits sequentially, then publish once. For multiple
taxonomy overrides: `get_catalog_node_page → update_catalog_node_page` per node,
then one `preview_catalog_publish → publish_store`.

### Privacy consent

Site-level managed capability; never emulate with CSS/HTML/custom fields or Bitrix24 settings. Read `lidfly_get_site_privacy_consent`, publish referenced internal document routes, then `lidfly_update_site_privacy_consent` with exact revisions and control-read.

`form.required=true`: one required unchecked checkbox per standard lead form; distinct consent_url/privacy_policy_url. Changed enabled text/links need a new version. `analytics.required=true`: accept/reject banner blocks Metrika/optional tracking until acceptance; new version asks again.

Verify lead `consent` via `lidfly_get_leads`: time, current version, immutable text, both document URLs and submitting page URL. Visual presence alone proves no compliance.

### Виджет Битрикс24 и B242YA

Передайте полный `widget_code` и опциональный `b242ya_code` с точным поддоменом
в `lidfly_prepare_bitrix24_widget`; сами URL не извлекайте, блоки не заменяйте.
Покажите портал, origins, компоненты, охват и конфликты. При `ready=true` передайте
согласованные `normalized_arguments` в `lidfly_apply_bitrix24_widget`. Конфликт:
новая подготовка и согласование, без подмены CAS. `disable` сохраняет настройку,
`reset` удаляет. После pending/потери ответа читайте журнал операции.
Виджет независим от серверных форм, webhook не нужен. Установка не доказывает
передачу ClientID; ссылка t.me не становится B242YA-каналом. Реальные CRM/Telegram
обращения — только по отдельному поручению.
Источники: [Битрикс24](https://helpdesk.bitrix24.ru/open/25268342/),
[B242YA](https://b242ya.ru/), проверено 08.10.2026.

## Progressive References

Load only task-relevant references; the four visual guides above are required by stage for creation/redesign, proportionally for corrections.

- [Design system v2](references/design-system.md): styles/composition.
- [Managed pages](references/managed-pages.md): widgets/metadata/video.
- [Site chrome](references/site-chrome.md): header/footer/templates.
- [Static sites](references/static-sites.md): archive preview/deploy.
- [Commerce](references/commerce.md): products/imports/add-ons/feeds.
- [Galleries](references/shared-galleries.md): albums/preview/apply/Bitrix.
- [SEO/feeds](references/seo-feeds.md): GEO/Organization/articles/RSS.
- [Methodology](references/methodology.md): mandatory initial chat workflow and legacy get_methodology projection.

## Workspace

If work belongs to a business/client, resolve `workspace_project_id` before saving decisions, documents, or scheduled follow-ups.

## Client materials and evidence

Treat client stories as editorial content, not testimonials. Never invent ratings, stars, customer counts, results, certificates or quotes. Require supplied facts and sources; record file/message/URL provenance in task/project notes. Label edits as edits, not verbatim quotes. List missing photos/testimonials/proof as remaining work. Focused edits preserve other blocks, asset paths and design.

For pages with new logos/images, use one `lidfly_preview_site_changeset` → `lidfly_apply_site_changeset` package: `import_image` (key + chat_attachment_id or image_url), `upsert_page`, and `@asset:key` references. Confirm returned normalized arguments, digest and effects together. Separate uploads suit a standalone asset library. `patch_theme`, `set_site_chrome`, `set_site_css` change theme, shared chrome and CSS respectively. Never replace `site_style` with page `themePreset`; if the changeset schema lacks site_style, read the style tool schema and prepare a separate agreed action. For legacy uploads lacking canonical_path/public_url, reread the exact site's `lidfly_list_assets`; never infer paths from filenames.

Source: chat-site-flow audit, owner decisions and `lidfly-site-changeset-schema.ts`, verified 2026-10-18.
