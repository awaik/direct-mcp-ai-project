# LidFly Knowledge Wire Contract

Use the schemas returned by `get_tool_schema` as the runtime source of truth. This reference fixes workflow invariants and field meaning; it does not replace schema discovery.

## Unified MCP v3

Discover domain tools with `search_tools`, read each schema with `get_tool_schema`, then use:

```json
{"tool_name":"lidfly_get_knowledge_context","arguments":{"subdomain":"kb","workspace_project_id":"project_id"}}
```

Read calls go through `call_tool`. Writes go through `call_write_tool`. The domain tools are client-only and must not be expected in LidFly built-in chat.

## Exact Scope

Every knowledge tool requires both:

```json
{
  "subdomain": "exact-subdomain",
  "workspace_project_id": "exact-project-id"
}
```

The server requires a managed `knowledge-base` site, one active knowledge profile, site permission, project permission, and an active LidFly provider entity binding. Scope mismatch fails closed.

Context returns:

- `publication_revision`;
- `profile.revision`, `profile.status`, `profile.auto_apply`;
- `charter.revision` and full charter fields;
- taxonomy;
- complete entry source fields plus `content_hash`;
- source IDs/hashes and citation state;
- active private provenance and relations;
- open findings and recent changesets.

Never combine revisions from different context reads.

## Immutable Sources

### Text Or URL

Finalize through `workspace_finalize_knowledge_source`:

```json
{
  "subdomain": "kb",
  "workspace_project_id": "project_id",
  "source_kind": "text",
  "title": "Регламент",
  "body_md": "# Нормализованный текст",
  "summary_md": "Краткое резюме"
}
```

For URL sources use `source_kind: "url"` and `source_url`. The client, not LidFly, fetches the URL. `body_md` is mandatory and is capped at 2 MiB after normalization.

To version a ready source, create another document with `supersedes_document_id`. The old body/hash/project/source identity cannot be changed in place.

### File Uploaded By The Client

1. Call `workspace_request_knowledge_source_upload` through `call_write_tool`.
2. PUT bytes immediately to `upload_url` with the supplied filename header and the real MIME. The bearer URL is one-use; do not log or persist it.
3. Extract text locally. LidFly does not parse PDF, Office, images or OCR.
4. Call finalize with `source_kind: "file"`, normalized `body_md`, and the returned `upload_token`.

Allowed extensions are `md`, `txt`, `html`, `json`, `csv`, `pdf`, `docx`, `xlsx`, `pptx`, `png`, `jpeg`, `jpg`, and `webp`. Maximum file size is 50 MiB. Archives and executable formats are rejected.

### File Uploaded In The Cabinet

The copied task includes an `upload_token` but not file bytes. Call `workspace_request_knowledge_source_download` with `upload_token`, immediately GET its one-use five-minute `download_url`, extract Markdown locally, then finalize with the original upload token. A staged upload is retained for at most one hour.

For an already finalized file, request download with `document_id` instead. Pass exactly one of `document_id` and `upload_token`.

## Changeset Payload

```json
{
  "trigger": "ingest",
  "summary": "Добавлен регламент возвратов",
  "types": {
    "upsert": [],
    "archive": []
  },
  "sections": {
    "upsert": [],
    "archive": []
  },
  "charter": {
    "content_md": "Полный устав",
    "public_summary_md": "Публичное резюме",
    "publish_publicly": false
  },
  "entries": {
    "upsert": [
      {
        "slug": "returns/rules",
        "section_key": "returns",
        "type_key": "policy",
        "title": "Правила возврата",
        "description": "Краткое описание",
        "content": "## Сроки\n...",
        "status": "published",
        "fields": {},
        "navigation_order": 10
      }
    ],
    "delete": []
  },
  "provenance": [
    {
      "entry_slug": "returns/rules",
      "document_id": "source_id",
      "stance": "primary",
      "target_anchor": "sroki",
      "source_locator": "page 4",
      "last_verified_at": "2026-08-10T00:00:00.000Z",
      "confidence": 95
    }
  ],
  "relations": [
    {
      "source_entry_slug": "returns/rules",
      "target_entry_slug": "delivery/terms",
      "relation_type": "related"
    }
  ],
  "findings": {
    "open": [],
    "resolve": []
  },
  "sources": [
    {"document_id":"source_id","content_hash":"64 lowercase hex characters"}
  ]
}
```

