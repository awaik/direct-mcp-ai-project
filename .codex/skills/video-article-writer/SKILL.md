---
name: video-article-writer
description: Turn a video or transcript into a long SEO article: transcription through LidFly when needed, style/resource intake, semantic-core, editorial article, human polish, article-reviser, SEO fields, and confirmed cover prompt.
---

# Video Article Writer

Use when the user gives a video/audio file or transcript and asks for an article, longread, blog material, or SEO content.

## Workflow

1. Ask for publication resource, style from `.styles/` or custom style, and mode of presentation.
2. Create one run folder under `RESULTS/<basename>-<YYYYMMDD-HHMMSS>/`.
3. Extract/transcribe audio through LidFly tools if needed.
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
- For regulated topics, check `LEGAL.md`.
