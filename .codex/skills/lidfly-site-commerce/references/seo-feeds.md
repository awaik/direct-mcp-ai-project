# SEO, Feeds And Agent Readiness

## Agent And GEO Readiness

Use this workflow for requests about GEO, AI visibility, agent ready/readiness, MCP Card, AI robots, Markdown for agents, Agent Skills, WebMCP, or DNS-AID:

1. Find `lidfly_get_agent_readiness` and read its schema, then call it through `call_tool` with the exact `subdomain`.
2. Explain the two independent results: Agent Readiness is technical discovery/access for AI clients; GEO Content Readiness is factual clarity, entities, FAQ, characteristics, geography, dates, authorship, cases, and structured data for Generative Engine Optimization. GEO here does not mean geographic SEO.
3. Treat `crawler_indexing_blocked=true` as a stronger privacy setting. Missing Markdown, Skills, MCP Card, WebMCP, sitemap, and a low external score are expected while the site is closed. Never enable indexing automatically.
4. In `platform` mode, LidFly owns the publication marker, AI robots block, Link headers, Markdown negotiation, API catalog, OAuth metadata, protected-resource metadata, `auth.md`, MCP Card, Agent Skills, capabilities, and WebMCP runtime. Do not edit, upload, overwrite, or delete these platform artifacts manually.
5. Change source mode and independent content permissions through `lidfly_update_agent_readiness` via `call_write_tool`, using `mode: "platform" | "custom"` and the exact `expected_publication_revision` plus `expected_updated_at` from the same readiness read. Reread afterward. Optional `permissions` partially updates `search`, `ai_input`, `ai_train`; omitted values remain unchanged. Stay in platform for these settings. Explain configured/effective permissions, global-block suppression, conflicts and Google-Extended mixed grounding/training. AI visibility alone does not authorize training. An unknown write outcome requires rereading before any retry. Distinguish saved state, local artifact consistency and external HTTP verification; caches can serve older policy (5s host lookup, max-age 60s, stale-while-revalidate 300s).
6. `custom` returns discovery ownership to the site owner and does not prove that custom artifacts are valid. Preserve user-owned HTML, ZIP, robots rules, CSP, and `.well-known` files.
7. DNS-AID is versioned to draft-02 and remains an Internet-Draft. Report 100/100 only after both generated SVCB records, DNSSEC/AD, the public endpoints, and the current external scanner are verified. Do not publish `_a2a` without a real A2A endpoint.

The default content policy for an open platform-managed site is `search=yes, ai-input=yes, ai-train=no`. A high technical score does not guarantee traffic, rankings, citations, or rich results.

## SEO, Social Metadata And Feeds

Use the exact `subdomain` from the latest read. Change source fields through LidFly tools and let the platform rebuild canonical URLs, JSON-LD, social meta, RSS, feeds, and managed HTML. After every write, reread the same source object; do not treat a successful tool call as verification by itself.

Product-feed profiles are Commerce data, not editable XML files. Use the list → preview → confirmed set → health sequence and preserve the returned source-bound `preview_hash`. A `.xml` extension does not define a schema: ordinary Yandex Direct product feeds use `yandex_direct_yml`, while industry formats require dedicated models. Registering the resulting URL in Direct is a separate Workspace-scoped provider write and requires its own confirmation.

### Organization And Local Business Schema

1. Find `lidfly_get_site_seo_profile` and `lidfly_update_site_seo_profile` with `search_tools`, then read each schema with `get_tool_schema` before its first call.
2. Call `lidfly_get_site_seo_profile` through `call_tool` with the exact `subdomain`. Keep its full profile, `updated_at`, and `publication_revision` from the same read.
3. Call `lidfly_update_site_seo_profile` through `call_write_tool` with the full replacement profile, exact `expected_updated_at`, and exact `expected_publication_revision`. This is a destructive full replacement: omitted profile fields are cleared to their empty/default values, and `profile: {}` removes the public organization entity. Do not send a partial profile or automatically retry a stale conflict.
4. Call `lidfly_get_site_seo_profile` again and reread the effective Organization, OnlineStore, LocalBusiness, or more specific factual business type.

Use only public, factual contacts, address/geo, opening hours, `sameAs`, service area, and buyer-visible merchant policies. Do not copy external organization reviews into JSON-LD. Schema eligibility does not guarantee positions, stars, or a rich result.

### Articles And RSS

Publish or update an article through `lidfly_publish_blog_article`; LidFly generates Article JSON-LD, Open Graph, Twitter Cards, and the marker-owned `/rss.xml`. There is no separate RSS write tool. A user-owned `/rss.xml` is preserved and reported as a warning rather than overwritten.


### Specialist Profiles And Article Author Type

Read `lidfly_get_page` and the relevant `lidfly_get_block` values first; use only visible names, photos and roles. Read `lidfly_get_site_seo_profile` to verify the organization. Discover `lidfly_update_page_seo` for one page or preview one changeset with `set_page_seo` for several pages. Present its metadata diff and scope for confirmation, apply with fresh CAS/digest, then reread `page_seo` and the exact public graph. Poll pending operations; never repeat an unknown write.

Profile data belongs to a default page; the article author type belongs to blog_article. A profile patch replaces the whole profile, null removes it, and omission preserves it. For an organization author use `article_author_type:"site_organization"`; for a person use `"person"`. Publishing an article accepts `author_type`; explicitly supply it when changing the author. Missing site organization produces a warning and no dangling graph reference. Preserve the visible byline and design; never patch raw JSON-LD or infer identity from a name. Split more than 100 operations into separately confirmed batches with a fresh revision; there is no cross-batch atomicity.

Sources checked 2026-10-16: [Google Article](https://developers.google.com/search/docs/appearance/structured-data/article), [Google ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page). Eligibility does not guarantee a rich result. Server validation and `page_seo` effective values are authoritative.
