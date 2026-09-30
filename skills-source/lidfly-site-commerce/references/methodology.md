# LidFly
Known URL/id/domain/name: get_provider_context(provider: "lidfly", query: "...") returns latest publication revision; if unknown, fall back to lidfly_list_sites. Require idle; serialize writes; never blind-retry.

Visual work: choose purpose, hierarchy, type/palette, spacing, crops and mobile composition. Load get_skill(name: "lidfly-site-commerce") and its four visual guides by stage. Preserve content/template; prefer typed props over CSS. Blueprints are not section quotas. Keep knowledge pages compact. Inspect real desktop/mobile screenshots and interactions; fix defects and recheck the exact revision. Technical pass is not aesthetic approval; disclose warnings/unverified QA.

1. Map nested page paths with lidfly_list_pages; read lidfly_get_page_snapshot and follow ownership. Legacy: lidfly_get_page(subdomain, slug), lidfly_get_block(subdomain, slug, index).
2. Define card link/zoom/CTA/form. Use section snapshots or lidfly_recommend_page_blueprint, filtered lidfly_list_blocks and lidfly_get_block_definition; paginate while has_more. Read purpose/visible_when/actions. Do not substitute a button for whole-card navigation.
3. Discover lidfly_list_site_design_templates; check theme/CSS/fonts/forms. Reusable chrome is not singleton: use registry-level reusable blocks. lidfly_preview_site_changeset binds routes/assets/references; confirm diff, apply unchanged digest. Legacy: lidfly_update_block(subdomain, slug, index, props).
4. Reread snapshots, routes and asset SHA/path/placement; require postconditions and visual QA. Screenshots cannot prove clicks.

Taxonomy: follow next_safe_call while pagination.has_more; on conflict reread include_archived=true and restore the archived node only. emit_sitemap_while_blocked is per-publish and keeps noindex/robots unchanged. Static: upload→preview→lidfly_deploy_static_site with exact digest/revision; collisions fail closed. Assets immutable; forms POST /api/leads. Do not promise arbitrary backend/Python/Node upload; use lidfly_list_managed_endpoints for calculators and AI forms.
