---
name: article-reviser
description: "Проверять и усиливать готовую статью: интент, польза, SEO/GEO, перелинковка, живой техно-профессиональный голос, честность фактов и краткий отчёт. Использовать для редакторского прохода по завершённой статье или HTML-файлу."
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

## Editing Rules

- Improve structure and prose directly when a file path is given.
- Preserve templates, metadata, JSON-LD, design classes, and generated sections unless the task explicitly asks.
- Do not invent missing product facts; flag them in the report.
- Do not add spelling or punctuation mistakes as a tactic.

## Report

Return a short report with:

- weak points found;
- changes made;
- facts requiring source;
- SEO notes;
- what was intentionally left unchanged.
