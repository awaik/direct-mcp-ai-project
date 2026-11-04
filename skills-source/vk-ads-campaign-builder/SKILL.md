---
name: vk-ads-campaign-builder
description: "Создавать, аудитить и оптимизировать кампании VK Ads через LidFly MCP v3: connection_id/client_id, группы, объявления, лид-формы, аудитории, статистика и бюджеты. Использовать для работы с VK Рекламой с безопасным scope и write workflow."
---

# VK Ads Campaign Builder

Use for VK Ads campaigns, ad groups, banners, lead forms, statistics, audiences, contextual phrases, budgets, statuses, and creative checks.

## v3 Scope First

1. Search with `search_tools({ provider: "vk", query })`.
2. Read schemas with `get_tool_schema`.
3. If account/client is unclear, call `get_provider_context({ provider: "vk", query? })`.
4. If campaign is named, call `resolve_campaign_scope({ provider: "vk", query, workspace_project_id? })`.
5. Use only returned `connection_id`, `client_id`, `workspace_project_id`, and `scope_arguments`.
6. Read via `call_tool`; write via `call_write_tool`.

## VK Account Rules

- `connection_id` selects VK OAuth connection.
- `client_id` selects agency/manager/client account.
- Manual VK user-filter is allowed only when it appears in provider context; do not pass arbitrary VK user ids.
- In manual user-filter mode, creation/upload/single update may be unavailable; prefer allowed mass actions and reread state.
- For `max_goals` bidding, use `max_price` when updating limits; reread the group after write.

## Write Safety

Before any campaign or ad-group write, read [VK goal mode and write safety](references/goal-mode.md). It is the source of truth for `checked_packages.goal_mode`, `priced_goal`, bootstrap groups and ambiguous outcomes.

The compact legacy provider projection is [methodology](references/methodology.md).

## MAX Messenger

For «реклама в MAX», «канал MAX» or MAX messenger ads, read [MAX placements and API limits](references/max-messenger.md). Distinguish ads inside MAX from a MAX channel promoted in the VK feed.

## Analytics

Before evaluating statistics, CPA, reach, budget distribution, missing impressions or a reach forecast, read [VK Ads analytics](references/analytics.md). Tool descriptions carry no evaluation thresholds; judgment comes from that reference and the client's goals in project memory.

## Phrase Expansion

Offer `search_phrase_vectorization` only when the user wants broader reach from contextual phrases; do not enable it as a default optimization. Explain the audience change before confirmation, use a phrase segment in `targetings.segments`, and reread the field after creation. Manual user-filter does not support this setting. An unconfirmed write must not be repeated. Source: [VK AdGroup API](https://ads.vk.ru/doc/api/object/AdGroup), local documentation checked 2026-09-26; live reads on the own account accepted `fields` but omitted this field, so absence is not proof of `false`.

## Creative And Text

For a lead form or multiple image proportions in one ad, read [Lead forms and image formats](references/lead-forms-and-formats.md).

- Read `banner_requirements` in `vk_prepare_campaign` / `vk_get_package` before requesting assets. Check draft text immediately with `vk_prepare_banner(package_id=..., targetings=...)`, even before group creation or image upload. Missing material keeps `ready=false`; never present that as a completed launch.
- In built-in chat import attached originals with `vk_upload_image(chat_attachment_id=..., role=...)`. The server checks ownership, geometry and the original hash before approval. A connected ChangeSet may bind its `content_id` to `content.<role>.id` and a campaign's `ad_group_id` to the banner in the same exact VK scope.
- `list_media` is the LidFly transit library, not the VK cabinet library; empty results do not disprove the user's assets. `request_upload → curl` is for external MCP clients only. A filename/path without bytes is not an uploaded image.
- For a manual kit, use the checked format limits, identify any missing slots and preserve the chosen texts and budget in existing conversation decisions. Do not return to unavailable import steps.
- Keep the approved copy in a manual kit. Label proposed rewrites as drafts; never add prices, guarantees, service details or delivery promises absent from the client's confirmed brief. Unknown fields stay explicitly unfilled.
- Keep distinct customer offers separate: for example, family and children's formats retain their own conditions. A newer explicit customer decision replaces the older condition for that same offer; it does not silently change another offer. Label audience/cost estimates as hypotheses with inputs, period and uncertainty unless supported by observed statistics.
- After a definitive provider refusal, deliver the useful work already prepared: all text variants, checked format limits, missing assets and exact blocking step. Distinguish supplied text, API readiness and actual creation; missing group IDs or images keep the banner unready. Do not invent IDs, repeat the rejected POST or substitute a package/account. Explain the known failure from its receipt; an unknown provider cause remains unknown. Offer further read-only diagnosis or an actionable manual kit without requiring the client to ask for the existing texts again.
- Validate package/banner pattern before creating banners.
- Avoid unsupported symbols in text; keep copy within VK field limits.
- Upload images/videos only after source asset is final.
- Do not replace complete banner sections unless the schema requires it and current content has been reread.

## Workspace

Save decisions, campaign snapshots, analytics summaries, and follow-up scheduled tasks only after resolving `workspace_project_id`.

## Google Export

When the user asks to export a VK Ads report to Google Sheets or Google Docs, keep this skill for account/campaign scope and report reads, then hand the verified Google write and reread to `$export-ad-reports`.

The export handoff applies only when this host exposes the skill and a Google write connector. If either is unavailable, state the exact missing capability and return the requested report as a draft; do not claim a saved Google file or silently switch to Workspace.
