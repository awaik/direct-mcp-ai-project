# Campaign Creation

## Default Modern Build

Use modern managed campaigns by default:

```text
add_unified_campaign
-> add_adgroup with unified_offer_retargeting: false (or the source campaign's approved true value)
-> add_keywords_batch
-> add_responsive_ad
-> manage_ads action: moderate only after explicit confirmation
```

`add_adgroups` creates multiple legacy `TEXT_AD_GROUP` groups and must not be used for `UNIFIED_AD_GROUP`. Legacy `add_campaign`, `add_adgroups`, `add_ad`, and `add_ads` are compatibility-only for old text scenarios. If used, say clearly that it is a legacy TEXT_AD path and reread actual ad `Type` after creation.

The current `add_adgroup` schema has no `adgroup_type` argument. An explicit `unified_offer_retargeting` boolean, including `false`, creates the `UnifiedAdGroup` block; copy the source group's `UnifiedAdGroup.OfferRetargeting` value. Use the actual tool schema if an older description mentions `adgroup_type`. API reference: https://yandex.ru/dev/direct/doc/ru/adgroups/add (checked 2026-10-26).

## Copy an existing campaign

Read the source campaign, all groups, keywords and ads with pagination and the fields for their actual subtypes. Preserve the user's placement, geography, budget, strategy, goals, exclusions and tracking decisions; do not assume compact default reads contain the complete setup. Check reusable images, feeds, sitelinks and extensions before promising them in the copy. List API-inaccessible settings and any remaining gaps explicitly.

In the built-in chat, prepare one dependency graph: campaign → groups → keywords and ads. Bind the new campaign ID to each new group, and each new group ID to its own keyword/ad nodes. For `add_keywords_batch` and `add_ads`, the `adgroup_id` binding fills every `groups[]` or `ads[]` item of that node: use a separate node per new group and omit IDs of the source group. Choose `add_responsive_ad`, `add_ad` or `add_ads` from the actual supported ad subtype, not from a guessed universal clone format. A partial graph is a partial copy, never a completed campaign.

A field supplied by a binding must be absent from `arguments`, even if the provider schema normally requires it. Do not include the source `campaign_id`/`adgroup_id`, a placeholder, `0` or `null` alongside its binding. The server supplies the new ID only after the parent creation succeeds. Keep the verified connection/client scope unchanged.

Default result: a draft copy awaiting the canonical approval. Include `manage_ads: moderate` only if the user requested moderation; bind its `ids` to the created ad outputs. In external MCP clients, execute the same dependency sequence using IDs from verified creation results; `prepare_changeset` is an internal chat tool. Read back the new objects after application. Do not claim to transfer IDs, statistics, learning history or moderation results. If both campaigns should run in parallel, do not add stop, archive or update actions for the source campaign. Do not retry creation if the ledger already contains a successfully created object.

## Targeting, Ads And Addons In One Package

- Autotargeting categories and brand options may be passed in `add_keywords_batch`/`add_keywords`: groups created through the API already contain `---autotargeting`, so the tool applies the settings with a separate update and confirms them by reading. If the result reports a mismatch or an unconfirmed state, do not repeat the add; read `get_autotargeting` and fix it with `update_autotargeting`.
- Regions: check `region_ids` against the agreed geography. The approval card names each region; «Санкт-Петербург и Ленинградская область» is a different ID from «Санкт-Петербург».
- Responsive ad: use enough distinct relevant titles and texts within the allowed limits; the maximum count is not a quality criterion by itself.
- Sitelinks and callouts are separate agreed actions of the package or explicitly not included. The card states their presence; do not promise them in the text if the package does not contain them.
- Negative keywords with city names under a narrow geography are a methodology decision: explain whether they are redundant before adding them.

## Continue the accepted build

Use retained research, explicit decisions and the execution ledger to identify the unfinished part of the accepted task. A short “continue” does not restart demand research. Prepare all available dependent actions together, and name the concrete missing input or the part assigned to the client. Keep the created campaign/group/ad IDs and distinguish prepared, accepted and read-back-verified results. Moderation and launch still require their own explicit authorization.

Frequency checks of a few masks do not constitute a finished core: show measured mask → checked returned phrases → groups → exact group keywords. Fill coverage gaps without remeasuring unchanged sources merely to advance to the next stage.

## Name the completion stage

Before preparing a build, name its agreed result: draft ads, submission for moderation, or a separately authorized launch. With an unspecified «создай рекламу», prepare drafts and state that moderation remains; do not silently include activation. A request that explicitly includes moderation can be one graph through `manage_ads(action=moderate)`, with IDs bound to the created ads.

Use `lifecycle_stage=draft_not_moderated` as a historical ledger hint for the remaining step, not proof of current API state. Before recommending that the client wait for statistics, read delivery readiness for these exact ads. Creation, submission, approval, enabled delivery and commercial results are distinct outcomes. Do not repeat successful creation to finish the next stage. Historical `write:*` / `write-package:*` receipts establish only their dated recorded checks; an omitted or old receipt is not proof that a write never happened. Methodology updated 2026-10-27 after the HVG chat review; API states: https://yandex.ru/dev/direct/doc/ru/objects/ad#status.
