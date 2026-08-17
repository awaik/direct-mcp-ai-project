# LidFly methodology
Known URL/id/domain/name: get_provider_context(provider: "lidfly", query: "...") -> tool_args; if unknown, fall back to lidfly_list_sites.
Write: read site and latest publication revision; call rechecks access; never blind-retry.
Favicon: lidfly_get_favicon -> set/generate/delete -> reread.
Managed: lidfly_list_pages(subdomain) -> lidfly_get_page(subdomain, slug) -> lidfly_get_block(subdomain, slug, index) -> lidfly_update_block(subdomain, slug, index, props). Static: replace/redeploy. LidFly supports nested page paths.
Templates: lidfly_list_site_design_templates -> call_write_tool(lidfly_set_site_design_template) -> reread site. Reusable chrome is not singleton; different chrome belongs in registry-level reusable blocks.
Content: publish_blog_article preserves url_path. Stores: catalog -> publish_store. Portfolios: publish_project.
Taxonomy: list -> manage/assign -> preview -> publish_store; use get/update_catalog_node_page, not page/block tools. Follow next_safe_call while pagination.has_more. On conflict reread include_archived=true, then restore the archived node only. emit_sitemap_while_blocked is per-publish and keeps noindex/robots unchanged.
Route HTML: lidfly_list_pages -> optional archive upload -> lidfly_create_html_page/replace/delete with fresh revision/digest; reread on CAS conflict.
Static root: request_upload_archive -> upload -> preview -> inspect -> lidfly_deploy_static_site(preview_id,digest,revision,confirm_replace). Route collisions fail closed; locked sites require browser unlock.
Assets: list_assets -> upload_image/upload_file. Names never overwrite; replace needs consent; delete blocks managed references.
Static forms: POST /api/leads. Do not promise arbitrary backend/Python/Node upload; use lidfly_list_managed_endpoints for calculators/AI forms.
