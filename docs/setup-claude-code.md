# Подключение LidFly MCP к Claude Code и Claude Desktop

## Claude Code

Рекомендуемый вариант - добавить remote MCP без API-ключа:

```bash
claude mcp add \
  --transport http \
  lidfly https://lidfly.ru/mcp/v3
```

Или используйте `.mcp.json` в корне проекта:

```json
{
  "mcpServers": {
    "lidfly": {
      "type": "http",
      "url": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

После добавления откройте `/mcp`, выберите сервер `lidfly` и нажмите `Authenticate`. Вход идёт через браузер: email -> код из письма. API-ключ вручную копировать не нужно.

## Claude Desktop

1. Откройте Claude Desktop -> Customize -> Connectors.
2. Нажмите `Add custom connector`.
3. Укажите:

```text
Name: LidFly
URL: https://lidfly.ru/mcp/v3
```

4. Нажмите `Connect` и пройдите OAuth-вход.
5. В новом чате включите connector через `+` -> Connectors, если Claude не включил его автоматически.

Не используйте `claude_desktop_config.json` для нового OAuth-подключения. Этот файл нужен для локальных MCP-серверов и legacy-схем.

## Проверка

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Для рекламного запроса Claude должен вызвать `get_provider_context`, затем `search_tools` и `get_tool_schema`, и только после этого `call_tool` или `call_write_tool`.

## Permissions

`.claude/settings.json` в этом шаблоне не включает blanket bypass. Read-only calls могут выполняться шире, но write-действия должны идти через `call_write_tool` и подтверждаться текстом пользователя.

Основной source of truth для публичных snippets - `public/js/guides.js` в основном репозитории LidFly.
