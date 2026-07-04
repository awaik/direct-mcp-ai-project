# Подключение LidFly MCP к OpenClaw

## Настройка

Скопируйте пример:

```bash
cp .openclaw/openclaw.example.json .openclaw/openclaw.json
```

Пример содержит MCP URL и список skills:

```json
{
  "mcpServers": {
    "lidfly": {
      "type": "http",
      "url": "https://lidfly.ru/mcp/v3"
    }
  },
  "skills": {
    "directory": ".openclaw/skills"
  }
}
```

Если OpenClaw в вашей версии не поддерживает OAuth remote MCP, добавьте Bearer API-key только в локальный `.openclaw/openclaw.json` и не коммитьте этот файл.

## Skills

Копии skills в `.openclaw/skills` генерируются из `skills-source/`:

```bash
node scripts/sync-skills.mjs
```

## Проверка

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Дальше OpenClaw должен работать через v3 meta-layer: `search_tools`, `get_tool_schema`, `call_tool`, `call_write_tool`, `get_provider_context`, `resolve_campaign_scope`.
