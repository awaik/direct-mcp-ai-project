# Static Sites

Only for static deployments, never managed pages. Read site/revision first.
For a full build edit original sources, upload with `request_upload_archive`,
preview/inspect, then `lidfly_deploy_static_site` with exact preview id, digest,
revision and explicit replace confirmation. Route collisions block deployment;
a locked full-root replacement requires browser unlock by the owner. Reread the
site afterwards. Static forms may POST `/api/leads`; server code is unsupported.
Never emulate platform behavior with page CSS.

## Replace existing files

`lidfly_list_static_files` lists/searches directories. Follow `next_cursor` with
the same directory/query; restart on revision conflict. Read selected paths via
`lidfly_read_static_file`, follow every text `next_call`, retain SHA-256/revision.
Binary or >1 MiB text returns metadata/public URL, not base64. Paths are literal,
case-sensitive relative paths: no hidden segments, traversal, symlinks or encoding.

For 1–50 ordinary existing files: `lidfly_replace_static_files(dry_run:true)`
with current `expected_publication_revision` and each `expected_sha256`.
Provide UTF-8 `content` (≤1 MiB total) or private `archive_token` from
`lidfly_request_upload_archive`; ZIP contains exactly those site-root paths.
JSON accepts any root type, valid UTF-8/JSON, ≤5 MiB via ZIP. Review paths,
hashes, sizes and storage delta; apply the same authorized changes with
`dry_run:false, confirm_replace:true`. Scoped replacement needs no full-root unlock.

Registered HTML bundles, media/legacy assets, document aliases, integration
sources and platform indexing/favicon files require their own tools. Respect
`read_only_reason`; never remove ownership or use full-root replacement to bypass
it. Creation/deletion/rename are excluded. On revision/SHA conflict, reread and
reconcile the user's draft; never overwrite automatically. For pending/lost
responses read `lidfly_get_write_operation_status`, never blindly repeat writes.

Success preserves URLs, unselected files and the prior full-build backup. Copy
edits back to local sources before the next folder/ZIP deployment. CSS/JS and
some images may stay cached up to five minutes. Cabinet: «Сайты → Управление →
Файлы → Файлы сайта»; «Медиатека» is separate.
