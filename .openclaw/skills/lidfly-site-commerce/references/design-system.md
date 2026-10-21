# LidFly site design system v2

Use for any visual work on a managed site: a new page, a redesign, an article or
a fix of spacing, fonts or alignment. Source: the approved Figma file
«LidFly сайты» (2026-10-16). The platform enforces the numbers; your job is to
choose the style, the composition and the content.

## Know the version first

Call `lidfly_get_site_theme` and read `design_system`:

- `version: 2` — every site created since 2026-10-16. Rhythm, type scale,
  container and block styling come from the platform. Change the look with
  `site_style`, the brand colour with `primaryColor`/`accentColor`, the overall
  rhythm with `density` (compact / comfortable / airy). Do not set font sizes,
  weights, paddings or widths in custom CSS, and do not add `spacing` to blocks.
- `version: 1` — an existing site keeps its geometry byte for byte. Moving it to
  v2 only at the owner's request: preview with `lidfly_inspect_site_visual`
  `design_preview` (before/after, metrics, custom CSS risks), then
  `lidfly_update_site_theme` `design_system: "v2"`; `"v1"` rolls back.

## Choose one style (v2)

| site_style | For |
|---|---|
| editorial | blogs, guides, expert authors, media (Literata + Onest) |
| business | B2B, accounting, lawyers, consulting (Manrope) |
| warm-local | cafés, bakeries, salons, services nearby (Golos Text) |
| tech-minimal | SaaS, AI services, apps, agencies (Geologica + Onest) |
| premium-dark | fine dining, interiors, events (Cormorant Garamond + Manrope) |
| bright | courses, events, youth brands (Unbounded + Onest) |
| medical | clinics, dentistry, psychologists (IBM Plex Sans) |
| craft | furniture, handcraft, farm products (PT Serif + Golos Text) |

Pick by the brief, then change at most one or two brand colours. Fonts outside the
self-hosted set render as system fonts; the theme write returns a warning.

## Rules with numbers

1. One left axis: headings, text and grids start at the container edge.
   Centre only 1–2 short lines (numbers, logos).
2. One H2 style per page; the role sets the size, not the block.
3. 64–104 px between sections on desktop, 48–64 px on phones.
4. Card text is left-aligned; no `min-height`, no empty “Learn more” cards.
5. Prose lines of 60–75 characters: the article column is 720 px.
6. Body text in full colour; grey is for captions and meta only.
7. One primary button per screen; the second is secondary or a text link.
8. An article is text plus figures and callouts, not landing blocks.
9. One CTA per article (on v2 it sits in the side column on desktop).
10. Heading weights 500–700; no gradient text.
11. Media in 16:10, 4:3, 1:1 or 3:4; a single photo is a figure, not a gallery.
12. A section on a phone is at most ~1.5 screens; long feeds become rows.

A page has 5–9 sections chosen by the task. Use real numbers, reviews and cases
only; never invent them to fill a section.

## Anti-patterns and replacements

| Instead of | Use |
|---|---|
| 3+ `feature-split` in a row as an article layout | `text-content` blocks, one per H2 subsection, with `body` parts: `figure`, `figures`, `callout`, `photo-list`, `stat` |
| a stack of empty cards (“Service — Learn more →”) | `features-grid` with real text, or `page-header` `tags` / a list |
| centred paragraphs | left-aligned `text-content` |
| three Telegram/CTA bands in one article | one `blog-editorial-cta` |
| `hero-*` without a photo on an inner page | `page-header` (eyebrow, H1, subtitle, tags) |
| `gallery-grid` with one image | a `figure` in `text-content.body` |
| `stats-counter` between article paragraphs | a `stat` part inside the article, or none |
| `editorial-about-stats` on a light v2 site | `stats-counter` with `text`, `linkText`, `linkUrl` |

## Reference compositions

`lidfly_get_reference_composition` returns one approved page per scenario:
block JSON with props, the template and `site_style`, desktop/phone screenshots
(`include_images: true` attaches them) and the decisions behind each section.
Scenarios: local-services, expert, blog-home, blog-article, store, product,
portfolio, event, restaurant, b2b, agency, workshop. Each passes the composition
lint and the design metrics with zero findings. Copy the structure, variants and
key props, not the demo texts, photos or numbers. `lidfly_recommend_page_blueprint`
names the matching scenarios in `reference_scenarios`. Personal blogs and guides
use the `personal-blog` template.

An article (`page_kind: blog_article`) is `text-content` `variant: article` per
subsection, one `blog-editorial-cta` and a `blog-article-list` `grid` with
`background: surface`; the template adds breadcrumbs and the article header.
Only the first article block gets a lead paragraph (`lead: true/false` overrides).

```json
{ "type": "text-content", "props": { "variant": "article", "heading": "Что лежит в тазах",
  "text": "Состав у каждой продавщицы свой.",
  "body": [
    { "type": "photo-list", "columns": 2, "items": [{ "title": "Красные зёрнышки", "subtitle": "hạt lựu", "text": "Каштан в крахмальной оболочке.", "image": "assets/hat-luu.jpg" }] },
    { "type": "figure", "image": "assets/cart.jpg", "alt": "Лоток", "caption": "Уличный лоток chè", "ratio": "3:2" },
    { "type": "callout", "label": "Как заказать", "text": "«Không đá» — без льда." }
  ] } }
```

## Check the result

Compare desktop (1440) and phone (390) screenshots with the rules: count H2 sizes
and left edges, look for centred paragraphs, repeated CTAs and sections longer
than 1.5 phone screens. Fix through props, style and composition; custom CSS is
for brand details only.
