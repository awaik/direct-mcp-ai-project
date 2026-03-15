# Подключение direct-mcp к Windsurf

## 1. Настройка MCP-сервера

В корне проекта уже есть файл `.windsurf/mcp.json`:

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

1. Откройте Windsurf
2. File → Open Folder → выберите папку проекта
3. Windsurf автоматически прочитает `.windsurf/mcp.json`

## 3. Проверка подключения

Откройте Cascade (AI-ассистент Windsurf) и напишите:

```
покажи мои кампании
```

Cascade должен обнаружить MCP-сервер и вызвать `get_campaigns`.

## 4. Если MCP не подхватился

1. Перезапустите Windsurf
2. Проверьте, что файл `.windsurf/mcp.json` находится в корне открытого workspace
3. Убедитесь, что API-ключ правильный
4. Проверьте Cascade → Settings → MCP — сервер должен быть виден

## 5. Инструкции для агента

Windsurf читает `CLAUDE.md` из корня проекта. Ваши бизнес-настройки — в `PROJECTS.md`.
