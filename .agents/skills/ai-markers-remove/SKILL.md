---
name: ai-markers-remove
description: "Legacy-алиас безопасной редакторской полировки AI-подобного текста без обхода детекторов, искусственных ошибок и искажения фактов. Использовать только при явном вызове $ai-markers-remove; для обычной редактуры использовать human-editorial-polish."
---

# AI Markers Remove (Safe Alias)

This legacy skill name is kept for compatibility. Treat it as `human-editorial-polish`.

## Required Behavior

- Improve clarity, specificity, rhythm, and human editorial voice.
- Remove generic AI cliches and redundant structure.
- Preserve facts, formatting, links, headings, tables, and grammar.
- Do not add artificial typos, punctuation mistakes, fake subjectivity, or detector-bypass tricks.
- If a user explicitly asks to fool a detector, refuse that part and offer normal editorial polishing.

## Output

Return polished text or save a clean final version. Do not overwrite the source unless explicitly requested.
