# Подключение LidFly MCP к Windsurf

## Настройка

Windsurf обычно читает глобальный файл `~/.codeium/windsurf/mcp_config.json`. В проекте оставлен пример `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "lidfly": {
      "serverUrl": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

Перезапустите Windsurf и пройдите OAuth-вход, если Cascade покажет кнопку подключения.

## Проверка

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Для рекламных задач Cascade должен сначала определить scope через `get_provider_context` или `resolve_campaign_scope`.
