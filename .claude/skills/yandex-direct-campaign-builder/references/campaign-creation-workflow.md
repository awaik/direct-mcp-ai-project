# Campaign Creation

## Default Modern Build

Use modern managed campaigns by default:

```text
add_unified_campaign
-> add_adgroup with adgroup_type: UNIFIED_AD_GROUP
-> add_keywords_batch
-> add_responsive_ad
-> manage_ads action: moderate only after explicit confirmation
```

`add_adgroups` creates multiple legacy `TEXT_AD_GROUP` groups and must not be used for `UNIFIED_AD_GROUP`. Legacy `add_campaign`, `add_adgroups`, `add_ad`, and `add_ads` are compatibility-only for old text scenarios. If used, say clearly that it is a legacy TEXT_AD path and reread actual ad `Type` after creation.

## Targeting, Ads And Addons In One Package

- Autotargeting categories and brand options may be passed in `add_keywords_batch`/`add_keywords`: groups created through the API already contain `---autotargeting`, so the tool applies the settings with a separate update and confirms them by reading. If the result reports a mismatch or an unconfirmed state, do not repeat the add; read `get_autotargeting` and fix it with `update_autotargeting`.
- Regions: check `region_ids` against the agreed geography. The approval card names each region; «Санкт-Петербург и Ленинградская область» is a different ID from «Санкт-Петербург».
- Responsive ad: use enough distinct relevant titles and texts within the allowed limits; the maximum count is not a quality criterion by itself.
- Sitelinks and callouts are separate agreed actions of the package or explicitly not included. The card states their presence; do not promise them in the text if the package does not contain them.
- Negative keywords with city names under a narrow geography are a methodology decision: explain whether they are redundant before adding them.
