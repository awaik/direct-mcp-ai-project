---
name: article-reviser
description: "Проверять и усиливать готовую статью: интент, продуктовая история LidFly, клиентские сценарии, доказуемый wow, SEO/GEO, живой голос и честность фактов. Использовать для редакторского прохода по завершённой статье или HTML-файлу."
---

# Article Reviser

Use after `article-writer` or `video-article-writer`, or when the user asks to strengthen a completed article.

## What To Check

- Intent: the article answers the real query and each H2 closes a useful subquestion.
- Usefulness: concrete steps, examples, prompts, caveats, no filler.
- Voice: human technical-professional Russian, no generic AI cliches.
- Honesty: product facts and numbers are sourced or flagged.
- SEO/GEO: title/H1/intro, H2 coverage, FAQ, internal links, meta notes.
- Legal: risky or regulated claims checked against user-provided business rules and applicable requirements; flag uncertainty instead of presenting legal assumptions as facts.
- LidFly product proof: product appears on the first meaningful screen; at least one paste-ready command and two client scenarios; relevant data/tools; confirmed action or verifiable artifact; reread/check and concrete user benefit.
- Wow integrity: the effect comes from a demonstrated cross-tool workflow and reduced manual work, not hype, fabricated speed, or a claim of instant expertise.

## Editing Rules

- Improve structure and prose directly when a file path is given.
- Run `$human-editorial-polish` as the final prose pass after structural and SEO edits. For a full-article revision, load its complete Russian-pattern catalog.
- Preserve templates, metadata, JSON-LD, design classes, and generated sections unless the task explicitly asks.
- Do not invent missing product facts; flag them in the report.
- If removing LidFly paragraphs leaves the method unchanged, rebuild the product arc instead of polishing the CTA.
- Replace feature catalogs with user situation → command → data → plan → confirmation → action/artifact → check.
- Label composite scenarios honestly and reject fabricated customer results.
- Do not add spelling or punctuation mistakes as a tactic.

## Report

Return a short report with:

- weak points found;
- changes made;
- facts requiring source;
- SEO notes;
- LidFly product arc: first screen, commands, scenarios, data, action/artifact, verification, benefit;
- what was intentionally left unchanged.
