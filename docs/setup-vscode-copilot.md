# Подключение direct-mcp к VS Code (GitHub Copilot)

## 1. Требования

- VS Code с расширением GitHub Copilot Chat
- Copilot Chat должен поддерживать MCP (доступно в последних версиях)

## 2. Настройка MCP-сервера

В корне проекта уже есть файл `.vscode/mcp.json`:

```json
{
  "servers": {
    "yandex-direct": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://direct-mcp.aatex.ru/mcp",
        "--header",
        "Authorization: Bearer YOUR_API_KEY"
      ]
    }
  }
}
```

Замените `YOUR_API_KEY` на ваш API-ключ из [личного кабинета direct-mcp](https://direct-mcp.aatex.ru).

> **Примечание:** VS Code использует stdio-транспорт через `mcp-remote` в качестве моста к HTTP MCP-серверу. Пакет `mcp-remote` устанавливается автоматически через `npx`.

## 3. Требования к окружению

Убедитесь, что установлен Node.js (v18+):

```bash
node --version
npx --version
```

## 4. Открытие проекта

1. Откройте VS Code
2. File → Open Folder → выберите папку проекта
3. VS Code прочитает `.vscode/mcp.json` и запустит MCP-сервер

## 5. Проверка подключения

1. Откройте Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)
2. Переключитесь в режим Agent (иконка `@`)
3. Напишите:

```
покажи мои кампании
```

Copilot должен обнаружить инструменты MCP-сервера и вызвать `get_campaigns`.

## 6. Устранение проблем

| Проблема | Решение |
|----------|---------|
| MCP-сервер не виден | Перезагрузите окно: Ctrl+Shift+P → "Reload Window" |
| `npx` не найден | Установите Node.js и перезапустите VS Code |
| Ошибка авторизации | Проверьте API-ключ в `.vscode/mcp.json` |
| Copilot не использует MCP | Убедитесь, что используете режим Agent, а не обычный чат |

## 7. Инструкции для агента

Copilot читает `CLAUDE.md` как контекст проекта. Ваши бизнес-настройки — в `PROJECTS.md`.
