# VK Ads Analytics

Use after the VK scope is resolved. Statistics results already state the executed period, attribution, conversion type, pagination and substituted scope; read that header before drawing conclusions.

## Reading Statistics

- `period=summary` is lifetime delivery and does not accept dates. For a date range use `period=day`: each object's period total comes before its day rows. Take period figures from the total line; never sum CTR, CPC, CPM or cumulative reach across days.
- `uniques.total` is cumulative reach from campaign start, `increment` is growth within the row's range, `frequency` is daily frequency. After a delivery pause longer than 90 days unique metrics are not reliable.
- V3 (`sort_by`, `limit`, `offset`, `fields`) returns period totals per object without days. `count` is the total number of matching objects (live check 2026-09-27); continue with `offset`.
- A zero, a missing metric, an empty response and unavailable detail (delegated `_user_id` cabinet) are different states. Do not report a missing field as zero or an empty response as "no delivery".

Source: [Statistics API](https://ads.vk.com/doc/api/info/Statistics), checked 2026-09-27.

## Comparing Results

- Compare CPA only for the same goal or event with the same `attribution` and `conversion_type`. A cheap intermediate event (page view, add to cart) does not replace a purchase or a qualified lead; changing the optimization goal is a separate decision agreed with the user.
- One high CPA does not identify its cause. State the observation, list hypotheses (audience, creative, landing page, bid or budget, tracking) and request the data that separates them: goal statistics for the same objects and period, banner-level statistics, the video or community report.
- `value` in goal and in-app statistics is the configured event value, not revenue; ROMI and ad cost share derive from it. A payback conclusion needs the client's actual revenue and costs from project memory, not a universal ROMI threshold.
- CPJ, Join Rate, video drop-off and CPV are compared between comparable objects of the same account; do not apply fixed thresholds.

## No Impressions

Diagnose before changing anything: moderation and statuses of the campaign, groups and banners, schedule and dates, balance (bonuses alone may not pay for delivery), bid cap for the "max price" strategy, budget size against audience size, audience width, placements and ad formats. Then check the last hour with `vk_get_realtime_stats`. `status=active` alone does not prove delivery. Do not raise the budget or widen targeting before the cause is established.

Source: [VK help — why a campaign is not delivering](https://ads.vk.ru/help/faq/no_impressions), web UI help, local copy checked 2026-09-27.

## Budget Level

Budget optimization distributes spend between groups when it is set on the campaign and between banners when it is set on the group; results are evaluated at the level where the budget is optimized. A group's small spend under a campaign-level budget does not prove it is ineffective. In the API the campaign budget is `budget_limit`/`budget_limit_day` on the campaign; `autobidding_mode=max_goals` requires it. Any budget, goal or targeting change is a write: show the plan, get confirmation, reread.

Sources: [VK help — budget optimization](https://ads.vk.ru/help/features/optimization) (web UI), [AdPlan](https://ads.vk.com/doc/api/object/AdPlan), checked 2026-09-27.

## Reach Forecast

In `vk_get_projection` `campaign_id` is the ad group ID; only the passed `targetings` are used, not the group's saved targetings. The recommended effective bid is VK's definition (at least 75 % of the audience), not an optimal budget or a CPA guarantee. A forecast is not a result.

Source: [ProjectionPrediction](https://ads.vk.com/doc/api/resource/ProjectionPrediction), live check 2026-09-27.
