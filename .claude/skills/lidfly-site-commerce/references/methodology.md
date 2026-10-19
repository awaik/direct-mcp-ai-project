# LidFly
Known URL/id/domain/name: get_provider_context(provider: "lidfly", query: "...") returns latest publication revision; if unknown, fall back to lidfly_list_sites. Require idle; serialize writes; never blind-retry.

Visual: lidfly_get_site_theme → design_system → lidfly_recommend_page_blueprint. Read design-system.md and visual guides by stage. Preserve content/template; prefer typed props to CSS. No section quota; keep knowledge pages compact. Verify desktop/mobile and interactions; fix defects, recheck revision; disclose warnings/incomplete QA. Never invent client evidence; preserve provenance (SKILL.md, verified 2026-10-18).

1. Map nested page paths with lidfly_list_pages; read lidfly_get_page_snapshot and follow ownership. Legacy: lidfly_get_page(subdomain, slug), lidfly_get_block(subdomain, slug, index).
2. Define card link/zoom/CTA/form. Use section snapshots or lidfly_recommend_page_blueprint, filtered lidfly_list_blocks and lidfly_get_block_definition; paginate while has_more. Read purpose/visible_when/actions. Do not substitute a button for whole-card navigation.
3. lidfly_list_site_design_templates; check theme/CSS/fonts/forms. Reusable chrome is not singleton: materially different chrome uses registry-level reusable blocks. lidfly_preview_site_changeset binds routes/assets/references; new media: import_image + upsert_page, @asset:key. Confirm returned arguments/digest. Legacy: lidfly_update_block(subdomain, slug, index, props).
4. Reread snapshots, routes and asset SHA/path/placement; require postconditions and visual QA. Screenshots cannot prove clicks.

Taxonomy: follow next_safe_call while pagination.has_more; on conflict reread include_archived=true and restore the archived node only. emit_sitemap_while_blocked is per-publish and keeps noindex/robots unchanged. Static: upload→preview→lidfly_deploy_static_site with exact digest/revision; collisions fail closed. Assets immutable; forms POST /api/leads. Do not promise arbitrary backend/Python/Node upload; use lidfly_list_managed_endpoints for calculators and AI forms.
