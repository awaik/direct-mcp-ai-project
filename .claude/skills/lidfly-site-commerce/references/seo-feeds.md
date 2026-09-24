# SEO, Feeds And Agent Readiness

## Agent And GEO Readiness

Use this workflow for requests about GEO, AI visibility, agent ready/readiness, MCP Card, AI robots, Markdown for agents, Agent Skills, WebMCP, or DNS-AID:

1. Find `lidfly_get_agent_readiness` and read its schema, then call it through `call_tool` with the exact `subdomain`.
2. Explain the two independent results: Agent Readiness is technical discovery/access for AI clients; GEO Content Readiness is factual clarity, entities, FAQ, characteristics, geography, dates, authorship, cases, and structured data for Generative Engine Optimization. GEO here does not mean geographic SEO.
3. Treat `crawler_indexing_blocked=true` as a stronger privacy setting. Missing Markdown, Skills, MCP Card, WebMCP, sitemap, and a low external score are expected while the site is closed. Never enable indexing automatically.
4. In `platform` mode, LidFly owns the publication marker, AI robots block, Link headers, Markdown negotiation, API catalog, OAuth metadata, protected-resource metadata, `auth.md`, MCP Card, Agent Skills, capabilities, and WebMCP runtime. Do not edit, upload, overwrite, or delete these platform artifacts manually.
5. Change only the source setting through `lidfly_update_agent_readiness` via `call_write_tool`, using `mode: "platform" | "custom"` and the exact `expected_publication_revision` plus `expected_updated_at` from the same readiness read. Reread afterward. This write does not open search indexing.
6. `custom` returns discovery ownership to the site owner and does not prove that custom artifacts are valid. Preserve user-owned HTML, ZIP, robots rules, CSP, and `.well-known` files.
7. DNS-AID is versioned to draft-02 and remains an Internet-Draft. Report 100/100 only after both generated SVCB records, DNSSEC/AD, the public endpoints, and the current external scanner are verified. Do not publish `_a2a` without a real A2A endpoint.

The default content policy for an open platform-managed site is `search=yes, ai-input=yes, ai-train=no`. A high technical score does not guarantee traffic, rankings, citations, or rich results.

## SEO, Social Metadata And Feeds

Use the exact `subdomain` from the latest read. Change source fields through LidFly tools and let the platform rebuild canonical URLs, JSON-LD, social meta, RSS, feeds, and managed HTML. After every write, reread the same source object; do not treat a successful tool call as verification by itself.

### Organization And Local Business Schema

1. Find `lidfly_get_site_seo_profile` and `lidfly_update_site_seo_profile` with `search_tools`, then read each schema with `get_tool_schema` before its first call.
2. Call `lidfly_get_site_seo_profile` through `call_tool` with the exact `subdomain`. Keep its full profile, `updated_at`, and `publication_revision` from the same read.
3. Call `lidfly_update_site_seo_profile` through `call_write_tool` with the full replacement profile, exact `expected_updated_at`, and exact `expected_publication_revision`. This is a destructive full replacement: omitted profile fields are cleared to their empty/default values, and `profile: {}` removes the public organization entity. Do not send a partial profile or automatically retry a stale conflict.
4. Call `lidfly_get_site_seo_profile` again and reread the effective Organization, OnlineStore, LocalBusiness, or more specific factual business type.

Use only public, factual contacts, address/geo, opening hours, `sameAs`, service area, and buyer-visible merchant policies. Do not copy external organization reviews into JSON-LD. Schema eligibility does not guarantee positions, stars, or a rich result.

### Articles And RSS

Publish or update an article through `lidfly_publish_blog_article`; LidFly generates Article JSON-LD, Open Graph, Twitter Cards, and the marker-owned `/rss.xml`. There is no separate RSS write tool. A user-owned `/rss.xml` is preserved and reported as a warning rather than overwritten.
