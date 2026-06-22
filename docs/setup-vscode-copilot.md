# Подключение direct-mcp к VS Code (GitHub Copilot)

## 1. Требования

- VS Code с расширением GitHub Copilot Chat
- Copilot Chat должен поддерживать MCP (доступно в последних версиях)

## 2. Настройка MCP-сервера

В корне проекта уже есть файл `.vscode/mcp.json`:

```json
{
  "servers": {
    "lidfly": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://lidfly.ru/mcp/v3",
        "--header",
        "Authorization: Bearer ${env:LIDFLY_TOKEN}"
      ]
    }
  }
}
```

API-ключ из [личного кабинета direct-mcp](https://lidfly.ru) положите в `tokens.env`:

```bash
cp tokens.env.example tokens.env
# заполните LIDFLY_TOKEN в tokens.env
```

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
3. Перед запуском MCP убедитесь, что VS Code видит переменную `LIDFLY_TOKEN`. Если открываете VS Code из терминала:

```bash
set -a
source tokens.env
set +a
code .
```

4. VS Code прочитает `.vscode/mcp.json` и запустит MCP-сервер

## 5. Проверка подключения

1. Откройте Copilot Chat (Ctrl+Shift+I / Cmd+Shift+I)
2. Переключитесь в режим Agent (иконка `@`)
3. Напишите:

```
покажи мои кампании
```

Copilot должен обнаружить 6 meta-инструментов v3 и через них (`search_tools` → `call_tool`) показать ваши кампании.

## 6. Устранение проблем

| Проблема | Решение |
|----------|---------|
| MCP-сервер не виден | Перезагрузите окно: Ctrl+Shift+P → "Reload Window" |
| `npx` не найден | Установите Node.js и перезапустите VS Code |
| Ошибка авторизации | Проверьте, что `LIDFLY_TOKEN` заполнен и доступен VS Code |
| Copilot не использует MCP | Убедитесь, что используете режим Agent, а не обычный чат |

## 7. Инструкции для агента

Copilot читает `CLAUDE.md` как контекст проекта. Ваши бизнес-настройки — в `PROJECTS.md`.
