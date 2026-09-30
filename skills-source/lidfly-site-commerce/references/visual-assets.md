# Visual assets for LidFly

Use when imagery contributes to the page's purpose. An intentionally text-led
page does not require decorative media or a paid generation call.

## Plan a coherent set

Inventory existing approved assets first. For each needed image record its role,
subject, target route/block, aspect ratio, focal point, color treatment, alt text
and mobile crop. Mark whether an input is a visual reference only or must be
imported and placed. Never claim a reference was placed when it only informed
the composition.

Match the image to the content: a portrait establishes identity; a product photo
shows the product; an instructional illustration must clearly explain the step.
Use consistent lighting, framing and scale across a repeated set. Do not fill
missing slots with unrelated stock imagery or fabricate customer evidence.
Do not assume a reference site's artwork can be reused; establish source rights.

## Produce and inspect

Use available approved tools and sources. For paid generation follow SKILL.md:
show the prompt, format and crop and obtain the required explicit confirmation.
If generation is unavailable or declined, reuse suitable existing assets or
choose a coherent text-led composition. Do not silently switch services.

Inspect the actual image at its intended placement size before accepting it.
Check content accuracy, consistency across the set, sharpness, aspect ratio and
whether the phone crop cuts off the subject. Revise a poor result; a valid image
URL alone does not make it a suitable asset. If a missing required asset blocks
the agreed design, state that limitation rather than inventing a finished result.

## Bind assets to the publication

For managed pages use the image upload/import tools discovered through the
current schema, or changeset asset operations with whole-value @asset:key
placeholders where supported. Use returned canonical asset references; never
invent /assets paths, hotlink temporary generation URLs or edit published files.
An asset write changes publication state: refresh it before the next write.

Verify intended placement through the page snapshot and changeset postconditions,
including route, asset hash/path and reference-only versus placed status.
Optimize for actual display size using supported platform facilities. For static
source work, export suitable sizes/formats, size media to avoid layout shifts,
prioritize the main visible image and defer offscreen media.

Where supported, provide video posters and usable loading/failure fallbacks.
Keep informative alt text and sufficient text-overlay contrast. Use declared
crop/fit controls or an appropriate source crop; do not assume a block supports
an unlisted mobile-image field. Finish by checking the real page on desktop and
phone using visual-qa.md.
