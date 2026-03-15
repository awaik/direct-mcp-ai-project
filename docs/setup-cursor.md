# Подключение direct-mcp к Cursor

## 1. Настройка MCP-сервера

В корне проекта уже есть файл `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "yandex-direct": {
      "url": "https://direct-mcp.aatex.ru/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Замените `YOUR_API_KEY` на ваш API-ключ из [личного кабинета direct-mcp](https://direct-mcp.aatex.ru).

## 2. Открытие проекта

1. Откройте Cursor
2. File → Open Folder → выберите папку проекта
3. Cursor автоматически прочитает `.cursor/mcp.json`

## 3. Проверка подключения

Откройте чат (Cmd+L / Ctrl+L) и напишите:

```
покажи мои кампании
```

Cursor должен обнаружить MCP-сервер `yandex-direct` и вызвать `get_campaigns`.

## 4. Если MCP не подхватился

1. Перезапустите Cursor (Cmd+Shift+P → "Reload Window")
2. Проверьте, что файл `.cursor/mcp.json` находится в корне открытого workspace
3. Убедитесь, что API-ключ правильный

## 5. Альтернативный способ — через настройки

Если `.cursor/mcp.json` не работает, добавьте сервер через настройки Cursor:

1. Cmd+Shift+P → "Cursor Settings"
2. Найдите раздел MCP
3. Добавьте сервер вручную:
   - Name: `yandex-direct`
   - URL: `https://direct-mcp.aatex.ru/mcp`
   - Header: `Authorization: Bearer YOUR_API_KEY`

## 6. Инструкции для агента

Cursor читает файл `CLAUDE.md` из корня проекта как системные инструкции. Там описаны правила работы с API Яндекс Директа — агент будет автоматически следовать им.

Ваши бизнес-настройки (KPI, бюджеты, особенности) — в файле `PROJECTS.md`.
