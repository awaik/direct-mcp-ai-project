# Shared site galleries

For «галерея», «альбом», «фото категории» or «примеры работ», use shared galleries. Do not put category examples in `offers.images`: that is primary product/variant media.

1. Resolve the exact site and current publication revision. Read schemas for `lidfly_list_galleries`, `lidfly_get_gallery`, `lidfly_resolve_gallery`, `lidfly_preview_gallery_changes`, and `lidfly_apply_gallery_changes`.
2. Upload files separately using existing asset tools. Use returned immutable asset IDs. Generated previews are not extra gallery items.
3. Read gallery and binding revisions. Preview a strict batch with `expected_gallery_revisions` and `expected_binding_revisions`; unassigned nodes use 0. Creation uses a batch-local `client_ref`. Limits: 100 operations, 100 items including hidden photos.
4. Apply the exact preview payload, digest, publication revision and unique `idempotency_key`. Identical retries return the original operation. Changed payload needs a new preview and key.
5. `pending` is not publication success. Query `lidfly_get_write_operation_status`; after a lost response list recent operations first. `unknown` requires reconciliation. After commit reread the gallery and resolve a representative product, comparing the published block composition hash with desired state.

`enabled:false` hides an item while preserving order and metadata. Reorder lists every item exactly once, including hidden ones. Remove detaches an item, keeping its asset. Move preserves item ID and rejects an asset already in the destination. Archive preserves items and assignments; restore reactivates them. Hidden and archived items protect assets from deletion.

Place `media-gallery` with existing page/block/storefront tools. Direct source: `{source:{kind:"gallery",galleryId:"…"},presentation:"carousel"}`. Product context: `{source:{kind:"product_category_gallery"}}` in `productPage.slots.afterProduct`, before recommendations when present. Grid is also supported. No inline images, videos, autoplay or parent inheritance.

Only the explicit primary category chooses the product gallery. Parents, secondary memberships, breadcrumbs and flat collections never supply a fallback. A category page may have a different direct gallery; assigning product examples does not edit it.

Bitrix mappings keep `UF_GALERY_SECT` (products), `UF_PHOTOGALLERY` (category page) and `PROP[41][]` (service page) separate. Never confirm candidates or create categories automatically. Production import needs an explicitly authorized scope. The local direct-mcp adapter prepares an inventory and tool batches. Repeated import preserves owner edits and removed items.
