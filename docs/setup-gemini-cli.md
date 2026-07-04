# Подключение LidFly MCP к Gemini CLI

## Настройка

Gemini CLI использует `~/.gemini/settings.json`. В проекте лежит пример `.gemini/settings.json`:

```json
{
  "mcpServers": {
    "lidfly": {
      "httpUrl": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

После добавления сервера пройдите OAuth-вход по email, если Gemini CLI запросит авторизацию. API-key header используйте только как legacy fallback.

## Проверка

```bash
gemini
```

В сессии:

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

Gemini читает корневые `AGENTS.md` и `CLAUDE.md`; отдельный входной файл для Gemini в этом шаблоне не нужен.
