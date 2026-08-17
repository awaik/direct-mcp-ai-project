# VK Goal Mode And Write Safety

## Write Safety

- Read current campaign/group/banner first.
- Show plan, budget impact, and fields to change.
- Wait for explicit confirmation.
- Use `call_write_tool`.
- Reread state and report before/after.
- For agency/team Пространства include exact `workspace_project_id`.
- For a new campaign, call `vk_prepare_campaign`, then pass exactly one bootstrap ad group to `vk_create_campaign`. Do not include nested `banners`.
- Always read `checked_packages.goal_mode` from preflight before using `priced_goal`: `required` needs a valid named goal, `forbidden` rejects it, and `unsupported` stops before POST.
- For `goal_mode=required`, get the goal from `vk_get_goals` / `vk_get_counter_goals`: a counter goal uses `priced_goal.name=condition:substr` and the counter ID as `source_id`. For VK Mini Apps with `priced_event_type=43`, use `vk_get_inapp_events`, `name=event.name`, and `source_id=tracker.id`.
- Do not require a goal merely because the objective is `site_conversions`, and do not treat `options.settings.priced_goal`, the package name, or package 3509 (`priced_event_type=0`) as proof of goal compatibility.
- Do not remove an incompatible goal without user agreement. Offer the explicit alternatives: keep CPC/CPM without a named goal, or choose a compatible goal/oCPM package.
- Treat `package_priced_goal_forbidden`, `package_priced_goal_required`, and `package_goal_policy_unsupported` as no-side-effect preflight failures. Treat `provider_goal_package_mismatch` / `inconsistent_priced_goal` as a ban on retrying the same payload.
- Treat the created campaign and bootstrap group as `blocked`. Create remaining groups and banners with separate write tools, reread every object, and activate only as a final separate action.
- If the result contains `outcome=unknown` or `outcome=ambiguous`, call top-level `get_write_operation_status({ operation_id })`. Keep the same campaign name and never send another create.
- If status remains unresolved, offer a safe support draft containing the `operation_id`, never the raw payload or credentials.
