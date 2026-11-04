# Visual quality review for LidFly

Judge rendered pages against the brief and references. Publication, valid HTML,
accepted postconditions and technical pass/warning are not aesthetic approval.

## Evidence and focused corrections

After a managed write, reread snapshots and publication_revision. Inspect that
revision with `lidfly_inspect_site_visual` (at most 10 promised routes); poll its
job via `lidfly_get_visual_inspection`, without starting duplicate pending jobs.
Desktop 1440×900 and mobile 390×844 produce screenshots and technical findings.

Read `design_metrics`: metric, threshold, block_index from `lidfly_get_page` and
props-level hint. Resolve composition warnings from writes/changesets before
judging screenshots. Preview URLs need the owner's session; image-capable clients
use `include_images=true` and `image_route` to receive one route's desktop/mobile
first screens and whole-page overview. View actual images, including lower
sections, against the brief/references. URLs or JSON status alone are insufficient;
`reference_comparison.status=pending_model_comparison` remains unfinished.

For a text/block correction preserve neighbors, direction and identities; inspect
the changed area with `routes=[route]` and the returned `image_block_index` for
both viewport crops. No new blueprint, reference composition or full inventory
is needed. Add tablet/intermediate width for a wide table/grid or layout risk.
For `commerce_taxonomy`: `lidfly_get_catalog_node_page` →
`lidfly_update_catalog_node_page` with `slotOperations.update_block` →
`lidfly_preview_catalog_publish(detail_level="summary")` → `lidfly_publish_store`
→ inspect. On `route_html_missing` or `publication_revision_changed`, follow
`next_safe_call`, refresh scope/revision and resolve the cause before retrying.
Never repeat an identical structurally invalid request.

For static sites inspect the actual preview/published page in a browser; managed
inspection need not accept static routes. State unavailable image/interaction
checks explicitly. Source: LidFly tool contracts, verified 02.11.2026.

## Creation/redesign checklist

- Opening: identity/H1, useful first screen/navigation; flag a link-rail-only home.
- Hierarchy: readable type/breaks/headings/measure, contrast, alignment, rhythm,
  coherent section transitions.
- Density: proportional media/gaps, no empty tall mobile cards; preserve content.
- Assets: relevant consistent imagery/crops, readable overlays, stable loading;
  reveal hidden/lazy media before judging it broken.
- Responsive: no overflow/clipping/overlap, inaccessible tabs or missing essentials.
- Interaction: menus, anchors/links, whole-card navigation, intended zoom, tabs,
  forms, focus, Tab/Enter. Screenshots prove neither clicks nor form delivery.

No real leads/orders/payments without authorization. List defects by
route/viewport/evidence; fix within scope, recheck revision/interactions.
Preserve deliberate owner choices (including hidden footers). Report publication
separately from visual/interaction coverage, disclosing all warnings, deviations
and limitations. Readiness requires promised scope/checks. Screenshots/lab tests
prove neither conversion gains nor real-user performance.
