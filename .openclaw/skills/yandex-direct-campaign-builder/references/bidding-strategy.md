# Bidding Strategy And Learning

## Strategy Learning

- For one named campaign pass its exact `campaign_ids` to `get_strategy_learning_status`.
- Without manual `goals`, the tool derives targets from `BiddingStrategy` and `PriorityGoals`. `GoalId=13` is the Direct sentinel “all priority goals”; it never means that 13 goals are configured. Count the actual `PriorityGoals` items instead.
- Treat the result as a Reports API estimate, not the native learning status: the public Direct API does not expose the status shown in the UI. If the tool and the Direct panel disagree, trust the Direct panel and explain the limitation.
- Never turn `status not determined` into “learning is normal”. Multi-goal sums, package strategies, engaged sessions (`GoalId=12`), incomplete goals, and unavailable reports may be intentionally indeterminate.
- Manual `goals` overrides the automatically derived targets for the calculation and may not match the campaign strategy; say so explicitly.
