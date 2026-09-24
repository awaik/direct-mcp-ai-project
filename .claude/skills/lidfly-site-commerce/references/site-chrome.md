# Site Chrome And Templates

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

### Change Footer Social Button Style

When the user wants calmer, grey, outlined, smaller or larger social buttons in an inherited `site-footer` or `gallery-footer`, use the typed `socialStyle` prop instead of custom CSS, a different theme `accentColor`, another footer `variant`, or replacing SVG icons with backgrounds:

1. Call `lidfly_get_site_chrome` through `call_tool`; `capabilities.footer.social_appearances` and `social_sizes` list the closed values, and `effective.footer.socialStyle` shows the resolved current look (a light `site-footer` without an override is `accent`/`large`, dark `default`/`editorial` footers are `neutral`/`regular`, `gallery-footer` is `outline`/`regular`).
2. Choose `appearance`: `neutral` for a quiet grey backing without a coloured fill, border or glow; `outline` for a transparent button with a hairline border like header socials; `accent` for the theme accent fill. Choose `size`: `compact` 40 px, `regular` 44 px, `large` 48 px.
3. Call `lidfly_update_site_chrome` through `call_write_tool` with `change.operation: "set"`, the exact current footer type, `props: { socialStyle: { appearance, size } }`, and the exact `expected_updated_at` plus `expected_publication_revision` from the read. `set` is a shallow merge, so neighbouring footer props and the `socials` list stay untouched.
4. Call `lidfly_get_site_chrome` again and verify `effective.footer.socialStyle`.

The setting does not change CTA buttons, theme colours, the order, labels or URLs of social links, and `colorMode=original` SVG icons keep their original colours. On narrow screens a row shrinks its buttons to a shared width only while each keeps a 40 px tap target; otherwise the buttons keep the preset size and wrap. `change.operation: "reset"` with `footer: ["socialStyle"]` restores the surface default.

### Add Or Reorder Footer Social Links

`site-footer` and `gallery-footer` accept up to 12 `socials`. Legacy header `socials` accept up to 6; header social links belong in `topStrip.items` (maximum 16 items of all kinds).

1. Call `lidfly_get_site_chrome` through `call_tool` and copy the complete current `effective.footer.socials` array. Keep every existing link unless the user asked to remove it.
2. Insert or move the link at the requested position. To reuse a header link, copy `label`, `url` and `icon` from its `effective.header.topStrip.items` entry and rename `network` to `type`; keep the managed SVG path and `colorMode` unchanged.
3. Call `lidfly_update_site_chrome` through `call_write_tool` with `change.operation: "set"`, the exact current footer type, `props: { socials }`, and the exact `expected_updated_at` plus `expected_publication_revision` from the read. `set` replaces only the `socials` array; `socialStyle` and other footer props stay untouched.
4. Call `lidfly_get_site_chrome` again and verify labels, URLs, order and icons.

In `lidfly_preview_site_changeset`, `set_site_chrome` replaces the whole footer override: send the complete current `overrides.footer` with the new `socials`, never `socials` alone. Rows wrap instead of overflowing, so more links never require custom CSS, local footer blocks or edits of published HTML.

### Change Site Design Template

For an existing site, use the shared read → write → reread workflow:

1. Call `lidfly_list_sites` through `call_tool`; use the exact `subdomain` and note the current template id.
2. Call `lidfly_list_site_design_templates` through `call_tool`; use an exact registry id.
3. Call `lidfly_set_site_design_template` through `call_write_tool` with `subdomain`, `design_template_id`, and normally `rebuild_existing_pages: true`.
4. Call `lidfly_list_sites` again and verify the resulting template id.

An empty `design_template_id` resets the site template. The write changes the persistent site-level profile and safely rebuilds managed HTML artifacts by default; it does not replace page `index.json`, content blocks, or the existing homepage with another template's starter page. HTML-only pages, static deployments, standalone pages with `inheritSiteDesign=false`, local design overrides, and user-owned files on generated paths are preserved and may be returned as warnings. A partial rebuild keeps the saved profile; rerun the same id with `rebuild_existing_pages: true` to reconcile.

Only the site owner or a shared-site `admin` may change the template. A shared-site `write` grant must not attempt this write.

### Configure The Knowledge Base Template

`knowledge-base` is an automatically evolving platform template for a public knowledge base, documentation site, or reference. It creates an empty managed shell: do not seed content types, sections, entries, or a universal type named `Материал`. Its sidebar, search, entry TOC, previous/next navigation, JSON-LD, sitemap, and generated section pages are platform-owned derived artifacts; keep `inherit_site_design=true` and do not copy the shell into page blocks.

Use this skill only to choose/audit the template and preserve its platform-owned shell. Route activation, exact Workspace binding, source ingest, taxonomy/charter evolution, entries, provenance, relations, semantic findings, lint, history and rollback to `$lidfly-knowledge-maintainer`. Do not use `lidfly_publish_content`, `lidfly_publish_entry`, or sequential page writes to maintain an activated knowledge profile.

The knowledge maintainer reads the current context, prepares one declarative changeset, previews its deterministic digest and atomically applies the same candidate. Once the administrator has activated profile `auto_apply`, a valid preview is applied without a second conversational publication confirmation; capacity growth and administrative profile/citation changes remain separately controlled.

Entries may use optional `navigation_order`; ordered entries come first, then unordered entries by title. Use standalone `##` and `###` paragraphs for stable server-generated headings and TOC. Drafts remain reachable by their exact URL with `noindex` but must not be described as authenticated or private: they are excluded from sidebar, homepage, previous/next, sitemap, and search. Site-wide indexing off is also not reader authentication.

Automatic template upgrades may rebuild only the managed shell and derived artifacts. Never use an upgrade as permission to alter types, fields, sections, entries, drafts, images, charter, theme/chrome overrides, custom CSS, or user blocks. `inherit_site_design=false` is an explicit opt-out for that page and should be reported as an update exclusion.


Общие CTA и workflow описаны в references/managed-pages.md: сначала definition и list_site_forms, затем полный action с рабочим fallback, CAS и проверка operation_id. Шапки сохраняют ctaAction/secondaryCtaAction, footer использует buttonAction. Контентные блоки описывают пути через action_controls. Общая форма поддерживает image/imageAlt и работает независимо от inheritSiteDesign. При update формы сохраняй весь актуальный props.
