# Подключение LidFly MCP к Cursor

## Настройка

Файл `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lidfly": {
      "url": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

Перезапустите Cursor и нажмите `Authenticate` / `Connect` для сервера `lidfly`, если клиент запросит вход. API-ключ вручную копировать не нужно.

## Проверка

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Если Cursor не подхватил файл, добавьте сервер через Settings -> MCP:

```text
Name: lidfly
URL: https://lidfly.ru/mcp/v3
```

Для write-действий требуйте план и текстовое подтверждение; они должны идти через `call_write_tool`.
