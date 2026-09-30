# Bidding Strategy And Learning

## Maximum Clicks: UI and API

- In the Direct web interface, "Максимум кликов" asks the user to choose the primary limit: budget or average CPC. Do not tell a user in budget mode to set an average-CPC limit in that same mode. Source: https://yandex.ru/support/direct/ru/strategies/average-cpc, checked 2026-09-26.
- In the Direct API for unified campaigns, `WB_MAXIMUM_CLICKS` requires `WeeklySpendLimit` and may also carry `BidCeiling`; `AVERAGE_CPC` is a separate strategy with required `AverageCpc` and optional weekly spend. Explain these API and UI controls separately. Source: https://yandex.ru/dev/direct/doc/ru/campaigns/add-unified-campaign, checked 2026-09-26.
- A maximum bid ceiling can reduce delivery and is not the same as a guaranteed charged CPC. Read recent clicks, cost and conversion goals before recommending a number. The tool rejects `average_cpc` with `WB_MAXIMUM_CLICKS` and `bid_ceiling` with `AVERAGE_CPC` before the provider write.

## Strategy Learning

- For one named campaign pass its exact `campaign_ids` to `get_strategy_learning_status`.
- Without manual `goals`, the tool derives targets from `BiddingStrategy` and `PriorityGoals`. `GoalId=13` is the Direct sentinel “all priority goals”; it never means that 13 goals are configured. Count the actual `PriorityGoals` items instead.
- Treat the result as a Reports API estimate, not the native learning status: the public Direct API does not expose the status shown in the UI. If the tool and the Direct panel disagree, trust the Direct panel and explain the limitation.
- Never turn `status not determined` into “learning is normal”. Multi-goal sums, package strategies, engaged sessions (`GoalId=12`), incomplete goals, and unavailable reports may be intentionally indeterminate.
- Manual `goals` overrides the automatically derived targets for the calculation and may not match the campaign strategy; say so explicitly.
