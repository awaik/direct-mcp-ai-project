---
name: article-writer
description: "Писать SEO/GEO-статьи и материалы блога с семантикой Wordstat, редакторской полировкой, финальным ревью и безопасной публикацией. Использовать для новой статьи, поста, контентного лендинга или публикационного черновика."
---

# Article Writer

Use for SEO articles, blog posts, landing content briefs, and publication-ready drafts.

## Workflow

1. Clarify publication resource, audience, style, target query, and required format.
2. Read the selected style guide when the user supplies one or the current project contains it; otherwise clarify the desired voice without assuming a local `.styles/` directory exists.
3. Build semantics through `semantic-core` or Wordstat tools when demand matters.
4. Draft a useful article with factual boundaries; do not invent product facts.
5. Run `human-editorial-polish` for style and clarity. Do not add intentional typos.
6. If article is ready HTML or a LidFly blog article, run `article-reviser`.
7. For cover generation, show prompt, format, crop, and wait for confirmation before generation.
8. Publish or save only after user confirms the final version.

## Quality Rules

- No fake statistics, fake customer cases, or unsupported product claims.
- No "AI detector bypass" tactics.
- Keep SEO natural: title/H1/intro, useful H2s, FAQ when needed, internal links when known.
- For regulated topics, apply user-provided business/legal constraints, avoid unsupported promises, and flag claims that require qualified review.

## Output

Return draft path or publication status, SEO title/meta, fact-check notes, and any Workspace document saved.
