---
name: lidfly-site-commerce
description: Work with LidFly sites, pages, assets, leads, analytics, image generation, publishing, and Commerce through MCP v3 while respecting theme/template terminology, PostgreSQL store source of truth, and YooKassa secret safety.
---

# LidFly Site Commerce

Use for LidFly sites, landing pages, published pages, assets/uploads, leads, analytics, stores, offers, variants, inventory, orders, fulfillments, payments, and Commerce setup.

## Terminology

- "Тема оформления" means visual tokens: colors, fonts, radius, renderer choices.
- "Шаблон сайта" means persistent site-level design system: header, footer, product page/card layout, checkout, and page blueprints.
- Do not call generated storefront pages "templates" unless they use real `design_template_id`.

## Source Of Truth

- Commerce source of truth is store/provider tools backed by PostgreSQL.
- Published HTML under `/sites` is only a publish artifact.
- YooKassa seller secrets are never shown, echoed, or saved in user-visible docs.

## Workflow

1. Search tools for LidFly site/commerce task.
2. Read schemas before first calls.
3. Use `call_tool` for reads: sites, pages, assets, leads, analytics, stores, orders.
4. Use `call_write_tool` for publishing, uploads, store/order changes, payment setup, and image generation.
5. For paid image generation, show prompt, format, crop, and wait for explicit confirmation.

## Workspace

If work belongs to a business/client, resolve `workspace_project_id` before saving decisions, documents, or scheduled follow-ups.
