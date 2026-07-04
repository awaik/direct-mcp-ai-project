---
name: article-writer
description: Write SEO/GEO articles for LidFly or a file with Wordstat-informed semantics, editorial drafting, cover prompt confirmation, human editorial polish, article-reviser pass, and Workspace-safe publishing notes.
---

# Article Writer

Use for SEO articles, blog posts, landing content briefs, and publication-ready drafts.

## Workflow

1. Clarify publication resource, audience, style, target query, and required format.
2. Read `.styles/` when a style is selected.
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
- Regulated topics require `LEGAL.md` review.

## Output

Return draft path or publication status, SEO title/meta, fact-check notes, and any Workspace document saved.
