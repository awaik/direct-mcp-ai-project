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

## Подключение через API-ключ

Для встроенного MCP в VS Code / Copilot сначала [задайте `LIDFLY_TOKEN`](setup-api-key.md), затем настройте свой `.vscode/mcp.json`:

```json
{
  "servers": {
    "lidfly": {
      "type": "http",
      "url": "https://lidfly.ru/mcp/v3",
      "headers": {
        "Authorization": "Bearer ${env:LIDFLY_TOKEN}"
      }
    }
  }
}
```

Сохраните остальные серверы в файле. Полностью закройте VS Code и запустите `code .` из терминала с заданной переменной. Уже запущенный VS Code может сохранить прежнее окружение. Этот пример относится к встроенному MCP; у отдельных расширений могут быть собственные форматы конфигурации.

Запустите сервер через `MCP: List Servers` и выполните запрос из раздела «Проверка». Для возврата к OAuth удалите только `headers.Authorization` из подключения LidFly, перезапустите сервер и пройдите авторизацию.

Справка: [конфигурация MCP в VS Code](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).

## Legacy Fallback

Если конкретное расширение поддерживает только stdio MCP, используйте `mcp-remote` локально с Bearer header. Не коммитьте API-ключ и не меняйте основной `.vscode/mcp.json` без необходимости.
