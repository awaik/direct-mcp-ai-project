# Managed Pages

### Native Floating Video Widget

When the user asks for a site-wide floating, popup, scroll-triggered, or picture-in-picture-style video on a managed LidFly site, use the native site setting. Do not refuse the task merely because arbitrary JavaScript is unavailable, and do not emulate the behavior with page custom CSS, an iframe, a third-party widget, or duplicated `video` blocks.

1. Find `lidfly_get_floating_video_widget` and `lidfly_update_floating_video_widget`, then read both schemas.
2. Call the get tool through `call_tool` and keep its exact `updated_at` and `publication_revision`.
3. If the source is not already a managed asset, upload an MP4/WebM through `lidfly_upload_file` using `call_write_tool`; use the returned `canonical_path`. A lightweight vertical MP4 with H.264/AAC, 9:16, 720×1280, and roughly 2–5 MiB is recommended. Upload an optional JPG/PNG/WebP poster the same way.
4. Because the upload consumes a publication revision, reread `lidfly_get_floating_video_widget` after uploading and use its fresh CAS values.
5. Call `lidfly_update_floating_video_widget` through `call_write_tool` with the exact `subdomain`, fresh `expected_updated_at`, fresh `expected_publication_revision`, and a sparse `widget` patch. Reread afterward and report `ready`, asset validation, thresholds, and sizes.

The platform publishes one site-level widget across all managed routes. It emits `<video preload="none">` without `src` or `<source>` until the scroll threshold, assigns the managed asset to that same element once, uses muted looping preview and click-initiated unmuted playback of the same file, and sends `video_widget_show`, `video_widget_open`, `video_widget_close`, and `video_widget_complete` to the site's configured Yandex Metrika counter. Set `close_persistence="session"` when a full close should last until the tab/session ends, or `close_persistence="page"` when the widget must become available again after reload; requests that explicitly mention F5 or the next page load require `page`. Use `enabled=false` to disable while preserving geometry/assets; use `reset=true` only to remove the site-level setting completely. Static deployments must be changed in their source project and republished.

### Page Open Graph And Twitter Cards

1. Call `lidfly_get_page` with the exact `subdomain` and `slug`. Stop if the page is a static artifact, generated Commerce route, unknown publication, or otherwise not editable through managed page tools.
2. For every saved block index returned by the page read, call `lidfly_get_block` and reconstruct all blocks with their complete `type`, `id`, and `props`.
3. Call `lidfly_update_page` through `call_write_tool` only with a complete replacement payload from the same page read: the same exact `slug`; all blocks; the saved `title`, `description`, `og_image`, `theme_preset`, `theme`, `custom_css`, `page_kind`, `inherit_site_design`, and `auto_structured_data`, except fields the user explicitly changes; plus the latest `expected_publication_revision` required by the tool schema. Missing blocks are deletions, and omitted optional page fields are reset or defaulted.
4. Call `lidfly_get_page` again and reread the page. Open Graph, Twitter Cards, canonical, WebPage JSON-LD, and managed HTML are generated automatically from the source fields.

For one block-only change, prefer `lidfly_update_block`; do not replace the whole page. A static site must be changed in its source project and republished through the supported full static-deployment flow.

### VideoObject

1. Call `lidfly_list_blocks` and inspect the `video-embed` source contract.
2. Call `lidfly_get_page`, then `lidfly_get_block` for the exact video block.
3. Call `lidfly_update_block` with all current `video-embed` props and the intended embed/preview/date/duration values. LidFly derives VideoObject fields such as `thumbnailUrl`, `uploadDate`, and `duration`; do not edit the generated VideoObject directly.
4. Reread the block and page after the write.