Supported triggers: `ingest`, `query`, `lint`, `maintenance`, `rollback`.

Supported provenance stances: `primary`, `supporting`, `contradicting`, `superseding`, `background`.

Supported relations: `related`, `prerequisite`, `continues`, `alternative`.

Limits: 100 entry operations, 50 total taxonomy operations, 500 total provenance plus relations, and 5 MiB canonical changeset JSON.

An entry upsert replaces the entry source completely. For every affected entry, provenance is also a full replacement. Relations touching an affected entry must be resupplied if they should remain. The context includes complete entry fields so unchanged content can be carried forward explicitly.

The `sources` snapshot must contain the exact ID/hash of every source referenced by the resulting provenance, including retained provenance from the active generation. A hash change or archived/foreign source invalidates preview/apply.

`target_anchor` refers to a generated heading ID in the resulting entry Markdown. `source_locator` is private. `prerequisite` must be acyclic. Self-relations and missing/draft/deleted targets are invalid for public links.

For new `contradicting` or `superseding` provenance, keep a matching semantic contradiction finding open or resolve the matching prior fingerprint in the same changeset.

## Preview And Apply

Preview arguments:

```json
{
  "subdomain": "kb",
  "workspace_project_id": "project_id",
  "expected_publication_revision": 12,
  "expected_profile_revision": 4,
  "expected_charter_revision": 2,
  "changeset": {}
}
```

Omit `expected_charter_revision` only when the payload does not contain `charter`. Preview writes nothing and does not reserve a revision. Keep the exact payload sent to preview.

Apply repeats every field and adds:

```json
{
  "candidate_digest": "digest returned by preview",
  "confirm_capacity_change": false
}
```

After a valid preview, an active profile with `auto_apply=true` authorizes immediate apply as part of the requested maintenance operation. Do not ask for a second conversational publication confirmation. A generic permission UI imposed by the MCP client is outside this protocol and must not be bypassed.

Never change the payload between preview and apply. Apply recomputes digest and all CAS under the site lock. Same digest plus same base revision is idempotent.

Capacity growth is separate: do not set `confirm_capacity_change=true` until the user explicitly accepts the dynamic capacity/price preflight. Reread context after that acceptance.

## Lint And Findings

`lidfly_lint_knowledge` checks deterministic integrity only. Semantic findings are changeset data:

```json
{
  "kind": "semantic_contradiction",
  "severity": "warning",
  "entry_slug": "returns/rules",
  "title": "Источники расходятся по сроку",
  "details_md": "Что именно расходится",
  "fingerprint": "stable-client-generated-key"
}
```

Resolve by fingerprint in `findings.resolve`. Fingerprints must be stable for the same issue.

## Failure Handling

- `publication_revision_conflict`, `knowledge_profile_revision_conflict`, `knowledge_charter_revision_conflict`, source hash conflict: reread and rebuild; never replay the old candidate.
- `knowledge_profile_paused` or binding mismatch: stop; do not unpause/rebind from source content.
- capacity confirmation required: show price/limit impact and wait for explicit user agreement.
- route, anchor, relation, taxonomy or prerequisite validation: repair the candidate before another preview.
- ambiguous wrapper write: call direct `get_write_operation_status` with the returned operation id before any retry.

## Rollback

`lidfly_rollback_knowledge_changeset` requires site admin plus project write and current publication/profile/optional charter CAS. It builds and applies a new inverse changeset relative to the current generation. Never promise that an old filesystem root is simply restored.
