# Yandex Audience segments in Direct

Sources checked 2026-09-28: Direct course «Директ. Продвинутый», module 4 (yard.yandex.ru/courses/direct-prodvinutyy, lessons 20, 23, 24, 27, 28); Direct help `impression-criteria/retargeting-lists`, `technologies-and-services/audience-segments-in-direct`, `troubleshooting/audience-in-direct`; API https://yandex.ru/dev/audience/ru/. Tool results are the source of truth for IDs, statuses and limits.

## Choose the segment

- Own customers (CRM, orders, loyalty): file segment → `audience_request_file_upload`, `curl -T`, `audience_create_segment_from_file` with `dry_run=true`, show the report, then `dry_run=false` after the user confirms. Split the base by average check or solvency and give each part its own ads (lesson 20).
- New customers like existing buyers: `audience_create_lookalike` from a ready segment of buyers or from a Metrika goal segment (`audience_create_metrika_segment`). Direct API has no «similar users» switch, so Look-alike goes through Audience only.
- Offline business near a place: `audience_create_geo_segment` (`home`, `work`, `regular`, `last`, `condition`). Points must be inside the campaign region, otherwise there are no impressions.
- Site visitors and goals already exist in Metrika: use the Metrika goal in `add_retargeting_list` directly; an Audience segment is needed only for Look-alike or sharing.

## Put it into Direct

1. `audience_get_segments`: wait for status «готов» (`usable_in_direct=true`). Processing takes hours; do not judge performance or report failure before that.
2. `add_retargeting_list` with `type=RETARGETING` and `goal_id=direct_goal_id` for ЕПК and text-image groups. `AUDIENCE` type with Metrika/Audience segments binds only to media (CPM) groups.
3. `add_audience_targets` for targeting or a retargeting bid adjustment for weighting.
4. The segment must be on the same Yandex login as the campaign. For another login (agency client) call `audience_grant_segment_access` first.

## How targeting behaves

- Search: audience conditions work with keywords/autotargeting through AND — they narrow reach; several segments combine through OR.
- Networks: audience conditions combine with other conditions through OR — they expand reach.
- Excluding current customers from targeting is impossible: a condition made only of `NONE` rules works only in bid adjustments.
- Ads on sensitive topics (some medicine, adult dating) are not shown by audience segments in networks.
- Too narrow combinations of segments give no impressions; relax the rules before blaming the segment.
- Look-alike placement (lesson 27): in the same group with retargeting when the audience is the same and reach matters; in a separate group to control bids; in a separate campaign to measure new-customer acquisition separately.

## Bid adjustments (lesson 28)

- Adjustments of different categories multiply; within one category the largest wins; −100 % has the lowest priority; a group-level adjustment overrides the same category at campaign level.
- In conversion strategies an adjustment changes the target CPA/ДРР, not the bid.

## Privacy

Files contain customers' personal data. LidFly normalizes phones/e-mails, hashes them with SHA-256, sends only hashes and deletes the file after upload. Remind the user that consent of the customers is required; never paste raw contacts into chat or tool arguments — only the uploaded file.

## Reuse a saved Metrika segment

Resolve Metrika counter/connection independently from the Direct client/campaign. For a known ID read `metrika_get_segment`; otherwise use `metrika_get_segments` and `metrika_find_segments`, then read the selected ID. Verify expression, source and ambiguity; a name alone does not establish the intended audience. Do not create a new segment because an API-only or partial list was empty. Do not compare an expression with `expression_complete=false`.

Read `get_retargeting_lists` and `get_bid_modifiers` first. Reuse a matching condition with verified Rules/ExternalId, Type, IsAvailable and Scope. If necessary, create the **Direct condition**, using the confirmed safe `goal_id`, through the normal confirmed write. Warning 10164 with an ID means an existing condition was reused; its name/description were not changed. A duplicate error becomes success only after the tool verifies a unique existing condition. Other errors and ambiguous readback remain failures; do not retry blindly.

For −100% use modifier=0. Reuse an existing modifier instead of duplicating it, and read back the condition/campaign/group IDs, Enabled, Accessible and coefficient. A Metrika `is_retargeting=0` flag alone does not prove that the segment cannot be used. Never claim improved performance from the exclusion without subsequent evidence.

Sources checked 2026-10-02: [segment GET](https://yandex.ru/dev/metrika/ru/management/openapi/segment/getSegment), [RetargetingLists.add](https://yandex.ru/dev/direct/doc/ru/retargetinglists/add), [condition types](https://yandex.ru/dev/direct/doc/ru/objects/retargeting-list). Discovery limitations are delivered by the shared tool catalog.
