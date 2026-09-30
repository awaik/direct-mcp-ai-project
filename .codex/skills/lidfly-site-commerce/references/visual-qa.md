# Visual quality review for LidFly

Judge the rendered page against its brief and references. Server acceptance,
HTML validity and publication success do not establish visual quality.

## Collect evidence for the exact result

After a managed write, reread snapshots and publication_revision. Call
lidfly_inspect_site_visual for the exact revision and promised managed routes
(at most 10 per request). Poll the returned job through
lidfly_get_visual_inspection; do not start another job just because it is
pending. Desktop 1440×900 and mobile 390×844 checks cover technical defects and
produce screenshots. Follow the current tool schema and returned artifact links.

Inspect the actual screenshots, including lower sections, not only their URLs
or the JSON status. Compare with the declared direction and any reference images.
reference_comparison.status=pending_model_comparison is unfinished comparison.
Even a completed job with technical pass/warning or accepted postconditions
does not prove that typography, composition and image crops are satisfactory.

Use an available browser for interactive states and a tablet/intermediate width
when the layout warrants it. For static sites use the actual preview/published
page and the client's browser facilities; do not promise that managed inspection
accepts static routes. If image viewing or browser interaction is unavailable,
report exactly which visual/behavioral checks remain unverified.

## Review the whole page

- Opening: clear page identity, meaningful H1, useful first-screen content and
  visible navigation. Flag an almost empty homepage with only a link rail.
- Hierarchy: readable type and real line breaks, clear headings, text measure,
  contrast, alignment, spacing rhythm and coherent section transitions.
- Density: proportional media and gaps; no endless sequence of mostly empty
  tall cards on a phone. Preserve content while fixing its arrangement.
- Assets: relevant and consistent images, deliberate crops, no broken media,
  no stretched subjects, readable overlays and stable space while loading.
- Responsive behavior: no horizontal overflow, clipping, overlapping controls,
  inaccessible tab content or accidental loss of essential information.
- Interactions: menus, links/anchors, whole-card navigation, intended zoom,
  tabs, forms, visible focus and Tab/Enter. A screenshot cannot verify clicks.

Do not submit a real lead/order or payment just to check a visual change.
Use an authorized test procedure if delivery must be proved; distinguish opening
a form from successful delivery. Inspect hidden/lazy media after revealing it
before labelling it broken.

## Refine and report

Make a short list of defects tied to route, viewport and visible evidence.
Fix material problems within the authorized scope, then inspect the changed
revision again. Recheck affected interactions; do not reuse an earlier pass.
Preserve deliberate owner choices such as a hidden footer and report their
effect instead of restoring them unasked.

Report applied/published state separately from visual review and interaction
coverage. Disclose every tool warning, deliberate deviation and remaining
limitation. Say the site is ready only when the promised scope and necessary
checks are complete. Do not infer real-user performance or conversion gains
from one screenshot or a laboratory check.
