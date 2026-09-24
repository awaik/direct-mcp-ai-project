# LidFly Transcription Workflow

Use this reference only when the user supplied media rather than a ready transcript.

## Limits And Local Preparation

1. Check that the file exists and note its extension and size.
2. Check duration independently from size. When `ffprobe` is available:

   ```bash
   ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "<media_path>"
   ```

3. LidFly accepts MP3, WAV, M4A, OGG, OPUS, FLAC, WebM, MP4, and AAC. M4A is supported directly: do not rename or convert it merely to make it uploadable.
4. The current LidFly ceiling is 200 MiB and 4 hours per transcription request. Check both limits independently: a small compressed file can still be too long.
5. If duration exceeds 4 hours or size exceeds 200 MiB, create chunks below both boundaries. For video or audio, this command produces ordered 3-hour-59-minute mono MP3 chunks:

   ```bash
   ffmpeg -i "<media_path>" -vn -ac 1 -ar 16000 -b:a 96k -f segment -segment_time 14340 -reset_timestamps 1 "/tmp/<basename>-%03d.mp3"
   ```

   The `96k` bitrate and `14340`-second duration are coupled to the 200 MiB limit: one chunk is about 164 MiB before container overhead. Recalculate the worst-case output size before changing either value.

6. Record the exact paths of chunks created by this run. Do not use a broad glob for later cleanup and never treat the user's original media as a generated chunk.
7. Do not install media software without permission. If duration cannot be measured and no approved tool is available, explain the limitation instead of guessing.

## Local File Upload

1. Find `request_upload_audio` with `search_tools` and read its current schema with `get_tool_schema` once. For every chunk in filename order, invoke `request_upload_audio` once through `call_write_tool`.
2. Upload that chunk to its own returned one-time `upload_url` with an HTTP PUT before requesting the URL for the next chunk. Never print or save an upload URL beyond the active run.
3. Extract and retain the `transcription_id` for each chunk in filename order.

## Public Direct Media URL

Find `transcribe_audio_url`, read its schema, and invoke it through `call_write_tool`. Use only a direct media URL, not a normal YouTube/TikTok page. If the media is known to exceed 4 hours or 200 MiB, or the tool returns `audio_too_long`, do not retry the same URL: download it only when authorized, split it locally, and use the local upload flow.

## Read Result

1. Find `get_transcription`, read its schema, and invoke it through `call_tool` for every retained id.
2. If a status is pending/processing, wait for the interval returned by the tool and retry without a busy loop. Keep the user informed during long processing.
3. Save every completed chunk as exact raw text, then concatenate the chunks in original order with an explicit chunk-boundary marker. If a boundary cuts a phrase, preserve both adjacent raw outputs and mark the seam; do not complete or reconstruct missing words.
4. If any chunk fails, name that chunk and report the returned error. Never reconstruct or silently omit missing speech.
5. After the combined raw transcript is saved, or after aborting on an error, delete only the generated chunk paths recorded by this run. Do not delete the original media.

Do not invent a `diarize` argument or any field absent from the current schema. Keep the raw transcript separate from the edited article.
