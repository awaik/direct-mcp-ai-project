# Подключение LidFly MCP к VS Code

Подходит для GitHub Copilot Chat, Cline, Continue.dev и других расширений VS Code с MCP.

## Настройка

Файл `.vscode/mcp.json`:

```json
{
  "servers": {
    "lidfly": {
      "type": "http",
      "url": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

При первом запуске пройдите OAuth-вход по email, если расширение покажет кнопку `Authenticate` / `Connect`.

## Проверка

Откройте Agent chat и напишите:

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Ожидаемый workflow: `get_provider_context` для scope, затем `search_tools` -> `get_tool_schema` -> `call_tool`.

## Legacy Fallback

Если конкретное расширение поддерживает только stdio MCP, используйте `mcp-remote` локально с Bearer header. Не коммитьте API-ключ и не меняйте основной `.vscode/mcp.json` без необходимости.
