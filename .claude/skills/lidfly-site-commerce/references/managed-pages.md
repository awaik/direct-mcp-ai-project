# Managed Pages

## Выбор блока по поведению

Сначала сформулируй наблюдаемое взаимодействие: переход всей карточкой, увеличение
изображения, отдельная CTA или форма. Для точечной правки прочитай snapshot секции;
blueprint нужен для композиции страницы. Сравни кандидатов через фильтрованный
lidfly_list_blocks: description, purpose и visible_when, затем прочитай definition.
Если has_more=true, сузь поиск или продолжи с offset + matches.length. Не считай
неполную выдачу отсутствием подходящего блока. Если подходящего поведения нет,
сообщи ограничение; не заменяй кликабельную карточку отдельной кнопкой.

После записи прочитай предупреждения и проверь фото, заголовок, целевой anchor,
отсутствие нежелательного zoom, Tab/Enter и доступное имя ссылки на desktop/mobile.
Скриншот не доказывает взаимодействие. Revision/CAS и acceptance workflow обязательны.

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
3. Call `lidfly_update_page` through `call_write_tool` only with a complete replacement payload from the same page read: the same exact `slug`; all blocks; the saved `title`, `description`, `og_image`, `theme_preset`, `theme`, `page_kind`, `inherit_site_design`, and `auto_structured_data`, except fields the user explicitly changes; plus the latest `expected_publication_revision` required by the tool schema. Missing blocks are deletions, and omitted optional page fields can reset or default. Omit `custom_css`: existing CSS is preserved when omitted. CSS changes use `lidfly_get_css` and dedicated page/site CSS tools with their own hash checks, not a page replacement.
4. Call `lidfly_get_page` again and reread the page. Open Graph, Twitter Cards, canonical, WebPage JSON-LD, and managed HTML are generated automatically from the source fields.

For one block-only change, prefer `lidfly_update_block`; do not replace the whole page. A static site must be changed in its source project and republished through the supported full static-deployment flow.

### VideoObject

1. Call `lidfly_list_blocks` and inspect the `video-embed` source contract.
2. Call `lidfly_get_page`, then `lidfly_get_block` for the exact video block.
3. Call `lidfly_update_block` with all current `video-embed` props and the intended embed/preview/date/duration values. LidFly derives VideoObject fields such as `thumbnailUrl`, `uploadDate`, and `duration`; do not edit the generated VideoObject directly.
4. Reread the block and page after the write.


## Общая модальная форма из существующей CTA

1. Определи точный сайт, publication_mode, права и текущую publication_revision. Статическая HTML/ZIP-публикация не получает managed overlays.
2. Прочитай страницу, целевой блок и lidfly_get_block_definition. action_controls в compact/full и текстовом ответе задаёт text_path, url_path, action_path, режимы, условия отображения и CSS-якорь. Поиск buttonAction, site_form_modal и «модальная форма» включает вложенные CTA.
3. Прочитай lidfly_list_site_forms, выбери существующую форму по назначению; не выдумывай formRef. Управление формами требует owner/admin, право page-write не даёт этого доступа.
4. Создание формы или загрузка изображения меняет ревизию: перечитай её перед следующей записью. В форме необязательны image и imageAlt; /assets/... относится к корню сайта, информативному изображению предложи содержательный alt. Пустой alt подходит декоративному изображению.
5. Проверь реальный fallbackUrl: #zapis допустим только при существующем целевом элементе. Действие — {mode:"link",url:"/contacts/"} либо {mode:"site_form_modal",formRef:"<из чтения>",fallbackUrl:"/contacts/"}. Оно приоритетнее старого URL. В catalog slots URL и fallback остаются внутренними.
6. Используй минимальный lidfly_patch_block. Объект действия передаётся целиком; null удаляет верхний prop. Для вложенных массивов передавай полный изменённый массив с сохранением остальных элементов. При showForm=true у cta-banner CTA заменена inline-формой: конфликтующее действие отклоняется.
7. lidfly_manage_site_forms update заменяет весь props: сохрани остальные поля, согласия и successText из последнего чтения. feature-split имеет secondaryButtonText/secondaryButtonUrl/secondaryButtonAction; пустой текст скрывает вторую кнопку, непустой требует URL или действия, первая кнопка необязательна.
8. Проверь результат публикации; при pending/unknown читай статус по operation_id, не повторяй запись вслепую. После ошибки перечитай фактическое состояние и ревизию.
9. Перечитай блок и опубликованную страницу. Открытие окна и успешную доставку заявки проверяй раздельно. Формы работают с inheritSiteDesign:false: подключаются только используемые формы, тема и chrome не наследуются. Повторные CTA не дублируют overlay; обновление общей формы пересобирает и использующие её standalone-страницы.

modal-form — самостоятельный блок со своей кнопкой и локальной формой. Для уже существующей CTA используй site_form_modal и общую форму; buttonId не является способом их связать. Произвольные HTML/JS-модалки не поддерживаются этим контрактом.
