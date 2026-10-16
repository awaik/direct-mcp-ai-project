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

For a new page or substantial redesign, complete this cycle in the authorized
scope. For a local correction, preserve the direction and check the affected area;
an order, inventory or SEO-metadata operation does not require a redesign.

1. Read the current site and references. Check `design_system` in
   lidfly_get_site_theme and read [Design system v2](references/design-system.md):
   on v2 the platform owns rhythm and type, you choose the style and composition.
   State one concrete visual direction: audience/task, hierarchy, typography,
   palette, grid, spacing and image treatment.
   Read [Creative page direction](references/creative-page-direction.md).
2. Map the content to native templates and blocks, with an intentional mobile
   arrangement. Read [Frontend page craft](references/frontend-page-craft.md).
   A blueprint is a starting point, not a section quota. Knowledge pages need
   readable structure; do not force a sales hero or repeated oversized cards.
3. When media is needed, read [Visual assets](references/visual-assets.md): plan
   roles/crops, inspect actual images and verify their asset bindings. Preserve
   supplied content; do not invent evidence or require paid generation.
4. Read [Visual QA](references/visual-qa.md). After applying changes, inspect actual
   desktop/mobile screenshots and interactions against the brief; fix visible
   defects and recheck the new revision. Technical pass or successful publication
   alone is not aesthetic approval. If viewing is unavailable, say QA is incomplete.

MCP/chat: use get_skill_resource with name="lidfly-site-commerce" and these paths;
installed clients read local files. Load references by stage.

### Native operations

Choose blocks by interaction: whole-card navigation, zoom, CTA or form. For focused
edits read the section snapshot; for composition use blueprints. Filter the catalog
by description/purpose/visible_when and read the selected definition; paginate or
narrow filters while has_more. Explain unsupported behavior; never substitute a
button for a requested whole-card link. After saving, disclose warnings and test
clicks, anchors, unwanted zoom, keyboard and mobile behavior.

For `design_template_id="knowledge-base"`, use `$lidfly-knowledge-maintainer` for
ingest, query-to-wiki, provenance, relations, findings, changesets and lint;
never emulate knowledge updates with sequential page writes.

1. If the site, store, owner, or project is unclear, call the top-level `get_provider_context({ provider: "lidfly", query? })` and use only returned scope arguments.
2. Find internal LidFly tools with `search_tools`.
3. Read each internal tool schema with `get_tool_schema` before its first call.
4. Use `call_tool` for reads: sites, pages, assets, leads, analytics, stores, orders, and CRM delivery diagnostics.
5. Use `call_write_tool` for publishing, uploads, store/order changes, payment setup, CRM profile/policy changes, delivery resolution, and image generation.
6. For paid image generation, show prompt, format, crop, and wait for explicit confirmation.
7. Serialize same-site writes. Before each write to a known URL/site_id/subdomain/name,
   refresh `get_provider_context({ provider: "lidfly", query: "..." })`; use `lidfly_list_sites`
   only if unknown. Require `publication_write.status="idle"` and its fresh
   `publication_revision`. If busy, wait for that operation, reread the targeted
   scope and verify the previous write before at most one retry.

For new or substantially revised managed sites, follow [MCP v3 methodology](references/methodology.md):
declare page/image scope, inspect compact snapshots, choose a blueprint, apply one
acceptance-bound changeset, then check that exact revision on desktop/mobile.
A write only proves application; claim readiness after promised routes/assets and
visual QA pass, disclosing all visual warnings.

Save same-site desired-state edits sequentially, then publish once. For multiple
taxonomy overrides: `get_catalog_node_page → update_catalog_node_page` per node,
then one `preview_catalog_publish → publish_store`.

### Privacy consent on managed sites

- Privacy consent is a site-level managed capability, not CSS, arbitrary HTML, a custom checkbox field, or a Bitrix24-only setting.
- Use `lidfly_get_site_privacy_consent` to read the current policy and exact revisions. Publish every referenced internal document route first, then call `lidfly_update_site_privacy_consent` with those exact revisions, and finish with a control read.
- `form.required=true` adds one required unchecked checkbox to every standard managed lead form. Use distinct `consent_url` and `privacy_policy_url`; changing enabled text or links requires a new version.
- `analytics.required=true` enables the site-wide accept/reject banner and keeps Yandex Metrika and optional tracking inert until acceptance. A new analytics version asks visitors again.
- Verify submitted proof through `lidfly_get_leads`: `consent` must include acceptance time, current version, immutable text, both document URLs, and the submitting page URL. Do not claim compliance from visual presence alone.

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

Read only the reference needed for the current task:

- [Design system v2](references/design-system.md) — site styles, 12 composition rules with numbers, anti-patterns and reference compositions.
- The four visual guides above — required by stage for page creation/redesign, proportional to a focused correction.
- [Managed pages](references/managed-pages.md) — native widgets, page metadata and video blocks.
- [Site chrome](references/site-chrome.md) — inherited header/footer and design templates.
- [Static sites](references/static-sites.md) — archive preview and full deployment.
- [Commerce](references/commerce.md) — products, imports, add-ons and storefront feeds.
- [Shared galleries](references/shared-galleries.md) — albums, category examples, preview/apply, operation status and Bitrix inventory.
- [SEO and feeds](references/seo-feeds.md) — GEO readiness, Organization, articles and RSS.
- [MCP v3 compatibility methodology](references/methodology.md) — mandatory compact workflow in initial chat activation and the legacy `get_methodology` projection.

## Workspace

If work belongs to a business/client, resolve `workspace_project_id` before saving decisions, documents, or scheduled follow-ups.
