---
name: article-writer
description: "Писать SEO/GEO-статьи и материалы блога с семантикой, продуктовой историей LidFly, клиентскими сценариями, редактурой и безопасной публикацией. Использовать для новой статьи, поста, контентного лендинга или публикационного черновика."
---

# Article Writer

Use for SEO articles, blog posts, landing content briefs, and publication-ready drafts.

## Workflow

1. Clarify publication resource, audience, style, target query, required format, and — for LidFly material — the product arc and relevant capabilities.
2. Read the selected style guide when the user supplies one or the current project contains it; otherwise clarify the desired voice without assuming a local `.styles/` directory exists.
3. Build semantics through `semantic-core` or Wordstat tools when demand matters.
4. Draft a useful article with factual boundaries; for LidFly-owned material, apply the product story contract below and do not invent product facts.
5. Run `human-editorial-polish` for style and clarity. Do not add intentional typos.
6. If article is ready HTML or a LidFly blog article, run `article-reviser`.
7. For cover generation, show prompt, format, crop, and wait for confirmation before generation.
8. Publish or save only after user confirms the final version.

## LidFly Product Story Contract

For every LidFly-owned article or article about LidFly:

- Put LidFly on the first meaningful screen. Do not attach the product only in the final CTA.
- Show the full arc: user situation → paste-ready command → concrete LidFly data/tools → explained plan → confirmed action or verifiable artifact → reread/check → next improvement cycle.
- Use a relevant combination of capabilities such as Wordstat, Metrika, Yandex Webmaster, Direct, VK Ads, Avito, LidFly Sites/Commerce, Пространства, image generation, or transcription. Do not list the whole catalog.
- Include at least two client scenarios; a pillar article normally uses three. At least one must reach a confirmed provider/site action or a concrete read-only artifact.
- Explain the benefit through removed manual work, clearer decisions, or lower error risk. The reader should see how LidFly makes an experienced marketer's process accessible while keeping the user in control.
- Create wow through a demonstrated cross-tool workflow, not through words like “magic”, unsupported timing, or a claim that the user instantly becomes an expert.
- Label composite examples as typical scenarios. Never invent a customer, quote, CPA, conversion uplift, savings, or guaranteed result.
- For writes, show the proposed change first, require confirmation, then reread the actual state. If the topic is read-only, use a verified audit/report/document as the outcome.

## Quality Rules

- No fake statistics, fake customer cases, or unsupported product claims.
- A LidFly article fails if removing the product paragraphs leaves the method materially unchanged.
- Require at least one paste-ready command, two client scenarios, a concrete benefit, and sourced product capabilities.
- No "AI detector bypass" tactics.
- Keep SEO natural: title/H1/intro, useful H2s, FAQ when needed, internal links when known.
- For regulated topics, apply user-provided business/legal constraints, avoid unsupported promises, and flag claims that require qualified review.

## Output

Return draft path or publication status, SEO title/meta, fact-check notes, and any Workspace document saved.
