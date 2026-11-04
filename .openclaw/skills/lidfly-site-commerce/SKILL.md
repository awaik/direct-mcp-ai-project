---
name: lidfly-site-commerce
description: "Создавать, оформлять и проверять сайты LidFly через MCP v3: визуальная концепция, шаблоны, блоки, изображения, адаптивность и visual QA. Также страницы, базы знаний, SEO/GEO, feeds, файлы, лиды, публикация, товары, остатки, заказы и платежи с точным scope и защитой секретов YooKassa."
---

# LidFly Site Commerce

## Contracts

«Тема оформления» means visual tokens (colors/fonts/radius/renderer choices).
«Шаблон сайта» means persistent site-level design: header/footer, product
page/card, checkout and page blueprints. Generated storefront pages are not
«templates» without `design_template_id`.
Store/provider tools backed by PostgreSQL own Commerce state; `/sites` HTML is
an artifact. Never show, echo or save seller YooKassa secrets in visible documents.

## Workflow

### Visual work

Creation/redesign cycle within scope:
1. Read site/references and `lidfly_get_site_theme.design_system`: v2 owns
   rhythm/type. Define audience, hierarchy, palette, grid, spacing, image treatment.
   Read [Design system](references/design-system.md), [Creative direction](references/creative-page-direction.md).
2. Map native blocks/mobile order using [Frontend craft](references/frontend-page-craft.md).
   Blueprints/compositions are starting points, not quotas; knowledge pages need
   readable structure, not forced sales heroes/oversized cards.
3. If needed, use [Visual assets](references/visual-assets.md): roles/crops,
   inspected images/bindings. Preserve content, invent no evidence or paid requirement.
4. Follow [Visual QA](references/visual-qa.md): view desktop/mobile screenshots,
   test/fix/recheck interactions and revision. Technical pass is not visual approval.

Corrections preserve direction; order/inventory/SEO edits need no redesign.
Load references by stage via `get_skill_resource(name="lidfly-site-commerce", path=...)`
or local files. Unavailable viewing means incomplete QA.

### Native operations

Choose whole-card navigation/zoom/CTA/form explicitly. Use section snapshots for
corrections, blueprints for composition. Filter definitions by purpose/description/
visible_when; paginate while has_more. Explain unsupported behavior; a button
cannot replace whole-card navigation. Disclose warnings and test clicks, anchors,
unwanted zoom, keyboard and mobile.

For `design_template_id="knowledge-base"`, use `$lidfly-knowledge-maintainer` for
ingest, query-to-wiki, provenance, relations, findings, changesets and lint;
never emulate knowledge updates with sequential page writes.

1. Resolve site/store/owner/project with `get_provider_context({provider:"lidfly",query?})`;
   use returned scope. `lidfly_list_sites` only when no URL/id/domain/name is known.
2. `search_tools` → first-use `get_tool_schema`. `call_tool` reads;
   `call_write_tool` publishes/uploads, changes store/order/payment/CRM policy,
   resolves delivery and generates images. Paid images need explicit prompt,
   format and crop confirmation.
3. Serialize same-site writes with fresh `publication_revision` and
   `publication_write.status="idle"`. If busy, await, reread scope and verify
   prior write before at most one retry.

New/substantially revised managed sites follow [Methodology](references/methodology.md):
page/image scope → compact snapshots → blueprint → acceptance-bound changeset →
exact-revision desktop/mobile checks. Readiness requires all promised routes,
assets and QA, with warnings disclosed. Save desired-state edits sequentially;
publish once per site.

### Focused corrections

Preserve target neighbors/identities. No blueprint, reference composition or full
inventory unless composition changes. Follow [Visual QA](references/visual-qa.md):
read/patch each taxonomy node (`patch.slotOperations`, `op="update_block"`),
preview summary, publish once, inspect exact revision and returned block index.
That reference defines desktop/mobile crops, conditional tablet checks and
`next_safe_call` recovery.

### Privacy consent

Use native site capability, never CSS/HTML/custom fields/Bitrix24. Read
`lidfly_get_site_privacy_consent`, publish internal documents, then
`lidfly_update_site_privacy_consent` with exact revisions; reread.
`form.required=true`: one required unchecked checkbox, distinct
consent_url/privacy_policy_url. Changed enabled text/links need a new version.
`analytics.required=true`: accept/reject banner blocks Metrika/optional tracking;
new versions ask again. Verify `lidfly_get_leads.consent`: time/version,
immutable text, both document URLs and page URL. Visual presence is insufficient.

### Bitrix24 / B242YA widget

Pass full `widget_code`, optional `b242ya_code`, exact subdomain to
`lidfly_prepare_bitrix24_widget`; never extract URLs or replace blocks. Show
portal/origins/components/scope/conflicts. Only `ready=true`: apply agreed
`normalized_arguments` with `lidfly_apply_bitrix24_widget`. Conflicts need fresh
preparation/agreement, never CAS substitution. `disable` retains settings;
`reset` removes them. Pending/lost response: read operation journal.
No webhook needed; widget is independent of server forms. Installation proves
no ClientID delivery. Own t.me links without a second button: `mode=telegram_links`,
one `telegram_bot`, B242YA and CRM tracking required. Real CRM/Telegram inquiries
need separate authorization. Sources: [Bitrix24](https://helpdesk.bitrix24.ru/open/25268342/),
[B242YA](https://b242ya.ru/), checked 08.10.2026.

## Progressive References

Load by task/stage; visual guides are mandatory for redesign, proportional for corrections.

- [Design system v2](references/design-system.md): styles/composition.
- [Managed pages](references/managed-pages.md): widgets/metadata/video.
- [Site chrome](references/site-chrome.md): header/footer/templates.
- [Static sites](references/static-sites.md): archive preview/deploy.
- [Commerce](references/commerce.md): products/imports/add-ons/feeds.
- [Galleries](references/shared-galleries.md): albums/preview/apply/Bitrix.
- [SEO/feeds](references/seo-feeds.md): GEO/Organization/articles/RSS.
- [Methodology](references/methodology.md): initial chat / legacy get_methodology.

## Workspace

Resolve `workspace_project_id` before saving business/client decisions, documents or scheduled follow-ups.

## Client materials and evidence

Stories are editorial content, not testimonials. Invent no ratings/stars, counts,
results, certificates or quotes. Use supplied facts; record file/message/URL
provenance in project notes. Label edits, never call them verbatim. List missing
photos/testimonials/proof; preserve other blocks, asset paths and design.

New page images/logos: one `lidfly_preview_site_changeset` →
`lidfly_apply_site_changeset` with `import_image` (key + chat_attachment_id or
image_url), `upsert_page`, `@asset:key`. Confirm normalized arguments, digest and
effects together. Standalone libraries may use separate uploads. `patch_theme`,
`set_site_chrome`, `set_site_css` own theme, chrome and CSS. Never substitute page
`themePreset` for `site_style`; if absent in changesets, read its tool schema and
prepare a separate agreed action. Missing legacy canonical_path/public_url:
reread that site's `lidfly_list_assets`, never infer paths from filenames.
