# Подключение direct-mcp к Cline

## 1. Требования

- VS Code с расширением [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)

## 2. Настройка MCP-сервера

В корне проекта уже есть файл `.cline/mcp_settings.json`:

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

## 3. Открытие проекта

1. Откройте VS Code с установленным Cline
2. File → Open Folder → выберите папку проекта
3. Cline автоматически прочитает `.cline/mcp_settings.json`

## 4. Проверка подключения

Откройте панель Cline и напишите:

```
покажи мои кампании
```

Cline должен обнаружить MCP-сервер `yandex-direct` и предложить использовать `get_campaigns`.

## 5. Альтернативный способ — через UI

1. Откройте панель Cline
2. Нажмите на иконку настроек (шестерёнка)
3. Перейдите в раздел MCP Servers
4. Добавьте сервер:
   - Name: `yandex-direct`
   - URL: `https://direct-mcp.aatex.ru/mcp`
   - Headers: `Authorization: Bearer YOUR_API_KEY`

## 6. Инструкции для агента

Cline читает `CLAUDE.md` из корня проекта как системные инструкции. Ваши бизнес-настройки — в `PROJECTS.md`.
