# LidFly Transcription Workflow

Use this reference only when the user supplied media rather than a ready transcript.

## Local File

1. Check that the file exists and note its extension and size.
2. If a video is larger than the current upload limit, extract a compact audio track with an available media tool. Do not install software without permission.
3. Find `request_upload_audio` with `search_tools`, read its schema with `get_tool_schema`, and invoke it through `call_write_tool`.
4. Upload the local file to the returned one-time `upload_url` with an HTTP PUT. Never print or save the URL beyond the active run.
5. Extract the returned `transcription_id`.

## Public Direct Media URL

Find `transcribe_audio_url`, read its schema, and invoke it through `call_write_tool`. Use only a direct media URL, not a normal YouTube/TikTok page.

## Read Result

1. Find `get_transcription`, read its schema, and invoke it through `call_tool`.
2. If the status is pending/processing, wait for the interval returned by the tool and retry without a busy loop. Keep the user informed during long processing.
3. If completed, save the exact raw transcript before editing it.
4. If failed, report the returned error and stop; never reconstruct missing speech.

Do not invent a `diarize` argument or any field absent from the current schema. Keep the raw transcript separate from the edited article.
