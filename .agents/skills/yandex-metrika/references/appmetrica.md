# AppMetrica: mobile app analytics

Sources checked 2026-09-29: AppMetrica API https://appmetrica.yandex.ru/docs/ru/mobile-api/ (reports, management, quotas) and live requests to the public demo application 1111. Tool results are the source of truth for IDs, names and numbers.

## Scope

- AppMetrica uses the same LidFly connection as Yandex Audience («Аудитории и AppMetrica»): pass `audience_connection_id` only when several logins are connected. It is not the Direct `connection_id` and has no `client_login`.
- Start with `appmetrica_get_applications`; every report needs `application_id`. An empty list means the connected login has no access: the app owner must grant access in AppMetrica or the user connects another login.
- The connection belongs to the account, not to a Проект: confirm the application with the user before analysing it for a specific client.

## Read workflow

1. `appmetrica_get_app_overview` for the period — active users, new users, installs, installs by tracking partner, top events.
2. `appmetrica_get_report` / `appmetrica_get_report_by_time` for details; `appmetrica_get_events` for exact event names before filtering by an event.
3. Name the period and say that it is counted in the application time zone.

## Reading the numbers

- Installs (`ym:i:*`) are new devices; active users (`ym:ge:users`) are everyone who opened the app. Do not compare installs with users as if they were one metric.
- Tracking partner `Yandex.Direct` (id 43 in `ym:ts:publisher` / `ym:i:publisher`) is Yandex Direct; id 0 is organic. `ym:ts:campaign` is the tracker. Installs from Direct in AppMetrica are the measurement for mobile app campaigns; Direct clicks alone are not installs.
- One report uses one namespace (`ym:ge`, `ym:i`, `ym:ts`, `ym:ce2`, `ym:s`, `ym:u`…). Another namespace is allowed only in `filters`. Split a question into several reports instead of retrying a mixed one: provider errors consume the daily quota (5 000 requests per login).
- Device identifiers (`device`, `googleAID`, `iosIFA`) are personal data and are not exported. To reach app users with ads, build an Audience segment instead.
- Last hours of today are incomplete; for conclusions use closed days and equal periods.

## From app users to Direct

1. `audience_create_appmetrica_segment` with `object_type=application` (all users of the app) or `segment` (a saved AppMetrica segment; its ID comes from the AppMetrica interface).
2. Wait until `audience_get_segments` shows «готов» (`usable_in_direct=true`).
3. `add_retargeting_list` with `type=RETARGETING` and `goal_id=direct_goal_id`, then `add_audience_targets` or a bid adjustment — see the Direct campaign builder reference «audiences».
4. For new users similar to the app audience use `audience_create_lookalike` from that segment.
