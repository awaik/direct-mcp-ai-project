---
name: video-article-writer
description: "Превращать видео, аудио или транскрипт в большую SEO-статью: распознавание через LidFly, семантика, редактура, SEO-поля и согласованная обложка. Использовать, когда пользователь даёт медиафайл или расшифровку и просит статью, лонгрид или материал блога."
---

# Video Article Writer

Use when the user gives a video/audio file or transcript and asks for an article, longread, blog material, or SEO content.

## Workflow

1. Ask for publication resource, presentation mode, and a supplied or project-local style guide when one exists; otherwise clarify the desired voice without assuming a `.styles/` directory.
2. Create one run folder under `RESULTS/<basename>-<YYYYMMDD-HHMMSS>/`.
3. Read `references/transcription-workflow.md`, then extract/transcribe audio through LidFly tools if needed.
4. Save transcript and brief in the run folder.
5. Build semantic core for the article, not an ad campaign.
6. Write an article that preserves source meaning and marks unverifiable claims.
7. Use `human-editorial-polish`; do not insert artificial mistakes.
8. Run `article-reviser` for final editorial QA.
9. Prepare SEO title/meta/FAQ.
10. Show cover prompt, format, crop, and wait for confirmation before image generation.

## Rules

- Do not invent facts absent from the video/transcript.
- Keep all artifacts in the run folder.
- Do not publish or generate paid assets without confirmation.
- For regulated topics, apply user-provided business/legal constraints, avoid unsupported promises, and flag claims that require qualified review.
