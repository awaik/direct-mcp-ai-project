# YouTube Output Contract

Prepare a usable publishing package without claiming guaranteed ranking.

## Source Integrity

- Preserve names, product facts, numbers, and conclusions from the source.
- Do not invent chapters or timestamps. If time-aligned data is unavailable, provide an ordered outline instead.
- Mark unverified promotional or regulated claims.

## Media Preparation

A supplied transcript needs no upload. For media, inspect the available host's
attachment/file, upload and HTTP capabilities and the current transcription schemas.
Check both file size and duration against the returned limits. If splitting is
needed and local media tools exist, create ordered chunks in a unique authorized
run directory, preserve originals and keep chunk offsets for global timestamps.
Otherwise request a transcript or supported smaller attachment; do not assume a shell.

For a local file use `search_tools` → `get_tool_schema` → `call_write_tool` for
`request_upload_audio`, then PUT bytes immediately to its returned private
`upload_url`. For a public direct media URL use `transcribe_audio_url` through
`call_write_tool`; a normal YouTube page is not a direct media URL. Never log or
persist bearer upload URLs. Read each returned `transcription_id` with
`get_transcription` through `call_tool`, following the returned polling interval.
Do not repeat an uncertain paid write blindly; check its existing result first.
Keep raw outputs and verified timing separate from edited copy; report missing
chunks instead of reconstructing speech. Save or clean up artifacts only under
the user's requested destination and host retention rules.

## Deliverable

Provide:

1. Three to five title options with different honest angles.
2. One publication-ready description whose opening clearly states topic and viewer value.
3. Chapters only when timestamps are verified.
4. Tags only when requested or when the user asks for a complete upload package.
5. One pinned-comment draft.
6. Three to five short thumbnail-text ideas.

Use Wordstat data naturally. Do not stuff every phrase into the title or description, and do not present Wordstat frequency as YouTube search volume.

## Saved Text File

When saving a `.txt` artifact:

- use plain text without Markdown syntax or decorative emoji;
- keep links as ordinary URLs;
- keep titles, description, chapters, tags, pinned comment, and thumbnail ideas in clearly labelled sections;
- keep the raw transcript and research notes in separate files.

Before delivery, verify that titles and description match the actual video and respect any user-provided business or legal restrictions. Flag regulated or unsupported claims that require qualified review.
