# Подключение LidFly MCP к OpenCode

## OAuth — рекомендуемый способ

Откройте папку проекта в OpenCode. В корне уже есть `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lidfly": {
      "type": "remote",
      "url": "https://lidfly.ru/mcp/v3"
    }
  }
}
```

Если настраиваете другой проект, добавьте блок `mcp.lidfly` в его `opencode.json` или `opencode.jsonc`, сохранив остальные настройки.

В терминале из папки проекта выполните:

```bash
opencode mcp auth lidfly
opencode mcp list
```

Первая команда открывает браузерный вход LidFly по email. Вторая показывает состояние подключения. OpenCode автоматически поддерживает OAuth для remote MCP; отдельное поле `oauth` для этого не требуется.

## Проверка

Запустите `opencode` в папке проекта и напишите:

```text
Покажи мои доступные Пространства и рекламные кабинеты.
```

OpenCode читает `AGENTS.md` и skills из `.agents/skills`. Для provider scope ожидается `get_provider_context`, затем поиск инструментов через `search_tools` и `get_tool_schema`. Read-вызовы идут через `call_tool`, записи — через `call_write_tool`.

## Если подключение не работает

```bash
opencode mcp debug lidfly
```

Если в OAuth-режиме после входа появляются `Authentication failed` и `SSE error: 405`, проверьте блок `mcp.lidfly`. Старый `headers.Authorization` может перекрывать OAuth-токен, а `oauth: false` отключает OAuth. Удалите только эти настройки, если хотите войти через OAuth, затем выполните:

```bash
opencode mcp logout lidfly
opencode mcp auth lidfly
```

Ошибка SSE может быть вторичной: LidFly использует Streamable HTTP, менять транспорт на SSE не нужно.

Source of truth для публичного OAuth-примера — `public/js/guides.js` основного репозитория LidFly. Справка клиента: [OpenCode MCP](https://opencode.ai/docs/mcp-servers/).
