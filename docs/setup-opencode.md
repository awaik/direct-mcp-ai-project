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

## Подключение через API-ключ

Если предпочитаете ключ, сначала [задайте `LIDFLY_TOKEN`](setup-api-key.md). В своём `opencode.json` или `opencode.jsonc` настройте блок `mcp.lidfly`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lidfly": {
      "type": "remote",
      "url": "https://lidfly.ru/mcp/v3",
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:LIDFLY_TOKEN}"
      }
    }
  }
}
```

Сохраните остальные настройки файла. `oauth: false` явно выбирает режим API-ключа; `opencode mcp auth lidfly` в этом режиме не требуется. Запустите `opencode` из терминала с заданной переменной, проверьте `opencode mcp list` и выполните запрос из раздела «Проверка».

Для возврата к OAuth удалите `headers.Authorization` и `oauth: false` из подключения LidFly, перезапустите OpenCode и выполните `opencode mcp auth lidfly`.

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
