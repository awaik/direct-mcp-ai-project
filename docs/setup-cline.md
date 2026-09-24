# Подключение LidFly MCP к Cline

## Настройка

Файл `.cline/mcp_settings.json`:

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

Если ваша версия Cline поддерживает remote MCP OAuth, пройдите вход по email в браузере. Если поддерживается только static headers, используйте Bearer API-key локально и не коммитьте его.

## Проверка

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Для изменений Cline должен показывать план и вызывать `call_write_tool`, а не read-only `call_tool`.
