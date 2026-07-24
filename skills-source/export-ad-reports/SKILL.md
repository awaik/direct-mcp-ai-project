---
name: export-ad-reports
description: "Выгружать отчёты Яндекс Директа, Метрики, VK Ads и Авито Рекламы через LidFly MCP v3 в подключённые Google Sheets или Google Docs с проверкой таблиц и публичных креативов. Использовать по запросам выгрузить, сохранить, дополнить или обновить статистику в Google-файле."
---

# Export Ad Reports

Use this skill as the handoff between a provider skill, LidFly MCP v3 read calls, and Google connector write actions. Do not write the export to a Workspace unless the user separately asks for that.

## Data Boundary

- Export aggregated statistics, spend, impressions, clicks, conversions, campaign/group/ad IDs, ad copy, and public creative URLs.
- Export a creative image only when its URL is public and does not grant private access.
- Never export OAuth or refresh tokens, API keys, passwords, seller secrets, signed private URLs, authorization headers, cookies, or other credentials.
- Remove secret fields from the payload and report the omission without treating ordinary advertising data as forbidden.

## Workflow

1. Verify that the user explicitly requested a Google export or update. Resolve one exact target file and, for Sheets, the sheet and destination range or append position. If name lookup returns multiple files, list the candidates and request the file ID or URL; do not write while the target is ambiguous.
2. Use the applicable provider skill to resolve scope: `$yandex-direct-campaign-builder`, `$yandex-metrika`, `$vk-ads-campaign-builder`, or `$avito-ads`. Use `get_provider_context` or `resolve_campaign_scope` when that skill requires it. A Google export alone does not require `workspace_project_id`.
3. Find each report tool with `search_tools`, read its schema with `get_tool_schema`, and fetch the report with `call_tool`. Do not use `call_write_tool` merely to read or export a report.
4. Restrict the export payload to the allowed data boundary and preserve the report period, currency, attribution, provider IDs, and aggregation level needed to interpret the numbers.
5. Perform a real write with the connected Google Sheets, Google Docs, or Google Drive connector. External Google-file writes are connector actions, not LidFly MCP writes; never route them through `call_write_tool`.
6. Reread the changed range or document through the Google connector and verify the written values and images. A prepared table, Markdown response, or successful provider read is not a completed export.
7. Report the actual target file, changed sheet/range or document section, row/item count, provider scope identifiers used, verification result, and exact connector error if any. State separately that nothing was written to a Пространство unless a separate Workspace write was requested.

## Google Sheets

- Write explicit headers and data rows, then reread the exact changed range.
- If the connector exposes a native in-cell image or `CellImage` write action, prefer it and verify the resulting image value. The ordinary Google Sheets REST value/batch-update surface usually exposes formulas but not native `CellImage` creation.
- Otherwise insert a public creative with the single-argument formula `=IMAGE("URL")`, using the original public URL from the provider response. Do not upload the creative to Drive for this formula: `IMAGE` does not support URLs hosted at `drive.google.com`.
- Adjust image display size through row height and column width.
- Use a multi-argument formula only when cell sizing cannot meet the request. For a Russian-locale sheet use semicolons, for example `=IMAGE("URL";4;120;120)`.
- Inspect reread values for `#ERROR!`, `#N/A`, `#REF!`, `#VALUE!`, and any other formula error.
- If an image cell returns a syntax error, replace it with the single-argument `=IMAGE("URL")` and reread that cell.
- If readback returns `#REF!`, another external-data access error, or the sheet displays an access banner, leave the `=IMAGE(...)` formula in the target cell. Ask an editor to open the spreadsheet in a desktop browser and click `Allow access` / «Разрешить доступ» once for that spreadsheet. After the user confirms, reread the image cells and continue verification.
- Never replace an intended image with `HYPERLINK`, plain link text, or a link to an uploaded Drive file. A clickable link is not an image in the cell; if access remains unconfirmed, report the exact affected cells as pending instead of claiming a completed export.
- Declare a table successful only after the expected rows are present and the changed range contains no unresolved formula errors.

## Google Docs

- Insert creatives as real inline images with a Google Docs connector action.
- Do not count Markdown such as `![creative](URL)`, a plain URL, or image alt text as an inserted image.
- Reread the document and verify the inline image/object in the document structure or in the connector's authoritative write result. If image insertion cannot be verified, report that limitation and do not claim complete success.

## Connector Failures

- If the connector exposes no write action, say that no write action is available and recommend enabling write access, reconnecting Google OAuth, or checking file permissions as appropriate.
- If OAuth or permission fails, preserve and report the exact connector error and leave the target unchanged; do not silently create another file.
- Do not infer that advertising data or public creatives are prohibited. Once the target is exact and a write action is available, make the real connector call before reporting a policy or connector block.
- Never claim success from a hypothetical call, a local draft, or data displayed only in chat.

## Completion Checks

Treat these as required outcome branches:

- Successful Sheet: write, reread the target range, verify row count and zero formula errors.
- Docs image: insert and verify a real inline image.
- Russian locale: use `;` only for a necessary multi-argument `IMAGE` formula.
- Image syntax error: downgrade to single-argument `IMAGE` and reread.
- External-data access prompt: leave `IMAGE` in place, request one-time «Разрешить доступ», and resume verification after confirmation; never fall back to a link.
- No write actions: recommend write enablement, OAuth reconnect, or permission review.
- OAuth/permission error: return the exact connector error without claiming success.
- Ambiguous target: stop before writing and request the exact file ID or URL.
