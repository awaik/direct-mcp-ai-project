# Frontend page craft for LidFly

Implement the direction through the site's actual publication mode. Managed
pages use native blocks and tools; a static source project uses its existing
components and the static-sites.md publication flow. Do not inject an alternate
HTML application or arbitrary scripts into a managed page.

## Inspect, then compose

Read compact page/section snapshots and follow next_safe_call to the owning
source. Preserve page fields, navigation, inherited header/footer and existing
content outside the task. Knowledge-base and generated Commerce layouts have
their own owners; do not replace their shell with a landing-page scaffold.

Choose blocks for both purpose and behavior. Filter lidfly_list_blocks, inspect
description/purpose/visible_when/action_controls, paginate when has_more, and read
lidfly_get_block_definition for each selected type. The compact catalog is an
index, not a complete design guide. Use only current props and declared parts;
do not guess a CSS class, interaction flag or template capability.

Establish semantic hierarchy before decoration. Ensure one meaningful visible H1:
use page-header for a compact introduction when no profile/generated block
already supplies it. A logo or service-link rail does not introduce the page.
Keep essential text and navigation available on the phone. Use full-size hero
blocks only when their media and message warrant the space.

For repeated items use a consistent component with the density appropriate to
reading or comparison. Avoid turning every short item into an oversized split
panel; check the accumulated page length. Vary composition where the story
changes, not by cycling unrelated card styles. Preserve all supplied information.

## Style through supported controls

Start with the active template, theme tokens and typed block presentation/style
options. Check real heading wraps, text measure, section gaps, card alignment,
image ratios, contrast and loading states. Adapt the layout to content at desktop,
tablet and phone widths; shrinking desktop text alone is not responsive design.

Only use custom CSS when native options cannot achieve the intended result.
Read lidfly_get_css first. Use lidfly_update_page_css for one page and
lidfly_update_site_css for genuinely shared rules, with the returned
expected_custom_css_sha256 and required template-deviation consent. Target stable
data-lf-block/data-lf-block-id and declared data-lf-part anchors. Avoid generated
class names, positional child selectors, broad global selectors and accumulating
contradictory !important overrides. CSS-only work must not replace page blocks.

## Apply and finish

For substantial managed changes prepare lidfly_preview_site_changeset with routes,
assets and acceptance. Show its concrete diff, follow the current write tool's
confirmation contract, then apply the unchanged digest. A focused edit uses its
own block/CSS tool and fresh revision/hash. Serialize writes; reread after asset
or form operations rather than reusing an old revision.

Verify links, whole-card clicks, zoom, tabs and forms according to their declared
behavior, including keyboard focus and touch use. Read visual-qa.md and inspect
the actual result; saved JSON and a successful publication are not visual proof.
